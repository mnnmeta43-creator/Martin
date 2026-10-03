import type { BusinessArchetype } from '@/lib/domain/types';

/**
 * Batch B — ushqim, agro-përpunim, riparime dhe prodhim i vogël.
 * Covers a spread of capital levels (low → high), solo vs partner vs team starts, home vs premises,
 * and one archetype with an international (diaspora/export) market. All amounts are general USD
 * assumptions at US price levels; every legal statement asks for local verification.
 */
export const BATCH_B: BusinessArchetype[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // 1. Office lunch catering — premises, partner, high capital, regulated food
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'catering-dreke-per-zyra',
    nameSq: 'Drekë e përditshme për zyra (catering me kuzhinë të licencuar)',
    taglineSq: 'Menu javore e qartë, porosi deri në mëngjes, dorëzim në zyrë para drekës.',
    descriptionSq:
      'Shërbim dreke për zyra dhe ekipe të vogla (5–50 persona) që sot humbasin kohë çdo ditë duke vendosur ku të hanë, duke pritur porosi individuale ose duke ngrënë ushqim të shpejtë. Ushqimi gatuhet në një kuzhinë të regjistruar për sigurinë ushqimore, me menu javore të kufizuar (3–4 pjata në ditë), porositet deri në një orë të caktuar në mëngjes dhe dorëzohet në zyrë me temperaturë të kontrolluar. Zakonisht kërkon të paktën dy persona: një në kuzhinë dhe një për blerjet, dorëzimet dhe klientët.',
    sector: 'ushqim',
    offerSq:
      'Abonim dreke për zyrë: menu javore me 3–4 opsione në ditë (përfshirë një vegjetarian), porosi deri në orën e caktuar të mëngjesit përmes një liste të thjeshtë të përbashkët, dorëzim mes 12:00 dhe 13:00 në kuti të izoluara, faturë mujore për kompaninë ose pagesë individuale, dhe alergjenët e shënuar për çdo pjatë.',
    payingCustomerSq:
      'Kompania (administratori i zyrës ose burimet njerëzore) që e subvencionon drekën, ose vetë punonjësit me një faturë të përbashkët.',
    customerSegments: ['b2b'],
    problemSq:
      'Në zyrat pa mensë, punonjësit humbasin kohë çdo ditë duke zgjedhur dhe pritur ushqim; porositë individuale vijnë në orë të ndryshme, shpesh të ftohura ose jo të shëndetshme, dhe administratori nuk ka një zgjidhje të parashikueshme për drekën e ekipit.',
    modes: ['fizik'],
    marketScopes: ['lokal'],
    canStartFromHome: false,
    minTeam: 'partner',
    requiredSkills: ['gatim'],
    helpfulSkills: ['shitje', 'logjistike', 'sherbim_klienti', 'kontabilitet', 'drejtim_mjeti'],
    helpfulAssets: ['kuzhine_profesionale', 'automjet', 'furgon', 'rrjet_kontaktesh', 'telefon_smart'],
    minHoursPerWeek: 40,
    regulated: true,
    regulationNotesSq: [
      'Regjistrimi i veprimtarisë ushqimore dhe miratimi i ambientit të kuzhinës nga autoriteti i sigurisë ushqimore: Kërkon verifikim lokal para çdo shitjeje.',
      'Plan higjiene i tipit HACCP (pikat kritike: temperatura e gatimit, ftohja, ruajtja dhe transporti), regjistra temperature dhe gjurmueshmëri e furnitorëve — verifikoni çfarë kërkohet saktësisht në vendin tuaj.',
      'Certifikatat shëndetësore dhe trajnimi për higjienën e ushqimit për çdo person që punon me ushqim: verifikoni afatet dhe ku merren.',
      'Kuzhina e shtëpisë zakonisht nuk lejohet për shitjen e ushqimit të gatuar; mos e përdorni pa konfirmim zyrtar me shkrim. Etiketimi i alergjenëve gjithashtu kërkon verifikim lokal.',
      'Transporti i ushqimit të gatuar (temperatura, kutitë, mjeti) dhe punësimi i stafit (kontrata, sigurime shoqërore): Kërkon verifikim lokal.',
    ],
    licensedProfessionalsSq: [
      'Teknolog ushqimi ose konsulent sigurie ushqimore për hartimin e planit të higjienës (kur kërkohet)',
      'Teknik i licencuar për instalimet e gazit dhe të ventilimit të kuzhinës',
      'Elektricist i licencuar për lidhjen e pajisjeve me fuqi të lartë',
      'Kontabilist për faturimin dhe pagat',
    ],
    adultOnly: true,
    zeroCapitalTestSq:
      'Ushqimi për shitje nuk duhet gatuar në kuzhinën e shtëpisë pa leje, prandaj testi pa kapital mat kërkesën, jo gatimin: hartoni një menu javore me çmime, takoni administratorët e 20 zyrave në një zonë, pyetini si e zgjidhin drekën sot dhe kërkoni parapagim për një javë provë. Nëse ka interes real, negocioni me një restorant ose kuzhinë të licencuar që ka kapacitet të lirë në mëngjes për ta gatuar javën provë (verifikoni që marrëveshja është e ligjshme). Kostoja reale: koha juaj, printimi i menusë dhe, për javën provë, përbërësit, paketimi dhe pagesa e kuzhinës partnere.',
    revenueModelSq:
      'Çmim për drekë (njësia = 1 drekë e dorëzuar), i faturuar një herë në muaj te kompania ose i mbledhur nga punonjësit; një numër minimal drekash në ditë për zyrë, që dorëzimi të mbulojë koston. Ngjarjet e vogla në zyrë janë opsionale dhe nuk janë në modelin bazë.',
    pricing: {
      unitLabelSq: 'drekë',
      priceUSD: { low: 8, base: 11, high: 15 },
      variableCostUSD: { low: 3.5, base: 4.8, high: 6.5 },
      unitsPerCustomerPerMonth: 80,
      collectionDays: 30,
      supplierPaymentDays: 7,
      noteSq:
        'Kostoja variabël përfshin përbërësit, paketimin dhe pjesën e energjisë së gatimit për drekë; nuk përfshin pagat dhe qiranë. “Klient” = një zyrë me porosi të rregullt, mesatarisht rreth 4 dreka në ditë pune. Çmimet janë supozime fillestare në USD; verifikoni sa paguajnë sot punonjësit për drekë në zonë dhe merrni oferta reale nga furnitorët e ushqimeve.',
    },
    startupCosts: [
      {
        id: 'kitchen-equipment',
        labelSq: 'Pajisje kuzhine profesionale (furra, sobë, frigoriferë, tavolina inoksi)',
        category: 'pajisje',
        lowUSD: 6000,
        highUSD: 20000,
        noteSq:
          'Varet nga gjendja (e re apo e përdorur) dhe nga kapaciteti ditor; kërkoni të paktën 3 oferta nga furnitorë pajisjesh hoterie dhe kontrolloni që pajisjet plotësojnë kërkesat e higjienës.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['kuzhine_profesionale'],
      },
      {
        id: 'kitchen-fitout',
        labelSq: 'Përshtatja e ambientit sipas kërkesave të higjienës (sipërfaqe, lavamanë, ventilim)',
        category: 'hapje',
        lowUSD: 2000,
        highUSD: 10000,
        noteSq:
          'Varet nga gjendja e ambientit; kërkoni vlerësim nga një mjeshtër dhe pyesni autoritetin e sigurisë ushqimore çfarë kontrollojnë para miratimit, para se të nënshkruani qiranë.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['kuzhine_profesionale'],
      },
      {
        id: 'kitchen-deposit',
        labelSq: 'Depozita e qirasë së kuzhinës',
        category: 'depozita',
        lowUSD: 1500,
        highUSD: 5000,
        noteSq:
          'Shpesh 1–3 muaj qira; negocioni dhe lexoni me kujdes kontratën për afatin minimal dhe kushtet e largimit.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['kuzhine_profesionale'],
      },
      {
        id: 'thermal-boxes',
        labelSq: 'Kuti termike, enë transporti dhe termometra',
        category: 'pajisje',
        lowUSD: 300,
        highUSD: 1000,
        noteSq:
          'Sasia varet nga numri i zyrave dhe i drekave në ditë; kutitë duhet ta mbajnë temperaturën deri në dorëzim — kërkoni specifikimet nga furnitori.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'delivery-vehicle',
        labelSq: 'Mjet dorëzimi i përdorur',
        category: 'pajisje',
        lowUSD: 4000,
        highUSD: 12000,
        noteSq:
          'Nevojitet vetëm nëse nuk keni mjet; në fillim mund të mjaftojë një makinë e zakonshme me kuti termike. Kontrolloni koston e sigurimit për përdorim pune.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['automjet', 'furgon'],
      },
      {
        id: 'food-registration',
        labelSq: 'Regjistrim biznesi dhe ushqimor, certifikata shëndetësore, trajnime higjiene',
        category: 'tarifa',
        lowUSD: 200,
        highUSD: 1500,
        noteSq:
          'Shumat dhe procedurat ndryshojnë shumë sipas vendit dhe bashkisë; merrni listën zyrtare të dokumenteve nga regjistri zyrtar i bizneseve dhe nga autoriteti i sigurisë ushqimore.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'initial-stock',
        labelSq: 'Stoku fillestar i përbërësve dhe i paketimit',
        category: 'inventar',
        lowUSD: 400,
        highUSD: 1200,
        noteSq:
          'Për 1–2 javët e para; mbani stok të vogël sepse produktet e freskëta prishen. Krahasoni çmimet e 2–3 furnitorëve me shumicë.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: menu e printuar dhe javë provë me kuzhinë partnere',
        category: 'testim_tregu',
        lowUSD: 300,
        highUSD: 900,
        noteSq:
          'Përfshin përbërësit dhe paketimin e javës provë, pagesën për kuzhinën partnere të licencuar dhe transportin; mbajeni të vogël derisa të keni parapagime.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'kitchen-rent',
        labelSq: 'Qira e kuzhinës',
        category: 'qira',
        lowUSD: 800,
        highUSD: 2500,
        noteSq:
          'Varet nga zona dhe madhësia; ambientet pranë zonave me zyra kushtojnë më shumë, por ulin kohën e dorëzimit. Kërkoni 3 oferta dhe verifikoni që veprimtaria ushqimore lejohet në atë ambient.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['kuzhine_profesionale'],
      },
      {
        id: 'kitchen-helper',
        labelSq: 'Ndihmës kuzhine me kohë të pjesshme',
        category: 'paga',
        lowUSD: 1200,
        highUSD: 2800,
        noteSq:
          'Supozim për një person me kohë të pjesshme përveç dy partnerëve, përfshirë kontributet e detyrueshme. Verifikoni pagën minimale dhe kostot e punësimit lokalisht.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'kitchen-utilities',
        labelSq: 'Gaz, energji, ujë dhe internet',
        category: 'sherbime_komunale',
        lowUSD: 250,
        highUSD: 700,
        noteSq:
          'Varet nga pajisjet dhe orët e gatimit; kërkoni nga pronari faturat e muajve të kaluar para se të nënshkruani.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'delivery-fuel',
        labelSq: 'Karburant dhe mirëmbajtje e mjetit të dorëzimit',
        category: 'transport',
        lowUSD: 150,
        highUSD: 450,
        noteSq:
          'Varet nga distanca mes zyrave; grupimi i klientëve në një zonë dhe një rrugë e vetme dorëzimi e ulin ndjeshëm këtë kosto.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'liability-insurance',
        labelSq: 'Sigurim përgjegjësie dhe i ambientit',
        category: 'sigurime',
        lowUSD: 40,
        highUSD: 150,
        noteSq:
          'Pyesni 2–3 agjenci sigurimesh për mbulimin e përgjegjësisë ndaj klientëve (p.sh. helmim ushqimor) dhe të pajisjeve.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'accounting',
        labelSq: 'Kontabilist (fatura, paga, deklarata)',
        category: 'kontabilitet',
        lowUSD: 80,
        highUSD: 250,
        noteSq:
          'Me punonjës dhe fatura mujore për kompani, kontabiliteti profesional zakonisht nevojitet; kërkoni një çmim fiks mujor.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'hygiene-supplies',
        labelSq: 'Materiale higjiene, pastrimi dhe kontroll i dëmtuesve',
        category: 'mirembajtje',
        lowUSD: 60,
        highUSD: 200,
        noteSq:
          'Përfshin detergjentë të përshtatshëm për ushqim, veshje pune dhe, nëse kërkohet, kontratë me një shërbim të licencuar kundër dëmtuesve; verifikoni kërkesat.',
        scalesWithPriceLevel: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 0, monthlyNewCustomers: 1, monthlyChurnPct: 6 },
      baze: { startCustomers: 1, monthlyNewCustomers: 1.5, monthlyChurnPct: 5 },
      optimist: { startCustomers: 2, monthlyNewCustomers: 2.5, monthlyChurnPct: 4 },
    },
    seasonality: [0.9, 1.0, 1.05, 1.0, 1.05, 1.0, 0.9, 0.75, 1.05, 1.1, 1.1, 1.1],
    seasonalityNoteSq:
      'Kërkesa ndjek ditët e punës në zyrë: bie në pushimet verore (sidomos në gusht) dhe në javët e festave, rritet në vjeshtë kur ekipet janë të plota. Vlerat janë supozim; kalendari i pushimeve ndryshon sipas vendit, dhe puna nga shtëpia e ul kërkesën në disa ditë të javës.',
    macroLinks: [
      {
        indicatorCode: 'urban_population_pct',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Zyrat dhe punonjësit e shërbimeve përqendrohen në qytete; dendësia e zyrave në një zonë e bën dorëzimin e përbashkët të drekës më pak të kushtueshëm për çdo drekë.',
        ifSupportsSq:
          'Pjesa e lartë e popullsisë urbane sugjeron më shumë zona me përqendrim zyrash — kontrolloni lagjen konkrete ku synoni të punoni.',
        ifContradictsSq:
          'Me popullsi kryesisht rurale, zyrat janë më të shpërndara; dorëzimi kushton më shumë dhe duhet testuar me kujdes.',
      },
      {
        indicatorCode: 'services_va_gdp',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Pesha e lartë e shërbimeve në ekonomi lidhet zakonisht me më shumë punë zyre (administratë, financë, teknologji, qendra thirrjesh), pra me më shumë njerëz që hanë drekë jashtë shtëpisë në ditë pune.',
        ifSupportsSq:
          'Sugjeron një bazë më të gjerë klientësh potencialë; numri real i zyrave në zonë duhet numëruar në terren.',
        ifContradictsSq:
          'Me peshë të ulët shërbimesh, kërkesa mund të vijë më shumë nga punishtet ose institucionet, me kushte dhe çmime të tjera.',
      },
      {
        indicatorCode: 'household_consumption_growth',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Kur konsumi i familjeve rritet, punonjësit dhe kompanitë shpenzojnë më lehtë për ushqim të gatuar jashtë; kur bie, dreka nga shtëpia rikthehet e para.',
        ifSupportsSq: 'Rritja e konsumit e bën më të besueshme gatishmërinë për të paguar drekë çdo ditë.',
        ifContradictsSq:
          'Rënia e konsumit sugjeron që çmimi do të jetë pengesa kryesore — testoni një menu më të thjeshtë dhe më të lirë.',
      },
      {
        indicatorCode: 'inflation_cpi',
        direction: 'me_i_ulet_mbeshtet',
        mechanismSq:
          'Përbërësit përbëjnë pjesën më të madhe të kostos variabël; inflacioni i lartë i gërryen marzhin kur çmimi i drekës është fiksuar me kompanitë për disa muaj.',
        ifSupportsSq: 'Inflacioni i ulët e bën më të sigurt fiksimin e çmimit mujor me zyrat.',
        ifContradictsSq:
          'Me inflacion të lartë, shkruani në ofertë rishikim çmimi çdo 3 muaj dhe mbani menu fleksibël sipas çmimeve të tregut.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Më shumë njerëz punojnë në zyra të vogla pa mensë, ndërsa kompanitë kërkojnë mënyra të thjeshta për ta mbajtur ekipin të kënaqur.',
      problemSq:
        'Dreka e përditshme kërkon kohë, del e parregullt dhe shpesh jo e shëndetshme; porositë individuale janë të shtrenjta dhe vonohen.',
      customerSq:
        'Administratorët e zyrave dhe pronarët e firmave me 5–50 punonjës, si dhe vetë punonjësit që hanë jashtë çdo ditë.',
      offerSq: 'Një menu javore e parashikueshme, e porositur në mëngjes dhe e dorëzuar në kohë, me një faturë të vetme mujore.',
      reasonToPaySq:
        'Kursim kohe për ekipin, më pak organizim për administratorin dhe ushqim i freskët me çmim të njohur paraprakisht.',
      profitConditionsSq:
        'Fitimi kërkon disa zyra në të njëjtën zonë (që dorëzimi të jetë efikas), një numër minimal drekash në ditë për të mbuluar qiranë dhe pagat, pak ushqim të hedhur dhe fatura të paguara brenda afatit.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq:
          'Zyrat e pëlqejnë idenë, por pak punonjës porositin çdo ditë; numri ditor i drekave mbetet nën pragun që mbulon kostot fikse.',
      },
      {
        kind: 'cmim',
        textSq:
          'Punonjësit krahasojnë me ushqimin e shpejtë ose me drekën nga shtëpia dhe nuk e pranojnë çmimin që mbulon përbërësit, paketimin dhe dorëzimin.',
      },
      {
        kind: 'konkurrence',
        textSq:
          'Restorantet lokale dhe platformat e porosive ofrojnë zbritje ose dorëzim falas për zyrat, sidomos në zonat qendrore.',
      },
      {
        kind: 'kosto',
        textSq:
          'Qiraja e kuzhinës, pagat dhe energjia mbeten fikse edhe në ditët me pak porosi; çmimet e përbërësve rriten pasi çmimi është fiksuar.',
      },
      {
        kind: 'vonesa_pagesash',
        textSq: 'Kompanitë e paguajnë faturën mujore me 30–60 ditë vonesë, ndërsa përbërësit dhe pagat paguhen menjëherë.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Kuzhina nuk merr në kohë miratimin e sigurisë ushqimore, ose një incident higjienik e ndal veprimtarinë dhe dëmton reputacionin.',
      },
      {
        kind: 'operacionale',
        textSq:
          'Vonesat në dorëzim (trafik, mjet i prishur, mungesë stafi) bëjnë që dreka të arrijë e ftohtë ose pas orës së drekës.',
      },
    ],
    falsifiersSq: [
      'Nga 20 zyra të kontaktuara në një zonë, më pak se 3 pranojnë një javë provë me parapagim.',
      'Gjatë javës provë, mesatarja e porosive bie nën 3 dreka në ditë për zyrë.',
      'Çmimi mesatar që pranojnë punonjësit është më i ulët se dyfishi i kostos variabël për drekë, gjë që e bën të pamundur mbulimin e qirasë dhe pagave.',
      'Pas 2 javësh provë, më shumë se gjysma e punonjësve që provuan nuk porositin më.',
    ],
    differentiationSq: [
      'Orar i fiksuar porosie dhe dorëzimi, i shkruar në marrëveshje (angazhim shërbimi, jo premtim rezultati).',
      'Menu e qartë me alergjenët e shënuar dhe opsione vegjetariane, e ndryshuar çdo javë që ekipi të mos mërzitet.',
      'Fokus në një zonë të vetme me shumë zyra, që dorëzimi të jetë i shpejtë dhe ushqimi të arrijë i ngrohtë.',
      'Faturë e vetme mujore dhe raport i porosive për kompaninë që e subvencionon drekën.',
    ],
    competitorTypesSq: [
      'Restorante dhe byrektore lokale me dorëzim',
      'Platforma porosish ushqimi me shumë restorante',
      'Mensa të brendshme në kompani të mëdha',
      'Dreka e sjellë nga shtëpia',
      'Supermarkete me ushqim të gatshëm',
    ],
    cheapestTestSq:
      'Menu javore me çmime + takime me 20 administratorë zyrash; synimi është 3 parapagime për një javë provë të gatuar në kuzhinë partnere të licencuar. Matni porositë reale ditore dhe rikthimin në javën e dytë, jo sa thonë “do të ishte mirë”.',
    interviewQuestionsSq: [
      'Ku hëngrën drekë shumica e kolegëve tuaj javën e kaluar?',
      'Si e organizoni sot drekën kur porosisni për disa persona njëherësh?',
      'Sa shpenzuat personalisht për drekë ditën e fundit të punës?',
      'Kur ishte hera e fundit që një porosi dreke erdhi me vonesë ose e ftohtë, dhe çfarë bëtë pas kësaj?',
      'A e subvencionon kompania drekën sot? Nëse po, si dhe me sa?',
      'Kush merret me mbledhjen e porosive dhe sa kohë i merr kjo në ditë?',
      'Çfarë keni provuar më parë (catering, mensë, platformë) dhe pse e ndërprenë?',
      'Kush tjetër merr pjesë në vendimin për një furnitor dreke për zyrën?',
    ],
    firstCustomers: {
      whereSq: [
        'Ndërtesa me shumë zyra dhe qendra biznesi në lagjen ku ndodhet kuzhina',
        'Firma ku keni kontakte personale ose ish-kolegë',
        'Zyra të vogla profesionale (kontabilitet, avokati, studio, agjenci) pa mensë',
        'Shoqatat lokale të biznesit dhe takimet e hapura të dhomës së tregtisë',
      ],
      howToContactSq: [
        'Vizitë personale te recepsioni ose administratori me menunë e printuar, jashtë orëve të ngarkuara',
        'Prezantim nga kontaktet tuaja ekzistuese te administratorët e zyrave',
        'Një mesazh i personalizuar në kanalin publik të kompanisë, vetëm një herë, pa mesazhe masive ose lista të blera',
      ],
      offerSq:
        'Javë provë me çmim të plotë, por me minimum ditor të ulët porosish; pas saj, marrëveshje mujore pa afat të gjatë (ndërprerje me njoftim 2-javor).',
      followUpSq:
        'Pas javës provë, një bisedë 10-minutëshe me administratorin dhe 3 pyetje të shkurtra për punonjësit; regjistroni porositë ditore në një tabelë dhe ndaloni ndjekjen pas një rikujtese pa përgjigje.',
      metricsSq: [
        'Zyra të kontaktuara → zyra me javë provë (%)',
        'Dreka mesatare në ditë për zyrë',
        'Rikthimi i punonjësve në javën e dytë (%)',
        'Ushqimi i hedhur (% e drekave të gatuara pa u shitur)',
        'Dorëzime në kohë (%)',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje, jam [emri] nga [emri i biznesit]. Gatuajmë në një kuzhinë të regjistruar në [zona] dhe sjellim drekë të freskët në zyra çdo ditë pune: menu javore me [numri] opsione, porosi deri në [ora] dhe dorëzim në [orari]. A mund t’ju lë menunë e kësaj jave dhe të flasim 10 minuta se si e organizoni sot drekën e ekipit?',
    offerTemplateSq:
      'Oferta për [emri i kompanisë]: (1) javë provë nga [data] deri më [data]; (2) menu me [numri] opsione në ditë, me alergjenët e shënuar; (3) porosi deri në [ora] përmes [mënyra e porosisë]; (4) dorëzim në [orari] në kuti të izoluara; (5) çmimi [çmimi] për drekë, minimum [numri] dreka në ditë, faturë mujore me pagesë brenda [ditë] ditëve. Ndërprerje me njoftim 2-javor. Angazhohemi për orarin e dorëzimit dhe standardet e higjienës; ju lutemi na tregoni sinqerisht çfarë nuk ju pëlqen.',
    feedbackQuestionsSq: [
      'Cilat pjata nuk u porositën fare dhe pse?',
      'Sa herë erdhi dreka pas orës së pritur këtë javë?',
      'Çfarë ju bëri të mos porositnit në ditët kur nuk porositët?',
      'Çfarë duhet ndryshuar në mënyrën e porosisë?',
    ],
    goCriteriaSq: [
      'Të paktën 3 zyra vazhdojnë me marrëveshje mujore pas javës provë.',
      'Mesatarja mbetet mbi 4 dreka në ditë për zyrë dhe ushqimi i hedhur nën 10%.',
      'Kontributi për drekë (çmimi minus kostoja variabël) i mbulon kostot fikse me më pak se 12 zyra aktive.',
    ],
    killCriteriaSq: [
      'Pas 30 kontakteve dhe 10 takimeve, më pak se 2 zyra pranojnë javë provë me pagesë.',
      'Porositë mesatare bien nën 3 dreka në ditë për zyrë në javën e dytë dhe të tretë.',
      'Kuzhina nuk mund të marrë miratimin e sigurisë ushqimore brenda buxhetit dhe afatit të planifikuar.',
    ],
    phaseNotesSq: {
      p10_20: [
        'Numëroni zyrat në një rreze 2–3 km nga kuzhina e mundshme dhe intervistoni 15 administratorë ose punonjës për drekën e javës së kaluar.',
      ],
      p20_30: [
        'Porosisni nga 3–5 alternativa lokale dhe shënoni çmimin, orarin dhe sasinë; formoni menunë provë mbi këtë krahasim.',
      ],
      p30_40: ['Llogaritni koston e çdo pjate me çmime reale nga furnitorët dhe pragun minimal të drekave në ditë.'],
      p40_50: [
        'Pyesni autoritetin e sigurisë ushqimore për miratimin e ambientit para se të nënshkruani qiranë; kërkoni listën e dokumenteve me shkrim.',
      ],
      p60_70: [
        'Javë provë me 3 zyra në kuzhinë partnere të licencuar; regjistroni çdo ditë porositë, vonesat dhe ushqimin e hedhur.',
      ],
      p80_90: ['Rishikoni menunë sipas pjatave më pak të porositura dhe optimizoni rrugën e dorëzimit.'],
    },
    assumptionsSq: [
      'Një kuzhinë e vogël me 2–3 persona mund të përgatisë dhe dorëzojë rreth 100–150 dreka në ditë me menu të kufizuar (supozim që duhet verifikuar në javën provë).',
      'Zyrat në të njëjtën zonë pranojnë një orar të përbashkët dorëzimi.',
      'Kompanitë i paguajnë faturat brenda 30 ditëve (në praktikë shpesh më vonë).',
      'Interesi verbal nuk është provë; vetëm parapagimi i javës provë dhe rikthimi në javën e dytë e konfirmojnë kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Herbs & microgreens for restaurants — home/greenhouse, solo, low capital
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'erza-dhe-mikrogjelberim-per-restorante',
    nameSq: 'Erëza të freskëta dhe mikrogjelbërim për restorante',
    taglineSq: 'Rritje në serë të vogël ose në ambient të brendshëm, dorëzim javor i freskët te kuzhinierët.',
    descriptionSq:
      'Kultivim në shkallë të vogël i erëzave të freskëta (borzilok, nenexhik, koriandër, majdanoz etj.) dhe i mikrogjelbërimit (në anglisht: microgreens — bimë të reja që priten pa rrënjë pas pak javësh) në një serë të vogël, garazh ose dhomë me rafte dhe ndriçim. Produkti shitet me porosi javore te restorante, hotele, kafene dhe piceri që duan erëza të freskëta, të pastra dhe në sasi të parashikueshme, pa humbje nga produkti i vyshkur. Mund të niset nga një person, me kapital të vogël, por kërkon disiplinë të përditshme dhe higjienë.',
    sector: 'bujqesi',
    offerSq:
      'Abonim javor për restorant: 3–6 lloje mikrogjelbërimi dhe erëzash të freskëta sipas menusë së kuzhinierit, në kuti ose në tabaka të gjalla, dorëzim në një ditë fikse të javës, sasi e ndryshueshme deri 48 orë para dorëzimit dhe zëvendësim falas i produktit që nuk arrin në gjendje të mirë.',
    payingCustomerSq: 'Kuzhinieri kryesor ose pronari i restorantit, hotelit, kafenesë ose picerisë.',
    customerSegments: ['b2b'],
    problemSq:
      'Kuzhinat blejnë erëza të freskëta në sasi më të mëdha se nevoja, një pjesë vyshket dhe hidhet; furnizimi nga tregu ndryshon në cilësi dhe disponueshmëri, dhe mikrogjelbërimi për dekorim shpesh mungon ose vjen i dëmtuar nga transporti i gjatë.',
    modes: ['fizik'],
    marketScopes: ['lokal'],
    canStartFromHome: true,
    minTeam: 'vetem',
    requiredSkills: ['bujqesi'],
    helpfulSkills: ['shitje', 'sherbim_klienti', 'gatim', 'fotografi_video'],
    helpfulAssets: ['sere', 'toke', 'punishte', 'apartament_shtese', 'automjet', 'motor_bicikleta'],
    minHoursPerWeek: 15,
    regulated: true,
    regulationNotesSq: [
      'Shitja e produkteve ushqimore të freskëta te restorantet zakonisht kërkon regjistrim si prodhues primar ose si operator ushqimor: Kërkon verifikim lokal.',
      'Në disa vende filizat (farat e mbira) kanë rregulla të veçanta sigurie ushqimore; verifikoni nëse mikrogjelbërimi trajtohet njësoj dhe çfarë kërkohet për origjinën e farës dhe për ujin.',
      'Uji i ujitjes duhet të jetë i pijshëm ose i testuar; verifikoni kërkesat për analiza periodike.',
      'Mos përdorni produkte për mbrojtjen e bimëve pa verifikuar që janë të autorizuara për atë kulturë; ndiqni gjithmonë etiketën dhe rregullat lokale.',
      'Faturimi dhe forma e regjistrimit (person fizik, fermer ose biznes): Kërkon verifikim lokal.',
    ],
    licensedProfessionalsSq: [
      'Elektricist i licencuar për instalimin e ndriçimit dhe të prizave, nëse rritet ngarkesa elektrike',
      'Agronom ose specialist i mbrojtjes së bimëve për çdo trajtim, kur nevojitet',
    ],
    adultOnly: false,
    zeroCapitalTestSq:
      'Para se të blini rafte dhe drita: vizitoni 12–15 kuzhinierë në orët e qeta dhe pyetini si i blejnë sot erëzat, sa hedhin dhe çfarë u mungon. Nëse keni tashmë kopsht, serë ose ballkon me erëza, tregoni mostra të vogla që i keni rritur vetë, pa i shitur derisa të keni verifikuar regjistrimin. Kërkoni 3 porosi provë me pagesë për pas 3–4 javësh. Kostoja minimale reale nuk është zero: farë, substrat, disa tabaka dhe transport, zakonisht disa dhjetëra dollarë (supozim).',
    revenueModelSq:
      'Abonim javor për restorant (njësia = 1 porosi javore), me çmim sipas paketës; porositë shtesë për ngjarje faturohen veçmas dhe nuk janë në modelin bazë.',
    pricing: {
      unitLabelSq: 'porosi javore',
      priceUSD: { low: 20, base: 32, high: 55 },
      variableCostUSD: { low: 6, base: 9, high: 14 },
      unitsPerCustomerPerMonth: 4,
      collectionDays: 21,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin farën, substratin, paketimin dhe pjesën e energjisë e të ujit për çdo porosi; nuk përfshin kohën tuaj. Mikrogjelbërimi kërkon shumë farë për tabaka, prandaj çmimi i farës është faktori kryesor — merrni oferta nga 2–3 furnitorë farash të destinuara për mikrogjelbërim. Çmimet e shitjes janë supozime në USD; verifikojini duke pyetur kuzhinierët sa paguajnë sot.',
    },
    startupCosts: [
      {
        id: 'grow-racks',
        labelSq: 'Rafte, drita LED për rritje dhe tabaka',
        category: 'pajisje',
        lowUSD: 500,
        highUSD: 1800,
        noteSq:
          'Varet nga numri i rafteve dhe cilësia e dritave; nisni me 1–2 rafte dhe zgjeroni pas porosive të para. Krahasoni konsumin e energjisë së dritave para blerjes.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'small-greenhouse',
        labelSq: 'Serë e vogël ose tunel plastik për erëzat',
        category: 'pajisje',
        lowUSD: 600,
        highUSD: 3000,
        noteSq:
          'E nevojshme vetëm për erëzat me gjethe në sasi më të mëdha; mikrogjelbërimi mund të rritet brenda. Kërkoni oferta nga furnitorë lokalë serash dhe verifikoni nëse struktura kërkon leje.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['sere'],
      },
      {
        id: 'space-prep',
        labelSq: 'Përshtatja e hapësirës (ventilim, dysheme që lahet, rezervuar uji)',
        category: 'hapje',
        lowUSD: 150,
        highUSD: 800,
        noteSq:
          'Ventilimi dhe pastrimi i lehtë ulin rrezikun e mykut; një mjeshtër lokal mund t’ju japë çmim pas inspektimit. Punimet elektrike vetëm nga elektricist i licencuar.',
        scalesWithPriceLevel: true,
        optional: true,
      },
      {
        id: 'cold-storage',
        labelSq: 'Frigorifer i vogël dhe çanta frigoriferike për dorëzim',
        category: 'pajisje',
        lowUSD: 100,
        highUSD: 500,
        noteSq:
          'Produkti i prerë duhet mbajtur i ftohtë deri në dorëzim; një frigorifer i përdorur mund të mjaftojë në fillim.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'seed-stock',
        labelSq: 'Farë, substrat dhe paketim fillestar',
        category: 'inventar',
        lowUSD: 150,
        highUSD: 450,
        noteSq:
          'Farat për mikrogjelbërim blihen me kg; kontrolloni që të jenë të patrajtuara kimikisht dhe të destinuara për konsum. Krahasoni 2–3 furnitorë.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'registration-water-test',
        labelSq: 'Regjistrim aktiviteti dhe analiza e ujit',
        category: 'tarifa',
        lowUSD: 50,
        highUSD: 400,
        noteSq:
          'Varet nga forma e regjistrimit dhe nga laboratori; merrni listën zyrtare të kërkesave dhe çmimin e analizave nga një laborator lokal.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: mostra për 10 kuzhinierë dhe 3 porosi provë',
        category: 'testim_tregu',
        lowUSD: 50,
        highUSD: 200,
        noteSq: 'Farë dhe paketim për mostrat, transport për vizitat dhe për dorëzimet provë gjatë 4 javëve.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'space-rent',
        labelSq: 'Qira e një hapësire të vogël (nëse nuk keni)',
        category: 'qira',
        lowUSD: 100,
        highUSD: 500,
        noteSq:
          'Nevojitet vetëm nëse nuk keni dhomë, garazh ose serë; verifikoni që pronari lejon ujitje dhe konsum të vazhdueshëm energjie.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['sere', 'punishte', 'apartament_shtese'],
      },
      {
        id: 'energy-water',
        labelSq: 'Energji për dritat dhe ventilimin, ujë',
        category: 'sherbime_komunale',
        lowUSD: 40,
        highUSD: 180,
        noteSq:
          'Dritat e ndezura shumë orë në ditë janë kosto kryesore; matni konsumin real me një matës të thjeshtë në muajin e parë dhe krahasoni tarifat e energjisë.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'delivery-transport',
        labelSq: 'Transport për dorëzimet javore',
        category: 'transport',
        lowUSD: 30,
        highUSD: 150,
        noteSq:
          'Varet nga distanca mes restoranteve; një ditë e vetme dorëzimi në një zonë e ul ndjeshëm koston.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'bookkeeping',
        labelSq: 'Kontabilitet dhe faturim',
        category: 'kontabilitet',
        lowUSD: 0,
        highUSD: 60,
        noteSq:
          'Në disa vende fermerët ose aktivitetet e vogla kanë regjim të thjeshtuar; verifikoni detyrimet lokale.',
        scalesWithPriceLevel: true,
        optional: true,
      },
      {
        id: 'cleaning-trays',
        labelSq: 'Pastrim, dezinfektim dhe zëvendësim tabakash',
        category: 'mirembajtje',
        lowUSD: 15,
        highUSD: 50,
        noteSq:
          'Tabakat dhe enët pastrohen pas çdo cikli me materiale dezinfektuese të sigurta për ushqim; tabakat e plasaritura zëvendësohen.',
        scalesWithPriceLevel: false,
      },
    ],
    ramp: {
      konservator: { startCustomers: 1, monthlyNewCustomers: 1, monthlyChurnPct: 8 },
      baze: { startCustomers: 2, monthlyNewCustomers: 2, monthlyChurnPct: 6 },
      optimist: { startCustomers: 3, monthlyNewCustomers: 3, monthlyChurnPct: 5 },
    },
    seasonality: [0.85, 0.85, 0.95, 1.0, 1.05, 1.15, 1.2, 1.2, 1.05, 0.95, 0.85, 0.9],
    seasonalityNoteSq:
      'Kërkesa ndjek punën e restoranteve: më e lartë në sezonin turistik dhe në muajt e ngrohtë, më e ulët në dimër. Në qytete jo-turistike kurba mund të jetë më e sheshtë. Në dimër rritet edhe kostoja e energjisë për ngrohje dhe ndriçim. Vlerat janë supozim.',
    macroLinks: [
      {
        indicatorCode: 'tourism_arrivals',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Turistët rrisin numrin e klientëve në restorante dhe hotele, sidomos në kuzhinat që dekorojnë pjatat dhe përdorin erëza të freskëta.',
        ifSupportsSq:
          'Rritja e vizitorëve sugjeron më shumë restorante aktive dhe më shumë porosi në sezon — kontrolloni nëse zona juaj përfiton prej saj.',
        ifContradictsSq:
          'Pa rritje turizmi, mbështetuni te restorantet që u shërbejnë klientëve vendas gjatë gjithë vitit.',
      },
      {
        indicatorCode: 'household_consumption_growth',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Kur familjet shpenzojnë më shumë, rriten daljet në restorant dhe kuzhinierët investojnë më shumë në prezantimin e pjatave.',
        ifSupportsSq:
          'Rritja e konsumit e bën më të besueshme kërkesën për produkte me vlerë më të lartë, si mikrogjelbërimi.',
        ifContradictsSq:
          'Me konsum në rënie, restorantet presin të parat kostot e dekorimit; fokusohuni te erëzat bazë që përdoren në gatim.',
      },
      {
        indicatorCode: 'urban_population_pct',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Restorantet përqendrohen në qytete; dendësia e tyre lejon që disa restorante të furnizohen në një rrugë të vetme dorëzimi.',
        ifSupportsSq: 'Popullsia e lartë urbane sugjeron më shumë restorante brenda një distance të arsyeshme dorëzimi.',
        ifContradictsSq: 'Në zona me pak qytete, distancat rriten dhe transporti mund ta hajë marzhin.',
      },
      {
        indicatorCode: 'inflation_cpi',
        direction: 'me_i_ulet_mbeshtet',
        mechanismSq:
          'Me inflacion të lartë, restorantet shtrëngojnë blerjet dhe negociojnë me furnitorët; produktet që shihen si “dekor” janë më të ekspozuara.',
        ifSupportsSq: 'Inflacioni i ulët e bën më të lehtë mbajtjen e çmimit të abonimit.',
        ifContradictsSq:
          'Me inflacion të lartë, ofroni paketa më të vogla dhe tregoni sa ulet humbja nga erëzat e hedhura.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Restorantet kujdesen gjithnjë e më shumë për prezantimin dhe freskinë, ndërsa furnizimi nga tregu mbetet i parregullt.',
      problemSq:
        'Erëzat e freskëta vyshken shpejt; kuzhinat hedhin një pjesë të blerjes dhe herë-herë mbeten pa produktin që u duhet.',
      customerSq:
        'Kuzhinierët dhe pronarët e restoranteve, hoteleve dhe kafeneve që përdorin erëza dhe dekorim çdo ditë.',
      offerSq: 'Sasi të vogla, të freskëta dhe të parashikueshme, të dorëzuara çdo javë në të njëjtën ditë.',
      reasonToPaySq:
        'Më pak humbje nga produkti i vyshkur, cilësi e qëndrueshme dhe një furnitor që e përshtat sasinë sipas menusë.',
      profitConditionsSq:
        'Fitimi kërkon 15–25 restorante në një zonë të afërt, pak humbje prodhimi nga myku ose ndriçimi i dobët, dhe kosto energjie të kontrolluar.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq: 'Kuzhinierët i pëlqejnë mostrat, por blejnë shumë pak dhe vetëm për ngjarje të veçanta, jo çdo javë.',
      },
      {
        kind: 'cmim',
        textSq:
          'Restorantet krahasojnë me çmimin e erëzave në tregun me shumicë dhe nuk e paguajnë diferencën për freskinë.',
      },
      {
        kind: 'konkurrence',
        textSq:
          'Distributorët e mëdhenj të frutave dhe perimeve shtojnë mikrogjelbërim në katalog, me dorëzim falas për porosi të mëdha.',
      },
      {
        kind: 'kosto',
        textSq: 'Energjia për dritat dhe fara e shtrenjtë e mikrogjelbërimit e hanë marzhin kur porositë janë të vogla.',
      },
      {
        kind: 'operacionale',
        textSq:
          'Myku, temperatura ose një gabim në ujitje shkatërron një cikël të tërë dhe porositë e javës nuk plotësohen.',
      },
      {
        kind: 'sezonalitet',
        textSq:
          'Në dimër shumë restorante në zona turistike mbyllen ose ulin aktivitetin, ndërsa kostot e energjisë rriten.',
      },
      {
        kind: 'vonesa_pagesash',
        textSq: 'Disa restorante paguajnë me vonesë ose mbyllen pa paguar faturat e fundit.',
      },
    ],
    falsifiersSq: [
      'Nga 15 kuzhinierë të intervistuar, më pak se 4 blejnë sot erëza të freskëta ose mikrogjelbërim të paktën një herë në javë.',
      'Pas 10 mostrave dhe ofertave me çmim, më pak se 3 restorante bëjnë një porosi provë me pagesë.',
      'Kostoja reale variabël për porosi (farë, substrat, energji, paketim) del mbi 50% të çmimit që pranojnë restorantet.',
      'Humbja e prodhimit mbetet mbi 25% të tabakave pas 3 cikleve, pavarësisht përmirësimeve.',
    ],
    differentiationSq: [
      'Ditë fikse dorëzimi dhe sasi e ndryshueshme deri 48 orë para (angazhim shërbimi).',
      'Tabaka të gjalla që kuzhinieri i pret vetë kur i duhen, për freski maksimale.',
      'Lista e llojeve përshtatet me menunë e secilit restorant, jo një katalog i fiksuar.',
    ],
    competitorTypesSq: [
      'Distributorë frutash dhe perimesh me shumicë',
      'Tregu me shumicë dhe tregjet e fermerëve',
      'Restorante që i rritin vetë erëzat në vazo',
      'Prodhues të tjerë të vegjël me serë',
    ],
    cheapestTestSq:
      'Intervista me 15 kuzhinierë + mostra nga 2–3 lloje mikrogjelbërimi të rritura në shtëpi për të treguar cilësinë (pa i shitur pa regjistrim). Synimi: 3 porosi provë me pagesë për 4 javë. Matni porositë e përsëritura, jo komplimentet.',
    interviewQuestionsSq: [
      'Nga i blini sot erëzat e freskëta dhe sa herë në javë porosisni?',
      'Sa ju kushtoi porosia e fundit e erëzave ose e mikrogjelbërimit?',
      'Kur ishte hera e fundit që ju mungoi një erëz ose erdhi e vyshkur? Çfarë bëtë?',
      'Sa nga erëzat që blini në një javë përfundojnë të hedhura, sipas vlerësimit tuaj?',
      'Si e zgjidhni sot dekorimin e pjatave kur nuk keni mikrogjelbërim?',
      'Kush vendos për ndërrimin e një furnitori dhe çfarë e shkaktoi ndërrimin e fundit?',
      'Në cilët muaj ndryshon më shumë sasia që porosisni?',
    ],
    firstCustomers: {
      whereSq: [
        'Restorante dhe hotele brenda 20–30 minutash nga vendi i kultivimit',
        'Restorante që theksojnë produkte të freskëta ose vendase në menu',
        'Kafene dhe piceri që përdorin borzilok dhe erëza çdo ditë',
        'Shkolla kulinarie ose kuzhinierë që i njihni personalisht',
      ],
      howToContactSq: [
        'Vizitë personale në orët e qeta (zakonisht pasdite herët), me mostra të paketuara mirë',
        'Prezantim nga një kuzhinier i njohur te kolegët e tij',
        'Një mesazh i vetëm, i personalizuar, në kanalin publik të restorantit; pa mesazhe masive',
      ],
      offerSq:
        'Katër porosi javore provë me çmim të plotë, pa detyrim për vazhdim; zëvendësim falas i çdo produkti që nuk arrin në gjendje të mirë.',
      followUpSq:
        'Pas dorëzimit të dytë, pyetni kuzhinierin çfarë përdori dhe çfarë mbeti, dhe rregulloni sasinë. Një rikujtesë e vetme pas 7 ditësh për ata që nuk u përgjigjën.',
      metricsSq: [
        'Mostra → porosi provë (%)',
        'Porosi provë → abonim javor (%)',
        'Humbja e prodhimit (% e tabakave të hedhura)',
        'Kostoja reale variabël për porosi',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje, jam [emri]. Rris erëza të freskëta dhe mikrogjelbërim në [vendi], [distanca] nga restoranti juaj. Ju solla mostra nga [llojet]. Dorëzoj një herë në javë, të [dita], në sasinë që më thoni deri 48 orë më parë. A mund të më tregoni si i blini sot erëzat dhe çfarë ju mungon më shpesh?',
    offerTemplateSq:
      'Oferta për [emri i restorantit]: (1) porosi javore me [llojet] në [kuti ose tabaka të gjalla]; (2) dorëzim çdo [dita] para orës [ora]; (3) ndryshim sasie deri 48 orë para dorëzimit; (4) zëvendësim falas i produktit që nuk arrin në gjendje të mirë; (5) çmimi [çmimi] për porosi javore, faturë çdo 2 javë me pagesë brenda [ditë] ditëve. Provë 4-javore pa detyrim për vazhdim.',
    feedbackQuestionsSq: [
      'Cilat lloje i përdorët të gjitha dhe cilat mbetën?',
      'Sa ditë qëndroi produkti i freskët në frigoriferin tuaj?',
      'Çfarë duhet ndryshuar në paketim ose në ditën e dorëzimit?',
      'Cilët kolegë njihni që blejnë erëza në mënyrë të ngjashme?',
    ],
    goCriteriaSq: [
      'Të paktën 5 restorante me abonim javor pas 2 muajsh provë.',
      'Humbja e prodhimit nën 15% dhe kostoja variabël nën 35% të çmimit.',
    ],
    killCriteriaSq: [
      'Pas 20 vizitave me mostra, më pak se 3 porosi provë me pagesë.',
      'Më shumë se gjysma e restoranteve të provës ndalojnë pas muajit të parë.',
      'Kontributi për porosi (çmimi minus kostoja variabël) mbetet nën gjysmën e çmimit edhe pas 3 cikleve optimizimi.',
    ],
    phaseNotesSq: {
      p10_20: ['Intervistoni 15 kuzhinierë për blerjet e javës së kaluar dhe shënoni sasitë, çmimet dhe humbjet.'],
      p30_40: [
        'Rritni 3 cikle provë dhe matni koston reale për tabaka (farë, substrat, energji) para se ta fiksoni çmimin.',
      ],
      p40_50: [
        'Verifikoni regjistrimin si prodhues ose operator ushqimor dhe kërkesat për ujin para shitjes së parë.',
      ],
      p50_60: [
        'Siguroni 2 furnitorë farash dhe planifikoni mbjellje të shkallëzuara, që çdo javë të ketë prodhim gati.',
      ],
      p60_70: ['Provë 4-javore me 3 restorante; regjistroni çdo dorëzim, humbje dhe ndryshim sasie.'],
    },
    assumptionsSq: [
      'Një person me 15–25 orë në javë mund të furnizojë 15–25 restorante me procese të rregullta.',
      'Restorantet pranojnë një ditë fikse dorëzimi në javë.',
      'Humbja e prodhimit mund të mbahet nën 15% pas cikleve të para.',
      'Interesi verbal nuk është provë; vetëm porositë e përsëritura me pagesë e konfirmojnë kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Honey & bee products, direct sales — home/apiary, solo, mid capital
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'mjalte-dhe-produkte-bletarie-me-shitje-direkte',
    nameSq: 'Mjaltë dhe produkte bletarie me shitje direkte',
    taglineSq: 'Nga koshere juaj te tavolina e klientit: etiketë e qartë, origjinë e njohur, pa ndërmjetës.',
    descriptionSq:
      'Biznes për bletarë (ose për ata që duan të bëhen të tillë, me kujdes dhe kohë) që e shesin mjaltin, dyllin, polenin dhe produkte të tjera të bletës drejtpërdrejt te familjet dhe te disa dyqane lokale, në vend që t’ua shesin me shumicë grumbulluesve me çmim të ulët. Vlera për klientin është origjina e njohur dhe besimi: shpesh blerësit duan të dinë nga vjen mjalti dhe kush e prodhon. Kërkon njohuri bletarie, regjistrim veterinar të bletishtes dhe etiketim të saktë.',
    sector: 'bujqesi',
    offerSq:
      'Mjaltë në kavanozë 250 g, 500 g dhe 1 kg me etiketë që tregon zonën, vitin e vjeljes dhe prodhuesin, plus dyll, polen dhe kuti dhuratash; shitje në bletishte ose në shtëpi, në tregun e fermerëve, me porosi me telefon ose mesazh me dorëzim lokal, dhe te 3–10 dyqane lokale me çmim shumice.',
    payingCustomerSq:
      'Familje në qytet që duan mjaltë me origjinë të njohur, dhe pronarë dyqanesh ushqimore ose produktesh vendase.',
    customerSegments: ['b2c', 'b2b'],
    problemSq:
      'Blerësit nuk e dinë nga vjen mjalti që gjejnë në treg dhe e kanë të vështirë të gjejnë një prodhues të besueshëm; bletarët e vegjël, nga ana tjetër, shpesh ua shesin prodhimin grumbulluesve me çmim të ulët, sepse nuk kanë kanal shitjeje dhe etiketë.',
    modes: ['fizik', 'kombinuar'],
    marketScopes: ['lokal'],
    canStartFromHome: true,
    minTeam: 'vetem',
    requiredSkills: ['bujqesi'],
    helpfulSkills: ['shitje', 'marketing_digjital', 'fotografi_video', 'dizajn_grafik', 'sherbim_klienti'],
    helpfulAssets: ['toke', 'automjet', 'telefon_smart', 'magazine', 'punishte'],
    minHoursPerWeek: 12,
    regulated: true,
    regulationNotesSq: [
      'Regjistrimi i bletishtes dhe i koshereve pranë autoritetit veterinar, si dhe lëvizja e koshereve: Kërkon verifikim lokal.',
      'Ambienti i nxjerrjes dhe i paketimit të mjaltit duhet të plotësojë kërkesat e higjienës ushqimore; verifikoni nëse shitja direkte e sasive të vogla ka regjim të thjeshtuar në vendin tuaj.',
      'Etiketa: emri i produktit, pesha neto, origjina, data e qëndrueshmërisë, prodhuesi dhe numri i serisë (lot) — verifikoni listën e plotë të detyrueshme lokalisht.',
      'Mos shkruani pretendime shëndetësore ose mjekësore (p.sh. “shëron”); në shumë vende janë të ndaluara pa autorizim. Verifikoni rregullat e reklamimit të ushqimeve.',
      'Ilaçet veterinare për bletët përdoren vetëm sipas udhëzimit të veterinerit dhe me afatet e pritjes para vjeljes; dyqanet mund të kërkojnë analiza për mbetjet.',
      'Dërgimi i mjaltit jashtë vendit (p.sh. te diaspora) kërkon verifikim të rregullave të importit të produkteve me origjinë shtazore në vendin e destinacionit; shpesh është i kufizuar për sasi tregtare.',
    ],
    licensedProfessionalsSq: [
      'Veteriner për shëndetin e bletëve dhe për përdorimin e ilaçeve',
      'Laborator i akredituar për analizat e mjaltit (lagështia, mbetjet), kur kërkohen',
    ],
    adultOnly: false,
    zeroCapitalTestSq:
      'Nëse keni tashmë koshere ose një të afërm bletar: para çdo investimi në etiketa dhe pajisje, shkruani kujt i shitët mjaltë vitin e kaluar dhe me çfarë çmimi, pastaj pyetni 20 familje dhe 5 dyqane si e blejnë sot mjaltin dhe sa paguajnë. Kërkoni 10 parapagime për vjeljen e ardhshme. Kostoja reale nuk është zero: kavanozë, etiketa të thjeshta dhe transport, plus regjistrimi veterinar nëse nuk e keni. Nëse nuk keni bletë, nisja kërkon koshere, familje bletësh dhe të paktën një sezon mësimi — nuk ka rrugë pa kapital.',
    revenueModelSq:
      'Shitje për kavanoz (njësia = kavanoz 500 g ose ekuivalent) me çmim pakice te familjet dhe me çmim më të ulët shumice te dyqanet; dylli, poleni dhe kutitë e dhuratave janë të ardhura shtesë jashtë modelit bazë.',
    pricing: {
      unitLabelSq: 'kavanoz 500 g',
      priceUSD: { low: 7, base: 11, high: 17 },
      variableCostUSD: { low: 2.2, base: 3.4, high: 5 },
      unitsPerCustomerPerMonth: 1.5,
      collectionDays: 5,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin kavanozin, kapakun, etiketën dhe pjesën për kavanoz të ushqimit dimëror, të trajtimeve dhe të zëvendësimit të familjeve të bletëve; nuk përfshin punën tuaj. “Klient” është një familje e rregullt ose një dyqan i vogël (mesatarisht rreth 1–2 kavanozë në muaj). Shitjet nuk mund ta kalojnë prodhimin: rendimenti për koshere ndryshon shumë sipas vitit, zonës dhe përvojës — llogaritni me të dhënat tuaja ose të bletarëve vendas. Çmimet janë supozime në USD; verifikojini në tregjet dhe dyqanet lokale.',
    },
    startupCosts: [
      {
        id: 'hives-colonies',
        labelSq: 'Koshere me familje bletësh (nëse nuk keni)',
        category: 'pajisje',
        lowUSD: 1500,
        highUSD: 5000,
        noteSq:
          'Varet nga numri i koshereve dhe nga burimi i familjeve; blini vetëm nga bletarë të regjistruar me bletë të shëndetshme dhe pyesni veterinerin. Hiqeni këtë zë nëse i keni tashmë koshere.',
        scalesWithPriceLevel: false,
        optional: true,
      },
      {
        id: 'extraction-equipment',
        labelSq: 'Pajisje nxjerrjeje dhe paketimi (centrifugë, kova inoksi, filtra)',
        category: 'pajisje',
        lowUSD: 400,
        highUSD: 1800,
        noteSq:
          'Materiali duhet të jetë i përshtatshëm për ushqim; pajisjet e përdorura e ulin koston. Në disa zona shoqatat e bletarëve i ndajnë pajisjet — pyesni.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'protective-gear',
        labelSq: 'Veshje mbrojtëse dhe mjete bletarie',
        category: 'pajisje',
        lowUSD: 80,
        highUSD: 300,
        noteSq: 'Maskë, doreza, tymues dhe mjete pune; madhësia dhe cilësia ndikojnë në çmim.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'jars-labels',
        labelSq: 'Kavanozë, kapakë, etiketa dhe paketim fillestar',
        category: 'inventar',
        lowUSD: 250,
        highUSD: 800,
        noteSq:
          'Sasia varet nga prodhimi i pritur; porositni etiketa në sasi të vogël derisa ta keni verifikuar tekstin e detyrueshëm.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'lab-analysis',
        labelSq: 'Analiza laboratorike e mjaltit',
        category: 'tarifa',
        lowUSD: 80,
        highUSD: 400,
        noteSq:
          'Disa dyqane dhe tregje kërkojnë analiza për lagështinë ose mbetjet; pyesni laboratorët e akredituar për çmimin dhe afatin.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'vet-registration',
        labelSq: 'Regjistrim veterinar, regjistrim aktiviteti dhe tarifa tregu',
        category: 'tarifa',
        lowUSD: 30,
        highUSD: 300,
        noteSq:
          'Procedura dhe tarifat ndryshojnë; merrni listën nga autoriteti veterinar dhe nga regjistri zyrtar i bizneseve.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: kavanozë provë dhe tavolinë në tregun e fermerëve',
        category: 'testim_tregu',
        lowUSD: 50,
        highUSD: 250,
        noteSq:
          'Pagesa për vendin në treg (nëse ka), kavanozë të vegjël për shije, etiketa provë dhe transport për 3–4 ditë tregu.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'apiary-transport',
        labelSq: 'Transport te bletishtja dhe për dorëzime',
        category: 'transport',
        lowUSD: 40,
        highUSD: 150,
        noteSq:
          'Varet nga distanca e bletishtes dhe numri i dorëzimeve; grupimi i dorëzimeve në një ditë të javës e ul koston.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'apiary-site',
        labelSq: 'Qira ose kompensim për vendin e bletishtes',
        category: 'qira',
        lowUSD: 0,
        highUSD: 80,
        noteSq:
          'Shpesh bletarët i vendosin koshere në tokën e të tjerëve me marrëveshje; dakordësohuni me shkrim dhe verifikoni distancat e lejuara nga banesat dhe rrugët.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['toke'],
      },
      {
        id: 'online-listing',
        labelSq: 'Profil online, fotografi dhe katalog i thjeshtë',
        category: 'software',
        lowUSD: 10,
        highUSD: 40,
        noteSq: 'Profil në hartat online dhe një katalog i thjeshtë; shumica e mjeteve kanë plane falas në fillim.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'liability-insurance',
        labelSq: 'Sigurim përgjegjësie',
        category: 'sigurime',
        lowUSD: 10,
        highUSD: 50,
        noteSq:
          'Mbulon dëmet ndaj palëve të treta (p.sh. pickime pranë bletishtes); pyesni 2 agjenci për çmimin.',
        scalesWithPriceLevel: true,
        optional: true,
      },
      {
        id: 'bookkeeping',
        labelSq: 'Kontabilitet',
        category: 'kontabilitet',
        lowUSD: 0,
        highUSD: 60,
        noteSq:
          'Fermerët dhe prodhuesit e vegjël mund të kenë regjim të thjeshtuar; verifikoni detyrimet lokale.',
        scalesWithPriceLevel: true,
        optional: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 5, monthlyNewCustomers: 3, monthlyChurnPct: 10 },
      baze: { startCustomers: 10, monthlyNewCustomers: 5, monthlyChurnPct: 8 },
      optimist: { startCustomers: 15, monthlyNewCustomers: 8, monthlyChurnPct: 6 },
    },
    seasonality: [1.1, 1.05, 0.95, 0.85, 0.8, 0.8, 0.8, 0.85, 1.0, 1.15, 1.25, 1.4],
    seasonalityNoteSq:
      'Shitjet e mjaltit priren të rriten në muajt e ftohtë dhe para festave të fundvitit (dhurata), dhe të bien në verë. Vjelja ndodh në muaj të ndryshëm sipas klimës; në hemisferën jugore kalendari është i kundërt. Një vit me mot të keq mund ta ulë prodhimin pavarësisht kërkesës. Vlerat janë supozim.',
    macroLinks: [
      {
        indicatorCode: 'urban_population_pct',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Familjet në qytet kanë më pak lidhje të drejtpërdrejta me prodhuesit në fshat, ndaj paguajnë për origjinë të njohur dhe për dorëzim.',
        ifSupportsSq: 'Popullsia e lartë urbane sugjeron më shumë blerës që kërkojnë një bletar të besueshëm.',
        ifContradictsSq:
          'Në zona kryesisht rurale, shumë familje e marrin mjaltin nga të afërmit; shitja direkte duhet synuar te qytetet më të afërta.',
      },
      {
        indicatorCode: 'household_consumption_growth',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Mjalti me origjinë të njohur kushton më shumë se alternativat e lira; rritja e konsumit e bën më të lehtë pranimin e kësaj diference.',
        ifSupportsSq: 'Rritja e konsumit mbështet çmime pakice më të larta për produktin me etiketë.',
        ifContradictsSq:
          'Kur konsumi bie, blerësit kalojnë te mjalti më i lirë; mbani kavanozë më të vegjël dhe çmim të qartë për gram.',
      },
      {
        indicatorCode: 'tourism_arrivals',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Vizitorët blejnë produkte vendase si kujtim ose dhuratë, sidomos kur mund ta takojnë prodhuesin.',
        ifSupportsSq: 'Rritja e turizmit hap kanale shtesë: dyqane suveniresh, bujtina dhe tregje verore.',
        ifContradictsSq: 'Pa turizëm, mbështetuni te familjet vendase dhe te dyqanet ushqimore.',
      },
      {
        indicatorCode: 'inflation_cpi',
        direction: 'me_i_ulet_mbeshtet',
        mechanismSq:
          'Inflacioni i lartë rrit koston e kavanozëve, të sheqerit për ushqimin dimëror dhe të transportit, ndërsa blerësit bëhen më të ndjeshëm ndaj çmimit.',
        ifSupportsSq: 'Inflacioni i ulët e bën më të parashikueshëm çmimin e vitit.',
        ifContradictsSq:
          'Me inflacion të lartë, rishikoni çmimet para çdo vjeljeje dhe mos i fiksoni çmimet për dyqanet për më shumë se një sezon.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Blerësit kërkojnë gjithnjë e më shumë të dinë origjinën e ushqimit, ndërsa telefoni e lehtëson shitjen direkte nga prodhuesi.',
      problemSq:
        'Mjalti në treg ka origjinë të paqartë për blerësin, dhe bletarët e vegjël marrin çmim të ulët nga grumbulluesit.',
      customerSq: 'Familje në qytet, njerëz që blejnë dhurata dhe dyqane produktesh vendase.',
      offerSq: 'Mjaltë me etiketë të qartë, nga një prodhues që klienti mund ta njohë dhe ta kontaktojë.',
      reasonToPaySq: 'Besim te origjina, shija e zonës dhe marrëdhënie e drejtpërdrejtë me prodhuesin.',
      profitConditionsSq:
        'Fitimi kërkon prodhim të qëndrueshëm nga koshere të shëndetshme, shitjen direkte të pjesës më të madhe të prodhimit me çmim pakice dhe kosto të ulët për kavanoz dhe transport.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq: 'Familjet blejnë një herë, por nuk kthehen; shitjet mbeten të kufizuara te të afërmit dhe miqtë.',
      },
      {
        kind: 'cmim',
        textSq: 'Blerësit krahasojnë me mjaltin më të lirë në supermarket dhe nuk e pranojnë diferencën.',
      },
      {
        kind: 'konkurrence',
        textSq: 'Shumë bletarë të tjerë në zonë shesin direkt, shpesh pa etiketë dhe me çmim më të ulët.',
      },
      {
        kind: 'kosto',
        textSq:
          'Kavanozët, ushqimi dimëror dhe trajtimet shtrenjtohen, ndërsa çmimi i shitjes mbetet i njëjtë.',
      },
      {
        kind: 'sezonalitet',
        textSq:
          'Një vit me thatësirë, shira ose ngrica të vonshme e ul ndjeshëm prodhimin dhe ka pak për të shitur.',
      },
      {
        kind: 'operacionale',
        textSq:
          'Sëmundjet dhe parazitët e bletëve shkaktojnë humbje familjesh; rimëkëmbja kërkon kosto dhe kohë.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Etiketa pa elementet e detyrueshme ose me pretendime shëndetësore e bën produktin të pashitshëm në dyqane.',
      },
    ],
    falsifiersSq: [
      'Nga 20 familje të intervistuara në qytet, më pak se 5 kanë blerë mjaltë direkt nga një prodhues gjatë vitit të fundit.',
      'Pas 3 ditësh në tregun e fermerëve, shitjet mbeten nën 10 kavanozë në ditë me çmimin bazë.',
      'Dyqanet lokale ofrojnë një çmim shumice që nuk mbulon koston variabël plus kohën e dorëzimit.',
      'Më pak se 20% e blerësve të parë blejnë sërish brenda 3 muajve.',
    ],
    differentiationSq: [
      'Etiketë me zonën dhe vitin e vjeljes, dhe vizitë e mundshme te bletishtja me paralajmërim dhe masa sigurie, për dyqanet dhe klientët e rregullt.',
      'Analiza laboratorike në dispozicion të blerësve që i kërkojnë.',
      'Kavanozë të vegjël provë dhe kuti dhuratash për festat.',
    ],
    competitorTypesSq: [
      'Mjaltë i paketuar në supermarket',
      'Bletarë të tjerë që shesin direkt ose në treg',
      'Grumbullues dhe paketues me shumicë',
      'Të afërm ose fqinjë bletarë që e japin si dhuratë',
    ],
    cheapestTestSq:
      'Tre ditë në një treg fermerësh ose para një dyqani partner (me leje), me kavanozë provë të etiketuar saktë dhe çmim të qartë. Matni kavanozët e shitur në ditë, çmimin mesatar dhe sa blerës lënë kontaktin për blerjen e radhës.',
    interviewQuestionsSq: [
      'Kur keni blerë mjaltë herën e fundit dhe ku e keni blerë?',
      'Sa paguat për kavanozin e fundit dhe sa gram ishte?',
      'Si e kuptoni sot nëse një mjaltë është i mirë apo jo?',
      'Sa kavanozë mjalti konsumon familja juaj në një vit, përafërsisht?',
      'Keni blerë ndonjëherë mjaltë si dhuratë? Për kë dhe në cilin muaj?',
      'Nga cili prodhues keni blerë më parë dhe pse nuk vazhduat?',
      'Për dyqanet: si e zgjidhni sot furnitorin e mjaltit dhe çfarë dokumentesh i kërkoni?',
    ],
    firstCustomers: {
      whereSq: [
        'Tregjet e fermerëve dhe panairet e produkteve vendase',
        'Dyqane ushqimore të lagjes dhe dyqane produktesh vendase',
        'Kolegë, fqinjë dhe grupe komunitare ku jeni anëtar',
        'Bujtina dhe dyqane suveniresh në zona turistike',
      ],
      howToContactSq: [
        'Tavolinë me shije në treg (me lejen e organizatorit) dhe kartë me kontaktin',
        'Vizitë personale te pronarët e dyqaneve me një kavanoz shembull dhe çmim shumice të shkruar',
        'Postim në grupet komunitare ku rregullat e lejojnë, pa mesazhe masive private',
      ],
      offerSq:
        'Kavanoz provë 250 g me çmim të reduktuar për blerjen e parë; për dyqanet, 6 kavanozë në konsinjacion për 30 ditë, pastaj blerje e rregullt.',
      followUpSq:
        'Shënoni çdo blerës që lë kontaktin dhe kontaktojeni vetëm një herë kur ka vjelje të re; për dyqanet, kontrolloni stokun çdo 2 javë.',
      metricsSq: [
        'Kavanozë të shitur në ditë tregu',
        'Blerës që blejnë sërish brenda 3 muajve (%)',
        'Çmimi mesatar për kavanoz (pakicë dhe shumicë)',
        'Pjesa e prodhimit e shitur direkt (%)',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje, jam [emri], bletar në [zona]. Koshere i kam në [vendi] dhe mjaltin e nxjerr dhe e paketoj vetë. Në etiketë shkruhet zona, viti i vjeljes dhe kontakti im, që ta dini nga vjen. Kam kavanozë [madhësitë] me çmim [çmimi]; mund ta provoni para se ta blini.',
    offerTemplateSq:
      'Oferta për [emri i dyqanit]: (1) mjaltë [lloji] në kavanozë [madhësia], me etiketë të plotë dhe numër serie; (2) çmim shumice [çmimi] për kavanoz, minimum [sasia]; (3) furnizim çdo [periudha] me dorëzim falas brenda [zona]; (4) analizë laboratorike në dispozicion me kërkesë; (5) pagesë brenda [ditë] ditëve. Nuk bëjmë pretendime shëndetësore për produktin.',
    feedbackQuestionsSq: [
      'Çfarë ju pëlqeu dhe çfarë nuk ju pëlqeu te shija ose te kavanozi?',
      'Për çfarë e përdorët mjaltin?',
      'Cila madhësi kavanozi ju përshtatet më shumë?',
      'Çfarë ju bëri ta blini nga ne dhe jo nga dyqani?',
    ],
    goCriteriaSq: [
      'Të paktën 30% e blerësve të parë blejnë sërish brenda 3 muajve.',
      'Mbi 60% e prodhimit shitet direkt ose te dyqanet me çmimin e planifikuar para vjeljes së radhës.',
    ],
    killCriteriaSq: [
      'Pas 4 ditësh tregu dhe 10 vizitave në dyqane, më pak se 40 kavanozë të shitur me çmimin bazë.',
      'Kostoja variabël për kavanoz kalon 50% të çmimit mesatar të shitjes.',
      'Humbjet e familjeve të bletëve kalojnë një të tretën në një sezon dhe nuk ka buxhet për zëvendësim.',
    ],
    phaseNotesSq: {
      p00_10: [
        'Llogaritni prodhimin realist me të dhënat e viteve tuaja ose të bletarëve vendas, jo me mesatare nga interneti.',
      ],
      p10_20: ['Intervistoni 20 familje dhe 5 dyqane për blerjet e fundit të mjaltit dhe çmimin e paguar.'],
      p40_50: [
        'Verifikoni regjistrimin veterinar, kërkesat për ambientin e paketimit dhe tekstin e detyrueshëm të etiketës.',
      ],
      p60_70: [
        'Tre ditë në tregun e fermerëve me etiketë të verifikuar; regjistroni shitjet dhe kontaktet e blerësve.',
      ],
      p90_100: [
        'Shtoni koshere vetëm kur shitjet direkte e kanë kaluar prodhimin aktual, sipas të dhënave tuaja.',
      ],
    },
    assumptionsSq: [
      'Bletari i ka ose mund t’i fitojë njohuritë bazë dhe ka ndihmën e një veterineri.',
      'Pjesa më e madhe e prodhimit mund të shitet direkt me çmim pakice; pjesa tjetër shkon te dyqanet me çmim shumice.',
      'Rendimenti ndryshon fort nga viti në vit; modeli nuk e kufizon automatikisht shitjen me prodhimin — kontrollojeni vetë.',
      'Interesi verbal nuk është provë; vetëm blerjet e përsëritura e konfirmojnë kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 4. Phone & electronics repair — home first, then counter; solo, low capital
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'riparim-telefonash-dhe-elektronike',
    nameSq: 'Riparim telefonash dhe pajisjesh elektronike',
    taglineSq: 'Ekran, bateri, port karikimi: çmim i qartë para punës dhe garanci e shkruar për riparimin.',
    descriptionSq:
      'Banak riparimi për telefona, tableta dhe laptopë: zëvendësim ekranesh, baterish, portesh karikimi, kamerash dhe pastrim nga lagështia, me diagnozë dhe çmim të konfirmuar para punës. Mund të niset nga një person me aftësi teknike, fillimisht nga një tavolinë pune në shtëpi për rrjetin e njohjeve dhe më pas në një banak të vogël me qira ose brenda një dyqani tjetër. Kërkon kujdes të veçantë me bateritë litiumi, me mbetjet elektronike dhe me të dhënat personale të klientëve.',
    sector: 'riparime',
    offerSq:
      'Riparime të zakonshme me çmim të publikuar: ekran, bateri, port karikimi, kamerë, butona dhe pastrim nga lagështia; diagnozë falas ose me tarifë të vogël që zbritet nga riparimi; afat i shkruar (p.sh. brenda ditës për riparimet e zakonshme kur pjesa është gati); garanci e shkruar për pjesën dhe punën; marrje dhe kthim për biznese të vogla me disa pajisje.',
    payingCustomerSq: 'Individë me pajisje të dëmtuar dhe biznese të vogla që varen nga telefonat dhe laptopët e stafit.',
    customerSegments: ['b2c', 'b2b'],
    problemSq:
      'Një telefon i dëmtuar ndërpret punën, pagesat dhe komunikimin; pajisja e re kushton shumë, servisi zyrtar mund të jetë larg ose i ngadaltë, dhe shumë klientë nuk u besojnë riparuesve pa çmim të qartë dhe pa garanci.',
    modes: ['fizik', 'kombinuar'],
    marketScopes: ['lokal'],
    canStartFromHome: true,
    minTeam: 'vetem',
    requiredSkills: ['riparim_elektronike'],
    helpfulSkills: ['sherbim_klienti', 'shitje', 'it_mbeshtetje', 'marketing_digjital'],
    helpfulAssets: ['dyqan_lokal', 'vegla_pune', 'telefon_smart', 'kompjuter', 'motor_bicikleta'],
    minHoursPerWeek: 25,
    regulated: true,
    regulationNotesSq: [
      'Bateritë litiumi të dëmtuara ose të fryra paraqesin rrezik zjarri: ruajini sipas udhëzimeve të prodhuesit dhe rregullave lokale të sigurisë nga zjarri, në enë të përshtatshme dhe larg materialeve të djegshme. Verifikoni kërkesat për ambientin e punës.',
      'Mbetjet elektronike dhe bateritë e përdorura nuk hidhen me mbeturinat e zakonshme; verifikoni pikat ose operatorët e autorizuar për grumbullimin e tyre në zonën tuaj.',
      'Të dhënat personale në pajisjet e klientëve: mos i hapni pa nevojë, kërkoni pëlqim me shkrim dhe verifikoni rregullat lokale të mbrojtjes së të dhënave.',
      'Të drejtat e konsumatorit (garancia ligjore, kthimi, faturimi) dhe regjistrimi i aktivitetit: Kërkon verifikim lokal.',
      'Importi i drejtpërdrejtë i pjesëve nga jashtë mund të ketë taksa doganore dhe kufizime për transportin e baterive; verifikoni para porosive të mëdha.',
      'Mos pranoni pajisje me origjinë të dyshimtë; verifikoni nëse në vendin tuaj kërkohet regjistrimi i pajisjeve të pranuara (p.sh. numri IMEI).',
    ],
    licensedProfessionalsSq: ['Operator i autorizuar për grumbullimin e mbetjeve elektronike dhe të baterive'],
    adultOnly: false,
    zeroCapitalTestSq:
      'Nëse i keni tashmë aftësitë dhe veglat bazë: njoftoni rrjetin tuaj të njohjeve dhe 5–10 biznese të vogla në lagje se riparoni ekrane dhe bateri me çmim të shkruar paraprakisht, dhe porositni pjesën vetëm pasi klienti ta ketë pranuar çmimin dhe të ketë paguar një paradhënie. Kështu nuk mbani stok. Kostoja reale: pjesët (të mbuluara nga paradhënia), një enë e sigurt për bateritë dhe koha juaj; regjistrimi dhe faturimi kërkojnë verifikim lokal para se të punoni rregullisht.',
    revenueModelSq:
      'Pagesë për riparim (njësia = 1 riparim i përfunduar) kur klienti merr pajisjen; marzhi vjen nga puna, jo nga pjesa. Aksesorët dhe marrëveshjet me biznese për disa pajisje janë të ardhura shtesë jashtë modelit bazë.',
    pricing: {
      unitLabelSq: 'riparim',
      priceUSD: { low: 35, base: 65, high: 110 },
      variableCostUSD: { low: 12, base: 24, high: 45 },
      unitsPerCustomerPerMonth: 1,
      collectionDays: 0,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël është kryesisht pjesa (ekran, bateri, port) plus materiale të vogla; ndryshon shumë sipas modelit dhe cilësisë së pjesës. Këtu “klient” = një riparim në muaj; humbja e lartë mujore në skenarë pasqyron që shumica e klientëve vijnë një herë dhe vetëm një pjesë kthehen ose sjellin të tjerë. Çmimet janë supozime në USD; verifikoni çmimet e pjesëve nga 2–3 furnitorë dhe çmimet e riparuesve në zonë.',
    },
    startupCosts: [
      {
        id: 'repair-tools',
        labelSq: 'Stacion saldimi, zmadhues, mjete hapjeje dhe furnizues energjie laboratorik',
        category: 'pajisje',
        lowUSD: 500,
        highUSD: 2200,
        noteSq:
          'Cilësia e veglave ndikon drejtpërdrejt në dëmtimet gjatë riparimit; krahasoni ofertat dhe blini fillimisht vetëm ato që kërkojnë riparimet më të shpeshta.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'battery-safety',
        labelSq: 'Enë e sigurt për bateri, fikës zjarri, tapet antistatik dhe ventilim lokal',
        category: 'pajisje',
        lowUSD: 100,
        highUSD: 400,
        noteSq:
          'E domosdoshme për punën me bateri litiumi; pyesni shërbimin lokal të zjarrfikësve ose një konsulent sigurie për kërkesat minimale.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'parts-stock',
        labelSq: 'Stok i vogël pjesësh për modelet më të zakonshme',
        category: 'inventar',
        lowUSD: 300,
        highUSD: 1500,
        noteSq:
          'Rrezik vjetrimi: modelet ndryshojnë shpejt. Nisni me porosi për çdo punë dhe mbani stok vetëm për 5–10 riparimet që kërkohen më shpesh.',
        scalesWithPriceLevel: false,
        optional: true,
      },
      {
        id: 'counter-setup',
        labelSq: 'Banak, rafte, ndriçim dhe kasë e mbyllur për pajisjet e klientëve',
        category: 'hapje',
        lowUSD: 300,
        highUSD: 1500,
        noteSq:
          'Nevojitet kur kaloni nga shtëpia në banak; një vend brenda një dyqani ekzistues (p.sh. librari ose dyqan aksesorësh) e ul koston.',
        scalesWithPriceLevel: true,
        optional: true,
      },
      {
        id: 'registration-invoicing',
        labelSq: 'Regjistrim aktiviteti dhe pajisje faturimi',
        category: 'tarifa',
        lowUSD: 50,
        highUSD: 400,
        noteSq:
          'Kërkesat për faturim dhe pajisje fiskale ndryshojnë sipas vendit; merrni informacionin nga regjistri zyrtar i bizneseve dhe nga administrata tatimore.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: listë çmimesh e printuar, profil në harta, riparime provë',
        category: 'testim_tregu',
        lowUSD: 40,
        highUSD: 200,
        noteSq:
          'Printimi i listës së çmimeve, transporti te bizneset e lagjes dhe disa riparime provë për të njohur kohën reale të punës.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'counter-rent',
        labelSq: 'Qira e banakut ose e një këndi brenda një dyqani',
        category: 'qira',
        lowUSD: 200,
        highUSD: 900,
        noteSq:
          'Në muajt e parë mund të punoni nga shtëpia; vendndodhja me kalim njerëzish rrit kërkesën, por kushton më shumë. Krahasoni 3 opsione dhe negocioni një periudhë prove.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['dyqan_lokal'],
      },
      {
        id: 'utilities',
        labelSq: 'Energji, internet dhe telefon',
        category: 'sherbime_komunale',
        lowUSD: 30,
        highUSD: 120,
        noteSq:
          'Pajisjet e saldimit dhe ndriçimi konsumojnë pak; pjesa kryesore është interneti dhe telefoni i punës.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'ewaste-collection',
        labelSq: 'Grumbullimi i mbetjeve elektronike dhe i baterive',
        category: 'tjeter',
        lowUSD: 10,
        highUSD: 50,
        noteSq:
          'Disa operatorë i marrin falas, të tjerë me tarifë; pyesni operatorët e autorizuar në zonë.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'repair-software',
        labelSq: 'Software diagnostikimi, regjistër porosish dhe kopje rezervë',
        category: 'software',
        lowUSD: 10,
        highUSD: 50,
        noteSq:
          'Një tabelë e thjeshtë mjafton në fillim; mjetet diagnostike me abonim duhen vetëm për disa marka.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'insurance',
        labelSq: 'Sigurim përgjegjësie dhe i pajisjeve të klientëve',
        category: 'sigurime',
        lowUSD: 20,
        highUSD: 80,
        noteSq:
          'Mbulon dëmtimin ose humbjen e pajisjeve të klientëve ndërsa janë te ju; pyesni 2–3 agjenci.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'bookkeeping',
        labelSq: 'Kontabilitet',
        category: 'kontabilitet',
        lowUSD: 30,
        highUSD: 120,
        noteSq:
          'Me shumë transaksione të vogla, një kontabilist me çmim fiks kursen kohë; verifikoni detyrimet lokale.',
        scalesWithPriceLevel: true,
        optional: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 5, monthlyNewCustomers: 14, monthlyChurnPct: 90 },
      baze: { startCustomers: 10, monthlyNewCustomers: 28, monthlyChurnPct: 85 },
      optimist: { startCustomers: 15, monthlyNewCustomers: 45, monthlyChurnPct: 80 },
    },
    seasonality: [1.0, 0.95, 0.95, 1.0, 1.0, 1.05, 1.1, 1.1, 1.05, 1.0, 0.95, 0.85],
    seasonalityNoteSq:
      'Riparimet janë relativisht të qëndrueshme gjatë vitit. Hipotezë: në verë shtohen dëmtimet nga uji dhe rëniet, ndërsa në dhjetor disa klientë blejnë pajisje të reja në vend që të riparojnë. Verifikojeni me regjistrin tuaj të punëve pas 6 muajsh.',
    macroLinks: [
      {
        indicatorCode: 'mobile_subscriptions',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Sa më shumë abonime celulare për banorë, aq më e madhe baza e pajisjeve që thyhen, plaken dhe kanë nevojë për bateri të re.',
        ifSupportsSq: 'Numri i lartë i abonimeve sugjeron një bazë të gjerë pajisjesh për riparim.',
        ifContradictsSq:
          'Me pak abonime, tregu është i vogël; fokusohuni te bizneset dhe te pajisjet e tjera elektronike.',
      },
      {
        indicatorCode: 'exchange_rate_lcu_usd',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Pajisjet e reja zakonisht importohen dhe çmimi i tyre ndjek dollarin; kur monedha vendase dobësohet (më shumë njësi për 1 USD), pajisja e re shtrenjtohet më shumë sesa riparimi, që përmban edhe punë vendase.',
        ifSupportsSq:
          'Dobësimi i monedhës vendase mund ta rrisë kërkesën për riparim në vend të zëvendësimit — rishikoni më shpesh çmimet e pjesëve.',
        ifContradictsSq:
          'Me monedhë të fortë, pajisjet e reja janë relativisht më të lira dhe disa klientë zgjedhin zëvendësimin.',
      },
      {
        indicatorCode: 'gdp_per_capita_ppp',
        direction: 'me_i_ulet_mbeshtet',
        mechanismSq:
          'Kur të ardhurat për frymë janë më të ulëta, një pajisje e re zë pjesë më të madhe të buxhetit familjar, ndaj riparimi preferohet më shpesh.',
        ifSupportsSq:
          'Të ardhurat më të ulëta sugjerojnë që riparimi është zgjidhje e preferuar — por edhe që çmimi duhet mbajtur i ulët.',
        ifContradictsSq:
          'Me të ardhura të larta, njerëzit i zëvendësojnë pajisjet më shpejt; tregu i riparimit mbetet, por kërkon shpejtësi dhe shërbim të cilësisë së lartë.',
      },
      {
        indicatorCode: 'internet_users_pct',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Kur shumica e njerëzve punojnë, paguajnë dhe komunikojnë përmes telefonit, një pajisje e prishur bëhet urgjente dhe klienti paguan për shpejtësi.',
        ifSupportsSq: 'Përdorimi i lartë i internetit e mbështet ofertën “riparim brenda ditës”.',
        ifContradictsSq:
          'Me përdorim të ulët të internetit, urgjenca është më e vogël dhe çmimi bëhet faktori kryesor.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Telefonat janë bërë mjeti kryesor për punë, pagesa dhe komunikim, ndërsa pajisjet e reja janë shtrenjtuar.',
      problemSq:
        'Një ekran i thyer ose një bateri e dobët ndërpret jetën e përditshme, dhe zëvendësimi i pajisjes kushton shumë.',
      customerSq: 'Individë të të gjitha moshave dhe biznese të vogla me pajisje pune.',
      offerSq: 'Riparim i shpejtë me çmim të konfirmuar para punës dhe garanci të shkruar.',
      reasonToPaySq:
        'Kursim parash krahasuar me pajisjen e re, më pak kohë pa telefon dhe besim nga transparenca.',
      profitConditionsSq:
        'Fitimi kërkon rreth 1–2 riparime në ditë në fillim, pjesë me cilësi të njohur dhe pak kthime me defekt, si dhe qira të ulët derisa kërkesa të provohet.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq:
          'Kalimi i njerëzve është i ulët dhe klientët e rinj nuk vijnë aq shpesh sa të mbulojnë qiranë.',
      },
      {
        kind: 'cmim',
        textSq:
          'Klientët krahasojnë me riparuesit më të lirë që përdorin pjesë me cilësi të ulët dhe nuk paguajnë për pjesë më të mira.',
      },
      {
        kind: 'konkurrence',
        textSq:
          'Shumë banakë riparimi në të njëjtën zonë dhe dyqane telefonash që e ofrojnë riparimin si shërbim shtesë.',
      },
      {
        kind: 'kosto',
        textSq: 'Pjesët e kthyera me defekt, veglat e dëmtuara dhe stoku i vjetruar e ulin marzhin.',
      },
      {
        kind: 'aftesi',
        textSq:
          'Riparimet në pllakën amë (mikrosaldim) kërkojnë aftësi të avancuara; gabimet mund ta dëmtojnë pajisjen e klientit dhe të kërkojnë kompensim.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Trajtimi i gabuar i baterive dhe i mbetjeve elektronike, ose pranimi i pajisjeve me origjinë të dyshimtë, sjell gjoba dhe dëm reputacioni.',
      },
      {
        kind: 'operacionale',
        textSq: 'Pritja e pjesëve nga jashtë i zgjat afatet dhe klientët shkojnë te konkurrenti.',
      },
    ],
    falsifiersSq: [
      'Gjatë 4 javëve të para, nga rrjeti dhe nga 10 biznese të kontaktuara vijnë më pak se 10 kërkesa reale për riparim.',
      'Më shumë se 10% e riparimeve kthehen me defekt brenda 30 ditëve.',
      'Çmimi mesatar që pranojnë klientët është më pak se 1,5 herë kostoja e pjesës, gjë që nuk mbulon kohën dhe qiranë.',
      'Në një rreze prej 1 km ka mbi 5 banakë riparimi që ofrojnë të njëjtat shërbime me çmime më të ulëta dhe brenda ditës.',
    ],
    differentiationSq: [
      'Çmim i konfirmuar me shkrim para punës dhe garanci e shkruar për pjesën dhe punën.',
      'Zgjedhje e qartë mes pjesës origjinale dhe asaj alternative, me çmime të ndryshme.',
      'Marrje dhe kthim për biznese të vogla me disa pajisje.',
      'Protokoll i qartë për privatësinë e të dhënave (klienti mund të jetë i pranishëm gjatë testimit).',
    ],
    competitorTypesSq: [
      'Servise të autorizuara të markave',
      'Banakë riparimi të pavarur',
      'Dyqane telefonash që e ofrojnë riparimin si shërbim shtesë',
      'Riparues informalë pa faturë',
      'Zëvendësimi me pajisje të re ose të përdorur',
    ],
    cheapestTestSq:
      'Katër javë riparime me porosi nga shtëpia për rrjetin e njohjeve dhe bizneset e lagjes, me listë çmimesh të shkruar dhe paradhënie për pjesën. Matni numrin e kërkesave në javë, çmimin e pranuar dhe kthimet me defekt.',
    interviewQuestionsSq: [
      'Kur u dëmtua herën e fundit telefoni juaj dhe çfarë bëtë?',
      'Sa paguat për riparimin e fundit dhe sa ditë mbetët pa telefon?',
      'Si e zgjodhët ku ta riparonit pajisjen herën e fundit?',
      'Çfarë ju shqetësoi më shumë kur e latë pajisjen për riparim?',
      'Për bizneset: sa pajisje pune u prishën gjatë vitit të fundit dhe kush i riparoi?',
      'Keni zgjedhur ndonjëherë të blini pajisje të re në vend që ta riparonit? Çfarë ju bëri ta vendosnit?',
      'Kush tjetër në familje ose në punë vendos për riparimet e pajisjeve?',
    ],
    firstCustomers: {
      whereSq: [
        'Rrjeti personal: familja, miqtë, kolegët dhe fqinjët',
        'Biznese të vogla të lagjes me disa telefona ose laptopë pune',
        'Dyqane që shesin aksesorë, por nuk riparojnë (bashkëpunim për referime)',
        'Zyra dhe institucione pranë vendit ku punoni (vetëm me lejen e administratës)',
      ],
      howToContactSq: [
        'Lista e çmimeve e shpërndarë personalisht te njohjet dhe bizneset e lagjes',
        'Profil i saktë në hartat online me orar dhe çmime orientuese',
        'Marrëveshje referimi me dyqane aksesorësh, pa mesazhe masive',
      ],
      offerSq:
        'Diagnozë falas dhe çmim i shkruar para punës; garanci e shkruar për pjesën dhe punën për [periudha].',
      followUpSq:
        'Një mesazh pas 7 ditësh për të pyetur nëse pajisja funksionon mirë; nëse klienti është i kënaqur, pyetni nëse njeh dikë tjetër që ka nevojë — pa kërkuar vlerësime në këmbim të zbritjeve.',
      metricsSq: [
        'Kërkesa për riparim në javë',
        'Kërkesa → riparime të pranuara (%)',
        'Kthime me defekt brenda 30 ditëve (%)',
        'Koha mesatare e riparimit (orë)',
        'Klientë që vijnë nga rekomandimi (%)',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje, jam [emri] dhe riparoj telefona, tableta dhe laptopë në [vendi]. Para çdo pune ju jap çmimin me shkrim dhe nuk filloj pa miratimin tuaj. Për ekran dhe bateri zakonisht punoj brenda [afati] kur pjesa është gati, me garanci të shkruar për [periudha]. Nëse ka ndonjë pajisje me probleme te ju ose në zyrë, mund t’i hedh një sy falas.',
    offerTemplateSq:
      'Oferta për [emri i klientit ose biznesit]: (1) diagnozë [falas ose me tarifë që zbritet]; (2) riparim [lloji] me pjesë [origjinale ose alternative] për [çmimi]; (3) afat [afati] pas konfirmimit; (4) garanci e shkruar [periudha] për pjesën dhe punën; (5) të dhënat tuaja nuk hapen pa pëlqimin tuaj. Pagesë kur merrni pajisjen. Nëse riparimi rezulton i pamundur, paguani vetëm [tarifa e diagnozës ose asgjë].',
    feedbackQuestionsSq: [
      'A u respektuan çmimi dhe afati që ju dhamë?',
      'Çfarë ju shqetësoi gjatë kohës që pajisja ishte te ne?',
      'Si funksionon pajisja pas një jave?',
      'Si na gjetët dhe çfarë ju bëri të na zgjidhnit?',
    ],
    goCriteriaSq: [
      'Të paktën 25 riparime me pagesë në muajin e dytë ose të tretë.',
      'Kthimet me defekt nën 5% dhe marzhi mesatar (çmimi minus pjesa) mbi 50% të çmimit.',
    ],
    killCriteriaSq: [
      'Pas 8 javësh, më pak se 10 riparime me pagesë në muaj pavarësisht kontaktimit aktiv.',
      'Kthimet me defekt mbeten mbi 10% edhe pas ndërrimit të furnitorit të pjesëve.',
      'Kontributi mujor nuk e mbulon qiranë e banakut në skenarin bazë pas 6 muajsh.',
    ],
    phaseNotesSq: {
      p20_30: [
        'Kërkoni çmime riparimi si klient te 5 riparues në zonë dhe shënoni afatin, çmimin dhe garancinë.',
      ],
      p40_50: [
        'Verifikoni regjistrimin, faturimin dhe ku dorëzohen bateritë dhe mbetjet elektronike para se të filloni rregullisht.',
      ],
      p50_60: ['Testoni 2–3 furnitorë pjesësh me porosi të vogla dhe shënoni defektet për secilin.'],
      p60_70: ['Katër javë riparime nga shtëpia me listë çmimesh; regjistroni çdo punë, kohën dhe marzhin.'],
      p90_100: [
        'Merrni me qira banak vetëm kur kërkesa nga shtëpia kalon 20 riparime në muaj për 2 muaj radhazi.',
      ],
    },
    assumptionsSq: [
      'Pronari ka tashmë aftësi riparimi për ekrane, bateri dhe porte; riparimet në pllakën amë janë opsionale.',
      'Shumica e klientëve paguajnë kur marrin pajisjen (0 ditë arkëtim).',
      'Pjesët porositen kryesisht për çdo punë; stoku mbahet i vogël.',
      'Rekomandimet nga klientët e kënaqur bëhen burimi kryesor i klientëve të rinj pas muajve të parë.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 5. Tailoring: alterations + small-batch uniforms — home, solo, low capital
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'rrobaqepesi-riparime-dhe-uniforma',
    nameSq: 'Rrobaqepësi: riparime, përshtatje dhe uniforma për biznese',
    taglineSq: 'Shkurtime, ngushtime, zinxhirë — dhe seri të vogla përparësesh e uniformash për bizneset e lagjes.',
    descriptionSq:
      'Punishte e vogël rrobaqepësie që kombinon dy burime të ardhurash: riparime dhe përshtatje rrobash për familjet (shkurtim pantallonash, ngushtim, ndërrim zinxhirësh, arnim) dhe seri të vogla uniformash e përparësesh për biznese lokale që nuk gjejnë furnitor për 5–30 copë. Mund të niset nga shtëpia me makinë qepëse, me kapital të ulët, nga një person me aftësi rrobaqepësie. Riparimet sjellin para shpejt; uniformat sjellin porosi më të mëdha, por arkëtohen më vonë.',
    sector: 'prodhim',
    offerSq:
      'Riparime dhe përshtatje me listë çmimesh të publikuar dhe afat 2–5 ditë; për biznese: seri 5–30 copë përparëse, këmisha ose jelekë pune me masa individuale, emër ose logo e qëndisur nga një partner i jashtëm (vetëm me lejen e biznesit) dhe riparim i uniformave ekzistuese.',
    payingCustomerSq:
      'Familje dhe individë në lagje; pronarë kafenesh, restorantesh, dyqanesh, sallonesh dhe zyrash të vogla.',
    customerSegments: ['b2c', 'b2b'],
    problemSq:
      'Rrobat që nuk përshtaten ose kanë dëme të vogla mbeten pa u veshur, sepse nuk ka rrobaqepës të besueshëm afër; bizneset e vogla nuk gjejnë furnitor që pranon porosi të vogla uniformash me masa, ndaj blejnë veshje të gatshme që nuk u rrinë mirë ose presin shumë.',
    modes: ['fizik'],
    marketScopes: ['lokal'],
    canStartFromHome: true,
    minTeam: 'vetem',
    requiredSkills: ['rrobaqepesi'],
    helpfulSkills: ['shitje', 'sherbim_klienti', 'dizajn_grafik'],
    helpfulAssets: ['makine_qepese', 'dyqan_lokal', 'rrjet_kontaktesh', 'telefon_smart'],
    minHoursPerWeek: 20,
    regulated: false,
    regulationNotesSq: [
      'Regjistrimi i aktivitetit dhe faturimi (sidomos për bizneset që kërkojnë faturë): Kërkon verifikim lokal.',
      'Veshjet mbrojtëse (p.sh. me reflektim të lartë, kundër zjarrit, për ambiente mjekësore) kanë standarde dhe certifikime të veçanta; mos i ofroni pa i verifikuar kërkesat — kufizojuni veshjeve të punës jo-mbrojtëse.',
      'Logot dhe emrat e bizneseve qëndisen ose printohen vetëm me miratim me shkrim nga pronari i markës.',
      'Nëse punoni nga shtëpia dhe ju vijnë klientë, verifikoni rregullat e bashkisë ose të pallatit për aktivitete në banesë.',
    ],
    licensedProfessionalsSq: [],
    adultOnly: false,
    zeroCapitalTestSq:
      'Me makinën qepëse që keni: publikoni një listë të thjeshtë çmimesh për riparimet më të zakonshme në rrjetin tuaj dhe në grupet e lagjes ku lejohet, dhe vizitoni 10 biznese të vogla me një përparëse shembull të qepur nga ju. Merrni paradhënie për stofin para çdo porosie biznesi, që të mos rrezikoni paratë tuaja. Kostoja reale: fije, zinxhirë, stofi i shembullit dhe transporti — zakonisht pak, por jo zero.',
    revenueModelSq:
      'Pagesë për orë pune të faturuar (njësia = 1 orë punë), e përkthyer në çmime fikse për riparimet dhe në çmim për copë për uniformat; stofi dhe qëndisja e uniformave faturohen veçmas me kosto plus një marzh të vogël, jashtë modelit bazë.',
    pricing: {
      unitLabelSq: 'orë pune e faturuar',
      priceUSD: { low: 14, base: 22, high: 35 },
      variableCostUSD: { low: 1, base: 2, high: 4 },
      unitsPerCustomerPerMonth: 2,
      collectionDays: 12,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin fije, gjilpëra, zinxhirë, butona dhe energji; stofi i uniformave nuk përfshihet, sepse i faturohet veçmas biznesit. “Klient” = klient aktiv në muaj (familje ose biznes), mesatarisht rreth 2 orë punë; humbja e lartë mujore pasqyron që shumë riparime bëhen një herë. Arkëtimi mesatar përzien pagesën në dorëzim (familjet) me faturat 30-ditore (bizneset). Çmimet janë supozime në USD; verifikoni çmimet e rrobaqepësve në zonë.',
    },
    startupCosts: [
      {
        id: 'industrial-sewing-machine',
        labelSq: 'Makinë qepëse industriale (qepje e drejtë)',
        category: 'pajisje',
        lowUSD: 350,
        highUSD: 1200,
        noteSq:
          'Një makinë industriale e përdorur mjafton; kontrolloni gjendjen me një mekanik makinash qepëse para blerjes.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['makine_qepese'],
      },
      {
        id: 'overlock',
        labelSq: 'Makinë overlock për skajet',
        category: 'pajisje',
        lowUSD: 250,
        highUSD: 900,
        noteSq:
          'E nevojshme për punë profesionale në skaje dhe për uniforma; krahasoni të reja dhe të përdorura dhe pyesni për servisin.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'press-cutting-table',
        labelSq: 'Hekur me avull, tavolinë prerjeje dhe vegla',
        category: 'pajisje',
        lowUSD: 120,
        highUSD: 500,
        noteSq:
          'Një hekur i fortë me avull dhe një tavolinë e madhe e përshpejtojnë punën; gërshërë, metër dhe shkumës rrobaqepësie.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'uniform-samples',
        labelSq: 'Stof dhe materiale për shembuj uniformash',
        category: 'inventar',
        lowUSD: 80,
        highUSD: 300,
        noteSq:
          'Për 3–5 shembuj përparësesh ose këmishash që u tregohen bizneseve; zgjidhni stofra që furnitori i ka vazhdimisht në stok.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'registration',
        labelSq: 'Regjistrim aktiviteti dhe faturim',
        category: 'tarifa',
        lowUSD: 0,
        highUSD: 200,
        noteSq:
          'Tarifat ndryshojnë sipas vendit dhe formës ligjore; merrni shumën e saktë nga regjistri zyrtar i bizneseve.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: listë çmimesh e printuar dhe vizita te bizneset',
        category: 'testim_tregu',
        lowUSD: 30,
        highUSD: 120,
        noteSq: 'Printimi i listës së çmimeve dhe transporti për 10–15 vizita te bizneset me shembuj.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'dropoff-point',
        labelSq: 'Pikë pranimi ose qira e një dhome të vogël',
        category: 'qira',
        lowUSD: 0,
        highUSD: 400,
        noteSq:
          'Nga shtëpia nuk ka qira; një pikë pranimi te një pastrim kimik ose dyqan i lagjes mund të funksionojë me komision — negocioni dhe shkruajeni marrëveshjen.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['dyqan_lokal'],
      },
      {
        id: 'utilities',
        labelSq: 'Energji dhe telefon pune',
        category: 'sherbime_komunale',
        lowUSD: 15,
        highUSD: 50,
        noteSq: 'Pjesa e faturës që lidhet me punën; makinat qepëse konsumojnë pak, hekuri më shumë.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'fitting-transport',
        labelSq: 'Transport për marrjen e masave dhe dorëzime te bizneset',
        category: 'transport',
        lowUSD: 15,
        highUSD: 60,
        noteSq: 'Grupimi i vizitave te bizneset në një ditë të javës e ul koston.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'machine-service',
        labelSq: 'Servis makinash, gjilpëra dhe pjesë këmbimi',
        category: 'mirembajtje',
        lowUSD: 10,
        highUSD: 40,
        noteSq:
          'Makinat industriale kërkojnë vaj, rregullim dhe ndërrim pjesësh; pyesni për çmimin e një servisi vjetor.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'bookkeeping',
        labelSq: 'Kontabilitet',
        category: 'kontabilitet',
        lowUSD: 0,
        highUSD: 80,
        noteSq:
          'Me fatura për biznese mund t’ju duhet kontabilist; verifikoni detyrimet dhe regjimet e thjeshtuara lokale.',
        scalesWithPriceLevel: true,
        optional: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 5, monthlyNewCustomers: 10, monthlyChurnPct: 70 },
      baze: { startCustomers: 10, monthlyNewCustomers: 18, monthlyChurnPct: 60 },
      optimist: { startCustomers: 15, monthlyNewCustomers: 28, monthlyChurnPct: 50 },
    },
    seasonality: [0.85, 0.9, 1.0, 1.1, 1.15, 1.05, 0.9, 0.8, 1.15, 1.05, 1.0, 1.05],
    seasonalityNoteSq:
      'Riparimet shtohen në pranverë (dasma, ceremoni, ndërrimi i stinës) dhe në shtator (kthimi në punë dhe në shkollë); porositë e uniformave priren të vijnë para sezonit turistik dhe kur bizneset hapen ose rinovohen. Gushti zakonisht është më i qetë. Vlerat janë supozim.',
    macroLinks: [
      {
        indicatorCode: 'new_business_density',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Bizneset e reja (kafene, dyqane, sallone) kanë nevojë për uniforma dhe përparëse që në hapje, shpesh në sasi të vogla.',
        ifSupportsSq: 'Dendësia e lartë e regjistrimeve të reja sugjeron më shumë porosi të vogla uniformash.',
        ifContradictsSq:
          'Me pak biznese të reja, mbështetuni më shumë te riparimet për familjet dhe te zëvendësimi i uniformave ekzistuese.',
      },
      {
        indicatorCode: 'tourism_arrivals',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Sezoni turistik rrit punësimin sezonal në hotele dhe restorante, që kanë nevojë për uniforma të reja ose të përshtatura para sezonit.',
        ifSupportsSq: 'Rritja e turizmit sugjeron porosi uniformash në pranverë.',
        ifContradictsSq:
          'Pa turizëm të rëndësishëm, porositë e uniformave do të jenë më të vogla dhe më të shpërndara gjatë vitit.',
      },
      {
        indicatorCode: 'inflation_cpi',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Kur çmimet rriten, disa familje i riparojnë dhe i përshtatin rrobat në vend që të blejnë të reja — pjesa e riparimeve mund të përfitojë.',
        ifSupportsSq:
          'Inflacioni i lartë mund ta rrisë kërkesën për riparime; por mbani parasysh se shtrëngon edhe buxhetet e bizneseve për uniforma.',
        ifContradictsSq:
          'Me inflacion të ulët dhe veshje të lira, riparimi konkurron me blerjen e re; theksoni shpejtësinë dhe cilësinë.',
      },
      {
        indicatorCode: 'services_va_gdp',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Ekonomitë me peshë të lartë të shërbimeve kanë më shumë punonjës në kontakt me klientë (kafene, dyqane, hotele), që shpesh vishen me uniformë.',
        ifSupportsSq: 'Pesha e lartë e shërbimeve sugjeron një bazë më të gjerë klientësh për uniforma.',
        ifContradictsSq:
          'Me peshë të ulët shërbimesh, kërkesa mund të vijë më shumë nga punishtet dhe ndërtimi, ku shpesh duhen veshje mbrojtëse të certifikuara — që nuk janë pjesë e kësaj oferte.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Shumë njerëz duan t’i mbajnë më gjatë rrobat që kanë, ndërsa bizneset e vogla duan pamje profesionale pa porositur sasi të mëdha.',
      problemSq:
        'Rrobaqepësit e besueshëm janë më të pakët, dhe furnitorët e uniformave zakonisht kërkojnë porosi të mëdha.',
      customerSq: 'Familje të lagjes dhe biznese të vogla me 2–20 punonjës në kontakt me klientët.',
      offerSq: 'Riparime të shpejta me çmim të qartë dhe seri të vogla uniformash me masa individuale.',
      reasonToPaySq:
        'Rrobat bëhen sërish të përdorshme, dhe bizneset marrin uniforma që u rrinë mirë, pa minimum të madh porosie.',
      profitConditionsSq:
        'Fitimi kërkon kosto fikse shumë të ulëta (punë nga shtëpia), rreth 60–100 orë punë të faturuar në muaj dhe paradhënie për stofin e uniformave.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq: 'Kërkesa për riparime në lagje është e vogël dhe porositë e uniformave vijnë rrallë.',
      },
      {
        kind: 'cmim',
        textSq: 'Klientët nuk e pranojnë çmimin e riparimit, sepse një veshje e re e lirë kushton pak më shumë.',
      },
      {
        kind: 'konkurrence',
        textSq: 'Rrobaqepës të tjerë me çmime shumë të ulëta dhe furnitorë uniformash me prodhim masiv.',
      },
      {
        kind: 'kosto',
        textSq:
          'Gabimet në prerjen e stofit ose ndryshimet e shumta të masave kërkojnë më shumë orë dhe material se ç’ishte llogaritur.',
      },
      {
        kind: 'vonesa_pagesash',
        textSq: 'Bizneset i paguajnë uniformat me vonesë, ndërsa stofi është paguar paraprakisht.',
      },
      {
        kind: 'operacionale',
        textSq:
          'Në kulmin e sezonit, porositë e uniformave dhe riparimet përplasen dhe një person i vetëm nuk i mban dot afatet.',
      },
    ],
    falsifiersSq: [
      'Pasi lista e çmimeve u shpërnda te mbi 50 njerëz në rrjet dhe në lagje, ka më pak se 8 riparime me pagesë në muajin e parë.',
      'Nga 15 biznese të vizituara me shembull, asnjë nuk pranon një porosi provë me paradhënie.',
      'Të ardhurat për orë pune, pas kostove variabël, dalin nën pagën minimale që ju nevojitet edhe me 80 orë të faturuara në muaj.',
    ],
    differentiationSq: [
      'Listë çmimesh e publikuar dhe afat i shkruar për çdo riparim.',
      'Uniforma me masa individuale edhe për seri prej 5 copësh, me riparim të përfshirë për 3 muajt e parë.',
      'Marrje dhe dorëzim te biznesi në një ditë fikse të javës.',
    ],
    competitorTypesSq: [
      'Rrobaqepës të tjerë të lagjes',
      'Pastrime kimike që pranojnë edhe riparime',
      'Furnitorë uniformash me porosi minimale të madhe',
      'Veshje pune të gatshme nga dyqanet ose online',
      'Riparimi në shtëpi nga vetë familja',
    ],
    cheapestTestSq:
      'Listë çmimesh në rrjetin tuaj dhe në grupet e lagjes + vizita te 15 biznese me një përparëse shembull. Synimi: 15 riparime me pagesë dhe 1 porosi uniformash me paradhënie brenda 6 javëve.',
    interviewQuestionsSq: [
      'Kur keni çuar herën e fundit një rrobë për riparim ose përshtatje, dhe ku?',
      'Sa paguat për riparimin e fundit dhe sa ditë u desh?',
      'Keni rroba që nuk i vishni sepse kanë nevojë për ndonjë rregullim? Pse nuk i keni çuar ende?',
      'Për bizneset: si i siguroni sot uniformat ose përparëset e stafit, dhe sa ju kushtuan herën e fundit?',
      'Çfarë problemi keni pasur me furnitorin e fundit të uniformave (masat, afati, sasia minimale)?',
      'Sa shpesh i zëvendësoni uniformat dhe kush e vendos këtë?',
    ],
    firstCustomers: {
      whereSq: [
        'Fqinjët, të afërmit dhe grupet e komunitetit ku jeni anëtar',
        'Kafene, restorante, sallone bukurie dhe dyqane në lagje',
        'Pastrime kimike dhe dyqane veshjesh pa rrobaqepës (bashkëpunim)',
        'Biznese që sapo kanë hapur ose po rinovohen',
      ],
      howToContactSq: [
        'Vizitë personale me një uniformë shembull dhe listë çmimesh, në orët e qeta',
        'Listë çmimesh e shpërndarë në grupet e lagjes ku rregullat e lejojnë',
        'Marrëveshje referimi me pastrime kimike, pa mesazhe masive',
      ],
      offerSq:
        'Për familjet: riparimi i parë me afat 3-ditor. Për bizneset: 1 copë shembull me masat e një punonjësi, që paguhet vetëm nëse porositen të paktën 5 copë.',
      followUpSq:
        'Pas dorëzimit, pyetni klientin si i rri veshja; për bizneset, një telefonatë pas 2 muajsh për riparime ose porosi të reja. Një rikujtesë e vetme për ofertat pa përgjigje.',
      metricsSq: [
        'Riparime me pagesë në javë',
        'Orë të faturuara në muaj',
        'Vizita te bizneset → porosi uniformash (%)',
        'Afate të mbajtura (%)',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje, jam [emri], rrobaqepës/e në [lagja]. Qep përparëse dhe uniforma me masat e secilit punonjës, edhe për vetëm [numri] copë, dhe i riparoj kur dëmtohen. Ju solla një shembull. Si i siguroni sot uniformat e stafit tuaj?',
    offerTemplateSq:
      'Oferta për [emri i biznesit]: (1) [numri] copë [lloji i veshjes] në stofin [stofi], me masa individuale; (2) emri ose logoja juaj [e qëndisur ose e printuar], vetëm me miratimin tuaj; (3) afat [ditë] ditë pas marrjes së masave dhe paradhënies; (4) çmimi [çmimi] për copë + stofi [kostoja e stofit]; (5) riparim falas i defekteve të qepjes për 3 muaj. Paradhënie [përqindja] për stofin, pjesa tjetër brenda [ditë] ditëve nga dorëzimi.',
    feedbackQuestionsSq: [
      'Si ju rri veshja pas disa ditësh përdorimi?',
      'A u mbajt afati i premtuar?',
      'Çfarë do të ndryshonit te stofi ose te modeli?',
      'Kujt tjetër i duhen riparime ose uniforma?',
    ],
    goCriteriaSq: [
      'Të paktën 40 orë punë të faturuar në muajin e dytë.',
      'Të paktën 2 porosi uniformash me paradhënie brenda 3 muajve.',
    ],
    killCriteriaSq: [
      'Pas 2 muajsh, më pak se 20 orë të faturuara në muaj pavarësisht kontaktimit.',
      'Asnjë porosi uniformash pas 20 vizitave te bizneset.',
      'Të ardhurat neto për orë mbeten nën pagën minimale që ju nevojitet.',
    ],
    phaseNotesSq: {
      p10_20: [
        'Pyetni 15 familje dhe 10 biznese për riparimin dhe uniformat e fundit: çmimi, afati, problemi.',
      ],
      p20_30: [
        'Kërkoni çmime si klient te 3–5 rrobaqepës dhe te 2 furnitorë uniformash, përfshirë sasinë minimale.',
      ],
      p50_60: ['Gjeni 2 furnitorë stofi me stok të qëndrueshëm dhe një partner për qëndisje ose printim.'],
      p60_70: [
        'Gjashtë javë me listë çmimesh dhe 15 vizita te bizneset; regjistroni orët reale për çdo punë.',
      ],
    },
    assumptionsSq: [
      'Një person mund të faturojë 60–100 orë punë në muaj pa ndihmë.',
      'Bizneset pranojnë paradhënie për stofin.',
      'Puna nga shtëpia lejohet dhe nuk shton kosto qiraje në fillim.',
      'Interesi verbal nuk është provë; vetëm porositë me paradhënie e konfirmojnë kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 6. Custom kitchens & wardrobes — workshop, team, high capital
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'mobilieri-me-porosi-per-apartamente',
    nameSq: 'Mobilieri me porosi për apartamente (kuzhina dhe dollapë)',
    taglineSq: 'Matje, projekt 3D, prodhim dhe montim — për hapësira që mobiljet e gatshme nuk i përshtatin.',
    descriptionSq:
      'Punishte mobilierie që projekton, prodhon dhe monton kuzhina, dollapë muri dhe mobilje me masë për apartamente të reja ose të rinovuara. Klientët janë familje që kanë blerë ose po rinovojnë një apartament me hapësira me masa të veçanta, klientë nga diaspora dhe ndërtues ose agjenci që duan disa njësi njëherësh. Kërkon aftësi zdrukthtarie, ekip (të paktën një montues), punishte, mjet transporti dhe kapital të konsiderueshëm; prerja dhe kantimi (veshja e skajeve) të pllakave mund t’u besohen furnitorëve që e ofrojnë këtë shërbim, për të ulur investimin në makineri.',
    sector: 'prodhim',
    offerSq:
      'Paketë kuzhine ose dollapi me porosi: matje në vend, projekt 3D me 2 raunde ndryshimesh, zgjedhje materialesh dhe aksesorësh me çmim të ndarë sipas zërave, prodhim në punishte, montim brenda afatit të shkruar dhe garanci e shkruar për punën. Lidhjet e ujit, të rrymës dhe të gazit kryhen nga profesionistë të licencuar.',
    payingCustomerSq:
      'Familje që kanë blerë ose po rinovojnë një apartament; ndërtues dhe agjenci që mobilojnë disa njësi.',
    customerSegments: ['b2c', 'b2b'],
    problemSq:
      'Mobiljet e gatshme nuk përputhen me masat e apartamenteve (kënde, kolona, tavane të ulëta), ndërsa punishtet e vogla shpesh vonojnë, nuk japin çmim të qartë sipas zërave ose bëjnë gabime në matje që kushtojnë kohë dhe para.',
    modes: ['fizik'],
    marketScopes: ['lokal'],
    canStartFromHome: false,
    minTeam: 'ekip',
    requiredSkills: ['zdrukthtari', 'menaxhim_projekti'],
    helpfulSkills: ['shitje', 'dizajn_grafik', 'drejtim_mjeti', 'kontabilitet'],
    helpfulAssets: ['punishte', 'furgon', 'vegla_pune', 'kompjuter', 'rrjet_kontaktesh', 'rrjet_diaspore'],
    minHoursPerWeek: 45,
    regulated: true,
    regulationNotesSq: [
      'Punishtja: zonimi dhe lejet për zhurmën, pluhurin dhe orarin e punës, si dhe masat e sigurisë nga zjarri (pluhuri i drurit është i djegshëm) — Kërkon verifikim lokal para se ta merrni ambientin me qira.',
      'Bojërat, llaqet, ngjitëset dhe tretësit kanë rregulla për ruajtjen dhe për hedhjen e mbetjeve; verifikoni çfarë kërkohet dhe ku dorëzohen.',
      'Siguria në punë me makineritë (trajnime, mbrojtëse, mjete mbrojtëse personale) dhe punësimi i stafit: verifikoni detyrimet lokale.',
      'Lidhjet e rrymës, të ujit dhe të gazit për pajisjet e kuzhinës kryhen vetëm nga profesionistë të licencuar; montuesit tuaj nuk i bëjnë këto lidhje.',
      'Kontrata me klientin, paradhëniet, garancia ligjore dhe faturimi: Kërkon verifikim lokal.',
      'Rregullat e pallatit për orarin e zhurmës dhe përdorimin e ashensorit gjatë montimit: verifikoni me administratorin.',
    ],
    licensedProfessionalsSq: [
      'Elektricist i licencuar (lidhjet e rrymës, ndriçimi i kuzhinës, linjat e punishtes)',
      'Hidraulik për lidhjet e ujit dhe të shkarkimit',
      'Teknik i certifikuar gazi për pllakat e gatimit ose pajisjet me gaz',
      'Kontabilist për pagat dhe faturimin',
    ],
    adultOnly: true,
    zeroCapitalTestSq:
      'Kjo nuk është ide pa kapital: punishtja, veglat dhe stafi kushtojnë. Testi më i lirë i ligjshëm: nëse jeni zdrukthtar me përvojë, merrni 2–3 projekte të vogla (p.sh. një dollap) me paradhënie që mbulon materialin, duke përdorur shërbimin e prerjes dhe të kantimit të një furnitori pllakash dhe veglat që keni, ose duke punuar në punishten e një kolegu me marrëveshje. Kështu matni kërkesën dhe marzhin para se të merrni punishte me qira. Kostoja reale: transporti, veglat që mungojnë, regjistrimi dhe koha juaj; materiali paguhet nga paradhënia.',
    revenueModelSq:
      'Çmim për projekt (njësia = 1 kuzhinë ose dollap i montuar), me paradhënie në nënshkrim dhe pjesën e mbetur në montim; aksesorët e veçantë dhe pajisjet elektroshtëpiake faturohen veçmas dhe nuk janë në modelin bazë.',
    pricing: {
      unitLabelSq: 'projekt (kuzhinë ose dollap)',
      priceUSD: { low: 3000, base: 6000, high: 11000 },
      variableCostUSD: { low: 1500, base: 2700, high: 5000 },
      unitsPerCustomerPerMonth: 1,
      collectionDays: 0,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin pllakat, kantimin, aksesorët (mentesha, binarë), sipërfaqen e punës dhe prerjen e porositur te furnitori; nuk përfshin pagat dhe qiranë. Këtu çdo “klient” është një projekt (humbje 100% në muaj, sepse shumica e klientëve porosisin një herë). Modeli supozon pagesë në dorëzim; në praktikë zakonisht merret paradhënie që mbulon materialin, ndërsa ndërtuesit shpesh paguajnë me 30–60 ditë vonesë. Çmimet janë supozime në USD; merrni oferta reale për materialet nga 2–3 furnitorë dhe krahasoni çmimet e punishteve lokale.',
    },
    startupCosts: [
      {
        id: 'power-tools',
        labelSq: 'Vegla elektrike dore dhe montimi (trapan, sharrë me shinë, frezë dore)',
        category: 'pajisje',
        lowUSD: 1500,
        highUSD: 4000,
        noteSq:
          'Nëse keni tashmë vegla profesionale, blini vetëm ato që mungojnë; krahasoni ofertat dhe servisin pas shitjes.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['vegla_pune'],
      },
      {
        id: 'workshop-equipment',
        labelSq: 'Pajisje punishteje (tavolina montimi, thithës pluhuri, rafte, mbrojtëse)',
        category: 'pajisje',
        lowUSD: 2000,
        highUSD: 7000,
        noteSq:
          'Thithësi i pluhurit dhe mbrojtëset janë për sigurinë; makineritë e mëdha (sharra panelesh, makina kantimi) shmangen duke e porositur prerjen te furnitori i pllakave.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'workshop-deposit',
        labelSq: 'Depozita e qirasë së punishtes',
        category: 'depozita',
        lowUSD: 1500,
        highUSD: 5000,
        noteSq:
          'Shpesh 1–3 muaj qira; verifikoni para nënshkrimit që zonimi lejon aktivitet prodhues dhe zhurmë.',
        scalesWithPriceLevel: true,
        avoidedByAssets: ['punishte'],
      },
      {
        id: 'workshop-setup',
        labelSq: 'Përshtatja e punishtes (linjë elektrike, ndriçim, fikës, ventilim)',
        category: 'hapje',
        lowUSD: 800,
        highUSD: 4000,
        noteSq:
          'Punimet elektrike vetëm nga elektricist i licencuar; kërkoni 2–3 oferta pas inspektimit të ambientit.',
        scalesWithPriceLevel: true,
        optional: true,
      },
      {
        id: 'van',
        labelSq: 'Furgon i përdorur për transport dhe montim',
        category: 'pajisje',
        lowUSD: 6000,
        highUSD: 15000,
        noteSq:
          'Nevojitet vetëm nëse nuk keni mjet; në fillim mund të merret me qira për ditët e montimit. Kontrolloni koston e sigurimit për mjet pune.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['furgon'],
      },
      {
        id: 'design-laptop',
        labelSq: 'Laptop për projektim 3D',
        category: 'pajisje',
        lowUSD: 300,
        highUSD: 1500,
        noteSq:
          'Laptopi duhet ta përballojë modelimin 3D; disa programe projektimi kanë plane falas ose me abonim mujor.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['kompjuter'],
      },
      {
        id: 'material-samples',
        labelSq: 'Mostra materialesh dhe ngjyrash për klientët',
        category: 'inventar',
        lowUSD: 200,
        highUSD: 800,
        noteSq: 'Shumë furnitorë japin mostra falas ose me çmim të ulët; pyesni para se të blini.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'registration-permits',
        labelSq: 'Regjistrim biznesi, leje dhe tarifa fillestare',
        category: 'tarifa',
        lowUSD: 150,
        highUSD: 800,
        noteSq:
          'Varet nga vendi dhe nga lejet e punishtes; merrni listën nga regjistri zyrtar i bizneseve dhe nga bashkia.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: projekte 3D për 5 klientë dhe 1–2 projekte të vogla me paradhënie',
        category: 'testim_tregu',
        lowUSD: 150,
        highUSD: 600,
        noteSq:
          'Koha e projektimit, transporti për matjet dhe pjesa e materialit që nuk mbulohet nga paradhënia.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'workshop-rent',
        labelSq: 'Qira e punishtes',
        category: 'qira',
        lowUSD: 700,
        highUSD: 2500,
        noteSq:
          'Varet nga madhësia dhe zona; periferia është më e lirë, por rrit kohën e transportit. Krahasoni 3 oferta.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['punishte'],
      },
      {
        id: 'wages',
        labelSq: 'Paga: një montues me kohë të plotë dhe një ndihmës me kohë të pjesshme',
        category: 'paga',
        lowUSD: 2500,
        highUSD: 6000,
        noteSq:
          'Supozim për punonjësit përveç pronarit, përfshirë kontributet; verifikoni pagat dhe kostot e punësimit lokalisht.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'utilities',
        labelSq: 'Energji, ujë dhe internet',
        category: 'sherbime_komunale',
        lowUSD: 150,
        highUSD: 500,
        noteSq:
          'Veglat elektrike dhe thithësi i pluhurit konsumojnë energji; kërkojini pronarit faturat e kaluara.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'van-running',
        labelSq: 'Karburant, mirëmbajtje dhe sigurim i mjetit',
        category: 'transport',
        lowUSD: 150,
        highUSD: 450,
        noteSq: 'Varet nga distanca e montimeve dhe numri i matjeve; gruponi matjet sipas zonës.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'insurance',
        labelSq: 'Sigurim përgjegjësie dhe i punishtes',
        category: 'sigurime',
        lowUSD: 60,
        highUSD: 200,
        noteSq:
          'Mbulon dëmet në shtëpinë e klientit gjatë montimit dhe zjarrin në punishte; pyesni 2–3 agjenci.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'accounting',
        labelSq: 'Kontabilitet dhe paga',
        category: 'kontabilitet',
        lowUSD: 80,
        highUSD: 200,
        noteSq:
          'Me punonjës dhe projekte me paradhënie, kontabilisti është i nevojshëm; kërkoni një çmim fiks mujor.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'tool-consumables',
        labelSq: 'Disqe, teha, materiale konsumi dhe servis veglash',
        category: 'mirembajtje',
        lowUSD: 80,
        highUSD: 250,
        noteSq: 'Rritet me volumin e punës; tehet e mprehta i ulin gabimet dhe mbetjet.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'design-software',
        labelSq: 'Abonim software projektimi dhe optimizimi prerjesh',
        category: 'software',
        lowUSD: 20,
        highUSD: 120,
        noteSq:
          'Zgjidhni një program që e eksporton listën e prerjeve në formatin që pranon furnitori i pllakave.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'portfolio-marketing',
        labelSq: 'Fotografi projektesh dhe profil online',
        category: 'marketing',
        lowUSD: 30,
        highUSD: 150,
        noteSq:
          'Fotot e mira të projekteve të përfunduara (me lejen e klientit) janë mjeti kryesor i shitjes; shmangni reklamat e mëdha para se të keni portofol.',
        scalesWithPriceLevel: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 0, monthlyNewCustomers: 1.5, monthlyChurnPct: 100 },
      baze: { startCustomers: 1, monthlyNewCustomers: 2.5, monthlyChurnPct: 100 },
      optimist: { startCustomers: 1, monthlyNewCustomers: 4, monthlyChurnPct: 100 },
    },
    seasonality: [0.8, 0.85, 1.0, 1.1, 1.1, 1.05, 0.95, 0.8, 1.1, 1.15, 1.1, 1.0],
    seasonalityNoteSq:
      'Porositë priren të rriten në pranverë dhe në vjeshtë, kur përfundojnë rinovimet dhe dorëzohen apartamentet e reja; gushti dhe janari zakonisht janë më të qetë. Në zonat me diasporë, kërkesa mund të rritet para pushimeve verore, kur familjet kthehen. Vlerat janë supozim.',
    macroLinks: [
      {
        indicatorCode: 'urban_population_growth',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Rritja e popullsisë urbane lidhet me ndërtimin dhe blerjen e apartamenteve të reja, që kanë nevojë për kuzhina dhe dollapë.',
        ifSupportsSq:
          'Rritja urbane sugjeron një rrjedhë të vazhdueshme apartamentesh për t’u mobiluar — kontrolloni lejet e ndërtimit në qytetin tuaj.',
        ifContradictsSq:
          'Me rritje urbane të ulët ose negative, tregu varet më shumë nga rinovimi i apartamenteve ekzistuese.',
      },
      {
        indicatorCode: 'lending_rate',
        direction: 'me_i_ulet_mbeshtet',
        mechanismSq:
          'Shumë apartamente blihen me kredi; normat e ulëta të huadhënies nxisin blerjet dhe rinovimet dhe e ulin koston e financimit të pajisjeve të punishtes.',
        ifSupportsSq:
          'Normat më të ulëta mbështesin blerjet e apartamenteve dhe aftësinë e familjeve për të investuar në mobilim.',
        ifContradictsSq:
          'Normat e larta i frenojnë blerjet me kredi; klientët kërkojnë zgjidhje më të lira ose e shtyjnë mobilimin.',
      },
      {
        indicatorCode: 'remittances_gdp',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Në vendet me remitanca të larta, familjet në diasporë shpesh financojnë blerjen ose rinovimin e banesave në vendlindje dhe kërkojnë dikë të besueshëm që punon ndërsa ata janë larg.',
        ifSupportsSq:
          'Remitancat e larta sugjerojnë klientë nga diaspora — ofroni komunikim në distancë dhe foto të progresit.',
        ifContradictsSq: 'Me remitanca të ulëta, fokusohuni te familjet vendase dhe te ndërtuesit.',
      },
      {
        indicatorCode: 'household_consumption_growth',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Mobilimi është shpenzim i madh që shtyhet kur familjet ndihen të pasigurta; rritja e konsumit e lehtëson vendimin.',
        ifSupportsSq: 'Rritja e konsumit mbështet porositë me materiale më cilësore.',
        ifContradictsSq: 'Rënia e konsumit sugjeron më shumë presion mbi çmimin dhe projekte më të vogla.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Apartamentet e reja dhe rinovimet kanë hapësira me masa të veçanta, ndërsa klientët duan zgjidhje që shfrytëzojnë çdo centimetër.',
      problemSq:
        'Mobiljet e gatshme nuk përshtaten mirë, dhe punishtet e vogla shpesh vonojnë ose nuk japin çmim të qartë.',
      customerSq: 'Familje me apartament të ri ose në rinovim, klientë nga diaspora dhe ndërtues me disa njësi.',
      offerSq: 'Projekt 3D, çmim sipas zërave, afat i shkruar dhe montim i pastër nga një ekip i vetëm.',
      reasonToPaySq:
        'Përdorim më i mirë i hapësirës, më pak stres me koordinimin dhe siguri për afatin dhe çmimin.',
      profitConditionsSq:
        'Fitimi kërkon 2–4 projekte në muaj, gabime të rralla në matje, paradhënie që mbulon materialin dhe kontroll të kohës së montimit.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq:
          'Klientët kërkojnë oferta, por shumë pak nënshkruajnë; projektimi 3D konsumon kohë pa kthim.',
      },
      {
        kind: 'cmim',
        textSq:
          'Klientët krahasojnë me mobilje të gatshme ose të importuara më të lira dhe nuk e pranojnë diferencën.',
      },
      {
        kind: 'konkurrence',
        textSq:
          'Punishte të tjera dhe dyqane të mëdha mobiljesh me kuzhina modulare ofrojnë afate dhe çmime agresive.',
      },
      {
        kind: 'kosto',
        textSq:
          'Çmimet e pllakave dhe të aksesorëve rriten pas nënshkrimit të ofertës; pagat dhe qiraja mbeten edhe në muajt pa projekte.',
      },
      {
        kind: 'operacionale',
        textSq: 'Gabimet në matje ose në prerje kërkojnë ribërje pjesësh dhe e vonojnë montimin.',
      },
      {
        kind: 'vonesa_pagesash',
        textSq:
          'Klientët e mbajnë pjesën e fundit të pagesës për defekte të vogla; ndërtuesit paguajnë me mbi 60 ditë vonesë.',
      },
      {
        kind: 'aftesi',
        textSq:
          'Pronari është zdrukthtar i mirë, por menaxhimi njëkohësisht i shitjes, projektimit dhe ekipit e mbingarkon.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Punishtja nuk merr lejet për zhurmën ose për sigurinë nga zjarri dhe detyrohet të ndërrojë ambient.',
      },
    ],
    falsifiersSq: [
      'Nga 15 kërkesa për ofertë, më pak se 2 nënshkruajnë me paradhënie.',
      'Marzhi real pas materialeve (çmimi minus kostoja variabël) del nën 35% të çmimit në 3 projektet e para.',
      'Gabimet në matje ose prerje kërkojnë ribërje në më shumë se 1 nga 4 projekte.',
      'Punishtet lokale kanë listë pritjeje nën 2 javë dhe çmime më të ulëta se kostoja juaj variabël plus pagat për projekt.',
    ],
    differentiationSq: [
      'Çmim i ndarë sipas zërave (materiale, aksesorë, punë, montim) që klienti e krahason lehtë.',
      'Afat i shkruar në kontratë dhe foto të progresit për klientët nga diaspora.',
      'Matje e dyfishtë dhe miratim i projektit 3D me firmë para prerjes.',
      'Specializim në apartamente të vogla me zgjidhje ruajtjeje.',
    ],
    competitorTypesSq: [
      'Punishte mobilierie lokale',
      'Dyqane të mëdha mobiljesh me kuzhina modulare',
      'Mobilje të gatshme për t’u montuar vetë',
      'Zdrukthtarë individualë që punojnë pa faturë',
      'Importues kuzhinash me porosi',
    ],
    cheapestTestSq:
      '2–3 projekte të vogla (dollapë) me paradhënie, duke përdorur prerjen e porositur te furnitori dhe veglat ose punishten e një kolegu. Matni sa kërkesa për ofertë kthehen në kontrata, marzhin real dhe orët e montimit.',
    interviewQuestionsSq: [
      'Kur e keni mobiluar ose rinovuar herën e fundit kuzhinën ose dollapët, dhe kush e bëri punën?',
      'Sa ju kushtoi dhe sa zgjati nga porosia deri te montimi?',
      'Çfarë shkoi keq ose çfarë ju shqetësoi më shumë gjatë atij procesi?',
      'Si i zgjodhët punishtet ose dyqanet që krahasuat?',
      'Sa oferta morët dhe si i krahasuat?',
      'Për ndërtuesit: si i mobiloni sot apartamentet që shitni dhe me çfarë afati pagese punoni me furnitorët?',
      'Kush tjetër merr pjesë në vendimin për zgjedhjen e punishtes?',
    ],
    firstCustomers: {
      whereSq: [
        'Familje që kanë blerë apartament në ndërtesat e reja të qytetit',
        'Agjenci imobiliare dhe administratorë pallatesh (për referime)',
        'Ndërtues të vegjël që shesin apartamente të mobiluara',
        'Klientë nga diaspora që rinovojnë banesën në vendlindje',
        'Ish-klientë dhe rrjeti personal',
      ],
      howToContactSq: [
        'Portofol me foto të projekteve të mëparshme (me lejen e klientëve) dhe çmime orientuese',
        'Takim personal me agjenci imobiliare dhe ndërtues, me ofertë referimi të qartë',
        'Profil online me projekte reale; pa reklama të mëdha para se të keni 3–5 projekte të dokumentuara',
      ],
      offerSq:
        'Matje dhe projekt 3D me tarifë të vogël që zbritet nga çmimi nëse nënshkruhet kontrata; afat i shkruar dhe çmim sipas zërave.',
      followUpSq:
        'Pas ofertës, një telefonatë pas 5–7 ditësh për pyetje; nëse nuk ka vendim, një rikujtesë e vetme. Pas montimit, kontroll pas 30 ditësh për rregullime.',
      metricsSq: [
        'Kërkesa për ofertë → kontrata (%)',
        'Marzhi real për projekt',
        'Orë montimi për projekt',
        'Projekte me ribërje (%)',
        'Ditë vonesë kundrejt afatit',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje, jam [emri] nga [emri i punishtes]. Projektojmë dhe montojmë kuzhina e dollapë me masë për apartamente. Para se të nënshkruani, ju japim projektin 3D, çmimin sipas çdo zëri dhe afatin me shkrim. Ja disa projekte që kemi bërë: [foto ose portofoli]. Kur do t’ju përshtatej një matje?',
    offerTemplateSq:
      'Oferta për [emri i klientit]: (1) [kuzhinë ose dollap] sipas projektit 3D të miratuar më [data]; (2) materialet: [pllaka], [sipërfaqja e punës], [aksesorët], me çmim të ndarë sipas zërave; (3) afati i montimit: [data], me njoftim me shkrim për çdo vonesë; (4) çmimi total [çmimi], paradhënie [përqindja] në nënshkrim, pjesa tjetër në montim; (5) garanci e shkruar [periudha] për punën. Lidhjet e ujit, të rrymës dhe të gazit kryhen nga profesionistë të licencuar dhe nuk përfshihen në këtë çmim.',
    feedbackQuestionsSq: [
      'Çfarë ju shqetësoi gjatë procesit, nga matja deri te montimi?',
      'A u mbajtën afati dhe çmimi i ofertës?',
      'Çfarë do të ndryshonit në projekt tani që e përdorni çdo ditë?',
      'A ka mbetur ndonjë rregullim i papërfunduar?',
    ],
    goCriteriaSq: [
      'Të paktën 3 kontrata me paradhënie nga 15 oferta brenda 2 muajve.',
      'Marzhi mesatar pas materialeve mbi 40% dhe asnjë projekt me ribërje të madhe.',
    ],
    killCriteriaSq: [
      'Më pak se 2 kontrata nga 20 oferta pas 3 muajsh.',
      'Kontributi i projekteve nuk i mbulon pagat dhe qiranë për 4 muaj radhazi.',
      'Lejet e punishtes nuk mund të merren brenda buxhetit.',
    ],
    phaseNotesSq: {
      p10_20: [
        'Intervistoni 10 familje që kanë mobiluar së fundi dhe 3 ndërtues për çmimin, afatin dhe problemet.',
      ],
      p20_30: [
        'Kërkoni oferta si klient te 3 punishte dhe 2 dyqane me kuzhina modulare për të njëjtin plan kuzhine.',
      ],
      p40_50: [
        'Verifikoni zonimin, lejet e punishtes dhe sigurinë nga zjarri para se të nënshkruani qiranë.',
      ],
      p50_60: [
        'Testoni shërbimin e prerjes dhe të kantimit te 2 furnitorë me një projekt të vogël; krahasoni saktësinë dhe afatin.',
      ],
      p60_70: ['Bëni 2–3 projekte të vogla me paradhënie para se të punësoni stafin e plotë.'],
      p80_90: ['Matni orët reale për çdo fazë (projektim, prodhim, montim) dhe rishikoni çmimet.'],
    },
    assumptionsSq: [
      'Prerja dhe kantimi i pllakave mund të porositen te furnitorët, pa blerë makineri të mëdha (verifikojeni në zonën tuaj).',
      'Paradhënia mbulon materialin; modeli e thjeshton me pagesë në dorëzim.',
      'Një ekip prej 2–3 personash mund të përfundojë 2–4 projekte në muaj.',
      'Interesi verbal nuk është provë; vetëm kontratat me paradhënie e konfirmojnë kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 7. B2B laundry for hotels & guesthouses — premises, team, high capital
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'lavanderi-per-hotele-dhe-bujtina',
    nameSq: 'Lavanteri për hotele, bujtina dhe apartamente me qira ditore',
    taglineSq: 'Çarçafë e peshqirë të larë, të tharë e të paketuar — me marrje dhe dorëzim sipas orarit të klientit.',
    descriptionSq:
      'Lavanteri për biznese që merr, lan, than, hekuros dhe paketon çarçafë, mbulesa, peshqirë dhe mbulesa tavoline për hotele të vegjël, bujtina, apartamente me qira ditore dhe restorante. Klientët e vegjël shpesh i lajnë vetë me makina shtëpiake që nuk e përballojnë volumin e sezonit, ose punojnë me lavanteri të largëta. Kërkon ambient të përshtatshëm, makineri industriale, mjet transporti, ekip dhe kapital të lartë, si dhe leje për shkarkimin e ujërave dhe për sigurinë.',
    sector: 'turizem',
    offerSq:
      'Shërbim larjeje me kg ose me copë: marrje dhe dorëzim 2–3 herë në javë sipas orarit të ndërrimit të dhomave, larje në temperaturë të kontrolluar, tharje dhe hekurosje e çarçafëve, paketim i ndarë për çdo klient, raport mujor i sasive dhe njoftim për tekstilet e dëmtuara. Opsion: qiradhënie tekstilesh (jo në modelin bazë).',
    payingCustomerSq:
      'Pronarë ose menaxherë hotelesh të vegjël, bujtinash, apartamentesh me qira ditore dhe restorantesh.',
    customerSegments: ['b2b'],
    problemSq:
      'Në sezon, bujtinat dhe apartamentet me qira ditore kanë shumë ndërrime dhe nuk arrijnë t’i lajnë e t’i thajnë tekstilet në kohë me makina shtëpiake; larja i merr orë stafit, tekstilet konsumohen shpejt dhe cilësia e paqëndrueshme sjell ankesa nga mysafirët.',
    modes: ['fizik'],
    marketScopes: ['lokal'],
    canStartFromHome: false,
    minTeam: 'ekip',
    requiredSkills: ['menaxhim_projekti', 'logjistike'],
    helpfulSkills: ['shitje', 'pastrim', 'drejtim_mjeti', 'kontabilitet', 'mikpritje'],
    helpfulAssets: ['furgon', 'magazine', 'rrjet_kontaktesh'],
    minHoursPerWeek: 45,
    regulated: true,
    regulationNotesSq: [
      'Shkarkimi i ujërave me detergjentë në rrjetin e kanalizimeve mund të kërkojë leje ose kontratë me ndërmarrjen e ujësjellës-kanalizimeve: Kërkon verifikim lokal para se ta merrni ambientin.',
      'Leja mjedisore dhe zonimi për aktivitet lavanterie industriale, sipas madhësisë dhe zonës: verifikoni me bashkinë.',
      'Siguria nga zjarri (pluhuri i pambukut te tharëset, instalimet me gaz ose me rrymë të fortë): instalimet kryhen vetëm nga profesionistë të licencuar dhe kontrollohen sipas rregullave lokale, që duhen verifikuar.',
      'Siguria në punë: kimikatet, sipërfaqet e nxehta dhe ngritja e peshave kërkojnë trajnim dhe mjete mbrojtëse; verifikoni detyrimet e punëdhënësit.',
      'Ndarja e rrjedhës së tekstileve të pista nga të pastrat dhe kërkesat higjienike për tekstilet e hoteleve: verifikoni standardet lokale.',
      'Transporti i tekstileve të klientëve me mjetin tuaj dhe sigurimi i tyre gjatë transportit: Kërkon verifikim lokal.',
    ],
    licensedProfessionalsSq: [
      'Elektricist i licencuar për linjat trefazore dhe lidhjen e makinerive',
      'Teknik i certifikuar gazi ose ngrohjeje (nëse tharëset ose kaldaja punojnë me gaz)',
      'Hidraulik për furnizimin me ujë dhe shkarkimin',
      'Specialist mjedisi për lejen e shkarkimit, kur kërkohet',
      'Kontabilist për pagat dhe faturimin',
    ],
    adultOnly: true,
    zeroCapitalTestSq:
      'Kjo ide kërkon kapital të lartë dhe nuk niset pa shpenzime. Para se të blini makineri: intervistoni 15 pronarë bujtinash dhe hotelesh për sasitë javore dhe sa paguajnë sot; pastaj negocioni me një lavanteri ekzistuese të licencuar që ka kapacitet të lirë një çmim për kg, dhe u ofroni 3 klientëve provë një muaj shërbim ku ju merreni me marrjen, dorëzimin dhe komunikimin. Kostoja reale: pagesa te lavanteria partnere, karburanti, thasët dhe koha juaj — marzhi gjatë provës do të jetë i vogël, por mat kërkesën dhe sasitë reale.',
    revenueModelSq:
      'Çmim për kg tekstile të larë dhe të dorëzuar (njësia = 1 kg), i faturuar një herë në muaj; çmimet për copë për artikuj të veçantë dhe qiradhënia e tekstileve janë opsione jashtë modelit bazë.',
    pricing: {
      unitLabelSq: 'kg tekstile',
      priceUSD: { low: 1.4, base: 2.3, high: 3.5 },
      variableCostUSD: { low: 0.55, base: 0.85, high: 1.3 },
      unitsPerCustomerPerMonth: 700,
      collectionDays: 45,
      supplierPaymentDays: 30,
      noteSq:
        'Kostoja variabël përfshin detergjentët, ujin, pjesën e energjisë/gazit për larje dhe tharje, dhe thasët e paketimit; nuk përfshin pagat dhe qiranë. “Klient” = një hotel i vogël ose bujtinë me mesatarisht rreth 700 kg në muaj (shumë më tepër në sezon, shumë më pak jashtë tij). Energjia është zëri më i ndjeshëm: kërkoni tarifat reale dhe konsumin e makinave nga furnitori. Çmimet janë supozime në USD; verifikoni sa paguajnë sot bujtinat në zonë.',
    },
    startupCosts: [
      {
        id: 'industrial-machines',
        labelSq: 'Makina larëse-shtrydhëse industriale, tharëse dhe hekurosëse me rul',
        category: 'pajisje',
        lowUSD: 18000,
        highUSD: 60000,
        noteSq:
          'Varet nga kapaciteti, nga gjendja (e re apo e përdorur) dhe nga burimi i energjisë (rrymë ose gaz). Kërkoni 3 oferta me konsumin e energjisë dhe të ujit për kg, si dhe kushtet e servisit lokal.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'premises-fitout',
        labelSq: 'Përshtatja e ambientit (kanalizim, ventilim, linjë trefazore, dysheme)',
        category: 'hapje',
        lowUSD: 5000,
        highUSD: 20000,
        noteSq:
          'Kryhet nga profesionistë të licencuar; kërkoni inspektim dhe ofertë para se të nënshkruani qiranë, sepse jo çdo ambient e lejon këtë aktivitet.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'rent-deposit',
        labelSq: 'Depozita e qirasë',
        category: 'depozita',
        lowUSD: 2400,
        highUSD: 7000,
        noteSq: 'Shpesh disa muaj qira; negocioni një periudhë pa qira gjatë përshtatjes së ambientit.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'delivery-van',
        labelSq: 'Furgon i përdorur për marrje dhe dorëzim',
        category: 'pajisje',
        lowUSD: 8000,
        highUSD: 20000,
        noteSq:
          'Nevojitet vetëm nëse nuk keni furgon; brenda tij duhet ndarje mes tekstileve të pista dhe të pastra.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['furgon'],
      },
      {
        id: 'carts-scales',
        labelSq: 'Karroca, rafte, thasë dhe peshore',
        category: 'pajisje',
        lowUSD: 800,
        highUSD: 2500,
        noteSq:
          'Thasë me ngjyra të ndryshme për të pistat dhe të pastrat, dhe peshore e kalibruar për faturimin me kg.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'permits',
        labelSq: 'Leje mjedisore, shkarkimi, zjarrfikëse dhe regjistrim',
        category: 'tarifa',
        lowUSD: 300,
        highUSD: 2500,
        noteSq:
          'Procedurat ndryshojnë shumë; merrni listën e plotë nga bashkia dhe nga ndërmarrja e ujësjellës-kanalizimeve para çdo investimi.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'chemicals-stock',
        labelSq: 'Stok fillestar detergjentësh dhe kimikatesh',
        category: 'inventar',
        lowUSD: 400,
        highUSD: 1500,
        noteSq:
          'Pyesni furnitorët për sisteme dozimi dhe trajnim; shpesh i japin pajisjet e dozimit me kontratë furnizimi.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: muaj provë me lavanteri partnere për 3 klientë',
        category: 'testim_tregu',
        lowUSD: 300,
        highUSD: 1000,
        noteSq:
          'Diferenca mes pagesës te lavanteria partnere dhe çmimit të klientëve, karburanti dhe thasët gjatë provës.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'premises-rent',
        labelSq: 'Qira e ambientit',
        category: 'qira',
        lowUSD: 1200,
        highUSD: 3500,
        noteSq:
          'Ambient me kanalizim dhe energji të mjaftueshme; periferia është më e lirë, por rrit transportin. Krahasoni 3 oferta.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'wages',
        labelSq: 'Paga: 2–3 punonjës (larje, hekurosje, shofer)',
        category: 'paga',
        lowUSD: 3500,
        highUSD: 8000,
        noteSq:
          'Në sezon mund të duhen punonjës shtesë; përfshini kontributet dhe verifikoni pagat lokale.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'utilities-base',
        labelSq: 'Energji, ujë dhe gaz — pjesa fikse',
        category: 'sherbime_komunale',
        lowUSD: 400,
        highUSD: 1200,
        noteSq:
          'Tarifat fikse, ndriçimi dhe ngrohja e ambientit; pjesa që ndryshon me kg është te kostoja variabël.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'van-running',
        labelSq: 'Karburant, mirëmbajtje dhe sigurim i furgonit',
        category: 'transport',
        lowUSD: 250,
        highUSD: 700,
        noteSq: 'Varet nga rruga e dorëzimeve; planifikoni rrugë fikse sipas ditëve.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'machine-service',
        labelSq: 'Servis i makinerive dhe pjesë këmbimi',
        category: 'mirembajtje',
        lowUSD: 150,
        highUSD: 600,
        noteSq:
          'Kontratë servisi me furnitorin ose me një teknik lokal; një makinë e ndalur në sezon kushton shumë.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'insurance',
        labelSq: 'Sigurim i ambientit, makinerive dhe tekstileve të klientëve',
        category: 'sigurime',
        lowUSD: 100,
        highUSD: 350,
        noteSq:
          'Pyesni 2–3 agjenci për mbulimin e zjarrit dhe të dëmtimit të tekstileve të klientëve.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'accounting',
        labelSq: 'Kontabilitet dhe paga',
        category: 'kontabilitet',
        lowUSD: 100,
        highUSD: 250,
        noteSq: 'Me punonjës dhe faturim mujor për biznese, kontabilisti është i nevojshëm.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'tracking-software',
        labelSq: 'Software faturimi dhe gjurmimi i porosive',
        category: 'software',
        lowUSD: 20,
        highUSD: 80,
        noteSq:
          'Një sistem i thjeshtë për peshën, porositë dhe faturat i ul gabimet dhe mosmarrëveshjet.',
        scalesWithPriceLevel: false,
      },
    ],
    ramp: {
      konservator: { startCustomers: 0, monthlyNewCustomers: 0.7, monthlyChurnPct: 5 },
      baze: { startCustomers: 1, monthlyNewCustomers: 1.5, monthlyChurnPct: 4 },
      optimist: { startCustomers: 2, monthlyNewCustomers: 2.5, monthlyChurnPct: 3 },
    },
    seasonality: [0.5, 0.5, 0.7, 0.9, 1.1, 1.45, 1.75, 1.8, 1.3, 0.9, 0.55, 0.55],
    seasonalityNoteSq:
      'Shumë e varur nga turizmi: në zonat bregdetare ose malore, vëllimi në kulmin e sezonit mund të jetë disa herë më i madh se në dimër, ndërsa pagat dhe qiraja mbeten. Hotelet e qytetit dhe restorantet e zbusin këtë luhatje. Vlerat janë supozim; planifikoni rezervë parash për muajt e qetë.',
    macroLinks: [
      {
        indicatorCode: 'tourism_arrivals',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Më shumë vizitorë do të thotë më shumë netë qëndrimi dhe më shumë ndërrime tekstilesh në hotele, bujtina dhe apartamente me qira ditore.',
        ifSupportsSq:
          'Rritja e mbërritjeve sugjeron volum në rritje — kontrolloni nëse rritja ndodh në zonën tuaj dhe jo vetëm në kryeqytet.',
        ifContradictsSq:
          'Pa rritje turizmi, tregu mbështetet te hotelet ekzistuese dhe restorantet, ku konkurrenca për kontrata është më e fortë.',
      },
      {
        indicatorCode: 'tourism_receipts_usd',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Të ardhurat më të larta nga turizmi u japin hoteleve dhe bujtinave më shumë mundësi të paguajnë për shërbime të jashtme në vend që të lajnë vetë.',
        ifSupportsSq: 'Rritja e të ardhurave nga turizmi mbështet gatishmërinë për të paguar shërbim profesional.',
        ifContradictsSq:
          'Të ardhurat në rënie i shtyjnë akomodimet të kursejnë dhe të lajnë vetë; çmimi do të jetë pengesa kryesore.',
      },
      {
        indicatorCode: 'lending_rate',
        direction: 'me_i_ulet_mbeshtet',
        mechanismSq:
          'Makineria dhe përshtatja e ambientit shpesh financohen me kredi ose lizing; normat e larta rrisin koston fikse mujore dhe pragun e mbijetesës.',
        ifSupportsSq: 'Normat më të ulëta e bëjnë më të përballueshëm financimin e makinerisë.',
        ifContradictsSq:
          'Me norma të larta, konsideroni makineri të përdorur ose blerjen e kapacitetit te një lavanteri ekzistuese para se të blini.',
      },
      {
        indicatorCode: 'inflation_cpi',
        direction: 'me_i_ulet_mbeshtet',
        mechanismSq:
          'Energjia, uji dhe detergjentët janë kosto kryesore; inflacioni i lartë e gërryen marzhin kur çmimi për kg është fiksuar për sezonin.',
        ifSupportsSq: 'Inflacioni i ulët e bën më të sigurt fiksimin e çmimeve sezonale.',
        ifContradictsSq:
          'Me inflacion të lartë, vendosni në kontratë rregullim çmimi sipas kostos së energjisë.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Shtimi i akomodimeve të vogla dhe i apartamenteve me qira ditore ka rritur numrin e ndërrimeve të tekstileve.',
      problemSq:
        'Akomodimet e vogla nuk e përballojnë larjen në sezon me makina shtëpiake dhe stafi humbet orë me këtë punë.',
      customerSq: 'Pronarët e bujtinave, hoteleve të vegjël, apartamenteve me qira ditore dhe restoranteve.',
      offerSq: 'Marrje dhe dorëzim sipas orarit, tekstile të pastra dhe të paketuara, faturë e vetme mujore.',
      reasonToPaySq: 'Kursim kohe dhe stafi, cilësi e qëndrueshme për mysafirët dhe pa investim në makina.',
      profitConditionsSq:
        'Fitimi kërkon volum të mjaftueshëm edhe jashtë sezonit, rrugë dorëzimi efikase, kosto energjie të kontrolluar dhe klientë që i paguajnë faturat brenda 30–45 ditëve.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq:
          'Shumë akomodime vazhdojnë të lajnë vetë dhe vetëm pak pranojnë të paguajnë për shërbim të jashtëm.',
      },
      {
        kind: 'cmim',
        textSq: 'Çmimi për kg që pranojnë klientët nuk i mbulon energjinë, pagat dhe transportin.',
      },
      {
        kind: 'konkurrence',
        textSq:
          'Lavanteri industriale ekzistuese me kapacitet të madh ofrojnë çmime më të ulëta për kontrata të mëdha.',
      },
      {
        kind: 'kosto',
        textSq:
          'Energjia dhe uji shtrenjtohen; makineria e përdorur prishet dhe kërkon riparime të kushtueshme.',
      },
      {
        kind: 'sezonalitet',
        textSq: 'Në dimër vëllimi bie fort, ndërsa pagat, qiraja dhe kredia mbeten.',
      },
      {
        kind: 'vonesa_pagesash',
        textSq:
          'Hotelet paguajnë me 45–90 ditë vonesë, pikërisht kur lavanteria ka kostot më të larta në sezon.',
      },
      {
        kind: 'operacionale',
        textSq:
          'Tekstile të humbura ose të përziera mes klientëve dhe vonesa në dorëzim sjellin ankesa dhe humbje kontratash.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Leja e shkarkimit të ujërave ose ajo mjedisore nuk merret, ose kërkon investim shtesë në trajtim.',
      },
    ],
    falsifiersSq: [
      'Nga 15 akomodime të intervistuara, më pak se 4 paguajnë sot për larje të jashtme ose përshkruajnë një problem konkret me larjen në sezon.',
      'Gjatë muajit provë, sasia mesatare për klient është nën 300 kg në muaj në sezon.',
      'Çmimi i pranuar për kg është më i ulët se dyfishi i kostos variabël, gjë që nuk mbulon pagat dhe qiranë.',
      'Nuk gjendet ambient i përshtatshëm me leje shkarkimi brenda 30 minutash nga zona me akomodime.',
    ],
    differentiationSq: [
      'Marrje dhe dorëzim sipas orarit të ndërrimit të dhomave, edhe në fundjavë gjatë sezonit.',
      'Gjurmim i peshës dhe i numrit të copave për çdo klient, me raport mujor.',
      'Njoftim për tekstilet e dëmtuara dhe opsion qiradhënieje tekstilesh për klientët që nuk duan të blejnë.',
    ],
    competitorTypesSq: [
      'Lavanteri industriale të mëdha me kontrata hotelesh',
      'Lavanteri vetëshërbimi',
      'Larja në vend nga stafi i akomodimit',
      'Pastrime kimike që pranojnë edhe tekstile',
      'Hotele të mëdha me lavanteri të brendshme që shesin kapacitet të lirë',
    ],
    cheapestTestSq:
      'Muaj provë me 3 akomodime duke përdorur kapacitetin e një lavanterie ekzistuese të licencuar, ndërsa ju merreni me marrjen, dorëzimin dhe komunikimin. Matni kg reale për klient, çmimin e pranuar dhe pagesën e faturës së parë.',
    interviewQuestionsSq: [
      'Si i lani sot çarçafët dhe peshqirët, dhe kush e bën këtë punë?',
      'Sa kg ose sa copa latë në një javë të sezonit të kaluar, përafërsisht?',
      'Sa ju kushtoi larja muajin e fundit, përfshirë orët e stafit dhe energjinë?',
      'Kur ishte hera e fundit që tekstilet nuk ishin gati në kohë për një mysafir? Çfarë bëtë?',
      'Keni punuar më parë me një lavanteri të jashtme? Pse vazhduat ose pse e latë?',
      'Me çfarë afati i paguani zakonisht furnitorët tuaj?',
      'Kush vendos për ndërrimin e furnitorëve të shërbimeve në biznesin tuaj?',
    ],
    firstCustomers: {
      whereSq: [
        'Bujtina dhe hotele të vegjël në zonat turistike brenda 30 minutash',
        'Administratorë që menaxhojnë disa apartamente me qira ditore',
        'Restorante me mbulesa tavoline prej pëlhure',
        'Shoqata lokale të akomodimit ose të turizmit',
      ],
      howToContactSq: [
        'Vizitë personale jashtë kulmit të sezonit, me listë çmimesh dhe orar marrjeje',
        'Prezantim nga administratorë apartamentesh që menaxhojnë disa njësi',
        'Takime të shoqatave të turizmit; pa mesazhe masive ose lista të blera',
      ],
      offerSq: 'Muaj provë me çmimin e plotë për kg, pa kontratë afatgjatë; ndërprerje me njoftim 30-ditor.',
      followUpSq:
        'Takim i shkurtër në fund të muajit provë me raportin e sasive dhe të ankesave; një rikujtesë e vetme për ata që nuk vendosën.',
      metricsSq: [
        'Kg në muaj për klient',
        'Dorëzime në kohë (%)',
        'Copa të humbura ose të dëmtuara për 1.000 copa',
        'Ditë mesatare arkëtimi',
        'Kostoja e energjisë për kg',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje, jam [emri] nga [emri i biznesit]. Marrim çarçafët dhe peshqirët tuaj [ditët e marrjes], i lajmë, i thajmë, i hekurosim dhe jua sjellim të paketuar brenda [afati]. Faturojmë me kg, një herë në muaj, me raport të sasive. Si i lani sot dhe sa ju merr kjo punë në sezon?',
    offerTemplateSq:
      'Oferta për [emri i akomodimit]: (1) marrje dhe dorëzim [ditët] para orës [ora]; (2) larje, tharje, hekurosje dhe paketim i ndarë; (3) çmimi [çmimi] për kg, minimum [sasia] kg për marrje; (4) raport mujor i peshës dhe njoftim për tekstilet e dëmtuara; (5) faturë mujore me pagesë brenda [ditë] ditëve. Muaj provë pa detyrim afatgjatë, ndërprerje me njoftim 30-ditor.',
    feedbackQuestionsSq: [
      'A erdhën tekstilet në kohë për çdo ndërrim dhomash?',
      'A pati ankesa nga mysafirët për pastërtinë ose për erën?',
      'Sa orë të stafit u kursyen këtë muaj?',
      'Çfarë duhet përmirësuar në orar ose në paketim?',
    ],
    goCriteriaSq: [
      'Të paktën 3 klientë vazhdojnë pas muajit provë me çmimin e planifikuar.',
      'Klientët e provës japin mesatarisht mbi 500 kg në muaj në sezon dhe e paguajnë faturën e parë brenda 45 ditëve.',
      'Gjendet një ambient me leje shkarkimi dhe kostoja e përshtatjes hyn në buxhet.',
    ],
    killCriteriaSq: [
      'Pas 20 kontakteve, më pak se 2 akomodime pranojnë muajin provë.',
      'Çmimi i pranuar për kg nuk mbulon koston variabël plus pagat edhe me 10 klientë.',
      'Lejet e shkarkimit ose ato mjedisore nuk mund të merren në një ambient të përballueshëm.',
    ],
    phaseNotesSq: {
      p10_20: [
        'Intervistoni 15 akomodime për sasitë javore në sezon dhe jashtë sezonit, si dhe për koston aktuale të larjes.',
      ],
      p30_40: [
        'Ndërtoni modelin me sezonalitet të fortë dhe llogaritni sa para ju duhen për të kaluar dimrin.',
      ],
      p40_50: [
        'Verifikoni lejen e shkarkimit, zonimin dhe sigurinë nga zjarri para se të nënshkruani qiranë.',
      ],
      p50_60: [
        'Kërkoni 3 oferta për makineri me konsumin e energjisë dhe të ujit për kg dhe me kushtet e servisit.',
      ],
      p60_70: ['Muaj provë me lavanteri partnere për 3 klientë; matni kg, kohët e dorëzimit dhe ankesat.'],
      p90_100: [
        'Shtoni kapacitet ose turn të dytë vetëm kur makineria punon mbi 70% të kohës gjatë sezonit.',
      ],
    },
    assumptionsSq: [
      'Klienti mesatar jep rreth 700 kg në muaj, me luhatje të madhe sezonale.',
      'Hotelet i paguajnë faturat brenda 45 ditëve (në praktikë shpesh më vonë).',
      'Ekzistojnë ambiente me qira ku, pas verifikimit, lejohet shkarkimi i ujërave të lavanterisë.',
      'Interesi verbal nuk është provë; vetëm muaji provë me pagesë e konfirmon kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 8. Small agro-processing: dried fruit & jam — premises, partner, mid capital,
  //    local + diaspora/export market
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'perpunim-frutash-te-thata-dhe-recelrash',
    nameSq: 'Përpunim i vogël frutash: fruta të thata dhe reçel',
    taglineSq: 'Fruta të zonës, të përpunuara në ambient të regjistruar, me etiketë të plotë — për dyqane, kafene dhe diasporë.',
    descriptionSq:
      'Agro-përpunim në shkallë të vogël: tharje frutash (mollë, kumbulla, fiq, kajsi etj.) dhe përgatitje reçeli me receta të validuara, në një ambient të regjistruar për përpunim ushqimor. Produkti shitet te dyqanet ushqimore dhe të produkteve vendase, kafenetë, dyqanet në diasporë dhe drejtpërdrejt te familjet. Vlera krijohet duke i blerë frutat në sezon nga fermerët vendas, kur çmimi është i ulët dhe një pjesë humbet, dhe duke i kthyer në produkte që ruhen me muaj. Kërkon regjistrim ushqimor, plan higjiene të tipit HACCP, etiketim të saktë dhe zakonisht dy persona gjatë sezonit të përpunimit.',
    sector: 'bujqesi',
    offerSq:
      'Fruta të thata në qese 150–250 g dhe reçel në kavanozë 250–350 g, me etiketë të plotë (përbërës, alergjenë, peshë, afat, numër serie, prodhues), kuti me përzierje për dhurata, furnizim i rregullt për 10–40 pika shitjeje me çmim shumice dhe porosi për dyqane në diasporë pasi të jenë verifikuar rregullat e eksportit.',
    payingCustomerSq:
      'Pronarë dyqanesh ushqimore dhe produktesh vendase, kafene, dyqane në diasporë dhe familje që blejnë drejtpërdrejt.',
    customerSegments: ['b2b', 'b2c'],
    problemSq:
      'Fermerët humbasin një pjesë të frutave në kulmin e sezonit, sepse nuk i shesin dot të freskëta, ndërsa dyqanet dhe blerësit kërkojnë produkte vendase me etiketë të besueshme që nuk gjenden rregullisht gjatë gjithë vitit.',
    modes: ['kombinuar'],
    marketScopes: ['lokal', 'nderkombetar'],
    canStartFromHome: false,
    minTeam: 'partner',
    requiredSkills: ['gatim'],
    helpfulSkills: ['bujqesi', 'shitje', 'import_eksport', 'dizajn_grafik', 'marketing_digjital', 'logjistike'],
    helpfulAssets: ['kuzhine_profesionale', 'toke', 'magazine', 'automjet', 'rrjet_diaspore', 'rrjet_kontaktesh'],
    minHoursPerWeek: 30,
    regulated: true,
    regulationNotesSq: [
      'Regjistrimi si operator ushqimor dhe miratimi i ambientit të përpunimit nga autoriteti i sigurisë ushqimore: Kërkon verifikim lokal. Në disa vende ka regjime të veçanta për prodhimin e vogël në shtëpi të produkteve me rrezik të ulët — mos supozoni se lejohet pa konfirmim zyrtar.',
      'Plan higjiene i tipit HACCP: pikat kritike për reçelin (sasia e sheqerit, aciditeti, mbyllja e kavanozëve) dhe për frutat e thata (lagështia përfundimtare, ruajtja). Përdorni vetëm receta dhe procese të verifikuara nga një teknolog ushqimi; produktet me pak sheqer ose me pak acid kanë rreziqe të veçanta.',
      'Etiketimi: përbërësit, alergjenët (p.sh. sulfitet, nëse përdoren te frutat e thata), pesha neto, afati, numri i serisë dhe prodhuesi; mund të kërkohet edhe deklarata ushqyese. Verifikoni listën e plotë lokalisht.',
      'Analizat laboratorike (uji i përdorur, lagështia, mikrobiologjia) dhe gjurmueshmëria e fermerëve furnitorë: verifikoni çfarë kërkohet dhe sa shpesh.',
      'Eksporti ose dërgimi te dyqanet në diasporë: rregullat e importit të vendit të destinacionit (certifikata, etiketa në gjuhën vendase, kufizime) kërkojnë verifikim para çdo porosie; mund t’ju duhet agjent doganor.',
    ],
    licensedProfessionalsSq: [
      'Teknolog ushqimi për validimin e recetave dhe planin e higjienës',
      'Laborator i akredituar për analizat e produktit dhe të ujit',
      'Agjent doganor për eksportin, kur shitet jashtë vendit',
      'Elektricist i licencuar për instalimin e tharëseve dhe të pajisjeve me fuqi të lartë',
    ],
    adultOnly: true,
    zeroCapitalTestSq:
      'Produktet ushqimore për shitje nuk duhen prodhuar pa regjistrim, prandaj testi fillestar e mat kërkesën pa shitur: pyetni 15 dyqane dhe 3 dyqane në diasporë (përmes rrjetit tuaj) çfarë produktesh vendase shesin, me çfarë çmimi shumice dhe sa shpesh e rinovojnë stokun; kërkoni letra interesi për sasi konkrete. Pastaj, nëse ka interes, negocioni përdorimin me orë të një kuzhine ose punishteje ushqimore të licencuar për një seri provë. Kostoja reale: frutat, kavanozët, etiketat, pagesa e ambientit partner dhe analizat — jo zero.',
    revenueModelSq:
      'Shitje me shumicë për njësi (njësia = 1 kavanoz ose qese) te pikat e shitjes, plus shitje direkte me çmim pakice (jo në modelin bazë); kutitë e dhuratave për festat janë të ardhura shtesë.',
    pricing: {
      unitLabelSq: 'kavanoz ose qese',
      priceUSD: { low: 3.5, base: 5.5, high: 8.5 },
      variableCostUSD: { low: 1.5, base: 2.3, high: 3.3 },
      unitsPerCustomerPerMonth: 30,
      collectionDays: 40,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin frutat, sheqerin, kavanozin ose qesen, etiketën dhe energjinë e tharjes/gatimit për njësi. “Klient” = një pikë shitjeje që merr rreth 30 njësi në muaj. Kujdes: frutat blihen në sezon dhe paguhen menjëherë, por produkti shitet gjatë disa muajve — kjo kërkon kapital qarkullues shtesë që modeli mujor nuk e kap plotësisht; shtoni rezervë. Dyqanet shpesh paguajnë pas 30–60 ditësh ose me konsinjacion. Çmimet janë supozime në USD; verifikoni çmimet e shumicës në dyqanet lokale.',
    },
    startupCosts: [
      {
        id: 'dryers-kettles',
        labelSq: 'Tharëse frutash, kazanë inoksi, peshore dhe pajisje mbushjeje',
        category: 'pajisje',
        lowUSD: 2500,
        highUSD: 9000,
        noteSq:
          'Varet nga kapaciteti dhe nga burimi i energjisë; tharëset diellore dhe ato elektrike kanë kosto përdorimi shumë të ndryshme. Kërkoni 3 oferta me konsumin për kg.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'room-fitout',
        labelSq: 'Përshtatja e ambientit sipas kërkesave të higjienës',
        category: 'hapje',
        lowUSD: 1500,
        highUSD: 8000,
        noteSq:
          'Sipërfaqe që lahen, lavamanë, rrjeta kundër insekteve, ndarje e zonave; pyesni autoritetin e sigurisë ushqimore çfarë kontrollojnë para se të investoni.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['kuzhine_profesionale'],
      },
      {
        id: 'rent-deposit',
        labelSq: 'Depozita e qirasë së ambientit',
        category: 'depozita',
        lowUSD: 800,
        highUSD: 2500,
        noteSq:
          'Shpesh disa muaj qira; verifikoni që ambienti lejon përpunim ushqimor para se të nënshkruani.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['kuzhine_profesionale'],
      },
      {
        id: 'packaging-stock',
        labelSq: 'Kavanozë, kapakë, qese, etiketa dhe kuti',
        category: 'inventar',
        lowUSD: 600,
        highUSD: 2000,
        noteSq:
          'Porositni etiketat vetëm pasi teksti të jetë verifikuar; kavanozët dhe kapakët duhet të jenë për ushqim dhe të përputhen mes tyre.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'fruit-stock',
        labelSq: 'Fruta dhe sheqer për sezonin e parë',
        category: 'inventar',
        lowUSD: 800,
        highUSD: 3000,
        noteSq:
          'Blihen në sezon dhe ruhen si produkt për muaj; nisni me sasi të vogël dhe me marrëveshje me shkrim me 2–3 fermerë.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'registration-lab',
        labelSq: 'Regjistrim ushqimor, teknolog dhe analiza laboratorike',
        category: 'tarifa',
        lowUSD: 400,
        highUSD: 2000,
        noteSq:
          'Përfshin validimin e recetave dhe analizat e para; merrni oferta nga 2 teknologë dhe nga laboratorë të akredituar.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'label-design',
        labelSq: 'Dizajn etikete dhe marke',
        category: 'hapje',
        lowUSD: 100,
        highUSD: 600,
        noteSq:
          'Një dizajner lokal ose aftësitë tuaja; etiketa duhet të ketë vend për gjithë tekstin e detyrueshëm.',
        scalesWithPriceLevel: true,
        optional: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: seri provë në ambient partner të licencuar',
        category: 'testim_tregu',
        lowUSD: 200,
        highUSD: 700,
        noteSq:
          'Fruta, paketim, pagesë për ambientin dhe analiza për një seri të vogël provë për 5–10 dyqane.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'processing-rent',
        labelSq: 'Qira e ambientit të përpunimit dhe të ruajtjes',
        category: 'qira',
        lowUSD: 400,
        highUSD: 1200,
        noteSq:
          'Ambient i vogël me ruajtje të freskët dhe të thatë; zonat jashtë qendrës janë më të lira. Krahasoni 3 oferta.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['kuzhine_profesionale'],
      },
      {
        id: 'utilities',
        labelSq: 'Energji, ujë dhe gaz',
        category: 'sherbime_komunale',
        lowUSD: 100,
        highUSD: 400,
        noteSq: 'Tharja konsumon shumë energji në sezon; matni konsumin gjatë serisë provë.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'transport',
        labelSq: 'Transport për frutat dhe për dorëzimet',
        category: 'transport',
        lowUSD: 80,
        highUSD: 300,
        noteSq:
          'Gruponi dorëzimet te dyqanet sipas zonës; dërgesat në diasporë kanë kosto të veçantë që i faturohet klientit.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'periodic-lab',
        labelSq: 'Analiza periodike dhe teknolog',
        category: 'tjeter',
        lowUSD: 20,
        highUSD: 100,
        noteSq:
          'Sipas planit të higjienës dhe kërkesave të dyqaneve; verifikoni frekuencën e detyrueshme.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'product-insurance',
        labelSq: 'Sigurim përgjegjësie për produktin',
        category: 'sigurime',
        lowUSD: 30,
        highUSD: 120,
        noteSq: 'Mbulon dëmet nga produkti; disa dyqane e kërkojnë. Pyesni 2 agjenci.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'accounting',
        labelSq: 'Kontabilitet',
        category: 'kontabilitet',
        lowUSD: 50,
        highUSD: 150,
        noteSq: 'Me shitje te dyqanet dhe eksport, nevojitet kontabilist; kërkoni një çmim fiks.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'online-catalogue',
        labelSq: 'Katalog online dhe komunikim me dyqanet',
        category: 'software',
        lowUSD: 10,
        highUSD: 40,
        noteSq: 'Një katalog i thjeshtë dhe porositë me mesazh mjaftojnë në fillim.',
        scalesWithPriceLevel: false,
      },
    ],
    ramp: {
      konservator: { startCustomers: 2, monthlyNewCustomers: 1.5, monthlyChurnPct: 6 },
      baze: { startCustomers: 3, monthlyNewCustomers: 3, monthlyChurnPct: 5 },
      optimist: { startCustomers: 5, monthlyNewCustomers: 5, monthlyChurnPct: 4 },
    },
    seasonality: [0.95, 0.85, 0.85, 0.85, 0.85, 0.9, 1.0, 1.0, 1.05, 1.1, 1.2, 1.4],
    seasonalityNoteSq:
      'Shitjet priren të rriten në vjeshtë dhe në dimër, sidomos para festave (dhurata), ndërsa prodhimi përqendrohet në muajt e vjeljes. Kjo do të thotë se paratë dalin në verë dhe në vjeshtë dhe kthehen gjatë dimrit; modeli mujor nuk e tregon plotësisht këtë kapital qarkullues. Kalendari i frutave ndryshon sipas klimës. Vlerat janë supozim.',
    macroLinks: [
      {
        indicatorCode: 'agriculture_va_gdp',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Kur bujqësia zë peshë të rëndësishme, ka më shumë fermerë dhe fruta vendase në dispozicion, shpesh me tepricë në sezon që shitet lirë.',
        ifSupportsSq:
          'Pesha e lartë e bujqësisë sugjeron furnizim të mjaftueshëm dhe të lirë me fruta — verifikoni çmimet në terren gjatë sezonit.',
        ifContradictsSq:
          'Me peshë të ulët bujqësie, frutat mund të jenë të importuara ose të shtrenjta; marzhi do të jetë më i ngushtë.',
      },
      {
        indicatorCode: 'remittances_gdp',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Remitancat e larta tregojnë një diasporë të madhe me lidhje me vendlindjen, që shpesh kërkon produkte vendase në dyqanet e komunitetit jashtë vendit.',
        ifSupportsSq:
          'Sugjeron kërkesë të mundshme nga dyqanet në diasporë — por eksporti kërkon verifikim të rregullave të importit.',
        ifContradictsSq: 'Me remitanca të ulëta, fokusohuni te tregu vendas dhe te turistët.',
      },
      {
        indicatorCode: 'tourism_arrivals',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Vizitorët blejnë produkte ushqimore vendase si kujtim dhe dhuratë, në dyqane suveniresh, bujtina dhe tregje.',
        ifSupportsSq: 'Rritja e turizmit hap kanale shitjeje me çmim më të lartë.',
        ifContradictsSq:
          'Pa turizëm të rëndësishëm, mbështetuni te dyqanet ushqimore dhe te familjet vendase.',
      },
      {
        indicatorCode: 'urban_population_pct',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Familjet në qytet e bëjnë më rrallë vetë reçelin dhe frutat e thata, ndaj i blejnë të gatshme.',
        ifSupportsSq: 'Popullsia e lartë urbane sugjeron më shumë blerës të produkteve të gatshme.',
        ifContradictsSq:
          'Në zonat rurale shumë familje i përgatitin vetë; tregu kryesor do të jenë qytetet dhe diaspora.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Familjet në qytet dhe në diasporë kërkojnë produkte vendase të gatshme, ndërsa fermerët kanë tepricë frutash në sezon.',
      problemSq:
        'Frutat humbasin në kulmin e sezonit, dhe produktet vendase me etiketë të besueshme nuk gjenden rregullisht në dyqane.',
      customerSq: 'Dyqane ushqimore dhe produktesh vendase, kafene, dyqane në diasporë dhe familje.',
      offerSq:
        'Fruta të thata dhe reçel nga frutat e zonës, me etiketë të plotë dhe furnizim të rregullt gjatë vitit.',
      reasonToPaySq: 'Shije vendase, origjinë e njohur dhe një produkt që dyqani e shet gjatë gjithë vitit.',
      profitConditionsSq:
        'Fitimi kërkon blerjen e frutave me çmim të ulët në sezon, pak humbje gjatë përpunimit, 20–40 pika shitjeje që riporosisin dhe kapital qarkullues për muajt mes prodhimit dhe shitjes.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq: 'Dyqanet marrin një sasi provë, por produkti shitet ngadalë në raft dhe nuk riporosisin.',
      },
      {
        kind: 'cmim',
        textSq:
          'Dyqanet krahasojnë me produkte industriale ose të importuara më të lira dhe kërkojnë një çmim shumice që nuk i mbulon kostot.',
      },
      {
        kind: 'konkurrence',
        textSq:
          'Prodhues të tjerë të vegjël dhe familje që shesin pa etiketë në tregje me çmim më të ulët.',
      },
      {
        kind: 'kosto',
        textSq:
          'Kavanozët, sheqeri dhe energjia për tharje shtrenjtohen; një vit me pak fruta e rrit çmimin e lëndës së parë.',
      },
      {
        kind: 'vonesa_pagesash',
        textSq:
          'Dyqanet paguajnë pas mbi 60 ditësh ose vetëm kur shesin (konsinjacion), ndërsa frutat janë paguar në sezon.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Ambienti nuk miratohet, etiketa nuk i plotëson kërkesat ose eksporti bllokohet nga rregullat e vendit të destinacionit.',
      },
      {
        kind: 'sezonalitet',
        textSq:
          'Prodhimi përqendrohet në pak muaj; nëse seria e sezonit dështon, nuk ka produkt për një vit.',
      },
      {
        kind: 'operacionale',
        textSq:
          'Myku, fermentimi ose mbyllja e dobët e kavanozëve shkatërron një seri dhe dëmton reputacionin.',
      },
    ],
    falsifiersSq: [
      'Nga 15 dyqane të pyetura, më pak se 4 pranojnë një porosi provë me pagesë ose me konsinjacion me afat të shkurtër.',
      'Pas 6 javësh në raft, secili prej dyqaneve provë shet më pak se 10 njësi në muaj.',
      'Kostoja reale variabël (përfshirë humbjet në përpunim) kalon 55% të çmimit të shumicës.',
      'Rregullat e importit në vendin e diasporës e bëjnë dërgimin të pamundur ose të pajustifikueshëm për sasi të vogla.',
    ],
    differentiationSq: [
      'Etiketë me zonën e frutave dhe muajin e përpunimit.',
      'Receta me pak përbërës, të validuara nga një teknolog ushqimi.',
      'Furnizim i rregullt dhe kthim i produktit të pashitur pranë afatit për dyqanet e rregullta.',
      'Kuti dhuratash për festat dhe për dyqanet e diasporës.',
    ],
    competitorTypesSq: [
      'Produkte industriale në supermarket',
      'Prodhues të vegjël artizanalë',
      'Familje që shesin pa etiketë në tregje',
      'Produkte të importuara',
      'Përgatitja në shtëpi nga vetë familja',
    ],
    cheapestTestSq:
      'Seri e vogël provë në një ambient partner të licencuar, me etiketë të verifikuar, për 5–10 dyqane. Matni riporositë pas 6 javësh dhe shpejtësinë e shitjes në raft, jo vetëm porosinë e parë.',
    interviewQuestionsSq: [
      'Për dyqanet: cilat produkte vendase të këtij lloji keni shitur muajin e kaluar dhe sa njësi?',
      'Nga i furnizoni sot dhe me çfarë çmimi shumice?',
      'Kur ishte hera e fundit që ju mbaroi një produkt vendas dhe nuk e gjetët dot më?',
      'Si e vendosni nëse një produkt i ri hyn në raft dhe çfarë dokumentesh kërkoni?',
      'Me çfarë afati i paguani zakonisht furnitorët e vegjël?',
      'Për familjet: kur keni blerë herën e fundit reçel ose fruta të thata dhe ku?',
      'Për dyqanet në diasporë: si i importoni sot produktet nga vendlindja dhe çfarë problemesh keni hasur?',
    ],
    firstCustomers: {
      whereSq: [
        'Dyqane ushqimore të lagjes dhe dyqane produktesh vendase',
        'Kafene dhe pastiçeri që përdorin reçel ose fruta të thata',
        'Dyqane suveniresh dhe bujtina në zona turistike',
        'Dyqane të komunitetit në diasporë, përmes kontakteve tuaja',
        'Panaire dhe tregje të produkteve vendase',
      ],
      howToContactSq: [
        'Vizitë personale me mostra (nga seria provë e ligjshme) dhe listë çmimesh shumice',
        'Prezantim nga kontaktet në diasporë te pronarët e dyqaneve të komunitetit',
        'Tavolinë në panaire me lejen e organizatorit; pa mesazhe masive',
      ],
      offerSq:
        'Porosi e parë e vogël (p.sh. 12–24 njësi) me afat pagese 30-ditor; kthim i produktit të pashitur pranë afatit gjatë 3 muajve të parë.',
      followUpSq:
        'Vizitë ose telefonatë pas 3–4 javësh për të parë shitjet në raft; riporosia është treguesi kryesor. Një rikujtesë e vetme për ata pa përgjigje.',
      metricsSq: [
        'Dyqane që riporosisin brenda 6 javësh (%)',
        'Njësi të shitura për dyqan në muaj',
        'Humbja gjatë përpunimit (% e frutave)',
        'Ditë mesatare arkëtimi',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje, jam [emri] nga [emri i biznesit]. Përpunojmë fruta nga [zona] në një ambient të regjistruar: [produktet], me etiketë të plotë dhe numër serie. Ju solla mostra dhe listën e çmimeve të shumicës. Cilat produkte vendase të këtij lloji shiten më mirë te ju?',
    offerTemplateSq:
      'Oferta për [emri i dyqanit]: (1) [produktet] në [madhësitë], me etiketë të plotë; (2) çmim shumice [çmimi] për njësi, porosi minimale [sasia]; (3) furnizim çdo [periudha], dorëzim falas brenda [zona]; (4) pagesë brenda [ditë] ditëve nga dorëzimi; (5) kthim i produktit të pashitur pranë afatit gjatë 3 muajve të parë. Nuk bëjmë pretendime shëndetësore për produktet.',
    feedbackQuestionsSq: [
      'Cili produkt u shit më shpejt dhe cili mbeti në raft?',
      'Çfarë thanë klientët për çmimin ose për paketimin?',
      'A ishte etiketa e qartë për ju dhe për klientët?',
      'Çfarë sasie dhe çfarë frekuence furnizimi ju përshtatet?',
    ],
    goCriteriaSq: [
      'Të paktën 50% e dyqaneve provë riporosisin brenda 6 javësh.',
      'Kostoja reale variabël nën 45% të çmimit të shumicës pas serisë së dytë.',
    ],
    killCriteriaSq: [
      'Më pak se 3 dyqane riporosisin pas serisë provë.',
      'Ambienti nuk mund të miratohet brenda buxhetit dhe afatit para sezonit të frutave.',
      'Kostoja reale variabël kalon 55% të çmimit të shumicës dhe dyqanet nuk pranojnë çmim më të lartë.',
    ],
    phaseNotesSq: {
      p10_20: [
        'Intervistoni 15 dyqane dhe 3 dyqane në diasporë për produktet vendase që shesin, çmimet dhe afatet e pagesës.',
      ],
      p30_40: [
        'Llogaritni kapitalin qarkullues: sa fruta duhen blerë në sezon dhe sa muaj duhen për t’i shitur.',
      ],
      p40_50: [
        'Verifikoni regjistrimin ushqimor, miratimin e ambientit, etiketën dhe, për eksportin, rregullat e vendit të destinacionit.',
      ],
      p50_60: [
        'Lidhni marrëveshje me shkrim me 2–3 fermerë dhe validoni recetat me një teknolog ushqimi.',
      ],
      p60_70: [
        'Seri provë në ambient partner të licencuar për 5–10 dyqane; matni humbjet dhe koston reale për njësi.',
      ],
    },
    assumptionsSq: [
      'Frutat në sezon mund të blihen me çmim të ulët nga fermerët vendas.',
      'Dyqanet pranojnë produkte të reja me afat pagese 30–60 ditë.',
      'Kapitali qarkullues për stokun e sezonit kërkon rezervë shtesë përtej modelit mujor.',
      'Interesi verbal nuk është provë; vetëm riporositë e konfirmojnë kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },
];
