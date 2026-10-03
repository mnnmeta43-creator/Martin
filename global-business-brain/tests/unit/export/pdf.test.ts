/**
 * Testet e eksportit PDF: struktura, faqet, tekstet kryesore shqip (me ë/ç), banderola DEMO,
 * fundfaqja "Faqja X nga Y" dhe pastrimi i tekstit për kodimin WinAnsi.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import type { PlanTask, TaskStatus } from '@/lib/domain/types';
import { TASK_STATUS_LABELS } from '@/lib/domain/taxonomy';
import { buildPlanPdf, CHECKBOX_STROKES, toWinAnsi, type ExportInput } from '@/lib/export/pdf';
import { breakEvenSq, DEMO_BANNER_SQ, dependenciesSq, minCashMonthSq, PLAN_DISCLAIMER_SQ } from '@/lib/export/common';
import { formatDateTime, formatNumber } from '@/lib/finance/format';
import { makeExportInput } from './fixtures';
import { countPdfPages, extractPdfLines, extractPdfText } from './pdfText';

function normalize(text: string): string {
  return toWinAnsi(text).replace(/\s+/g, ' ');
}

/** Whitespace-free form: line wrapping may break after "/" or "-", which adds a space when lines are joined. */
function compact(text: string): string {
  return toWinAnsi(text).replace(/\s+/g, '');
}

function money(value: number, currency = 'EUR'): string {
  return `${formatNumber(value, 2)} ${currency}`;
}

function count(source: string, pattern: RegExp): number {
  return (source.match(pattern) ?? []).length;
}

/** Tasks shown in the 7/30/90-day lists (cumulative horizons, each task once) with current statuses. */
function listedTasks(input: ExportInput): PlanTask[] {
  const byId = new Map(input.tasks.map((t) => [t.id, t]));
  const ids = new Set([...input.plan.horizons.d7, ...input.plan.horizons.d30, ...input.plan.horizons.d90]);
  return [...ids].map((id) => byId.get(id)).filter((t): t is PlanTask => Boolean(t));
}

describe('buildPlanPdf', () => {
  let input: ExportInput;
  let pdf: Buffer;
  let text: string;
  let pages: number;

  beforeAll(async () => {
    input = makeExportInput();
    pdf = await buildPlanPdf(input, { compress: false });
    text = extractPdfText(pdf);
    pages = countPdfPages(pdf);
  });

  it('produces a PDF with at least 4 A4 pages', () => {
    expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(pdf.subarray(-6).toString('latin1')).toContain('%%EOF');
    expect(pages).toBeGreaterThanOrEqual(4);
    expect(pdf.toString('latin1')).toMatch(/\/MediaBox \[0 0 595\.28 841\.89\]/);
  });

  it('puts "Faqja X nga Y" on every page', () => {
    const lines = extractPdfLines(pdf);
    expect(lines).toContain(`Faqja 1 nga ${pages}`);
    expect(lines).toContain(`Faqja ${pages} nga ${pages}`);
    expect(lines.filter((l) => /^Faqja \d+ nga \d+$/.test(l))).toHaveLength(pages);
  });

  it('contains the cover, summary and section headings in Albanian with ë and ç intact', () => {
    for (const expected of [
      input.project.title,
      input.archetype.nameSq,
      'Plani 0–100 dhe modeli financiar',
      'Përmbledhje',
      'Shifrat kryesore — skenari Bazë',
      'Progresi i planit',
      'Plani 0–100: dhjetë fazat',
      'Detyrat për 7, 30 dhe 90 ditë',
      'Supozimet',
      'Burimet',
      'Çfarë kërkon verifikim lokal',
      'Kush paguan',
    ]) {
      expect(text, expected).toContain(normalize(expected));
    }
  });

  it('includes the exact disclaimer on the cover', () => {
    expect(text).toContain(normalize(PLAN_DISCLAIMER_SQ));
  });

  it('shows the offer, paying customer and problem of the business', () => {
    expect(text).toContain(normalize(input.archetype.offerSq));
    expect(text).toContain(normalize(input.archetype.payingCustomerSq));
    expect(text).toContain(normalize(input.archetype.problemSq));
  });

  it('lists the base-scenario key numbers as assumptions, with the engine values', () => {
    const base = input.projections.baze;
    const inputs = input.project.financialInputs;
    const flat = compact(text);
    expect(text).toContain('Investimi fillestar (supozim)');
    expect(text).toContain(normalize(money(base.capital.startupTotal)));
    expect(text).toContain('Kapitali i nevojshëm (supozim)');
    expect(text).toContain(normalize(money(base.capital.totalRequired)));
    expect(flat).toContain(compact('Pika e barazimit në muaj (supozim)'));
    expect(flat).toContain(compact(breakEvenSq(base.unitEconomics, inputs.unitLabelSq)));
    expect(flat).toContain(compact('Rikuperimi i investimit (vlerësim, jo datë e garantuar)'));
    expect(flat).toContain(compact(base.payback.statementSq));
    expect(text).toContain('Gjendja më e ulët e parasë (supozim)');
    expect(flat).toContain(compact(`${money(base.minCashBalance)} — ${minCashMonthSq(base.minCashMonth)}`));
    expect(flat).toContain(compact('Paga e pronarit përfshihet në kosto'));
    expect(flat).toContain(compact('Nuk supozohet asnjë kredi, grant apo financim tjetër'));
  });

  it('renders all 10 phases with actions, output, budget, dependencies, proof and continue/stop criteria', () => {
    const flat = compact(text);
    expect(input.plan.phases).toHaveLength(10);
    for (const phase of input.plan.phases) {
      expect(text).toContain(normalize(`${phase.rangeLabel} · ${phase.titleSq}`));
      for (const action of phase.actionsSq) expect(flat, action).toContain(compact(action));
      expect(flat).toContain(compact(`Rezultati ${phase.outputSq}`));
      expect(flat).toContain(compact(`Buxheti (supozim) ${money(phase.budget.amount, phase.budget.currency)} — ${phase.budget.basisSq}`));
      expect(flat).toContain(compact(`Varësitë ${dependenciesSq(phase.dependencies)}`));
      expect(flat).toContain(compact(`Prova e përfundimit ${phase.proofOfCompletionSq}`));
      expect(flat).toContain(compact(`Vazhdo nëse ${phase.continueCriterionSq}`));
      expect(flat).toContain(compact(`Ndalo nëse ${phase.stopCriterionSq}`));
    }
    const budgetTotal = input.plan.phases.reduce((s, phase) => s + phase.budget.amount, 0);
    expect(budgetTotal).toBeCloseTo(input.projections.baze.capital.startupTotal, 6);
    expect(flat).toContain(compact(`Buxheti i fazave gjithsej (supozim) ${money(budgetTotal)}`));
  });

  it('uses only the standard Helvetica fonts with WinAnsi encoding (nothing embedded or downloaded)', () => {
    const raw = pdf.toString('latin1');
    const fonts = new Set([...raw.matchAll(/\/BaseFont \/([\w-]+)/g)].map((m) => m[1]));
    expect([...fonts].sort()).toEqual(['Helvetica', 'Helvetica-Bold', 'Helvetica-Oblique']);
    expect(raw).not.toMatch(/\/FontFile/);
    expect(count(raw, /\/Encoding \/WinAnsiEncoding/g)).toBe(fonts.size);
  });

  it('lists the 7/30/90-day tasks with their current status', () => {
    expect(text).toContain('7 ditët e para');
    expect(text).toContain('30 ditët e para');
    expect(text).toContain('90 ditët e para');
    const first = input.tasks[0];
    expect(text).toContain(normalize(first.titleSq));
    expect(text).toContain('Përfunduar');
    expect(text).toContain('Në progres');
    // Cumulative horizons are de-duplicated: each task appears once.
    const occurrences = text.split(normalize(first.titleSq)).length - 1;
    expect(occurrences).toBe(1);
  });

  it('reports plan completion as completion, not probability', () => {
    expect(text).toContain(`Përfundimi i planit: ${Math.floor(input.progress.completionPct)}%`);
    expect(text).toContain('jo probabilitetin e suksesit');
  });

  it('lists every citation URL with its retrieval date', () => {
    const flat = compact(text);
    for (const c of input.citations) {
      expect(flat).toContain(compact(`URL: ${c.url}`));
      expect(flat).toContain(compact(`Marrë më: ${formatDateTime(c.retrievedAt)}`));
    }
    expect(text).toContain('nuk janë çmime të verifikuara');
  });

  it('has no DEMO banner for a real-data project', () => {
    expect(text).not.toContain(normalize(DEMO_BANNER_SQ));
    expect(text).not.toContain('DEMO');
  });

  it('compresses by default and is still a valid, smaller PDF', async () => {
    const compressed = await buildPlanPdf(input);
    expect(compressed.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(compressed.length).toBeLessThan(pdf.length);
    expect(countPdfPages(compressed)).toBe(pages);
  });

  it('is deterministic for the same input (dates come from the input, not the clock)', async () => {
    const again = await buildPlanPdf(input, { compress: false });
    expect(extractPdfText(again)).toBe(text);
  });
});

describe('buildPlanPdf — task checkboxes', () => {
  it.each<[string, TaskStatus[]]>([
    ['mixed statuses', ['perfunduar', 'ne_progres', 'anashkaluar', 'perfunduar']],
    ['everything done', Array.from({ length: 60 }, () => 'perfunduar' as const)],
    ['nothing started', []],
  ])('draws one square per listed task and marks that match the statuses (%s)', async (_, statuses) => {
    const input = makeExportInput({ statuses });
    const raw = (await buildPlanPdf(input, { compress: false })).toString('latin1');
    const listed = listedTasks(input);
    const withStatus = (status: TaskStatus) => listed.filter((t) => t.status === status).length;
    expect(listed.length).toBeGreaterThan(0);
    // pdfkit writes rectangles as "x y w h re" and line widths as "<w> w".
    expect(count(raw, /\s9 9 re\n/g)).toBe(listed.length);
    expect(count(raw, new RegExp(`^${CHECKBOX_STROKES.done} w$`, 'gm'))).toBe(withStatus('perfunduar'));
    expect(count(raw, /\s4\.5 9 re\n/g)).toBe(withStatus('ne_progres'));
    expect(count(raw, new RegExp(`^${CHECKBOX_STROKES.skipped} w$`, 'gm'))).toBe(withStatus('anashkaluar'));
  });

  it('writes each listed task with its status label next to its square', async () => {
    const input = makeExportInput({ statuses: ['perfunduar', 'ne_progres', 'anashkaluar'] });
    const flat = compact(extractPdfText(await buildPlanPdf(input, { compress: false })));
    for (const task of listedTasks(input)) {
      const status = TASK_STATUS_LABELS[task.status];
      expect(flat).toContain(compact(`${task.titleSq} Dita ${task.dayOffset + 1} · ${formatNumber(task.durationDays, 0)} ditë · ${status}`));
    }
  });
});

describe('buildPlanPdf — variants', () => {
  it('states that the owner salary is not included when it is off', async () => {
    const text = compact(extractPdfText(await buildPlanPdf(makeExportInput({ includeOwnerSalary: false }), { compress: false })));
    expect(text).toContain(compact('Paga e pronarit NUK përfshihet në kosto'));
    expect(text).not.toContain(compact('Paga e pronarit përfshihet në kosto'));
  });

  it('renders Ë, ë, Ç and ç from user text as WinAnsi letters, not replacement marks', async () => {
    const base = makeExportInput();
    const title = 'ËNDËRR e çelët: Çajtore në qytet';
    const input: ExportInput = { ...base, project: { ...base.project, title } };
    const pdf = await buildPlanPdf(input, { compress: false });
    expect(extractPdfLines(pdf)).toContain(title);
    // WinAnsi bytes inside the text-showing (TJ) operators: Ë = CB, ë = EB, Ç = C7, ç = E7.
    const bytes = new Set<number>();
    for (const tj of pdf.toString('latin1').matchAll(/\[([^\]]*)\]\s*TJ/g)) {
      for (const hex of tj[1].matchAll(/<([0-9a-fA-F]*)>/g)) {
        for (let i = 0; i + 1 < hex[1].length; i += 2) bytes.add(parseInt(hex[1].slice(i, i + 2), 16));
      }
    }
    for (const byte of [0xcb, 0xeb, 0xc7, 0xe7]) expect(bytes.has(byte), byte.toString(16)).toBe(true);
  });
});

describe('buildPlanPdf — demo project', () => {
  it('shows the prominent DEMO banner and a DEMO footer mark', async () => {
    const input = makeExportInput({ demo: true });
    const pdf = await buildPlanPdf(input, { compress: false });
    const text = extractPdfText(pdf);
    expect(text).toContain(normalize(DEMO_BANNER_SQ));
    const lines = extractPdfLines(pdf);
    expect(lines.filter((l) => l === 'DEMO')).toHaveLength(countPdfPages(pdf));
  });
});

describe('buildPlanPdf — long text and edge cases', () => {
  it('wraps very long text across pages without losing the footer', async () => {
    const base = makeExportInput();
    const longOffer = Array.from({ length: 3000 }, (_, i) => `fjalë${i}`).join(' ');
    const input: ExportInput = { ...base, archetype: { ...base.archetype, offerSq: longOffer } };
    const pdf = await buildPlanPdf(input, { compress: false });
    const pages = countPdfPages(pdf);
    expect(pages).toBeGreaterThan(countPdfPages(await buildPlanPdf(base, { compress: false })));
    expect(extractPdfLines(pdf)).toContain(`Faqja ${pages} nga ${pages}`);
    expect(extractPdfText(pdf)).toContain('fjalë2999');
  });

  it('keeps over-long values, table cells and unbroken URLs inside the pages', async () => {
    const base = makeExportInput();
    const longOutput = Array.from({ length: 1500 }, (_, i) => `rezultat${i}`).join(' ');
    const longLabel = 'Zë kostoje shumë i gjatë '.repeat(300);
    const longUrl = `https://example.invalid/${'x'.repeat(700)}`;
    const inputs = base.project.financialInputs;
    const input: ExportInput = {
      ...base,
      project: {
        ...base.project,
        financialInputs: { ...inputs, startupCosts: inputs.startupCosts.map((l, i) => (i === 0 ? { ...l, labelSq: longLabel } : l)) },
      },
      plan: { ...base.plan, phases: base.plan.phases.map((ph, i) => (i === 0 ? { ...ph, outputSq: longOutput } : ph)) },
      citations: [{ ...base.citations[0], url: longUrl }],
    };
    const pdf = await buildPlanPdf(input, { compress: false });
    const pages = countPdfPages(pdf);
    const lines = extractPdfLines(pdf);
    expect(lines.filter((l) => /^Faqja \d+ nga \d+$/.test(l))).toHaveLength(pages);
    const flat = compact(extractPdfText(pdf));
    expect(flat).toContain('rezultat0rezultat1');
    expect(flat).toContain('rezultat1499');
    expect(flat).toContain(compact(`URL: ${longUrl}`));
    // The over-long table cell is clipped with an ellipsis instead of spilling over several pages.
    expect(lines.some((l) => l.endsWith('…'))).toBe(true);
    expect(flat).toContain(compact('Kostot fikse mujore'));
    expect(pages).toBeLessThan(countPdfPages(await buildPlanPdf(base, { compress: false })) + 6);
  });

  it('repeats the table header when a long table continues on the next page', async () => {
    const base = makeExportInput();
    const inputs = base.project.financialInputs;
    const many = Array.from({ length: 90 }, (_, i) => ({ ...inputs.startupCosts[0], id: `ze-${i}`, labelSq: `Zë testues ${i}` }));
    const input: ExportInput = { ...base, project: { ...base.project, financialInputs: { ...inputs, startupCosts: many } } };
    const lines = extractPdfLines(await buildPlanPdf(input, { compress: false }));
    // One header for the monthly-costs table, at least two for the 90-line startup table.
    expect(lines.filter((l) => l === 'Zëri').length).toBeGreaterThanOrEqual(3);
    expect(lines).toContain('Zë testues 0');
    expect(lines).toContain('Zë testues 89');
  });

  it('handles a project with no citations and no tasks in a horizon', async () => {
    const base = makeExportInput();
    const input: ExportInput = { ...base, citations: [], plan: { ...base.plan, horizons: { d7: [], d30: [], d90: [] } } };
    const text = extractPdfText(await buildPlanPdf(input, { compress: false }));
    expect(text).toContain('Nuk ka tregues të ruajtur me burim për këtë projekt.');
    expect(text).toContain('Nuk ka detyra të tjera për këtë periudhë.');
  });
});

describe('toWinAnsi', () => {
  it('keeps Albanian letters and WinAnsi punctuation', () => {
    expect(toWinAnsi('Ëndërr çështje Ç ë – — “x” ’ … • €')).toBe('Ëndërr çështje Ç ë – — “x” ’ … • €');
  });

  it('maps characters outside WinAnsi to readable equivalents', () => {
    expect(toWinAnsi('a − b ≥ c → d ≈ e')).toBe('a - b >= c -> d ~ e');
    expect(toWinAnsi('1 234')).toBe('1 234');
    expect(toWinAnsi('ș ğ ő')).toBe('s g o');
    expect(toWinAnsi('漢')).toBe('?');
    expect(toWinAnsi('a\u0007b\tc')).toBe('ab c');
  });
});
