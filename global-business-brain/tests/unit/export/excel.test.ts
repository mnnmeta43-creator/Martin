/**
 * Testet e eksportit Excel: fletët, formulat reale me rezultatet e motorit, totalet, burimet,
 * shenja DEMO dhe formatet e numrave.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import type { ScenarioId } from '@/lib/domain/types';
import {
  buildFinancialWorkbook,
  PROJECTION_COLUMNS_SQ,
  PROJECTION_FIRST_DATA_ROW,
  PROJECTION_HEADER_ROW,
  SHEET_NAMES,
  type ExportInput,
} from '@/lib/export/excel';
import { DEMO_BANNER_SQ, EXPORT_CREATOR } from '@/lib/export/common';
import { GENERATED_AT, makeExportInput } from './fixtures';
import { FormulaEvaluator } from './formulaEval';

const SCENARIOS: ScenarioId[] = ['baze', 'konservator', 'optimist'];
const EXPECTED_SHEETS = [
  'Përmbledhje',
  'Supozimet',
  'Kostot e hapjes',
  'Kostot mujore',
  'Parashikimi Bazë',
  'Parashikimi Konservator',
  'Parashikimi Optimist',
  'Ekonomia për njësi',
  'Kapitali',
  'Plani',
  'Burimet',
];

type Formula = { formula: string; result: unknown };

async function load(buffer: Buffer): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ArrayBuffer);
  return wb;
}

function sheet(wb: ExcelJS.Workbook, name: string): ExcelJS.Worksheet {
  const ws = wb.getWorksheet(name);
  if (!ws) throw new Error(`Mungon fleta ${name}`);
  return ws;
}

function formulaOf(cell: ExcelJS.Cell): Formula {
  const value = cell.value as Formula | null;
  expect(value && typeof value === 'object' && 'formula' in value, `${cell.address} duhet të ketë formulë`).toBe(true);
  return value as Formula;
}

/**
 * Cached result of a formula cell. The writer always emits `<v>` (also `<v>0</v>`), but exceljs's
 * reader drops a cached 0 on load, so a missing result can only stand for 0 here.
 */
function resultOf(cell: ExcelJS.Cell): number {
  const { result } = formulaOf(cell);
  return result === undefined ? 0 : Number(result);
}

function allText(wb: ExcelJS.Workbook): string[] {
  const out: string[] = [];
  wb.eachSheet((ws) =>
    ws.eachRow((row) =>
      row.eachCell((cell) => {
        const v = cell.value as unknown;
        if (typeof v === 'string') out.push(v);
        else if (v && typeof v === 'object' && 'text' in (v as object)) out.push(String((v as { text: unknown }).text));
      }),
    ),
  );
  return out;
}

/** Column number of a projection header (1-based). */
function col(name: (typeof PROJECTION_COLUMNS_SQ)[number]): number {
  return PROJECTION_COLUMNS_SQ.indexOf(name) + 1;
}

describe('buildFinancialWorkbook', () => {
  let input: ExportInput;
  let wb: ExcelJS.Workbook;
  let buffer: Buffer;

  beforeAll(async () => {
    input = makeExportInput({ profitTaxPct: 15 });
    buffer = await buildFinancialWorkbook(input);
    wb = await load(buffer);
  });

  it('returns a non-empty xlsx (zip) buffer that exceljs can load back', () => {
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.subarray(0, 2).toString('latin1')).toBe('PK');
    expect(wb.worksheets.length).toBe(EXPECTED_SHEETS.length);
  });

  it('has every sheet with an Albanian name of at most 31 characters, in order', () => {
    expect(wb.worksheets.map((ws) => ws.name)).toEqual(EXPECTED_SHEETS);
    for (const name of EXPECTED_SHEETS) expect(name.length).toBeLessThanOrEqual(31);
    expect(Object.values(SHEET_NAMES.projection)).toEqual(['Parashikimi Bazë', 'Parashikimi Konservator', 'Parashikimi Optimist']);
  });

  it('sets workbook metadata from the input (creator, created = generatedAt)', () => {
    expect(wb.creator).toBe(EXPORT_CREATOR);
    expect(wb.created?.toISOString()).toBe(GENERATED_AT);
  });

  it.each(SCENARIOS)('scenario %s: month rows use real formulas whose cached results equal the engine values', (scenario) => {
    const ws = sheet(wb, SHEET_NAMES.projection[scenario]);
    const projection = input.projections[scenario];
    expect(projection.rows.length).toBe(input.project.financialInputs.horizonMonths);
    projection.rows.forEach((row, i) => {
      const r = PROJECTION_FIRST_DATA_ROW + i;
      const revenueCell = ws.getCell(r, col('Të ardhurat'));
      expect(formulaOf(revenueCell).formula).toMatch(/\*/);
      expect(formulaOf(revenueCell).formula).toBe(`D${r}*E${r}`);
      expect(resultOf(revenueCell)).toBeCloseTo(row.revenue, 2);
      expect(formulaOf(ws.getCell(r, col('Kostot variabël'))).formula).toBe(`D${r}*$E$4`);
      expect(resultOf(ws.getCell(r, col('Kostot variabël')))).toBeCloseTo(row.variableCosts, 2);
      expect(resultOf(ws.getCell(r, col('Kontributi')))).toBeCloseTo(row.contribution, 2);
      expect(formulaOf(ws.getCell(r, col('Rezultati operativ'))).formula).toBe(`H${r}-I${r}-J${r}`);
      expect(resultOf(ws.getCell(r, col('Rezultati operativ')))).toBeCloseTo(row.operatingResult, 2);
      expect(formulaOf(ws.getCell(r, col('Rezultati neto'))).formula).toBe(`K${r}-L${r}`);
      expect(resultOf(ws.getCell(r, col('Rezultati neto')))).toBeCloseTo(row.netResult, 2);
      expect(formulaOf(ws.getCell(r, col('Fluksi neto i parasë'))).formula).toBe(`N${r}-O${r}`);
      expect(resultOf(ws.getCell(r, col('Fluksi neto i parasë')))).toBeCloseTo(row.netCashFlow, 2);
      const balanceCell = ws.getCell(r, col('Paraja në fund të muajit'));
      expect(formulaOf(balanceCell).formula).toBe(i === 0 ? `$E$5+P${r}` : `Q${r - 1}+P${r}`);
      expect(resultOf(balanceCell)).toBeCloseTo(row.cashBalance, 2);
      // Engine-only values are plain numbers.
      expect(ws.getCell(r, col('Hyrjet e parasë')).value).toBeCloseTo(row.cashIn, 6);
      expect(ws.getCell(r, col('Daljet e parasë')).value).toBeCloseTo(row.cashOut, 6);
      expect(ws.getCell(r, col('Tatimi')).value).toBeCloseTo(row.tax, 6);
      expect(ws.getCell(r, col('Sasia (njësi)')).value).toBeCloseTo(row.units, 6);
    });
  });

  it.each(SCENARIOS)('scenario %s: the formulas reproduce the engine from the cached inputs (units × price = revenue)', (scenario) => {
    const ws = sheet(wb, SHEET_NAMES.projection[scenario]);
    const price = Number(ws.getCell('E3').value);
    const variable = Number(ws.getCell('E4').value);
    input.projections[scenario].rows.forEach((row, i) => {
      const r = PROJECTION_FIRST_DATA_ROW + i;
      const units = Number(ws.getCell(r, col('Sasia (njësi)')).value);
      expect(units * price).toBeCloseTo(row.revenue, 2);
      expect(units * variable).toBeCloseTo(row.variableCosts, 2);
    });
  });

  it.each(SCENARIOS)('scenario %s: opening cash references own capital − startup total; totals equal engine totals', (scenario) => {
    const ws = sheet(wb, SHEET_NAMES.projection[scenario]);
    const projection = input.projections[scenario];
    const opening = formulaOf(ws.getCell('E5'));
    expect(opening.formula).toMatch(/^'Supozimet'!\$B\$\d+-'Kostot e hapjes'!\$C\$\d+$/);
    expect(resultOf(ws.getCell('E5'))).toBeCloseTo(projection.capital.ownCapital - projection.capital.startupTotal, 2);

    const totalRow = PROJECTION_FIRST_DATA_ROW + projection.rows.length;
    expect(ws.getCell(totalRow, 1).value).toBe('Gjithsej');
    const checks: [(typeof PROJECTION_COLUMNS_SQ)[number], number][] = [
      ['Të ardhurat', projection.totals.revenue],
      ['Kostot variabël', projection.totals.variableCosts],
      ['Kostot fikse', projection.totals.fixedCosts],
      ['Paga e pronarit', projection.totals.ownerSalary],
      ['Rezultati operativ', projection.totals.operatingResult],
      ['Tatimi', projection.totals.tax],
      ['Rezultati neto', projection.totals.netResult],
      ['Fluksi neto i parasë', projection.totals.netCashFlow],
    ];
    for (const [name, expected] of checks) {
      const cell = ws.getCell(totalRow, col(name));
      expect(formulaOf(cell).formula).toMatch(/^SUM\(/);
      expect(resultOf(cell)).toBeCloseTo(expected, 2);
    }
  });

  it('exercises tax: the 15% scenario has non-zero tax somewhere (so the tax column is meaningful)', () => {
    const anyTax = SCENARIOS.some((s) => input.projections[s].totals.tax > 0);
    expect(anyTax).toBe(true);
  });

  it('freezes the projection header row and the month column, and labels engine-only cash columns', () => {
    const ws = sheet(wb, SHEET_NAMES.projection.baze);
    expect(ws.views[0]).toMatchObject({ state: 'frozen', ySplit: PROJECTION_HEADER_ROW, xSplit: 1 });
    expect(ws.getRow(PROJECTION_HEADER_ROW).getCell(1).font?.bold).toBe(true);
    expect(String(ws.getCell('A2').value)).toMatch(/motori i aplikacionit/);
  });

  it('startup and monthly cost sheets total the enabled lines with formulas equal to the engine', () => {
    const base = input.projections.baze;
    const startup = sheet(wb, SHEET_NAMES.startup);
    const startupTotal = startup.getColumn(3).values.findIndex((v) => v && typeof v === 'object' && 'formula' in (v as object));
    expect(startupTotal).toBeGreaterThan(0);
    const startupCell = formulaOf(startup.getCell(startupTotal, 3));
    expect(startupCell.formula).toMatch(/^SUMIF\(I\d+:I\d+,"Po",C\d+:C\d+\)$/);
    expect(Number(startupCell.result)).toBeCloseTo(base.capital.startupTotal, 2);

    const monthly = sheet(wb, SHEET_NAMES.monthly);
    const formulas = monthly.getColumn(3).values.filter((v) => v && typeof v === 'object' && 'formula' in (v as object)) as Formula[];
    expect(formulas).toHaveLength(2);
    const ownerSalary = base.rows[0].ownerSalary;
    expect(Number(formulas[0].result)).toBeCloseTo(base.rows[0].fixedCosts / base.params.fixedCostMultiplier, 2);
    expect(Number(formulas[1].result)).toBeCloseTo(base.rows[0].fixedCosts / base.params.fixedCostMultiplier + ownerSalary, 2);
    expect(allText(wb)).toContain('Paga e pronarit');
  });

  it('unit economics and capital sheets use formulas with engine results', () => {
    const ue = sheet(wb, SHEET_NAMES.unitEconomics);
    const base = input.projections.baze;
    expect(formulaOf(ue.getCell('B6')).formula).toBe('B4-B5');
    expect(resultOf(ue.getCell('B6'))).toBeCloseTo(base.unitEconomics.contributionPerUnit, 6);
    expect(resultOf(ue.getCell('B10'))).toBeCloseTo(base.unitEconomics.breakEvenUnitsPerMonth ?? NaN, 6);

    const cap = sheet(wb, SHEET_NAMES.capital);
    const labels = cap.getColumn(1).values as unknown[];
    const totalRow = labels.findIndex((v) => typeof v === 'string' && v.startsWith('Kapitali i nevojshëm ='));
    const gapRow = labels.findIndex((v) => typeof v === 'string' && v.startsWith('Mungesa e kapitalit ='));
    expect(resultOf(cap.getCell(totalRow, 2))).toBeCloseTo(base.capital.totalRequired, 2);
    expect(formulaOf(cap.getCell(gapRow, 2)).formula).toMatch(/^MAX\(0,/);
    expect(resultOf(cap.getCell(gapRow, 2))).toBeCloseTo(base.capital.gap, 2);
    expect(allText(wb).some((t) => t.includes('Nuk supozohet asnjë kredi'))).toBe(true);
  });

  it('lists every citation URL (as hyperlinks) in Burimet, plus the cost-assumption note', () => {
    const texts = allText(wb);
    for (const c of input.citations) expect(texts).toContain(c.url);
    expect(texts.some((t) => t.includes('nuk janë çmime të verifikuara'))).toBe(true);
  });

  it('writes the plan phases and task statuses in Albanian', () => {
    const texts = allText(wb);
    for (const phase of input.plan.phases) expect(texts).toContain(phase.titleSq);
    expect(texts).toContain('Përfunduar');
    expect(texts).toContain('Në progres');
    expect(texts).toContain('Anashkaluar');
  });

  it('summary states the disclaimers (assumptions, no loans, owner salary) and has no DEMO marker for real data', () => {
    const texts = allText(wb);
    expect(texts.some((t) => t.includes('jo garanci fitimi'))).toBe(true);
    expect(texts.some((t) => t.includes('Paga e pronarit përfshihet'))).toBe(true);
    expect(texts.some((t) => t.includes('DEMO'))).toBe(false);
  });

  it('every formula, recomputed from the sheet cells alone, reproduces its cached engine value', () => {
    const evaluator = new FormulaEvaluator(wb);
    let checked = 0;
    wb.eachSheet((ws) =>
      ws.eachRow((row) =>
        row.eachCell((cell) => {
          const value = cell.value as unknown;
          if (!value || typeof value !== 'object' || !('formula' in (value as object))) return;
          const expected = resultOf(cell);
          const actual = evaluator.evaluate(ws.name, (value as Formula).formula);
          const tolerance = 1e-6 * Math.max(1, Math.abs(expected));
          expect(Math.abs(actual - expected), `${ws.name}!${cell.address}: ${(value as Formula).formula}`).toBeLessThanOrEqual(tolerance);
          checked++;
        }),
      ),
    );
    expect(checked).toBeGreaterThan(300);
  });

  it('uses 2-decimal money formats for EUR', () => {
    const ws = sheet(wb, SHEET_NAMES.projection.baze);
    expect(ws.getCell(PROJECTION_FIRST_DATA_ROW, col('Të ardhurat')).numFmt).toMatch(/^#,##0\.00/);
  });
});

describe('buildFinancialWorkbook — variants', () => {
  it('shows the DEMO marker for demo projects', async () => {
    const wb = await load(await buildFinancialWorkbook(makeExportInput({ demo: true })));
    const summary = sheet(wb, SHEET_NAMES.summary);
    expect(String(summary.getCell('A2').value)).toContain(DEMO_BANNER_SQ);
    // Demo citations keep their demo URL and flag.
    expect(allText(wb).some((t) => t.startsWith('demo://'))).toBe(true);
  });

  it('uses 0-decimal money formats for JPY (currencyMinorUnits)', async () => {
    const input = makeExportInput({ currency: 'JPY' });
    const wb = await load(await buildFinancialWorkbook(input));
    const ws = sheet(wb, SHEET_NAMES.projection.baze);
    const fmt = ws.getCell(PROJECTION_FIRST_DATA_ROW, col('Të ardhurat')).numFmt;
    expect(fmt).toMatch(/^#,##0;/);
    expect(fmt).not.toContain('.');
  });

  it('explains instead of computing break-even when contribution ≤ 0', async () => {
    const input = makeExportInput({ mutateInputs: (i) => ({ ...i, variableCostPerUnit: i.pricePerUnit * 2 }) });
    const wb = await load(await buildFinancialWorkbook(input));
    const ue = sheet(wb, SHEET_NAMES.unitEconomics);
    expect(String(ue.getCell('B10').value)).toMatch(/Nuk llogaritet/);
    expect(resultOf(ue.getCell('B6'))).toBeLessThan(0);
    expect(allText(wb).some((t) => t.includes(input.projections.baze.unitEconomics.explanationSq))).toBe(true);
  });

  it('states that the owner salary is not included when it is off', async () => {
    const wb = await load(await buildFinancialWorkbook(makeExportInput({ includeOwnerSalary: false })));
    expect(allText(wb).some((t) => t.includes('Paga e pronarit NUK përfshihet'))).toBe(true);
  });
});
