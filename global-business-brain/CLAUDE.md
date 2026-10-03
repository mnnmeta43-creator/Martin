# Global Business Brain — developer & agent rules

@AGENTS.md

App: Next.js 16 (App Router, Turbopack) + React 19 + TypeScript 5.9 + Tailwind CSS 4 + PostgreSQL
(`pg` in production, embedded PGlite for local dev and tests). Tests: Vitest (`tests/**/*.test.ts`),
Playwright (`e2e/`). All user-facing text is **Albanian** (`…Sq` fields). Mobile-first, dark navy/black,
electric-blue accent.

## Non-negotiable product rules (from the product spec)

1. **Never invent data.** No hard-coded indicator values, prices presented as facts, company names,
   competitor names, statistics, URLs or citations. Missing data is shown as missing (`null`,
   status `mungon`), never as 0 or a guess.
2. Distinguish **fakt / interpretim / supozim / parashikim** (`ClaimKind`) and
   **mbështetet nga të dhënat / hipotezë / duhet testuar** (`EvidenceLabel`). A claim labelled
   `mbeshtetet_nga_te_dhenat` must carry ≥1 `Citation` that points at a stored `Observation`
   (source, URL, period, retrievedAt).
3. Periodic indicators are "Të dhënat më të fundit të disponueshme" + period — never "live".
   "Live" only means a verified connection to the source with a refresh timestamp.
4. Demo data is fictional, lives only in the demo economies `ZZA`, `ZZB`, `ZZC`, is flagged
   `isDemo: true` everywhere, is shown with a DEMO badge, and is never used for real
   recommendations. It is enabled only when `DATA_MODE=demo`.
5. No business is ever presented as guaranteed profit. Score ≠ probability. Plan % = plan
   completion, never probability of success. No guaranteed payback date.
6. Legal / tax / licence statements: "Kërkon verifikim lokal" unless backed by an official source
   from the registry. Regulated activities list the licensed professionals required. No dangerous
   work instructions. Illegal, deceptive or age-inappropriate ideas are excluded.
7. Financial numbers come from the deterministic engine in `src/lib/finance`, never from the AI.
8. Secrets only in server-side env vars. Never import `src/lib/server/**`, `pg`, `pglite`,
   `pdfkit`, `exceljs` or `@anthropic-ai/sdk` from a client component. Logs never contain secrets.
9. No external action (registration, payment, purchase, message sending) on the user's behalf.
10. Do not deploy anything. Do not touch files outside `global-business-brain/`.

## Module map and public API (contract)

Shared types: `src/lib/domain/types.ts`. Taxonomies & Albanian labels: `src/lib/domain/taxonomy.ts`.
Storage contract: `src/lib/server/store/types.ts`. Change these only additively.

| Area | Files | Main exports |
|---|---|---|
| Finance (pure, deterministic) | `src/lib/finance/engine.ts` | `computeUnitEconomics`, `projectScenario`, `projectAllScenarios`, `applyShock`, `sensitivityAnalysis` |
| | `src/lib/finance/currency.ts` | `convert`, `currencyMinorUnits`, `roundMoney`, `convertInputs` |
| | `src/lib/finance/format.ts` | `formatMoney`, `formatNumber`, `formatPercent`, `formatIndicatorValue`, `formatPeriod`, `formatDate` |
| | `src/lib/finance/build.ts` | `buildFinancialInputs` (archetype assumptions → editable inputs) |
| | `src/lib/finance/capital.ts` | `suggestCapitalReductions` |
| Data | `src/lib/data/sources/registry.ts` | `SOURCES`, `getSource`, `OFFICIAL_LINKS`, `getOfficialLinks` |
| | `src/lib/data/indicators.ts` | `INDICATORS`, `getIndicator` |
| | `src/lib/data/countries.ts` | `getCountries`, `getCountry`, `searchCountries`, `withWbMeta` |
| | `src/lib/data/units.ts` | `parsePeriod`, `comparePeriods`, `unitIsPercent`, `scaleValue` |
| | `src/lib/data/http.ts` | `fetchJson`, `HostRateLimiter`, `SourceError` |
| | `src/lib/data/sources/worldbank.ts`, `imf.ts`, `fx.ts` | URL builders, parsers, fetchers |
| | `src/lib/data/freshness.ts`, `series.ts`, `coverage.ts` | `assessStatus`, `buildSeries`, `computeChange`, `computeCoverage` |
| | `src/lib/data/refresh.ts` | `refreshAll` |
| | `src/lib/data/context.ts` | `getCountryDataContext`, `getCountryDataContexts` |
| | `src/lib/data/demo/dataset.ts` | `DEMO_COUNTRIES`, `buildDemoObservations`, `buildDemoFxRates`, `isDemoMode` |
| Analysis | `src/lib/analysis/macro.ts`, `compare.ts` | `buildMacroAnalysis`, `compareCountries` |
| Ideas | `src/lib/ideas/archetypes/index.ts` | `ARCHETYPES`, `getArchetype` |
| | `src/lib/ideas/engine.ts` | `generateIdeas`, `evaluateIdea` |
| | `src/lib/ideas/fit.ts`, `claims.ts`, `explain.ts`, `location.ts`, `validation.ts`, `adapt.ts` | see file headers |
| Scoring | `src/lib/scoring/score.ts` | `validateWeights`, `normalizeWeights`, `scoreIdea`, `assessEvidenceQuality` |
| Plan | `src/lib/plan/generate.ts`, `progress.ts` | `generatePlan`, `computeProgress`, `tasksForHorizon` |
| Export | `src/lib/export/excel.ts`, `pdf.ts` | `buildFinancialWorkbook`, `buildPlanPdf` |
| AI | `src/lib/ai/assistant.ts`, `tools.ts`, `fallback.ts` | `runAssistant` |
| Server | `src/lib/server/env.ts`, `db.ts`, `store/sqlStore.ts`, `store/index.ts`, `auth.ts`, `session.ts`, `rateLimit.ts`, `logger.ts`, `http.ts` | `getEnv`, `configStatus`, `getDb`, `createSqlStore`, `getStore`, auth helpers, `rateLimit`, `logger`, route helpers |
| Validation | `src/lib/validation/schemas.ts` | zod schemas for every API input |
| UI | `src/app/**`, `src/components/**` | Albanian UI, server components read via lib, client components mutate via `/api/**` |

## Conventions

- Run only your own tests while other people work in the tree: `npx vitest run tests/unit/<area>`.
- Type-check: `npx tsc --noEmit` (filter to your files if others are mid-edit).
- Pure modules (finance, scoring, plan, ideas, data parsing) take `now: Date` as a parameter
  instead of calling `new Date()` internally, so they stay deterministic and testable.
- Fetchers take an injectable `fetchImpl` so tests never hit the network.
- Comments: short, explain *why*. No commented-out code.
