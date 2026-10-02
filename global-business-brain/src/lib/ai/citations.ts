/**
 * Citimet e asistentit: numërimi [c1], [c2]… i citimeve nga rezultatet e mjeteve dhe pastrimi i
 * përgjigjes përfundimtare.
 *
 * The assistant never creates citations or links. Every citation comes from a tool result and is
 * registered here with a reply-wide id. After the final answer:
 *  - only markers whose id exists in the registry survive; unknown ones ("[c9]") are removed;
 *  - surviving markers are renumbered c1..cK in order of first appearance, so reply.citations[i]
 *    is exactly what "[c{i+1}]" points at (the chat UI renders markers by position);
 *  - any http(s)/www link that is not the URL of a registered citation is replaced with
 *    "[lidhje e hequr — e paverifikuar]".
 */
import type { Citation } from '@/lib/domain/types';

export const REMOVED_LINK_SQ = '[lidhje e hequr — e paverifikuar]';

export interface RegisteredCitation {
  id: string;
  citation: Citation;
}

/** Reply-wide citation numbering; the same source value cited twice keeps one id. */
export class CitationRegistry {
  private readonly entries: RegisteredCitation[] = [];
  private readonly idsByKey = new Map<string, string>();

  register(citation: Citation): string {
    const key = JSON.stringify([
      citation.sourceId,
      citation.url,
      citation.indicatorCode ?? null,
      citation.countryCode ?? null,
      citation.period ?? null,
      citation.value ?? null,
    ]);
    const existing = this.idsByKey.get(key);
    if (existing) return existing;
    const id = `c${this.entries.length + 1}`;
    this.entries.push({ id, citation });
    this.idsByKey.set(key, id);
    return id;
  }

  get(id: string): Citation | undefined {
    return this.entries.find((e) => e.id === id)?.citation;
  }

  all(): RegisteredCitation[] {
    return [...this.entries];
  }
}

/**
 * Collects the citations one tool run used. `cite` registers in the reply-wide registry and
 * returns the id the tool data should reference.
 */
export class CitationCollector {
  private readonly used: RegisteredCitation[] = [];

  constructor(private readonly registry: CitationRegistry) {}

  cite(citation: Citation | null | undefined): string | null {
    if (!citation || !citation.url) return null;
    const id = this.registry.register(citation);
    if (!this.used.some((u) => u.id === id)) this.used.push({ id, citation });
    return id;
  }

  list(): RegisteredCitation[] {
    return [...this.used];
  }
}

const GROUPED_MARKERS = /\[\s*(c\d+(?:\s*[,;]\s*c\d+)+)\s*\]/gi;
const MARKER = / ?\[c(\d+)\]/gi;
const MARKDOWN_LINK = /\[([^\]\n]{1,200})\]\(\s*((?:https?:\/\/|www\.)[^\s)]+)\s*\)/gi;
const BARE_LINK = /(?:https?:\/\/|\bwww\.)[^\s<>()[\]{}"'`]+/gi;
const TRAILING_PUNCTUATION = /[.,;:!?'"’”»]+$/;

/** "[c1, c3]" → "[c1][c3]" so every marker can be checked on its own. */
function splitGroupedMarkers(text: string): string {
  return text.replace(GROUPED_MARKERS, (_m, group: string) =>
    group
      .split(/[,;]/)
      .map((id) => `[${id.trim().toLowerCase()}]`)
      .join(''),
  );
}

/** Removes every [cN] marker (used for earlier assistant turns sent back as history). */
export function stripCitationMarkers(text: string): string {
  return splitGroupedMarkers(text).replace(MARKER, '');
}

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, '').toLowerCase();
}

interface LinkCheck {
  allowed: (url: string) => boolean;
  linked: Set<string>; // registered citation ids whose URL appears in the text
}

function linkChecker(registry: CitationRegistry): LinkCheck {
  const byUrl = new Map<string, string>();
  for (const { id, citation } of registry.all()) {
    if (/^https?:\/\//i.test(citation.url)) byUrl.set(normalizeUrl(citation.url), id);
  }
  const linked = new Set<string>();
  return {
    linked,
    allowed: (url) => {
      const id = byUrl.get(normalizeUrl(url));
      if (id) linked.add(id);
      return id !== undefined;
    },
  };
}

function stripUnverifiedLinks(text: string, check: LinkCheck): string {
  const withMarkdown = text.replace(MARKDOWN_LINK, (whole, label: string, url: string) =>
    check.allowed(url) ? whole : `${label} ${REMOVED_LINK_SQ}`,
  );
  return withMarkdown.replace(BARE_LINK, (raw) => {
    const trailing = TRAILING_PUNCTUATION.exec(raw)?.[0] ?? '';
    const url = trailing ? raw.slice(0, -trailing.length) : raw;
    return check.allowed(url) ? raw : `${REMOVED_LINK_SQ}${trailing}`;
  });
}

export interface FinalizedAnswer {
  text: string;
  citations: Citation[];
}

/** Applies the citation and link rules to the final answer (see the file header). */
export function finalizeAnswer(rawText: string, registry: CitationRegistry): FinalizedAnswer {
  const renumbered = new Map<string, string>();
  const kept: Citation[] = [];
  const withMarkers = splitGroupedMarkers(rawText).replace(MARKER, (whole, digits: string) => {
    const id = `c${Number(digits)}`;
    const citation = registry.get(id);
    if (!citation) return '';
    let next = renumbered.get(id);
    if (!next) {
      kept.push(citation);
      next = `c${kept.length}`;
      renumbered.set(id, next);
    }
    return `${whole.startsWith(' ') ? ' ' : ''}[${next}]`;
  });

  const check = linkChecker(registry);
  const text = stripUnverifiedLinks(withMarkers, check)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/(\S)[ \t]{2,}/g, '$1 ')
    .trim();
  // A verified source URL copied into the text without a marker is still listed with the reply.
  for (const id of check.linked) {
    const citation = registry.get(id);
    if (citation && !kept.includes(citation)) kept.push(citation);
  }
  return { text, citations: kept };
}
