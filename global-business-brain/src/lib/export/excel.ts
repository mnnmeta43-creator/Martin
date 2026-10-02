/**
 * Eksporti Excel i modelit financiar (server-only; uses exceljs).
 *
 * The workbook mirrors the deterministic finance engine: every number is the engine's value, and
 * wherever the math is local to a row (revenue = units × price, contribution, operating result,
 * net result, net cash flow, running cash balance, totals) the cell holds a REAL Excel formula
 * whose cached result is the engine value. Things that need the engine's timing logic (payment
 * delays → cash in / cash out, cumulative tax, customer ramp) stay as engine values and are
 * labelled as such, so the sheet never pretends Excel recomputed them.
 */
import ExcelJS from 'exceljs';
import type {
  FinancialInputs,
  FxRate,
  MoneyLine,
  ProjectionResult,
  ScenarioId,
  UnitEconomics,
} from '@/lib/domain/types';
import { PHASE_TITLES, SCENARIO_LABELS, STARTUP_CATEGORY_LABELS, TASK_STATUS_LABELS } from '@/lib/domain/taxonomy';
import { currencyMinorUnits } from '@/lib/finance/currency';
import { normalizeSeasonality, STARTUP_CATEGORIES } from '@/lib/finance/engine';
import { formatDate, formatDateTime, formatMoney, formatNumber } from '@/lib/finance/format';
import {
  ASSUMPTIONS_NOT_GUARANTEES_SQ,
  categoryLabelSq,
  cityLabelSq,
  COST_SOURCE_LABELS_SQ,
  DEMO_BANNER_SQ,
  DEMO_WARNING_SQ,
  dependenciesSq,
  engineAmount,
  engineLineAmount,
  EXPORT_CREATOR,
  EXPORT_SCENARIOS,
  indicatorNameSq,
  isDemoProject,
  minCashMonthSq,
  monthNameSq,
  NO_FINANCING_SQ,
  ownerSalaryStatementSq,
  PLAN_DISCLAIMER_SQ,
  sumEnabledLines,
  taxStatementSq,
  type ExportInput,
} from '@/lib/export/common';

export type { ExportInput } from '@/lib/export/common';

/** Sheet names (Excel limit: 31 characters, no []:*?/\). */
export const SHEET_NAMES = {
  summary: 'Përmbledhje',
  assumptions: 'Supozimet',
  startup: 'Kostot e hapjes',
  monthly: 'Kostot mujore',
  projection: {
    baze: 'Parashikimi Bazë',
    konservator: 'Parashikimi Konservator',
    optimist: 'Parashikimi Optimist',
  } satisfies Record<ScenarioId, string>,
  unitEconomics: 'Ekonomia për njësi',
  capital: 'Kapitali',
  plan: 'Plani',
  sources: 'Burimet',
} as const;

/** Header of the projection tables; exported so tests and readers can locate columns by name. */
export const PROJECTION_COLUMNS_SQ = [
  'Muaji',
  'Muaji kalendarik',
  'Klientët',
  'Sasia (njësi)',
  'Çmimi për njësi',
  'Të ardhurat',
  'Kostot variabël',
  'Kontributi',
  'Kostot fikse',
  'Paga e pronarit',
  'Rezultati operativ',
  'Tatimi',
  'Rezultati neto',
  'Hyrjet e parasë',
  'Daljet e parasë',
  'Fluksi neto i parasë',
  'Paraja në fund të muajit',
] as const;

/** Row of the projection header and of the first month (the block above holds the scenario terms). */
export const PROJECTION_HEADER_ROW = 7;
export const PROJECTION_FIRST_DATA_ROW = PROJECTION_HEADER_ROW + 1;

const ENGINE_CASH_NOTE_SQ =
  'Klientët, sasia, kostot fikse, paga e pronarit, tatimi, hyrjet dhe daljet e parasë janë vlera nga motori i aplikacionit (hyrjet/daljet përfshijnë vonesat e arkëtimit dhe të pagesave te furnitorët). Qelizat e tjera janë formula Excel; vlera e ruajtur në to është ajo e motorit.';

const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F2' } };
const DEMO_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE2E2' } };
const TOTAL_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
const DEMO_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFC00000' } };
const LINK_FONT: Partial<ExcelJS.Font> = { color: { argb: 'FF0563C1' }, underline: true };

interface Formats {
  money: string;
  qty: string;
  int: string;
  mult: string;
  pct: string;
}

/** Cross-sheet references the projection sheets need (filled while the earlier sheets are built). */
interface Refs {
  ownCapital: string;
  startupTotal: string;
}

interface Ctx {
  input: ExportInput;
  inputs: FinancialInputs;
  currency: string;
  fmt: Formats;
  money: (value: number) => string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Small cell helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatsFor(currency: string): Formats {
  const digits = currencyMinorUnits(currency);
  const base = digits > 0 ? `#,##0.${'0'.repeat(digits)}` : '#,##0';
  return { money: `${base};[Red]-${base}`, qty: '#,##0.00', int: '0', mult: '0.00', pct: '0.00%' };
}

/** Sheet-qualified absolute reference, quoting names with spaces or non-ASCII letters. */
function sheetRef(sheetName: string, address: string): string {
  return `'${sheetName.replace(/'/g, "''")}'!${address}`;
}

function setNumber(cell: ExcelJS.Cell, value: number | null | undefined, numFmt: string): void {
  if (typeof value === 'number' && Number.isFinite(value)) {
    cell.value = value;
    cell.numFmt = numFmt;
  } else {
    cell.value = '—'; // missing stays visibly missing, never 0
  }
}

function setFormula(cell: ExcelJS.Cell, formula: string, result: number | string, numFmt?: string): void {
  cell.value = { formula, result };
  if (numFmt) cell.numFmt = numFmt;
}

function setLink(cell: ExcelJS.Cell, url: string): void {
  if (/^https?:\/\//i.test(url)) {
    cell.value = { text: url, hyperlink: url };
    cell.font = LINK_FONT;
  } else {
    cell.value = url;
  }
}

function styleHeader(row: ExcelJS.Row, columns: number): void {
  for (let col = 1; col <= columns; col++) {
    const cell = row.getCell(col);
    cell.font = { bold: true };
    cell.fill = HEADER_FILL;
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = { bottom: { style: 'thin' } };
  }
}

function styleTotal(row: ExcelJS.Row, columns: number): void {
  for (let col = 1; col <= columns; col++) {
    const cell = row.getCell(col);
    cell.font = { bold: true };
    cell.fill = TOTAL_FILL;
    cell.border = { top: { style: 'thin' } };
  }
}

function writeHeader(ws: ExcelJS.Worksheet, rowNumber: number, labels: readonly string[]): void {
  const row = ws.getRow(rowNumber);
  labels.forEach((label, i) => {
    row.getCell(i + 1).value = label;
  });
  styleHeader(row, labels.length);
}

function setWidths(ws: ExcelJS.Worksheet, widths: readonly number[]): void {
  widths.forEach((width, i) => {
    ws.getColumn(i + 1).width = width;
  });
}

function freeze(ws: ExcelJS.Worksheet, ySplit: number, xSplit = 0): void {
  ws.views = [{ state: 'frozen', ySplit, xSplit, topLeftCell: ws.getCell(ySplit + 1, xSplit + 1).address }];
}

function addTitle(ws: ExcelJS.Worksheet, text: string): void {
  const cell = ws.getCell('A1');
  cell.value = text;
  cell.font = { bold: true, size: 14 };
}

/**
 * Long text across merged columns. Excel does not auto-fit merged rows, so the height is estimated
 * from the text length and the merged width (≈ 1 character per width unit).
 */
function noteRow(ws: ExcelJS.Worksheet, rowNumber: number, text: string, lastColumn: number, font?: Partial<ExcelJS.Font>): void {
  if (lastColumn > 1) ws.mergeCells(rowNumber, 1, rowNumber, lastColumn);
  const cell = ws.getCell(rowNumber, 1);
  cell.value = text;
  cell.alignment = { wrapText: true, vertical: 'top' };
  if (font) cell.font = font;
  let width = 0;
  for (let col = 1; col <= lastColumn; col++) width += ws.getColumn(col).width ?? 10;
  const lines = text.split('\n').reduce((sum, part) => sum + Math.max(1, Math.ceil((part.length * 1.1) / Math.max(10, width))), 0);
  ws.getRow(rowNumber).height = Math.max(15, lines * 15);
}

/** Writes a label/value row; returns the row number. */
function kvRow(ws: ExcelJS.Worksheet, rowNumber: number, label: string, value: string | number | null, numFmt?: string, note?: string): number {
  ws.getCell(rowNumber, 1).value = label;
  ws.getCell(rowNumber, 1).font = { bold: true };
  const valueCell = ws.getCell(rowNumber, 2);
  if (typeof value === 'number' || value === null) setNumber(valueCell, value, numFmt ?? 'General');
  else valueCell.value = value;
  valueCell.alignment = { wrapText: true, vertical: 'top', horizontal: typeof value === 'number' ? 'right' : 'left' };
  if (note) {
    const noteCell = ws.getCell(rowNumber, 3);
    noteCell.value = note;
    noteCell.alignment = { wrapText: true, vertical: 'top' };
  }
  return rowNumber;
}

function yesNo(value: boolean): string {
  return value ? 'Po' : 'Jo';
}

function sum(values: readonly number[]): number {
  return values.reduce((total, v) => total + v, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Përmbledhje
// ─────────────────────────────────────────────────────────────────────────────

function paybackCellSq(projection: ProjectionResult): string | number {
  if (projection.payback.recoveredInMonth !== null) return projection.payback.recoveredInMonth;
  return projection.capital.startupTotal > 0 ? 'Jo brenda horizontit' : 'Nuk ka investim';
}

function summaryScenarioTable(ws: ExcelJS.Worksheet, start: number, ctx: Ctx): number {
  const { projections } = ctx.input;
  ws.getCell(start, 1).value = 'Shifrat kryesore sipas skenarit (supozime, jo garanci)';
  ws.getCell(start, 1).font = { bold: true, size: 12 };
  writeHeader(ws, start + 1, ['Treguesi', ...EXPORT_SCENARIOS.map((s) => SCENARIO_LABELS[s])]);
  const rows: { label: string; pick: (p: ProjectionResult) => number | string; fmt: string }[] = [
    { label: `Të ardhurat gjithsej (${ctx.inputs.horizonMonths} muaj)`, pick: (p) => p.totals.revenue, fmt: ctx.fmt.money },
    { label: 'Rezultati neto gjithsej', pick: (p) => p.totals.netResult, fmt: ctx.fmt.money },
    { label: 'Investimi fillestar', pick: (p) => p.capital.startupTotal, fmt: ctx.fmt.money },
    { label: 'Kapitali i nevojshëm', pick: (p) => p.capital.totalRequired, fmt: ctx.fmt.money },
    { label: 'Mungesa e kapitalit', pick: (p) => p.capital.gap, fmt: ctx.fmt.money },
    { label: 'Paraja më e ulët', pick: (p) => p.minCashBalance, fmt: ctx.fmt.money },
    { label: 'Muaji me paranë më të ulët', pick: (p) => minCashMonthSq(p.minCashMonth), fmt: 'General' },
    { label: 'Rikuperimi i investimit (muaji, vlerësim)', pick: paybackCellSq, fmt: ctx.fmt.int },
  ];
  let r = start + 2;
  for (const row of rows) {
    ws.getCell(r, 1).value = row.label;
    EXPORT_SCENARIOS.forEach((s, i) => {
      const value = row.pick(projections[s]);
      const cell = ws.getCell(r, i + 2);
      if (typeof value === 'number') setNumber(cell, value, row.fmt);
      else cell.value = value;
    });
    r++;
  }
  return r;
}

function buildSummarySheet(wb: ExcelJS.Workbook, ctx: Ctx): void {
  const { input } = ctx;
  const ws = wb.addWorksheet(SHEET_NAMES.summary);
  setWidths(ws, [44, 26, 26, 26]);
  addTitle(ws, `Modeli financiar — ${input.project.title}`);
  let r = 2;
  if (isDemoProject(input)) {
    noteRow(ws, r, `${DEMO_BANNER_SQ}. ${DEMO_WARNING_SQ}`, 4, DEMO_FONT);
    ws.getCell(r, 1).fill = DEMO_FILL;
    r++;
  }
  r++;
  kvRow(ws, r++, 'Projekti', input.project.title);
  kvRow(ws, r++, 'Biznesi', input.archetype.nameSq);
  kvRow(ws, r++, 'Vendi i operimit', input.countryNameSq);
  kvRow(ws, r++, 'Qyteti', cityLabelSq(input.project.city));
  kvRow(ws, r++, 'Monedha', ctx.currency);
  kvRow(ws, r++, 'Data e analizës', formatDate(input.project.analysisDate));
  kvRow(ws, r++, 'Data e të dhënave të ruajtura', formatDateTime(input.project.dataSnapshot.capturedAt));
  kvRow(ws, r++, 'Data e eksportit', formatDateTime(input.generatedAt));
  kvRow(ws, r++, 'Horizonti i parashikimit (muaj)', ctx.inputs.horizonMonths, ctx.fmt.int);
  kvRow(ws, r++, 'Përfundimi i planit', `${formatNumber(input.progress.completionPct, 0)}% (përfundim i planit, jo probabilitet suksesi)`);
  r = summaryScenarioTable(ws, r + 1, ctx) + 1;

  ws.getCell(r, 1).value = 'Shënime të rëndësishme';
  ws.getCell(r, 1).font = { bold: true, size: 12 };
  r++;
  const notes = [
    ASSUMPTIONS_NOT_GUARANTEES_SQ,
    NO_FINANCING_SQ,
    ownerSalaryStatementSq(ctx.inputs, ctx.money),
    taxStatementSq(ctx.inputs),
    'Qelizat me formula llogariten në Excel; vlerat e ruajtura në to janë ato të motorit të aplikacionit. Vonesat e pagesave, rritja e klientëve dhe tatimi kumulativ vijnë nga motori.',
    PLAN_DISCLAIMER_SQ,
  ];
  for (const note of notes) noteRow(ws, r++, `• ${note}`, 4);

  const warnings = input.projections.baze.warningsSq;
  if (warnings.length > 0) {
    r++;
    ws.getCell(r, 1).value = 'Paralajmërimet e motorit (skenari Bazë)';
    ws.getCell(r, 1).font = { bold: true, size: 12 };
    r++;
    for (const warning of warnings) noteRow(ws, r++, `• ${warning}`, 4);
  }
  freeze(ws, 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Supozimet
// ─────────────────────────────────────────────────────────────────────────────

function seasonalityRows(ws: ExcelJS.Worksheet, start: number, ctx: Ctx): number {
  ws.getCell(start, 1).value = 'Sezonaliteti (koeficientë janar–dhjetor)';
  ws.getCell(start, 1).font = { bold: true, size: 12 };
  writeHeader(ws, start + 1, ['Muaji', ...Array.from({ length: 12 }, (_, i) => monthNameSq(i + 1))]);
  const used = normalizeSeasonality(ctx.inputs.seasonality).values;
  ws.getCell(start + 2, 1).value = 'Koeficientët e futur';
  ws.getCell(start + 3, 1).value = 'Koeficientët e përdorur nga motori (mesatare 1)';
  for (let i = 0; i < 12; i++) {
    setNumber(ws.getCell(start + 2, i + 2), ctx.inputs.seasonality?.[i], ctx.fmt.mult);
    setNumber(ws.getCell(start + 3, i + 2), used[i], ctx.fmt.mult);
  }
  return start + 4;
}

function scenarioParamsRows(ws: ExcelJS.Worksheet, start: number, ctx: Ctx): number {
  ws.getCell(start, 1).value = 'Parametrat e skenarëve (të përdorur nga motori)';
  ws.getCell(start, 1).font = { bold: true, size: 12 };
  writeHeader(ws, start + 1, ['Parametri', ...EXPORT_SCENARIOS.map((s) => SCENARIO_LABELS[s])]);
  const rows: { label: string; pick: (p: ProjectionResult) => number; fmt: string }[] = [
    { label: 'Klientët fillestarë', pick: (p) => p.params.startCustomers, fmt: ctx.fmt.qty },
    { label: 'Klientë të rinj në muaj', pick: (p) => p.params.monthlyNewCustomers, fmt: ctx.fmt.qty },
    { label: 'Largimi mujor i klientëve (%)', pick: (p) => p.params.monthlyChurnPct, fmt: ctx.fmt.mult },
    { label: 'Shumëzuesi i çmimit', pick: (p) => p.params.priceMultiplier, fmt: ctx.fmt.mult },
    { label: 'Shumëzuesi i kostos variabël', pick: (p) => p.params.variableCostMultiplier, fmt: ctx.fmt.mult },
    { label: 'Shumëzuesi i kostove fikse', pick: (p) => p.params.fixedCostMultiplier, fmt: ctx.fmt.mult },
    {
      label: 'Ditët e arkëtimit të përdorura',
      pick: (p) => p.params.collectionDaysOverride ?? ctx.inputs.collectionDays,
      fmt: ctx.fmt.int,
    },
  ];
  let r = start + 2;
  for (const row of rows) {
    ws.getCell(r, 1).value = row.label;
    EXPORT_SCENARIOS.forEach((s, i) => setNumber(ws.getCell(r, i + 2), row.pick(ctx.input.projections[s]), row.fmt));
    r++;
  }
  return r;
}

function notesBlock(ws: ExcelJS.Worksheet, start: number, title: string, notes: readonly string[], lastColumn: number): number {
  if (notes.length === 0) return start;
  ws.getCell(start, 1).value = title;
  ws.getCell(start, 1).font = { bold: true, size: 12 };
  let r = start + 1;
  for (const note of notes) noteRow(ws, r++, `• ${note}`, lastColumn);
  return r + 1;
}

function buildAssumptionsSheet(wb: ExcelJS.Workbook, ctx: Ctx): string {
  const { inputs, fmt } = ctx;
  const base = ctx.input.projections.baze;
  const ws = wb.addWorksheet(SHEET_NAMES.assumptions);
  setWidths(ws, [46, 18, 52, ...Array.from({ length: 10 }, () => 11)]);
  addTitle(ws, 'Supozimet e modelit (vlerat e futura në aplikacion)');
  writeHeader(ws, 3, ['Parametri', 'Vlera', 'Shënim']);
  let r = 4;
  kvRow(ws, r++, 'Monedha', ctx.currency);
  kvRow(ws, r++, 'Njësia e shitjes', inputs.unitLabelSq);
  kvRow(ws, r++, 'Çmimi për njësi', inputs.pricePerUnit, fmt.money, 'Çmimi bazë; çdo skenar e shumëzon me shumëzuesin e çmimit.');
  kvRow(ws, r++, 'Kostoja variabël për njësi', inputs.variableCostPerUnit, fmt.money, 'Çdo skenar e shumëzon me shumëzuesin e kostos variabël.');
  kvRow(ws, r++, 'Njësi për klient në muaj', inputs.unitsPerCustomerPerMonth, fmt.qty);
  kvRow(ws, r++, 'Ditët e arkëtimit nga klientët', inputs.collectionDays, fmt.int, 'Klientët paguajnë kaq ditë pas shitjes (muaj = 30 ditë).');
  kvRow(ws, r++, 'Ditët e pagesës te furnitorët', inputs.supplierPaymentDays, fmt.int, 'Kostot variabël paguhen kaq ditë pas blerjes.');
  kvRow(ws, r++, 'Muajt e rezervës', inputs.reserveMonths, fmt.qty, 'Rezerva = muajt × (kostot fikse mujore + paga e pronarit).');
  kvRow(ws, r++, 'Tatimi mbi fitimin (%)', inputs.profitTaxPct, fmt.mult, taxStatementSq(inputs));
  kvRow(ws, r++, 'Muaji i nisjes', inputs.startMonth, fmt.int, monthNameSq(inputs.startMonth));
  const ownCapitalRow = kvRow(ws, r++, 'Kapitali vetjak', base.capital.ownCapital, fmt.money, 'Paraja që vendos pronari; asnjë kredi apo grant nuk supozohet.');
  kvRow(ws, r++, 'Paga e pronarit përfshihet', yesNo(inputs.includeOwnerSalary), undefined, ownerSalaryStatementSq(inputs, ctx.money));
  kvRow(ws, r++, 'Paga mujore e pronarit', inputs.ownerSalaryMonthly, fmt.money);
  kvRow(ws, r++, 'Horizonti (muaj)', inputs.horizonMonths, fmt.int);
  r = seasonalityRows(ws, r + 1, ctx);
  r = scenarioParamsRows(ws, r + 1, ctx);
  r = notesBlock(ws, r + 1, 'Shënimet e supozimeve', inputs.assumptionsNotesSq, 3);
  notesBlock(ws, r, 'Supozimet e arketipit të biznesit', ctx.input.archetype.assumptionsSq, 3);
  freeze(ws, 3);
  return sheetRef(SHEET_NAMES.assumptions, `$B$${ownCapitalRow}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Kostot e hapjes / Kostot mujore
// ─────────────────────────────────────────────────────────────────────────────

const COST_COLUMNS_SQ = ['Zëri', 'Kategoria', 'Shuma', 'E ulët', 'E lartë', 'Lloji i burimit', 'Shënim / burimi', 'Data', 'Aktiv'];
const COST_FIRST_ROW = 5;

function writeCostLine(ws: ExcelJS.Worksheet, r: number, line: MoneyLine, fmt: Formats): void {
  ws.getCell(r, 1).value = line.labelSq;
  ws.getCell(r, 2).value = categoryLabelSq(line.category);
  setNumber(ws.getCell(r, 3), engineLineAmount(line), fmt.money);
  setNumber(ws.getCell(r, 4), line.low ?? null, fmt.money);
  setNumber(ws.getCell(r, 5), line.high ?? null, fmt.money);
  ws.getCell(r, 6).value = COST_SOURCE_LABELS_SQ[line.sourceKind] ?? line.sourceKind;
  ws.getCell(r, 7).value = line.sourceNoteSq;
  ws.getCell(r, 7).alignment = { wrapText: true, vertical: 'top' };
  ws.getCell(r, 8).value = formatDate(line.date);
  ws.getCell(r, 9).value = yesNo(line.enabled);
}

function costSheetBase(wb: ExcelJS.Workbook, name: string, title: string, currency: string): ExcelJS.Worksheet {
  const ws = wb.addWorksheet(name);
  setWidths(ws, [40, 26, 14, 14, 14, 18, 70, 16, 8]);
  addTitle(ws, title);
  noteRow(
    ws,
    2,
    'Shumat janë supozime ose vlera të futura nga ju (shih «Lloji i burimit»), jo çmime të verifikuara. Totali përfshin vetëm zërat aktivë (kolona «Aktiv» = Po); ndryshoni Po/Jo për të parë efektin.',
    9,
  );
  writeHeader(ws, 4, COST_COLUMNS_SQ.map((label) => (label === 'Shuma' ? `Shuma (${currency})` : label)));
  freeze(ws, 4);
  return ws;
}

/** SUMIF over the "Aktiv" column, or a plain 0 when the range is empty. */
function enabledTotalCell(ws: ExcelJS.Worksheet, r: number, label: string, lastLineRow: number, result: number, fmt: Formats): void {
  ws.getCell(r, 1).value = label;
  const cell = ws.getCell(r, 3);
  if (lastLineRow >= COST_FIRST_ROW) {
    setFormula(cell, `SUMIF(I${COST_FIRST_ROW}:I${lastLineRow},"Po",C${COST_FIRST_ROW}:C${lastLineRow})`, result, fmt.money);
  } else {
    setNumber(cell, 0, fmt.money);
  }
  styleTotal(ws.getRow(r), 9);
}

function buildStartupSheet(wb: ExcelJS.Workbook, ctx: Ctx): string {
  const ws = costSheetBase(wb, SHEET_NAMES.startup, 'Kostot e hapjes (investimi fillestar, i paguar në muajin 0)', ctx.currency);
  const lines = ctx.inputs.startupCosts;
  lines.forEach((line, i) => writeCostLine(ws, COST_FIRST_ROW + i, line, ctx.fmt));
  const lastLineRow = COST_FIRST_ROW + lines.length - 1;
  const totalRow = lastLineRow + 2;
  enabledTotalCell(ws, totalRow, 'Investimi fillestar gjithsej (zërat aktivë)', lastLineRow, ctx.input.projections.baze.capital.startupTotal, ctx.fmt);
  return sheetRef(SHEET_NAMES.startup, `$C$${totalRow}`);
}

function buildMonthlySheet(wb: ExcelJS.Workbook, ctx: Ctx): void {
  const { inputs, fmt } = ctx;
  const ws = costSheetBase(wb, SHEET_NAMES.monthly, 'Kostot fikse mujore', ctx.currency);
  const lines = inputs.monthlyFixedCosts;
  lines.forEach((line, i) => writeCostLine(ws, COST_FIRST_ROW + i, line, fmt));
  const lastFixedRow = COST_FIRST_ROW + lines.length - 1;
  const ownerRow = lastFixedRow + 1;
  writeCostLine(
    ws,
    ownerRow,
    {
      id: 'paga-e-pronarit',
      labelSq: 'Paga e pronarit',
      category: 'paga',
      amount: inputs.ownerSalaryMonthly,
      sourceKind: 'perdoruesi',
      sourceNoteSq: ownerSalaryStatementSq(inputs, ctx.money),
      date: ctx.input.project.updatedAt.slice(0, 10),
      enabled: inputs.includeOwnerSalary,
    },
    fmt,
  );
  ws.getCell(ownerRow, 2).value = 'Paga e pronarit';
  const fixed = sumEnabledLines(lines);
  const owner = inputs.includeOwnerSalary ? engineAmount(inputs.ownerSalaryMonthly) : 0;
  enabledTotalCell(ws, ownerRow + 2, 'Kostot fikse mujore (pa pagën e pronarit)', lastFixedRow, fixed, fmt);
  enabledTotalCell(ws, ownerRow + 3, 'Gjithsej në muaj (me pagën e pronarit kur përfshihet)', ownerRow, fixed + owner, fmt);
  noteRow(
    ws,
    ownerRow + 5,
    'Në parashikim, çdo skenar i shumëzon kostot fikse me shumëzuesin e vet (shih «Supozimet»); paga e pronarit nuk shumëzohet.',
    9,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Parashikimet (një fletë për skenar)
// ─────────────────────────────────────────────────────────────────────────────

function projectionTerms(ws: ExcelJS.Worksheet, projection: ProjectionResult, refs: Refs, fmt: Formats): void {
  const ue = projection.unitEconomics;
  const label = (r: number, text: string) => {
    ws.getCell(r, 1).value = text;
    ws.getCell(r, 1).font = { bold: true };
  };
  label(3, 'Çmimi për njësi në këtë skenar (çmimi bazë × shumëzuesi)');
  setNumber(ws.getCell('E3'), ue.pricePerUnit, fmt.money);
  label(4, 'Kostoja variabël për njësi në këtë skenar');
  setNumber(ws.getCell('E4'), ue.variableCostPerUnit, fmt.money);
  label(5, 'Paraja fillestare = kapitali vetjak − investimi fillestar');
  setFormula(ws.getCell('E5'), `${refs.ownCapital}-${refs.startupTotal}`, projection.capital.ownCapital - projection.capital.startupTotal, fmt.money);
}

function projectionMonthRow(ws: ExcelJS.Worksheet, r: number, projection: ProjectionResult, index: number, fmt: Formats): void {
  const row = projection.rows[index];
  const prevBalance = index === 0 ? '$E$5' : `Q${r - 1}`;
  setNumber(ws.getCell(r, 1), row.month, fmt.int);
  ws.getCell(r, 2).value = monthNameSq(row.calendarMonth);
  setNumber(ws.getCell(r, 3), row.customers, fmt.qty);
  setNumber(ws.getCell(r, 4), row.units, fmt.qty);
  setFormula(ws.getCell(r, 5), '$E$3', projection.unitEconomics.pricePerUnit, fmt.money);
  setFormula(ws.getCell(r, 6), `D${r}*E${r}`, row.revenue, fmt.money);
  setFormula(ws.getCell(r, 7), `D${r}*$E$4`, row.variableCosts, fmt.money);
  setFormula(ws.getCell(r, 8), `F${r}-G${r}`, row.contribution, fmt.money);
  setNumber(ws.getCell(r, 9), row.fixedCosts, fmt.money);
  setNumber(ws.getCell(r, 10), row.ownerSalary, fmt.money);
  setFormula(ws.getCell(r, 11), `H${r}-I${r}-J${r}`, row.operatingResult, fmt.money);
  setNumber(ws.getCell(r, 12), row.tax, fmt.money);
  setFormula(ws.getCell(r, 13), `K${r}-L${r}`, row.netResult, fmt.money);
  setNumber(ws.getCell(r, 14), row.cashIn, fmt.money);
  setNumber(ws.getCell(r, 15), row.cashOut, fmt.money);
  setFormula(ws.getCell(r, 16), `N${r}-O${r}`, row.netCashFlow, fmt.money);
  setFormula(ws.getCell(r, 17), `${prevBalance}+P${r}`, row.cashBalance, fmt.money);
}

function projectionTotals(ws: ExcelJS.Worksheet, r: number, projection: ProjectionResult, fmt: Formats): void {
  const { rows, totals } = projection;
  const first = PROJECTION_FIRST_DATA_ROW;
  const last = first + rows.length - 1;
  ws.getCell(r, 1).value = 'Gjithsej';
  const total = (col: number, letter: string, result: number, numFmt: string) =>
    setFormula(ws.getCell(r, col), `SUM(${letter}${first}:${letter}${last})`, result, numFmt);
  total(4, 'D', sum(rows.map((x) => x.units)), fmt.qty);
  total(6, 'F', totals.revenue, fmt.money);
  total(7, 'G', totals.variableCosts, fmt.money);
  total(8, 'H', sum(rows.map((x) => x.contribution)), fmt.money);
  total(9, 'I', totals.fixedCosts, fmt.money);
  total(10, 'J', totals.ownerSalary, fmt.money);
  total(11, 'K', totals.operatingResult, fmt.money);
  total(12, 'L', totals.tax, fmt.money);
  total(13, 'M', totals.netResult, fmt.money);
  total(14, 'N', sum(rows.map((x) => x.cashIn)), fmt.money);
  total(15, 'O', sum(rows.map((x) => x.cashOut)), fmt.money);
  total(16, 'P', totals.netCashFlow, fmt.money);
  styleTotal(ws.getRow(r), PROJECTION_COLUMNS_SQ.length);
}

function buildProjectionSheet(wb: ExcelJS.Workbook, scenario: ScenarioId, ctx: Ctx, refs: Refs): void {
  const projection = ctx.input.projections[scenario];
  const ws = wb.addWorksheet(SHEET_NAMES.projection[scenario]);
  setWidths(ws, [9, 12, 11, 12, ...Array.from({ length: 13 }, () => 15)]);
  addTitle(ws, `Parashikimi mujor — skenari ${SCENARIO_LABELS[scenario]} (supozime, jo garanci) · ${ctx.currency}`);
  noteRow(ws, 2, ENGINE_CASH_NOTE_SQ, PROJECTION_COLUMNS_SQ.length);
  projectionTerms(ws, projection, refs, ctx.fmt);
  writeHeader(ws, PROJECTION_HEADER_ROW, PROJECTION_COLUMNS_SQ);
  for (const col of [14, 15]) {
    ws.getCell(PROJECTION_HEADER_ROW, col).note =
      'Vlerë nga motori i aplikacionit: përfshin vonesat e arkëtimit nga klientët dhe të pagesave te furnitorët.';
  }
  projection.rows.forEach((_, i) => projectionMonthRow(ws, PROJECTION_FIRST_DATA_ROW + i, projection, i, ctx.fmt));
  let r = PROJECTION_FIRST_DATA_ROW + projection.rows.length;
  if (projection.rows.length > 0) projectionTotals(ws, r++, projection, ctx.fmt);
  r++;
  noteRow(ws, r++, `Rikuperimi: ${projection.payback.statementSq}`, PROJECTION_COLUMNS_SQ.length);
  notesBlock(ws, r + 1, 'Paralajmërime për këtë skenar', projection.warningsSq, PROJECTION_COLUMNS_SQ.length);
  freeze(ws, PROJECTION_HEADER_ROW, 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Ekonomia për njësi
// ─────────────────────────────────────────────────────────────────────────────

function unitEconomicsColumn(ws: ExcelJS.Worksheet, col: number, ue: UnitEconomics, unitsPerCustomer: number, fmt: Formats): void {
  const L = ws.getColumn(col).letter;
  setNumber(ws.getCell(4, col), ue.pricePerUnit, fmt.money);
  setNumber(ws.getCell(5, col), ue.variableCostPerUnit, fmt.money);
  setFormula(ws.getCell(6, col), `${L}4-${L}5`, ue.contributionPerUnit, fmt.money);
  if (ue.contributionMarginPct === null) ws.getCell(7, col).value = '— (çmimi = 0)';
  else setFormula(ws.getCell(7, col), `${L}6/${L}4`, ue.contributionMarginPct / 100, fmt.pct);
  setNumber(ws.getCell(8, col), ue.fixedCostsMonthly, fmt.money);
  setNumber(ws.getCell(9, col), unitsPerCustomer, fmt.qty);
  if (ue.status !== 'ok' || ue.breakEvenUnitsPerMonth === null) {
    ws.getCell(10, col).value = 'Nuk llogaritet: kontributi ≤ 0';
    ws.getCell(11, col).value = 'Nuk llogaritet: kontributi ≤ 0';
    return;
  }
  setFormula(ws.getCell(10, col), `${L}8/${L}6`, ue.breakEvenUnitsPerMonth, fmt.qty);
  if (ue.breakEvenCustomersPerMonth === null) ws.getCell(11, col).value = 'Nuk llogaritet: 0 njësi për klient';
  else setFormula(ws.getCell(11, col), `${L}10/${L}9`, ue.breakEvenCustomersPerMonth, fmt.qty);
}

function buildUnitEconomicsSheet(wb: ExcelJS.Workbook, ctx: Ctx): void {
  const ws = wb.addWorksheet(SHEET_NAMES.unitEconomics);
  setWidths(ws, [52, 24, 24, 24]);
  addTitle(ws, `Ekonomia për njësi (${ctx.inputs.unitLabelSq}) — për çdo skenar`);
  writeHeader(ws, 3, ['Treguesi', ...EXPORT_SCENARIOS.map((s) => SCENARIO_LABELS[s])]);
  const labels = [
    'Çmimi për njësi',
    'Kostoja variabël për njësi',
    'Kontributi për njësi = çmimi − kostoja variabël',
    'Marzhi i kontributit = kontributi ÷ çmimi',
    'Kostot fikse mujore (me pagën e pronarit kur përfshihet)',
    'Njësi për klient në muaj',
    'Pika e barazimit (njësi në muaj) = kostot fikse ÷ kontributi',
    'Pika e barazimit (klientë në muaj) = njësitë ÷ njësi për klient',
  ];
  labels.forEach((label, i) => {
    ws.getCell(4 + i, 1).value = label;
  });
  EXPORT_SCENARIOS.forEach((s, i) =>
    unitEconomicsColumn(ws, i + 2, ctx.input.projections[s].unitEconomics, ctx.inputs.unitsPerCustomerPerMonth, ctx.fmt),
  );
  let r = 13;
  ws.getCell(r, 1).value = 'Shpjegimi';
  ws.getCell(r, 1).font = { bold: true, size: 12 };
  r++;
  for (const s of EXPORT_SCENARIOS) {
    noteRow(ws, r++, `${SCENARIO_LABELS[s]}: ${ctx.input.projections[s].unitEconomics.explanationSq}`, 4);
  }
  freeze(ws, 3, 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Kapitali
// ─────────────────────────────────────────────────────────────────────────────

function capitalColumn(ws: ExcelJS.Worksheet, col: number, projection: ProjectionResult, fmt: Formats): void {
  const L = ws.getColumn(col).letter;
  const { capital } = projection;
  STARTUP_CATEGORIES.forEach((category, i) => setNumber(ws.getCell(4 + i, col), capital.byCategory[category], fmt.money));
  const firstCat = 4;
  const lastCat = 4 + STARTUP_CATEGORIES.length - 1;
  const startupRow = lastCat + 1;
  setFormula(ws.getCell(startupRow, col), `SUM(${L}${firstCat}:${L}${lastCat})`, capital.startupTotal, fmt.money);
  setNumber(ws.getCell(startupRow + 1, col), capital.maxOperatingDeficit, fmt.money);
  setNumber(ws.getCell(startupRow + 2, col), capital.reserve, fmt.money);
  setFormula(
    ws.getCell(startupRow + 3, col),
    `${L}${startupRow}+${L}${startupRow + 1}+${L}${startupRow + 2}`,
    capital.totalRequired,
    fmt.money,
  );
  setNumber(ws.getCell(startupRow + 4, col), capital.ownCapital, fmt.money);
  setFormula(ws.getCell(startupRow + 5, col), `MAX(0,${L}${startupRow + 3}-${L}${startupRow + 4})`, capital.gap, fmt.money);
  setNumber(ws.getCell(startupRow + 6, col), projection.minCashBalance, fmt.money);
  ws.getCell(startupRow + 7, col).value = minCashMonthSq(projection.minCashMonth);
  const payback = paybackCellSq(projection);
  if (typeof payback === 'number') setNumber(ws.getCell(startupRow + 8, col), payback, fmt.int);
  else ws.getCell(startupRow + 8, col).value = payback;
}

function buildCapitalSheet(wb: ExcelJS.Workbook, ctx: Ctx): void {
  const ws = wb.addWorksheet(SHEET_NAMES.capital);
  setWidths(ws, [52, 24, 24, 24]);
  addTitle(ws, 'Kapitali i nevojshëm (supozime, pa kredi apo grante)');
  writeHeader(ws, 3, ['Zëri', ...EXPORT_SCENARIOS.map((s) => SCENARIO_LABELS[s])]);
  const labels = [
    ...STARTUP_CATEGORIES.map((c) => `Investimi fillestar: ${STARTUP_CATEGORY_LABELS[c]}`),
    'Investimi fillestar gjithsej',
    'Deficiti maksimal i parasë nga operimi',
    'Rezerva e sigurisë',
    'Kapitali i nevojshëm = investimi + deficiti + rezerva',
    'Kapitali vetjak',
    'Mungesa e kapitalit = max(0, i nevojshëm − vetjak)',
    'Paraja më e ulët gjatë horizontit',
    'Muaji me paranë më të ulët',
    'Rikuperimi i investimit (muaji, vlerësim)',
  ];
  labels.forEach((label, i) => {
    ws.getCell(4 + i, 1).value = label;
  });
  const boldRows = [4 + STARTUP_CATEGORIES.length, 4 + STARTUP_CATEGORIES.length + 3, 4 + STARTUP_CATEGORIES.length + 5];
  for (const row of boldRows) styleTotal(ws.getRow(row), 4);
  EXPORT_SCENARIOS.forEach((s, i) => capitalColumn(ws, i + 2, ctx.input.projections[s], ctx.fmt));

  let r = 4 + labels.length + 1;
  ws.getCell(r, 1).value = 'Rikuperimi i investimit (nuk është datë e garantuar)';
  ws.getCell(r, 1).font = { bold: true, size: 12 };
  r++;
  for (const s of EXPORT_SCENARIOS) noteRow(ws, r++, `${SCENARIO_LABELS[s]}: ${ctx.input.projections[s].payback.statementSq}`, 4);
  r = notesBlock(ws, r + 1, 'Si llogaritet (skenari Bazë)', ctx.input.projections.baze.capital.explanationSq, 4);
  noteRow(ws, r, NO_FINANCING_SQ, 4, { bold: true });
  freeze(ws, 3, 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Plani
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_COLUMNS_SQ = [
  'Faza',
  'Titulli',
  'Veprimet',
  'Rezultati që duhet prodhuar',
  'Buxheti',
  'Monedha',
  'Baza e buxhetit',
  'Varësitë',
  'Prova e përfundimit',
  'Vazhdo nëse',
  'Ndalo nëse',
  'Përfundimi i fazës (%)',
];
const TASK_COLUMNS_SQ = ['Faza', 'Detyra', 'Përshkrimi', 'Dita e nisjes', 'Kohëzgjatja (ditë)', 'Statusi', 'Prova', 'Përfunduar më', 'Shënime'];

function wrapRow(row: ExcelJS.Row, columns: number): void {
  for (let col = 1; col <= columns; col++) row.getCell(col).alignment = { wrapText: true, vertical: 'top' };
}

function buildPlanSheet(wb: ExcelJS.Workbook, ctx: Ctx): void {
  const { plan, progress, tasks } = ctx.input;
  const ws = wb.addWorksheet(SHEET_NAMES.plan);
  setWidths(ws, [10, 34, 60, 40, 14, 9, 36, 14, 36, 36, 36, 14]);
  addTitle(ws, 'Plani 0–100');
  noteRow(
    ws,
    2,
    `Përfundimi i planit: ${formatNumber(progress.completionPct, 0)}% (${progress.completedTasks} nga ${progress.totalTasks} detyra). ${progress.labelSq}`,
    12,
    { bold: true },
  );
  noteRow(ws, 3, PLAN_DISCLAIMER_SQ, 12);
  writeHeader(ws, 5, PHASE_COLUMNS_SQ);
  let r = 6;
  for (const phase of plan.phases) {
    const row = ws.getRow(r);
    row.getCell(1).value = phase.rangeLabel || PHASE_TITLES[phase.id]?.range || phase.id;
    row.getCell(2).value = phase.titleSq;
    row.getCell(3).value = phase.actionsSq.map((a) => `• ${a}`).join('\n');
    row.getCell(4).value = phase.outputSq;
    setNumber(row.getCell(5), phase.budget.amount, formatsFor(phase.budget.currency).money);
    row.getCell(6).value = phase.budget.currency;
    row.getCell(7).value = phase.budget.basisSq;
    row.getCell(8).value = dependenciesSq(phase.dependencies);
    row.getCell(9).value = phase.proofOfCompletionSq;
    row.getCell(10).value = phase.continueCriterionSq;
    row.getCell(11).value = phase.stopCriterionSq;
    setNumber(row.getCell(12), progress.byPhase[phase.id]?.completionPct ?? null, '0');
    wrapRow(row, PHASE_COLUMNS_SQ.length);
    r++;
  }
  r += 1;
  ws.getCell(r, 1).value = 'Detyrat';
  ws.getCell(r, 1).font = { bold: true, size: 12 };
  writeHeader(ws, r + 1, TASK_COLUMNS_SQ);
  r += 2;
  for (const task of tasks) {
    const row = ws.getRow(r);
    row.getCell(1).value = PHASE_TITLES[task.phaseId]?.range ?? task.phaseId;
    row.getCell(2).value = task.titleSq;
    row.getCell(3).value = task.descriptionSq;
    setNumber(row.getCell(4), task.dayOffset, '0');
    setNumber(row.getCell(5), task.durationDays, '0');
    row.getCell(6).value = TASK_STATUS_LABELS[task.status] ?? task.status;
    row.getCell(7).value = task.proofSq;
    row.getCell(8).value = task.completedAt ? formatDate(task.completedAt) : '—';
    row.getCell(9).value = task.notesSq ?? '';
    wrapRow(row, TASK_COLUMNS_SQ.length);
    r++;
  }
  freeze(ws, 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Burimet
// ─────────────────────────────────────────────────────────────────────────────

const SOURCE_COLUMNS_SQ = [
  'Burimi',
  'Treguesi',
  'Kodi i treguesit',
  'Vendi',
  'Periudha',
  'Vlera',
  'Njësia',
  'URL',
  'Marrë më',
  'Përditësuar nga burimi',
  'Parashikim',
  'Fiktive (demo)',
];

const FX_KIND_LABELS_SQ: Record<FxRate['kind'], string> = {
  reference_ditore: 'Kurs reference ditor',
  mesatare_vjetore: 'Mesatare vjetore',
  manuale: 'I vendosur manualisht',
  demo: 'Fiktiv (demo)',
};

function fxTable(ws: ExcelJS.Worksheet, start: number, rates: readonly FxRate[]): number {
  ws.getCell(start, 1).value = 'Kurset e këmbimit të ruajtura në projekt';
  ws.getCell(start, 1).font = { bold: true, size: 12 };
  if (rates.length === 0) {
    ws.getCell(start + 1, 1).value = 'Nuk ka kurse të ruajtura (projekti nuk ka pasur nevojë për konvertim).';
    return start + 3;
  }
  writeHeader(ws, start + 1, ['Nga', 'Në', 'Kursi (1 nga = x në)', 'Data e kursit', 'Burimi', 'Lloji', 'Marrë më']);
  let r = start + 2;
  for (const rate of rates) {
    ws.getCell(r, 1).value = rate.base;
    ws.getCell(r, 2).value = rate.quote;
    setNumber(ws.getCell(r, 3), rate.rate, '0.000000');
    ws.getCell(r, 4).value = formatDate(rate.rateDate);
    ws.getCell(r, 5).value = rate.sourceId;
    ws.getCell(r, 6).value = FX_KIND_LABELS_SQ[rate.kind] ?? rate.kind;
    ws.getCell(r, 7).value = formatDateTime(rate.retrievedAt);
    r++;
  }
  return r + 1;
}

function buildSourcesSheet(wb: ExcelJS.Workbook, ctx: Ctx): void {
  const { citations, archetype, project } = ctx.input;
  const ws = wb.addWorksheet(SHEET_NAMES.sources);
  setWidths(ws, [32, 40, 22, 9, 14, 16, 22, 60, 22, 18, 11, 12]);
  addTitle(ws, 'Burimet e të dhënave');
  noteRow(
    ws,
    2,
    'Treguesit periodikë janë «Të dhënat më të fundit të disponueshme» për periudhën e treguar, të ruajtura në datën e analizës — jo të dhëna live.',
    SOURCE_COLUMNS_SQ.length,
  );
  writeHeader(ws, 4, SOURCE_COLUMNS_SQ);
  let r = 5;
  if (citations.length === 0) {
    ws.getCell(r++, 1).value = 'Nuk ka tregues të ruajtur me burim për këtë projekt.';
  }
  for (const c of citations) {
    ws.getCell(r, 1).value = c.sourceName;
    ws.getCell(r, 2).value = indicatorNameSq(c.indicatorCode);
    ws.getCell(r, 3).value = c.indicatorCode ?? '—';
    ws.getCell(r, 4).value = c.countryCode ?? '—';
    ws.getCell(r, 5).value = c.period ?? '—';
    if (typeof c.value === 'number' && Number.isFinite(c.value)) setNumber(ws.getCell(r, 6), c.value, 'General');
    else ws.getCell(r, 6).value = 'mungon';
    ws.getCell(r, 7).value = c.unitLabelSq ?? '';
    setLink(ws.getCell(r, 8), c.url);
    ws.getCell(r, 9).value = c.retrievedAt ? formatDateTime(c.retrievedAt) : '—';
    ws.getCell(r, 10).value = c.sourceLastUpdated ? formatDate(c.sourceLastUpdated) : '—';
    ws.getCell(r, 11).value = yesNo(c.isProjection === true);
    ws.getCell(r, 12).value = yesNo(c.isDemo === true);
    r++;
  }
  r = fxTable(ws, r + 1, project.dataSnapshot.fxRates ?? []);
  ws.getCell(r, 1).value = 'Shënim për kostot dhe çmimet';
  ws.getCell(r, 1).font = { bold: true, size: 12 };
  r++;
  noteRow(
    ws,
    r++,
    `Kostot, çmimet dhe vëllimet e shitjeve janë supozime të përgjithshme të bibliotekës (data e supozimeve: ${formatDate(archetype.assumptionsDate)}) ose vlera të futura nga ju; nuk janë çmime të verifikuara. Zëvendësojini me oferta reale sapo t’i keni.`,
    8,
  );
  if (archetype.sourcesNoteSq) noteRow(ws, r++, archetype.sourcesNoteSq, 8);
  freeze(ws, 4);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Builds the financial workbook (.xlsx) for a project; deterministic for a given input. */
export async function buildFinancialWorkbook(input: ExportInput): Promise<Buffer> {
  const inputs = input.project.financialInputs;
  const currency = inputs.currency;
  const ctx: Ctx = {
    input,
    inputs,
    currency,
    fmt: formatsFor(currency),
    money: (value: number) => formatMoney(value, currency),
  };

  const wb = new ExcelJS.Workbook();
  const generated = new Date(input.generatedAt);
  wb.creator = EXPORT_CREATOR;
  wb.lastModifiedBy = EXPORT_CREATOR;
  wb.title = `Modeli financiar — ${input.project.title}`;
  wb.subject = input.archetype.nameSq;
  if (Number.isFinite(generated.getTime())) {
    wb.created = generated;
    wb.modified = generated;
  }

  buildSummarySheet(wb, ctx);
  const ownCapital = buildAssumptionsSheet(wb, ctx);
  const startupTotal = buildStartupSheet(wb, ctx);
  buildMonthlySheet(wb, ctx);
  const refs: Refs = { ownCapital, startupTotal };
  for (const scenario of EXPORT_SCENARIOS) buildProjectionSheet(wb, scenario, ctx, refs);
  buildUnitEconomicsSheet(wb, ctx);
  buildCapitalSheet(wb, ctx);
  buildPlanSheet(wb, ctx);
  buildSourcesSheet(wb, ctx);

  const data = await wb.xlsx.writeBuffer();
  return Buffer.from(data as ArrayBuffer);
}
