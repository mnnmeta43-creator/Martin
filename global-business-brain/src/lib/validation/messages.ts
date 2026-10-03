/**
 * Mesazhet shqip për gabimet e validimit (Albanian validation messages).
 *
 * zod produces English default messages. `summarizeZodIssues` keeps messages we wrote ourselves
 * (custom refinements and explicit `error:` texts, all Albanian) and replaces zod's English
 * defaults with Albanian text derived from the issue code and limits.
 */
import type { z } from 'zod';

export interface IssueSummary {
  path: string;
  messageSq: string;
}

type Issue = z.core.$ZodIssue;

const numberFormat = new Intl.NumberFormat('sq-AL', { maximumFractionDigits: 6 });

function fmt(value: number | bigint): string {
  return numberFormat.format(value);
}

const EXPECTED_SQ: Record<string, string> = {
  string: 'Duhet të jetë tekst.',
  number: 'Duhet të jetë numër.',
  int: 'Duhet të jetë numër i plotë.',
  boolean: 'Duhet të jetë po ose jo (true/false).',
  array: 'Duhet të jetë listë.',
  object: 'Duhet të jetë objekt.',
  date: 'Duhet të jetë datë.',
  null: 'Duhet të jetë bosh (null).',
};

const FORMAT_SQ: Record<string, string> = {
  email: 'Adresa e email-it nuk është e vlefshme.',
  uuid: 'Identifikuesi nuk është i vlefshëm.',
  url: 'Adresa URL nuk është e vlefshme.',
  date: 'Data duhet të jetë në formatin VVVV-MM-DD.',
  datetime: 'Data dhe ora duhet të jenë në formatin ISO 8601.',
};

/** zod's English defaults all start like this; our own messages never do. */
const ZOD_DEFAULT_MESSAGE = /^(Invalid|Too (small|big)|Expected|Unrecognized|Number must|String must|Array must|Required)/;

function tooSmallSq(issue: Extract<Issue, { code: 'too_small' }>): string {
  const min = issue.minimum;
  if (issue.origin === 'string') {
    if (issue.exact) return `Duhet të ketë saktësisht ${fmt(min)} karaktere.`;
    return Number(min) <= 1 ? 'Fusha nuk mund të jetë bosh.' : `Duhet të ketë të paktën ${fmt(min)} karaktere.`;
  }
  if (issue.origin === 'array' || issue.origin === 'set') {
    if (issue.exact) return `Lista duhet të ketë saktësisht ${fmt(min)} elemente.`;
    return Number(min) <= 1 ? 'Zgjidhni të paktën një element.' : `Lista duhet të ketë të paktën ${fmt(min)} elemente.`;
  }
  return issue.inclusive === false ? `Vlera duhet të jetë më e madhe se ${fmt(min)}.` : `Vlera duhet të jetë të paktën ${fmt(min)}.`;
}

function tooBigSq(issue: Extract<Issue, { code: 'too_big' }>): string {
  const max = issue.maximum;
  if (issue.origin === 'string') {
    return issue.exact ? `Duhet të ketë saktësisht ${fmt(max)} karaktere.` : `Teksti mund të ketë deri në ${fmt(max)} karaktere.`;
  }
  if (issue.origin === 'array' || issue.origin === 'set') {
    return issue.exact ? `Lista duhet të ketë saktësisht ${fmt(max)} elemente.` : `Lista mund të ketë deri në ${fmt(max)} elemente.`;
  }
  return issue.inclusive === false ? `Vlera duhet të jetë më e vogël se ${fmt(max)}.` : `Vlera mund të jetë deri në ${fmt(max)}.`;
}

/** Albanian message for one zod issue. */
export function issueMessageSq(issue: Issue): string {
  if (issue.message && !ZOD_DEFAULT_MESSAGE.test(issue.message)) return issue.message;
  switch (issue.code) {
    case 'invalid_type':
      return issue.input === undefined ? 'Fusha është e detyrueshme.' : (EXPECTED_SQ[issue.expected] ?? 'Lloji i vlerës nuk është i saktë.');
    case 'too_small':
      return tooSmallSq(issue);
    case 'too_big':
      return tooBigSq(issue);
    case 'invalid_format':
      return FORMAT_SQ[issue.format] ?? 'Formati nuk është i vlefshëm.';
    case 'invalid_value': {
      const values = issue.values.slice(0, 12).map((v) => String(v));
      return values.length > 0 ? `Vlera duhet të jetë një nga: ${values.join(', ')}.` : 'Vlera nuk lejohet.';
    }
    case 'unrecognized_keys':
      return `Fusha të panjohura: ${issue.keys.join(', ')}.`;
    case 'invalid_union':
      return 'Vlera nuk përputhet me asnjë nga formatet e lejuara.';
    case 'not_multiple_of':
      return `Vlera duhet të jetë shumëfish i ${fmt(issue.divisor)}.`;
    case 'invalid_key':
    case 'invalid_element':
      return 'Një element i listës nuk është i vlefshëm.';
    default:
      return 'Vlera nuk është e vlefshme.';
  }
}

export function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.map((p) => (typeof p === 'number' ? `[${p}]` : String(p))).join('.').replace(/\.\[/g, '[');
}

/** One entry per issue (max 20), ready for an API error body. */
export function summarizeZodIssues(issues: readonly Issue[]): IssueSummary[] {
  return issues.slice(0, 20).map((issue) => ({ path: formatIssuePath(issue.path), messageSq: issueMessageSq(issue) }));
}
