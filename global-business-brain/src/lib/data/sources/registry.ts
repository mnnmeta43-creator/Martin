/**
 * Regjistri i burimeve të të dhënave dhe i lidhjeve zyrtare kombëtare.
 *
 * SOURCES describes every data source the app uses or has evaluated, with an honest
 * integration status: nothing has been reached live from the build environment yet, so the
 * API adapters are marked `integruar_pa_verifikim_live` until a refresh succeeds in production.
 *
 * OFFICIAL_LINKS are official homepages (business registries, statistics offices, central
 * banks, tax authorities) that the user must open and verify personally. The app never reads
 * them automatically; they back the "Kërkon verifikim lokal" guidance, not data values.
 * Global data portals (World Bank, IMF, OECD, ILOSTAT, UN) belong in SOURCES, not here.
 */
import type { Citation, CountryCode, DataSourceInfo } from '@/lib/domain/types';

/** Pseudo-URL for fictional demo data; never rendered as a clickable link. */
export const DEMO_SOURCE_URL = 'demo://global-business-brain/te-dhena-fiktive';
/** Pseudo-URL for values typed in by the user (manual FX rate, quotes). */
export const MANUAL_SOURCE_URL = 'app://global-business-brain/vlera-manuale';
/** Registry id used as `Citation.sourceId` for official national links. */
export const OFFICIAL_LINKS_SOURCE_ID = 'lidhje-zyrtare';
const OFFICIAL_LINKS_SOURCE_URL = 'app://global-business-brain/lidhje-zyrtare';

const WB_TERMS_URL = 'https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets';
const WB_DOCS_URL = 'https://datahelpdesk.worldbank.org/knowledgebase/topics/125589';
const WB_RATE_LIMIT_SQ =
  'Banka Botërore nuk publikon një kufi të fortë kërkesash; aplikacioni i ndan kërkesat në kohë dhe i riprovon me pritje në rritje (backoff) kur burimi nuk përgjigjet.';
const NOT_VERIFIED_LIVE_SQ =
  'Përshtatësi është testuar vetëm me shembuj që ndjekin formatin e dokumentuar; lidhja live ende nuk është verifikuar nga ky mjedis.';

export const SOURCES: DataSourceInfo[] = [
  {
    id: 'worldbank-wdi',
    nameSq: 'Banka Botërore — World Development Indicators (API v2)',
    publisher: 'World Bank',
    homepageUrl: 'https://data.worldbank.org',
    apiBaseUrl: 'https://api.worldbank.org/v2',
    docsUrl: WB_DOCS_URL,
    termsUrl: WB_TERMS_URL,
    license: 'CC BY 4.0',
    access: 'api_publike_falas',
    status: 'integruar_pa_verifikim_live',
    coverageSq:
      'Rreth 200 ekonomi, përfshirë Kosovën (XKX); seri kryesisht vjetore për rritjen, çmimet, financën, punën, popullsinë, tregtinë, sektorët, turizmin dhe digjitalizimin. Tajvani në përgjithësi nuk mbulohet.',
    cadenceSq:
      'Seritë janë vjetore dhe baza përditësohet disa herë në vit; vlera e fundit zakonisht i përket 1–2 viteve më parë.',
    refreshEveryHours: 168,
    rateLimitSq: WB_RATE_LIMIT_SQ,
    notesSq: [
      NOT_VERIFIED_LIVE_SQ,
      'Seritë e papunësisë dhe të pjesëmarrjes në punë janë vlerësime të modeluara të ILO-s, të publikuara përmes WDI.',
      'Kursi zyrtar vjetor (PA.NUS.FCRF) përdoret si rezervë për monedhat që nuk mbulohen nga kurset e referencës së BQE-së.',
    ],
  },
  {
    id: 'worldbank-countries',
    nameSq: 'Banka Botërore — API e vendeve (klasifikimi)',
    publisher: 'World Bank',
    homepageUrl: 'https://data.worldbank.org/country',
    apiBaseUrl: 'https://api.worldbank.org/v2/country',
    docsUrl: WB_DOCS_URL,
    termsUrl: WB_TERMS_URL,
    license: 'CC BY 4.0',
    access: 'api_publike_falas',
    status: 'integruar_pa_verifikim_live',
    coverageSq:
      'Lista e ekonomive të Bankës Botërore me rajonin, nivelin e të ardhurave dhe llojin e huadhënies; përfshin edhe agregate rajonale që aplikacioni i filtron.',
    cadenceSq: 'Klasifikimi sipas të ardhurave rishikohet zakonisht një herë në vit.',
    refreshEveryHours: 168,
    rateLimitSq: WB_RATE_LIMIT_SQ,
    notesSq: [NOT_VERIFIED_LIVE_SQ],
  },
  {
    id: 'imf-datamapper',
    nameSq: 'FMN — DataMapper API v1 (bazuar në World Economic Outlook)',
    publisher: 'International Monetary Fund',
    homepageUrl: 'https://www.imf.org/external/datamapper',
    apiBaseUrl: 'https://www.imf.org/external/datamapper/api/v1',
    termsUrl: 'https://www.imf.org/en/About/copyright-and-terms',
    access: 'api_publike_falas',
    status: 'integruar_pa_verifikim_live',
    coverageSq:
      'Shumica e vendeve anëtare të FMN-së, përfshirë Kosovën (kodi UVK); rritja reale e PBB-së, inflacioni dhe papunësia (jo për të gjitha vendet).',
    cadenceSq:
      'Përditësohet me botimet e World Economic Outlook (zakonisht në prill dhe tetor). Përmban parashikime për vitin aktual dhe vitet e ardhshme.',
    refreshEveryHours: 168,
    notesSq: [
      NOT_VERIFIED_LIVE_SQ,
      'Vlerat për vitin aktual dhe vitet e ardhshme janë parashikime dhe shfaqen gjithmonë me etiketën “parashikim”, jo si matje.',
      'Rregull konservativ i aplikacionit: çdo vit i barabartë me vitin kalendarik aktual ose më vonë shënohet “parashikim”. WEO i shënon vlerësimet që nga viti i fundit me të dhëna aktuale të secilit vend, i cili mund të jetë më i hershëm, ndaj vlerat e viteve të fundit mund të jenë ende vlerësime të FMN-së.',
    ],
  },
  {
    id: 'ecb-frankfurter',
    nameSq: 'Kurset e referencës së euros nga BQE (përmes API-së Frankfurter)',
    publisher: 'European Central Bank (të dhënat); Frankfurter (API me burim të hapur)',
    homepageUrl:
      'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html',
    apiBaseUrl: 'https://api.frankfurter.dev/v1',
    access: 'api_publike_falas',
    status: 'integruar_pa_verifikim_live',
    coverageSq:
      'Rreth 30 monedha kundrejt euros. Disa monedha të rajonit, p.sh. ALL, MKD dhe RSD, NUK mbulohen: për to aplikacioni përdor mesataren vjetore të Bankës Botërore (PA.NUS.FCRF) ose një kurs të futur manualisht.',
    cadenceSq: 'BQE publikon kurset e referencës një herë në ditë pune.',
    refreshEveryHours: 24,
    requiresEnv: [],
    notesSq: [
      NOT_VERIFIED_LIVE_SQ,
      'Adresa bazë mund të ndryshohet me ndryshoren opsionale FX_API_BASE_URL; nuk kërkohet çelës.',
      'Kurset e referencës janë vetëm informuese; banka juaj aplikon kursin e vet të blerjes/shitjes.',
    ],
  },
  {
    id: 'oecd-sdmx',
    nameSq: 'OECD Data Explorer / SDMX API',
    publisher: 'OECD',
    homepageUrl: 'https://data-explorer.oecd.org',
    apiBaseUrl: 'https://sdmx.oecd.org/public/rest',
    access: 'api_publike_falas',
    status: 'vleresuar_jo_integruar',
    coverageSq: 'Kryesisht vendet anëtare dhe partnere të OECD-së.',
    cadenceSq: 'Ndryshon sipas bazës së të dhënave (mujore, tremujore ose vjetore).',
    notesSq: [
      'API publike, por mbulimi i kufizuar për vendet që nuk janë anëtare e bën më pak të dobishme për synimin global të aplikacionit; nuk është integruar në këtë version.',
    ],
  },
  {
    id: 'ilostat',
    nameSq: 'ILOSTAT (Organizata Ndërkombëtare e Punës)',
    publisher: 'International Labour Organization',
    homepageUrl: 'https://ilostat.ilo.org',
    access: 'api_publike_falas',
    status: 'vleresuar_jo_integruar',
    coverageSq: 'Statistika të tregut të punës për shumicën e vendeve, me mbulim të ndryshëm sipas treguesit.',
    cadenceSq: 'Ndryshon sipas treguesit dhe vendit.',
    notesSq: [
      'Ofron API SDMX. Burim kandidat për pagat (fitimet mesatare mujore nominale); nuk është integruar në këtë version.',
      'Seritë e papunësisë që përdor aplikacioni janë vlerësime të modeluara të ILO-s, të publikuara përmes WDI të Bankës Botërore.',
    ],
  },
  {
    id: 'un-comtrade',
    nameSq: 'UN Comtrade (tregtia ndërkombëtare e mallrave)',
    publisher: 'United Nations Statistics Division',
    homepageUrl: 'https://comtradeplus.un.org',
    access: 'api_me_celes',
    status: 'kerkon_celes',
    coverageSq: 'Tregti mallrash sipas produktit dhe partnerit për shumicën e vendeve.',
    cadenceSq: 'Mujore dhe vjetore, sipas raportimit të vendeve.',
    notesSq: [
      'API e plotë kërkon çelës abonimi; nuk është integruar në këtë version dhe nuk ka përshtatës.',
    ],
  },
  {
    id: 'undata',
    nameSq: 'UNdata',
    publisher: 'United Nations Statistics Division',
    homepageUrl: 'https://data.un.org',
    access: 'shkarkim_masiv',
    status: 'vleresuar_jo_integruar',
    coverageSq: 'Përmbledhje e bazave statistikore të sistemit të OKB-së për shumicën e vendeve.',
    cadenceSq: 'Ndryshon sipas bazës së të dhënave.',
    notesSq: ['Vlerësuar si burim referimi; nuk është integruar në këtë version.'],
  },
  {
    id: 'world-countries-pkg',
    nameSq: 'Paketa npm “world-countries” (lista e vendeve)',
    publisher: 'mledoze/countries',
    homepageUrl: 'https://github.com/mledoze/countries',
    license: 'ODbL 1.0',
    access: 'paketë_e_te_dhenave',
    status: 'integruar',
    coverageSq:
      'Lista e vendeve dhe territoreve me kodet ISO, anëtarësinë në OKB, rajonin, monedhat dhe kryeqytetin.',
    cadenceSq: 'Përditësohet me versionet e paketës; aplikacioni përdor versionin e instaluar.',
    notesSq: [
      'Paketa e shënon Selinë e Shenjtë si anëtare të OKB-së; aplikacioni e korrigjon në shtet vëzhgues (193 anëtarë).',
    ],
  },
  {
    id: 'i18n-iso-countries-pkg',
    nameSq: 'Paketa npm “i18n-iso-countries” (emrat shqip të vendeve)',
    publisher: 'michaelwittig/node-i18n-iso-countries',
    homepageUrl: 'https://github.com/michaelwittig/node-i18n-iso-countries',
    license: 'MIT',
    access: 'paketë_e_te_dhenave',
    status: 'integruar',
    coverageSq: 'Emrat e vendeve në shqip sipas kodeve ISO 3166-1.',
    cadenceSq: 'Përditësohet me versionet e paketës.',
    notesSq: [
      'Disa emra janë përshtatur në aplikacion (p.sh. “Kosova”, “Maqedonia e Veriut”) për qartësi dhe saktësi.',
    ],
  },
  {
    id: 'manual',
    nameSq: 'Vlera të futura nga përdoruesi',
    publisher: 'Përdoruesi',
    homepageUrl: MANUAL_SOURCE_URL,
    access: 'faqe_zyrtare',
    status: 'integruar',
    coverageSq: 'Kurs këmbimi manual, oferta çmimesh dhe kosto të verifikuara nga vetë përdoruesi.',
    cadenceSq: 'Sa herë që përdoruesi i përditëson.',
    notesSq: ['Saktësia varet nga burimi që përdoruesi ka verifikuar; aplikacioni e shënon gjithmonë si vlerë manuale.'],
  },
  {
    id: OFFICIAL_LINKS_SOURCE_ID,
    nameSq: 'Lidhje zyrtare kombëtare (për verifikim manual)',
    publisher: 'Institucionet zyrtare të secilit vend',
    homepageUrl: OFFICIAL_LINKS_SOURCE_URL,
    access: 'faqe_zyrtare',
    status: 'lidhje_zyrtare',
    coverageSq:
      'Faqet kryesore të regjistrave të bizneseve, institucioneve të statistikave, bankave qendrore dhe administratave tatimore për një listë të kufizuar vendesh.',
    cadenceSq: 'Lidhjet kontrollohen manualisht; aplikacioni nuk i lexon faqet automatikisht.',
    notesSq: ['Kërkon verifikim lokal: hapni faqen dhe kontrolloni vetë kërkesat aktuale.'],
  },
  {
    id: 'demo',
    nameSq: 'Të dhëna DEMO (fiktive)',
    publisher: 'Global Business Brain',
    homepageUrl: DEMO_SOURCE_URL,
    access: 'demo',
    status: 'demo',
    coverageSq: 'Vetëm ekonomitë fiktive ZZA, ZZB dhe ZZC.',
    cadenceSq: 'Gjenerohen në mënyrë deterministe; nuk përfaqësojnë asnjë vend real.',
    requiresEnv: ['DATA_MODE'],
    notesSq: [
      'Të dhënat janë fiktive, aktivizohen vetëm me DATA_MODE=demo dhe nuk përdoren kurrë për rekomandime reale.',
    ],
  },
];

const SOURCE_BY_ID = new Map(SOURCES.map((s) => [s.id, s]));

export function getSource(id: string): DataSourceInfo | undefined {
  return SOURCE_BY_ID.get(id);
}

/** True for real web URLs; internal pseudo-URLs (demo://, app://) must not be rendered as links. */
export function isExternalUrl(url: string): boolean {
  return /^https:\/\//.test(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// Official national links
// ─────────────────────────────────────────────────────────────────────────────

export type OfficialLinkKind =
  | 'regjistrim_biznesi'
  | 'statistika'
  | 'banka_qendrore'
  | 'tatime'
  | 'portal_qeveritar'
  | 'nderkombetare';

export interface OfficialLink {
  /** Canonical country code, or "EU" for links that apply to every EU member state. */
  countryCode: CountryCode | 'EU';
  kind: OfficialLinkKind;
  nameSq: string;
  url: string;
  noteSq: string;
  /** No automated checker exists yet, so this stays null until a human verifies the link. */
  lastCheckedAt: null;
}

export const OFFICIAL_LINK_KIND_LABELS: Record<OfficialLinkKind, string> = {
  regjistrim_biznesi: 'Regjistrimi i biznesit',
  statistika: 'Statistika zyrtare',
  banka_qendrore: 'Banka qendrore',
  tatime: 'Tatimet',
  portal_qeveritar: 'Portal qeveritar',
  nderkombetare: 'Nivel ndërkombëtar / BE',
};

export const OFFICIAL_LINK_NOTE_SQ =
  'Kërkon verifikim lokal: aplikacioni nuk i lexon automatikisht këto faqe. Hapeni faqen dhe verifikoni vetë kërkesat aktuale.';

/** The 27 EU member states (since 2020), used to attach the EU-wide links. */
export const EU_MEMBER_CODES: ReadonlySet<CountryCode> = new Set([
  'AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'IRL',
  'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD', 'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'SWE',
]);

type LinkSeed = [kind: OfficialLinkKind, nameSq: string, url: string];

const LINK_SEEDS: Record<CountryCode | 'EU', LinkSeed[]> = {
  ALB: [
    ['regjistrim_biznesi', 'Qendra Kombëtare e Biznesit (QKB)', 'https://qkb.gov.al'],
    ['statistika', 'Instituti i Statistikave (INSTAT)', 'https://www.instat.gov.al'],
    ['banka_qendrore', 'Banka e Shqipërisë', 'https://www.bankofalbania.org'],
    ['tatime', 'Drejtoria e Përgjithshme e Tatimeve', 'https://www.tatime.gov.al'],
    ['portal_qeveritar', 'Portali qeveritar e-Albania', 'https://e-albania.al'],
  ],
  XKX: [
    ['regjistrim_biznesi', 'Agjencia e Regjistrimit të Bizneseve të Kosovës (ARBK)', 'https://arbk.rks-gov.net'],
    ['statistika', 'Agjencia e Statistikave të Kosovës (ASK)', 'https://ask.rks-gov.net'],
    ['banka_qendrore', 'Banka Qendrore e Republikës së Kosovës (BQK)', 'https://bqk-kos.org'],
    ['tatime', 'Administrata Tatimore e Kosovës (ATK)', 'https://www.atk-ks.org'],
  ],
  MKD: [
    ['regjistrim_biznesi', 'Regjistri Qendror i Maqedonisë së Veriut', 'https://www.crm.com.mk'],
    ['statistika', 'Enti Shtetëror i Statistikës i Maqedonisë së Veriut', 'https://www.stat.gov.mk'],
    ['banka_qendrore', 'Banka qendrore e Maqedonisë së Veriut (NBRM)', 'https://www.nbrm.mk'],
    ['tatime', 'Administrata tatimore e Maqedonisë së Veriut (UJP)', 'https://www.ujp.gov.mk'],
  ],
  MNE: [
    ['statistika', 'Instituti i statistikave i Malit të Zi (MONSTAT)', 'https://www.monstat.org'],
    ['banka_qendrore', 'Banka Qendrore e Malit të Zi', 'https://www.cbcg.me'],
  ],
  SRB: [
    ['regjistrim_biznesi', 'Agjencia e regjistrave të bizneseve të Serbisë (APR)', 'https://www.apr.gov.rs'],
    ['statistika', 'Instituti i statistikave i Serbisë', 'https://www.stat.gov.rs'],
    ['banka_qendrore', 'Banka Kombëtare e Serbisë', 'https://www.nbs.rs'],
  ],
  ITA: [
    ['regjistrim_biznesi', 'Regjistri i ndërmarrjeve i Italisë (Registro Imprese)', 'https://www.registroimprese.it'],
    ['statistika', 'Instituti Kombëtar i Statistikave i Italisë (ISTAT)', 'https://www.istat.it'],
    ['banka_qendrore', 'Banka e Italisë (Banca d’Italia)', 'https://www.bancaditalia.it'],
  ],
  DEU: [
    ['regjistrim_biznesi', 'Regjistri i ndërmarrjeve i Gjermanisë (Unternehmensregister)', 'https://www.unternehmensregister.de'],
    ['statistika', 'Zyra Federale e Statistikave e Gjermanisë (Destatis)', 'https://www.destatis.de'],
    ['banka_qendrore', 'Banka Federale Gjermane (Deutsche Bundesbank)', 'https://www.bundesbank.de'],
  ],
  GRC: [
    ['portal_qeveritar', 'Portali qeveritar për bizneset në Greqi (Business Portal)', 'https://www.businessportal.gr'],
    ['statistika', 'Autoriteti Statistikor Helen (ELSTAT)', 'https://www.statistics.gr'],
    ['banka_qendrore', 'Banka e Greqisë', 'https://www.bankofgreece.gr'],
  ],
  GBR: [
    ['regjistrim_biznesi', 'Companies House (regjistri i shoqërive në Mbretërinë e Bashkuar)', 'https://www.gov.uk/government/organisations/companies-house'],
    ['statistika', 'Zyra për Statistikat Kombëtare (ONS)', 'https://www.ons.gov.uk'],
    ['banka_qendrore', 'Banka e Anglisë (Bank of England)', 'https://www.bankofengland.co.uk'],
    ['tatime', 'Administrata tatimore dhe doganore e Mbretërisë së Bashkuar (HMRC)', 'https://www.gov.uk/government/organisations/hm-revenue-customs'],
  ],
  USA: [
    ['portal_qeveritar', 'Administrata e Bizneseve të Vogla e SHBA-së (SBA)', 'https://www.sba.gov'],
    ['statistika', 'Byroja e Regjistrimit të Popullsisë e SHBA-së (U.S. Census Bureau)', 'https://www.census.gov'],
    ['statistika', 'Byroja e Statistikave të Punës e SHBA-së (BLS)', 'https://www.bls.gov'],
    ['banka_qendrore', 'Rezerva Federale e SHBA-së (Federal Reserve)', 'https://www.federalreserve.gov'],
    ['tatime', 'Shërbimi i të Ardhurave të Brendshme i SHBA-së (IRS)', 'https://www.irs.gov'],
  ],
  CHE: [
    ['regjistrim_biznesi', 'Zefix — indeksi qendror i regjistrave tregtarë të Zvicrës', 'https://www.zefix.ch'],
    ['statistika', 'Zyra Federale e Statistikave e Zvicrës', 'https://www.bfs.admin.ch'],
    ['banka_qendrore', 'Banka Kombëtare Zvicerane (SNB)', 'https://www.snb.ch'],
  ],
  AUT: [
    ['statistika', 'Statistika Austria', 'https://www.statistik.at'],
    ['banka_qendrore', 'Banka Kombëtare e Austrisë (OeNB)', 'https://www.oenb.at'],
  ],
  FRA: [
    ['statistika', 'Instituti Kombëtar i Statistikave dhe Studimeve Ekonomike i Francës (INSEE)', 'https://www.insee.fr'],
    ['banka_qendrore', 'Banka e Francës (Banque de France)', 'https://www.banque-france.fr'],
  ],
  TUR: [
    ['statistika', 'Instituti i Statistikave të Turqisë (TÜİK)', 'https://www.tuik.gov.tr'],
    ['banka_qendrore', 'Banka Qendrore e Republikës së Turqisë (TCMB)', 'https://www.tcmb.gov.tr'],
  ],
  EU: [
    ['nderkombetare', 'Your Europe — informacion zyrtar i BE-së për bizneset', 'https://europa.eu/youreurope/business/index_en.htm'],
    ['nderkombetare', 'Eurostat — zyra statistikore e Bashkimit Evropian', 'https://ec.europa.eu/eurostat'],
    ['nderkombetare', 'Banka Qendrore Evropiane (BQE)', 'https://www.ecb.europa.eu'],
  ],
};

export const OFFICIAL_LINKS: OfficialLink[] = Object.entries(LINK_SEEDS).flatMap(([countryCode, seeds]) =>
  seeds.map(([kind, nameSq, url]) => ({
    countryCode,
    kind,
    nameSq,
    url,
    noteSq: OFFICIAL_LINK_NOTE_SQ,
    lastCheckedAt: null,
  })),
);

function toCitation(link: OfficialLink): Citation {
  return {
    sourceId: OFFICIAL_LINKS_SOURCE_ID,
    sourceName: link.nameSq,
    url: link.url,
    countryCode: link.countryCode,
    retrievedAt: null,
    noteSq: link.noteSq,
  };
}

/** Raw links for one country, plus the EU-wide ones when the country is an EU member. */
export function getOfficialLinkEntries(countryCode: CountryCode): OfficialLink[] {
  const code = countryCode.toUpperCase();
  const own = OFFICIAL_LINKS.filter((l) => l.countryCode === code);
  const eu = EU_MEMBER_CODES.has(code) ? OFFICIAL_LINKS.filter((l) => l.countryCode === 'EU') : [];
  return [...own, ...eu];
}

/** Official links as citations (country first, then EU-wide). Empty when none are curated. */
export function getOfficialLinks(countryCode: CountryCode): Citation[] {
  return getOfficialLinkEntries(countryCode).map(toCitation);
}
