/**
 * Testet e eksportit PDF: struktura, faqet, tekstet kryesore shqip (me ë/ç), banderola DEMO,
 * fundfaqja "Faqja X nga Y" dhe pastrimi i tekstit për kodimin WinAnsi.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { buildPlanPdf, toWinAnsi, type ExportInput } from '@/lib/export/pdf';
import { DEMO_BANNER_SQ, PLAN_DISCLAIMER_SQ } from '@/lib/export/common';
import { formatNumber } from '@/lib/finance/format';
import { makeExportInput } from './fixtures';
import { countPdfPages, extractPdfLines, extractPdfText } from './pdfText';

function normalize(text: string): string {
  return toWinAnsi(text).replace(/[\s ]+/g, ' ');
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
    const money = (v: number) => normalize(`${formatNumber(v, 2)} ${input.project.financialInputs.currency}`);
    expect(text).toContain('Investimi fillestar (supozim)');
    expect(text).toContain(money(base.capital.startupTotal));
    expect(text).toContain(money(base.capital.totalRequired));
    expect(text).toContain(normalize(base.payback.statementSq));
    expect(text).toContain('Paraja më e ulët (supozim)');
  });

  it('renders every phase with its criteria and budget', () => {
    for (const phase of input.plan.phases) {
      expect(text).toContain(normalize(`${phase.rangeLabel} · ${phase.titleSq}`));
      expect(text).toContain(normalize(phase.stopCriterionSq));
      expect(text).toContain(normalize(phase.continueCriterionSq));
    }
    expect(text).toContain('Buxheti (supozim)');
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
    const compact = text.replace(/\s+/g, '');
    for (const c of input.citations) expect(compact).toContain(c.url.replace(/\s+/g, ''));
    expect(text).toContain('Marrë më:');
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
