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

  // ───────────────────────────────────────────────────────────────────────────
  // 4. Solar panel cleaning + visual report — partner (never alone at height), medium capital
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'pastrim-dhe-kontroll-vizual-panelesh-diellore',
    nameSq: 'Pastrim panelesh diellore dhe raport vizual i gjendjes',
    taglineSq:
      'Pastrim me ujë të demineralizuar, sa më shumë nga toka, dhe raport me foto për pronarin — çdo punë elektrike i mbetet elektricistit të licencuar.',
    descriptionSq:
      'Shërbim pastrimi për panele diellore në çati, mbi strehë parkimi dhe në tokë — për shtëpi, biznese të vogla, ferma dhe impiante të vogla — i kombinuar me një kontroll vizual të dokumentuar me foto. Pluhuri, poleni dhe jashtëqitjet e zogjve e ulin prodhimin, por shumë pronarë ose nuk i pastrojnë fare, ose hipin vetë në çati. Pastrimi bëhet me ujë të demineralizuar dhe furça të buta në shtylla teleskopike, sa më shumë nga toka; puna në çati bëhet vetëm nga një ekip prej të paktën dy personash të trajnuar, me pajisje mbrojtëse kundër rënies. Nuk preken kabllot, inverteri apo kutitë e lidhjes: çdo problem elektrik i raportohet pronarit, që ta trajtojë instaluesi ose një elektricist i licencuar.',
    sector: 'energji',
    offerSq:
      'Pastrim i paneleve me ujë të demineralizuar dhe furça të buta, pa detergjentë të fortë dhe sipas udhëzimeve të prodhuesit; kontroll vizual para dhe pas pastrimit; raport me foto për çdo varg panelesh (ndotje, plasaritje të dukshme, ngjyrim i ndryshuar, hije nga bimësia, fiksime që duken të lira); krahasim i prodhimit para dhe pas, sipas aplikacionit të inverterit që përdor vetë klienti; abonim me 2–4 pastrime në vit për biznese dhe ferma. Çdo ndërhyrje elektrike i referohet elektricistit të licencuar.',
    payingCustomerSq:
      'Pronarë shtëpish me panele në çati, biznese të vogla (magazina, hotele, punishte), ferma dhe pronarë impiantesh të vogla diellore.',
    customerSegments: ['b2b', 'b2c'],
    problemSq:
      'Panelet e ndotura prodhojnë më pak energji pa e kuptuar pronari, sidomos në zona me pluhur, bujqësi ose shumë zogj; pronarët hipin vetë në çati duke u ekspozuar ndaj rënieve, ose përdorin ujë me presion dhe detergjentë që mund t’i dëmtojnë panelet dhe të prekin garancinë, ndërsa askush nuk u tregon nëse ka dëmtime të dukshme.',
    modes: ['fizik'],
    marketScopes: ['lokal'],
    canStartFromHome: true,
    minTeam: 'partner',
    requiredSkills: ['pastrim'],
    helpfulSkills: ['drejtim_mjeti', 'shitje', 'fotografi_video', 'sherbim_klienti', 'administrim'],
    helpfulAssets: ['furgon', 'automjet', 'vegla_pune', 'telefon_smart', 'rrjet_kontaktesh'],
    minHoursPerWeek: 20,
    regulated: true,
    regulationNotesSq: [
      'Puna në lartësi (çati, strehë, shkallë) rregullohet nga rregullat e sigurisë në punë: trajnim i certifikuar, vlerësim rreziku për çdo vend, pajisje mbrojtëse kundër rënies dhe pika ankorimi të përshtatshme. Kërkon verifikim lokal; mos punoni kurrë vetëm në çati dhe mos hipni pa pajisjet dhe trajnimin e kërkuar.',
      'Panelet prodhojnë tension sa herë ka dritë, edhe kur sistemi duket i fikur; panelet e plasaritura ose kabllot e dëmtuara mund të jenë të rrezikshme. Mos prekni kabllo, lidhje, inverter apo kuti lidhjeje — çdo kontroll ose riparim elektrik bëhet vetëm nga elektricist i licencuar.',
      'Udhëzimet e prodhuesit të paneleve për pastrimin (lloji i ujit, presioni, furçat, kimikatet e lejuara) mund të kushtëzojnë garancinë; verifikojini për çdo markë para punës.',
      'Sigurimi i përgjegjësisë civile dhe i aksidenteve në punë për të gjithë ekipin: verifikoni çfarë është i detyrueshëm dhe nëse polica e mbulon punën në lartësi.',
      'Nëse përdorni dron për foto, verifikoni rregullat e regjistrimit dhe të fluturimit; për ujin e mbetur dhe çdo produkt pastrimi, verifikoni rregullat lokale të shkarkimit.',
    ],
    licensedProfessionalsSq: [
      'Elektricist i licencuar për çdo kontroll ose riparim elektrik (kabllo, lidhje, inverter, tokëzim)',
      'Instaluesi i sistemit ose teknik i autorizuar nga prodhuesi për çështjet e garancisë',
      'Trajnues i certifikuar për punë në lartësi dhe për përdorimin e pajisjeve mbrojtëse kundër rënies',
      'Pilot droni i regjistruar, nëse përdoren dronë për foto',
    ],
    adultOnly: true,
    zeroCapitalTestSq:
      'Ky shërbim nuk mund të nisë pa shpenzime: pajisjet e sigurisë, trajnimi dhe sistemi i ujit kushtojnë para. Testi me kosto minimale mat kërkesën para blerjes: numëroni nga rruga 40 ndërtesa, ferma dhe strehë parkimi me panele në zonën tuaj; pyetni 15 pronarë kur i pastruan për herë të fundit dhe si; pyetni 3 instalues nëse klientët e tyre kërkojnë pastrim. Pastaj kërkoni 5 rezervime me parapagim për panele që arrihen nga toka (strehë parkimi, panele në tokë) para se të blini pajisjet. Mos hipni në çati pa trajnim, pajisje dhe partner.',
    revenueModelSq:
      'Çmim për panel të pastruar (njësia = 1 panel), me tarifë minimale për vizitë; abonim me 2–4 pastrime në vit për biznese dhe ferma, me raportin vizual të përfshirë. Kontratat vjetore me impiante më të mëdha janë mundësi e mëvonshme dhe nuk janë në modelin bazë.',
    pricing: {
      unitLabelSq: 'panel i pastruar',
      priceUSD: { low: 3, base: 5, high: 8 },
      variableCostUSD: { low: 0.4, base: 0.8, high: 1.3 },
      unitsPerCustomerPerMonth: 10,
      collectionDays: 20,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin ujin e demineralizuar (rrëshirën ose filtrin që konsumohet), konsumin e furçave dhe pjesën e karburantit për vizitë; nuk përfshin kohën e ekipit. “Klient” = një vend në abonim, mesatarisht rreth 40 panele të pastruara 3 herë në vit (pra rreth 10 panele në muaj); shtëpitë me 10–20 panele paguajnë tarifën minimale për vizitë. Arkëtimi përzien pagesën në vend (familjet) me faturat 30-ditore (bizneset). Çmimet janë supozime fillestare në USD; pyetni instaluesit dhe pronarët sa paguajnë sot dhe merrni oferta reale për pajisjet.',
    },
    startupCosts: [
      {
        id: 'water-system',
        labelSq: 'Sistem uji të demineralizuar, shtylla teleskopike me furça dhe tuba',
        category: 'pajisje',
        lowUSD: 800,
        highUSD: 3500,
        noteSq:
          'Pajisja kryesore; çmimi varet nga gjatësia e shtyllave dhe kapaciteti i filtrit. Kërkoni 3 oferta dhe pyesni sa kushton rrëshira zëvendësuese për 100 panele.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'fall-protection',
        labelSq: 'Pajisje mbrojtëse kundër rënies, helmeta, këpucë jo-rrëshqitëse dhe doreza për dy persona',
        category: 'pajisje',
        lowUSD: 400,
        highUSD: 1500,
        noteSq:
          'E domosdoshme për çdo punë në lartësi; blini vetëm pajisje të certifikuara dhe kontrollojini sipas udhëzimeve të prodhuesit. Pyesni trajnuesin çfarë nevojitet për llojin e çative që synoni.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'height-training',
        labelSq: 'Trajnim i certifikuar për punë në lartësi dhe ndihmë e parë për dy persona',
        category: 'tarifa',
        lowUSD: 200,
        highUSD: 800,
        noteSq:
          'Kohëzgjatja dhe çmimi ndryshojnë sipas vendit dhe ofruesit; pyesni autoritetin e sigurisë në punë cilat trajnime njihen zyrtarisht.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'water-tank-pump',
        labelSq: 'Rezervuar uji dhe pompë e vogël për vendet pa rubinet',
        category: 'pajisje',
        lowUSD: 200,
        highUSD: 900,
        noteSq: 'Nevojitet për ferma dhe impiante në tokë pa burim uji; mund ta shtyni derisa të keni klientë të tillë.',
        scalesWithPriceLevel: false,
        optional: true,
      },
      {
        id: 'used-vehicle',
        labelSq: 'Mjet i përdorur për pajisjet',
        category: 'pajisje',
        lowUSD: 4000,
        highUSD: 12000,
        noteSq:
          'Nevojitet vetëm nëse nuk keni makinë ose furgon; shtyllat e gjata kërkojnë mbajtëse çatie ose furgon. Kontrolloni koston e sigurimit për përdorim pune.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['furgon', 'automjet'],
      },
      {
        id: 'registration',
        labelSq: 'Regjistrim aktiviteti dhe faturim',
        category: 'tarifa',
        lowUSD: 50,
        highUSD: 400,
        noteSq:
          'Merrni shumën e saktë dhe kodin e aktivitetit nga regjistri zyrtar i bizneseve; verifikoni nëse puna në lartësi kërkon regjistrim të veçantë.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: numërim në terren, takime me instalues dhe 5 pastrime nga toka',
        category: 'testim_tregu',
        lowUSD: 80,
        highUSD: 300,
        noteSq:
          'Karburant për numërimin dhe takimet, ujë dhe furça për pastrimet e para nga toka; mbajeni të vogël derisa të keni parapagime.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'insurance',
        labelSq: 'Sigurim i përgjegjësisë civile dhe i aksidenteve në punë',
        category: 'sigurime',
        lowUSD: 60,
        highUSD: 250,
        noteSq:
          'Puna në lartësi e rrit primin; kërkoni oferta me shkrim nga 2–3 sigurues që përmendin qartë punën në çati dhe dëmet në panele.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'fuel-fixed',
        labelSq: 'Karburant dhe mirëmbajtje e mjetit (pjesa fikse)',
        category: 'transport',
        lowUSD: 50,
        highUSD: 200,
        noteSq:
          'Varet nga distanca mes klientëve; grupimi i vizitave në një zonë për çdo ditë pune e ul ndjeshëm këtë kosto.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'equipment-upkeep',
        labelSq: 'Mirëmbajtje dhe zëvendësim i furçave, tubave dhe pajisjeve të sigurisë',
        category: 'mirembajtje',
        lowUSD: 20,
        highUSD: 90,
        noteSq:
          'Pajisjet e sigurisë kanë afat përdorimi dhe duhen zëvendësuar sipas prodhuesit; furçat konsumohen me përdorimin.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'phone',
        labelSq: 'Telefon dhe internet celular',
        category: 'sherbime_komunale',
        lowUSD: 15,
        highUSD: 40,
        noteSq: 'Për rezervime, foto dhe raporte; krahasoni paketat e operatorëve lokalë.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'accounting',
        labelSq: 'Kontabilist i jashtëm',
        category: 'kontabilitet',
        lowUSD: 30,
        highUSD: 100,
        noteSq:
          'Me fatura për biznese dhe ferma, kontabiliteti profesional zakonisht nevojitet; kërkoni çmim fiks mujor.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'local-marketing',
        labelSq: 'Materiale për instaluesit dhe promovim lokal',
        category: 'marketing',
        lowUSD: 20,
        highUSD: 100,
        noteSq:
          'Fletë me shembuj raportesh për instaluesit dhe dyqanet e pajisjeve; mos shpenzoni për reklama të mëdha para se të keni klientë të rregullt.',
        scalesWithPriceLevel: true,
        optional: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 2, monthlyNewCustomers: 2, monthlyChurnPct: 4 },
      baze: { startCustomers: 4, monthlyNewCustomers: 4, monthlyChurnPct: 3 },
      optimist: { startCustomers: 6, monthlyNewCustomers: 7, monthlyChurnPct: 2.5 },
    },
    seasonality: [0.5, 0.6, 1.0, 1.3, 1.4, 1.35, 1.25, 1.2, 1.1, 0.9, 0.7, 0.7],
    seasonalityNoteSq:
      'Kërkesa rritet në pranverë (polen, pluhur pas dimrit) dhe në verë, kur prodhimi është më i lartë dhe ndotja më e dukshme; në dimër ditët janë të shkurtra, çatitë mund të jenë të lagura ose me ngrica dhe shiu i pastron pjesërisht panelet. Vlerat janë supozim; klima dhe ndotja lokale ndryshojnë shumë, dhe puna në çati ndalet kur ka erë, shi ose akull.',
    macroLinks: [
      {
        indicatorCode: 'gdp_per_capita_ppp',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Në ekonomi me të ardhura më të larta, më shumë familje dhe biznese kanë investuar në panele dhe janë më të gatshme të paguajnë për mirëmbajtje në vend që ta bëjnë vetë.',
        ifSupportsSq:
          'Të ardhurat më të larta sugjerojnë më shumë klientë që paguajnë për shërbim — numëroni panelet në zonën tuaj për ta konfirmuar.',
        ifContradictsSq:
          'Me të ardhura më të ulëta, pronarët mund të preferojnë t’i pastrojnë vetë; theksoni rrezikun e rënies dhe të dëmtimit të paneleve dhe testoni çmimin me kujdes.',
      },
      {
        indicatorCode: 'lending_rate',
        direction: 'me_i_ulet_mbeshtet',
        mechanismSq:
          'Panelet blihen shpesh me kredi; kur normat e interesit janë të ulëta, instalohen më shumë sisteme në shtëpi dhe biznese, pra rritet tregu i mundshëm i pastrimit.',
        ifSupportsSq: 'Kreditë më të lira sugjerojnë më shumë instalime të reja në vitet në vijim — pyesni instaluesit lokalë për ritmin e punës.',
        ifContradictsSq:
          'Me kredi të shtrenjta, instalimet e reja ngadalësohen; fokusohuni te sistemet ekzistuese dhe te klientët me shumë panele.',
      },
      {
        indicatorCode: 'agriculture_va_gdp',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Fermat kanë çati të mëdha dhe shpesh panele në tokë, ndërsa puna e tokës dhe kafshët krijojnë pluhur e ndotje që e ulin prodhimin më shpejt — klientë me shumë panele në një vend.',
        ifSupportsSq: 'Pesha e bujqësisë sugjeron një segment fermash; kontrolloni sa ferma në zonë kanë panele.',
        ifContradictsSq: 'Me bujqësi të vogël, fokusohuni te shtëpitë dhe bizneset në qytet.',
      },
      {
        indicatorCode: 'industry_va_gdp',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Industria dhe magazinat kanë çati të mëdha ku vendosen panele, dhe aktiviteti industrial rrit pluhurin në ajër — dy arsye për pastrime më të shpeshta.',
        ifSupportsSq: 'Pesha e industrisë sugjeron klientë të mëdhenj biznesi; listoni zonat industriale pranë jush.',
        ifContradictsSq:
          'Me industri të vogël, klientët e mëdhenj janë të paktë; ndërtoni rrugë vizitash me shumë shtëpi dhe biznese të vogla.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Gjithnjë e më shumë shtëpi, biznese dhe ferma kanë instaluar panele diellore, por pak prej tyre kanë një plan mirëmbajtjeje.',
      problemSq: 'Ndotja e paneleve e ul prodhimin pa u vënë re, ndërsa pastrimi bëhet rrallë ose në mënyrë të rrezikshme.',
      customerSq: 'Pronarë panelesh që nuk duan të hipin vetë në çati, si dhe biznese ose ferma me shumë panele.',
      offerSq:
        'Pastrim i sigurt nga një ekip i trajnuar, me ujë të përshtatshëm dhe raport me foto që tregon gjendjen e paneleve.',
      reasonToPaySq:
        'Pronari shmang rrezikun e rënies dhe të dëmtimit të paneleve, dhe mëson në kohë nëse ka diçka që duhet parë nga instaluesi.',
      profitConditionsSq:
        'Fitimi kërkon klientë të grupuar në zona që një ditë pune të ketë disa vizita, një tarifë minimale për vizitë, abonime me 2–4 pastrime në vit dhe kosto sigurimi të përballueshme.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq:
          'Pronarët nuk e dinë sa prodhim humbasin dhe nuk e shohin pastrimin si të nevojshëm, sidomos kur shiu i pastron pjesërisht.',
      },
      {
        kind: 'cmim',
        textSq:
          'Pronarët krahasojnë me pastrimin “falas” me zorrë uji nga një i afërm dhe nuk pranojnë tarifën që mbulon dy persona dhe sigurimin.',
      },
      {
        kind: 'konkurrence',
        textSq:
          'Instaluesit ofrojnë pastrimin si shërbim shtesë të lirë për klientët e tyre, ose kompanitë e pastrimit të ndërtesave e shtojnë në paketë.',
      },
      {
        kind: 'kosto',
        textSq:
          'Sigurimi për punë në lartësi, pajisjet dhe karburanti marrin pjesë të madhe të të ardhurave kur vizitat janë të vogla dhe larg njëra-tjetrës.',
      },
      {
        kind: 'sezonalitet',
        textSq: 'Në dimër kërkesa bie dhe moti e ndalon punën në çati, ndërsa kostot fikse vazhdojnë.',
      },
      {
        kind: 'operacionale',
        textSq:
          'Një aksident në lartësi ose një panel i dëmtuar gjatë pastrimit mund ta ndalë biznesin dhe të sjellë dëmshpërblime.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Puna pa trajnimin dhe pajisjet e kërkuara për lartësi sjell gjoba ose ndalim, dhe sigurimi mund të mos e mbulojë dëmin.',
      },
    ],
    falsifiersSq: [
      'Nga 40 vende me panele të numëruara në zonë, më pak se 10 janë biznese, ferma ose shtëpi me mbi 15 panele.',
      'Nga 15 pronarë të intervistuar, më pak se 3 kanë paguar ndonjëherë për pastrim ose kanë kërkuar dikë për ta bërë.',
      'Pas 20 ofertave me çmim, më pak se 5 pranojnë rezervim me parapagim.',
      'Krahasimi para/pas në aplikacionet e klientëve pilot nuk tregon ndryshim të dukshëm prodhimi në shumicën e rasteve, gjë që e dobëson argumentin kryesor.',
    ],
    differentiationSq: [
      'Siguri e dokumentuar: ekip prej dy personash, trajnim i certifikuar, pajisje mbrojtëse dhe sigurim — të treguara klientit para punës.',
      'Raport me foto dhe krahasim prodhimi para/pas nga aplikacioni i klientit, pa premtuar një përqindje të caktuar rritjeje.',
      'Metodë e butë pastrimi sipas udhëzimeve të prodhuesit, që respekton garancinë e paneleve.',
    ],
    competitorTypesSq: [
      'Pronarë që i pastrojnë vetë me zorrë uji ose furçë',
      'Instalues që ofrojnë pastrim si shërbim shtesë',
      'Kompani pastrimi ndërtesash dhe xhamash',
      'Punëtorë të pavarur pa trajnim ose sigurim për lartësi',
    ],
    cheapestTestSq:
      'Numërim i 40 vendeve me panele, intervista me 15 pronarë dhe 3 instalues, pastaj 5 pastrime me parapagim për panele që arrihen nga toka. Matni kohën për panel, ndryshimin e prodhimit në aplikacionin e klientit dhe sa prej tyre rezervojnë sërish.',
    interviewQuestionsSq: [
      'Kur i pastruat panelet për herë të fundit dhe kush e bëri?',
      'Si e kontrolloni sot nëse panelet prodhojnë sa duhet?',
      'Sa ju kushtoi pastrimi ose kontrolli i fundit, nëse keni paguar për të?',
      'Çfarë ju ka thënë instaluesi për mirëmbajtjen dhe garancinë?',
      'Kur ishte hera e fundit që vutë re rënie të prodhimit dhe çfarë bëtë?',
      'Kush tjetër merr pjesë në vendimin për të paguar për mirëmbajtjen e paneleve?',
      'Si i kanë prekur panelet pluhuri, zogjtë ose pemët këtë vit?',
    ],
    firstCustomers: {
      whereSq: [
        'Ferma, magazina dhe hotele me panele të dukshme në çati ose në tokë',
        'Instalues panelesh që nuk ofrojnë pastrim dhe kanë klientë që e kërkojnë',
        'Lagje me shumë shtëpi me panele në çati',
        'Shoqata fermerësh dhe biznese lokale ku keni kontakte',
      ],
      howToContactSq: [
        'Vizitë personale te pronarët e fermave dhe bizneseve, me shembull raporti dhe dokumentet e sigurisë',
        'Takim me instaluesit për partneritet rekomandimi, me çdo komision të deklaruar hapur te klienti',
        'Fletë informuese në kutitë postare vetëm aty ku lejohet, pa mesazhe masive ose lista të blera',
      ],
      offerSq:
        'Pastrimi i parë me çmim të plotë dhe raport me foto; pastaj abonim me 2–4 pastrime në vit pa afat të gjatë, me anulim me njoftim 30-ditor.',
      followUpSq:
        'Një javë pas pastrimit, pyetni klientin nëse dëshiron ta ndajë me ju krahasimin e prodhimit nga aplikacioni dhe flisni për abonimin; ndaloni ndjekjen pas një rikujtese pa përgjigje.',
      metricsSq: [
        'Oferta → pastrime me pagesë (%)',
        'Pastrime të para → abonime (%)',
        'Panele të pastruara për orë pune',
        'Incidente sigurie ose dëmtime (synimi: zero)',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje, jam [emri] nga [emri i biznesit]. Pastrojmë panele diellore me ujë të demineralizuar dhe furça të buta, kryesisht nga toka, me ekip të trajnuar për lartësi dhe të siguruar. Pas çdo pastrimi ju japim një raport me foto për gjendjen e paneleve. A mund t’ju pyes kur i pastruat panelet për herë të fundit dhe si u bë?',
    offerTemplateSq:
      'Oferta për [emri i klientit]: (1) pastrim i [numri] paneleve në [vendi] më [data]; (2) kontroll vizual dhe raport me foto brenda [ditë] ditëve; (3) çmimi [çmimi] për panel, minimumi [tarifa minimale] për vizitë; (4) abonim opsional [numri] herë në vit me çmim [çmimi i abonimit]. Nuk prekim kabllo, inverter apo lidhje: çdo problem elektrik ju raportohet që ta trajtojë elektricisti i licencuar ose instaluesi. Nuk premtojmë një rritje të caktuar të prodhimit; premtojmë pastrim të kujdesshëm dhe raport të sinqertë.',
    feedbackQuestionsSq: [
      'Çfarë ju shërbeu më shumë nga raporti dhe çfarë mungonte?',
      'Çfarë ndryshimi patë në prodhim pas pastrimit, sipas aplikacionit tuaj?',
      'Çfarë ju pengon të zgjidhni një abonim të rregullt?',
    ],
    goCriteriaSq: [
      'Të paktën 5 parapagime nga 20 oferta, dhe 3 klientë që zgjedhin abonim pas pastrimit të parë.',
      'Të paktën 40 panele të pastruara për orë pune të ekipit në vende tipike, pa asnjë incident sigurie.',
    ],
    killCriteriaSq: [
      'Pas 30 kontakteve me pronarë dhe instalues, më pak se 3 pastrime me pagesë.',
      'Sigurimi për punë në lartësi kushton aq sa nuk mbulohet as me 25 klientë në abonim.',
      'Mbi gjysma e klientëve të parë nuk rezervojnë pastrim të dytë brenda 6 muajve.',
    ],
    phaseNotesSq: {
      p10_20: [
        'Numëroni 40 vende me panele në zonë (nga rruga, pa hyrë në prona) dhe intervistoni 15 pronarë dhe 3 instalues.',
      ],
      p40_50: [
        'Verifikoni rregullat e punës në lartësi, trajnimin e njohur dhe sigurimin e kërkuar; mos planifikoni asnjë punë në çati para tyre.',
      ],
      p50_60: [
        'Blini vetëm pajisje sigurie të certifikuara dhe hartoni një listë kontrolli sigurie për çdo vizitë (moti, ankorimi, partneri).',
      ],
      p60_70: ['Pesë pastrime me parapagim për panele që arrihen nga toka; matni kohën për panel dhe dokumentoni raportin.'],
      p80_90: ['Gruponi klientët sipas zonave dhe ndërtoni kalendarin e abonimeve për të shmangur ditët bosh.'],
    },
    assumptionsSq: [
      'Një ekip prej dy personash mund të pastrojë 40–80 panele në orë pune në vende të arritshme (duhet matur).',
      'Pastrimi bëhet kryesisht nga toka; puna në çati bëhet vetëm me trajnim, pajisje dhe partner.',
      'Bizneset dhe fermat pranojnë abonime me 2–4 pastrime në vit.',
      'Interesi verbal nuk është provë; vetëm parapagimi dhe rezervimi i pastrimit të dytë e konfirmojnë kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 5. Non-medical companionship for elderly people — solo, low capital, families abroad pay
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'shoqerim-dhe-ndihme-jo-mjekesore-per-te-moshuar',
    nameSq: 'Shoqërim dhe ndihmë jo-mjekësore në shtëpi për të moshuar',
    taglineSq: 'Vizita të rregullta, blerje, shoqërim te mjeku dhe raport për familjen — pa asnjë detyrë mjekësore.',
    descriptionSq:
      'Shërbim shoqërimi dhe ndihme të përditshme për të moshuar që jetojnë vetëm ose me pak mbështetje, ndërsa fëmijët e tyre shpesh jetojnë jashtë vendit ose në një qytet tjetër. Gjatë vizitave të rregullta, shoqëruesi bisedon dhe del shëtitje me të moshuarin, bën blerjet dhe porositë e vogla, e shoqëron te mjeku ose në zyra, ndihmon me telefonin dhe videothirrjet dhe i dërgon familjes një raport të shkurtër. Shërbimi përjashton qartë çdo detyrë mjekësore — dhënien e ilaçeve, injeksionet, mjekimin e plagëve, zhvendosjet që kërkojnë trajnim të specializuar — të cilat i bëjnë infermierët ose mjekët. Kërkon besim të madh: dëshmi penaliteti, referenca, marrëveshje me shkrim dhe rregulla të qarta për çelësat dhe paratë.',
    sector: 'kujdes',
    offerSq:
      'Paketë mujore për familje: 2–3 vizita në javë nga 2–3 orë me të njëjtin shoqërues; bisedë, shëtitje dhe aktivitete të thjeshta; blerje ushqimesh dhe porosi të vogla me fatura të ruajtura; shoqërim te mjeku, në farmaci ose në zyra; ndihmë me telefonin dhe videothirrjet me familjen; kujtesë për takimet; raport i shkurtër me shkrim për familjen pas çdo vizite dhe numër kontakti për raste urgjente. Përjashtohen ilaçet, injeksionet, plagët, matjet mjekësore dhe këshillat mjekësore.',
    payingCustomerSq:
      'Fëmijët ose të afërmit e të moshuarit — shpesh që jetojnë jashtë vendit dhe paguajnë me transfertë — ose vetë i moshuari.',
    customerSegments: ['b2c'],
    problemSq:
      'Shumë të moshuar jetojnë vetëm ndërsa fëmijët janë larg; vetmia, blerjet e rënda dhe vajtja te mjeku bëhen të vështira, ndërsa familja nuk e di çfarë ndodh realisht në shtëpi dhe mbështetet te fqinjët ose te ndihmë e paverifikuar, pa marrëveshje dhe pa raportim.',
    modes: ['fizik', 'kombinuar'],
    marketScopes: ['lokal', 'nderkombetar'],
    canStartFromHome: true,
    minTeam: 'vetem',
    requiredSkills: ['kujdes_personash', 'sherbim_klienti'],
    helpfulSkills: ['drejtim_mjeti', 'gjuhe_te_huaja', 'administrim', 'gatim', 'shitje'],
    helpfulAssets: ['telefon_smart', 'automjet', 'rrjet_diaspore', 'rrjet_kontaktesh'],
    minHoursPerWeek: 15,
    regulated: true,
    regulationNotesSq: [
      'Shërbimet e kujdesit për persona, edhe kur janë jo-mjekësore, mund të kërkojnë licencë ose regjistrim të veçantë si ofrues shërbimesh sociale: Kërkon verifikim lokal para vizitës së parë me pagesë.',
      'Dëshmi penaliteti dhe referenca të verifikuara për çdo shoqërues; verifikoni nëse kërkohen kontrolle shtesë për punën me persona të cenueshëm.',
      'Marrëveshje me shkrim që liston detyrat e përfshira dhe ato të përjashtuara (asnjë detyrë mjekësore), rregullat për çelësat, kufijtë e parave për blerje dhe ruajtjen e faturave. Nëse i moshuari ka vështirësi në marrjen e vendimeve, verifikoni kush ka të drejtë ligjore të nënshkruajë në emër të tij.',
      'Informacioni për shëndetin dhe jetën e të moshuarit është i ndjeshëm: verifikoni rregullat e mbrojtjes së të dhënave dhe merrni pëlqimin e tij para se t’i dërgoni raporte familjes.',
      'Punësimi i shoqëruesve të tjerë kërkon kontrata dhe sigurime shoqërore sipas ligjit, jo punë informale; verifikoni detyrimet. Sigurimi i përgjegjësisë civile dhe protokolli për emergjencat (thirrja e numrit të urgjencës) duhen vendosur para nisjes.',
    ],
    licensedProfessionalsSq: [
      'Infermier/e ose mjek për çdo detyrë mjekësore (ilaçe, injeksione, plagë, matje që kërkojnë interpretim)',
      'Fizioterapist për ushtrime rehabilitimi ose zhvendosje të vështira',
      'Jurist për marrëveshjen e shërbimit, pëlqimin dhe trajtimin e të dhënave',
      'Kontabilist për faturimin e familjeve jashtë vendit dhe për pagat',
    ],
    adultOnly: true,
    zeroCapitalTestSq:
      'Përmes rrjetit tuaj personal dhe të diasporës, intervistoni 15 familje që kanë një prind të moshuar që jeton vetëm: si e organizuan javën e kaluar dhe sa paguajnë sot. Para vizitës së parë me pagesë, merrni dëshminë e penalitetit dhe verifikoni nëse ju duhet regjistrim ose licencë. Pastaj ofroni 2 javë provë me 2 vizita në javë me çmim të plotë për 2–3 familje, me marrëveshje të shkruar që përjashton detyrat mjekësore. Kostoja reale: dëshmia, transporti, telefoni dhe koha — jo zero, por e vogël.',
    revenueModelSq:
      'Paketë mujore me numër të caktuar vizitash (njësia = 1 vizitë 2–3-orëshe), e paguar paraprakisht nga familja çdo muaj; vizitat shtesë dhe shoqërimet e gjata (p.sh. një ditë e tërë kontrollesh në spital) faturohen veçmas.',
    pricing: {
      unitLabelSq: 'vizitë 2–3 orë',
      priceUSD: { low: 35, base: 55, high: 80 },
      variableCostUSD: { low: 3, base: 6, high: 10 },
      unitsPerCustomerPerMonth: 10,
      collectionDays: 5,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin transportin për vizitë dhe materiale të vogla; nuk përfshin kohën tuaj. Kur punësoni shoqërues të tjerë, paga e tyre për vizitë bëhet kosto kryesore (shpesh mbi gjysmën e çmimit) — ndryshojeni në model para se të zgjeroheni. “Klient” = një familje me rreth 10 vizita në muaj; supozim: një person mund të shërbejë me cilësi 4–6 familje. Familjet jashtë vendit fitojnë në një nivel tjetër çmimesh, por krahasojnë me ndihmën lokale; modeli e përshtat çmimin sipas nivelit lokal të çmimeve. Çmimet janë supozime fillestare në USD; pyetni familjet sa paguajnë sot për ndihmë në shtëpi.',
    },
    startupCosts: [
      {
        id: 'background-registration',
        labelSq: 'Dëshmi penaliteti, regjistrim aktiviteti dhe licencë, nëse kërkohet',
        category: 'tarifa',
        lowUSD: 30,
        highUSD: 500,
        noteSq:
          'Shumat ndryshojnë shumë: diku mjafton regjistrimi i biznesit, diku tjetër ofruesit e shërbimeve sociale licencohen veçmas. Merrni listën zyrtare nga regjistri zyrtar i bizneseve dhe nga autoriteti i shërbimeve sociale.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'first-aid-course',
        labelSq: 'Kurs ndihme të parë dhe trajnim bazë për shoqërimin e të moshuarve',
        category: 'tarifa',
        lowUSD: 60,
        highUSD: 400,
        noteSq:
          'Ndihma e parë ju ndihmon të reagoni dhe të thërrisni urgjencën në kohë; nuk ju lejon të kryeni detyra mjekësore. Kërkoni kurse të njohura zyrtarisht.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'service-agreement',
        labelSq: 'Marrëveshje shërbimi dhe formular pëlqimi nga jurist',
        category: 'hapje',
        lowUSD: 100,
        highUSD: 500,
        noteSq:
          'Përcakton detyrat, përjashtimet, çelësat, paratë dhe të dhënat; kërkoni çmim fiks dhe përdoreni për çdo familje.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'work-phone',
        labelSq: 'Telefon pune për raportet dhe videothirrjet',
        category: 'pajisje',
        lowUSD: 150,
        highUSD: 400,
        noteSq:
          'Nevojitet vetëm nëse nuk keni telefon inteligjent; mbani të ndara kontaktet dhe fotot e punës nga ato personale.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['telefon_smart'],
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: intervista, 2 javë provë dhe transport',
        category: 'testim_tregu',
        lowUSD: 30,
        highUSD: 150,
        noteSq:
          'Transport për vizitat provë dhe takimet me familjet që janë në vend; mbajeni të vogël derisa familjet të paguajnë muajin e parë.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'liability-insurance',
        labelSq: 'Sigurim i përgjegjësisë civile',
        category: 'sigurime',
        lowUSD: 25,
        highUSD: 120,
        noteSq:
          'Mbulon dëmet aksidentale gjatë vizitave; kërkoni oferta nga 2–3 sigurues dhe pyesni për aktivitetet e përjashtuara.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'local-transport',
        labelSq: 'Transport për vizitat dhe shoqërimet',
        category: 'transport',
        lowUSD: 40,
        highUSD: 150,
        noteSq: 'Varet nga distanca mes familjeve; grupimi i klientëve në 1–2 lagje e ul ndjeshëm këtë kosto.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'phone-internet',
        labelSq: 'Telefon dhe internet',
        category: 'sherbime_komunale',
        lowUSD: 15,
        highUSD: 40,
        noteSq:
          'Raportet dhe videothirrjet me familjet jashtë vendit kërkojnë internet të qëndrueshëm; krahasoni paketat lokale.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'accounting',
        labelSq: 'Kontabilist i jashtëm',
        category: 'kontabilitet',
        lowUSD: 25,
        highUSD: 100,
        noteSq:
          'Pagesat nga jashtë vendit dhe, më vonë, pagat e shoqëruesve kërkojnë kontabilitet të rregullt; kërkoni çmim fiks mujor.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'scheduling-tools',
        labelSq: 'Mjete për orarin dhe raportet',
        category: 'software',
        lowUSD: 0,
        highUSD: 30,
        noteSq: 'Në fillim mjafton një kalendar dhe mesazhet; mjetet me pagesë vlejnë kur keni disa shoqërues.',
        scalesWithPriceLevel: false,
        optional: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 0, monthlyNewCustomers: 0.3, monthlyChurnPct: 4 },
      baze: { startCustomers: 1, monthlyNewCustomers: 0.6, monthlyChurnPct: 3 },
      optimist: { startCustomers: 2, monthlyNewCustomers: 1, monthlyChurnPct: 3 },
    },
    seasonality: [1.1, 1.05, 1.0, 1.0, 1.0, 0.95, 0.9, 0.8, 1.0, 1.05, 1.05, 1.1],
    seasonalityNoteSq:
      'Nevoja për ndihmë rritet në dimër (të ftohtit, akulli, sëmundjet sezonale), ndërsa në verë — sidomos në gusht — shumë familje të diasporës vijnë vetë pranë prindërve dhe i pakësojnë vizitat. Vlerat janë supozim; ndryshimi më i madh vjen nga ndryshimet në shëndetin e të moshuarit, jo nga stina.',
    macroLinks: [
      {
        indicatorCode: 'population_65_plus_pct',
        direction: 'me_i_larte_mbeshtet',
        referenceValue: 14,
        mechanismSq:
          'Sa më e madhe pjesa e të moshuarve në popullsi, aq më shumë familje kanë nevojë për ndihmë të përditshme për prindërit. Niveli referues 14% është supozim i bibliotekës për një popullsi të plakur.',
        ifSupportsSq:
          'Pjesa e lartë e të moshuarve mbështet hipotezën e kërkesës; kontrolloni lagjet konkrete ku jetojnë.',
        ifContradictsSq:
          'Me popullsi të re, tregu është më i vogël; përqendrohuni te familjet e diasporës që kanë prindër në vend.',
      },
      {
        indicatorCode: 'remittances_gdp',
        direction: 'me_i_larte_mbeshtet',
        referenceValue: 5,
        mechanismSq:
          'Remitancat e larta tregojnë shumë familje me fëmijë jashtë vendit që dërgojnë para për prindërit — pikërisht klientët që paguajnë për ndihmë dhe raportim nga larg. Niveli referues 5% e PBB-së është supozim i bibliotekës.',
        ifSupportsSq: 'Sugjeron një segment familjesh që paguajnë nga jashtë; testojeni me rrjetin tuaj në diasporë.',
        ifContradictsSq:
          'Me remitanca të ulëta, pagesa duhet të vijë kryesisht nga familjet vendase, me buxhet më të kufizuar.',
      },
      {
        indicatorCode: 'labor_participation',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Kur më shumë të rritur punojnë jashtë shtëpisë, mbetet më pak kohë për kujdesin familjar ndaj prindërve, gjë që rrit nevojën për ndihmë me pagesë.',
        ifSupportsSq:
          'Pjesëmarrja e lartë në punë sugjeron familje me pak kohë të lirë — tregues i tërthortë, jo matje e kërkesës.',
        ifContradictsSq:
          'Me pjesëmarrje të ulët në punë, më shumë familjarë mund ta bëjnë vetë kujdesin; kërkesa vjen më shumë nga familjet jashtë vendit.',
      },
      {
        indicatorCode: 'population_growth',
        direction: 'renia_mbeshtet',
        mechanismSq:
          'Kur popullsia bie, shpesh për shkak të emigrimit të të rinjve, më shumë të moshuar mbeten vetëm në vend ndërsa fëmijët jetojnë larg.',
        ifSupportsSq:
          'Rënia e popullsisë mbështet hipotezën se ka më shumë të moshuar pa familjarë pranë — kjo nuk e mat drejtpërdrejt kërkesën.',
        ifContradictsSq:
          'Me popullsi në rritje, familjet kanë më shumë gjasa të jenë pranë prindërve; kërkesa duhet testuar më me kujdes.',
      },
    ],
    whyItCouldWork: {
      changeSq: 'Popullsia po plaket dhe shumë fëmijë jetojnë jashtë vendit ose në qytete të tjera, larg prindërve.',
      problemSq:
        'Të moshuarit mbeten vetëm dhe kanë vështirësi me blerjet dhe takimet, ndërsa familja nuk e di çfarë ndodh realisht.',
      customerSq:
        'Fëmijët e të moshuarve, shpesh në diasporë, që kanë mundësi të paguajnë, por jo kohë apo mundësi për të qenë pranë.',
      offerSq: 'Një shoqërues i verifikuar, i njëjti çdo herë, me vizita të rregullta dhe raport të shkurtër pas çdo vizite.',
      reasonToPaySq: 'Qetësi për familjen, më pak vetmi për të moshuarin dhe një person i besueshëm për punët e përditshme.',
      profitConditionsSq:
        'Fitimi kërkon familje të grupuara në pak lagje, pagesë paraprake mujore, marrëdhënie afatgjata dhe, për t’u zgjeruar, shoqërues të punësuar ligjërisht me pagë që lë marzh pas transportit dhe sigurimit.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq:
          'Familjet e pranojnë nevojën, por preferojnë fqinjin ose një të afërm, ose presin derisa situata të bëhet urgjente.',
      },
      {
        kind: 'cmim',
        textSq:
          'Familjet krahasojnë me ndihmën informale të paguar në dorë dhe nuk pranojnë çmimin që mbulon kontratën, sigurimin dhe transportin.',
      },
      {
        kind: 'konkurrence',
        textSq:
          'Shoqërues të pavarur pa regjistrim ofrojnë çmime shumë të ulëta, ndërsa agjencitë e kujdesit ofrojnë edhe shërbime mjekësore në një paketë.',
      },
      {
        kind: 'kosto',
        textSq: 'Transporti dhe kohët e pritjes te mjeku i zgjasin vizitat dhe ulin të ardhurat për orë.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Mungesa e licencës së kërkuar, ose kryerja e një detyre mjekësore pa kualifikim, e rrezikon të moshuarin dhe sjell gjoba e humbje besimi.',
      },
      {
        kind: 'operacionale',
        textSq:
          'Sëmundja ose largimi i shoqëruesit e prish vazhdimësinë, ndërsa të moshuarit i duhet i njëjti person.',
      },
      {
        kind: 'aftesi',
        textSq:
          'Pa durim, komunikim të mirë dhe njohuri bazë për moshën e tretë, marrëdhënia me të moshuarin ose me familjen prishet shpejt.',
      },
    ],
    falsifiersSq: [
      'Nga 15 familje të intervistuara, më pak se 4 paguajnë sot për ndonjë ndihmë ose kanë kërkuar aktivisht dikë gjatë vitit të fundit.',
      'Pas 10 ofertave konkrete me çmim, më pak se 2 familje paguajnë muajin e parë.',
      'Çmimi që pranojnë familjet për vizitë është më i ulët se pagesa e një shoqëruesi të punësuar ligjërisht plus transporti.',
    ],
    differentiationSq: [
      'I njëjti shoqërues për çdo familje, i verifikuar me dëshmi penaliteti dhe referenca.',
      'Raport i shkurtër me shkrim pas çdo vizite, në gjuhën që preferon familja jashtë vendit.',
      'Marrëveshje e qartë që i ndan detyrat jo-mjekësore nga ato mjekësore, me kontaktin e infermierit ose të mjekut të familjes gati.',
    ],
    competitorTypesSq: [
      'Fqinjë dhe të afërm që ndihmojnë herë pas here',
      'Ndihmë informale e paguar në dorë, pa marrëveshje',
      'Agjenci kujdesi shëndetësor në shtëpi me infermierë',
      'Shtëpi pleqsh dhe qendra ditore',
    ],
    cheapestTestSq:
      'Intervista me 15 familje dhe 2 javë provë me pagesë të plotë për 2–3 familje, me marrëveshje të shkruar. Matni sa familje vazhdojnë me paketë mujore dhe sa zgjat realisht çdo vizitë, përfshirë transportin.',
    interviewQuestionsSq: [
      'Kush e ndihmoi prindin tuaj javën e kaluar me blerjet ose me vajtjen te mjeku?',
      'Kur ishte hera e fundit që u shqetësuat sepse nuk dinit si ishte prindi juaj, dhe çfarë bëtë?',
      'Sa paguani sot, në para ose në favore, për ndihmën që merr prindi juaj?',
      'Si e mësoni sot çfarë ka ndodhur gjatë javës te prindi juaj?',
      'Çfarë keni provuar më parë (fqinj, ndihmë e paguar, agjenci) dhe pse e ndërprenë?',
      'Kush tjetër në familje merr pjesë në vendimin për ndihmë në shtëpi?',
      'Çfarë ka thënë vetë prindi juaj për ndihmën nga dikush jashtë familjes?',
    ],
    firstCustomers: {
      whereSq: [
        'Rrjeti juaj personal dhe familjar, sidomos familjet me fëmijë jashtë vendit',
        'Komunitete të diasporës, para pushimeve verore dhe festave',
        'Mjekë familjeje, farmacistë dhe qendra komunitare që njohin të moshuar që jetojnë vetëm (vetëm rekomandime me pëlqimin e familjes)',
        'Qendra ditore ose shoqata të moshës së tretë',
      ],
      howToContactSq: [
        'Bisedë e drejtpërdrejtë me familjet e rekomanduara, pa presion dhe pa luajtur me frikën e tyre',
        'Prezantim në grupet e diasporës ku jeni anëtar, një herë dhe sipas rregullave të grupit, pa mesazhe masive',
        'Fletë informuese te mjekët dhe në farmaci vetëm me lejen e tyre',
      ],
      offerSq:
        '2 javë provë me çmim të plotë dhe marrëveshje të shkruar; pastaj paketë mujore e paguar paraprakisht, me ndërprerje me njoftim 2-javor.',
      followUpSq:
        'Pas javës së parë, një videothirrje me familjen dhe një bisedë me të moshuarin për si u ndje; regjistroni çdo kontakt dhe mos e ndiqni më familjen pas një rikujtese pa përgjigje.',
      metricsSq: [
        'Biseda → familje në provë (%)',
        'Familje në provë → paketë mujore (%)',
        'Kohëzgjatja reale e vizitave dhe e transportit',
        'Familje që vazhdojnë pas 3 muajsh (%)',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje [emri], jam [emri juaj] nga [qyteti]. Ofroj shoqërim dhe ndihmë jo-mjekësore për të moshuar: vizita të rregullta, blerje, shoqërim te mjeku dhe një raport i shkurtër për ju pas çdo vizite. Kam dëshmi penaliteti dhe referenca. A mund të flasim 15 minuta se si e organizoni sot ndihmën për [emri i prindit]?',
    offerTemplateSq:
      'Oferta për familjen [mbiemri]: (1) [numri] vizita në javë nga [orë] orë, me të njëjtin shoqërues; (2) blerje dhe porosi të vogla me fatura, deri në [shuma] për vizitë; (3) shoqërim te mjeku ose në zyra sipas kërkesës; (4) raport i shkurtër pas çdo vizite përmes [kanali]; (5) çmimi [çmimi] në muaj, i paguar paraprakisht. Nuk kryejmë detyra mjekësore (ilaçe, injeksione, plagë); për to rekomandojmë infermier ose mjek. Ndërprerje me njoftim 2-javor. Premtojmë vizita në kohë dhe informim të sinqertë, jo zgjidhje të problemeve shëndetësore.',
    feedbackQuestionsSq: [
      'Çfarë i pëlqeu dhe çfarë nuk i pëlqeu prindit tuaj në vizitat e kësaj jave?',
      'Sa ju ndihmuan raportet për të kuptuar si shkoi java?',
      'Çfarë duhet ndryshuar në oraret ose në detyrat e vizitave?',
    ],
    goCriteriaSq: [
      'Të paktën 2 nga 3 familjet në provë vazhdojnë me paketë mujore të paguar paraprakisht.',
      'Me 4–6 familje, të ardhurat mujore mbulojnë transportin, sigurimin dhe nevojën tuaj për të ardhura.',
      'Regjistrimi ose licenca e nevojshme është konfirmuar me shkrim.',
    ],
    killCriteriaSq: [
      'Pas 25 bisedave dhe 10 ofertave, më pak se 2 familje paguajnë muajin e parë.',
      'Rregullat lokale kërkojnë licencë ose staf të kualifikuar që nuk përballohet me më pak se 10 familje.',
      'Mbi gjysma e familjeve e ndërpresin shërbimin brenda 3 muajve për arsye çmimi ose besimi.',
    ],
    phaseNotesSq: {
      p10_20: ['Intervistoni 15 familje për javën e kaluar të prindit: kush ndihmoi, sa kushtoi dhe si u informuan.'],
      p40_50: [
        'Verifikoni nëse shërbimi kërkon licencë si ofrues shërbimesh sociale; merrni dëshminë e penalitetit dhe porositni marrëveshjen te një jurist.',
      ],
      p50_60: ['Shkruani protokollin për emergjencat, çelësat dhe paratë, si dhe listën e detyrave të përjashtuara.'],
      p60_70: ['Dy javë provë me 2–3 familje; matni kohëzgjatjen reale të vizitave dhe të transportit.'],
      p90_100: [
        'Para se të punësoni shoqërues të tjerë, llogaritni pagën ligjore dhe sigurimet për vizitë dhe kontrolloni nëse marzhi mbetet.',
      ],
    },
    assumptionsSq: [
      'Një person mund të shërbejë 4–6 familje me 2–3 vizita në javë secila.',
      'Familjet paguajnë paraprakisht çdo muaj, shpesh me transfertë nga jashtë vendit.',
      'Marrëdhëniet janë afatgjata; largimet vijnë kryesisht nga ndryshimet në shëndetin e të moshuarit.',
      'Interesi verbal nuk është provë; vetëm pagesa e muajit të parë pas provës e konfirmon kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 6. Import & distribution of farm-machinery spare parts — team, premises, high capital, customs
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'shperndarje-pjesesh-kembimi-per-makineri-bujqesore',
    nameSq: 'Import dhe shpërndarje pjesësh këmbimi për makineri bujqësore',
    taglineSq:
      'Pjesët që prishen më shpesh, në stok pranë fermerëve — me identifikim të saktë të kodit dhe dërgesë brenda 24–48 orëve.',
    descriptionSq:
      'Biznes tregtar që importon nga prodhues dhe shpërndarës të huaj pjesët e këmbimit dhe materialet konsumuese që prishen më shpesh te traktorët dhe makineritë bujqësore — filtra, rripa, kushineta, thika kositëseje, tuba hidraulikë dhe rakorderi, guarnicione, drita — dhe i mban në stok në një magazinë në zonë bujqësore. Klientët kryesorë janë servisët dhe mekanikët e makinerive, kooperativat dhe fermerët me disa makineri. Vlera vjen nga disponueshmëria në kohë dhe nga identifikimi i saktë i pjesës. Kërkon njohuri teknike për modelet, procedura doganore, financim të inventarit dhe një ekip (magazinë, shitje në terren, administratë dhe doganë).',
    sector: 'tregti',
    offerSq:
      'Stok i pjesëve që konsumohen më shpesh për modelet e traktorëve dhe makinerive më të përhapura në zonë; identifikim i pjesës me kodin origjinal ose ekuivalent dhe me foto, me shënim të qartë nëse pjesa është origjinale apo ekuivalente; porosi me telefon ose mesazh; marrje në magazinë ose dërgesë brenda 24–48 orëve në zonë; porosi speciale nga furnitori i huaj për pjesët jashtë stokut, me afat të shkruar; faturë me kushte pagese për servise të rregullta dhe kthim i pjesëve të gabuara sipas rregullave të shkruara.',
    payingCustomerSq:
      'Servise dhe mekanikë makinerish bujqësore, kooperativa dhe fermerë me disa makineri, që blejnë pjesë gjatë gjithë vitit dhe sidomos para sezoneve të punës.',
    customerSegments: ['b2b'],
    problemSq:
      'Kur një makineri prishet në mes të sezonit të mbjelljes ose të korrjes, çdo ditë pritjeje për pjesën kushton punë dhe prodhim të humbur; servisët dhe fermerët udhëtojnë larg, blejnë pjesë të gabuara sepse kodi nuk identifikohet saktë, ose presin javë për një porosi nga jashtë.',
    modes: ['fizik', 'kombinuar'],
    marketScopes: ['lokal', 'nderkombetar'],
    canStartFromHome: false,
    minTeam: 'ekip',
    requiredSkills: ['import_eksport', 'mekanike', 'shitje'],
    helpfulSkills: ['logjistike', 'kontabilitet', 'gjuhe_te_huaja', 'drejtim_mjeti', 'administrim', 'bujqesi'],
    helpfulAssets: ['magazine', 'furgon', 'rrjet_kontaktesh', 'kompjuter', 'internet_i_qendrueshem'],
    minHoursPerWeek: 45,
    regulated: true,
    regulationNotesSq: [
      'Regjistrimi si importues, numri identifikues për doganën dhe klasifikimi tarifor i çdo lloji pjese (që përcakton detyrimet doganore dhe TVSH-në në import): Kërkon verifikim lokal me një agjent doganor para porosisë së parë.',
      'Certifikatat e origjinës dhe marrëveshjet tregtare mund t’i ulin detyrimet; verifikoni çfarë dokumentesh duhet të japë furnitori dhe nëse vlejnë për vendin tuaj.',
      'Markat tregtare: shitja e pjesëve ekuivalente si “origjinale”, ose e pjesëve të falsifikuara, është e paligjshme dhe e rrezikshme. Përshkruajini me saktësi dhe verifikoni rregullat për përdorimin e emrave dhe të kodeve të prodhuesve.',
      'Pjesët që lidhen me sigurinë (frenat, drejtimi, lidhja e rimorkios, dritat për qarkullim në rrugë) mund të kenë kërkesa konformiteti; garancia dhe kthimet ndaj klientëve biznes duhet të jenë të shkruara — verifikoni detyrimet.',
      'Magazina: leja e përdorimit të ambientit dhe rregullat e sigurisë nga zjarri, sidomos nëse mbani vajra dhe lubrifikantë; punësimi i stafit me kontrata dhe sigurime sipas ligjit. Kërkon verifikim lokal.',
    ],
    licensedProfessionalsSq: [
      'Agjent doganor i licencuar për deklaratat e importit dhe klasifikimin tarifor',
      'Kontabilist për TVSH-në në import, inventarin dhe pagat',
      'Jurist për kontratat me furnitorët e huaj dhe çështjet e markave tregtare',
      'Specialist i sigurisë nga zjarri për magazinimin e vajrave dhe lubrifikantëve, kur kërkohet',
    ],
    adultOnly: true,
    zeroCapitalTestSq:
      'Inventari nuk mund të mbahet pa kapital, prandaj testi i parë bëhet pa stok: intervistoni 15 servise dhe 10 fermerë për prishjen e fundit; ndërtoni listën e 30 pjesëve dhe modeleve më të kërkuara; merrni oferta nga 2–3 furnitorë të huaj bashkë me transportin dhe një vlerësim të detyrimeve nga një agjent doganor. Pastaj, pasi të jeni regjistruar, mblidhni porosi me parapagim për 10–20 pjesë konkrete dhe bëni një dërgesë të parë të vogël. Kostoja reale: telefoni, udhëtimet, konsulta e agjentit doganor dhe vetë dërgesa e parë — jo zero.',
    revenueModelSq:
      'Marzh mbi koston e mbërritur të pjesës (çmimi i blerjes + transporti + detyrimet doganore + taksat që nuk rimbursohen) për çdo shitje; njësia në model = 1 porosi mesatare pjesësh. Servisët e rregullt blejnë disa herë në muaj me faturë; fermerët zakonisht paguajnë në vend.',
    pricing: {
      unitLabelSq: 'porosi mesatare pjesësh',
      priceUSD: { low: 60, base: 90, high: 140 },
      variableCostUSD: { low: 39, base: 58, high: 90 },
      unitsPerCustomerPerMonth: 5,
      collectionDays: 45,
      supplierPaymentDays: 0,
      priceScalesWithPriceLevel: false,
      noteSq:
        'Kostoja variabël është kostoja e mbërritur e pjesëve të shitura (blerja, transporti ndërkombëtar, dogana, paketimi) plus dërgesa lokale; nuk përfshin pagat dhe qiranë. “Klient” = një servis ose fermer aktiv me rreth 5 porosi në muaj. Furnitorët e huaj zakonisht kërkojnë parapagim, ndërsa servisët paguajnë pas 30–60 ditësh — kjo kërkon kapital qarkullues të konsiderueshëm. Kujdes: pjesët janë mall me çmim ndërkombëtar; nëse modeli e ul çmimin e shitjes sipas nivelit lokal të çmimeve, ndërsa kostoja e pjesëve mbetet e njëjtë, marzhi del më i ngushtë se në realitet — korrigjojeni me çmimet reale të tregut lokal. Çmimet janë supozime në USD; verifikoni çmimet te shitësit ekzistues dhe në ofertat e furnitorëve.',
    },
    startupCosts: [
      {
        id: 'initial-inventory',
        labelSq: 'Stoku fillestar i pjesëve (rreth 200–400 kode me qarkullim të shpejtë)',
        category: 'inventar',
        lowUSD: 15000,
        highUSD: 45000,
        noteSq:
          'Zëri më i madh; varet nga numri i modeleve dhe i kodeve. Nisni vetëm me pjesët që dalin më shpesh në intervista dhe në porositë me parapagim, dhe kërkoni oferta nga 2–3 furnitorë me kushtet e kthimit. Stoku fillestar mbetet në magazinë si aset: çdo pjesë e shitur zëvendësohet me një blerje të re (kostoja variabël), kështu që kapitali i lidhur në stok nuk numërohet dy herë.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'customs-first-shipments',
        labelSq: 'Detyrime doganore, TVSH në import dhe agjent doganor për dërgesat e para',
        category: 'tarifa',
        lowUSD: 1500,
        highUSD: 6000,
        noteSq:
          'Varet nga klasifikimi tarifor, origjina dhe vlera e mallit; merrni vlerësim me shkrim nga një agjent doganor para porosisë. Një pjesë e TVSH-së mund të zbritet më vonë — verifikojeni me kontabilistin.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'warehouse-shelving',
        labelSq: 'Rafte magazine, etiketa, peshore dhe sistem kodimi',
        category: 'pajisje',
        lowUSD: 1500,
        highUSD: 5000,
        noteSq:
          'Një sistem i qartë kodimi e ul kohën e kërkimit dhe gabimet në dërgesa; krahasoni oferta për rafte të reja dhe të përdorura.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'warehouse-deposit',
        labelSq: 'Depozita e qirasë së magazinës',
        category: 'depozita',
        lowUSD: 800,
        highUSD: 3000,
        noteSq:
          'Shpesh 1–3 muaj qira; verifikoni që ambienti lejon magazinim tregtar dhe plotëson rregullat e sigurisë nga zjarri para se të nënshkruani.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['magazine'],
      },
      {
        id: 'delivery-van',
        labelSq: 'Furgon i përdorur për dërgesat lokale',
        category: 'pajisje',
        lowUSD: 6000,
        highUSD: 15000,
        noteSq:
          'Nevojitet vetëm nëse nuk keni furgon; kërkoni kontroll teknik nga një mekanik i pavarur dhe krahasoni koston e sigurimit për përdorim tregtar.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['furgon'],
      },
      {
        id: 'inventory-system',
        labelSq: 'Program inventari dhe faturimi, kompjuter dhe printer etiketash',
        category: 'pajisje',
        lowUSD: 600,
        highUSD: 2500,
        noteSq:
          'Pa një program inventari, kodet dhe sasitë humbasin shpejt; zgjidhni një sistem që lidh kodet origjinale me ato ekuivalente dhe nxjerr fatura.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'registration-legal',
        labelSq: 'Regjistrim biznesi, regjistrim si importues dhe konsulta ligjore',
        category: 'tarifa',
        lowUSD: 300,
        highUSD: 1500,
        noteSq:
          'Merrni listën zyrtare nga regjistri zyrtar i bizneseve dhe nga dogana; një jurist duhet të shohë kontratat me furnitorët e huaj.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: udhëtime te servisët, mostra pjesësh dhe dërgesa e parë e vogël',
        category: 'testim_tregu',
        lowUSD: 500,
        highUSD: 2000,
        noteSq:
          'Përfshin udhëtimet për intervistat, disa mostra për të kontrolluar cilësinë dhe një dërgesë të vogël vetëm për porositë me parapagim.',
        scalesWithPriceLevel: false,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'warehouse-rent',
        labelSq: 'Qira e magazinës me pikë shitjeje',
        category: 'qira',
        lowUSD: 400,
        highUSD: 1500,
        noteSq:
          'Varet nga madhësia dhe zona; një vend pranë rrugëve kryesore të zonës bujqësore e shkurton kohën e dërgesave. Kërkoni 3 oferta.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['magazine'],
      },
      {
        id: 'staff-wages',
        labelSq: 'Paga për 2 punonjës (magazinier dhe shitës/administratë)',
        category: 'paga',
        lowUSD: 2500,
        highUSD: 5500,
        noteSq:
          'Supozim për dy persona me kohë të plotë përveç pronarit, përfshirë kontributet e detyrueshme. Verifikoni pagat dhe kostot e punësimit lokalisht.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'utilities',
        labelSq: 'Energji, ujë, internet dhe telefon',
        category: 'sherbime_komunale',
        lowUSD: 100,
        highUSD: 300,
        noteSq: 'Kërkoni nga pronari i magazinës faturat e muajve të kaluar para se të nënshkruani.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'van-running',
        labelSq: 'Karburant dhe mirëmbajtje e furgonit',
        category: 'transport',
        lowUSD: 200,
        highUSD: 600,
        noteSq:
          'Varet nga rrezja e dërgesave; rrugët e planifikuara sipas ditëve dhe zonave e ulin ndjeshëm koston.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'insurance',
        labelSq: 'Sigurim i inventarit, magazinës dhe përgjegjësisë',
        category: 'sigurime',
        lowUSD: 80,
        highUSD: 300,
        noteSq:
          'Vlera e stokut e përcakton primin; kërkoni oferta nga 2–3 sigurues për zjarr, vjedhje dhe përgjegjësi ndaj klientëve.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'accounting',
        labelSq: 'Kontabilist (TVSH, inventar, paga)',
        category: 'kontabilitet',
        lowUSD: 150,
        highUSD: 400,
        noteSq:
          'Importi, inventari dhe pagat kërkojnë kontabilitet profesional; kërkoni çmim fiks mujor dhe pyesni për përvojën me importuesit.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'software-catalogues',
        labelSq: 'Abonime për programin e inventarit dhe katalogët teknikë',
        category: 'software',
        lowUSD: 30,
        highUSD: 200,
        noteSq:
          'Katalogët me kode dhe skema të pjesëve e ulin rrezikun e pjesëve të gabuara; disa furnitorë i japin falas për klientët e tyre.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'field-marketing',
        labelSq: 'Vizita në terren, katalogë të printuar dhe panaire bujqësore',
        category: 'marketing',
        lowUSD: 100,
        highUSD: 400,
        noteSq:
          'Shitja te servisët bëhet kryesisht me vizita personale; mos shpenzoni për reklama të mëdha para se të keni klientë të rregullt.',
        scalesWithPriceLevel: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 5, monthlyNewCustomers: 3, monthlyChurnPct: 3 },
      baze: { startCustomers: 10, monthlyNewCustomers: 5, monthlyChurnPct: 2.5 },
      optimist: { startCustomers: 15, monthlyNewCustomers: 8, monthlyChurnPct: 2 },
    },
    seasonality: [0.6, 0.75, 1.2, 1.3, 1.25, 1.3, 1.2, 0.95, 1.1, 1.05, 0.7, 0.6],
    seasonalityNoteSq:
      'Kërkesa ndjek kalendarin bujqësor: rritet para dhe gjatë mbjelljeve të pranverës, korrjes verore dhe punimeve të vjeshtës, dhe bie në dimër, kur servisët bëjnë riparime të mëdha me porosi të planifikuara. Vlerat janë supozim; kulturat dhe klima e zonës e ndryshojnë kalendarin. Stoku duhet blerë 1–3 muaj para kulmeve, gjë që e rrit nevojën për kapital qarkullues.',
    macroLinks: [
      {
        indicatorCode: 'agriculture_va_gdp',
        direction: 'me_i_larte_mbeshtet',
        referenceValue: 10,
        mechanismSq:
          'Sa më e madhe pesha e bujqësisë në ekonomi, aq më shumë makineri punojnë dhe prishen, pra aq më e madhe kërkesa për pjesë këmbimi. Niveli referues 10% e PBB-së është supozim i bibliotekës.',
        ifSupportsSq:
          'Bujqësia me peshë të madhe sugjeron një treg të mjaftueshëm; numëroni servisët dhe makineritë në rajonin tuaj.',
        ifContradictsSq:
          'Me bujqësi të vogël, tregu mund të jetë shumë i ngushtë për një magazinë të specializuar; konsideroni t’i kombinoni pjesët bujqësore me ato të makinerive të tjera.',
      },
      {
        indicatorCode: 'exchange_rate_lcu_usd',
        direction: 'renia_mbeshtet',
        mechanismSq:
          'Pjesët blihen jashtë në monedhë të huaj; kur monedha vendase forcohet (më pak njësi vendase për 1 USD), kostoja e mbërritur ulet dhe marzhi përmirësohet. Nëse furnitorët faturojnë në një monedhë tjetër, kursi përkatës ka më shumë rëndësi.',
        ifSupportsSq:
          'Forcimi i monedhës vendase ul koston e importit; mos i ulni çmimet menjëherë, mbani rezervë për lëvizjet e kundërta.',
        ifContradictsSq:
          'Dobësimi i monedhës vendase e shtrenjton çdo dërgesë; shkruani në ofertat për servisët rishikim çmimi sipas kursit dhe mos mbani stok të madh me çmim të fiksuar.',
      },
      {
        indicatorCode: 'lending_rate',
        direction: 'me_i_ulet_mbeshtet',
        mechanismSq:
          'Inventari financohet shpesh me kredi, dhe fermerët blejnë makineri me kredi; normat e ulëta e ulin koston e mbajtjes së stokut dhe e lehtësojnë mekanizimin e fermave.',
        ifSupportsSq: 'Normat e ulëta e bëjnë më të përballueshëm financimin e stokut fillestar.',
        ifContradictsSq:
          'Me norma të larta, kostoja e financimit të stokut rritet; mbani më pak kode dhe kërkoni kushte pagese më të mira nga furnitorët.',
      },
      {
        indicatorCode: 'inflation_cpi',
        direction: 'me_i_ulet_mbeshtet',
        referenceValue: 5,
        mechanismSq:
          'Me inflacion të lartë, kostoja e zëvendësimit të stokut rritet më shpejt se çmimet e listuara dhe faturat e paguara me vonesë humbasin vlerë. Niveli referues 5% është supozim i bibliotekës.',
        ifSupportsSq: 'Inflacioni i ulët e bën më të parashikueshme listën e çmimeve.',
        ifContradictsSq: 'Me inflacion të lartë, përditësoni çmimet shpesh dhe shkurtoni afatet e pagesës për servisët.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Makineritë bujqësore po plaken dhe më shumë ferma po mekanizohen, ndërsa riparimet bëhen gjithnjë e më shumë me pjesë të importuara.',
      problemSq: 'Pjesët e nevojshme nuk gjenden afër dhe në kohë; çdo ditë pritjeje në sezon kushton prodhim.',
      customerSq: 'Servisët e makinerive bujqësore dhe fermerët me disa makineri në një rajon bujqësor.',
      offerSq:
        'Pjesët më të kërkuara në stok, të identifikuara saktë, me dërgesë brenda 24–48 orëve dhe porosi speciale me afat të shkruar.',
      reasonToPaySq:
        'Kursim kohe dhe më pak ditë me makineri të ndalur; më pak pjesë të gabuara dhe më pak udhëtime të gjata.',
      profitConditionsSq:
        'Fitimi kërkon stok të kufizuar te kodet që qarkullojnë shpejt, marzh që mbulon doganat dhe transportin, arkëtim të disiplinuar nga servisët dhe kapital qarkullues të mjaftueshëm për blerjet para sezonit.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq: 'Servisët blejnë rregullisht vetëm disa kode, ndërsa pjesa tjetër e stokut qëndron në rafte për vite.',
      },
      {
        kind: 'cmim',
        textSq:
          'Servisët krahasojnë me shitësit online dhe me importuesit e mëdhenj dhe nuk pranojnë marzhin që mbulon doganat, transportin dhe magazinën.',
      },
      {
        kind: 'konkurrence',
        textSq: 'Përfaqësuesit zyrtarë të markave dhe importuesit e mëdhenj ulin çmimet ose ofrojnë afate më të gjata pagese.',
      },
      {
        kind: 'kosto',
        textSq:
          'Qiraja, pagat dhe kostoja e financimit të stokut rriten më shpejt se shitjet, sidomos në muajt e dimrit.',
      },
      {
        kind: 'vonesa_pagesash',
        textSq:
          'Servisët paguajnë pas 60–90 ditësh, ndërsa furnitorët kërkojnë parapagim — paraja mbaron edhe kur ka shitje.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Gabimet në klasifikimin doganor ose pjesët që shkelin markat tregtare sjellin gjoba, sekuestrim ose humbje besimi.',
      },
      {
        kind: 'operacionale',
        textSq:
          'Pjesë të gabuara, kthime të shpeshta dhe vonesa në transportin ndërkombëtar e dëmtojnë reputacionin në sezon.',
      },
    ],
    falsifiersSq: [
      'Nga 15 servise të intervistuara, më pak se 5 blejnë pjesë të paktën një herë në javë.',
      'Lista e pjesëve të kërkuara nuk përputhet: më pak se 10 kode përmenden nga të paktën 3 servise të ndryshme.',
      'Kostoja e mbërritur e pjesëve më të kërkuara (me dogana dhe transport) është mbi 75% e çmimit me të cilin shiten sot në zonë.',
      'Nga klientët e porosive të para me parapagim, më pak se 10 blejnë sërish brenda 2 muajve.',
    ],
    differentiationSq: [
      'Identifikim i saktë i pjesës me kod dhe foto, me shënim të qartë nëse është origjinale apo ekuivalente.',
      'Stok i fokusuar te modelet më të përhapura në rajon dhe dërgesë brenda 24–48 orëve në sezon.',
      'Afate të shkruara për porositë speciale dhe rregulla të qarta kthimi për pjesët e gabuara.',
    ],
    competitorTypesSq: [
      'Përfaqësues zyrtarë të markave të makinerive',
      'Importues të mëdhenj pjesësh me magazina në qytetet kryesore',
      'Shitës online ndërkombëtarë me dërgesë të gjatë',
      'Servise që i importojnë vetë pjesët për klientët e tyre',
      'Pjesë të përdorura nga makineri të çmontuara',
    ],
    cheapestTestSq:
      'Intervista me 15 servise dhe 10 fermerë, lista e 30 kodeve më të kërkuara dhe oferta nga 2–3 furnitorë me vlerësim doganor. Synimi: porosi me parapagim për 10–20 pjesë konkrete para dërgesës së parë. Matni sa blejnë sërish, jo sa thonë se kanë nevojë.',
    interviewQuestionsSq: [
      'Cila ishte pjesa e fundit që ju duhej urgjentisht dhe sa ditë pritët për ta gjetur?',
      'Ku i blini sot pjesët për makineritë më të zakonshme dhe pse aty?',
      'Sa shpenzuat për pjesë këmbimi muajin e kaluar, sipas faturave tuaja?',
      'Kur ishte hera e fundit që morët një pjesë të gabuar dhe çfarë ndodhi më pas?',
      'Cilat modele traktorësh dhe makinerish keni riparuar më shpesh këtë vit?',
      'Me çfarë afati pagese punoni sot me furnitorët tuaj të pjesëve?',
      'Kush vendos te ju se nga cili furnitor blihet një pjesë?',
    ],
    firstCustomers: {
      whereSq: [
        'Servise dhe punishte makinerish bujqësore në rajon',
        'Kooperativa bujqësore dhe ferma të mëdha me disa makineri',
        'Panaire dhe tregje bujqësore',
        'Dyqane inputesh bujqësore që nuk shesin pjesë këmbimi',
      ],
      howToContactSq: [
        'Vizitë personale në servise me listën e kodeve në stok dhe çmimet',
        'Telefonatë te kontaktet profesionale ekzistuese, pa mesazhe masive ose lista të blera',
        'Prezantim në takimet e kooperativave dhe të shoqatave të fermerëve',
      ],
      offerSq:
        'Porosia e parë me çmim të listuar dhe pagesë në dorëzim; pas 3 porosive, mundësi faturimi me afat 30-ditor për servise të rregullta.',
      followUpSq:
        'Pas çdo dërgese, një telefonatë e shkurtër për të konfirmuar që pjesa ishte e saktë; regjistroni çdo kërkesë që nuk e plotësuat, për të përmirësuar stokun.',
      metricsSq: [
        'Servise aktive në muaj dhe porosi për servis',
        'Kërkesa të paplotësuara nga stoku (%)',
        'Kthime për pjesë të gabuara (%)',
        'Ditë mesatare arkëtimi dhe qarkullimi i stokut',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje, jam [emri] nga [emri i biznesit]. Mbajmë në stok në [vendi] pjesët që prishen më shpesh për [modelet], me dërgesë brenda [orë] orëve në zonë. Çdo pjesë identifikohet me kod dhe foto dhe shënohet qartë nëse është origjinale apo ekuivalente. A mund t’ju lë listën dhe t’ju pyes cila ishte pjesa e fundit që e prisnit gjatë?',
    offerTemplateSq:
      'Oferta për [emri i servisit]: (1) lista e pjesëve në stok për [modelet] me çmimet aktuale; (2) dërgesë brenda [orë] orëve në [zona] për porositë deri në [ora]; (3) porosi speciale nga furnitori brenda [ditë] ditëve, me parapagim [përqindja]%; (4) kthim i pjesëve të gabuara brenda [ditë] ditëve, të papërdorura dhe në paketimin origjinal; (5) pagesë në dorëzim, ose me faturë [ditë]-ditore pas 3 porosive. Çmimet mund të ndryshojnë me kursin e këmbimit; çdo ndryshim njoftohet paraprakisht.',
    feedbackQuestionsSq: [
      'Cila pjesë që kërkuat këtë muaj nuk ishte në stok?',
      'Si ishte koha e dërgesës krahasuar me furnitorin tuaj të zakonshëm?',
      'Çfarë duhet të ndryshojë që të blini më shumë te ne?',
    ],
    goCriteriaSq: [
      'Të paktën 15 servise ose fermerë blejnë sërish brenda 2 muajve nga dërgesa e parë.',
      'Marzhi bruto mesatar mbetet mbi 30% pas doganave dhe transportit, dhe stoku qarkullon të paktën 3 herë në vit.',
      'Arkëtimi mesatar nga servisët mbetet nën 60 ditë.',
    ],
    killCriteriaSq: [
      'Pas intervistave me 15 servise, më pak se 10 kode kërkohen rregullisht nga disa klientë.',
      'Kostoja e mbërritur e lë marzhin bruto nën 20% me çmimet që pranon tregu.',
      'Pas 6 muajsh, mbi 40% e stokut nuk ka lëvizur dhe arkëtimi kalon 90 ditë.',
    ],
    phaseNotesSq: {
      p10_20: [
        'Intervistoni 15 servise dhe 10 fermerë; shënoni modelet, pjesët dhe kohët e pritjes për 3 prishjet e fundit.',
      ],
      p20_30: ['Hartoni hartën e alternativave: kush shet çfarë kodesh, me çfarë afati dhe kushtesh pagese.'],
      p30_40: [
        'Llogaritni koston e mbërritur për 30 kodet kryesore me oferta reale dhe vlerësim doganor me shkrim.',
      ],
      p40_50: [
        'Regjistrohuni si importues dhe verifikoni me agjentin doganor klasifikimin tarifor dhe dokumentet e origjinës.',
      ],
      p50_60: [
        'Zgjidhni 2 furnitorë me kushte kthimi dhe afate dorëzimi të shkruara; vendosni sistemin e kodimit në magazinë.',
      ],
      p80_90: [
        'Rishikoni çdo muaj kodet pa lëvizje dhe kërkesat e paplotësuara; rregulloni stokun para çdo sezoni.',
      ],
    },
    assumptionsSq: [
      'Një stok prej 200–400 kodesh mbulon shumicën e kërkesave të zakonshme për modelet kryesore të rajonit.',
      'Marzhi bruto mesatar prej rreth 30–40% është i arritshëm pas doganave dhe transportit (duhet verifikuar me oferta).',
      'Servisët e rregullt paguajnë mesatarisht brenda 45 ditëve, ndërsa furnitorët kërkojnë parapagim.',
      'Interesi verbal nuk është provë; vetëm porositë me parapagim dhe blerjet e përsëritura e konfirmojnë kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 7. Equipment rental for small events — partner, premises (storage), capital-heavy, seasonal
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'qiradhenie-pajisjesh-per-evente-te-vogla',
    nameSq: 'Qiradhënie tendash, karrigesh, tavolinash dhe dritash për evente të vogla',
    taglineSq: 'Paketa të gatshme për 20–100 të ftuar, me dërgesë, ngritje dhe çmontim nga ekipi.',
    descriptionSq:
      'Qiradhënie pajisjesh për festa dhe evente të vogla — ditëlindje, fejesa, festa në oborr, ditë të hapura biznesi, panaire lokale dhe aktivitete shoqatash — me tenda që ngrihen pa makineri të rënda, karrige e tavolina palosëse, mbulesa dhe ndriçim LED për ambient të jashtëm. Klienti merr një paketë të plotë me dërgesë, ngritje dhe çmontim nga dy persona, në vend që të mbledhë pajisje nga të afërmit. Biznesi kërkon kapital të konsiderueshëm për pajisjet, një magazinë, një furgon dhe një partner, dhe është shumë sezonal. Siguria e tendave në erë, materialet kundër zjarrit dhe çdo lidhje elektrike kanë rregulla që duhen verifikuar; lidhjet me rrjetin elektrik i bën vetëm një elektricist i licencuar.',
    sector: 'sherbime_biznesi',
    offerSq:
      'Paketa me qira për 1–3 ditë: tenda nga 3×3 m deri në 6×12 m, karrige dhe tavolina palosëse, mbulesa tavoline të pastra, ndriçim LED me kabllo të përshtatshme për ambient të jashtëm; kontroll i terrenit para eventit (vizitë ose foto); dërgesë, ngritje sipas udhëzimeve të prodhuesit dhe çmontim nga dy persona; listë dorëzimi me foto dhe depozitë për dëmet. Lidhja me rrjetin elektrik bëhet vetëm nga elektricist i licencuar; nuk jepen ngrohëse me gaz apo gjeneratorë pa operator të kualifikuar.',
    payingCustomerSq:
      'Familje që organizojnë festa në oborr ose në hapësira të marra me qira, organizatorë eventesh, kafene dhe restorante me ambiente të jashtme, shkolla, shoqata dhe biznese për ditë të hapura.',
    customerSegments: ['b2c', 'b2b'],
    problemSq:
      'Për një festë me 30–100 të ftuar, organizatorët duhet të gjejnë veç e veç karrige, tavolina, mbulesë nga dielli ose shiu dhe drita, shpesh nga të afërmit ose nga furnitorë që nuk i transportojnë e nuk i ngrenë vetë; blerja e pajisjeve për një event të vetëm nuk ia vlen, ndërsa sallat janë të shtrenjta ose të zëna për evente të vogla.',
    modes: ['fizik'],
    marketScopes: ['lokal'],
    canStartFromHome: false,
    minTeam: 'partner',
    requiredSkills: ['logjistike', 'drejtim_mjeti'],
    helpfulSkills: ['shitje', 'sherbim_klienti', 'menaxhim_projekti', 'riparime_shtepie', 'marketing_digjital'],
    helpfulAssets: ['furgon', 'magazine', 'punishte', 'vegla_pune', 'rrjet_kontaktesh'],
    minHoursPerWeek: 25,
    regulated: true,
    regulationNotesSq: [
      'Strukturat e përkohshme (tendat): ankorimi, peshat dhe kufijtë e erës sipas udhëzimeve të prodhuesit, certifikatat e materialit kundër zjarrit dhe, për tenda të mëdha ose evente publike, miratimet e kërkuara nga bashkia ose shërbimi zjarrfikës — Kërkon verifikim lokal.',
      'Çdo lidhje me rrjetin elektrik të vendit ose instalim i përkohshëm ndriçimi bëhet vetëm nga elektricist i licencuar; përdorni vetëm pajisje dhe kabllo të certifikuara për ambient të jashtëm dhe mos u jepni udhëzime elektrike klientëve.',
      'Eventet në hapësira publike kërkojnë zakonisht leje nga bashkia; zakonisht i merr organizatori, por verifikoni kush është përgjegjës dhe shkruajeni në kontratë.',
      'Kontrata e qirasë me depozitë, kushtet për dëmet, anulimin dhe motin e keq, si dhe sigurimi i përgjegjësisë civile dhe i pajisjeve: verifikoni mbulimin para eventit të parë.',
      'Ngarkimi dhe fiksimi i pajisjeve në furgon ose rimorkio, si dhe punësimi i ndihmësve për evente, kanë rregulla që duhen verifikuar lokalisht.',
    ],
    licensedProfessionalsSq: [
      'Elektricist i licencuar për çdo lidhje me rrjetin elektrik ose instalim të përkohshëm ndriçimi',
      'Specialist i sigurisë nga zjarri ose inxhinier, kur rregullat lokale kërkojnë miratim për struktura të përkohshme',
      'Agjent sigurimesh i licencuar për sigurimin e përgjegjësisë civile dhe të pajisjeve',
      'Jurist për kontratën e qirasë, depozitën dhe kushtet për dëmet',
    ],
    adultOnly: true,
    zeroCapitalTestSq:
      'Pajisjet nuk mund të jepen me qira pa i pasur, prandaj testi i parë mat kërkesën para blerjes: pyetni 20 familje dhe organizatorë që bënë një event gjatë vitit të fundit çfarë morën me qira, nga kush dhe sa paguan; pyetni 5 kafene dhe salla të vogla sa kërkesa refuzojnë. Pastaj kërkoni 5 rezervime me paradhënie për datat e sezonit dhe plotësojini duke marrë pajisjet me qira nga një shitës me shumicë ose nga një qiradhënës tjetër, me marrëveshje të shkruar. Blini pajisje të përdorura vetëm kur rezervimet mbulojnë pjesën më të madhe të kostos. Kostoja reale: pagesat për pajisjet e marra me qira, transporti dhe koha — jo zero.',
    revenueModelSq:
      'Qira për event (njësia = 1 paketë eventi mesatare me dërgesë, ngritje dhe çmontim), me depozitë të kthyeshme për dëmet; çmimi rritet me numrin e të ftuarve, kohëzgjatjen dhe distancën. Shtesat (mbulesa të veçanta, dekorime) janë të ardhura shtesë dhe nuk janë në modelin bazë.',
    pricing: {
      unitLabelSq: 'event (paketë mesatare)',
      priceUSD: { low: 280, base: 480, high: 850 },
      variableCostUSD: { low: 50, base: 90, high: 160 },
      unitsPerCustomerPerMonth: 1,
      collectionDays: 7,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin karburantin, larjen e mbulesave, pastrimin e pajisjeve, konsumin dhe zëvendësimin e pjesëve të humbura ose të dëmtuara, si dhe ndihmës me pagesë për eventet e mëdha; nuk përfshin kohën e dy partnerëve. “Klient” = një event; humbja 100% në muaj pasqyron që shumica e klientëve rezervojnë rrallë, ndonëse organizatorët dhe kafenetë mund të kthehen. Kapaciteti kufizohet nga sasia e pajisjeve: në fundjavat e kulmit nuk mund të shërbeni më shumë evente sesa lejon stoku. Paradhënia zakonisht merret në rezervim dhe pjesa tjetër në ditën e eventit. Çmimet janë supozime fillestare në USD; pyetni çmimet e qiradhënësve lokalë dhe sa paguan familjet për eventin e fundit.',
    },
    startupCosts: [
      {
        id: 'tents',
        labelSq: 'Tenda (2–4 copë të madhësive të ndryshme) me pesha dhe ankorime',
        category: 'pajisje',
        lowUSD: 3000,
        highUSD: 12000,
        noteSq:
          'Zëri kryesor; kërkoni certifikatat e materialit kundër zjarrit dhe udhëzimet e prodhuesit për erën dhe ankorimin. Krahasoni oferta për tenda të reja dhe të përdorura në gjendje të mirë.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'chairs-tables',
        labelSq: 'Karrige dhe tavolina palosëse (rreth 100 karrige, 12–15 tavolina) dhe mbulesa',
        category: 'pajisje',
        lowUSD: 2500,
        highUSD: 7000,
        noteSq:
          'Zgjidhni modele të qëndrueshme që palosen e ruhen lehtë; blini sasinë që del nga rezervimet e para, jo nga dëshira për ta mbushur magazinën.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'lighting',
        labelSq: 'Ndriçim LED dhe kabllo zgjatuese të certifikuara për ambient të jashtëm',
        category: 'pajisje',
        lowUSD: 500,
        highUSD: 2000,
        noteSq:
          'Blini vetëm pajisje të certifikuara për përdorim të jashtëm; pyesni një elektricist të licencuar çfarë kërkohet për lidhjet e përkohshme në vendet tipike të eventeve.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'van-trailer',
        labelSq: 'Furgon i përdorur ose rimorkio',
        category: 'pajisje',
        lowUSD: 5000,
        highUSD: 15000,
        noteSq:
          'Nevojitet vetëm nëse nuk keni furgon; tendat dhe karriget zënë shumë vend. Kontrolloni kategorinë e patentës për rimorkion dhe koston e sigurimit tregtar.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['furgon'],
      },
      {
        id: 'storage-deposit',
        labelSq: 'Depozita e qirasë së magazinës',
        category: 'depozita',
        lowUSD: 500,
        highUSD: 2500,
        noteSq:
          'Shpesh 1–3 muaj qira; pajisjet duhen ruajtur në vend të thatë që të mos dëmtohen. Verifikoni kushtet e kontratës për afatin minimal.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['magazine', 'punishte'],
      },
      {
        id: 'shelving-carts',
        labelSq: 'Rafte, karroca transporti dhe mbulesa ruajtjeje',
        category: 'hapje',
        lowUSD: 300,
        highUSD: 1200,
        noteSq: 'E shkurtojnë kohën e ngarkimit dhe ulin dëmtimet; krahasoni çmimet në 2–3 furnitorë.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'registration',
        labelSq: 'Regjistrim aktiviteti, kontrata tip dhe faturim',
        category: 'tarifa',
        lowUSD: 50,
        highUSD: 500,
        noteSq:
          'Merrni listën zyrtare nga regjistri zyrtar i bizneseve; kontrata e qirasë me depozitë dhe kushte dëmesh duhet parë nga një jurist.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: intervista dhe 5 evente me pajisje të marra me qira',
        category: 'testim_tregu',
        lowUSD: 100,
        highUSD: 400,
        noteSq:
          'Diferenca mes pagesës për pajisjet e marra me qira dhe paradhënieve, plus transporti për 5 eventet e para; mbajeni të vogël derisa rezervimet të përsëriten.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'storage-rent',
        labelSq: 'Qira e magazinës',
        category: 'qira',
        lowUSD: 300,
        highUSD: 1200,
        noteSq:
          'Paguhet edhe në dimër, kur ka pak evente; një magazinë jashtë qendrës, por pranë rrugëve kryesore, është zakonisht më e lirë. Kërkoni 3 oferta.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['magazine', 'punishte'],
      },
      {
        id: 'insurance',
        labelSq: 'Sigurim i përgjegjësisë civile dhe i pajisjeve',
        category: 'sigurime',
        lowUSD: 50,
        highUSD: 200,
        noteSq:
          'Kërkoni oferta nga 2–3 sigurues që përmendin qartë strukturat e përkohshme, erën dhe dëmet te të tretët.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'van-running',
        labelSq: 'Mirëmbajtje e furgonit dhe karburant (pjesa fikse)',
        category: 'transport',
        lowUSD: 80,
        highUSD: 300,
        noteSq:
          'Servisi, taksat dhe sigurimi i mjetit ndahen në muaj; karburanti për çdo event është te kostoja variabël.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'marketing',
        labelSq: 'Katalog, foto të eventeve dhe promovim lokal',
        category: 'marketing',
        lowUSD: 30,
        highUSD: 200,
        noteSq:
          'Foto reale nga eventet (me lejen e klientëve) dhe materiale për organizatorët; shtoni buxhet vetëm para sezonit dhe pasi të keni rezervime të para.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'accounting',
        labelSq: 'Kontabilist i jashtëm',
        category: 'kontabilitet',
        lowUSD: 40,
        highUSD: 120,
        noteSq: 'Depozitat, paradhëniet dhe faturat për biznese kërkojnë regjistrim të saktë; kërkoni çmim fiks mujor.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'equipment-maintenance',
        labelSq: 'Riparim dhe zëvendësim pajisjesh (pjesa fikse)',
        category: 'mirembajtje',
        lowUSD: 50,
        highUSD: 200,
        noteSq:
          'Pëlhurat, lidhëset dhe karriget konsumohen; riparimet në dimër i bëjnë pajisjet gati për sezonin. Mbani një fond të vogël çdo muaj.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'utilities',
        labelSq: 'Energji, ujë dhe telefon për magazinën',
        category: 'sherbime_komunale',
        lowUSD: 20,
        highUSD: 80,
        noteSq: 'Uji dhe energjia për pastrimin e pajisjeve dhe për magazinën; kërkoni faturat e kaluara nga pronari.',
        scalesWithPriceLevel: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 0, monthlyNewCustomers: 3, monthlyChurnPct: 100 },
      baze: { startCustomers: 1, monthlyNewCustomers: 6, monthlyChurnPct: 100 },
      optimist: { startCustomers: 2, monthlyNewCustomers: 10, monthlyChurnPct: 100 },
    },
    seasonality: [0.3, 0.35, 0.6, 1.0, 1.5, 1.8, 1.8, 1.7, 1.4, 0.8, 0.35, 0.4],
    seasonalityNoteSq:
      'Eventet në natyrë përqendrohen nga maji në shtator, kur moti lejon festa në oborr dhe në ambiente të jashtme; në dimër kërkesa bie shumë, me pak evente brenda ose në festat e fundvitit. Vlerat janë supozim për një klimë me verë të thatë; shiu dhe era anulojnë evente edhe në sezon. Planifikoni rezervë parash për 4–5 muaj të qetë.',
    macroLinks: [
      {
        indicatorCode: 'household_consumption_growth',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Festat dhe eventet familjare janë shpenzim që shtyhet kur buxheti ngushtohet; rritja e konsumit të familjeve sugjeron më shumë evente dhe buxhete më të mëdha për to.',
        ifSupportsSq: 'Rritja e konsumit mbështet kërkesën për evente me pajisje me qira.',
        ifContradictsSq:
          'Me konsum në rënie, familjet zgjedhin festa më të vogla ose pajisje nga të afërmit; ofroni paketa më të vogla.',
      },
      {
        indicatorCode: 'remittances_gdp',
        direction: 'me_i_larte_mbeshtet',
        referenceValue: 5,
        mechanismSq:
          'Në vende me diasporë të madhe, shumë festa familjare (fejesa, ditëlindje, takime familjare) organizohen në verë kur emigrantët kthehen, shpesh me buxhet nga remitancat. Niveli referues 5% e PBB-së është supozim i bibliotekës.',
        ifSupportsSq:
          'Sugjeron një kulm të fortë veror nga festat e diasporës — verifikoni kalendarin lokal të festave.',
        ifContradictsSq:
          'Me remitanca të ulëta, kërkesa varet më shumë nga të ardhurat vendase dhe nga eventet e bizneseve.',
      },
      {
        indicatorCode: 'lending_rate',
        direction: 'me_i_ulet_mbeshtet',
        mechanismSq:
          'Pajisjet blihen shpesh me kredi ose me leasing; normat e ulëta e ulin koston e financimit të një investimi që shlyhet ngadalë dhe vetëm në sezon.',
        ifSupportsSq: 'Normat e ulëta e bëjnë më të përballueshëm financimin e stokut të parë të pajisjeve.',
        ifContradictsSq:
          'Me norma të larta, mos e financoni gjithë stokun me kredi; nisni me më pak pajisje dhe zgjerohuni me fitimet e sezonit.',
      },
      {
        indicatorCode: 'gdp_growth',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Kur ekonomia rritet, bizneset dhe shoqatat organizojnë më shumë ditë të hapura, inaugurime dhe aktivitete në natyrë — klientë që paguajnë me faturë dhe rezervojnë sërish.',
        ifSupportsSq: 'Rritja ekonomike sugjeron më shumë evente biznesi; listoni bizneset dhe shoqatat aktive në zonë.',
        ifContradictsSq:
          'Në ngadalësim ekonomik, eventet e bizneseve janë ndër shpenzimet e para që shkurtohen; mbështetuni më shumë te festat familjare.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Gjithnjë e më shumë festa familjare dhe aktivitete biznesi organizohen në oborre, kopshte dhe ambiente të jashtme në vend të sallave.',
      problemSq:
        'Organizatorët humbasin kohë duke mbledhur pajisje nga vende të ndryshme dhe rrezikojnë motin e keq pa mbulesë të përshtatshme.',
      customerSq:
        'Familje dhe organizatorë eventesh me 20–100 të ftuar, si dhe kafene, shkolla e shoqata që bëjnë evente herë pas here.',
      offerSq: 'Një paketë e plotë me dërgesë, ngritje e çmontim, me çmim të qartë dhe kontratë të shkruar.',
      reasonToPaySq:
        'Kursim kohe dhe pune, pamje e rregullt e eventit dhe një person përgjegjës për të gjitha pajisjet.',
      profitConditionsSq:
        'Fitimi kërkon rezervime të shumta në fundjavat e sezonit, pajisje që zgjasin disa sezone pa dëme të mëdha, depozita që mbulojnë humbjet dhe një rezervë parash për muajt e dimrit.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq:
          'Rezervimet përqendrohen në pak fundjava, ndërsa në ditët e tjera pajisjet rrinë në magazinë dhe nuk e kthejnë investimin.',
      },
      {
        kind: 'cmim',
        textSq:
          'Familjet krahasojnë me pajisjet e huazuara nga të afërmit ose me karriget plastike të lira dhe nuk pranojnë çmimin e paketës me ngritje.',
      },
      {
        kind: 'konkurrence',
        textSq: 'Sallat e eventeve dhe qiradhënësit ekzistues ofrojnë paketa më të plota ose ulin çmimet në sezon.',
      },
      {
        kind: 'kosto',
        textSq:
          'Pajisjet dëmtohen ose humbasin më shpejt se ç’ishte planifikuar, ndërsa qiraja e magazinës paguhet edhe në dimër.',
      },
      {
        kind: 'sezonalitet',
        textSq: 'Pothuajse të gjitha të ardhurat vijnë në 5 muaj; një verë me shumë shi i ul ndjeshëm.',
      },
      {
        kind: 'operacionale',
        textSq:
          'Një tendë e ngritur keq në erë ose një incident me ndriçimin mund të shkaktojë dëme, padi dhe humbje reputacioni.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Mungesa e miratimeve për strukturat e përkohshme ose e sigurimit e lë biznesin të pambuluar kur ndodh një incident.',
      },
    ],
    falsifiersSq: [
      'Nga 20 familje dhe organizatorë të intervistuar, më pak se 6 kanë marrë pajisje me qira për eventin e fundit ose kanë paguar dikë për t’i transportuar.',
      'Pas ofertave për sezonin, më pak se 5 rezervime me paradhënie për datat nga maji në shtator.',
      'Çmimi mesatar që pranojnë klientët për një paketë 50-personëshe është më i ulët se 3 herë kostoja variabël për event.',
    ],
    differentiationSq: [
      'Paketa të gatshme sipas numrit të të ftuarve, me çmim të plotë të shkruar që përfshin dërgesën, ngritjen dhe çmontimin.',
      'Kontroll i terrenit para eventit dhe ngritje sipas udhëzimeve të prodhuesit, me plan për motin e keq.',
      'Pajisje të pastra dhe të kontrolluara, me listë dorëzimi me foto që shmang mosmarrëveshjet për dëmet.',
    ],
    competitorTypesSq: [
      'Salla eventesh dhe restorante me ambiente të gatshme',
      'Qiradhënës ekzistues pajisjesh pa shërbim ngritjeje',
      'Pajisje të huazuara nga të afërm, fqinjë ose shoqata',
      'Blerje e pajisjeve të lira për një event të vetëm',
    ],
    cheapestTestSq:
      'Intervista me 20 familje dhe organizatorë dhe 5 rezervime me paradhënie për sezonin, të plotësuara me pajisje të marra me qira nga një furnitor tjetër. Matni rezervimet reale për fundjavë dhe kohën e ngritjes, para se të blini stokun tuaj.',
    interviewQuestionsSq: [
      'Si e organizuat eventin e fundit: ku u mbajt dhe nga i gjetët karriget, tavolinat dhe mbulesën?',
      'Sa paguat për pajisjet dhe transportin në eventin e fundit?',
      'Çfarë shkoi keq me pajisjet ose me motin në një event që keni organizuar?',
      'Sa kohë ju mori t’i mblidhnit dhe t’i kthenit të gjitha pas eventit?',
      'Sa evente keni organizuar ose keni ndihmuar të organizohen vitin e kaluar?',
      'Kush tjetër vendosi për buxhetin dhe për furnitorët e eventit?',
      'Për kafenetë dhe sallat: sa kërkesa për evente në ambient të jashtëm keni refuzuar këtë vit dhe pse?',
    ],
    firstCustomers: {
      whereSq: [
        'Organizatorë eventesh dhe fotografë që punojnë me festa familjare',
        'Kafene, restorante dhe bujtina me oborre ose ambiente të jashtme',
        'Shkolla, shoqata dhe biznese që organizojnë ditë të hapura',
        'Rrjeti juaj personal dhe familjet që organizojnë festa në verë',
      ],
      howToContactSq: [
        'Vizitë personale me katalogun e paketave dhe çmimet, jashtë orëve të ngarkuara',
        'Partneritete rekomandimi me organizatorë dhe fotografë, me çdo komision të deklaruar hapur te klienti',
        'Foto reale nga eventet e realizuara, me lejen e klientëve, pa vlerësime të rreme',
      ],
      offerSq:
        'Rezervim me paradhënie dhe anulim falas deri 7 ditë para eventit; për organizatorët e rregullt, çmim i fiksuar për gjithë sezonin.',
      followUpSq:
        'Një ditë pas eventit, një mesazh për të pyetur si shkoi dhe për kthimin e depozitës; me organizatorët e rregullt, kontakt para çdo sezoni. Ndaloni ndjekjen pas një rikujtese pa përgjigje.',
      metricsSq: [
        'Rezervime për fundjavë në sezon',
        'Përdorimi i stokut (% e pajisjeve të dhëna me qira në fundjavat e kulmit)',
        'Dëme dhe humbje si % e të ardhurave',
        'Klientë që rezervojnë sërish ose rekomandojnë',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje, jam [emri] nga [emri i biznesit]. Japim me qira tenda, karrige, tavolina dhe drita për evente me 20–100 të ftuar, me dërgesë, ngritje dhe çmontim nga ekipi ynë. Për një event me [numri] të ftuar, paketa kushton [çmimi], gjithçka e përfshirë. A mund t’ju pyes si i keni organizuar pajisjet në eventin tuaj të fundit?',
    offerTemplateSq:
      'Oferta për [emri i klientit], eventi më [data] në [vendi]: (1) [numri] karrige, [numri] tavolina me mbulesa, tendë [madhësia], ndriçim LED; (2) dërgesë dhe ngritje deri në [ora], çmontim më [data dhe ora]; (3) çmimi [çmimi], paradhënie [shuma] në rezervim dhe pjesa tjetër në ditën e eventit; (4) depozitë e kthyeshme [shuma] për dëmet; (5) anulim falas deri [ditë] ditë para; në rast moti të rrezikshëm tenda nuk ngrihet dhe e rishikojmë datën bashkë. Lidhja me rrjetin elektrik, kur nevojitet, bëhet nga elektricist i licencuar. Nuk premtojmë mot të mirë; premtojmë pajisje të pastra, në kohë dhe të ngritura me kujdes.',
    feedbackQuestionsSq: [
      'Çfarë ju mungoi në paketë gjatë eventit?',
      'Si shkoi ngritja dhe çmontimi krahasuar me sa prisnit?',
      'Çfarë do të ndryshonit në mënyrën e rezervimit ose të pagesës?',
    ],
    goCriteriaSq: [
      'Të paktën 5 rezervime me paradhënie para sezonit dhe mbi 2 evente në fundjavë gjatë qershorit, korrikut dhe gushtit.',
      'Dëmet dhe humbjet mbeten nën 5% të të ardhurave të sezonit.',
      'Të ardhurat e sezonit të parë mbulojnë kostot fikse vjetore dhe të paktën një të katërtën e investimit në pajisje.',
    ],
    killCriteriaSq: [
      'Pas 30 kontakteve me familje dhe organizatorë, më pak se 3 rezervime me paradhënie.',
      'Në kulmin e sezonit, mesatarja mbetet nën 1 event në fundjavë.',
      'Miratimet ose sigurimi për strukturat e përkohshme kushtojnë aq sa çmimi i pranuar nga tregu nuk i mbulon.',
    ],
    phaseNotesSq: {
      p10_20: [
        'Intervistoni 20 familje dhe organizatorë për eventin e fundit, dhe 5 kafene ose salla për kërkesat e refuzuara.',
      ],
      p30_40: [
        'Llogaritni sa evente në sezon duhen për të mbuluar kostot fikse vjetore dhe këstet e pajisjeve.',
      ],
      p40_50: [
        'Verifikoni rregullat për strukturat e përkohshme, materialet kundër zjarrit dhe sigurimin; gjeni një elektricist të licencuar për eventet me lidhje elektrike.',
      ],
      p50_60: [
        'Krahasoni oferta për pajisje të reja dhe të përdorura, bashkë me certifikatat dhe udhëzimet e prodhuesit për ngritjen.',
      ],
      p60_70: ['Pesë evente me pajisje të marra me qira nga një furnitor tjetër; matni kohën e ngritjes dhe të çmontimit.'],
      p90_100: ['Zgjerojeni stokun vetëm aty ku keni refuzuar rezervime në fundjavat e kulmit.'],
    },
    assumptionsSq: [
      'Dy persona mund të ngrenë dhe të çmontojnë 1–2 evente të vogla në ditë.',
      'Pajisjet e mira zgjasin disa sezone nëse pastrohen dhe ruhen siç duhet.',
      'Paradhënia në rezervim mbulon të paktën kostot variabël të eventit.',
      'Interesi verbal nuk është provë; vetëm rezervimet me paradhënie e konfirmojnë kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 8. Online shop of local products for the diaspora — solo, online, international, import rules
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'dyqan-online-produktesh-vendase-per-diasporen',
    nameSq: 'Dyqan online me produkte vendase për diasporën',
    taglineSq:
      'Produkte artizanale dhe ushqime të paketuara që ruhen gjatë, nga prodhues të regjistruar, të dërguara te familjet jashtë vendit.',
    descriptionSq:
      'Dyqan online me një katalog të vogël e të zgjedhur me kujdes: punime artizanale (tekstile, punime druri, qeramikë dekorative) dhe ushqime të paketuara që ruhen gjatë (mjaltë, çajra mali, reçele, erëza) nga prodhues të regjistruar, të dërguara me korrier te familjet e diasporës. Nisni me 1–2 vende destinacioni ku keni rrjet dhe ku keni verifikuar rregullat e importit: shumë vende ndalojnë ose kufizojnë dërgimin e produkteve me origjinë shtazore, kërkojnë etiketa në gjuhën vendase dhe aplikojnë taksa doganore që i paguan marrësi. Mund të niset nga shtëpia me stok të vogël ose me porosi direkte te prodhuesit; kutitë e dhuratave për festat janë kulmi i shitjeve.',
    sector: 'diaspora',
    offerSq:
      'Katalog online me 20–40 produkte artizanale dhe ushqime të paketuara nga prodhues të regjistruar, me foto, histori të shkurtër të prodhuesit dhe etiketë të plotë; kuti dhuratash për festat; paketim mbrojtës për transport ndërkombëtar; dërgesë me numër gjurmimi në 1–2 vende fillestare; informacion i qartë para pagesës për taksat doganore që mund t’i paguajë marrësi dhe për kohën e dërgesës. Nuk dërgohen produkte mishi, bulmeti apo të tjera që vendi i destinacionit i ndalon.',
    payingCustomerSq:
      'Emigrantë dhe familje të diasporës që blejnë për vete ose si dhuratë, si dhe familjarë në vend që u dërgojnë dhurata të afërmve jashtë.',
    customerSegments: ['b2c'],
    problemSq:
      'Diaspora kërkon shijet dhe punimet e vendit të origjinës, por i gjen kryesisht kur vjen me pushime ose përmes njerëzve që udhëtojnë me valixhe; produktet që gjenden jashtë janë të pakta, pa histori të prodhuesit dhe shpesh pa etiketë të qartë, ndërsa dërgimi i një pakete nga vetë familja është i ndërlikuar.',
    modes: ['online'],
    marketScopes: ['nderkombetar'],
    canStartFromHome: true,
    minTeam: 'vetem',
    requiredSkills: ['marketing_digjital', 'import_eksport'],
    helpfulSkills: ['fotografi_video', 'dizajn_web', 'shkrim_perkthim', 'gjuhe_te_huaja', 'sherbim_klienti', 'logjistike'],
    helpfulAssets: ['kompjuter', 'telefon_smart', 'internet_i_qendrueshem', 'rrjet_diaspore', 'kamera', 'magazine'],
    minHoursPerWeek: 20,
    regulated: true,
    regulationNotesSq: [
      'Regjistrimi i aktivitetit të tregtisë online, faturimi dhe deklarimi i shitjeve ndërkombëtare: Kërkon verifikim lokal.',
      'Rregullat e importit në çdo vend destinacioni: produktet e ndaluara ose të kufizuara (sidomos ato me origjinë shtazore, ku në disa vende hyn edhe mjalti), sasitë e lejuara, certifikatat e kërkuara dhe etiketat në gjuhën vendase. Verifikojini për çdo vend para shitjes së parë atje.',
      'Taksat doganore dhe TVSH-ja në import për dërgesat me vlerë të ulët: verifikoni kush i paguan, si deklarohen dhe tregojini qartë klientit para pagesës.',
      'Ushqimet duhet të vijnë nga prodhues të regjistruar si operatorë ushqimorë, me etiketë të plotë; nëse ruani ushqime në shtëpi ose në magazinë, verifikoni nëse ju duhet regjistrim si operator ushqimor edhe për ruajtjen dhe shitjen.',
      'Shitja në distancë: të drejtat e konsumatorit në vendin e blerësit (p.sh. e drejta e tërheqjes), mbrojtja e të dhënave personale dhe siguria e produkteve (p.sh. qeramika që bie në kontakt me ushqimin) — verifikoni rregullat përkatëse.',
    ],
    licensedProfessionalsSq: [
      'Agjent doganor ose kompani korriere me shërbim doganor për deklaratat e eksportit',
      'Kontabilist për faturimin e shitjeve ndërkombëtare dhe TVSH-në',
      'Jurist për kushtet e shitjes në distancë dhe mbrojtjen e të dhënave në vendet e destinacionit',
      'Laborator i akredituar për testimin e produkteve që bien në kontakt me ushqimin, kur kërkohet',
    ],
    adultOnly: true,
    zeroCapitalTestSq:
      'Para se të blini stok: zgjidhni 10 produkte nga prodhues të regjistruar dhe kërkoni leje për t’i fotografuar; ndërtoni një katalog të thjeshtë me çmime dhe kosto dërgese. Verifikoni rregullat e importit për 1 vend ku keni rrjet. Ndajeni katalogun me rrjetin tuaj personal dhe një herë në grupet e diasporës ku jeni anëtar, sipas rregullave të grupit. Pranoni porosi me pagesë vetëm për produktet që lejohen në atë vend dhe blini nga prodhuesi vetëm pas porosisë. Kostoja reale: mostrat, një paketë provë drejt një të afërmi jashtë vendit për të matur kohën, dëmtimet dhe taksat, si dhe koha juaj — jo zero.',
    revenueModelSq:
      'Marzh mbi çmimin e blerjes nga prodhuesi për çdo porosi (njësia = 1 porosi mesatare); transporti ndërkombëtar i faturohet klientit veçmas me koston reale dhe nuk përfshihet në model; kutitë e dhuratave për festat e rrisin vlerën mesatare të porosisë.',
    pricing: {
      unitLabelSq: 'porosi',
      priceUSD: { low: 30, base: 48, high: 75 },
      variableCostUSD: { low: 16, base: 26, high: 40 },
      unitsPerCustomerPerMonth: 1,
      collectionDays: 3,
      supplierPaymentDays: 7,
      priceScalesWithPriceLevel: false,
      noteSq:
        'Kostoja variabël përfshin produktet nga prodhuesit, paketimin mbrojtës dhe tarifat e pagesave online e të platformës për porosi; transportin ndërkombëtar ia paguan veçmas korrierit klienti. “Klient” = një blerës në muaj; humbja e lartë mujore pasqyron që shumë blerës porosisin vetëm për festa ose si dhuratë. Klientët paguajnë me çmimet e vendeve ku jetojnë, ndërsa modeli e përshtat çmimin sipas nivelit të çmimeve të vendit tuaj — kjo mund ta nënvlerësojë çmimin e shitjes; krahasojeni me çmimet e produkteve të ngjashme në vendet e destinacionit. Çmimet janë supozime në USD; merrni çmime reale nga prodhuesit dhe korrierët.',
    },
    startupCosts: [
      {
        id: 'online-store',
        labelSq: 'Dyqan online në platformë të gatshme, domen dhe temë',
        category: 'hapje',
        lowUSD: 50,
        highUSD: 400,
        noteSq:
          'Platformat e gatshme kanë plane mujore dhe komisione; zgjidhni një që mbështet monedhat dhe gjuhët e destinacionit. Krahasoni kostot totale për 100 porosi.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'product-photos-texts',
        labelSq: 'Fotografim i produkteve dhe tekste në gjuhët e destinacionit',
        category: 'hapje',
        lowUSD: 100,
        highUSD: 600,
        noteSq:
          'Mund ta bëni vetë me kamerë dhe dritë natyrale; përkthimet e etiketave dhe të kushteve të shitjes kërkojnë saktësi — kontrollojini nga dikush që e flet gjuhën rrjedhshëm.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['kamera'],
      },
      {
        id: 'initial-stock',
        labelSq: 'Stok i vogël fillestar i produkteve më të shitura',
        category: 'inventar',
        lowUSD: 600,
        highUSD: 2500,
        noteSq:
          'Mbani vetëm produktet që shiten rregullisht dhe që ruhen gjatë; pjesën tjetër porositeni te prodhuesi pas porosisë së klientit. Negocioni me prodhuesit pagesë pas shitjes.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'packaging',
        labelSq: 'Kuti, material mbrojtës, ngjitëse dhe etiketa',
        category: 'inventar',
        lowUSD: 150,
        highUSD: 500,
        noteSq:
          'Paketimi i mirë i ul dëmtimet në transportin ndërkombëtar; provojeni me paketa provë para se të blini sasi të mëdha.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'import-rules-advice',
        labelSq: 'Konsultë për rregullat e importit dhe etiketat në vendin e destinacionit',
        category: 'tarifa',
        lowUSD: 150,
        highUSD: 800,
        noteSq:
          'Një agjent doganor ose konsulent për vendin e destinacionit mund t’ju kursejë sekuestrime dhe kthime; kërkoni përgjigje me shkrim për çdo kategori produkti.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'registration',
        labelSq: 'Regjistrim aktiviteti dhe faturim',
        category: 'tarifa',
        lowUSD: 50,
        highUSD: 400,
        noteSq:
          'Merrni listën zyrtare nga regjistri zyrtar i bizneseve; verifikoni nëse shitja online dhe eksporti kërkojnë regjistrim shtesë.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: mostra dhe paketa provë në 1–2 vende',
        category: 'testim_tregu',
        lowUSD: 100,
        highUSD: 400,
        noteSq:
          'Mostrat e produkteve dhe 2–3 paketa provë te të afërm jashtë vendit për të matur kohën, dëmtimet dhe taksat që paguan marrësi.',
        scalesWithPriceLevel: false,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'platform-subscription',
        labelSq: 'Abonim i platformës së dyqanit dhe i aplikacioneve',
        category: 'software',
        lowUSD: 30,
        highUSD: 100,
        noteSq: 'Krahasoni planet sipas numrit të porosive dhe komisioneve; shtoni aplikacione vetëm kur i keni vërtet të nevojshme.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'online-marketing',
        labelSq: 'Marketing online i kufizuar dhe përmbajtje',
        category: 'marketing',
        lowUSD: 30,
        highUSD: 250,
        noteSq:
          'Nisni me rrjetin tuaj dhe me përmbajtje origjinale për prodhuesit; mos shpenzoni për reklama të mëdha para se të shihni porosi të përsëritura. Kostoja e reklamave ndjek tregjet e destinacionit.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'accounting',
        labelSq: 'Kontabilist i jashtëm',
        category: 'kontabilitet',
        lowUSD: 30,
        highUSD: 120,
        noteSq:
          'Shitjet ndërkombëtare dhe TVSH-ja e bëjnë kontabilitetin më të ndërlikuar; kërkoni çmim fiks mujor.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'storage',
        labelSq: 'Hapësirë ruajtjeje e thatë dhe e freskët',
        category: 'qira',
        lowUSD: 0,
        highUSD: 150,
        noteSq:
          'Në fillim mund të mjaftojë një dhomë e thatë në shtëpi, nëse lejohet për produktet që ruani; me rritjen e stokut nevojitet një magazinë e vogël.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['magazine', 'apartament_shtese'],
      },
      {
        id: 'phone-internet',
        labelSq: 'Telefon dhe internet',
        category: 'sherbime_komunale',
        lowUSD: 20,
        highUSD: 50,
        noteSq: 'Porositë dhe komunikimi me klientët jashtë vendit kërkojnë internet të qëndrueshëm; krahasoni paketat lokale.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'goods-insurance',
        labelSq: 'Sigurim i mallit në transport dhe i përgjegjësisë për produktet',
        category: 'sigurime',
        lowUSD: 15,
        highUSD: 60,
        noteSq:
          'Pyesni korrierët për mbulimin e dëmeve dhe të humbjeve, dhe siguruesit për përgjegjësinë ndaj produkteve; lexoni përjashtimet.',
        scalesWithPriceLevel: true,
        optional: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 3, monthlyNewCustomers: 8, monthlyChurnPct: 70 },
      baze: { startCustomers: 5, monthlyNewCustomers: 15, monthlyChurnPct: 60 },
      optimist: { startCustomers: 8, monthlyNewCustomers: 25, monthlyChurnPct: 50 },
    },
    seasonality: [0.8, 0.8, 0.9, 0.95, 0.9, 0.75, 0.6, 0.6, 0.9, 1.1, 1.6, 2.1],
    seasonalityNoteSq:
      'Shitjet përqendrohen para festave të fundvitit dhe festave të tjera familjare, kur diaspora dërgon ose porosit dhurata; në verë bien, sepse shumë emigrantë vijnë vetë në vend dhe i blejnë produktet drejtpërdrejt. Vlerat janë supozim; kalendari i festave ndryshon sipas komunitetit dhe vendit të destinacionit, dhe afatet e korrierëve para festave duhen planifikuar herët.',
    macroLinks: [
      {
        indicatorCode: 'remittances_gdp',
        direction: 'me_i_larte_mbeshtet',
        referenceValue: 5,
        mechanismSq:
          'Remitancat e larta tregojnë një diasporë të madhe që mban lidhje të forta me vendin dhe shpenzon për familjen — pikërisht blerësit e mundshëm të produkteve vendase. Niveli referues 5% e PBB-së është supozim i bibliotekës.',
        ifSupportsSq:
          'Sugjeron një diasporë të madhe; zgjidhni 1–2 vendet ku ajo është më e përqendruar dhe ku keni rrjet.',
        ifContradictsSq:
          'Me remitanca të ulëta, diaspora mund të jetë e vogël ose më pak e lidhur; testoni me shumë kujdes para se të blini stok.',
      },
      {
        indicatorCode: 'exchange_rate_lcu_usd',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Kur monedha vendase dobësohet (më shumë njësi vendase për 1 USD), produktet vendase bëhen më të lira për blerësit që paguajnë në monedhë të huaj, ndërsa kostot tuaja lokale mbeten në monedhë vendase. Efekti varet nga monedhat e vendeve ku jeton diaspora.',
        ifSupportsSq: 'Një monedhë vendase më e dobët e përmirëson marzhin ose konkurrueshmërinë e çmimit jashtë.',
        ifContradictsSq:
          'Me monedhë vendase që forcohet, produktet shtrenjtohen për blerësit jashtë; theksoni vlerën unike të produktit, jo çmimin.',
      },
      {
        indicatorCode: 'inflation_cpi',
        direction: 'me_i_ulet_mbeshtet',
        referenceValue: 5,
        mechanismSq:
          'Çmimet e prodhuesve dhe të paketimit ndjekin inflacionin vendas; me inflacion të lartë, katalogu me çmime të fiksuara humbet marzh shpejt. Niveli referues 5% është supozim i bibliotekës.',
        ifSupportsSq: 'Inflacioni i ulët lejon çmime të qëndrueshme në katalog për disa muaj.',
        ifContradictsSq:
          'Me inflacion të lartë, rishikoni çmimet çdo muaj dhe negocioni me prodhuesit çmime të fiksuara për sezonin e festave.',
      },
      {
        indicatorCode: 'population_growth',
        direction: 'renia_mbeshtet',
        mechanismSq:
          'Rënia e popullsisë shpesh pasqyron emigrimin; një diasporë në rritje do të thotë më shumë njerëz jashtë vendit që kërkojnë produktet e vendit të origjinës.',
        ifSupportsSq: 'Sugjeron që diaspora po rritet — tregues i tërthortë, jo matje e kërkesës.',
        ifContradictsSq:
          'Me popullsi në rritje, emigrimi mund të jetë i ulët dhe tregu i diasporës më i vogël; mbështetuni te të dhënat nga rrjeti juaj.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Diaspora është rritur dhe blen gjithnjë e më shumë online, ndërsa korrierët ndërkombëtarë e kanë bërë më të lehtë dërgimin e pakove të vogla.',
      problemSq:
        'Produktet e vendit të origjinës gjenden rrallë jashtë dhe pa histori të qartë, ndërsa dërgimi i tyre me valixhe ose me të njohur është i parregullt.',
      customerSq: 'Emigrantë dhe familje të diasporës që duan shije dhe punime të vendit për vete ose si dhuratë.',
      offerSq:
        'Një katalog i vogël me produkte të verifikuara, paketim të sigurt dhe informacion të qartë për taksat dhe kohën e dërgesës.',
      reasonToPaySq:
        'Produkte autentike pa pritur pushimet, me lehtësinë e një porosie online dhe histori të prodhuesit që e bën dhuratën më personale.',
      profitConditionsSq:
        'Fitimi kërkon porosi me vlerë mesatare që mbulon paketimin dhe tarifat, blerës që kthehen për festat, stok të vogël me qarkullim të shpejtë dhe asnjë humbje nga sekuestrimet doganore.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq: 'Diaspora e pëlqen idenë, por i blen produktet kur vjen në verë dhe porosit rrallë gjatë vitit.',
      },
      {
        kind: 'cmim',
        textSq:
          'Me transportin ndërkombëtar dhe taksat, çmimi total për blerësin del shumë i lartë krahasuar me vlerën e produktit.',
      },
      {
        kind: 'konkurrence',
        textSq:
          'Dyqanet etnike në vendet e destinacionit dhe tregjet e mëdha online ofrojnë produkte të ngjashme pa pritje.',
      },
      {
        kind: 'kosto',
        textSq: 'Paketimi, kthimet, produktet e dëmtuara dhe reklamat marrin më shumë marzh sesa ishte planifikuar.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Paketat me produkte të ndaluara ose me etiketa jo të rregullta sekuestrohen ose kthehen, dhe klienti humbet besimin.',
      },
      {
        kind: 'sezonalitet',
        textSq: 'Shumica e shitjeve vijnë në 2 muaj para festave, ndërsa kostot fikse dhe stoku mbahen gjithë vitin.',
      },
      {
        kind: 'operacionale',
        textSq: 'Vonesat e korrierëve para festave ose dëmtimet në transport sjellin rimbursime dhe ankesa.',
      },
    ],
    falsifiersSq: [
      'Pas ndarjes së katalogut me rrjetin dhe në 2–3 grupe diaspore, më pak se 10 porosi me pagesë brenda 6 javëve.',
      'Në paketat provë, kostoja e transportit dhe e taksave për marrësin e kalon vlerën e produkteve në shumicën e rasteve.',
      'Më pak se 15% e blerësve të parë porosisin sërish brenda 4 muajve, përfshirë sezonin e festave.',
      'Rregullat e importit të vendit kryesor të destinacionit ndalojnë ose kufizojnë shumicën e produkteve ushqimore të katalogut.',
    ],
    differentiationSq: [
      'Katalog i vogël dhe i zgjedhur, me histori të verifikuar të çdo prodhuesi dhe etiketë të plotë.',
      'Informacion i qartë para pagesës për taksat doganore dhe kohën e dërgesës, pa surpriza për marrësin.',
      'Kuti dhuratash për festat, të përgatitura vetëm për vendet ku janë verifikuar rregullat e importit.',
    ],
    competitorTypesSq: [
      'Dyqane etnike në vendet e destinacionit',
      'Tregje të mëdha online me shitës nga shumë vende',
      'Të afërm dhe miq që sjellin produkte me valixhe',
      'Prodhues që shesin vetë online me dërgesë jashtë vendit',
    ],
    cheapestTestSq:
      'Katalog me 10 produkte, i ndarë me rrjetin tuaj dhe një herë në 2–3 grupe diaspore, me porosi të paguara vetëm për 1 vend të verifikuar. Matni porositë me pagesë, koston totale për marrësin dhe sa blerës kthehen, jo pëlqimet në rrjete.',
    interviewQuestionsSq: [
      'Kur ishte hera e fundit që sollët ose porositët produkte nga vendi i origjinës dhe si e bëtë?',
      'Çfarë produktesh sollët me vete në udhëtimin e fundit nga vendi?',
      'Sa shpenzuat për dhurata ose produkte nga vendi në festat e fundit?',
      'Ku i blini sot produktet e vendit kur jeni jashtë dhe çfarë ju mungon atje?',
      'Kur ishte hera e fundit që dërguat ose morët një pako ndërkombëtare dhe sa paguat për transportin dhe taksat?',
      'Kush tjetër në familje vendos për dhuratat që u dërgoni të afërmve?',
    ],
    firstCustomers: {
      whereSq: [
        'Rrjeti juaj personal dhe familjar jashtë vendit',
        'Grupe dhe shoqata të diasporës ku jeni anëtar',
        'Organizatorë të eventeve kulturore të diasporës',
        'Familjarë në vend që u dërgojnë rregullisht dhurata të afërmve jashtë',
      ],
      howToContactSq: [
        'Mesazh personal te njerëzit që njihni, me katalogun dhe kushtet e dërgesës',
        'Postim një herë në grupet e diasporës ku jeni anëtar, sipas rregullave të grupit, pa mesazhe masive ose lista të blera',
        'Bashkëpunim me organizatorët e eventeve kulturore për një tavolinë prezantimi, aty ku lejohet',
      ],
      offerSq:
        'Porosia e parë me çmim të plotë dhe me informim të plotë për transportin dhe taksat; rimbursim nëse paketa mbërrin e dëmtuar, sipas kushteve të shkruara.',
      followUpSq:
        'Pas mbërritjes, një mesazh për të pyetur për gjendjen e paketës dhe kohën e dërgesës; para festave, një njoftim i vetëm vetëm për blerësit e mëparshëm që kanë dhënë pëlqimin për njoftime.',
      metricsSq: [
        'Porosi me pagesë për çdo 100 persona që panë katalogun',
        'Vlera mesatare e porosisë',
        'Blerës që kthehen brenda 4 muajve (%)',
        'Paketa të dëmtuara, të vonuara ose të kthyera (%)',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje [emri], po nis një dyqan të vogël online me produkte nga [rajoni] — [produkti 1], [produkti 2], [produkti 3] — nga prodhues të regjistruar, që i dërgoj në [vendi]. Para pagesës tregoj qartë koston e transportit dhe taksat e mundshme. A mund t’ju pyes kur keni porositur ose sjellë herën e fundit produkte nga vendi dhe si e bëtë?',
    offerTemplateSq:
      'Porosia juaj: (1) [produktet] nga [prodhuesit], me etiketë të plotë; (2) çmimi i produkteve [çmimi]; (3) transporti me korrier deri në [vendi]: [kostoja], me numër gjurmimi, koha e pritshme [ditë] ditë pune; (4) taksat doganore që mund t’i paguajë marrësi: [informacioni]; (5) paketa e dëmtuar rimbursohet sipas [kushtet]. Dërgojmë vetëm produkte që lejohen në vendin tuaj sipas informacionit që kemi verifikuar. Nuk premtojmë afate që varen nga korrieri ose dogana, por ju njoftojmë menjëherë për çdo vonesë.',
    feedbackQuestionsSq: [
      'Në çfarë gjendje mbërriti paketa dhe sa zgjati dërgesa?',
      'Si krahasohej kostoja totale me informacionin që morët para pagesës?',
      'Cilin produkt kërkuat në katalog dhe nuk e gjetët?',
    ],
    goCriteriaSq: [
      'Të paktën 20 porosi me pagesë në 2 muajt e parë nga 1 vend i verifikuar.',
      'Mbi 25% e blerësve porosisin sërish brenda 4 muajve, përfshirë sezonin e festave.',
      'Paketat e dëmtuara ose të kthyera mbeten nën 3%.',
    ],
    killCriteriaSq: [
      'Pas 6 javësh me katalogun të ndarë në rrjet dhe në grupe, më pak se 10 porosi me pagesë.',
      'Rregullat e importit ndalojnë shumicën e produkteve në vendet ku keni rrjet.',
      'Pas paketimit dhe tarifave, marzhi për porosi mbetet nën 25% të çmimit të produkteve.',
    ],
    phaseNotesSq: {
      p10_20: [
        'Intervistoni 15 persona në diasporë për blerjen ose sjelljen e fundit të produkteve nga vendi dhe sa u kushtoi.',
      ],
      p20_30: [
        'Shihni çfarë shesin dyqanet etnike dhe tregjet online në vendin e destinacionit, me çmime dhe kosto dërgese reale.',
      ],
      p40_50: [
        'Verifikoni me shkrim rregullat e importit dhe të etiketimit për çdo kategori produkti në vendin e parë të destinacionit, si dhe regjistrimin e prodhuesve furnitorë.',
      ],
      p50_60: ['Dërgoni 2–3 paketa provë te të afërm jashtë vendit dhe matni kohën, dëmtimet dhe taksat.'],
      p70_80: ['Pranoni porositë e para vetëm për produktet e verifikuara dhe dokumentoni çdo problem me dërgesat.'],
    },
    assumptionsSq: [
      'Diaspora në vendin e parë të destinacionit pranon ta paguajë transportin ndërkombëtar veçmas.',
      'Prodhuesit vendas pranojnë të furnizojnë sasi të vogla dhe, me kohë, me pagesë pas shitjes.',
      'Rregullat e importit lejojnë të paktën produktet artizanale dhe disa ushqime të paketuara në vendin e parë të destinacionit (duhet verifikuar).',
      'Interesi verbal dhe pëlqimet në rrjete nuk janë provë; vetëm porositë me pagesë dhe blerjet e përsëritura e konfirmojnë kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },
];
