/**
 * Katalogu i treguesve makroekonomikë që ndjek aplikacioni.
 *
 * Exactly one IndicatorDefinition per code in INDICATOR_CODES (enforced by a unit test).
 * Each definition records the upstream source code, the unit and value basis (nominal vs
 * real, % vs ratio), the expected publication lag used by the freshness logic, and a plain
 * Albanian explanation. Macro indicators are CONTEXT for an idea, never proof that a
 * business will work: every explanation ends in the local evidence still needed.
 */
import type { IndicatorDefinition } from '@/lib/domain/types';
import type { IndicatorCode } from '@/lib/data/indicatorCodes';

type Def = Omit<IndicatorDefinition, 'code' | 'sourceId' | 'sourceCode' | 'periodicity' | 'expectedLagYears'> &
  Partial<Pick<IndicatorDefinition, 'periodicity' | 'expectedLagYears'>>;

/** World Bank WDI series: annual, typically published with a ~2-year lag. */
function wb(code: IndicatorCode, sourceCode: string, def: Def): IndicatorDefinition {
  return { code, sourceId: 'worldbank-wdi', sourceCode, periodicity: 'vjetore', expectedLagYears: 2, ...def };
}

/** IMF DataMapper (WEO) series: latest actual year is usually last year; later years are projections. */
function imf(code: IndicatorCode, sourceCode: string, def: Def): IndicatorDefinition {
  return {
    code,
    sourceId: 'imf-datamapper',
    sourceCode,
    periodicity: 'vjetore',
    expectedLagYears: 1,
    isProjectionSource: true,
    ...def,
  };
}

// Shared warnings, kept in one place so the wording stays consistent across indicators.
const PP = 'Ndryshimet maten në pikë përqindjeje: nga 10% në 12% është +2 p.p., jo +2%.';
const AVG = 'Mesatarja kombëtare fsheh dallime të mëdha mes qyteteve, rajoneve dhe grupeve.';
const ILO_MODELLED =
  'Është vlerësim i modeluar i ILO-s (i publikuar nga Banka Botërore), jo numërim i drejtpërdrejtë; për vendet me pak anketa mund të jetë i pasaktë.';
const IMF_PROJECTION =
  'Vlerat për vitin aktual dhe vitet e ardhshme janë parashikime (“parashikim”), jo matje, dhe rishikohen disa herë në vit.';

export const INDICATORS: IndicatorDefinition[] = [
  // ── Rritja dhe të ardhurat ────────────────────────────────────────────────
  wb('gdp_growth', 'NY.GDP.MKTP.KD.ZG', {
    nameSq: 'Rritja reale e PBB-së',
    nameEn: 'GDP growth (annual %)',
    unit: 'perqind',
    unitLabelSq: '% në vit (real)',
    basis: 'real',
    category: 'rritja',
    explain: {
      whatItMeasuresSq:
        'Sa u rrit (ose u tkurr) gjatë vitit vlera e të gjitha mallrave dhe shërbimeve të prodhuara në vend, pasi hiqet efekti i rritjes së çmimeve.',
      whyItMattersSq:
        'Kur ekonomia rritet, zakonisht rriten edhe të ardhurat, punësimi dhe shpenzimet e familjeve e bizneseve; kur tkurret, klientët kursejnë dhe pagesat vonohen.',
      affectedBusinessesSq:
        'Pothuajse të gjitha, por më shumë ato që shesin gjëra që njerëzit mund t’i shtyjnë: restorante, mobilie, rinovime, shërbime për biznese, ndërtim.',
      mechanismSq:
        'Më shumë prodhim → më shumë punë dhe të ardhura → më shumë shpenzime për mallra dhe shërbime jo-thelbësore. Në tkurrje, zinxhiri punon në drejtim të kundërt.',
      extraEvidenceSq:
        'Kontrolloni nëse rritja ndodh në sektorin dhe qytetin tuaj: flisni me klientë të mundshëm, shikoni nëse bizneset e ngjashme po punësojnë dhe nëse kërkesa për produktin tuaj po rritet.',
      analogySq:
        'Si shpejtësia e një makine: tregon sa shpejt ecën ekonomia, jo sa e madhe është apo ku ndodheni ju brenda saj.',
      cautionSq: `Është rritje reale (pa inflacion), në % në vit. Një vit i vetëm mund të jetë thjesht rikuperim pas një rënieje, ndaj shikoni disa vite. ${AVG}`,
    },
  }),
  wb('gdp_per_capita_usd', 'NY.GDP.PCAP.CD', {
    nameSq: 'PBB për frymë (USD aktuale)',
    nameEn: 'GDP per capita (current US$)',
    unit: 'monedhe',
    unitLabelSq: 'USD aktuale për banor',
    currency: 'USD',
    basis: 'nominal',
    category: 'te_ardhurat',
    explain: {
      whatItMeasuresSq:
        'Vlera e prodhimit të vendit e ndarë për çdo banor, e shprehur në dollarë amerikanë me çmimet dhe kursin e këmbimit të atij viti.',
      whyItMattersSq:
        'Jep një ide të përafërt për nivelin e të ardhurave dhe për aftësinë për të blerë mallra të importuara ose të çmuara në dollarë.',
      affectedBusinessesSq:
        'Bizneset që shesin produkte të importuara, shërbime premium, softuer ose abonime me çmim ndërkombëtar, si dhe ato që synojnë eksportin.',
      mechanismSq:
        'Të ardhura më të larta në dollarë → më shumë mundësi për të paguar çmime të krahasueshme me tregjet ndërkombëtare.',
      extraEvidenceSq:
        'Verifikoni pagat dhe çmimet lokale në segmentin që synoni dhe pyesni klientë konkretë sa paguajnë sot për zgjidhje të ngjashme.',
      analogySq:
        'Si të ndash një tortë të madhe në feta të barabarta: tregon madhësinë mesatare të fetës, jo sa merr realisht secili.',
      cautionSq:
        'Është nominale në USD: lëvizjet e kursit të këmbimit mund ta rrisin ose ta ulin shifrën edhe kur ekonomia vendase nuk ka ndryshuar. PBB-ja për frymë nuk është paga mesatare dhe nuk tregon si shpërndahen të ardhurat.',
    },
  }),
  wb('gdp_per_capita_ppp', 'NY.GDP.PCAP.PP.CD', {
    nameSq: 'PBB për frymë sipas fuqisë blerëse (PPP)',
    nameEn: 'GDP per capita, PPP (current international $)',
    unit: 'monedhe',
    unitLabelSq: 'dollarë ndërkombëtarë aktualë (PPP) për banor',
    currency: 'INTL$',
    basis: 'nominal',
    category: 'te_ardhurat',
    explain: {
      whatItMeasuresSq:
        'PBB-ja për frymë e rregulluar sipas dallimeve në çmime mes vendeve (paritetet e fuqisë blerëse), e shprehur në “dollarë ndërkombëtarë” me çmimet aktuale.',
      whyItMattersSq:
        'Lejon një krahasim më të drejtë të standardit të jetesës mes vendeve, sepse një dollar blen më shumë në vendet me çmime më të ulëta.',
      affectedBusinessesSq:
        'Bizneset që shesin shërbime dhe produkte lokale (ushqim, kujdes, riparime, edukim), çmimi i të cilave ndjek nivelin vendas të çmimeve.',
      mechanismSq:
        'Tregon sa mallra dhe shërbime vendase mund të blejë një banor mesatar; për shërbimet lokale kjo ka më shumë rëndësi sesa shifra në USD.',
      extraEvidenceSq:
        'Krahasojeni me çmimet që paguajnë realisht klientët tuaj dhe me pagat në zonën ku do të punoni.',
      analogySq:
        'Si të krahasosh shportat e blerjeve në vend të çmimeve në etiketë: rëndësi ka sa mbushet shporta, jo numri në kupon.',
      cautionSq: `“Dollari ndërkombëtar” nuk është kurs këmbimi: nuk mund ta përdorni për të konvertuar çmime. Vlerat janë vlerësime që rishikohen kur dalin anketa të reja çmimesh. ${AVG}`,
    },
  }),
  wb('household_consumption_growth', 'NE.CON.PRVT.KD.ZG', {
    nameSq: 'Rritja reale e konsumit të familjeve',
    nameEn: 'Households and NPISHs final consumption expenditure (annual % growth)',
    unit: 'perqind',
    unitLabelSq: '% në vit (real)',
    basis: 'real',
    category: 'rritja',
    explain: {
      whatItMeasuresSq:
        'Ndryshimi vjetor real (pa inflacion) i shpenzimeve të familjeve dhe të organizatave jofitimprurëse që u shërbejnë familjeve.',
      whyItMattersSq:
        'Konsumi i familjeve është pjesa më e madhe e kërkesës për shumicën e bizneseve që shesin te konsumatori final.',
      affectedBusinessesSq:
        'Tregtia me pakicë, ushqimi dhe pijet, shërbimet personale, argëtimi, mobiliet, telefonat dhe shërbimet për shtëpinë.',
      mechanismSq:
        'Kur familjet shpenzojnë më shumë në terma realë, rritet volumi i shitjeve te konsumatori; kur konsumi bie, shpenzimet jo-thelbësore priten të parat.',
      extraEvidenceSq:
        'Mblidhni prova lokale: lëvizjen e klientëve në zonë, shitjet e bizneseve të ngjashme, sa shpesh blejnë klientët e mundshëm dhe sa shpenzojnë.',
      analogySq:
        'Si rrjedha e ujit në një lumë: tregon nëse po vjen më shumë apo më pak ujë drejt mullinjve (bizneseve) gjatë rrugës.',
      cautionSq: `Është në % në vit dhe reale. Remitancat dhe kreditë mund ta rrisin konsumin edhe kur të ardhurat vendase nuk rriten. ${AVG}`,
    },
  }),

  // ── Çmimet ───────────────────────────────────────────────────────────────
  wb('inflation_cpi', 'FP.CPI.TOTL.ZG', {
    nameSq: 'Inflacioni (çmimet e konsumit)',
    nameEn: 'Inflation, consumer prices (annual %)',
    unit: 'perqind',
    unitLabelSq: '% në vit',
    basis: 'norme',
    category: 'cmimet',
    explain: {
      whatItMeasuresSq:
        'Sa u rritën mesatarisht gjatë vitit çmimet e një shporte mallrash dhe shërbimesh që blejnë familjet.',
      whyItMattersSq:
        'Inflacioni i lartë ul fuqinë blerëse të klientëve, rrit kostot tuaja dhe e bën më të vështirë planifikimin e çmimeve.',
      affectedBusinessesSq:
        'Bizneset me marzhe të ulëta (ushqim, tregti), ato me kontrata me çmim fiks, ato që importojnë lëndë të para dhe ato që shesin me këste.',
      mechanismSq:
        'Çmimet rriten → kostot e furnizimit, qirasë dhe pagave rriten → nëse nuk mund ta rrisni çmimin aq shpejt, marzhi tkurret dhe klientët kalojnë te produktet më të lira.',
      extraEvidenceSq:
        'Merrni oferta aktuale nga furnitorët, kontrolloni sa shpesh ndryshojnë çmimet e inputeve tuaja dhe testoni nëse klientët pranojnë një rritje çmimi.',
      analogySq:
        'Si një rezervuar që rrjedh ngadalë: paratë mbeten të njëjta në numër, por çdo vit mbushin më pak.',
      cautionSq: `Është mesatare për shportën e familjeve; kostot e biznesit tuaj mund të rriten shumë më shpejt ose më ngadalë. Rënia e inflacionit nuk do të thotë që çmimet ulen, por që rriten më ngadalë. ${PP}`,
    },
  }),
  wb('price_level_ratio', 'PA.NUS.PPPC.RF', {
    nameSq: 'Niveli i çmimeve krahasuar me SHBA-në',
    nameEn: 'Price level ratio of PPP conversion factor (GDP) to market exchange rate',
    unit: 'raport',
    unitLabelSq: 'raport (SHBA = 1)',
    basis: 'raport',
    category: 'cmimet',
    explain: {
      whatItMeasuresSq:
        'Raporti mes nivelit të çmimeve në vend dhe atij në SHBA, i llogaritur nga faktori i konvertimit PPP dhe kursi i tregut. Vlera rreth 1 do të thotë nivel çmimesh i ngjashëm me SHBA-në; nën 1 do të thotë që vendi është më i lirë, mbi 1 më i shtrenjtë.',
      whyItMattersSq:
        'Ndihmon të përshtatni supozimet e kostove dhe çmimeve: puna dhe shërbimet lokale zakonisht kushtojnë më pak në vendet me raport të ulët.',
      affectedBusinessesSq:
        'Bizneset me shumë punë njerëzore dhe qira (shërbime, kujdes, riparime, mikpritje), si dhe ato që u shesin klientëve jashtë vendit duke përfituar nga kostot më të ulëta.',
      mechanismSq:
        'Raport i ulët → paga dhe qira më të ulëta në dollarë → kosto më të ulëta për shërbimet lokale, por edhe çmime më të ulëta që mund të paguajnë klientët vendas.',
      extraEvidenceSq:
        'Merrni oferta reale për qiranë, pagat dhe inputet kryesore në qytetin tuaj; raporti është mesatare kombëtare për gjithë ekonominë.',
      analogySq:
        'Si një peshore që krahason të njëjtën shportë në dy tregje: nëse shigjeta tregon 0,5, shporta kushton rreth gjysmën e asaj në SHBA.',
      cautionSq:
        'Nuk vlen njësoj për çdo produkt: mallrat e importuara (telefona, makineri) shpesh kushtojnë afërsisht njësoj kudo. Ndikohet nga lëvizjet e kursit të këmbimit, dhe kryeqyteti zakonisht është më i shtrenjtë se mesatarja.',
    },
  }),

  // ── Financa ──────────────────────────────────────────────────────────────
  wb('lending_rate', 'FR.INR.LEND', {
    nameSq: 'Norma e interesit të kredisë',
    nameEn: 'Lending interest rate (%)',
    unit: 'perqind',
    unitLabelSq: '% në vit',
    basis: 'norme',
    category: 'financa',
    explain: {
      whatItMeasuresSq:
        'Norma e interesit që bankat u kërkojnë zakonisht klientëve për kreditë afatshkurtra dhe afatmesme, sipas përkufizimit të secilit vend.',
      whyItMattersSq:
        'Tregon sa kushton të marrësh para hua për të nisur ose zgjeruar një biznes, dhe sa u kushton klientëve tuaj blerja me kredi.',
      affectedBusinessesSq:
        'Bizneset që kanë nevojë për kredi për pajisje, inventar ose lokal, si dhe ato që shesin mallra të shtrenjta që blihen me kredi (makina, mobilie, rinovime).',
      mechanismSq:
        'Interes më i lartë → këste më të larta → më pak projekte që dalin me fitim dhe më pak blerje me kredi; interesi më i ulët e lehtëson financimin.',
      extraEvidenceSq:
        'Kërkoni oferta konkrete nga 2–3 banka ose institucione mikrofinance për shumën dhe afatin tuaj; normat për bizneset e vogla dhe të reja janë shpesh më të larta se mesatarja.',
      analogySq:
        'Si qiraja e parave: sa më e lartë, aq më shumë duhet të fitoni nga përdorimi i tyre që t’ia vlejë.',
      cautionSq: `Përkufizimi ndryshon nga vendi në vend, ndaj krahasimet mes vendeve janë të përafërta. Nuk përfshin tarifat dhe kolateralin, dhe shumë vende nuk e raportojnë këtë seri. ${PP}`,
    },
  }),
  wb('real_interest_rate', 'FR.INR.RINR', {
    nameSq: 'Norma reale e interesit',
    nameEn: 'Real interest rate (%)',
    unit: 'perqind',
    unitLabelSq: '% në vit (real)',
    basis: 'real',
    category: 'financa',
    explain: {
      whatItMeasuresSq:
        'Norma e interesit të kredisë pasi hiqet inflacioni, i matur me deflatorin e PBB-së.',
      whyItMattersSq:
        'Tregon koston “e vërtetë” të huamarrjes: një interes 10% me inflacion 8% është shumë më i lehtë sesa 10% me inflacion 1%.',
      affectedBusinessesSq:
        'Bizneset që varen nga kreditë (pajisje, ndërtim, inventar i madh) dhe ato që shesin me pagesa me këste.',
      mechanismSq:
        'Normë reale e lartë → borxhi rëndon më shumë me kalimin e kohës → bizneset huazojnë më pak. Një normë reale negative e bën huamarrjen më tërheqëse, por shpesh tregon inflacion të lartë.',
      extraEvidenceSq:
        'Krahasoni ofertën reale të kredisë me rritjen që prisni në çmimet tuaja të shitjes, jo me inflacionin mesatar.',
      analogySq:
        'Si të ecësh në një shirit lëvizës: inflacioni është shiriti, ndërsa norma reale tregon sa shpejt ecni realisht përpara.',
      cautionSq: `Mund të jetë negative. Llogaritet nga mesataret vjetore dhe deflatori i PBB-së, jo nga inflacioni që ndien një familje. ${PP}`,
    },
  }),
  wb('private_credit_gdp', 'FS.AST.PRVT.GD.ZS', {
    nameSq: 'Kredia për sektorin privat',
    nameEn: 'Domestic credit to private sector (% of GDP)',
    unit: 'perqind',
    unitLabelSq: '% e PBB-së',
    basis: 'raport',
    category: 'financa',
    explain: {
      whatItMeasuresSq:
        'Kreditë dhe financimet e tjera që sektori financiar u jep bizneseve dhe familjeve private, si përqindje e PBB-së.',
      whyItMattersSq:
        'Tregon sa përdoret kredia: në vendet me kredi të ulët, shumë biznese dhe familje financohen me kursime ose nga të afërmit.',
      affectedBusinessesSq:
        'Bizneset që kanë nevojë për financim fillestar, ato që shesin mallra të shtrenjta me këste dhe shërbimet financiare ose kontabël për biznese të vogla.',
      mechanismSq:
        'Më shumë kredi në dispozicion → më shumë investime dhe blerje të mëdha; kredi e kufizuar → nisje me kapital vetjak dhe rritje më e ngadaltë.',
      extraEvidenceSq:
        'Pyesni bankat dhe institucionet mikrofinanciare nëse financojnë biznese të reja si i juaji, çfarë kolaterali kërkojnë dhe sa zgjat miratimi.',
      analogySq:
        'Si tubat e ujitjes në një fushë: sa më shumë tuba, aq më shumë ujë (para) arrin te bimët (bizneset).',
      cautionSq: `Kredia e lartë nuk është gjithmonë shenjë e mirë: mund të tregojë borxh të tepërt, dhe rritja shumë e shpejtë e kredisë ndonjëherë paralajmëron rrezik. ${PP}`,
    },
  }),
  wb('account_ownership', 'FX.OWN.TOTL.ZS', {
    nameSq: 'Të rriturit me llogari financiare',
    nameEn:
      'Account ownership at a financial institution or with a mobile-money-service provider (% of population ages 15+)',
    unit: 'perqind',
    unitLabelSq: '% e popullsisë 15+ vjeç',
    basis: 'raport',
    category: 'financa',
    periodicity: 'e_parregullt',
    expectedLagYears: 3,
    explain: {
      whatItMeasuresSq:
        'Përqindja e të rriturve (15 vjeç e lart) që kanë një llogari në një institucion financiar ose në një shërbim parash me celular, sipas anketës Global Findex.',
      whyItMattersSq:
        'Tregon nëse klientët mund të paguajnë në mënyrë dixhitale, me kartë ose me transfertë, apo kryesisht me para në dorë.',
      affectedBusinessesSq:
        'Dyqanet online, abonimet, shërbimet me pagesë dixhitale, aplikacionet dhe çdo biznes që dëshiron të punojë pa para në dorë.',
      mechanismSq:
        'Më shumë llogari → më shumë pagesa dixhitale → më pak pengesa për shitjet online dhe për pagesat e përsëritura.',
      extraEvidenceSq:
        'Pyesni klientët e synuar si paguajnë sot dhe testoni nëse pranojnë mënyrën e pagesës që planifikoni (kartë, transfertë, portofol celulari, para në dorë).',
      analogySq:
        'Si numri i shtëpive të lidhura me rrjetin e ujit: nëse shumë nuk janë të lidhura, uji (paratë) duhet ende të shpërndahet me bidonë.',
      cautionSq: `Anketa bëhet vetëm në disa vite, jo çdo vit, ndaj vlera e fundit mund të jetë disa vjet e vjetër. Të kesh llogari nuk do të thotë ta përdorësh rregullisht. ${AVG}`,
    },
  }),

  // ── Puna ─────────────────────────────────────────────────────────────────
  wb('unemployment', 'SL.UEM.TOTL.ZS', {
    nameSq: 'Papunësia',
    nameEn: 'Unemployment, total (% of total labor force) (modeled ILO estimate)',
    unit: 'perqind',
    unitLabelSq: '% e forcës së punës',
    basis: 'norme',
    category: 'puna',
    explain: {
      whatItMeasuresSq:
        'Përqindja e forcës së punës (njerëz që punojnë ose kërkojnë punë) që nuk ka punë dhe po kërkon.',
      whyItMattersSq:
        'Ndikon te fuqia blerëse e klientëve, te sa lehtë gjenden punonjës dhe te pagat që duhet të ofroni.',
      affectedBusinessesSq:
        'Bizneset që punësojnë shumë njerëz (mikpritje, tregti, shërbime), ato që shesin te familjet dhe shërbimet e trajnimit ose të punësimit.',
      mechanismSq:
        'Papunësi e lartë → më shumë kandidatë për punë, por klientë me më pak të ardhura; papunësi e ulët → klientë më të sigurt, por punonjës më të vështirë për t’u gjetur.',
      extraEvidenceSq:
        'Shikoni njoftimet e punës në zonë, pagat që ofrohen për pozicionet që ju duhen dhe sa kohë u duhet bizneseve të ngjashme për të punësuar.',
      analogySq:
        'Si udhëtarët që mbeten në stacion pa vend në autobus: tregon sa njerëz që duan të punojnë nuk kanë gjetur ende vend.',
      cautionSq: `${ILO_MODELLED} Nuk përfshin njerëzit që kanë hequr dorë nga kërkimi i punës dhe nuk e kap mirë punën informale. ${PP}`,
    },
  }),
  wb('youth_unemployment', 'SL.UEM.1524.ZS', {
    nameSq: 'Papunësia e të rinjve (15–24 vjeç)',
    nameEn: 'Unemployment, youth total (% of total labor force ages 15-24) (modeled ILO estimate)',
    unit: 'perqind',
    unitLabelSq: '% e forcës së punës 15–24 vjeç',
    basis: 'norme',
    category: 'puna',
    explain: {
      whatItMeasuresSq:
        'Përqindja e të rinjve 15–24 vjeç në forcën e punës që nuk kanë punë dhe po kërkojnë.',
      whyItMattersSq:
        'Tregon nëse ka të rinj të gatshëm për punë fillestare ose me kohë të pjesshme, dhe sa e vështirë është hyrja në tregun e punës.',
      affectedBusinessesSq:
        'Mikpritja, tregtia, qendrat e thirrjeve, shërbimet e dorëzimit, trajnimet profesionale dhe kurset e aftësive.',
      mechanismSq:
        'Papunësi e lartë rinore → më shumë kandidatë për punë fillestare dhe më shumë kërkesë për trajnime, por edhe më pak të ardhura për klientët e rinj.',
      extraEvidenceSq:
        'Bisedoni me shkolla profesionale ose zyra punësimi lokale dhe verifikoni nëse aftësitë që ju duhen janë të disponueshme.',
      analogySq:
        'Si radha në hyrje të një stadiumi: tregon sa të rinj presin ende të hyjnë në tregun e punës.',
      cautionSq: `Shumë të rinj janë në shkollë dhe nuk numërohen në forcën e punës, ndaj 30% papunësi rinore nuk do të thotë 30% e të gjithë të rinjve. ${ILO_MODELLED}`,
    },
  }),
  wb('labor_participation', 'SL.TLF.CACT.ZS', {
    nameSq: 'Pjesëmarrja në forcën e punës',
    nameEn: 'Labor force participation rate, total (% of total population ages 15+) (modeled ILO estimate)',
    unit: 'perqind',
    unitLabelSq: '% e popullsisë 15+ vjeç',
    basis: 'norme',
    category: 'puna',
    explain: {
      whatItMeasuresSq:
        'Përqindja e popullsisë 15 vjeç e lart që punon ose kërkon punë në mënyrë aktive.',
      whyItMattersSq:
        'Tregon sa njerëz janë realisht të angazhuar në ekonomi; pjesëmarrja e ulët mund të tregojë punë informale, emigracion ose pengesa për gratë dhe të rinjtë.',
      affectedBusinessesSq:
        'Kujdesi për fëmijët dhe të moshuarit, trajnimet, punët fleksibël dhe bizneset që kanë nevojë për fuqi punëtore.',
      mechanismSq:
        'Pjesëmarrje në rritje → më shumë familje me të ardhura dhe më shumë nevojë për shërbime që kursejnë kohë (kujdes, ushqim i gatshëm, pastrim).',
      extraEvidenceSq:
        'Verifikoni lokalisht kush mungon nga tregu i punës (p.sh. nëna me fëmijë të vegjël, të moshuarit) dhe çfarë i pengon.',
      analogySq:
        'Si numri i lojtarëve në fushë nga e gjithë skuadra: tregon sa luajnë realisht, jo vetëm sa janë në listë.',
      cautionSq: `${ILO_MODELLED} Përfshin edhe të papunët që kërkojnë punë. ${PP}`,
    },
  }),

  // ── Popullsia ────────────────────────────────────────────────────────────
  wb('population', 'SP.POP.TOTL', {
    nameSq: 'Popullsia',
    nameEn: 'Population, total',
    unit: 'numer',
    unitLabelSq: 'banorë',
    basis: 'numer',
    category: 'popullsia',
    explain: {
      whatItMeasuresSq: 'Numri i të gjithë banorëve të vendit, sipas vlerësimeve për mesin e vitit.',
      whyItMattersSq: 'Përcakton madhësinë maksimale të tregut vendas për produktet e konsumit.',
      affectedBusinessesSq:
        'Të gjitha bizneset që shesin te konsumatori final, sidomos ato me marzhe të ulëta që kanë nevojë për volum.',
      mechanismSq:
        'Më shumë banorë → treg i mundshëm më i madh; por kërkesa reale varet nga të ardhurat, mosha dhe vendndodhja e njerëzve.',
      extraEvidenceSq:
        'Matni tregun në qytetin ose lagjen ku do të punoni, jo në gjithë vendin: numri i klientëve që mund të arrini realisht është shumë më i vogël.',
      analogySq:
        'Si madhësia e një liqeni: tregon sa ujë ka gjithsej, jo sa peshq do të kapni nga bregu juaj.',
      cautionSq:
        'Vlerat ndërmjet regjistrimeve të popullsisë janë vlerësime dhe mund të mos e kapin plotësisht emigracionin. Popullsia kombëtare nuk tregon ku jetojnë njerëzit.',
    },
  }),
  wb('population_growth', 'SP.POP.GROW', {
    nameSq: 'Rritja e popullsisë',
    nameEn: 'Population growth (annual %)',
    unit: 'perqind',
    unitLabelSq: '% në vit',
    basis: 'norme',
    category: 'popullsia',
    explain: {
      whatItMeasuresSq:
        'Ndryshimi vjetor i popullsisë në përqindje, që përfshin lindjet, vdekjet dhe migracionin neto.',
      whyItMattersSq:
        'Popullsia në rritje e zgjeron tregun me kalimin e kohës; popullsia në rënie e ngushton atë dhe mund të sjellë mungesë punonjësish.',
      affectedBusinessesSq:
        'Banimi, ndërtimi, edukimi, shërbimet për fëmijë dhe të moshuar, tregtia me pakicë.',
      mechanismSq:
        'Më shumë njerëz çdo vit → më shumë kërkesë për banesa, shkolla dhe shërbime bazë; rënia e popullsisë ul kërkesën dhe rrit konkurrencën për klientët që mbeten.',
      extraEvidenceSq:
        'Kontrolloni nëse qyteti juaj po rritet apo po zbrazet: regjistrimi i fundit, numri i nxënësve, banesat bosh.',
      analogySq:
        'Si niveli i ujit në një rezervuar me një rubinet (lindjet dhe ata që vijnë) dhe një vrimë (vdekjet dhe ata që ikin).',
      cautionSq: `Një rritje kombëtare mund të fshehë zbrazjen e fshatrave dhe rritjen e kryeqytetit. ${PP}`,
    },
  }),
  wb('urban_population_pct', 'SP.URB.TOTL.IN.ZS', {
    nameSq: 'Popullsia urbane',
    nameEn: 'Urban population (% of total population)',
    unit: 'perqind',
    unitLabelSq: '% e popullsisë',
    basis: 'raport',
    category: 'popullsia',
    explain: {
      whatItMeasuresSq:
        'Pjesa e popullsisë që jeton në zona urbane, sipas përkufizimit kombëtar të “urbanes”.',
      whyItMattersSq:
        'Klientët në qytete janë më të përqendruar, më të lehtë për t’u arritur dhe shpesh paguajnë për më shumë shërbime.',
      affectedBusinessesSq:
        'Dorëzimet, ushqimi i gatshëm, shërbimet personale, transporti urban dhe dyqanet fizike.',
      mechanismSq:
        'Më shumë njerëz në qytete → më shumë klientë për kilometër katror → kosto më e ulët për t’i shërbyer secilit klient.',
      extraEvidenceSq:
        'Verifikoni sa klientë të mundshëm ka në zonën tuaj konkrete dhe sa larg do t’ju duhet të udhëtoni për secilin.',
      analogySq:
        'Si kokrrat e misrit në një kosh, krahasuar me kokrrat e shpërndara në fushë: kur janë bashkë, mblidhen më shpejt.',
      cautionSq: `Përkufizimi i “urbanes” ndryshon nga vendi në vend, ndaj krahasimet janë të përafërta. ${PP}`,
    },
  }),
  wb('urban_population_growth', 'SP.URB.GROW', {
    nameSq: 'Rritja e popullsisë urbane',
    nameEn: 'Urban population growth (annual %)',
    unit: 'perqind',
    unitLabelSq: '% në vit',
    basis: 'norme',
    category: 'popullsia',
    explain: {
      whatItMeasuresSq: 'Ndryshimi vjetor në përqindje i numrit të banorëve në zonat urbane.',
      whyItMattersSq:
        'Qytetet që rriten shpejt kanë nevojë për më shumë banesa, shërbime, transport dhe tregti.',
      affectedBusinessesSq:
        'Ndërtimi dhe rinovimet, mirëmbajtja e pallateve, shërbimet për shtëpinë, ushqimi, transporti dhe logjistika urbane.',
      mechanismSq:
        'Banorë të rinj në qytet → kërkesë e re për shërbime bazë që ende nuk janë mbuluar plotësisht.',
      extraEvidenceSq:
        'Vëzhgoni lagjet e reja në qytetin tuaj: ndërtimet e reja, shkollat që mbushen dhe shërbimet që mungojnë.',
      analogySq:
        'Si një tenxhere ku shtohet vazhdimisht ujë: duhet më shumë zjarr (shërbime) që të mbetet e nxehtë.',
      cautionSq:
        'Mund të ndryshojë edhe sepse disa zona riklasifikohen si urbane. Rritja zakonisht përqendrohet në një ose dy qytete, jo kudo.',
    },
  }),
  wb('population_65_plus_pct', 'SP.POP.65UP.TO.ZS', {
    nameSq: 'Popullsia 65 vjeç e lart',
    nameEn: 'Population ages 65 and above (% of total population)',
    unit: 'perqind',
    unitLabelSq: '% e popullsisë',
    basis: 'raport',
    category: 'popullsia',
    explain: {
      whatItMeasuresSq: 'Pjesa e popullsisë që është 65 vjeç e lart.',
      whyItMattersSq:
        'Një popullsi që plaket ka nevoja të reja (kujdes, ndihmë në shtëpi, shoqërim) dhe më pak njerëz në moshë pune.',
      affectedBusinessesSq:
        'Kujdesi jo-mjekësor në shtëpi, shërbimet dhe riparimet për shtëpinë, dorëzimi i ushqimit, turizmi për të moshuarit.',
      mechanismSq:
        'Më shumë të moshuar → më shumë kërkesë për ndihmë në jetën e përditshme; shpesh paguajnë fëmijët e tyre, përfshirë ata në diasporë.',
      extraEvidenceSq:
        'Bisedoni me familje që kujdesen për të moshuar: çfarë u mungon, sa paguajnë sot dhe kush e merr vendimin për të paguar.',
      analogySq:
        'Si unazat e një peme: tregon sa unaza të vjetra ka popullsia krahasuar me ato të rejat.',
      cautionSq: `Një pjesë e lartë e të moshuarve nuk do të thotë domosdoshmërisht fuqi blerëse e lartë; pensionet ndryshojnë shumë. ${PP}`,
    },
  }),
  wb('population_0_14_pct', 'SP.POP.0014.TO.ZS', {
    nameSq: 'Popullsia 0–14 vjeç',
    nameEn: 'Population ages 0-14 (% of total population)',
    unit: 'perqind',
    unitLabelSq: '% e popullsisë',
    basis: 'raport',
    category: 'popullsia',
    explain: {
      whatItMeasuresSq: 'Pjesa e popullsisë që është 0–14 vjeç.',
      whyItMattersSq:
        'Tregon sa e re është popullsia dhe sa kërkesë ka, dhe do të ketë, për produkte dhe shërbime për fëmijë.',
      affectedBusinessesSq:
        'Kujdesi për fëmijët (i licencuar), edukimi dhe kurset pas shkollës, veshjet dhe lodrat, ushqimi për familje.',
      mechanismSq:
        'Më shumë fëmijë → më shumë shpenzime familjare për edukim dhe kujdes; pas disa vitesh, më shumë të rinj në tregun e punës.',
      extraEvidenceSq:
        'Verifikoni numrin e fëmijëve dhe të shkollave në zonën tuaj, si dhe sa paguajnë familjet sot për kujdes ose kurse.',
      analogySq: 'Si fidanët në një fidanishte: tregojnë si do të duket pylli pas disa vitesh.',
      cautionSq: `Shumë fëmijë nuk do të thotë familje me të ardhura të mjaftueshme për të paguar shërbime private. ${PP}`,
    },
  }),

  // ── Kursi dhe tregtia ────────────────────────────────────────────────────
  wb('exchange_rate_lcu_usd', 'PA.NUS.FCRF', {
    nameSq: 'Kursi zyrtar i këmbimit (monedha vendase për 1 USD)',
    nameEn: 'Official exchange rate (LCU per US$, period average)',
    unit: 'mv_per_usd',
    unitLabelSq: 'monedhë vendase për 1 USD (mesatare vjetore)',
    currency: 'MV',
    basis: 'nominal',
    category: 'financa',
    explain: {
      whatItMeasuresSq:
        'Sa njësi të monedhës vendase duheshin mesatarisht gjatë vitit për të blerë 1 dollar amerikan, sipas kursit zyrtar.',
      whyItMattersSq:
        'Ndikon te çmimi i mallrave të importuara, te konkurrueshmëria e eksporteve dhe te vlera e remitancave në monedhë vendase.',
      affectedBusinessesSq:
        'Importuesit, eksportuesit, bizneset që shesin shërbime jashtë vendit (p.sh. softuer, përkthime) dhe ato që varen nga turistët ose remitancat.',
      mechanismSq:
        'Kur monedha vendase dobësohet (numri rritet), importet shtrenjtohen dhe eksportet e shërbimet për të huajt bëhen më konkurruese; kur forcohet, ndodh e kundërta.',
      extraEvidenceSq:
        'Për çmime dhe kosto aktuale përdorni kursin ditor të bankës qendrore ose të bankës suaj, jo mesataren vjetore.',
      analogySq:
        'Si një urë mes dy brigjeve: kursi tregon sa “hapa” në monedhë vendase duhen për të arritur te një dollar.',
      cautionSq:
        'Është mesatare vjetore, jo kursi i sotëm. Rritja e numrit do të thotë monedhë vendase më e dobët. Për vendet që përdorin euron ose një monedhë të huaj, “monedha vendase” është ajo monedhë.',
    },
  }),
  wb('imports_gdp', 'NE.IMP.GNFS.ZS', {
    nameSq: 'Importet e mallrave dhe shërbimeve',
    nameEn: 'Imports of goods and services (% of GDP)',
    unit: 'perqind',
    unitLabelSq: '% e PBB-së',
    basis: 'raport',
    category: 'tregtia',
    explain: {
      whatItMeasuresSq:
        'Vlera e mallrave dhe shërbimeve që vendi blen nga jashtë, si përqindje e PBB-së.',
      whyItMattersSq:
        'Tregon sa varet ekonomia nga produktet e huaja dhe ku mund të ketë hapësirë për t’i zëvendësuar me prodhim ose shërbime vendase.',
      affectedBusinessesSq:
        'Tregtarët dhe shpërndarësit, logjistika dhe agjentët doganorë, prodhuesit vendas që mund të zëvendësojnë importe.',
      mechanismSq:
        'Importe të larta → nevojë për logjistikë, shpërndarje dhe shërbime pas shitjes; mund të ketë edhe mundësi zëvendësimi kur cilësia dhe çmimi vendas konkurrojnë.',
      extraEvidenceSq:
        'Identifikoni cilat produkte konkrete importohen në sektorin tuaj (statistikat doganore) dhe pyesni blerësit nëse do të blinin një alternativë vendase.',
      analogySq: 'Si uji që vjen me tub nga fqinji: tregon sa nga nevojat tuaja mbulohen nga jashtë.',
      cautionSq:
        'Vendet e vogla kanë natyrshëm përqindje të lartë importesh; kjo vetvetiu nuk është as e mirë, as e keqe. Treguesi nuk tregon cilat produkte importohen.',
    },
  }),
  wb('exports_gdp', 'NE.EXP.GNFS.ZS', {
    nameSq: 'Eksportet e mallrave dhe shërbimeve',
    nameEn: 'Exports of goods and services (% of GDP)',
    unit: 'perqind',
    unitLabelSq: '% e PBB-së',
    basis: 'raport',
    category: 'tregtia',
    explain: {
      whatItMeasuresSq:
        'Vlera e mallrave dhe shërbimeve që vendi u shet të huajve (përfshirë shpenzimet e turistëve të huaj), si përqindje e PBB-së.',
      whyItMattersSq:
        'Tregon sa e hapur është ekonomia ndaj tregjeve të huaja dhe sa të ardhura vijnë nga klientë të huaj.',
      affectedBusinessesSq:
        'Prodhuesit, shërbimet dixhitale për klientë të huaj, logjistika, paketimi, certifikimi dhe shërbimet për eksportuesit.',
      mechanismSq:
        'Eksporte në rritje → më shumë kërkesë për furnitorë, transport dhe shërbime mbështetëse rreth eksportuesve.',
      extraEvidenceSq:
        'Verifikoni kërkesat konkrete të tregut të synuar (standarde, certifikime, procedura doganore) dhe flisni me blerës realë jashtë vendit.',
      analogySq:
        'Si vitrina e një dyqani në rrugën kryesore: sa më e madhe, aq më shumë klientë të huaj ju shohin.',
      cautionSq:
        'Shifra përfshin edhe eksportet e firmave të mëdha ose të huaja; nuk tregon sa e lehtë është për një biznes të vogël të eksportojë.',
    },
  }),

  // ── Sektorët ─────────────────────────────────────────────────────────────
  wb('agriculture_va_gdp', 'NV.AGR.TOTL.ZS', {
    nameSq: 'Bujqësia, pylltaria dhe peshkimi',
    nameEn: 'Agriculture, forestry, and fishing, value added (% of GDP)',
    unit: 'perqind',
    unitLabelSq: '% e PBB-së',
    basis: 'raport',
    category: 'sektoret',
    explain: {
      whatItMeasuresSq: 'Pjesa e PBB-së që vjen nga bujqësia, pylltaria dhe peshkimi.',
      whyItMattersSq:
        'Tregon peshën e sektorit bujqësor në ekonomi dhe sa familje mund të varen prej tij.',
      affectedBusinessesSq:
        'Agro-përpunimi, inputet bujqësore, shërbimet e mekanizimit, magazinimi në të ftohtë, transporti dhe tregtimi i produkteve.',
      mechanismSq:
        'Bujqësi me peshë të madhe → shumë fermerë të vegjël me nevojë për inpute, shitje dhe përpunim; humbjet pas vjeljes krijojnë hapësirë për magazinim dhe përpunim.',
      extraEvidenceSq:
        'Bisedoni me fermerë dhe grumbullues në zonën tuaj për problemet konkrete (çmimi, ruajtja, transporti) dhe për sezonin.',
      analogySq:
        'Si rrënjët e një peme: pesha e bujqësisë tregon sa thellë mbështetet ekonomia te toka.',
      cautionSq: `Një pjesë në rënie nuk do të thotë që bujqësia po tkurret: mund të jetë se sektorët e tjerë po rriten më shpejt. ${PP} ${AVG}`,
    },
  }),
  wb('industry_va_gdp', 'NV.IND.TOTL.ZS', {
    nameSq: 'Industria (përfshirë ndërtimin)',
    nameEn: 'Industry (including construction), value added (% of GDP)',
    unit: 'perqind',
    unitLabelSq: '% e PBB-së',
    basis: 'raport',
    category: 'sektoret',
    explain: {
      whatItMeasuresSq:
        'Pjesa e PBB-së që vjen nga industria: minierat, prodhimi përpunues, energjia, uji dhe ndërtimi.',
      whyItMattersSq:
        'Tregon peshën e prodhimit dhe të ndërtimit, që krijojnë kërkesë për furnitorë dhe shërbime teknike.',
      affectedBusinessesSq:
        'Furnizimi me materiale, mirëmbajtja teknike, transporti i mallrave, shërbimet e sigurisë në punë dhe nënkontraktorët.',
      mechanismSq:
        'Industri e madhe → shumë firma që blejnë pjesë, riparime, transport dhe shërbime teknike nga furnitorë më të vegjël.',
      extraEvidenceSq:
        'Identifikoni cilat degë industriale janë të pranishme pranë jush dhe pyesni ato çfarë shërbimesh blejnë nga jashtë.',
      analogySq:
        'Si motori i një makine: pesha e industrisë tregon sa i madh është motori, jo sa mirë punon.',
      cautionSq: `Përfshin ndërtimin dhe energjinë, të cilat mund të luhaten shumë nga viti në vit. ${PP}`,
    },
  }),
  wb('manufacturing_va_gdp', 'NV.IND.MANF.ZS', {
    nameSq: 'Prodhimi përpunues',
    nameEn: 'Manufacturing, value added (% of GDP)',
    unit: 'perqind',
    unitLabelSq: '% e PBB-së',
    basis: 'raport',
    category: 'sektoret',
    explain: {
      whatItMeasuresSq:
        'Pjesa e PBB-së që vjen nga prodhimi përpunues, pra nga shndërrimi i lëndëve të para në produkte.',
      whyItMattersSq:
        'Tregon sa prodhim ka në vend, çka ndikon te kërkesa për furnitorë, paketim, logjistikë dhe aftësi teknike.',
      affectedBusinessesSq:
        'Prodhimi i vogël, paketimi, mirëmbajtja e makinerive, transporti, kontrolli i cilësisë dhe certifikimi.',
      mechanismSq:
        'Më shumë prodhim → më shumë porosi për furnitorë të vegjël dhe për shërbime mbështetëse; mungesa e tij mund të tregojë një boshllëk ose pengesa të larta hyrjeje.',
      extraEvidenceSq:
        'Kontrolloni nëse ka klientë industrialë realë pranë jush dhe çfarë standardesh u kërkojnë furnitorëve.',
      analogySq:
        'Si një punishte e madhe në mes të qytetit: rreth saj mblidhen furnitorë dhe mjeshtër.',
      cautionSq: `Është pjesë e industrisë, jo shtesë mbi të. Një pjesë në rënie mund të tregojë rritje më të shpejtë të shërbimeve, jo rënie të prodhimit. ${PP}`,
    },
  }),
  wb('services_va_gdp', 'NV.SRV.TOTL.ZS', {
    nameSq: 'Shërbimet',
    nameEn: 'Services, value added (% of GDP)',
    unit: 'perqind',
    unitLabelSq: '% e PBB-së',
    basis: 'raport',
    category: 'sektoret',
    explain: {
      whatItMeasuresSq:
        'Pjesa e PBB-së që vjen nga shërbimet: tregtia, transporti, turizmi, financa, edukimi, shëndetësia, administrata dhe të tjera.',
      whyItMattersSq:
        'Në shumë vende, shumica e bizneseve të vogla janë në shërbime; pesha e lartë tregon një ekonomi ku shërbimet blihen dhe shiten gjerësisht.',
      affectedBusinessesSq:
        'Shërbimet për biznese dhe për familje, tregtia, mikpritja, edukimi, shërbimet dixhitale dhe profesionale.',
      mechanismSq:
        'Pesha e lartë e shërbimeve → më shumë biznese dhe familje që paguajnë për një shërbim në vend që ta bëjnë vetë.',
      extraEvidenceSq:
        'Numëroni dhe vizitoni bizneset e ngjashme në zonën tuaj; verifikoni sa paguajnë klientët dhe sa shpesh.',
      analogySq:
        'Si qarkullimi i gjakut në trup: shërbimet i lidhin pjesët e ekonomisë me njëra-tjetrën.',
      cautionSq: `Përfshin edhe administratën publike dhe pasuritë e paluajtshme, që nuk krijojnë domosdoshmërisht klientë për biznese të vogla. ${PP}`,
    },
  }),
  wb('new_business_density', 'IC.BUS.NDNS.ZS', {
    nameSq: 'Dendësia e bizneseve të reja',
    nameEn: 'New business density (new registrations per 1,000 people ages 15-64)',
    unit: 'per_1000',
    unitLabelSq: 'regjistrime të reja për 1.000 banorë 15–64 vjeç',
    basis: 'norme',
    category: 'sektoret',
    expectedLagYears: 3,
    explain: {
      whatItMeasuresSq:
        'Numri i shoqërive të reja me përgjegjësi të kufizuar të regjistruara gjatë vitit për çdo 1.000 banorë 15–64 vjeç.',
      whyItMattersSq:
        'Tregon sa aktiv është krijimi i bizneseve formale dhe, tërthorazi, sa e lehtë mund të jetë regjistrimi.',
      affectedBusinessesSq:
        'Shërbimet për biznese të reja (kontabilitet, regjistrim, faqe web, zyra të përbashkëta, pajisje) dhe furnitorët e tyre.',
      mechanismSq:
        'Më shumë biznese të reja → më shumë klientë për shërbimet që i duhen çdo biznesi në fillim, por edhe më shumë konkurrentë të rinj.',
      extraEvidenceSq:
        'Merrni nga regjistri zyrtar i bizneseve të dhënat e fundit për sektorin dhe qytetin tuaj, dhe kontrolloni sa nga bizneset e reja mbijetojnë.',
      analogySq: 'Si fidanët që mbijnë çdo pranverë: tregon sa u mbollën, jo sa do të rriten.',
      cautionSq:
        'Numëron vetëm shoqëritë me përgjegjësi të kufizuar, jo personat fizikë ose bizneset informale. Seria përditësohet në mënyrë të parregullt dhe mungon për shumë vende.',
    },
  }),

  // ── Remitancat dhe turizmi ───────────────────────────────────────────────
  wb('remittances_gdp', 'BX.TRF.PWKR.DT.GD.ZS', {
    nameSq: 'Remitancat e marra',
    nameEn: 'Personal remittances, received (% of GDP)',
    unit: 'perqind',
    unitLabelSq: '% e PBB-së',
    basis: 'raport',
    category: 'remitancat',
    explain: {
      whatItMeasuresSq:
        'Paratë që emigrantët dhe punëtorët jashtë vendit u dërgojnë familjeve në vend, si përqindje e PBB-së.',
      whyItMattersSq:
        'Në disa vende remitancat janë burim i madh të ardhurash për familjet dhe mbështesin konsumin, ndërtimin e shtëpive dhe shkollimin.',
      affectedBusinessesSq:
        'Ndërtimi dhe rinovimet, tregtia me pakicë, shërbimet për diasporën (administrimi i pronave, kujdesi për të afërmit) dhe transferimi i parave.',
      mechanismSq:
        'Remitanca → më shumë të ardhura në dispozicion të familjeve → shpenzime për shtëpi, mallra dhe shërbime; diaspora shpesh paguan për shërbime që kryhen në vend.',
      extraEvidenceSq:
        'Bisedoni me familje që marrin remitanca dhe me njerëz në diasporë: për çfarë shpenzojnë, çfarë u mungon dhe nëse do të paguanin për shërbimin tuaj.',
      analogySq:
        'Si një përrua që zbret nga një mal i largët: e ushqen liqenin (konsumin) edhe kur shiu vendas (të ardhurat) është i pakët.',
      cautionSq: `Përfshin vetëm transfertat e regjistruara; paratë e sjella me dorë shpesh mungojnë. Remitancat mund të bien shpejt kur dobësohet ekonomia e vendit ku punojnë emigrantët. ${PP}`,
    },
  }),
  wb('tourism_arrivals', 'ST.INT.ARVL', {
    nameSq: 'Mbërritjet e turistëve ndërkombëtarë',
    nameEn: 'International tourism, number of arrivals',
    unit: 'numer',
    unitLabelSq: 'mbërritje në vit',
    basis: 'numer',
    category: 'turizmi',
    explain: {
      whatItMeasuresSq: 'Numri i mbërritjeve të vizitorëve ndërkombëtarë në vend gjatë vitit.',
      whyItMattersSq:
        'Tregon madhësinë e tregut turistik dhe sa klientë të huaj mund të kenë mikpritja, ushqimi dhe shërbimet lokale.',
      affectedBusinessesSq:
        'Akomodimi, restorantet, guidat dhe aktivitetet, transporti, suvenirët dhe shërbimet dixhitale për turistët.',
      mechanismSq:
        'Më shumë vizitorë → më shumë netë, vakte dhe aktivitete të paguara; rritja shpërndahet sipas destinacioneve, jo njësoj në gjithë vendin.',
      extraEvidenceSq:
        'Verifikoni sezonin dhe numrin e vizitorëve në vendndodhjen tuaj konkrete, si dhe sa shpenzojnë dhe sa ditë qëndrojnë.',
      analogySq:
        'Si numri i anijeve që hyjnë në port: tregon trafikun, jo sa mallra shkarkon secila.',
      cautionSq:
        'Një mbërritje nuk është një person i vetëm: i njëjti vizitor numërohet sa herë hyn. Metoda e numërimit ndryshon nga vendi në vend dhe seria mund të publikohet me vonesë. Turizmi është shumë sezonal.',
    },
  }),
  wb('tourism_receipts_usd', 'ST.INT.RCPT.CD', {
    nameSq: 'Të ardhurat nga turizmi ndërkombëtar',
    nameEn: 'International tourism, receipts (current US$)',
    unit: 'monedhe',
    unitLabelSq: 'USD aktuale në vit',
    currency: 'USD',
    basis: 'nominal',
    category: 'turizmi',
    explain: {
      whatItMeasuresSq:
        'Shpenzimet e vizitorëve ndërkombëtarë në vend (akomodim, ushqim, transport, blerje), në dollarë amerikanë aktualë.',
      whyItMattersSq: 'Tregon jo vetëm sa turistë vijnë, por edhe sa para lënë në ekonomi.',
      affectedBusinessesSq:
        'Mikpritja, restorantet, guidat, transporti, artizanati dhe çdo biznes që u shet turistëve.',
      mechanismSq:
        'Të ardhura turistike në rritje → më shumë para që qarkullojnë te bizneset lokale në destinacionet turistike.',
      extraEvidenceSq:
        'Pyesni bizneset turistike lokale për sezonin, për shpenzimin mesatar të një vizitori dhe për kanalet nga vijnë klientët.',
      analogySq:
        'Si arka e një dyqani në fund të sezonit: tregon sa para mbetën, jo sa njerëz hynë.',
      cautionSq:
        'Është nominale në USD: kursi i këmbimit dhe inflacioni e ndryshojnë shifrën edhe kur numri i turistëve nuk ndryshon. Pjesa më e madhe mund të shkojë te pak destinacione ose biznese të mëdha.',
    },
  }),

  // ── Digjitale dhe infrastruktura ─────────────────────────────────────────
  wb('internet_users_pct', 'IT.NET.USER.ZS', {
    nameSq: 'Përdoruesit e internetit',
    nameEn: 'Individuals using the Internet (% of population)',
    unit: 'perqind',
    unitLabelSq: '% e popullsisë',
    basis: 'raport',
    category: 'digjitale',
    explain: {
      whatItMeasuresSq:
        'Përqindja e popullsisë që ka përdorur internetin gjatë 3 muajve të fundit, nga çdo pajisje.',
      whyItMattersSq:
        'Tregon sa klientë mund të arrini online dhe sa i gatshëm është tregu për shërbime dixhitale.',
      affectedBusinessesSq:
        'Tregtia online, marketingu dixhital, aplikacionet, shërbimet me rezervim online dhe mësimi në distancë.',
      mechanismSq:
        'Më shumë përdorues → më shumë klientë që kërkojnë, krahasojnë dhe blejnë online, dhe marketingu dixhital arrin më shumë njerëz.',
      extraEvidenceSq:
        'Verifikoni nëse klientët tuaj të synuar blejnë realisht online (jo vetëm përdorin rrjetet sociale) dhe si paguajnë.',
      analogySq:
        'Si numri i shtëpive me derë në rrugën kryesore: aq më shumë njerëz mund t’i trokisni online.',
      cautionSq: `Përdorimi i internetit nuk do të thotë blerje online. ${AVG} ${PP}`,
    },
  }),
  wb('mobile_subscriptions', 'IT.CEL.SETS.P2', {
    nameSq: 'Abonimet në telefoninë celulare',
    nameEn: 'Mobile cellular subscriptions (per 100 people)',
    unit: 'per_100',
    unitLabelSq: 'abonime për 100 banorë',
    basis: 'norme',
    category: 'digjitale',
    explain: {
      whatItMeasuresSq:
        'Numri i abonimeve në telefoninë celulare (me kontratë ose me parapagim) për çdo 100 banorë.',
      whyItMattersSq:
        'Tregon sa e përhapur është telefonia celulare, që është kanali kryesor i komunikimit dhe gjithnjë e më shumë edhe i pagesave e shitjeve.',
      affectedBusinessesSq:
        'Shërbimet me SMS ose aplikacion, pagesat me celular, riparimi i telefonave, aksesorët dhe marketingu përmes celularit.',
      mechanismSq:
        'Përhapje e gjerë e celularit → mundësi për t’i arritur klientët drejtpërdrejt në telefon dhe për shërbime të thjeshta përmes celularit.',
      extraEvidenceSq:
        'Kontrolloni çfarë telefonash dhe aplikacionesh përdorin klientët tuaj dhe sa u kushton interneti celular.',
      analogySq:
        'Si çelësat e shpërndarë në një pallat: mund të jenë më shumë se banorët, sepse disa mbajnë dy.',
      cautionSq:
        'Mund të kalojë 100, sepse shumë njerëz kanë më shumë se një kartë SIM. Nuk tregon sa njerëz kanë telefon inteligjent ose internet celular.',
    },
  }),
  wb('electricity_access', 'EG.ELC.ACCS.ZS', {
    nameSq: 'Qasja në energji elektrike',
    nameEn: 'Access to electricity (% of population)',
    unit: 'perqind',
    unitLabelSq: '% e popullsisë',
    basis: 'raport',
    category: 'infrastruktura',
    explain: {
      whatItMeasuresSq: 'Përqindja e popullsisë që ka qasje në energji elektrike.',
      whyItMattersSq:
        'Pa energji të qëndrueshme, shumë biznese (ftohja, pajisjet, interneti) nuk mund të punojnë ose kanë kosto shtesë.',
      affectedBusinessesSq:
        'Përpunimi dhe ruajtja në të ftohtë e ushqimit, punishtet, shërbimet dixhitale, energjia diellore dhe zgjidhjet rezervë të energjisë.',
      mechanismSq:
        'Qasje e ulët ose e pasigurt → kosto shtesë për gjenerator ose bateri, por edhe kërkesë për zgjidhje energjie jashtë rrjetit.',
      extraEvidenceSq:
        'Verifikoni në terren sa shpesh ndërpritet energjia në zonën tuaj dhe sa kushton një zgjidhje rezervë.',
      analogySq: 'Si gjaku për muskujt: pa të, edhe makineria më e mirë mbetet e palëvizur.',
      cautionSq: `Qasja nuk tregon cilësinë: një vend me 100% qasje mund të ketë ndërprerje të shpeshta. ${AVG}`,
    },
  }),

  // ── FMN (World Economic Outlook) ─────────────────────────────────────────
  imf('imf_gdp_growth', 'NGDP_RPCH', {
    nameSq: 'Rritja reale e PBB-së (FMN, me parashikime)',
    nameEn: 'Real GDP growth (annual percent change)',
    unit: 'perqind',
    unitLabelSq: '% në vit (real)',
    basis: 'real',
    category: 'rritja',
    explain: {
      whatItMeasuresSq:
        'Ndryshimi vjetor real i PBB-së sipas bazës World Economic Outlook të FMN-së; për vitin aktual dhe vitet e ardhshme vlerat janë parashikime.',
      whyItMattersSq:
        'Jep një pamje të pritshmërive për vitet e ardhshme dhe shpesh një vlerë më të re se seritë vjetore të Bankës Botërore.',
      affectedBusinessesSq:
        'Bizneset që planifikojnë investime shumëvjeçare, ato që varen nga konsumi dhe ato që u shesin bizneseve të tjera.',
      mechanismSq:
        'Pritshmëri rritjeje → më shumë besim për investime dhe punësim; parashikimet e dobëta sinjalizojnë kujdes.',
      extraEvidenceSq:
        'Trajtojini parashikimet si skenarë, jo si fakte, dhe testoni kërkesën reale me klientë para çdo shpenzimi të madh.',
      analogySq: 'Si parashikimi i motit për javën: i dobishëm për planifikim, por mund të ndryshojë.',
      cautionSq: `${IMF_PROJECTION} Mund të ndryshojë nga seria e Bankës Botërore për shkak të metodave dhe datave të ndryshme të përditësimit.`,
    },
  }),
  imf('imf_inflation', 'PCPIPCH', {
    nameSq: 'Inflacioni mesatar i çmimeve të konsumit (FMN, me parashikime)',
    nameEn: 'Inflation rate, average consumer prices (annual percent change)',
    unit: 'perqind',
    unitLabelSq: '% në vit',
    basis: 'norme',
    category: 'cmimet',
    explain: {
      whatItMeasuresSq:
        'Ndryshimi vjetor i nivelit mesatar të çmimeve të konsumit sipas FMN-së (World Economic Outlook); vitet aktuale dhe të ardhshme janë parashikime.',
      whyItMattersSq: 'Ndihmon të planifikoni rritjen e kostove dhe të çmimeve për vitet e ardhshme.',
      affectedBusinessesSq:
        'Bizneset me kontrata afatgjata, me marzhe të ulëta ose që importojnë inputet kryesore.',
      mechanismSq:
        'Inflacion i pritshëm i lartë → kostot dhe pagat pritet të rriten; çmimet tuaja duhet ta ndjekin këtë ritëm që të ruani marzhin.',
      extraEvidenceSq:
        'Krahasojeni me ofertat aktuale të furnitorëve dhe me inflacionin e fundit të matur, dhe mbani një rezervë në buxhet.',
      analogySq:
        'Si parashikimi i sa shpejt do të rrjedhë rezervuari vitin e ardhshëm: ju ndihmon të vendosni sa ujë të mbani rezervë.',
      cautionSq: `${IMF_PROJECTION} Mesatarja vjetore ndryshon nga inflacioni “dhjetor me dhjetor”. Inflacioni më i ulët nuk do të thotë çmime që ulen.`,
    },
  }),
  imf('imf_unemployment', 'LUR', {
    nameSq: 'Papunësia (FMN, me parashikime)',
    nameEn: 'Unemployment rate (percent)',
    unit: 'perqind',
    unitLabelSq: '% e forcës së punës',
    basis: 'norme',
    category: 'puna',
    explain: {
      whatItMeasuresSq:
        'Përqindja e forcës së punës pa punë sipas FMN-së (World Economic Outlook), bazuar kryesisht në burime kombëtare; vitet aktuale dhe të ardhshme janë parashikime.',
      whyItMattersSq:
        'Jep një vlerësim më të ri ose të pritshëm të tregut të punës kur seritë vjetore vonohen.',
      affectedBusinessesSq: 'Bizneset që punësojnë shumë njerëz dhe ato që u shesin familjeve.',
      mechanismSq:
        'Papunësi e pritshme në rënie → më shumë të ardhura familjare, por konkurrencë më e fortë për punonjës.',
      extraEvidenceSq:
        'Verifikoni lokalisht pagat dhe disponueshmërinë e punonjësve për pozicionet që ju duhen.',
      analogySq: 'Si parashikimi i sa udhëtarë do të mbeten pa vend në stacionin e ardhshëm.',
      cautionSq: `FMN-ja nuk e publikon këtë seri për të gjitha vendet, dhe përkufizimet kombëtare ndryshojnë, ndaj mos e krahasoni drejtpërdrejt me vlerësimet e modeluara të ILO-s. ${IMF_PROJECTION}`,
    },
  }),
];

const INDICATOR_BY_CODE = new Map(INDICATORS.map((d) => [d.code, d]));

export function getIndicator(code: string): IndicatorDefinition | undefined {
  return INDICATOR_BY_CODE.get(code);
}

/** Definitions published by one source, e.g. all World Bank WDI series for a refresh job. */
export function getIndicatorsBySource(sourceId: string): IndicatorDefinition[] {
  return INDICATORS.filter((d) => d.sourceId === sourceId);
}
