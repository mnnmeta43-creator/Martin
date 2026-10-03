/**
 * Eksporti PDF i planit 0–100 (server-only; uses pdfkit with the built-in Helvetica fonts).
 *
 * The standard PDF fonts use WinAnsi encoding, which covers Albanian ë/ç/Ë/Ç and the common
 * typographic marks (– — “ ” ’ … • €). Anything outside it (−, ≥, →, narrow spaces, foreign
 * letters) is mapped to a readable equivalent by `toWinAnsi` before drawing, because pdfkit
 * would otherwise emit garbage glyphs. No fonts or images are downloaded. Money is shown as
 * "1 234,56 EUR" (ISO code) so no currency symbol can fall outside the encoding.
 */
import PDFDocument from 'pdfkit';
import type { PlanTask, ProjectionResult, TaskStatus } from '@/lib/domain/types';
import { PHASE_TITLES, SCENARIO_LABELS, TASK_STATUS_LABELS } from '@/lib/domain/taxonomy';
import { currencyMinorUnits } from '@/lib/finance/currency';
import { formatDate, formatDateTime, formatNumber, formatPeriod } from '@/lib/finance/format';
import {
  ASSUMPTIONS_NOT_GUARANTEES_SQ,
  breakEvenSq,
  categoryLabelSq,
  citationUnitSq,
  cityLabelSq,
  completionPctSq,
  COST_SOURCE_LABELS_SQ,
  DEMO_BANNER_SQ,
  DEMO_WARNING_SQ,
  dependenciesSq,
  engineInputs,
  engineLineAmount,
  EXPORT_CREATOR,
  EXPORT_SCENARIOS,
  horizonTasks,
  indicatorNameSq,
  isDemoProject,
  minCashMonthSq,
  monthNameSq,
  NO_FINANCING_SQ,
  ownerSalaryStatementSq,
  phaseBudgetTotal,
  PLAN_DISCLAIMER_SQ,
  taxStatementSq,
  type ExportInput,
} from '@/lib/export/common';

export type { ExportInput } from '@/lib/export/common';

export interface PlanPdfOptions {
  /** Deflate page streams (default true). Tests pass false to inspect the text. */
  compress?: boolean;
}

const MARGIN = { top: 50, bottom: 60, left: 50, right: 50 };
const FONT = { regular: 'Helvetica', bold: 'Helvetica-Bold', italic: 'Helvetica-Oblique' } as const;
const COLOR = {
  text: '#111827',
  muted: '#4b5563',
  accent: '#1d4ed8',
  demo: '#b91c1c',
  line: '#d1d5db',
  soft: '#eff6ff',
  track: '#e5e7eb',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// WinAnsi text sanitising
// ─────────────────────────────────────────────────────────────────────────────

/** Characters that WinAnsi places in 0x80–0x9F (beyond Latin-1). */
const WIN_ANSI_EXTRA = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ');

const REPLACEMENTS: Record<string, string> = {
  '−': '-', // minus sign
  '‐': '-',
  '‑': '-',
  '‒': '-',
  '―': '—',
  '≤': '<=',
  '≥': '>=',
  '≠': '!=',
  '≈': '~',
  '→': '->',
  '←': '<-',
  '↔': '<->',
  '⌊': '[',
  '⌋': ']',
  '′': "'",
  '″': '"',
  ' ': ' ', // narrow no-break space (Intl) → no-break space
  ' ': ' ',
  ' ': ' ',
  ' ': ' ',
  ' ': ' ',
  ' ': ' ',
  '​': '',
  '✓': 'x',
  '✔': 'x',
  '☐': '[ ]',
  '☑': '[x]',
};

function isWinAnsiChar(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WIN_ANSI_EXTRA.has(ch);
}

/** Maps text onto the WinAnsi repertoire of the standard PDF fonts (Albanian letters are kept). */
export function toWinAnsi(text: string): string {
  let out = '';
  for (const ch of text) {
    if (ch === '\n') out += ch;
    else if (isWinAnsiChar(ch)) out += ch;
    else if (ch in REPLACEMENTS) out += REPLACEMENTS[ch];
    else if ((ch.codePointAt(0) ?? 0) < 0x20 || ch === '\u007f') out += ch === '\t' ? ' ' : '';
    else {
      // Foreign letters keep their base letter (ș → s, ğ → g) rather than becoming "?".
      const base = ch.normalize('NFD').replace(/[̀-ͯ]/g, '');
      out += base && [...base].every(isWinAnsiChar) ? base : '?';
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout primitives
// ─────────────────────────────────────────────────────────────────────────────

interface Pdf {
  doc: PDFKit.PDFDocument;
  left: number;
  width: number;
}

interface TextStyle {
  font?: string;
  size?: number;
  color?: string;
  indent?: number;
  gapAfter?: number;
}

function bottomLimit(p: Pdf): number {
  return p.doc.page.height - p.doc.page.margins.bottom;
}

/** Usable height of a whole page; blocks taller than this cannot be kept together. */
function pageSpace(p: Pdf): number {
  return bottomLimit(p) - p.doc.page.margins.top;
}

/** Starts a new page when the next block (of known height) would not fit on this one. */
function ensureSpace(p: Pdf, height: number): void {
  if (p.doc.y + height > bottomLimit(p)) p.doc.addPage();
}

function measure(p: Pdf, text: string, width: number, font: string, size: number): number {
  p.doc.font(font).fontSize(size);
  return p.doc.heightOfString(toWinAnsi(text), { width, lineGap: 2 });
}

function para(p: Pdf, text: string, style: TextStyle = {}): void {
  const indent = style.indent ?? 0;
  p.doc
    .font(style.font ?? FONT.regular)
    .fontSize(style.size ?? 10)
    .fillColor(style.color ?? COLOR.text)
    .text(toWinAnsi(text), p.left + indent, p.doc.y, { width: p.width - indent, lineGap: 2 });
  p.doc.y += style.gapAfter ?? 4;
  p.doc.x = p.left;
}

function heading(p: Pdf, text: string, size = 16): void {
  ensureSpace(p, size * 4);
  p.doc.y += 4;
  para(p, text, { font: FONT.bold, size, color: COLOR.accent, gapAfter: 6 });
}

function subheading(p: Pdf, text: string): void {
  ensureSpace(p, 48); // keep a heading together with at least two lines of its content
  p.doc.y += 2;
  para(p, text, { font: FONT.bold, size: 12, gapAfter: 3 });
}

function bullets(p: Pdf, items: readonly string[], size = 10): void {
  const indent = 12;
  for (const item of items) {
    ensureSpace(p, Math.min(measure(p, item, p.width - indent, FONT.regular, size), 120));
    const y = p.doc.y;
    p.doc.font(FONT.regular).fontSize(size).fillColor(COLOR.text).text('•', p.left, y, { width: indent, lineBreak: false });
    p.doc.text(toWinAnsi(item), p.left + indent, y, { width: p.width - indent, lineGap: 2 });
    p.doc.y += 2;
    p.doc.x = p.left;
  }
  p.doc.y += 2;
}

/**
 * Label in a fixed left column, value wrapped in the right column, always kept on one page.
 * Two columns cannot continue across a page break together, so a value taller than a page is
 * written as a heading line plus a normal (flowing) paragraph instead.
 */
function keyValue(p: Pdf, label: string, value: string, labelWidth = 165): void {
  const valueWidth = p.width - labelWidth - 10;
  const height = Math.max(measure(p, label, labelWidth, FONT.bold, 10), measure(p, value, valueWidth, FONT.regular, 10));
  if (height > pageSpace(p) - 10) {
    ensureSpace(p, 40);
    para(p, label, { font: FONT.bold, gapAfter: 2 });
    para(p, value);
    return;
  }
  ensureSpace(p, height);
  const y = p.doc.y;
  p.doc.font(FONT.bold).fontSize(10).fillColor(COLOR.text).text(toWinAnsi(label), p.left, y, { width: labelWidth, lineGap: 2 });
  const afterLabel = p.doc.y;
  p.doc.font(FONT.regular).text(toWinAnsi(value), p.left + labelWidth + 10, y, { width: valueWidth, lineGap: 2 });
  p.doc.y = Math.max(afterLabel, p.doc.y) + 4;
  p.doc.x = p.left;
}

/** Filled box with wrapped text (used for the DEMO banner and the disclaimer). */
function box(p: Pdf, text: string, opts: { fill: string; color: string; font: string; size: number; border?: string }): void {
  const pad = 10;
  const height = measure(p, text, p.width - pad * 2, opts.font, opts.size) + pad * 2;
  ensureSpace(p, height);
  const y = p.doc.y;
  p.doc.save();
  p.doc.rect(p.left, y, p.width, height).fill(opts.fill);
  if (opts.border) p.doc.rect(p.left, y, p.width, height).lineWidth(1).stroke(opts.border);
  p.doc.restore();
  p.doc
    .font(opts.font)
    .fontSize(opts.size)
    .fillColor(opts.color)
    .text(toWinAnsi(text), p.left + pad, y + pad, { width: p.width - pad * 2, lineGap: 2 });
  p.doc.y = y + height + 8;
  p.doc.x = p.left;
}

function progressBar(p: Pdf, pct: number): void {
  ensureSpace(p, 18);
  const y = p.doc.y;
  const clamped = Math.min(100, Math.max(0, Number.isFinite(pct) ? pct : 0));
  p.doc.save();
  p.doc.rect(p.left, y, p.width, 8).fill(COLOR.track);
  if (clamped > 0) p.doc.rect(p.left, y, (p.width * clamped) / 100, 8).fill(COLOR.accent);
  p.doc.restore();
  p.doc.y = y + 14;
}

/**
 * Simple grid with a shaded header row. The header is repeated after a page break, and a row
 * taller than a page is clipped with an ellipsis (otherwise each cell would continue on its own
 * new page and the columns would fall apart).
 */
function table(p: Pdf, widths: readonly number[], header: readonly string[], rows: readonly (readonly string[])[]): void {
  const total = widths.reduce((s, w) => s + w, 0);
  const cols = widths.map((w) => (w * p.width) / total);
  const maxRowHeight = pageSpace(p) / 2;
  const rowHeight = (cells: readonly string[], bold: boolean) =>
    Math.min(maxRowHeight, Math.max(...cells.map((c, i) => measure(p, c, cols[i] - 6, bold ? FONT.bold : FONT.regular, 9))) + 6);
  const drawRow = (cells: readonly string[], bold: boolean, height: number) => {
    const font = bold ? FONT.bold : FONT.regular;
    const y = p.doc.y;
    if (bold) {
      p.doc.save();
      p.doc.rect(p.left, y, p.width, height).fill(COLOR.soft);
      p.doc.restore();
    }
    let x = p.left;
    cells.forEach((cell, i) => {
      p.doc
        .font(font)
        .fontSize(9)
        .fillColor(COLOR.text)
        .text(toWinAnsi(cell), x + 3, y + 3, { width: cols[i] - 6, height: height - 6, ellipsis: true, lineGap: 2 });
      x += cols[i];
    });
    p.doc.save();
    p.doc.moveTo(p.left, y + height).lineTo(p.left + p.width, y + height).lineWidth(0.5).stroke(COLOR.line);
    p.doc.restore();
    p.doc.y = y + height;
    p.doc.x = p.left;
  };
  const headerHeight = rowHeight(header, true);
  // Keep the header together with the first row.
  ensureSpace(p, headerHeight + (rows.length > 0 ? rowHeight(rows[0], false) : 0));
  drawRow(header, true, headerHeight);
  for (const row of rows) {
    const height = rowHeight(row, false);
    if (p.doc.y + height > bottomLimit(p)) {
      p.doc.addPage();
      drawRow(header, true, headerHeight);
    }
    drawRow(row, false, height);
  }
  p.doc.y += 8;
}

function rule(p: Pdf): void {
  ensureSpace(p, 12);
  const y = p.doc.y + 4;
  p.doc.save();
  p.doc.moveTo(p.left, y).lineTo(p.left + p.width, y).lineWidth(0.5).stroke(COLOR.line);
  p.doc.restore();
  p.doc.y = y + 8;
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkboxes for tasks
// ─────────────────────────────────────────────────────────────────────────────

const BOX = 9;
/** Distinct stroke widths for the marks (also lets tests count them in the content stream). */
export const CHECKBOX_STROKES = { border: 0.8, done: 1.4, skipped: 1.2 } as const;

function drawCheckbox(p: Pdf, x: number, y: number, status: TaskStatus): void {
  const { doc } = p;
  doc.save();
  if (status === 'ne_progres') doc.rect(x, y, BOX / 2, BOX).fill(COLOR.accent);
  doc.lineWidth(CHECKBOX_STROKES.border).rect(x, y, BOX, BOX).stroke(COLOR.text);
  if (status === 'perfunduar') {
    doc
      .lineWidth(CHECKBOX_STROKES.done)
      .moveTo(x + 1.8, y + BOX * 0.55)
      .lineTo(x + BOX * 0.42, y + BOX - 1.8)
      .lineTo(x + BOX - 1.5, y + 1.5)
      .stroke(COLOR.accent);
  }
  if (status === 'anashkaluar') {
    doc.lineWidth(CHECKBOX_STROKES.skipped).moveTo(x + 2, y + BOX / 2).lineTo(x + BOX - 2, y + BOX / 2).stroke(COLOR.muted);
  }
  doc.restore();
}

function taskMetaSq(task: PlanTask): string {
  const parts = [
    `Dita ${task.dayOffset + 1}`,
    `${formatNumber(task.durationDays, 0)} ditë`,
    TASK_STATUS_LABELS[task.status] ?? task.status,
    PHASE_TITLES[task.phaseId]?.range ? `faza ${PHASE_TITLES[task.phaseId].range}` : '',
  ].filter(Boolean);
  const proof = task.proofSq ? ` · Prova: ${task.proofSq}` : '';
  return `${parts.join(' · ')}${proof}`;
}

function checkboxItem(p: Pdf, task: PlanTask): void {
  const indent = BOX + 9;
  const width = p.width - indent;
  const meta = taskMetaSq(task);
  const height = measure(p, task.titleSq, width, FONT.bold, 10) + measure(p, meta, width, FONT.regular, 8.5) + 6;
  ensureSpace(p, Math.min(height, 200));
  const y = p.doc.y;
  drawCheckbox(p, p.left, y + 1, task.status);
  p.doc
    .font(FONT.bold)
    .fontSize(10)
    .fillColor(task.status === 'anashkaluar' ? COLOR.muted : COLOR.text)
    .text(toWinAnsi(task.titleSq), p.left + indent, y, { width, lineGap: 2 });
  p.doc.font(FONT.regular).fontSize(8.5).fillColor(COLOR.muted).text(toWinAnsi(meta), p.left + indent, p.doc.y, { width, lineGap: 2 });
  p.doc.y += 6;
  p.doc.x = p.left;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sections
// ─────────────────────────────────────────────────────────────────────────────

interface Section {
  p: Pdf;
  input: ExportInput;
  money: (value: number | null | undefined) => string;
}

function moneyFormatter(currency: string): (value: number | null | undefined) => string {
  const digits = currencyMinorUnits(currency);
  return (value) => {
    const text = formatNumber(value, digits);
    return text === '—' ? text : `${text} ${currency}`;
  };
}

function coverSection({ p, input }: Section): void {
  const { project, archetype, progress } = input;
  p.doc.y = 110;
  para(p, EXPORT_CREATOR, { font: FONT.bold, size: 11, color: COLOR.accent, gapAfter: 10 });
  para(p, project.title, { font: FONT.bold, size: 24, gapAfter: 6 });
  para(p, 'Plani 0–100 dhe modeli financiar', { size: 14, color: COLOR.muted, gapAfter: 22 });
  if (isDemoProject(input)) {
    box(p, `${DEMO_BANNER_SQ}\n${DEMO_WARNING_SQ}`, { fill: COLOR.demo, color: '#ffffff', font: FONT.bold, size: 13 });
    p.doc.y += 6;
  }
  keyValue(p, 'Biznesi', archetype.nameSq);
  keyValue(p, 'Vendi i operimit', input.countryNameSq);
  keyValue(p, 'Qyteti', cityLabelSq(project.city));
  keyValue(p, 'Data e analizës', formatDate(project.analysisDate));
  keyValue(p, 'Të dhënat e ruajtura më', formatDateTime(project.dataSnapshot.capturedAt));
  keyValue(p, 'Gjeneruar më', formatDateTime(input.generatedAt));
  keyValue(p, 'Monedha', project.financialInputs.currency);
  keyValue(p, 'Përfundimi i planit', `${completionPctSq(progress.completionPct)} (${progress.completedTasks} nga ${progress.totalTasks} detyra)`);
  p.doc.y += 14;
  box(p, PLAN_DISCLAIMER_SQ, { fill: COLOR.soft, color: COLOR.text, font: FONT.bold, size: 11, border: COLOR.accent });
}

function keyNumbers({ p, input, money }: Section): void {
  const base = input.projections.baze;
  const inputs = engineInputs(input);
  heading(p, 'Shifrat kryesore — skenari Bazë');
  para(p, `Supozime të motorit financiar, jo garanci. ${ASSUMPTIONS_NOT_GUARANTEES_SQ}`, { font: FONT.italic, size: 9, color: COLOR.muted, gapAfter: 8 });
  keyValue(p, 'Investimi fillestar (supozim)', money(base.capital.startupTotal));
  keyValue(p, 'Kapitali i nevojshëm (supozim)', `${money(base.capital.totalRequired)} = investimi fillestar + deficiti maksimal i parasë nga operimi + rezerva e sigurisë`);
  keyValue(p, 'Kapitali vetjak', money(base.capital.ownCapital));
  keyValue(p, 'Mungesa e kapitalit', money(base.capital.gap));
  keyValue(p, 'Pika e barazimit në muaj (supozim)', breakEvenSq(base.unitEconomics, inputs.unitLabelSq));
  keyValue(p, 'Rikuperimi i investimit (vlerësim, jo datë e garantuar)', base.payback.statementSq);
  keyValue(p, 'Paraja më e ulët (supozim)', `${money(base.minCashBalance)} — ${minCashMonthSq(base.minCashMonth)}`);
  keyValue(p, 'Paga e pronarit', ownerSalaryStatementSq(inputs, (v) => money(v)));
  keyValue(p, 'Tatimi', taxStatementSq(inputs));
  para(p, NO_FINANCING_SQ, { size: 9, color: COLOR.muted, gapAfter: 8 });

  subheading(p, 'Krahasimi i skenarëve (supozime)');
  const pick = (label: string, f: (r: ProjectionResult) => string) => [label, ...EXPORT_SCENARIOS.map((s) => f(input.projections[s]))];
  table(
    p,
    [34, 22, 22, 22],
    ['Treguesi', ...EXPORT_SCENARIOS.map((s) => SCENARIO_LABELS[s])],
    [
      pick(`Të ardhurat gjithsej (${inputs.horizonMonths} muaj)`, (r) => money(r.totals.revenue)),
      pick('Rezultati neto gjithsej', (r) => money(r.totals.netResult)),
      pick('Kapitali i nevojshëm', (r) => money(r.capital.totalRequired)),
      pick('Paraja më e ulët', (r) => money(r.minCashBalance)),
      pick('Rikuperimi (muaji)', (r) => (r.payback.recoveredInMonth === null ? 'jo brenda horizontit' : `muaji ${r.payback.recoveredInMonth}`)),
    ],
  );
  if (base.warningsSq.length > 0) {
    subheading(p, 'Paralajmërime (skenari Bazë)');
    bullets(p, base.warningsSq, 9.5);
  }
}

function summarySection(section: Section): void {
  const { p, input } = section;
  const { archetype } = input;
  p.doc.addPage();
  heading(p, 'Përmbledhje', 20);
  subheading(p, 'Oferta');
  para(p, archetype.offerSq);
  subheading(p, 'Kush paguan');
  para(p, archetype.payingCustomerSq);
  subheading(p, 'Problemi që zgjidh');
  para(p, archetype.problemSq);
  subheading(p, 'Modeli i të ardhurave');
  para(p, archetype.revenueModelSq, { gapAfter: 10 });
  keyNumbers(section);
}

function progressSection({ p, input }: Section): void {
  const { progress, plan } = input;
  heading(p, 'Progresi i planit');
  para(p, `Përfundimi i planit: ${completionPctSq(progress.completionPct)} (${progress.completedTasks} nga ${progress.totalTasks} detyra)`, {
    font: FONT.bold,
  });
  progressBar(p, progress.completionPct);
  para(p, progress.labelSq, { size: 9, color: COLOR.muted, gapAfter: 8 });
  const rows = plan.phases.map((phase) => {
    const stats = progress.byPhase[phase.id];
    return [
      phase.rangeLabel || PHASE_TITLES[phase.id]?.range || phase.id,
      phase.titleSq,
      stats ? completionPctSq(stats.completionPct) : '—',
      stats ? `${stats.done} / ${stats.total}` : '—',
    ];
  });
  table(p, [12, 58, 14, 16], ['Faza', 'Titulli', 'Përfundimi', 'Detyra'], rows);
}

function phasesSection({ p, input }: Section): void {
  const { plan, progress } = input;
  p.doc.addPage();
  heading(p, 'Plani 0–100: dhjetë fazat', 20);
  para(p, plan.noteSq, { size: 9, color: COLOR.muted, gapAfter: 8 });
  plan.phases.forEach((phase, index) => {
    const pct = progress.byPhase[phase.id]?.completionPct;
    const range = phase.rangeLabel || PHASE_TITLES[phase.id]?.range || phase.id;
    if (index > 0) rule(p);
    ensureSpace(p, 90);
    para(p, `${range} · ${phase.titleSq}`, { font: FONT.bold, size: 13, color: COLOR.accent, gapAfter: 2 });
    para(p, `Përfundimi i fazës: ${completionPctSq(pct)}`, { size: 9, color: COLOR.muted, gapAfter: 4 });
    para(p, 'Veprimet', { font: FONT.bold, size: 10, gapAfter: 2 });
    bullets(p, phase.actionsSq, 9.5);
    keyValue(p, 'Rezultati', phase.outputSq);
    keyValue(p, 'Buxheti (supozim)', `${moneyFormatter(phase.budget.currency)(phase.budget.amount)} — ${phase.budget.basisSq}`);
    keyValue(p, 'Varësitë', dependenciesSq(phase.dependencies));
    keyValue(p, 'Prova e përfundimit', phase.proofOfCompletionSq);
    keyValue(p, 'Vazhdo nëse', phase.continueCriterionSq);
    keyValue(p, 'Ndalo nëse', phase.stopCriterionSq);
  });
  const currencies = new Set(plan.phases.map((phase) => phase.budget.currency));
  if (plan.phases.length > 0 && currencies.size === 1) {
    rule(p);
    keyValue(
      p,
      'Buxheti i fazave gjithsej (supozim)',
      `${moneyFormatter(plan.phases[0].budget.currency)(phaseBudgetTotal(plan))} — ndan investimin fillestar të zërave aktivë; fazat me 0 kërkojnë kryesisht kohë.`,
    );
  }
}

// The plan's horizons are cumulative (d30 ⊇ d7); later lists show only tasks not listed above.
const HORIZONS: { key: 'd7' | 'd30' | 'd90'; titleSq: string }[] = [
  { key: 'd7', titleSq: '7 ditët e para' },
  { key: 'd30', titleSq: '30 ditët e para (përveç atyre më sipër)' },
  { key: 'd90', titleSq: '90 ditët e para (përveç atyre më sipër)' },
];

function tasksSection({ p, input }: Section): void {
  p.doc.addPage();
  heading(p, 'Detyrat për 7, 30 dhe 90 ditë', 20);
  para(
    p,
    'Katror bosh = për t’u bërë · katror me shenjë = përfunduar · katror gjysmë i mbushur = në progres · katror me vijë = anashkaluar.',
    { size: 9, color: COLOR.muted, gapAfter: 8 },
  );
  const shown = new Set<string>();
  for (const horizon of HORIZONS) {
    subheading(p, horizon.titleSq);
    const tasks = horizonTasks(input, horizon.key).filter((task) => !shown.has(task.id));
    if (tasks.length === 0) para(p, 'Nuk ka detyra të tjera për këtë periudhë.', { color: COLOR.muted });
    for (const task of tasks) {
      shown.add(task.id);
      checkboxItem(p, task);
    }
    p.doc.y += 6;
  }
}

function assumptionsSection({ p, input, money }: Section): void {
  const inputs = engineInputs(input);
  const { archetype } = input;
  p.doc.addPage();
  heading(p, 'Supozimet', 20);
  para(p, 'Vlerat e futura në modelin financiar. Janë supozime ose vlera tuajat, jo çmime të verifikuara.', { size: 9, color: COLOR.muted, gapAfter: 8 });
  keyValue(p, 'Monedha', inputs.currency);
  keyValue(p, 'Njësia e shitjes', inputs.unitLabelSq);
  keyValue(p, 'Çmimi për njësi', money(inputs.pricePerUnit));
  keyValue(p, 'Kostoja variabël për njësi', money(inputs.variableCostPerUnit));
  keyValue(p, 'Njësi për klient në muaj', formatNumber(inputs.unitsPerCustomerPerMonth));
  keyValue(p, 'Ditët e arkëtimit nga klientët', formatNumber(inputs.collectionDays, 0));
  keyValue(p, 'Ditët e pagesës te furnitorët', formatNumber(inputs.supplierPaymentDays, 0));
  keyValue(p, 'Muajt e rezervës', formatNumber(inputs.reserveMonths));
  keyValue(p, 'Tatimi mbi fitimin', taxStatementSq(inputs));
  keyValue(p, 'Muaji i nisjes', monthNameSq(inputs.startMonth));
  keyValue(p, 'Kapitali vetjak', money(input.projections.baze.capital.ownCapital));
  keyValue(p, 'Paga e pronarit', ownerSalaryStatementSq(inputs, (v) => money(v)));
  keyValue(p, 'Horizonti', `${formatNumber(inputs.horizonMonths, 0)} muaj`);

  subheading(p, 'Parametrat e skenarëve');
  const row = (label: string, f: (r: ProjectionResult) => string) => [label, ...EXPORT_SCENARIOS.map((s) => f(input.projections[s]))];
  table(p, [34, 22, 22, 22], ['Parametri', ...EXPORT_SCENARIOS.map((s) => SCENARIO_LABELS[s])], [
    row('Klientët fillestarë', (r) => formatNumber(r.params.startCustomers)),
    row('Klientë të rinj në muaj', (r) => formatNumber(r.params.monthlyNewCustomers)),
    row('Largimi mujor (%)', (r) => formatNumber(r.params.monthlyChurnPct)),
    row('Shumëzuesi i çmimit', (r) => formatNumber(r.params.priceMultiplier, 2)),
    row('Shumëzuesi i kostos variabël', (r) => formatNumber(r.params.variableCostMultiplier, 2)),
    row('Shumëzuesi i kostove fikse', (r) => formatNumber(r.params.fixedCostMultiplier, 2)),
  ]);

  const lineRows = (lines: typeof inputs.startupCosts) =>
    lines.map((l) => [l.labelSq, categoryLabelSq(l.category), money(engineLineAmount(l)), COST_SOURCE_LABELS_SQ[l.sourceKind] ?? l.sourceKind, l.enabled ? 'Po' : 'Jo']);
  subheading(p, 'Kostot e hapjes');
  table(p, [34, 22, 18, 16, 10], ['Zëri', 'Kategoria', 'Shuma', 'Burimi', 'Aktiv'], lineRows(inputs.startupCosts));
  subheading(p, 'Kostot fikse mujore');
  table(p, [34, 22, 18, 16, 10], ['Zëri', 'Kategoria', 'Shuma', 'Burimi', 'Aktiv'], lineRows(inputs.monthlyFixedCosts));

  if (inputs.assumptionsNotesSq.length > 0) {
    subheading(p, 'Shënimet e supozimeve');
    bullets(p, inputs.assumptionsNotesSq, 9.5);
  }
  if (archetype.assumptionsSq.length > 0) {
    subheading(p, 'Supozimet e idesë së biznesit');
    bullets(p, archetype.assumptionsSq, 9.5);
  }
  const verify = [
    ...archetype.regulationNotesSq,
    ...archetype.licensedProfessionalsSq.map((pro) => `Kërkohet profesionist i licencuar: ${pro}.`),
  ];
  if (verify.length > 0) {
    subheading(p, 'Çfarë kërkon verifikim lokal');
    bullets(p, verify, 9.5);
  }
}

function citationLines(input: ExportInput): { title: string; detail: string }[] {
  return input.citations.map((c) => {
    const unit = citationUnitSq(c);
    const value = typeof c.value === 'number' && Number.isFinite(c.value) ? `${formatNumber(c.value)}${unit ? ` ${unit}` : ''}` : 'mungon';
    const flags = [c.isDemo ? 'DEMO — fiktive' : '', c.isProjection ? 'parashikim, jo matje' : ''].filter(Boolean).join(', ');
    const detail = [
      `Vendi: ${c.countryCode ?? '—'} · Periudha: ${c.period ? formatPeriod(c.period) : '—'} · Vlera: ${value}${flags ? ` (${flags})` : ''}`,
      `URL: ${c.url}`,
      `Marrë më: ${c.retrievedAt ? formatDateTime(c.retrievedAt) : '—'}${c.sourceLastUpdated ? ` · Përditësuar nga burimi: ${formatDate(c.sourceLastUpdated)}` : ''}`,
    ].join('\n');
    return { title: `${c.sourceName} — ${indicatorNameSq(c.indicatorCode)}`, detail };
  });
}

function sourcesSection({ p, input }: Section): void {
  const { archetype, project } = input;
  p.doc.addPage();
  heading(p, 'Burimet', 20);
  para(
    p,
    'Treguesit periodikë janë «Të dhënat më të fundit të disponueshme» për periudhën e treguar, të ruajtura në datën e analizës — jo të dhëna live.',
    { size: 9, color: COLOR.muted, gapAfter: 8 },
  );
  const lines = citationLines(input);
  if (lines.length === 0) para(p, 'Nuk ka tregues të ruajtur me burim për këtë projekt.', { color: COLOR.muted });
  for (const line of lines) {
    ensureSpace(p, measure(p, line.title, p.width, FONT.bold, 10) + measure(p, line.detail, p.width, FONT.regular, 8.5) + 6);
    para(p, line.title, { font: FONT.bold, size: 10, gapAfter: 1 });
    para(p, line.detail, { size: 8.5, color: COLOR.muted, gapAfter: 6 });
  }
  const rates = project.dataSnapshot.fxRates ?? [];
  if (rates.length > 0) {
    subheading(p, 'Kurset e këmbimit të ruajtura');
    bullets(
      p,
      rates.map((r) => `1 ${r.base} = ${formatNumber(r.rate, 6)} ${r.quote} · data ${formatDate(r.rateDate)} · burimi ${r.sourceId}${r.kind === 'demo' ? ' (DEMO)' : ''} · marrë më ${formatDateTime(r.retrievedAt)}`),
      8.5,
    );
  }
  subheading(p, 'Kostot dhe çmimet');
  para(
    p,
    `Kostot, çmimet dhe vëllimet e shitjeve janë supozime të përgjithshme të bibliotekës (data e supozimeve: ${formatDate(archetype.assumptionsDate)}) ose vlera të futura nga ju; nuk janë çmime të verifikuara. Zëvendësojini me oferta reale sapo t’i keni.`,
  );
  if (archetype.sourcesNoteSq) para(p, archetype.sourcesNoteSq, { size: 9, color: COLOR.muted });
}

/** "Faqja X nga Y" on every buffered page, drawn inside the bottom margin. */
function addFooters(p: Pdf, demo: boolean): void {
  const { doc } = p;
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const savedBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0; // otherwise writing below the margin would open a new page
    const y = doc.page.height - 38;
    doc.font(FONT.regular).fontSize(8).fillColor(COLOR.muted);
    doc.text(toWinAnsi(EXPORT_CREATOR), p.left, y, { width: p.width / 3, lineBreak: false });
    doc.text(toWinAnsi(`Faqja ${i - range.start + 1} nga ${range.count}`), p.left + p.width / 3, y, {
      width: p.width / 3,
      align: 'center',
      lineBreak: false,
    });
    if (demo) {
      doc.font(FONT.bold).fillColor(COLOR.demo).text('DEMO', p.left + (2 * p.width) / 3, y, { width: p.width / 3, align: 'right', lineBreak: false });
    }
    doc.page.margins.bottom = savedBottom;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Builds the A4 plan PDF (cover, summary, key numbers, phases, 7/30/90-day tasks, assumptions, sources). */
export function buildPlanPdf(input: ExportInput, opts: PlanPdfOptions = {}): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const generated = new Date(input.generatedAt);
    const created = Number.isFinite(generated.getTime()) ? generated : undefined;
    const doc = new PDFDocument({
      size: 'A4',
      margins: MARGIN,
      bufferPages: true,
      compress: opts.compress ?? true,
      info: {
        Title: toWinAnsi(`Plani — ${input.project.title}`),
        Author: EXPORT_CREATOR,
        Creator: EXPORT_CREATOR,
        Producer: EXPORT_CREATOR,
        Subject: toWinAnsi(input.archetype.nameSq),
        ...(created ? { CreationDate: created, ModDate: created } : {}),
      },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const p: Pdf = { doc, left: MARGIN.left, width: doc.page.width - MARGIN.left - MARGIN.right };
    const section: Section = { p, input, money: moneyFormatter(input.project.financialInputs.currency) };
    try {
      coverSection(section);
      summarySection(section);
      progressSection(section);
      phasesSection(section);
      tasksSection(section);
      assumptionsSection(section);
      sourcesSection(section);
      addFooters(p, isDemoProject(input));
      doc.end();
    } catch (error) {
      reject(error); // a later 'end' cannot resolve an already rejected promise
    }
  });
}
