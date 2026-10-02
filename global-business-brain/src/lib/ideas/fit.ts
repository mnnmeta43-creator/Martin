/**
 * Përputhja e një ideje me profilin e përdoruesit (archetype × profile → ProfileFit).
 *
 * Pure and deterministic. Every rule produces an Albanian reason, so the UI can show exactly why
 * an idea fits, does not fit, or is excluded. Hard blockers (age, team size, home-only start)
 * make an idea ineligible; everything else is a mismatch the user can weigh. Team-size blockers
 * are reported with their own kind so the engine can list those ideas separately instead of
 * ranking them next to ideas a solo founder can actually start.
 */
import type { BusinessArchetype, MoneyRange, ProfileFit, UserProfile } from '@/lib/domain/types';
import {
  BUSINESS_MODE_LABELS,
  MARKET_SCOPE_LABELS,
  SECTORS,
  TEAM_MODE_LABELS,
  assetLabel,
  skillLabel,
} from '@/lib/domain/taxonomy';
import { formatMoney } from '@/lib/finance/format';

export interface FitCapitalInput {
  /** Startup-cost range in the profile currency; null when no FX rate allowed the conversion. */
  capitalRange: MoneyRange | null;
  ownCapital: number;
}

export type FitBlockerKind = 'mosha' | 'ekipi' | 'vendndodhja';

export interface FitBlocker {
  kind: FitBlockerKind;
  textSq: string;
}

export interface DetailedProfileFit {
  fit: ProfileFit;
  blockers: FitBlocker[];
}

/** Prefix shared by every team blocker; UI and tests may rely on it. */
export const TEAM_BLOCKER_PREFIX_SQ = 'Kërkon ekip/partner; profili juaj: vetëm';

/**
 * Heuristic: a start that would use more than half of the user's own capital counts as
 * "capital-heavy" for a low risk tolerance. It is an explicit rule of thumb, not a law.
 */
export const CAPITAL_HEAVY_SHARE = 0.5;

const TEAM_RANK = { vetem: 0, partner: 1, ekip: 2 } as const;
const TEAM_NEED_SQ = { vetem: 'vetëm një person', partner: 'një partner', ekip: 'një ekip' } as const;

function listSq(items: string[]): string {
  return items.join(', ');
}

function intersects<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.some((x) => b.includes(x));
}

interface Collector {
  matches: string[];
  mismatches: string[];
  blockers: FitBlocker[];
}

function checkAge(a: BusinessArchetype, p: UserProfile, out: Collector): void {
  if (a.adultOnly && !p.isAdult) {
    out.blockers.push({ kind: 'mosha', textSq: 'Kërkon moshë 18+; profili juaj tregon që jeni nën 18 vjeç.' });
  }
}

function checkTeam(a: BusinessArchetype, p: UserProfile, out: Collector): void {
  const needed = TEAM_RANK[a.minTeam];
  const have = TEAM_RANK[p.teamMode];
  if (needed === 0) {
    out.matches.push('Mund ta nisni edhe vetëm.');
    return;
  }
  const needSq = TEAM_NEED_SQ[a.minTeam];
  if (have === 0) {
    out.blockers.push({ kind: 'ekipi', textSq: `${TEAM_BLOCKER_PREFIX_SQ}. Minimumi për këtë ide: ${needSq}.` });
  } else if (have < needed) {
    out.mismatches.push(`Nuk përputhet: kërkon ${needSq}, ndërsa profili juaj është «${TEAM_MODE_LABELS[p.teamMode].toLowerCase()}».`);
  } else {
    out.matches.push(`Përputhet: ideja kërkon ${needSq} dhe profili juaj e plotëson.`);
  }
}

function checkModesAndScopes(a: BusinessArchetype, p: UserProfile, out: Collector): void {
  const modes = listSq(a.modes.map((m) => BUSINESS_MODE_LABELS[m].toLowerCase()));
  if (intersects(a.modes, p.businessModes)) {
    out.matches.push(`Përputhet: mënyra e punës (${modes}).`);
  } else {
    out.mismatches.push(
      `Nuk përputhet: ideja punon ${modes}, ndërsa ju pranoni ${listSq(p.businessModes.map((m) => BUSINESS_MODE_LABELS[m].toLowerCase())) || 'asnjë mënyrë'}.`,
    );
  }
  const scopes = listSq(a.marketScopes.map((s) => MARKET_SCOPE_LABELS[s].toLowerCase()));
  if (intersects(a.marketScopes, p.marketScopes)) {
    out.matches.push(`Përputhet: tregu (${scopes}).`);
  } else {
    out.mismatches.push(
      `Nuk përputhet: ideja synon ${scopes}, ndërsa ju pranoni ${listSq(p.marketScopes.map((s) => MARKET_SCOPE_LABELS[s].toLowerCase())) || 'asnjë treg'}.`,
    );
  }
}

function checkStartLocation(a: BusinessArchetype, p: UserProfile, out: Collector): void {
  const homeOnly = p.startLocations.length > 0 && p.startLocations.every((l) => l === 'shtepi');
  if (homeOnly && !a.canStartFromHome) {
    out.blockers.push({
      kind: 'vendndodhja',
      textSq: 'Kjo ide nuk mund të niset nga shtëpia (kërkon ambient), ndërsa profili juaj pranon vetëm nisje nga shtëpia.',
    });
  } else if (a.canStartFromHome && p.startLocations.includes('shtepi')) {
    out.matches.push('Përputhet: mund të niset nga shtëpia, pa qira lokali në fillim.');
  }
}

function checkSkills(a: BusinessArchetype, p: UserProfile, out: Collector): void {
  const owned = new Set(p.skills);
  const missing = a.requiredSkills.filter((s) => !owned.has(s));
  for (const s of a.requiredSkills.filter((x) => owned.has(x))) out.matches.push(`Keni aftësinë e kërkuar: ${skillLabel(s)}.`);
  for (const s of missing) out.mismatches.push(`Mungon aftësia e kërkuar: ${skillLabel(s)}.`);
  if (a.requiredSkills.length > 0 && missing.length === a.requiredSkills.length) {
    out.mismatches.push('Nuk keni asnjë nga aftësitë e kërkuara — mund ta kompensoni me partner ose trajnim, por kjo kërkon kohë ose kosto shtesë.');
  }
  const helpful = a.helpfulSkills.filter((s) => owned.has(s));
  if (helpful.length > 0) out.matches.push(`Aftësi të dobishme që keni: ${listSq(helpful.map(skillLabel))}.`);
}

function checkAssets(a: BusinessArchetype, p: UserProfile, out: Collector): void {
  const owned = new Set(p.assets);
  const relevant = new Set([...a.helpfulAssets, ...a.startupCosts.flatMap((c) => c.avoidedByAssets ?? [])]);
  for (const asset of [...relevant].filter((x) => owned.has(x))) {
    const avoided = a.startupCosts.filter((c) => (c.avoidedByAssets ?? []).includes(asset));
    out.matches.push(
      avoided.length > 0
        ? `Aset që e ul kapitalin e hapjes: ${assetLabel(asset)} (shmang: ${listSq(avoided.map((c) => c.labelSq))}).`
        : `Aset i dobishëm që keni: ${assetLabel(asset)}.`,
    );
  }
}

function checkExperienceAndHours(a: BusinessArchetype, p: UserProfile, out: Collector): void {
  if (p.experienceSectors.includes(a.sector)) {
    out.matches.push(`Keni përvojë në sektorin «${SECTORS[a.sector]}» (gjithsej ${p.experienceYears} vjet përvojë pune).`);
  }
  if (p.hoursPerWeek < a.minHoursPerWeek) {
    out.mismatches.push(`Nuk përputhet: kërkon të paktën ${a.minHoursPerWeek} orë në javë, ndërsa ju keni ${p.hoursPerWeek}.`);
  } else {
    out.matches.push(`Përputhet: koha që keni (${p.hoursPerWeek} orë në javë) mbulon minimumin prej ${a.minHoursPerWeek} orësh.`);
  }
}

export function sameCurrency(a: string, b: string): boolean {
  return a.trim().toUpperCase() === b.trim().toUpperCase();
}

function isCapitalHeavy(cap: FitCapitalInput): boolean {
  if (!cap.capitalRange) return false;
  if (cap.ownCapital <= 0) return cap.capitalRange.high > 0;
  return cap.capitalRange.high > cap.ownCapital * CAPITAL_HEAVY_SHARE;
}

/** Returns the capital gap (null when unknown) after writing the capital reasons. */
function checkCapital(a: BusinessArchetype, p: UserProfile, cap: FitCapitalInput, out: Collector): number | null {
  const range = cap.capitalRange;
  const own = Number.isFinite(cap.ownCapital) && cap.ownCapital > 0 ? cap.ownCapital : 0;
  let gap: number | null = null;
  if (!range) {
    out.mismatches.push(
      `Kapitali nuk mund të krahasohet: mungon kursi i këmbimit nga USD në ${p.capital.currency}, prandaj diferenca nuk llogaritet (nuk supozohet 0).`,
    );
  } else if (!sameCurrency(range.currency, p.capital.currency)) {
    out.mismatches.push(
      `Kapitali nuk mund të krahasohet: kostot janë në ${range.currency}, ndërsa kapitali juaj në ${p.capital.currency}.`,
    );
  } else {
    const money = (v: number) => formatMoney(v, range.currency);
    gap = Math.max(0, range.low - own);
    if (gap > 0) {
      out.mismatches.push(
        `Kapitali: edhe skaji i ulët i kostove të hapjes (${money(range.low)}) e kalon kapitalin tuaj (${money(own)}); mungojnë rreth ${money(gap)}.`,
      );
    } else if (range.high > own) {
      out.matches.push(
        `Kapitali juaj (${money(own)}) mbulon skajin e ulët të kostove të hapjes (${money(range.low)}), por jo të lartin (${money(range.high)}). Rezerva dhe muajt e parë llogariten te modeli financiar.`,
      );
    } else {
      out.matches.push(
        `Kapitali juaj (${money(own)}) mbulon kostot e hapjes (${money(range.low)}–${money(range.high)}). Rezerva dhe muajt e parë llogariten te modeli financiar.`,
      );
    }
  }
  if (own === 0) {
    out.mismatches.push(`Kapitali juaj është 0: për momentin mund të testoni vetëm kërkesën. Prova pa kapital: ${a.zeroCapitalTestSq}`);
  }
  return gap;
}

function checkRegulationAndRisk(a: BusinessArchetype, p: UserProfile, cap: FitCapitalInput, out: Collector): void {
  if (a.regulated) {
    const pros =
      a.licensedProfessionalsSq.length > 0
        ? ` Nevojiten profesionistë të licencuar: ${listSq(a.licensedProfessionalsSq)}.`
        : ' Verifikoni nëse nevojiten profesionistë të licencuar.';
    out.mismatches.push(`Veprimtari e rregulluar: nevojiten leje ose licenca — Kërkon verifikim lokal.${pros}`);
  }
  if (p.riskTolerance !== 'e_ulet') return;
  const heavy = isCapitalHeavy(cap);
  if (a.regulated || heavy) {
    const why = [a.regulated ? 'është e rregulluar' : null, heavy ? 'do të përdorte më shumë se gjysmën e kapitalit tuaj' : null]
      .filter(Boolean)
      .join(' dhe ');
    out.mismatches.push(`Toleranca juaj ndaj rrezikut është e ulët, ndërsa kjo ide ${why}.`);
  }
}

/** Full assessment with typed blockers (used by the engine to separate team-only exclusions). */
export function assessProfileFitDetailed(a: BusinessArchetype, p: UserProfile, cap: FitCapitalInput): DetailedProfileFit {
  const out: Collector = { matches: [], mismatches: [], blockers: [] };
  checkAge(a, p, out);
  checkTeam(a, p, out);
  checkModesAndScopes(a, p, out);
  checkStartLocation(a, p, out);
  checkSkills(a, p, out);
  checkAssets(a, p, out);
  checkExperienceAndHours(a, p, out);
  const capitalGap = checkCapital(a, p, cap, out);
  checkRegulationAndRisk(a, p, cap, out);
  const blockersSq = out.blockers.map((b) => b.textSq);
  return {
    fit: {
      matchesSq: out.matches,
      mismatchesSq: out.mismatches,
      blockersSq,
      capitalGap,
      eligible: blockersSq.length === 0,
    },
    blockers: out.blockers,
  };
}

export function assessProfileFit(a: BusinessArchetype, p: UserProfile, cap: FitCapitalInput): ProfileFit {
  return assessProfileFitDetailed(a, p, cap).fit;
}
