import type { BusinessArchetype } from '@/lib/domain/types';

/**
 * Batch C — logjistikë, turizëm, shërbime për diasporën, energji, kujdes jo-mjekësor dhe tregti.
 * Covers low → high capital, solo / partner / team starts, home vs premises, physical / online /
 * combined modes, and local vs international (diaspora, import) markets. All amounts are general USD
 * assumptions at US price levels; every legal statement asks for local verification, and regulated
 * work (heights, electrical, client money, care of people, customs) is referred to licensed professionals.
 */
export const BATCH_C: BusinessArchetype[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // 1. Same-day local delivery for small shops — own vehicle, solo, low capital, transport rules
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'shperndarje-lokale-per-dyqane-te-vogla',
    nameSq: 'Shpërndarje lokale brenda ditës për dyqane të vogla',
    taglineSq: 'Dërgesat e dyqaneve te klientët e tyre, me dy marrje në ditë, konfirmim dorëzimi dhe faturë javore.',
    descriptionSq:
      'Shërbim dërgesash brenda qytetit për dyqane të vogla që shesin me telefon, në rrjete sociale ose online, por nuk kanë korrierin e vet: lule, kancelari, libra, veshje, pjesë hidraulike dhe elektrike, produkte shtëpiake dhe ushqime të paketuara që nuk kërkojnë temperaturë të kontrolluar. Me mjetin tuaj (makinë, furgon i vogël ose motor), merrni porositë në dyqan në orare fikse dhe i dorëzoni te klientët e dyqanit po atë ditë ose të nesërmen, me konfirmim me foto ose nënshkrim. Nuk transportohen barna, mallra të rrezikshme apo mallra me kufizime ligjore. Transporti i mallrave për të tjerët me pagesë zakonisht kërkon leje dhe sigurim të veçantë, që duhen verifikuar para dërgesës së parë.',
    sector: 'logjistike',
    offerSq:
      'Dërgesa brenda zonës së rënë dakord: marrje në dyqan në dy dritare ditore (p.sh. paradite dhe pasdite), dorëzim po atë ditë për porositë e marra para orës së caktuar ose të nesërmen në mëngjes, njoftim me mesazh për klientin e dyqanit para mbërritjes, konfirmim dorëzimi me foto ose nënshkrim, mbledhje e pagesës në dorëzim vetëm kur bihet dakord me shkrim (me dorëzimin e parave dhe të listës te dyqani brenda 24 orëve) dhe faturë javore me çdo dërgesë të listuar.',
    payingCustomerSq:
      'Pronari ose menaxheri i një dyqani të vogël me pakicë që i dërgon mallin klientëve të vet në të njëjtin qytet.',
    customerSegments: ['b2b'],
    problemSq:
      'Dyqanet e vogla marrin gjithnjë e më shumë porosi me telefon dhe në rrjete sociale, por për t’i dorëzuar pronari mbyll dyqanin, dërgon një të afërm ose e shtyn dërgesën disa ditë; korrierët e mëdhenj janë të përshtatur për pako ndërqytetëse dhe jo për dërgesa brenda ditës, kështu që klientët anulojnë ose blejnë diku tjetër.',
    modes: ['fizik'],
    marketScopes: ['lokal'],
    canStartFromHome: true,
    minTeam: 'vetem',
    requiredSkills: ['drejtim_mjeti'],
    helpfulSkills: ['logjistike', 'sherbim_klienti', 'shitje', 'kontabilitet'],
    helpfulAssets: ['automjet', 'furgon', 'motor_bicikleta', 'telefon_smart', 'rrjet_kontaktesh'],
    minHoursPerWeek: 30,
    regulated: true,
    regulationNotesSq: [
      'Transporti i mallrave për llogari të të tjerëve me pagesë zakonisht kërkon licencë ose leje për operatorin dhe/ose për mjetin, sipas peshës dhe llojit të mjetit: Kërkon verifikim lokal para dërgesës së parë me pagesë.',
      'Sigurimi i zakonshëm i mjetit për përdorim privat shpesh nuk mbulon përdorimin tregtar; verifikoni me shkrim te siguruesi mbulimin për transport mallrash për të tretë, si dhe sigurimin e mallit gjatë transportit dhe të përgjegjësisë civile.',
      'Mbledhja e parave në dorëzim: verifikoni rregullat e faturimit dhe të kuponit fiskal (kush e lëshon dokumentin — dyqani apo ju), kufijtë e pagesave në para në dorë dhe mënyrën e regjistrimit të shumave të mbledhura.',
      'Adresat dhe numrat e telefonit të klientëve të dyqanit janë të dhëna personale: verifikoni rregullat lokale të mbrojtjes së të dhënave dhe përdorini vetëm për dërgesën.',
      'Mallrat me kufizime (barna, kimikate, bateri të mëdha, mallra me moshë minimale blerjeje, ushqime që kërkojnë zinxhir të ftohtë) nuk përfshihen; transporti i tyre kërkon leje dhe kushte të veçanta që duhen verifikuar më vete.',
    ],
    licensedProfessionalsSq: [
      'Agjent ose ndërmjetës sigurimesh i licencuar për sigurimin e mjetit për përdorim tregtar dhe të mallit në transport',
      'Kontabilist për faturimin, trajtimin e pagesave në dorëzim dhe deklaratat',
    ],
    adultOnly: true,
    zeroCapitalTestSq:
      'Mos bëni asnjë dërgesë me pagesë para se të verifikoni lejen dhe sigurimin — testi pa kapital mat kërkesën: zgjidhni 2–3 lagje dhe vizitoni 40 dyqane të vogla; pyetni si i dorëzuan porositë javën e kaluar dhe sa porosi humbën. Lini te 10 prej tyre një fletë të thjeshtë ku shënojnë për 2 javë çdo porosi që kërkoi dërgesë. Pastaj kërkoni marrëveshje me shkrim për një muaj provë me çmim të plotë, që nis vetëm kur jeni në rregull me lejet. Kostoja reale: koha, karburanti për vizitat dhe printimi; leja, sigurimi tregtar dhe regjistrimi kushtojnë para para dërgesës së parë.',
    revenueModelSq:
      'Tarifë për dërgesë (njësia = 1 dërgesë brenda zonës bazë), me shtesë për zona më të largëta, pako të rënda ose dërgesa urgjente; faturë javore për dyqanin. Paketat mujore me numër të caktuar dërgesash janë opsion për dyqanet e rregullta dhe nuk janë në modelin bazë.',
    pricing: {
      unitLabelSq: 'dërgesë',
      priceUSD: { low: 5, base: 8, high: 12 },
      variableCostUSD: { low: 1.2, base: 2, high: 3 },
      unitsPerCustomerPerMonth: 35,
      collectionDays: 14,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin karburantin, konsumin e gomave e të frenave dhe të dhënat celulare për dërgesë, me supozimin e rrugëve të grupuara brenda një zone; nuk përfshin kohën tuaj. “Klient” = një dyqan me dërgesa të rregullta, mesatarisht rreth 35 në muaj. Karburanti është mall me çmim ndërkombëtar, prandaj në vendet me çmime të ulëta marzhi për dërgesë është më i ngushtë sesa duket në USD. Kapaciteti i një personi është i kufizuar (supozim: 15–30 dërgesa në ditë në një zonë të dendur — duhet matur në provë). Çmimet janë supozime fillestare në USD; verifikoni sa paguajnë sot dyqanet për korrier ose taksi dhe sa shpenzoni realisht për km.',
    },
    startupCosts: [
      {
        id: 'used-vehicle',
        labelSq: 'Mjet i përdorur për dërgesa (makinë, furgon i vogël ose motor)',
        category: 'pajisje',
        lowUSD: 2500,
        highUSD: 10000,
        noteSq:
          'Nevojitet vetëm nëse nuk keni mjet; për pako të vogla në qytet mund të mjaftojë një motor, për mallra më të mëdha një furgon i vogël. Kontrolloni koston e sigurimit tregtar para blerjes dhe kërkoni kontroll teknik nga një mekanik i pavarur.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['automjet', 'furgon', 'motor_bicikleta'],
      },
      {
        id: 'cargo-gear',
        labelSq: 'Kuti ngarkese, rripa fiksimi, karrocë dore dhe mbulesa kundër shiut',
        category: 'pajisje',
        lowUSD: 100,
        highUSD: 500,
        noteSq:
          'Mbrojnë mallin nga goditjet dhe shiu; sasia varet nga mjeti dhe nga lloji i mallrave. Krahasoni çmimet në 2–3 dyqane pajisjesh.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'transport-permit-registration',
        labelSq: 'Regjistrim aktiviteti dhe leje/licencë transporti mallrash',
        category: 'tarifa',
        lowUSD: 50,
        highUSD: 700,
        noteSq:
          'Shuma dhe procedura ndryshojnë shumë sipas vendit dhe llojit të mjetit; merrni listën zyrtare nga regjistri zyrtar i bizneseve dhe nga autoriteti i transportit rrugor para se të llogaritni.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'work-phone',
        labelSq: 'Telefon pune me mbajtëse për mjetin',
        category: 'pajisje',
        lowUSD: 150,
        highUSD: 400,
        noteSq:
          'Nevojitet vetëm nëse nuk keni telefon inteligjent; shërben për navigim, konfirmime me foto dhe mesazhe me klientët.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['telefon_smart'],
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: vizita në dyqane, fletë regjistrimi dhe karburant',
        category: 'testim_tregu',
        lowUSD: 40,
        highUSD: 200,
        noteSq:
          'Printim i fletëve të regjistrimit të porosive, karburant për vizitat në 40 dyqane dhe kohë për 2 javë matje; mbajeni të vogël derisa të keni marrëveshje me shkrim.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'commercial-insurance',
        labelSq: 'Sigurim tregtar i mjetit, i mallit në transport dhe i përgjegjësisë',
        category: 'sigurime',
        lowUSD: 50,
        highUSD: 250,
        noteSq:
          'Shpesh kushton më shumë se sigurimi privat; kërkoni oferta me shkrim nga 2–3 sigurues dhe lexoni çfarë mallrash dhe çfarë vlerash maksimale mbulohen.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'vehicle-upkeep',
        labelSq: 'Mirëmbajtje periodike, kontroll teknik dhe taksa vjetore të mjetit (pjesa mujore)',
        category: 'mirembajtje',
        lowUSD: 40,
        highUSD: 160,
        noteSq:
          'Servisi, gomat sezonale, kontrolli teknik dhe taksat ndahen në muaj; me më shumë km se një mjet privat, servisi vjen më shpesh. Pyesni një mekanik për intervalet sipas km.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'phone-data',
        labelSq: 'Telefon dhe internet celular pune',
        category: 'sherbime_komunale',
        lowUSD: 15,
        highUSD: 45,
        noteSq: 'Navigimi dhe fotot e konfirmimit konsumojnë të dhëna; krahasoni paketat e operatorëve lokalë.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'parking-tolls',
        labelSq: 'Parkim dhe tarifa rrugore',
        category: 'transport',
        lowUSD: 10,
        highUSD: 80,
        noteSq:
          'Varet nga qyteti; në zonat qendrore ndalimi i shkurtër për dorëzim mund të kushtojë ose të gjobitet — verifikoni rregullat e ngarkim-shkarkimit.',
        scalesWithPriceLevel: true,
        optional: true,
      },
      {
        id: 'route-software',
        labelSq: 'Aplikacion për rrugët, regjistrin e dërgesave dhe faturimin',
        category: 'software',
        lowUSD: 0,
        highUSD: 40,
        noteSq:
          'Në fillim mjafton një tabelë e thjeshtë; aplikacionet me pagesë ia vlejnë kur keni mbi 15 dërgesa në ditë.',
        scalesWithPriceLevel: false,
        optional: true,
      },
      {
        id: 'accounting',
        labelSq: 'Kontabilist i jashtëm',
        category: 'kontabilitet',
        lowUSD: 25,
        highUSD: 120,
        noteSq:
          'Faturat javore dhe pagesat në dorëzim e ngarkojnë kontabilitetin; kërkoni çmim fiks mujor dhe verifikoni detyrimet lokale.',
        scalesWithPriceLevel: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 1, monthlyNewCustomers: 1, monthlyChurnPct: 8 },
      baze: { startCustomers: 2, monthlyNewCustomers: 1.5, monthlyChurnPct: 6 },
      optimist: { startCustomers: 3, monthlyNewCustomers: 2.5, monthlyChurnPct: 5 },
    },
    seasonality: [0.85, 0.95, 1.05, 1.0, 1.0, 0.95, 0.9, 0.8, 1.0, 1.05, 1.1, 1.35],
    seasonalityNoteSq:
      'Dërgesat e dyqaneve rriten para festave të fundvitit dhe në ditët tradicionale të dhuratave (lule, libra, veshje), bien në janar dhe në gusht, kur shumë banorë janë me pushime. Vlerat janë supozim; kalendari i festave dhe sezoni turistik ndryshojnë sipas vendit dhe qytetit.',
    macroLinks: [
      {
        indicatorCode: 'urban_population_pct',
        direction: 'me_i_larte_mbeshtet',
        referenceValue: 50,
        mechanismSq:
          'Dërgesat brenda ditës mbulojnë kostot vetëm kur adresat janë afër njëra-tjetrës; kur shumica e njerëzve jetojnë në qytete, një rrugë e vetme përfshin më shumë dërgesa për orë. Niveli referues 50% është supozim i bibliotekës, jo prag ekonomik.',
        ifSupportsSq:
          'Popullsia kryesisht urbane e bën më të besueshëm modelin e rrugëve të dendura — kontrolloni dendësinë e dyqaneve në lagjen tuaj.',
        ifContradictsSq:
          'Me popullsi kryesisht rurale, distancat rriten dhe kostoja për dërgesë mund ta kalojë tarifën që pranojnë dyqanet; përqendrohuni vetëm në qendrën e qytetit.',
      },
      {
        indicatorCode: 'household_consumption_growth',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Kur konsumi i familjeve rritet, dyqanet shesin më shumë dhe më shpesh me porosi; kur bie, porositë me dërgesë janë ndër të parat që pakësohen.',
        ifSupportsSq: 'Rritja e konsumit mbështet hipotezën se dyqanet do të kenë mjaft porosi për dërgesa të rregullta.',
        ifContradictsSq:
          'Me konsum në rënie, dyqanet shkurtojnë shpenzimet; ofroni tarifë të thjeshtë për dërgesë pa detyrim mujor dhe testoni me kujdes.',
      },
      {
        indicatorCode: 'internet_users_pct',
        direction: 'me_i_larte_mbeshtet',
        referenceValue: 60,
        mechanismSq:
          'Porositë me telefon, në rrjete sociale dhe online krijojnë nevojën për dërgesë; sa më shumë njerëz përdorin internetin, aq më shumë dyqane të vogla shesin në distancë. Niveli referues 60% është supozim i bibliotekës.',
        ifSupportsSq:
          'Përdorimi i lartë i internetit sugjeron që shitja në distancë është e zakonshme — konfirmojeni duke numëruar porositë reale të dyqaneve.',
        ifContradictsSq:
          'Me përdorim të ulët të internetit, shumica e blerjeve bëhen në dyqan dhe kërkesa për dërgesa mbetet e vogël.',
      },
      {
        indicatorCode: 'inflation_cpi',
        direction: 'me_i_ulet_mbeshtet',
        referenceValue: 5,
        mechanismSq:
          'Karburanti dhe mirëmbajtja e mjetit janë kostot kryesore; me inflacion të lartë ato rriten më shpejt se tarifa e dërgesës që dyqanet kanë pranuar. Niveli referues 5% është supozim i bibliotekës.',
        ifSupportsSq: 'Inflacioni i ulët e bën më të sigurt fiksimin e tarifës për disa muaj.',
        ifContradictsSq:
          'Me inflacion të lartë, shkruani në marrëveshje rishikim tremujor të tarifës ose një shtesë karburanti të lidhur me çmimin e tij.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Dyqanet e vogla shesin gjithnjë e më shumë me telefon dhe në rrjete sociale, ndërsa klientët presin ta marrin mallin po atë ditë.',
      problemSq: 'Pa korrier të vetin, dyqani ose mbyllet për të dorëzuar, ose e vonon porosinë dhe humbet klientin.',
      customerSq: 'Pronarët e dyqaneve me 1–5 punonjës që bëjnë disa dërgesa në ditë brenda qytetit.',
      offerSq: 'Dërgesa brenda ditës me orare fikse marrjeje, konfirmim dorëzimi dhe një faturë javore të qartë.',
      reasonToPaySq:
        'Pronari nuk largohet nga dyqani, klienti e merr mallin shpejt dhe kostoja për dërgesë dihet paraprakisht.',
      profitConditionsSq:
        'Fitimi kërkon 8–15 dyqane në të njëjtën zonë që rrugët të kenë shumë dërgesa për orë, një tarifë që mbulon karburantin dhe konsumin me marzh të mjaftueshëm, dhe fatura të paguara brenda dy javësh.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq:
          'Dyqanet bëjnë më pak dërgesa sesa thonë; me 1–2 dërgesa në ditë për dyqan, rrugët nuk mbushen dhe koha bosh e mjetit e ha marzhin.',
      },
      {
        kind: 'cmim',
        textSq:
          'Dyqanet krahasojnë me një të afërm që e bën “falas” ose me taksinë dhe nuk pranojnë tarifën që mbulon karburantin, konsumin dhe kohën tuaj.',
      },
      {
        kind: 'konkurrence',
        textSq:
          'Platformat e dërgesave dhe korrierët ekzistues ulin çmimet ose nisin dërgesa brenda ditës në të njëjtat zona.',
      },
      {
        kind: 'kosto',
        textSq: 'Karburanti, riparimet e mjetit dhe sigurimi tregtar rriten, ndërsa tarifa është fiksuar me dyqanet.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Puna pa leje transporti ose pa sigurim tregtar sjell gjoba dhe e lë të pambuluar dëmin kur malli prishet ose ndodh një aksident.',
      },
      {
        kind: 'operacionale',
        textSq:
          'Një defekt i mjetit ose sëmundja juaj e ndalon gjithë shërbimin; dyqanet humbasin besimin pas disa dërgesash të dështuara.',
      },
      {
        kind: 'vonesa_pagesash',
        textSq:
          'Dyqanet vonojnë pagesën e faturave javore ose lindin mospërputhje në paratë e mbledhura në dorëzim, gjë që krijon mosmarrëveshje.',
      },
    ],
    falsifiersSq: [
      'Nga 40 dyqane të vizituara, më pak se 8 bëjnë të paktën një dërgesë në ditë te klientët.',
      'Në 2 javët e regjistrimit, dyqanet pjesëmarrëse shënojnë mesatarisht më pak se 15 porosi në muaj që kërkojnë dërgesë.',
      'Tarifa maksimale që pranojnë dyqanet është më pak se dyfishi i kostos variabël të matur për dërgesë.',
      'Në muajin provë, rrugët ditore nuk kalojnë 10 dërgesa, sepse adresat janë shumë të shpërndara.',
    ],
    differentiationSq: [
      'Orare fikse marrjeje dhe afat dorëzimi të shkruar në marrëveshje (angazhim shërbimi, jo premtim shitjesh për dyqanin).',
      'Fokus në një zonë të vogël me shumë dyqane, që dërgesat të jenë më të shpejta dhe më të lira se te korrierët ndërqytetës.',
      'Konfirmim dorëzimi me foto ose nënshkrim dhe faturë javore me çdo dërgesë, që pronari t’i kontrollojë lehtë.',
    ],
    competitorTypesSq: [
      'Kompani korriere ndërqytetëse me dërgesa të nesërmen',
      'Platforma dërgesash që punojnë kryesisht me restorante',
      'Taksi ose shoferë të pavarur të thirrur sipas rastit',
      'Pronari, punonjësit ose të afërmit që dorëzojnë vetë',
    ],
    cheapestTestSq:
      'Vizita në 40 dyqane dhe 2 javë regjistrim i porosive që kërkojnë dërgesë te 10 prej tyre; synimi është 5 marrëveshje me shkrim për një muaj provë me çmim të plotë, që nis pasi të keni lejen dhe sigurimin. Matni dërgesat reale në ditë dhe km për dërgesë, jo premtimet.',
    interviewQuestionsSq: [
      'Si i dorëzuat porositë e klientëve javën e kaluar dhe kush e bëri?',
      'Sa porosi me dërgesë patët muajin e fundit, sipas fletoreve ose mesazheve tuaja?',
      'Kur ishte hera e fundit që humbët një shitje sepse nuk mund ta dërgonit mallin në kohë?',
      'Sa ju kushtoi dërgesa e fundit që ia dhatë dikujt tjetër (korrier, taksi, i afërm)?',
      'Në cilat orë të ditës vijnë zakonisht porositë që kërkojnë dërgesë?',
      'Si e mblidhni sot pagesën kur klienti nuk paguan paraprakisht?',
      'Çfarë keni provuar më parë për dërgesat dhe pse e ndërprenë?',
    ],
    firstCustomers: {
      whereSq: [
        'Rrugë me shumë dyqane të vogla (lule, kancelari, veshje, pjesë shtëpiake) brenda 2–3 km nga ku jetoni',
        'Dyqane që reklamojnë porosi me telefon ose në rrjete sociale',
        'Dyqane ku jeni vetë klient ose ku keni kontakte personale',
        'Shoqata lokale të tregtarëve dhe takime të hapura të bizneseve të zonës',
      ],
      howToContactSq: [
        'Vizitë personale në orë të qeta, me një fletë me tarifat, zonën dhe oraret e marrjes',
        'Mesazh i personalizuar në kanalin publik të dyqanit, vetëm një herë, pa mesazhe masive ose lista të blera',
        'Rekomandim nga një dyqan i kënaqur pas muajit provë',
      ],
      offerSq:
        'Muaj provë me tarifë të plotë për dërgesë, pa minimum mujor dhe pa kontratë afatgjatë; faturë javore dhe ndërprerje në çdo kohë me njoftim 7-ditor.',
      followUpSq:
        'Regjistroni çdo vizitë në një tabelë (data, dërgesat e vlerësuara, hapi tjetër); një rikujtesë e vetme pas 7 ditësh, pastaj ndaloni nëse nuk ka interes. Pas javës së parë të provës, një bisedë 10-minutëshe me pronarin për problemet.',
      metricsSq: [
        'Dyqane të vizituara → dyqane në provë (%)',
        'Dërgesa në ditë dhe km mesatarë për dërgesë',
        'Dërgesa në kohë (%) dhe ankesa për dëmtime',
        'Ditë mesatare deri në pagesën e faturës javore',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje, jam [emri]. Bëj dërgesa brenda [zona] për dyqane të vogla: marr porositë te ju në [ora 1] dhe [ora 2] dhe i dorëzoj po atë ditë, me foto ose nënshkrim si konfirmim. Tarifa është [çmimi] për dërgesë, me faturë çdo javë. A mund t’ju pyes 5 minuta si i dërgoni sot porositë?',
    offerTemplateSq:
      'Oferta për [emri i dyqanit]: (1) marrje e porosive në [ora 1] dhe [ora 2], nga e hëna deri të shtunën; (2) dorëzim po atë ditë për porositë e marra para [ora], përndryshe të nesërmen deri në [ora]; (3) konfirmim me foto ose nënshkrim për çdo dërgesë; (4) tarifa [çmimi] për dërgesë brenda [zona], [çmimi shtesë] për [zona e largët]; (5) faturë javore, pagesë brenda [ditë] ditëve. Mallrat e rrezikshme, barnat dhe mallrat me vlerë mbi [shuma] nuk pranohen. Angazhohemi për oraret; nuk premtojmë rritje të shitjeve tuaja.',
    feedbackQuestionsSq: [
      'Cila dërgesë këtë javë doli ndryshe nga sa e prisnit dhe pse?',
      'Çfarë ju thanë klientët tuaj për dorëzimin?',
      'Cilat orë marrjeje ju përshtaten më pak?',
      'Çfarë ju pengon të na jepni më shumë dërgesa?',
    ],
    goCriteriaSq: [
      'Të paktën 5 dyqane vazhdojnë pas muajit provë me pagesë të rregullt.',
      'Mesatarisht mbi 15 dërgesa në ditë pune në muajin e dytë, me kosto variabël të matur nën gjysmën e tarifës.',
      'Leja e transportit dhe sigurimi tregtar janë marrë brenda buxhetit të planifikuar.',
    ],
    killCriteriaSq: [
      'Pas vizitave në 40 dyqane, më pak se 3 pranojnë muajin provë me tarifë të plotë.',
      'Pas 2 muajsh provë, dërgesat mbeten nën 8 në ditë dhe nuk mbulojnë karburantin, sigurimin dhe një pagë minimale për ju.',
      'Leja e nevojshme ose sigurimi tregtar kushtojnë aq sa tarifa e pranuar nga dyqanet nuk i mbulon.',
    ],
    phaseNotesSq: {
      p10_20: ['Vizitoni 40 dyqane në 2–3 lagje dhe lini fletën e regjistrimit të porosive te 10 prej tyre për 2 javë.'],
      p20_30: [
        'Pyesni sa kushton një dërgesë brenda qytetit te korrierët dhe taksitë e zonës; ndërtoni tarifën mbi këtë krahasim dhe mbi koston tuaj për km.',
      ],
      p30_40: [
        'Matni konsumin real të mjetit për km dhe llogaritni pragun e dërgesave në ditë që mbulon kostot fikse dhe pagën tuaj.',
      ],
      p40_50: [
        'Pyesni autoritetin e transportit rrugor nëse ju duhet licencë për transport mallrash për të tretë dhe merrni me shkrim ofertën e sigurimit tregtar para dërgesës së parë.',
      ],
      p60_70: ['Muaj provë me 3–5 dyqane në të njëjtën zonë; regjistroni çdo dërgesë, km, vonesat dhe dëmtimet.'],
      p80_90: ['Rregulloni zonat dhe oraret sipas të dhënave të provës; hiqni zonat ku kostoja për dërgesë del mbi tarifë.'],
    },
    assumptionsSq: [
      'Një person me mjet mund të bëjë 15–30 dërgesa në ditë kur adresat janë brenda një zone të dendur (duhet matur në provë).',
      'Dyqanet në një zonë pranojnë orare të përbashkëta marrjeje.',
      'Dyqanet e paguajnë faturën javore brenda 2 javësh.',
      'Interesi verbal nuk është provë; vetëm dërgesat e paguara në muajin provë e konfirmojnë kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Thematic small-group guided tours — solo, low capital, seasonal, guide licensing
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'ture-te-guidura-tematike-me-grupe-te-vogla',
    nameSq: 'Ture të guidura tematike me grupe të vogla',
    taglineSq: 'Ture 2–3-orëshe në këmbë me një temë të qartë, për deri në 10 vizitorë, në gjuhën e tyre.',
    descriptionSq:
      'Ture të guidura në këmbë me temë të përcaktuar — p.sh. historia e një lagjeje të vjetër, arkitektura, zanatet tradicionale, tregu dhe kuzhina lokale ose natyra rreth qytetit — për grupe të vogla vizitorësh të huaj, pushuesish vendas dhe familjesh të diasporës. Turi ndërtohet mbi kërkim të kujdesshëm, tregime të verifikuara dhe ndalesa te partnerë lokalë (punishte, prodhues, muze të vegjël), ku çdo degustim ose shitje e bën vetë biznesi partner. Rezervimet vijnë nga një faqe e thjeshtë, nga platformat e tureve dhe nga recepsionet e bujtinave. Puna është shumë sezonale, dhe licenca e guidës, sigurimi dhe lejet për objekte të caktuara duhen verifikuar para turit të parë me pagesë.',
    sector: 'turizem',
    offerSq:
      'Turë tematike 2,5–3 orë në këmbë për 2–10 persona, me nisje në orë fikse një ose dy herë në ditë gjatë sezonit, në 1–2 gjuhë të huaja; itinerar i testuar me kohë të matura dhe pushime, 2–3 ndalesa te partnerë lokalë, hartë e vogël me rekomandime për pjesën tjetër të qëndrimit dhe tur privat me çmim fiks për familje ose grupe të vogla. Kushte anulimi të qarta dhe plan alternativ për ditët me mot të keq.',
    payingCustomerSq:
      'Vizitorë të huaj, pushues vendas dhe familje të diasporës që rezervojnë e paguajnë vetë për person; herë pas here bujtina ose agjenci që rezervojnë ture private për mysafirët e tyre.',
    customerSegments: ['b2c', 'b2b'],
    problemSq:
      'Vizitorët që kanë vetëm 1–3 ditë në një qytet shohin vetëm pikat kryesore dhe largohen pa e kuptuar historinë dhe jetën lokale; informacioni online është i shpërndarë dhe shpesh i pasaktë, ndërsa turet e mëdha me autobus janë të përgjithshme, të ngarkuara dhe rrallë në gjuhën e tyre.',
    modes: ['kombinuar'],
    marketScopes: ['lokal', 'nderkombetar'],
    canStartFromHome: true,
    minTeam: 'vetem',
    requiredSkills: ['gjuhe_te_huaja', 'mikpritje'],
    helpfulSkills: ['marketing_digjital', 'fotografi_video', 'shkrim_perkthim', 'sherbim_klienti', 'shitje'],
    helpfulAssets: ['telefon_smart', 'kompjuter', 'internet_i_qendrueshem', 'rrjet_kontaktesh', 'rrjet_diaspore'],
    minHoursPerWeek: 15,
    regulated: true,
    regulationNotesSq: [
      'Licenca ose certifikimi i guidës turistik: në shumë vende guidimi me pagesë, ose guidimi në objekte dhe zona të mbrojtura, kërkon licencë të veçantë. Kërkon verifikim lokal para turit të parë me pagesë.',
      'Regjistrimi i aktivitetit turistik dhe faturimi (përfshirë rezervimet përmes platformave të huaja): verifikoni formën ligjore dhe detyrimet tatimore lokalisht.',
      'Sigurimi i përgjegjësisë civile ndaj pjesëmarrësve dhe, nëse kërkohet, sigurimi i aksidenteve: verifikoni çfarë është i detyrueshëm dhe çfarë mbulon polica.',
      'Muzetë, objektet fetare, zonat arkeologjike dhe parqet mund të kenë rregulla për guidat dhe grupet (leje, orare, numër maksimal): verifikoni me çdo administratë para se t’i përfshini në itinerar.',
      'Çdo zhvendosje me mjet bëhet vetëm me operator transporti të licencuar; mos transportoni vizitorë me pagesë me makinën tuaj pa leje. Degustimet e ushqimit i ofron vetëm biznesi partner i regjistruar për ushqim — verifikoni këtë para se ta përfshini.',
    ],
    licensedProfessionalsSq: [
      'Guidë turistik i licencuar ose i certifikuar, kur rregullat lokale e kërkojnë për zonën ose objektet e turit',
      'Operator transporti i licencuar për çdo zhvendosje me mjet',
      'Agjent sigurimesh i licencuar për sigurimin e përgjegjësisë civile',
    ],
    adultOnly: true,
    zeroCapitalTestSq:
      'Me njohuritë, gjuhën dhe telefonin që keni: zgjidhni një temë, ndërtoni itinerarin 2,5-orësh dhe ecni rrugën 3 herë duke matur kohët. Verifikoni nëse ju duhet licencë guide para se të merrni pagesë. Ndërkohë, bëni 2–3 ture provë falas me njerëz që i njihni ose me vizitorë të rekomanduar nga një bujtinë partnere, në këmbim të 10 minutave reagim të sinqertë (pa kërkuar vlerësime publike). Pyesni recepsionet e 10 bujtinave çfarë pyesin mysafirët më shpesh. Kostoja reale: koha juaj dhe ndonjë biletë hyrjeje; licenca, sigurimi dhe regjistrimi mund të kushtojnë para para turit të parë me pagesë.',
    revenueModelSq:
      'Çmim për pjesëmarrës (njësia = 1 pjesëmarrës në një turë), i paguar në rezervim; turet private me çmim fiks për grup. Komisioni i platformave të rezervimit trajtohet si kosto variabël; shitjet te partnerët u përkasin partnerëve dhe nuk janë të ardhura të turit.',
    pricing: {
      unitLabelSq: 'pjesëmarrës',
      priceUSD: { low: 18, base: 30, high: 48 },
      variableCostUSD: { low: 3, base: 6, high: 10 },
      unitsPerCustomerPerMonth: 2.5,
      collectionDays: 10,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin komisionin e platformave të rezervimit (kur rezervimi vjen prej tyre), biletat e hyrjes që përfshihen në çmim, hartën e printuar dhe ujin për pjesëmarrësit; nuk përfshin kohën tuaj. “Klient” = një rezervim (mesatarisht rreth 2–3 pjesëmarrës); humbja 100% në muaj pasqyron që shumica e vizitorëve vijnë një herë, prandaj klientët e rinj duhet të vijnë çdo muaj. Kapaciteti kufizohet nga numri i tureve që mund të bëni në ditë. Platformat zakonisht paguajnë pas turit. Çmimet janë supozime fillestare në USD; krahasoni çmimet e tureve të ngjashme në zonë dhe matni sa paguajnë realisht vizitorët.',
    },
    startupCosts: [
      {
        id: 'guide-licence',
        labelSq: 'Licencë ose certifikim guide, kurs përgatitor dhe regjistrim aktiviteti',
        category: 'tarifa',
        lowUSD: 0,
        highUSD: 800,
        noteSq:
          'Në disa vende licenca kërkon kurs dhe provim, në të tjera nuk kërkohet; merrni informacionin zyrtar nga autoriteti i turizmit dhe nga regjistri zyrtar i bizneseve.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'tour-research',
        labelSq: 'Kërkim i temës, materiale ilustruese dhe hartë e printuar',
        category: 'hapje',
        lowUSD: 50,
        highUSD: 300,
        noteSq:
          'Libra, arkiva lokale, foto të vjetra me të drejtë përdorimi dhe printimi i hartës; verifikoni faktet historike me burime të besueshme para se t’i tregoni.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'booking-page',
        labelSq: 'Faqe rezervimi, foto dhe profile në platformat e tureve',
        category: 'hapje',
        lowUSD: 30,
        highUSD: 400,
        noteSq:
          'Mund të nisni me plane falas dhe foto me telefon; kostoja rritet nëse paguani fotograf ose mjete rezervimi me abonim.',
        scalesWithPriceLevel: false,
        optional: true,
      },
      {
        id: 'voice-kit',
        labelSq: 'Sistem i vogël zëri ose kufje për grupe',
        category: 'pajisje',
        lowUSD: 80,
        highUSD: 400,
        noteSq: 'Vlen vetëm për rrugë me zhurmë ose për grupe mbi 8 persona; në fillim mund të mos nevojitet.',
        scalesWithPriceLevel: false,
        optional: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: ture provë, bileta hyrjeje dhe materiale për recepsionet',
        category: 'testim_tregu',
        lowUSD: 40,
        highUSD: 200,
        noteSq:
          'Biletat e hyrjes për turet provë, fletëpalosje të thjeshta për 10 bujtina partnere dhe transport lokal; mbajeni të vogël derisa rezervimet me pagesë të vijnë rregullisht.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'liability-insurance',
        labelSq: 'Sigurim i përgjegjësisë civile për turet',
        category: 'sigurime',
        lowUSD: 20,
        highUSD: 100,
        noteSq:
          'Kërkoni oferta nga 2–3 sigurues për aktivitet guidimi me grupe; pyesni çfarë përjashtohet (p.sh. shtigje malore, mot i keq).',
        scalesWithPriceLevel: true,
      },
      {
        id: 'phone-data',
        labelSq: 'Telefon dhe internet celular',
        category: 'sherbime_komunale',
        lowUSD: 15,
        highUSD: 40,
        noteSq: 'Rezervimet dhe mesazhet me vizitorët vijnë në telefon; krahasoni paketat e operatorëve lokalë.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'booking-software',
        labelSq: 'Mjet rezervimi dhe pagesash online',
        category: 'software',
        lowUSD: 0,
        highUSD: 50,
        noteSq: 'Shumë mjete kanë plane falas me komision për rezervim; zgjidhni sipas numrit të rezervimeve.',
        scalesWithPriceLevel: false,
        optional: true,
      },
      {
        id: 'local-marketing',
        labelSq: 'Materiale për recepsionet dhe promovim lokal',
        category: 'marketing',
        lowUSD: 15,
        highUSD: 120,
        noteSq:
          'Fletëpalosje për bujtinat partnere dhe promovim i kufizuar vetëm pasi turet provë tregojnë interes; mos shpenzoni për reklama të mëdha para validimit.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'accounting',
        labelSq: 'Kontabilist i jashtëm',
        category: 'kontabilitet',
        lowUSD: 20,
        highUSD: 80,
        noteSq:
          'Pagesat përmes platformave të huaja e ndërlikojnë faturimin; kërkoni çmim fiks mujor dhe verifikoni detyrimet lokale.',
        scalesWithPriceLevel: true,
        optional: true,
      },
      {
        id: 'local-transport',
        labelSq: 'Transport lokal dhe mirëmbajtje e itinerarit',
        category: 'transport',
        lowUSD: 10,
        highUSD: 50,
        noteSq:
          'Udhëtime për takime me partnerët dhe kontrolle të rrugës para sezonit; grupimi i takimeve e ul këtë kosto.',
        scalesWithPriceLevel: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 0, monthlyNewCustomers: 8, monthlyChurnPct: 100 },
      baze: { startCustomers: 2, monthlyNewCustomers: 15, monthlyChurnPct: 100 },
      optimist: { startCustomers: 4, monthlyNewCustomers: 25, monthlyChurnPct: 100 },
    },
    seasonality: [0.3, 0.35, 0.6, 1.0, 1.35, 1.6, 1.9, 2.0, 1.5, 0.8, 0.35, 0.25],
    seasonalityNoteSq:
      'Në shumë destinacione turizmi përqendrohet nga maji në shtator, me kulm në korrik–gusht; në dimër mund të ketë pak ose aspak rezervime. Vlerat janë supozim për një destinacion me sezon veror; qytetet me turizëm kulturor gjatë gjithë vitit kanë sezonalitet më të butë, dhe në hemisferën jugore kalendari është i kundërt. Planifikoni të ardhura alternative për muajt e qetë.',
    macroLinks: [
      {
        indicatorCode: 'tourism_arrivals',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Më shumë vizitorë ndërkombëtarë do të thotë më shumë njerëz që duan ta njohin qytetin në kohë të shkurtër — tregu i drejtpërdrejtë i tureve.',
        ifSupportsSq:
          'Rritja e mbërritjeve mbështet hipotezën e kërkesës; kontrolloni nëse vizitorët vijnë në qytetin tuaj apo vetëm në zona të tjera.',
        ifContradictsSq:
          'Me mbërritje në rënie ose të sheshta, kërkesa duhet të vijë nga pushuesit vendas dhe diaspora; testoni turin me ta para se të investoni.',
      },
      {
        indicatorCode: 'tourism_receipts_usd',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Të ardhurat nga turizmi tregojnë sa shpenzojnë vizitorët gjatë qëndrimit; rritja e tyre sugjeron se ata paguajnë për përvoja dhe shërbime, jo vetëm për fjetje.',
        ifSupportsSq: 'Shpenzimi në rritje e bën më të besueshëm çmimin për pjesëmarrës.',
        ifContradictsSq:
          'Nëse të ardhurat bien ndërsa mbërritjet rriten, vizitorët po shpenzojnë më pak për person — kjo e vë në provë çmimin, jo vetëm numrin e klientëve.',
      },
      {
        indicatorCode: 'exchange_rate_lcu_usd',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Kur monedha vendase dobësohet ndaj dollarit (më shumë njësi vendase për 1 USD), destinacioni bëhet më i lirë për vizitorët nga jashtë, gjë që mund të rrisë vizitat dhe gatishmërinë për të paguar për ture. Efekti varet nga monedhat e vendeve nga vijnë vizitorët.',
        ifSupportsSq:
          'Një monedhë vendase më e dobët e bën turin më tërheqës për vizitorët e huaj; mbani parasysh se shtrenjtohen edhe mallrat e importuara.',
        ifContradictsSq:
          'Me monedhë vendase që forcohet, destinacioni shtrenjtohet për vizitorët; mbështetuni më shumë te vlera e përmbajtjes dhe te grupet e vogla.',
      },
      {
        indicatorCode: 'remittances_gdp',
        direction: 'me_i_larte_mbeshtet',
        referenceValue: 5,
        mechanismSq:
          'Remitancat e larta tregojnë një diasporë të madhe me lidhje familjare; familjet e diasporës e vizitojnë vendin dhe shpesh duan që fëmijët e rritur jashtë ta njohin historinë dhe traditat. Niveli referues 5% e PBB-së është supozim i bibliotekës; lidhja është e tërthortë.',
        ifSupportsSq:
          'Sugjeron një segment shtesë klientësh në sezonin veror — testoni ture në gjuhët e vendeve ku jeton diaspora.',
        ifContradictsSq:
          'Me remitanca të ulëta, ky segment ka gjasa të jetë i vogël; përqendrohuni te vizitorët e huaj dhe pushuesit vendas.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Gjithnjë e më shumë vizitorë udhëtojnë vetë, për pak ditë, dhe kërkojnë përvoja lokale në vend të tureve të mëdha me autobus.',
      problemSq:
        'Në pak kohë dhe pa e njohur gjuhën, vizitori nuk arrin ta kuptojë qytetin përtej pikave kryesore dhe humbet kohë me informacion të shpërndarë.',
      customerSq:
        'Vizitorë të huaj, pushues vendas dhe familje të diasporës që kërkojnë një përvojë të shkurtër e të organizuar mirë.',
      offerSq: 'Një turë me temë të qartë, grup të vogël, orar të saktë dhe tregime të verifikuara në gjuhën e vizitorit.',
      reasonToPaySq:
        'Kursim kohe, kuptim më i thellë i vendit dhe një guidë që u përgjigjet pyetjeve — gjëra që një guidë e shkruar nuk i jep.',
      profitConditionsSq:
        'Fitimi kërkon grupe mesatarisht mbi 4–5 persona gjatë sezonit, komision të kufizuar te platformat, rezervime të drejtpërdrejta nga bujtinat partnere dhe të ardhura alternative ose kosto shumë të ulëta në muajt e qetë.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq:
          'Vizitorët e pëlqejnë idenë, por rezervimet nuk vijnë; në shumë ditë turi anulohet sepse ka vetëm 1 pjesëmarrës.',
      },
      {
        kind: 'cmim',
        textSq:
          'Turet falas me bakshish dhe guidat e shkruara e ulin çmimin që pranojnë vizitorët nën nivelin që mbulon kohën dhe komisionet.',
      },
      {
        kind: 'konkurrence',
        textSq:
          'Guidat me përvojë dhe agjencitë lokale kanë vlerësime të shumta në platforma dhe zënë vendet e para në kërkime.',
      },
      {
        kind: 'kosto',
        textSq:
          'Komisionet e platformave, biletat e hyrjes dhe sigurimi marrin pjesë të madhe të çmimit, sidomos me grupe të vogla.',
      },
      {
        kind: 'sezonalitet',
        textSq:
          'Pothuajse të gjitha të ardhurat vijnë në 4–5 muaj; pa plan për dimrin, kostot fikse dhe jetesa nuk mbulohen.',
      },
      {
        kind: 'ligjore',
        textSq: 'Guidimi pa licencën e kërkuar ose në objekte që kërkojnë leje sjell gjoba ose ndalim të aktivitetit.',
      },
      {
        kind: 'operacionale',
        textSq:
          'Moti i keq, mbyllja e papritur e një objekti ose sëmundja e guidës anulojnë ture dhe sjellin rimbursime.',
      },
    ],
    falsifiersSq: [
      'Nga 10 recepsione bujtinash të pyetura, më pak se 3 thonë se mysafirët pyesin rregullisht për ture të guidura në qytet.',
      'Pas 6 javësh me rezervime të hapura në sezon, mesatarja mbetet nën 3 pjesëmarrës për turë dhe më shumë se 40% e tureve anulohen për mungesë pjesëmarrësish.',
      'Çmimi mesatar që paguajnë realisht vizitorët është më i ulët se 3 herë kostoja variabël për pjesëmarrës.',
    ],
    differentiationSq: [
      'Temë e ngushtë dhe e thellë (p.sh. zanatet e një lagjeje) në vend të një turi të përgjithshëm, me tregime të verifikuara nga burime të besueshme.',
      'Grup maksimal 10 persona, turi zhvillohet që nga 2 pjesëmarrës dhe kushtet e anulimit janë të qarta.',
      'Partneritete me punishte dhe prodhues lokalë, ku vizitori takon njerëz realë dhe jo vetëm monumente.',
    ],
    competitorTypesSq: [
      'Ture falas me bakshish në qendrat e qyteteve',
      'Agjenci turistike me ture të mëdha me autobus',
      'Guida të pavarura me licencë dhe përvojë të gjatë',
      'Guida audio, aplikacione dhe libra guidë për vizitë bëje-vetë',
    ],
    cheapestTestSq:
      'Tri ture provë falas me njerëz realë për të matur kohët dhe interesin, pastaj 6 javë me rezervime të hapura në sezon përmes bujtinave partnere dhe një faqeje të thjeshtë. Matni pjesëmarrësit me pagesë për turë dhe sa nga turet zhvillohen realisht.',
    interviewQuestionsSq: [
      'Çfarë bëtë dje gjatë ditës në qytet dhe si e zgjodhët?',
      'Kur ishte hera e fundit që paguat për një turë të guidur gjatë një udhëtimi dhe sa kushtoi?',
      'Ku e kërkuat informacionin për këtë qytet para se të vinit?',
      'Çfarë nuk arritët të kuptonit ose të gjenit gjatë qëndrimit këtu?',
      'Si i rezervoni zakonisht aktivitetet kur udhëtoni: paraprakisht online apo në vend?',
      'Për recepsionet: çfarë pyetën më shpesh mysafirët javën e kaluar dhe ku i drejtuat?',
      'Për recepsionet: sa mysafirë kërkuan një turë të guidur muajin e fundit dhe çfarë ndodhi me kërkesën e tyre?',
    ],
    firstCustomers: {
      whereSq: [
        'Bujtina dhe hotele të vegjël pa staf të dedikuar për aktivitete, në zonën e turit',
        'Zyra informacioni turistik dhe punishte ose prodhues që pranojnë të jenë ndalesa',
        'Komunitete të diasporës ku keni kontakte personale, para sezonit veror',
        'Platforma rezervimi turesh, pasi të keni verifikuar licencën dhe sigurimin',
      ],
      howToContactSq: [
        'Vizitë personale te recepsionet me itinerarin, oraret dhe ftesë për stafin në një turë falas',
        'Prezantim i turit në grupet e diasporës ku jeni anëtar, një herë dhe sipas rregullave të grupit, pa mesazhe masive',
        'Reagime reale nga pjesëmarrësit, pa vlerësime të rreme dhe pa shpërblime për vlerësime pozitive',
      ],
      offerSq:
        'Për bujtinat: turë falas për stafin që ta njohin atë që rekomandojnë; për vizitorët: çmim i plotë, anulim falas deri 24 orë para turit dhe zhvillim i turit që nga 2 pjesëmarrës.',
      followUpSq:
        'Pas çdo turi, dërgoni një mesazh me 3 pyetje të shkurtra reagimi; me bujtinat bëni një kontroll të shkurtër çdo 2 javë gjatë sezonit dhe ndaloni ndjekjen nëse nuk ka rekomandime pas një muaji.',
      metricsSq: [
        'Pjesëmarrës me pagesë për turë',
        'Ture të zhvilluara / ture të planifikuara (%)',
        'Rezervime sipas kanalit (bujtina, faqja, platforma)',
        'Komision dhe kosto variabël si % e çmimit',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje, jam [emri], guidë në [qyteti]. Organizoj një turë [kohëzgjatja] në këmbë për [tema], për grupe deri në [numri] persona, në [gjuhët]. Nisja është çdo ditë në [ora] nga [vendi]. A mund t’ju lë itinerarin dhe t’ju ftoj ju dhe stafin tuaj në një turë falas, që ta njihni para se ta rekomandoni?',
    offerTemplateSq:
      'Turi “[emri i turit]”: (1) [kohëzgjatja], nisje në [ora] nga [vendi i takimit]; (2) grup nga 2 deri në [numri] persona, në [gjuha]; (3) ndalesa: [ndalesa 1], [ndalesa 2], [ndalesa 3]; (4) çmimi [çmimi] për person, i paguar në rezervim; (5) anulim falas deri [orë] orë para nisjes; në mot shumë të keq turi shtyhet ose rimbursohet plotësisht. Biletat e hyrjes [përfshihen/nuk përfshihen]. Premtojmë një turë të përgatitur me kujdes dhe në orar; çdo blerje te partnerët është zgjedhja juaj.',
    feedbackQuestionsSq: [
      'Cila pjesë e turit ju duk më e gjatë ose më pak interesante?',
      'Çfarë kishit dashur të mësonit dhe nuk e mësuat?',
      'Si e gjetët turin dhe çfarë ju bëri ta rezervonit?',
    ],
    goCriteriaSq: [
      'Mesatarisht të paktën 4 pjesëmarrës me pagesë për turë gjatë 6 javëve të sezonit.',
      'Të paktën 70% e tureve të planifikuara zhvillohen realisht.',
      'Të paktën 3 bujtina partnere dërgojnë rezervime çdo muaj.',
    ],
    killCriteriaSq: [
      'Pas 6 javësh në kulmin e sezonit, mesatarja mbetet nën 3 pjesëmarrës me pagesë për turë.',
      'Licenca e kërkuar nuk mund të merret brenda një sezoni ose kushton më shumë se fitimi i pritshëm i sezonit të parë.',
      'Të ardhurat e sezonit, pas komisioneve dhe kostove fikse, nuk mbulojnë as gjysmën e nevojës suaj vjetore për të ardhura dhe nuk ka plan për dimrin.',
    ],
    phaseNotesSq: {
      p10_20: ['Pyesni recepsionet e 10 bujtinave dhe 15 vizitorë çfarë bënë dje në qytet dhe si e zgjodhën.'],
      p20_30: [
        'Merrni pjesë si klient në 2–3 ture ekzistuese në qytet dhe shënoni çmimin, kohëzgjatjen, temën dhe madhësinë e grupit.',
      ],
      p40_50: [
        'Verifikoni me autoritetin e turizmit nëse ju duhet licencë guide, dhe me çdo objekt nëse kërkon leje për grupe.',
      ],
      p60_70: ['Tri ture provë me njerëz realë; matni kohët në çdo ndalesë dhe rregulloni itinerarin.'],
      p90_100: [
        'Vlerësoni një turë të dytë me temë tjetër ose në gjuhë tjetër vetëm pasi i pari mbushet rregullisht.',
      ],
    },
    assumptionsSq: [
      'Në sezon, një guidë mund të bëjë 1–2 ture në ditë pa ulur cilësinë.',
      'Një pjesë e mirë e rezervimeve mund të vijë drejtpërdrejt nga bujtinat partnere, pa komision të lartë platforme.',
      'Vizitorët paguajnë më shumë për një temë të qartë dhe grup të vogël sesa për një turë të përgjithshme.',
      'Interesi verbal nuk është provë; vetëm rezervimet e paguara dhe turet e zhvilluara e konfirmojnë kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Property management for owners abroad — solo, low capital, international clients, client money
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'menaxhim-pronash-per-pronare-ne-diaspore',
    nameSq: 'Menaxhim apartamentesh me qira për pronarë që jetojnë jashtë vendit',
    taglineSq:
      'Qiramarrës të verifikuar, qira e paguar drejtpërdrejt te pronari dhe riparime të koordinuara — me raport mujor me foto.',
    descriptionSq:
      'Shërbim për pronarë që jetojnë jashtë vendit ose në një qytet tjetër dhe e japin apartamentin ose shtëpinë me qira afatgjatë. Ju bëheni “sytë dhe duart” lokale të pronarit: gjeni dhe verifikoni qiramarrësin, organizoni kontratën me ndihmën e një juristi, ndiqni pagesën e qirasë (që paguhet drejtpërdrejt në llogarinë e pronarit), kontrolloni pronën periodikisht me foto dhe koordinoni riparimet me mjeshtra të licencuar pas miratimit me shkrim të pronarit. Qiratë ditore turistike nuk përfshihen, sepse kanë rregulla dhe punë të tjera. Ndërmjetësimi në pasuri të paluajtshme dhe mbajtja e parave të klientëve mund të kërkojnë licencë dhe llogari të veçantë — duhen verifikuar para nisjes.',
    sector: 'diaspora',
    offerSq:
      'Paketë mujore për pronë: (1) gjetje dhe verifikim i qiramarrësit — identitet, referenca dhe aftësi paguese, sipas rregullave të mbrojtjes së të dhënave; (2) kontratë qiraje e përgatitur nga jurist dhe procesverbal dorëzimi me foto; (3) ndjekje e pagesës mujore të qirasë, që paguhet drejtpërdrejt në llogarinë e pronarit, dhe kujtesa për vonesat; (4) kontroll i pronës çdo tremujor me foto dhe raport; (5) koordinim i riparimeve me mjeshtra të licencuar pas miratimit me shkrim të ofertës nga pronari; (6) raport mujor me qiranë, shpenzimet dhe faturat e skanuara.',
    payingCustomerSq:
      'Pronari i një apartamenti ose shtëpie që jeton jashtë vendit ose larg dhe e jep me qira afatgjatë.',
    customerSegments: ['b2c'],
    problemSq:
      'Pronarët që jetojnë larg nuk mund të takojnë qiramarrësin, të ndjekin vonesat në pagesë apo të kontrollojnë një rrjedhje uji; mbështeten te të afërmit që lodhen ose nuk kanë kohë, dhe prona mbetet bosh për muaj ose dëmtohet pa e ditur, ndërsa çdo problem zgjidhet me telefonata të gjata nga larg.',
    modes: ['kombinuar'],
    marketScopes: ['nderkombetar', 'lokal'],
    canStartFromHome: true,
    minTeam: 'vetem',
    requiredSkills: ['administrim', 'sherbim_klienti'],
    helpfulSkills: ['shitje', 'gjuhe_te_huaja', 'kontabilitet', 'riparime_shtepie', 'fotografi_video', 'marketing_digjital'],
    helpfulAssets: ['telefon_smart', 'kompjuter', 'automjet', 'rrjet_diaspore', 'rrjet_kontaktesh'],
    minHoursPerWeek: 15,
    regulated: true,
    regulationNotesSq: [
      'Ndërmjetësimi në qiradhënie dhe menaxhimi i pronave për të tjerët mund të kërkojnë licencë agjenti pasurish të paluajtshme ose regjistrim të veçantë: Kërkon verifikim lokal para nisjes.',
      'Paratë e klientëve: modeli i rekomanduar është që qiramarrësi t’ia paguajë qiranë drejtpërdrejt pronarit. Nëse duhet të mbani para të pronarit (p.sh. për riparime), verifikoni nëse kërkohet llogari e veçantë klienti, mandat me shkrim dhe raportim — mos i përzieni kurrë me paratë tuaja.',
      'Për të vepruar në emër të pronarit (nënshkrim kontrate, përfaqësim në zyra) mund t’ju duhet prokurë e noterizuar; verifikoni formën dhe kufijtë e saj.',
      'Regjistrimi i kontratës së qirasë dhe deklarimi i të ardhurave nga qiraja janë detyrime të pronarit sipas rregullave lokale; verifikojini dhe mos ndihmoni në fshehjen e tyre.',
      'Të dhënat e qiramarrësve (dokumente, të ardhura, referenca) janë të dhëna personale: verifikoni rregullat e mbrojtjes së të dhënave dhe sa kohë lejohet t’i ruani. Hyrja në banesën e qiramarrësit bëhet vetëm me njoftim, sipas kontratës dhe ligjit.',
      'Rregullat për verifikimin e klientëve kundër pastrimit të parave mund të vlejnë për agjentët e pasurive të paluajtshme: verifikoni nëse ju përfshijnë.',
    ],
    licensedProfessionalsSq: [
      'Jurist ose avokat për kontratën e menaxhimit, kontratën e qirasë dhe procedurat për mospagim',
      'Noter për prokurën e pronarit, kur kërkohet',
      'Elektricist, hidraulik dhe teknik gazi i licencuar për çdo riparim në instalime',
      'Kontabilist për faturimin e pronarëve që jetojnë jashtë vendit',
      'Agjent pasurish të paluajtshme i licencuar, nëse ndërmjetësimi në vendin tuaj e kërkon',
    ],
    adultOnly: true,
    zeroCapitalTestSq:
      'Nisni me shërbimin më të thjeshtë, që nuk prek as para, as qiramarrës: përmes rrjetit tuaj në diasporë, flisni me 15 pronarë që kanë pronë me qira ose bosh dhe pyetini si e zgjidhën problemin e fundit. Ofroni te 3 prej tyre një kontroll të pronës me foto dhe raport të shkruar me tarifë të vogël fikse, pasi të keni verifikuar si mund të faturoni ligjërisht. Kostoja reale: transporti, telefoni dhe koha; menaxhimi i plotë kërkon kontrata nga jurist dhe ndoshta licencë e sigurim, që kushtojnë para.',
    revenueModelSq:
      'Tarifë mujore fikse për pronë të menaxhuar (njësia = 1 pronë në muaj), plus tarifë e vetme për gjetjen e qiramarrësit dhe tarifë koordinimi për riparime të mëdha (jo në modelin bazë). Përqindja nga qiraja është alternativë e zakonshme; zgjidhni një model dhe shkruajeni qartë në kontratë.',
    pricing: {
      unitLabelSq: 'pronë e menaxhuar në muaj',
      priceUSD: { low: 50, base: 90, high: 150 },
      variableCostUSD: { low: 6, base: 12, high: 20 },
      unitsPerCustomerPerMonth: 1,
      collectionDays: 15,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin transportin për vizitat në pronë, telefonin, ruajtjen e dokumenteve dhe tarifat bankare për pronë; nuk përfshin kohën tuaj dhe as koston e riparimeve, që i paguan pronari. Pronarët fitojnë jashtë vendit, por krahasojnë me alternativat lokale (një i afërm, një agjenci), prandaj çmimi në model ndjek nivelin lokal të çmimeve. Supozim: një person mund të menaxhojë 20–40 prona të grupuara në një qytet — duhet matur. Çmimet janë supozime fillestare në USD; pyetni pronarët sa paguajnë sot ose sa kohë humbasin.',
    },
    startupCosts: [
      {
        id: 'legal-templates',
        labelSq: 'Kontrata tip nga jurist (menaxhim, qira, procesverbal dorëzimi, mandat)',
        category: 'hapje',
        lowUSD: 150,
        highUSD: 800,
        noteSq:
          'Kontratat e mira mbrojnë edhe ju, edhe pronarin; kërkoni çmim fiks nga një jurist që i njeh qiratë lokale dhe përditësojini kur ndryshojnë rregullat.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'registration-licence',
        labelSq: 'Regjistrim aktiviteti dhe licencë ose kurs agjenti, nëse kërkohet',
        category: 'tarifa',
        lowUSD: 50,
        highUSD: 900,
        noteSq:
          'Varet shumë nga vendi: diku mjafton regjistrimi i biznesit, diku tjetër kërkohet licencë me kurs dhe provim. Merrni listën zyrtare nga regjistri zyrtar i bizneseve dhe nga autoriteti përkatës.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'inspection-kit',
        labelSq: 'Pajisje për kontrollet (llambë dore, matës lagështie, kuti çelësash me kod, etiketa)',
        category: 'pajisje',
        lowUSD: 50,
        highUSD: 250,
        noteSq: 'Ndihmojnë të dokumentoni lagështinë, rrjedhjet dhe gjendjen e pronës; krahasoni çmimet në 2–3 dyqane.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'simple-website',
        labelSq: 'Faqe e thjeshtë prezantimi dhe profil profesional',
        category: 'hapje',
        lowUSD: 0,
        highUSD: 300,
        noteSq:
          'Pronarët jashtë vendit duan të shohin kush jeni para se t’ju besojnë çelësat; mund të nisni me plan falas.',
        scalesWithPriceLevel: false,
        optional: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: 3 kontrolle pilot me raport dhe videothirrje me pronarë',
        category: 'testim_tregu',
        lowUSD: 40,
        highUSD: 200,
        noteSq:
          'Transport për kontrollet pilot, printim i raporteve dhe kohë për intervistat me pronarët; mbajeni të vogël derisa të keni pagesën e parë.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'professional-insurance',
        labelSq: 'Sigurim i përgjegjësisë profesionale',
        category: 'sigurime',
        lowUSD: 25,
        highUSD: 120,
        noteSq:
          'Mbulon gabimet në menaxhim (p.sh. një problem i pandjekur që shkakton dëm); kërkoni oferta nga 2–3 sigurues dhe lexoni përjashtimet.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'phone-internet',
        labelSq: 'Telefon, internet dhe thirrje ndërkombëtare',
        category: 'sherbime_komunale',
        lowUSD: 20,
        highUSD: 50,
        noteSq:
          'Komunikimi me pronarë në zona të ndryshme orare kërkon internet të qëndrueshëm; krahasoni paketat lokale.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'document-software',
        labelSq: 'Mjete për dokumente, nënshkrim elektronik dhe ndjekje të pagesave',
        category: 'software',
        lowUSD: 10,
        highUSD: 60,
        noteSq:
          'Në fillim mjafton një tabelë e përbashkët dhe ruajtje në re; mjetet e specializuara ia vlejnë mbi 15 prona.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'local-transport',
        labelSq: 'Transport për vizita dhe takime',
        category: 'transport',
        lowUSD: 30,
        highUSD: 150,
        noteSq: 'Varet nga distanca mes pronave; grupimi i pronave në 1–2 lagje e ul ndjeshëm këtë kosto.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'accounting',
        labelSq: 'Kontabilist i jashtëm',
        category: 'kontabilitet',
        lowUSD: 30,
        highUSD: 120,
        noteSq:
          'Faturimi i klientëve jashtë vendit mund të ketë rregulla të veçanta; kërkoni çmim fiks mujor dhe verifikoni detyrimet.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'community-marketing',
        labelSq: 'Prezantime në komunitetet e diasporës',
        category: 'marketing',
        lowUSD: 0,
        highUSD: 80,
        noteSq:
          'Kryesisht kohë dhe rekomandime; shpenzime të vogla për takime ose materiale vetëm pasi të keni klientët e parë.',
        scalesWithPriceLevel: true,
        optional: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 1, monthlyNewCustomers: 0.7, monthlyChurnPct: 2 },
      baze: { startCustomers: 2, monthlyNewCustomers: 1.2, monthlyChurnPct: 2 },
      optimist: { startCustomers: 3, monthlyNewCustomers: 2, monthlyChurnPct: 1.5 },
    },
    seasonality: [0.98, 0.98, 1, 1, 1, 1, 1.03, 1.03, 1.02, 1, 0.98, 0.98],
    seasonalityNoteSq:
      'Tarifa mujore për pronë është e qëndrueshme gjatë vitit; kontratat e reja shtohen në verë, kur pronarët e diasporës vijnë në vend, dhe në fillim të vitit akademik në qytetet me studentë. Vlerat janë supozim dhe ndryshojnë pak; rreziku kryesor nuk është sezonaliteti, por prona që mbetet bosh mes dy qiramarrësve.',
    macroLinks: [
      {
        indicatorCode: 'remittances_gdp',
        direction: 'me_i_larte_mbeshtet',
        referenceValue: 5,
        mechanismSq:
          'Remitancat e larta tregojnë një diasporë të madhe që dërgon para në vend; një pjesë e tyre investohet në prona që pronarët nuk i përdorin vetë dhe duan t’i japin me qira. Niveli referues 5% e PBB-së është supozim i bibliotekës.',
        ifSupportsSq:
          'Sugjeron shumë pronarë potencialë jashtë vendit — konfirmojeni duke numëruar pronarët në rrjetin tuaj.',
        ifContradictsSq:
          'Me remitanca të ulëta, tregu i pronarëve në diasporë mund të jetë i vogël; synoni edhe pronarët vendas që jetojnë në qytete të tjera.',
      },
      {
        indicatorCode: 'urban_population_growth',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Rritja e popullsisë urbane rrit kërkesën për banesa me qira në qytete, gjë që e shkurton kohën kur prona qëndron bosh dhe e bën menaxhimin më të vlefshëm.',
        ifSupportsSq:
          'Rritja urbane mbështet hipotezën e kërkesës për qira; kontrolloni lagjet konkrete ku ndodhen pronat.',
        ifContradictsSq:
          'Me rritje urbane të ngadaltë ose negative, pronat mund të qëndrojnë bosh më gjatë dhe pronarët do të jenë më të ndjeshëm ndaj tarifës.',
      },
      {
        indicatorCode: 'lending_rate',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Kur kreditë për banesa janë të shtrenjta, më shumë familje marrin me qira në vend që të blejnë, ndaj kërkesa për qira afatgjata rritet. Lidhja është e tërthortë dhe varet nga tregu lokal i banesave.',
        ifSupportsSq: 'Normat e larta të kredisë mund të mbajnë më shumë familje në qira — tregues i dobishëm, por jo provë.',
        ifContradictsSq:
          'Me kredi të lira, më shumë qiramarrës blejnë shtëpi; mund të ketë më shumë prona të lira për qira dhe më shumë konkurrencë mes pronarëve.',
      },
      {
        indicatorCode: 'account_ownership',
        direction: 'me_i_larte_mbeshtet',
        referenceValue: 50,
        mechanismSq:
          'Kur shumica e të rriturve kanë llogari bankare, qiraja mund të paguhet drejtpërdrejt në llogarinë e pronarit, me gjurmë të qarta — kjo e bën më të zbatueshëm modelin pa mbajtje parash. Niveli referues 50% është supozim i bibliotekës.',
        ifSupportsSq: 'Pagesat bankare të qiramarrësve ka gjasa të jenë të zakonshme; ndërtoni procesin mbi to.',
        ifContradictsSq:
          'Me pak llogari bankare, shumë qiramarrës paguajnë me para në dorë — kjo rrit rrezikun dhe rregullat që duhet të verifikoni për mbajtjen e parave të klientit.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Shumë familje jetojnë jashtë vendit, por mbajnë ose blejnë prona në vendin e origjinës dhe duan t’i japin me qira.',
      problemSq:
        'Nga larg, pronari nuk mund ta zgjedhë qiramarrësin, të ndjekë pagesat apo të reagojë shpejt kur prishet diçka.',
      customerSq: 'Pronarë në diasporë ose në qytete të tjera, me 1–3 prona me qira afatgjatë.',
      offerSq:
        'Një person lokal i besueshëm, me kontratë të qartë, raporte të rregullta me foto dhe pa i prekur paratë e qirasë.',
      reasonToPaySq: 'Më pak muaj bosh, më pak dëme të pazbuluara dhe më pak telefonata e shqetësim nga larg.',
      profitConditionsSq:
        'Fitimi kërkon 20–40 prona në pak lagje që vizitat të jenë efikase, pronarë që e paguajnë tarifën rregullisht dhe procese standarde që e mbajnë kohën për pronë nën 3–4 orë në muaj.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq: 'Pronarët e pranojnë problemin, por preferojnë ta lënë te një i afërm falas, edhe kur ai nuk e bën mirë.',
      },
      {
        kind: 'cmim',
        textSq:
          'Tarifa që pranojnë pronarët nuk mbulon kohën për kontrollet, koordinimin e riparimeve dhe raportet.',
      },
      {
        kind: 'konkurrence',
        textSq:
          'Agjencitë e pasurive të paluajtshme ofrojnë gjetjen e qiramarrësit me tarifë të vetme dhe menaxhimin si shtesë të lirë.',
      },
      {
        kind: 'kosto',
        textSq: 'Transporti dhe koha për prona të shpërndara nëpër qytet e rrisin koston për pronë mbi tarifën.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Puna pa licencën e kërkuar ose mbajtja e parave të klientëve pa llogari të veçantë sjell gjoba dhe humbje besimi.',
      },
      {
        kind: 'vonesa_pagesash',
        textSq:
          'Pronarët jashtë vendit e vonojnë tarifën ose kontestojnë faturat, sidomos kur qiramarrësi nuk ka paguar.',
      },
      {
        kind: 'operacionale',
        textSq:
          'Një qiramarrës problematik ose një dëm i madh merr javë pune dhe e dëmton marrëdhënien me pronarin.',
      },
    ],
    falsifiersSq: [
      'Nga 15 pronarë të intervistuar, më pak se 4 kanë pasur problem konkret me qiramarrësin ose me pronën gjatë vitit të fundit.',
      'Nga 10 oferta konkrete me çmim, më pak se 2 pronarë pranojnë të paguajnë muajin e parë.',
      'Në pilot, koha mesatare për pronë del mbi 6 orë në muaj, gjë që e bën të pamundur menaxhimin e mjaft pronave nga një person.',
    ],
    differentiationSq: [
      'Qiraja paguhet drejtpërdrejt te pronari: ju nuk i mbani paratë e tij, gjë që rrit besimin dhe ul rrezikun ligjor.',
      'Raport mujor me foto dhe fatura të skanuara, në gjuhën që preferon pronari.',
      'Afat i shkruar reagimi ndaj problemeve urgjente (p.sh. brenda 24 orëve), si angazhim shërbimi dhe jo si premtim se nuk do të ndodhin dëme.',
    ],
    competitorTypesSq: [
      'Agjenci pasurish të paluajtshme që gjejnë qiramarrës me tarifë të vetme',
      'Të afërm, fqinjë ose miq që e bëjnë falas',
      'Administratorë pallatesh që ndihmojnë herë pas here',
      'Pronarë që e menaxhojnë vetë nga larg me telefon',
    ],
    cheapestTestSq:
      'Intervista me 15 pronarë përmes rrjetit në diasporë dhe 3 kontrolle pilot me tarifë fikse për pronë, me raport me foto. Matni sa pronarë e paguajnë kontrollin dhe sa kërkojnë menaxhim të plotë pas tij.',
    interviewQuestionsSq: [
      'Kush kujdeset sot për pronën tuaj dhe si e organizoni këtë?',
      'Kur ishte hera e fundit që ndodhi një problem me pronën ose me qiramarrësin, dhe si u zgjidh?',
      'Sa muaj qëndroi prona bosh vitin e fundit dhe pse?',
      'Sa ju kushtoi riparimi i fundit dhe si e kontrolluat që u bë siç duhej?',
      'Si e merrni sot qiranë dhe sa herë është vonuar këtë vit?',
      'Sa paguani sot, në para ose në favore, për këdo që ju ndihmon me pronën?',
      'Çfarë ju ka penguar deri tani të punoni me një agjenci ose me një administrues?',
    ],
    firstCustomers: {
      whereSq: [
        'Rrjeti juaj personal dhe familjar në diasporë',
        'Shoqata dhe komunitete të diasporës, sidomos para dhe gjatë pushimeve verore',
        'Administratorë pallatesh, noterë dhe juristë që takojnë pronarë në diasporë (vetëm rekomandime me pëlqimin e pronarit)',
        'Pronarë që i keni ndihmuar më parë si të afërm ose fqinj',
      ],
      howToContactSq: [
        'Videothirrje e shkurtër me pronarët e rekomanduar, me shembullin e një raporti kontrolli',
        'Prezantim në grupet e diasporës ku jeni anëtar, një herë dhe sipas rregullave të grupit, pa mesazhe masive ose lista të blera',
        'Takime personale me pronarët kur vijnë në vend gjatë verës',
      ],
      offerSq:
        'Kontroll i pronës me raport me foto me tarifë të vogël fikse; pastaj menaxhim mujor pa afat të gjatë, me ndërprerje me njoftim 30-ditor.',
      followUpSq:
        'Pas raportit të parë, një videothirrje 15-minutëshe për ta shpjeguar; regjistroni çdo kontakt në një tabelë dhe ndaloni ndjekjen pas një rikujtese pa përgjigje.',
      metricsSq: [
        'Biseda → kontrolle pilot me pagesë (%)',
        'Kontrolle pilot → menaxhim mujor (%)',
        'Orë pune për pronë në muaj',
        'Ditë bosh mes qiramarrësve për pronat e menaxhuara',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje [emri], jam [emri juaj] nga [qyteti]. Ndihmoj pronarë që jetojnë jashtë vendit të kujdesen për apartamentet e tyre me qira: kontroll i rregullt me foto, ndjekje e qirasë që paguhet direkt te ju dhe koordinim riparimesh vetëm me miratimin tuaj. A mund t’ju dërgoj një shembull raporti dhe të flasim 15 minuta se si e menaxhoni sot pronën?',
    offerTemplateSq:
      'Oferta për pronën në [zona]: (1) kontroll çdo [frekuenca] me raport me foto; (2) ndjekje mujore e qirasë, që qiramarrësi e paguan direkt në llogarinë tuaj; (3) koordinim riparimesh me mjeshtra të licencuar vetëm pas miratimit tuaj me shkrim të ofertës; (4) raport mujor me faturat; (5) gjetje e qiramarrësit të ri me tarifë [tarifa]. Tarifa mujore: [çmimi], pagesë brenda [ditë] ditëve nga fatura. Ndërprerje me njoftim 30-ditor. Nuk premtojmë që prona do të jetë gjithmonë e zënë; premtojmë ndjekje të rregullt dhe informim të sinqertë.',
    feedbackQuestionsSq: [
      'Çfarë mungonte në raportin e fundit që do t’ju ndihmonte të vendosnit?',
      'Kur ndodhi diçka me pronën, sa shpejt dhe si u informuat?',
      'Cila pjesë e shërbimit ju duket më pak e vlefshme për tarifën?',
    ],
    goCriteriaSq: [
      'Të paktën 2 nga 3 pronarët pilot kalojnë në menaxhim mujor me pagesë.',
      'Koha mesatare për pronë mbetet nën 4 orë në muaj pas muajit të tretë.',
      'Licenca ose regjistrimi i nevojshëm është konfirmuar me shkrim nga autoriteti përkatës.',
    ],
    killCriteriaSq: [
      'Pas 25 bisedave me pronarë dhe 10 ofertave, më pak se 2 pronarë paguajnë.',
      'Rregullat lokale kërkojnë licencë ose garanci financiare që nuk përballohen me 10–15 prona.',
      'Më shumë se gjysma e pronarëve pilot e ndërpresin shërbimin brenda 3 muajve.',
    ],
    phaseNotesSq: {
      p10_20: ['Intervistoni 15 pronarë në diasporë për problemin e fundit me pronën dhe sa u kushtoi në kohë dhe para.'],
      p20_30: ['Pyesni 3 agjenci lokale si e çmojnë gjetjen e qiramarrësit dhe menaxhimin, duke u prezantuar sinqerisht.'],
      p40_50: [
        'Verifikoni me autoritetin përkatës nëse menaxhimi i pronave kërkon licencë agjenti dhe si duhet trajtuar çdo pagesë e pronarit; porositni kontratat te një jurist.',
      ],
      p50_60: [
        'Ndërtoni një listë mjeshtrash të licencuar (hidraulik, elektricist, teknik gazi) me çmime të krahasuara para se t’u dërgoni punë.',
      ],
      p60_70: ['Tre kontrolle pilot me raport; matni orët e punës për secilin.'],
    },
    assumptionsSq: [
      'Qiraja paguhet drejtpërdrejt te pronari, ndaj biznesi nuk mban para të klientëve.',
      'Një person mund të menaxhojë 20–40 prona të grupuara me procese dhe lista kontrolli.',
      'Pronarët jashtë vendit e paguajnë tarifën mujore me transfertë brenda 15 ditëve.',
      'Interesi verbal nuk është provë; vetëm pagesa e kontrollit pilot dhe e muajit të parë e konfirmojnë kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },
];
