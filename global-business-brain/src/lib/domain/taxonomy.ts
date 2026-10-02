/**
 * Taksonomitë e përbashkëta: aftësitë, asetet, sektorët dhe etiketat shqip.
 * Archetypes and profiles reference these ids; tests assert every id used exists here.
 */
import type {
  BusinessMode,
  ClaimKind,
  CoverageLevel,
  DataStatus,
  EconomyKind,
  EvidenceLabel,
  EvidenceType,
  FailureKind,
  MarketScope,
  MonthlyCategory,
  PhaseId,
  RiskTolerance,
  ScenarioId,
  ScoreDimensionId,
  SectorId,
  StartLocation,
  StartupCategory,
  TaskStatus,
  TeamMode,
} from './types';

export interface TaxonomyItem {
  id: string;
  labelSq: string;
  group?: string;
}

export const SKILLS: TaxonomyItem[] = [
  { id: 'shitje', labelSq: 'Shitje dhe negocim', group: 'Biznes' },
  { id: 'marketing_digjital', labelSq: 'Marketing digjital', group: 'Biznes' },
  { id: 'kontabilitet', labelSq: 'Kontabilitet / mbajtje librash', group: 'Biznes' },
  { id: 'menaxhim_projekti', labelSq: 'Menaxhim projektesh', group: 'Biznes' },
  { id: 'sherbim_klienti', labelSq: 'Shërbim ndaj klientit', group: 'Biznes' },
  { id: 'administrim', labelSq: 'Administrim zyre dhe dokumentesh', group: 'Biznes' },
  { id: 'programim', labelSq: 'Programim / zhvillim softuerësh', group: 'Teknologji' },
  { id: 'dizajn_web', labelSq: 'Dizajn web / UI', group: 'Teknologji' },
  { id: 'it_mbeshtetje', labelSq: 'Mbështetje IT dhe rrjete', group: 'Teknologji' },
  { id: 'analize_te_dhenash', labelSq: 'Analizë të dhënash / Excel', group: 'Teknologji' },
  { id: 'dizajn_grafik', labelSq: 'Dizajn grafik', group: 'Krijuese' },
  { id: 'fotografi_video', labelSq: 'Fotografi dhe video', group: 'Krijuese' },
  { id: 'shkrim_perkthim', labelSq: 'Shkrim / përkthim', group: 'Krijuese' },
  { id: 'gjuhe_te_huaja', labelSq: 'Gjuhë të huaja (rrjedhshëm)', group: 'Krijuese' },
  { id: 'mesimdhenie', labelSq: 'Mësimdhënie / trajnim', group: 'Njerëz' },
  { id: 'kujdes_personash', labelSq: 'Kujdes për persona (jo mjekësor)', group: 'Njerëz' },
  { id: 'gatim', labelSq: 'Gatim / përgatitje ushqimi', group: 'Praktike' },
  { id: 'pastrim', labelSq: 'Pastrim profesional', group: 'Praktike' },
  { id: 'riparime_shtepie', labelSq: 'Riparime të vogla shtëpie', group: 'Praktike' },
  { id: 'elektrik', labelSq: 'Punime elektrike (kërkon licencë)', group: 'Praktike' },
  { id: 'hidraulik', labelSq: 'Hidraulikë', group: 'Praktike' },
  { id: 'zdrukthtari', labelSq: 'Zdrukthtari / mobilieri', group: 'Praktike' },
  { id: 'mekanike', labelSq: 'Mekanikë automjetesh', group: 'Praktike' },
  { id: 'riparim_elektronike', labelSq: 'Riparim elektronike / telefonash', group: 'Praktike' },
  { id: 'rrobaqepesi', labelSq: 'Rrobaqepësi', group: 'Praktike' },
  { id: 'drejtim_mjeti', labelSq: 'Drejtim mjeti (patentë e vlefshme)', group: 'Praktike' },
  { id: 'bujqesi', labelSq: 'Bujqësi / kopshtari', group: 'Praktike' },
  { id: 'mikpritje', labelSq: 'Mikpritje / turizëm', group: 'Njerëz' },
  { id: 'logjistike', labelSq: 'Logjistikë dhe organizim furnizimi', group: 'Biznes' },
  { id: 'import_eksport', labelSq: 'Import-eksport / doganë', group: 'Biznes' },
];

export const ASSETS: TaxonomyItem[] = [
  { id: 'kompjuter', labelSq: 'Kompjuter / laptop' },
  { id: 'telefon_smart', labelSq: 'Telefon inteligjent' },
  { id: 'internet_i_qendrueshem', labelSq: 'Internet i qëndrueshëm' },
  { id: 'automjet', labelSq: 'Automjet' },
  { id: 'furgon', labelSq: 'Furgon / mjet transporti mallrash' },
  { id: 'motor_bicikleta', labelSq: 'Motor ose biçikletë' },
  { id: 'kuzhine_shtepie', labelSq: 'Kuzhinë shtëpie' },
  { id: 'kuzhine_profesionale', labelSq: 'Kuzhinë profesionale e licencuar' },
  { id: 'punishte', labelSq: 'Punishte / garazh' },
  { id: 'magazine', labelSq: 'Magazinë / hapësirë depozitimi' },
  { id: 'dyqan_lokal', labelSq: 'Lokal / dyqan me fasadë' },
  { id: 'toke', labelSq: 'Tokë bujqësore' },
  { id: 'sere', labelSq: 'Serë' },
  { id: 'apartament_shtese', labelSq: 'Apartament / dhomë shtesë' },
  { id: 'vegla_pune', labelSq: 'Vegla pune dore / elektrike' },
  { id: 'kamera', labelSq: 'Kamerë / pajisje fotografike' },
  { id: 'makine_qepese', labelSq: 'Makinë qepëse' },
  { id: 'rrjet_kontaktesh', labelSq: 'Rrjet kontaktesh me biznese' },
  { id: 'rrjet_diaspore', labelSq: 'Rrjet kontaktesh në diasporë' },
];

export const SECTORS: Record<SectorId, string> = {
  sherbime_biznesi: 'Shërbime për biznese',
  sherbime_shtepie: 'Shërbime për shtëpi',
  ushqim: 'Ushqim',
  turizem: 'Turizëm dhe mikpritje',
  digjitale: 'Shërbime digjitale',
  logjistike: 'Logjistikë dhe transport',
  edukim: 'Edukim dhe trajnim',
  bujqesi: 'Bujqësi dhe agro-përpunim',
  tregti: 'Tregti dhe shpërndarje',
  prodhim: 'Prodhim i vogël',
  kujdes: 'Kujdes dhe mbështetje',
  energji: 'Energji dhe efiçencë',
  riparime: 'Riparime dhe mirëmbajtje',
  diaspora: 'Shërbime për diasporën',
  mjedis: 'Mjedis dhe riciklim',
};

export const BUSINESS_MODE_LABELS: Record<BusinessMode, string> = {
  fizik: 'Fizik',
  online: 'Online',
  kombinuar: 'I kombinuar',
};

export const MARKET_SCOPE_LABELS: Record<MarketScope, string> = {
  lokal: 'Treg lokal',
  nderkombetar: 'Treg ndërkombëtar',
};

export const START_LOCATION_LABELS: Record<StartLocation, string> = {
  shtepi: 'Nisje nga shtëpia',
  ambient: 'Me ambient / lokal',
};

export const TEAM_MODE_LABELS: Record<TeamMode, string> = {
  vetem: 'Vetëm',
  partner: 'Me një partner',
  ekip: 'Me ekip',
};

export const RISK_TOLERANCE_LABELS: Record<RiskTolerance, string> = {
  e_ulet: 'E ulët',
  mesatare: 'Mesatare',
  e_larte: 'E lartë',
};

export const CLAIM_KIND_LABELS: Record<ClaimKind, string> = {
  fakt: 'Fakt',
  interpretim: 'Interpretim',
  supozim: 'Supozim',
  parashikim: 'Parashikim',
};

export const EVIDENCE_LABELS: Record<EvidenceLabel, string> = {
  mbeshtetet_nga_te_dhenat: 'Kjo mbështetet nga të dhënat.',
  hipoteze: 'Kjo është hipotezë.',
  duhet_testuar: 'Kjo duhet testuar me klientë.',
};

export const DATA_STATUS_LABELS: Record<DataStatus, string> = {
  i_fresket: 'Të dhënat më të fundit të disponueshme',
  i_vjeter: 'Të dhëna të vjetra',
  shume_i_vjeter: 'Të dhëna shumë të vjetra',
  mungon: 'Mungojnë të dhënat',
  gabim_burimi: 'Burimi nuk u përgjigj — po shfaqen të dhënat e ruajtura',
  demo: 'DEMO — të dhëna fiktive',
  parashikim: 'Parashikim, jo matje',
};

export const COVERAGE_LABELS: Record<CoverageLevel, string> = {
  e_plote: 'Mbulim i plotë',
  e_pjesshme: 'Mbulim i pjesshëm',
  e_pamjaftueshme: 'Mbulim i pamjaftueshëm',
};

export const ECONOMY_KIND_LABELS: Record<EconomyKind, string> = {
  shtet_anetar_okb: 'Shtet anëtar i OKB-së',
  shtet_vezhgues_okb: 'Shtet vëzhgues në OKB',
  njohje_e_pjesshme: 'Shtet me njohje të pjesshme',
  territor: 'Territor / rajon i veçantë',
  demo: 'Ekonomi DEMO (fiktive)',
};

export const SCENARIO_LABELS: Record<ScenarioId, string> = {
  konservator: 'Konservator',
  baze: 'Bazë',
  optimist: 'Optimist',
};

export const SCORE_DIMENSION_LABELS: Record<ScoreDimensionId, string> = {
  kerkesa: 'Kërkesa e dokumentuar',
  kapitali: 'Përputhja me kapitalin',
  aftesite: 'Aftësitë dhe përvoja',
  veshtiresia: 'Lehtësia e nisjes',
  ekonomia: 'Ekonomia e biznesit',
  rreziku: 'Rreziku (sa më i ulët, aq më mirë)',
};

export const DEFAULT_SCORE_WEIGHTS: Record<ScoreDimensionId, number> = {
  kerkesa: 20,
  kapitali: 20,
  aftesite: 20,
  veshtiresia: 15,
  ekonomia: 15,
  rreziku: 10,
};

export const STARTUP_CATEGORY_LABELS: Record<StartupCategory, string> = {
  hapje: 'Shpenzime hapjeje',
  pajisje: 'Pajisje',
  depozita: 'Depozita',
  inventar: 'Inventar fillestar',
  tarifa: 'Tarifa (regjistrim, leje)',
  testim_tregu: 'Testim tregu',
};

export const MONTHLY_CATEGORY_LABELS: Record<MonthlyCategory, string> = {
  qira: 'Qira',
  paga: 'Paga (punonjës)',
  sherbime_komunale: 'Shërbime komunale (energji, ujë, internet)',
  marketing: 'Marketing',
  transport: 'Transport / karburant',
  software: 'Software / abonime',
  sigurime: 'Sigurime',
  kontabilitet: 'Kontabilitet',
  mirembajtje: 'Mirëmbajtje',
  tjeter: 'Të tjera',
};

export const FAILURE_KIND_LABELS: Record<FailureKind, string> = {
  kerkese_e_pamjaftueshme: 'Kërkesë e pamjaftueshme',
  cmim: 'Klientët nuk paguajnë çmimin e nevojshëm',
  konkurrence: 'Konkurrencë',
  kosto: 'Kosto të larta',
  aftesi: 'Mungesë aftësish',
  vonesa_pagesash: 'Vonesa pagesash',
  sezonalitet: 'Sezonalitet',
  ligjore: 'Kufizime ligjore',
  operacionale: 'Probleme operacionale',
};

export const PHASE_IDS: PhaseId[] = [
  'p00_10',
  'p10_20',
  'p20_30',
  'p30_40',
  'p40_50',
  'p50_60',
  'p60_70',
  'p70_80',
  'p80_90',
  'p90_100',
];

export const PHASE_TITLES: Record<PhaseId, { range: string; titleSq: string }> = {
  p00_10: { range: '0–10', titleSq: 'Qartëso profilin, burimet dhe problemin' },
  p10_20: { range: '10–20', titleSq: 'Intervisto klientë dhe verifiko kërkesën' },
  p20_30: { range: '20–30', titleSq: 'Analizo konkurrencën dhe formo ofertën' },
  p30_40: { range: '30–40', titleSq: 'Ndërto çmimin, buxhetin dhe modelin financiar' },
  p40_50: { range: '40–50', titleSq: 'Verifiko regjistrimin, lejet dhe detyrimet' },
  p50_60: { range: '50–60', titleSq: 'Organizo furnitorët, mjetet dhe procesin e punës' },
  p60_70: { range: '60–70', titleSq: 'Kryej një provë të vogël, të ligjshme dhe me kosto të kufizuar' },
  p70_80: { range: '70–80', titleSq: 'Fito dhe shërbe klientët e parë' },
  p80_90: { range: '80–90', titleSq: 'Mat rezultatet dhe përmirëso operimin' },
  p90_100: { range: '90–100', titleSq: 'Stabilizo biznesin dhe vlerëso zgjerimin' },
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  per_tu_bere: 'Për t’u bërë',
  ne_progres: 'Në progres',
  perfunduar: 'Përfunduar',
  anashkaluar: 'Anashkaluar',
};

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  interviste: 'Intervistë me klient',
  vezhgim: 'Vëzhgim në terren',
  oferte_cmimi: 'Ofertë çmimi nga furnitor',
  parapagim: 'Parapagim / porosi e konfirmuar',
  pagese: 'Pagesë e marrë',
  konkurrent: 'Konkurrent i verifikuar',
  kosto_e_verifikuar: 'Kosto e verifikuar',
  tjeter: 'Tjetër',
};

export const SKILL_IDS = new Set(SKILLS.map((s) => s.id));
export const ASSET_IDS = new Set(ASSETS.map((a) => a.id));

export function skillLabel(id: string): string {
  return SKILLS.find((s) => s.id === id)?.labelSq ?? id;
}

export function assetLabel(id: string): string {
  return ASSETS.find((a) => a.id === id)?.labelSq ?? id;
}
