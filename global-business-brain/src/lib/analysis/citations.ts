/**
 * Citimet nga vëzhgimet e ruajtura: e vetmja mënyrë si analiza krijon një `Citation` për një vlerë.
 *
 * A citation is always derived from an Observation that exists (stored, or generated demo data
 * flagged isDemo), so source, URL, period and retrievedAt are never invented.
 */
import type { Citation, IndicatorDefinition, Observation } from '@/lib/domain/types';
import { getSource } from '@/lib/data/sources/registry';

export function citationForObservation(def: IndicatorDefinition, obs: Observation): Citation {
  return {
    sourceId: obs.sourceId,
    sourceName: getSource(obs.sourceId)?.nameSq ?? obs.sourceId,
    url: obs.sourceUrl,
    indicatorCode: def.code,
    countryCode: obs.countryCode,
    period: obs.period,
    value: obs.value,
    unitLabelSq: def.unitLabelSq,
    retrievedAt: obs.retrievedAt,
    sourceLastUpdated: obs.sourceLastUpdated ?? null,
    isDemo: obs.isDemo,
    isProjection: obs.isProjection,
    noteSq: `kodi ${def.sourceCode}`,
  };
}
