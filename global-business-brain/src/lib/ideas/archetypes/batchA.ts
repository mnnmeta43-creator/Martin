import type { BusinessArchetype } from '@/lib/domain/types';

/**
 * Batch A — shërbime me kapital të ulët, të përshtatshme për nisje individuale.
 * The first entry is the reference example for tone, depth and honesty; keep new entries at this level.
 * Most entries start solo from home; turnover cleaning needs a partner, and photo/translation work can
 * serve international clients online. All amounts are general USD assumptions at US price levels;
 * every legal statement asks for local verification.
 */
export const BATCH_A: BusinessArchetype[] = [
  {
    id: 'mirembajtje-prezence-online-per-biznese-lokale',
    nameSq: 'Mirëmbajtje e prezencës online për biznese lokale',
    taglineSq: 'Faqe e thjeshtë, profil në harta dhe orare të sakta — me abonim mujor.',
    descriptionSq:
      'Shërbim mujor për biznese të vogla lokale (restorante, dyqane, servise, klinika jo-mjekësore, zyra) që nuk kanë kohë të mbajnë të sakta faqen web, profilin në hartat online, oraret, menunë/çmimet dhe fotot. Fokusi nuk është “marketing”, por saktësia e informacionit që klienti kërkon para se të vijë.',
    sector: 'digjitale',
    offerSq:
      'Paketë mujore: ngritje ose rregullim i një faqeje 1–3 faqesh, menaxhim i profilit në hartat online, përditësim i orareve/çmimeve brenda 48 orëve, 10 foto të reja në tremujor dhe raport mujor me pyetjet që klientët bëjnë më shpesh.',
    payingCustomerSq: 'Pronari ose menaxheri i një biznesi lokal me 1–20 punonjës.',
    customerSegments: ['b2b'],
    problemSq:
      'Klientët gjejnë orare, numra telefoni ose çmime të vjetruara online, telefonojnë kot ose shkojnë te konkurrenti; pronari e di, por nuk ka kohë ose njohuri ta mbajë të përditësuar çdo javë.',
    modes: ['online', 'kombinuar'],
    marketScopes: ['lokal'],
    canStartFromHome: true,
    minTeam: 'vetem',
    requiredSkills: ['dizajn_web'],
    helpfulSkills: ['fotografi_video', 'shitje', 'marketing_digjital', 'sherbim_klienti'],
    helpfulAssets: ['kompjuter', 'telefon_smart', 'internet_i_qendrueshem', 'kamera'],
    minHoursPerWeek: 10,
    regulated: false,
    regulationNotesSq: [
      'Regjistrimi si person fizik/ent tregtar dhe faturimi: Kërkon verifikim lokal.',
      'Nëse përpunoni të dhëna personale të klientëve të biznesit (p.sh. formularë rezervimi), verifikoni rregullat lokale të mbrojtjes së të dhënave.',
    ],
    licensedProfessionalsSq: [],
    adultOnly: false,
    zeroCapitalTestSq:
      'Me kompjuterin dhe telefonin që keni: zgjidhni 30 biznese në një zonë, kontrolloni nëse informacioni i tyre online është i pasaktë, dhe u tregoni personalisht 3 gabimet konkrete që gjetët. Ofroni rregullimin e parë falas për 3 prej tyre në këmbim të një takimi 15-minutësh për rezultatin. Kostoja reale: koha juaj dhe transporti lokal.',
    revenueModelSq:
      'Abonim mujor fiks për biznes (çmimi për njësi = 1 abonim/muaj) plus tarifë e vetme ngritjeje kur ndërtohet faqja nga e para (opsionale, jo e përfshirë në modelin bazë).',
    pricing: {
      unitLabelSq: 'abonim mujor',
      priceUSD: { low: 25, base: 45, high: 80 },
      variableCostUSD: { low: 2, base: 5, high: 9 },
      unitsPerCustomerPerMonth: 1,
      collectionDays: 15,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin hostimin/domenin për klient dhe mjete të vogla. Çmimet janë supozime fillestare në USD; verifikojini duke pyetur 10 biznese sa paguajnë sot për diçka të ngjashme.',
    },
    startupCosts: [
      {
        id: 'domain-portfolio',
        labelSq: 'Domen + faqe portofoli për veten',
        category: 'hapje',
        lowUSD: 20,
        highUSD: 80,
        noteSq: 'Një domen vjetor dhe hostim bazë; mund të përdorni plan falas në fillim.',
        scalesWithPriceLevel: false,
        optional: true,
      },
      {
        id: 'laptop',
        labelSq: 'Laptop pune',
        category: 'pajisje',
        lowUSD: 400,
        highUSD: 900,
        noteSq: 'Nevojitet vetëm nëse nuk keni kompjuter; një laptop i përdorur në gjendje të mirë mjafton.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['kompjuter'],
      },
      {
        id: 'registration-fees',
        labelSq: 'Regjistrim aktiviteti dhe vula/faturim',
        category: 'tarifa',
        lowUSD: 0,
        highUSD: 150,
        noteSq: 'Tarifat ndryshojnë sipas vendit dhe formës ligjore; merrni shumën e saktë nga regjistri zyrtar i bizneseve.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: printime, transport, 3 rregullime pilot',
        category: 'testim_tregu',
        lowUSD: 30,
        highUSD: 150,
        noteSq: 'Fletë-shembuj me gabimet e gjetura, transport për takime, hostim për 3 pilotë gjatë 2 muajve.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'software-tools',
        labelSq: 'Mjete software (dizajn, menaxhim fjalëkalimesh, backup)',
        category: 'software',
        lowUSD: 15,
        highUSD: 60,
        noteSq: 'Shumë mjete kanë plane falas për 1–5 klientë; rritet me numrin e klientëve.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'phone-internet',
        labelSq: 'Telefon dhe internet pune',
        category: 'sherbime_komunale',
        lowUSD: 10,
        highUSD: 40,
        noteSq: 'Pjesa e faturës që lidhet me punën; verifikoni paketat e operatorëve lokalë.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'local-transport',
        labelSq: 'Transport për takime dhe foto',
        category: 'transport',
        lowUSD: 10,
        highUSD: 50,
        noteSq: 'Varet nga distanca mes klientëve; grupimi i klientëve në një zonë e ul këtë kosto.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'bookkeeping',
        labelSq: 'Kontabilist i jashtëm',
        category: 'kontabilitet',
        lowUSD: 0,
        highUSD: 60,
        noteSq: 'Në disa vende aktiviteti i vogël mund ta mbajë vetë kontabilitetin; verifikoni detyrimet lokale.',
        scalesWithPriceLevel: true,
        optional: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 0, monthlyNewCustomers: 1, monthlyChurnPct: 6 },
      baze: { startCustomers: 1, monthlyNewCustomers: 2, monthlyChurnPct: 4 },
      optimist: { startCustomers: 2, monthlyNewCustomers: 4, monthlyChurnPct: 3 },
    },
    seasonality: [0.9, 0.9, 1, 1.05, 1.1, 1.1, 1.05, 0.9, 1, 1.05, 1, 0.95],
    seasonalityNoteSq:
      'Abonimet janë relativisht të qëndrueshme; shitjet e reja zakonisht rriten para sezonit turistik dhe bien në gusht kur pronarët janë më pak të disponueshëm.',
    macroLinks: [
      {
        indicatorCode: 'internet_users_pct',
        direction: 'me_i_larte_mbeshtet',
        referenceValue: 60,
        mechanismSq:
          'Sa më shumë njerëz përdorin internetin, aq më shumë klientë kërkojnë online orare, adresa dhe çmime para se të vijnë — dhe aq më shumë kushton informacioni i pasaktë.',
        ifSupportsSq: 'Përdorimi i lartë i internetit e bën më të besueshëm problemin “klientët më kërkojnë online”.',
        ifContradictsSq:
          'Me përdorim të ulët të internetit, shumë biznese lokale mund të mos e ndiejnë problemin; testoni me kujdes para se të investoni kohë.',
      },
      {
        indicatorCode: 'services_va_gdp',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Një ekonomi ku shërbimet zënë pjesë të madhe ka zakonisht më shumë biznese të vogla që shërbejnë klientë fundorë — tregu i mundshëm i këtij shërbimi.',
        ifSupportsSq: 'Pesha e lartë e shërbimeve sugjeron numër të madh klientësh potencialë (duhet konfirmuar lokalisht).',
        ifContradictsSq: 'Pesha e ulët e shërbimeve sugjeron më pak biznese të përshtatshme në zonë.',
      },
      {
        indicatorCode: 'tourism_arrivals',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Turistët nuk e njohin qytetin dhe mbështeten pothuajse tërësisht te informacioni online; rritja e tyre rrit koston e informacionit të gabuar për restorantet dhe dyqanet.',
        ifSupportsSq: 'Rritja e vizitorëve rrit vlerën e profileve të sakta online në zonat turistike.',
        ifContradictsSq: 'Pa rritje turizmi, argumenti kryesor mbetet klientela vendase.',
      },
    ],
    whyItCouldWork: {
      changeSq: 'Gjithnjë e më shumë klientë vendosin ku të shkojnë pasi kontrollojnë telefonin, edhe për biznese shumë lokale.',
      problemSq: 'Informacioni i vjetruar online (orare, çmime, numra) u kushton bizneseve klientë dhe telefonata të humbura.',
      customerSq: 'Pronarët e bizneseve të vogla që punojnë në lokal dhe nuk kanë staf marketingu.',
      offerSq: 'Dikush që e mban informacionin të saktë çdo muaj, me një çmim të parashikueshëm.',
      reasonToPaySq: 'Kursim kohe dhe më pak klientë të humbur; pronari paguan për “një gjë më pak për t’u shqetësuar”.',
      profitConditionsSq:
        'Fitimi kërkon që një person të menaxhojë 15–30 klientë me pak orë secili, që klientët të mos largohen shpejt dhe që ata të paguajnë në kohë.',
    },
    failureModes: [
      { kind: 'kerkese_e_pamjaftueshme', textSq: 'Pronarët e pranojnë problemin, por nuk e konsiderojnë të mjaftueshëm sa të paguajnë çdo muaj.' },
      { kind: 'cmim', textSq: 'Çmimi që pranojnë të paguajnë është shumë i ulët për të mbuluar orët që kërkon çdo klient.' },
      { kind: 'konkurrence', textSq: 'Nipërit, të afërmit ose freelancerë me çmim shumë të ulët e bëjnë punën “falas”.' },
      { kind: 'kosto', textSq: 'Çdo klient kërkon më shumë orë sesa ishte planifikuar (ndryshime të shpeshta, takime).' },
      { kind: 'vonesa_pagesash', textSq: 'Bizneset e vogla vonojnë pagesat mujore; paraja mbaron edhe pse ka klientë.' },
      { kind: 'aftesi', textSq: 'Pa aftësi shitjeje, ofrimi te pronarët ngec edhe kur shërbimi është i mirë.' },
      { kind: 'operacionale', textSq: 'Me shumë klientë, përditësimet brenda 48 orëve bëhen të vështira pa procese dhe lista kontrolli.' },
    ],
    falsifiersSq: [
      'Nga 30 biznese të kontrolluara, më pak se 5 kanë informacion online të pasaktë ose të paplotë.',
      'Nga 15 pronarë të intervistuar, asnjë nuk mund të kujtojë një rast konkret kur humbi klient ose kohë për shkak të informacionit online.',
      'Pas 20 ofertave konkrete me çmim, më pak se 2 pranojnë të paguajnë muajin e parë.',
    ],
    differentiationSq: [
      'Afat i shkruar në kontratë: çdo ndryshim bëhet brenda 48 orëve (angazhim shërbimi, jo premtim fitimi).',
      'Specializim në një lloj biznesi (p.sh. vetëm restorante) me shabllone dhe njohuri të sektorit.',
      'Raport mujor i thjeshtë me pyetjet që bëjnë klientët, që pronari e kupton pa terma teknikë.',
    ],
    competitorTypesSq: [
      'Agjenci marketingu digjital me paketa më të shtrenjta',
      'Freelancerë që ndërtojnë faqen dhe largohen pa mirëmbajtje',
      'Të afërm ose punonjës që e bëjnë herë pas here',
      'Platforma “bëje vetë” për faqe web',
    ],
    cheapestTestSq:
      'Auditim falas i informacionit online për 30 biznese në një zonë, i ndjekur nga 20 oferta me çmim konkret për muajin e parë. Masni sa pranojnë të paguajnë, jo sa thonë “interesante”.',
    interviewQuestionsSq: [
      'Kur ishte hera e fundit që një klient ju tha se gjeti orar ose çmim të gabuar online?',
      'Kush e përditëson sot informacionin tuaj online dhe sa shpesh e bën?',
      'Sa kohë ju mori hera e fundit që u desh të ndryshonit diçka online?',
      'Çfarë keni provuar më parë për këtë dhe pse e latë?',
      'Sa paguani sot për faqen, domenin ose këdo që ju ndihmon me këtë?',
      'Nga vijnë zakonisht klientët e rinj, sipas asaj që shihni ju?',
      'Kush tjetër merr pjesë në vendimin për të paguar për një shërbim të tillë?',
    ],
    firstCustomers: {
      whereSq: [
        'Rrugët me përqendrim restorantesh, dyqanesh dhe servisesh në qytetin tuaj',
        'Bizneset ku vetë jeni klient dhe ku keni vënë re informacion të gabuar',
        'Shoqatat lokale të biznesit ose dhomat e tregtisë (takime të hapura)',
      ],
      howToContactSq: [
        'Vizitë personale në orë të qeta (jo në kulmin e punës), me fletën e gabimeve të gjetura për atë biznes',
        'Mesazh i personalizuar në kanalin publik të biznesit, një herë, pa mesazhe masive ose lista të blera',
        'Rekomandim nga një klient pilot i kënaqur',
      ],
      offerSq: 'Rregullim falas i 3 gabimeve të gjetura, pastaj abonim mujor pa detyrim afatgjatë (anulim me njoftim 30-ditor).',
      followUpSq:
        'Regjistroni çdo kontakt në një tabelë (data, përgjigjja, hapi i radhës); një rikujtesë e vetme pas 7 ditësh, pastaj ndaloni nëse nuk ka interes.',
      metricsSq: [
        'Kontakte → takime (%)',
        'Takime → abonime me pagesë (%)',
        'Orë pune për klient në muaj',
        'Klientë që anulojnë në 3 muajt e parë',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje, jam [emri]. Kontrollova si shfaqet [emri i biznesit] online dhe gjeta 3 gjëra që mund t’ju kushtojnë klientë: [gabimi 1], [gabimi 2], [gabimi 3]. Mund t’i rregulloj falas këtë javë. Nëse ju duket e dobishme, ofroj ta mbaj gjithçka të saktë çdo muaj për [çmimi] — pa kontratë afatgjatë.',
    offerTemplateSq:
      'Oferta për [emri i biznesit]: (1) rregullim i informacionit online brenda 7 ditësh; (2) përditësim i orareve/çmimeve brenda 48 orëve nga kërkesa juaj; (3) 10 foto të reja në tremujor; (4) raport mujor. Çmimi: [çmimi] në muaj, pagesë brenda 15 ditëve nga fatura. Anulim me njoftim 30-ditor. Nuk premtojmë rritje shitjesh; premtojmë informacion të saktë dhe në kohë.',
    feedbackQuestionsSq: [
      'Çfarë ndryshoi në punën tuaj të përditshme pas muajit të parë?',
      'Cila pjesë e shërbimit ju duket më pak e vlefshme?',
      'A ka ndodhur ndonjë rast që ndryshimi nuk u bë në kohë?',
      'Kujt tjetër do t’ia përmendnit këtë shërbim dhe pse?',
    ],
    goCriteriaSq: [
      'Të paktën 3 biznese paguajnë muajin e parë pa zbritje pas 20 ofertave konkrete.',
      'Koha mesatare për klient mbetet nën 4 orë në muaj pas muajit të dytë.',
    ],
    killCriteriaSq: [
      'Pas 40 kontakteve dhe 20 ofertave, më pak se 2 klientë me pagesë.',
      'Më shumë se gjysma e klientëve pilot anulojnë brenda 2 muajve.',
      'Çmimi i pranuar nga tregu nuk mbulon kostot dhe pagën minimale që ju nevojitet edhe me 25 klientë.',
    ],
    phaseNotesSq: {
      p10_20: ['Kontrolloni 30 biznese dhe dokumentoni gabimet me foto ekrani para çdo interviste.'],
      p20_30: ['Krahasoni çmimet e agjencive dhe freelancerëve duke kërkuar oferta reale, jo duke supozuar.'],
      p60_70: ['Pilot me 3 biznese për 6 javë; matni orët e punës për secilin.'],
    },
    assumptionsSq: [
      'Një person mund të shërbejë 15–30 klientë me procese të standardizuara.',
      'Bizneset lokale paguajnë rregullisht abonime të vogla mujore.',
      'Hostimi dhe mjetet mund të mbahen nën 10% të çmimit për klient.',
      'Interesi verbal nuk është provë; vetëm pagesa e muajit të parë konfirmon kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Bookkeeping & admin for micro-businesses — home, solo, low capital, B2B;
  //    statements are drafted and signed by a licensed accountant, not by this service
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'kontabilitet-dhe-administrim-per-mikrobiznese',
    nameSq: 'Mbajtje librash dhe administrim dokumentesh për mikrobiznese',
    taglineSq: 'Faturat, shpenzimet dhe afatet e muajit në rregull — dosje e plotë për kontabilistin e licencuar.',
    descriptionSq:
      'Shërbim mujor për mikrobiznese me 1–10 persona (dyqane, servise, zanatçinj, profesionistë të lirë) që i mbajnë faturat në çanta, në telefon ose në email dhe humbasin orë çdo muaj duke i kërkuar. Shërbimi mbledh dhe rendit dokumentet, regjistron të ardhurat dhe shpenzimet, përgatit faturat dhe kujtesat e pagesave, ndjek afatet dhe i dorëzon kontabilistit të licencuar të klientit një dosje të plotë çdo muaj. Hartimi, nënshkrimi dhe dorëzimi i pasqyrave financiare dhe i deklaratave tatimore mbeten te kontabilisti i licencuar, aty ku ligji e kërkon.',
    sector: 'sherbime_biznesi',
    offerSq:
      'Paketë mujore: mbledhje e dokumenteve një herë në javë (me foto, me email ose në një kuti fizike), regjistrim i të ardhurave dhe i shpenzimeve në një program kontabiliteti, përgatitje e faturave për klientët dhe kujtesa për pagesat e vonuara, kalendar i afateve tatimore dhe administrative, dosje mujore e rregulluar për kontabilistin e licencuar dhe një përmbledhje njëfaqëshe: sa hyri, sa doli dhe kush ju detyrohet.',
    payingCustomerSq: 'Pronari i një mikrobiznesi ose profesionisti i lirë që e bën vetë administrimin dhe nuk ka staf zyre.',
    customerSegments: ['b2b'],
    problemSq:
      'Pronarët e bizneseve të vogla i lënë dokumentet për fund të muajit, humbasin fatura, vonojnë faturimin e klientëve dhe rrezikojnë gjoba për afate të harruara; kontabilisti merr dokumente të paplota dhe faturon më shumë kohë, ndërsa pronari nuk e di sa fiton realisht.',
    modes: ['kombinuar', 'online'],
    marketScopes: ['lokal'],
    canStartFromHome: true,
    minTeam: 'vetem',
    requiredSkills: ['kontabilitet', 'administrim'],
    helpfulSkills: ['analize_te_dhenash', 'sherbim_klienti', 'shitje'],
    helpfulAssets: ['kompjuter', 'internet_i_qendrueshem', 'telefon_smart', 'rrjet_kontaktesh'],
    minHoursPerWeek: 15,
    regulated: true,
    regulationNotesSq: [
      'Në shumë vende, hartimi, nënshkrimi dhe dorëzimi i pasqyrave financiare dhe i disa deklaratave tatimore lejohen vetëm për kontabilistë të licencuar ose të miratuar. Cilat detyra mund t’i kryejë një person pa licencë (regjistrime, faturim, rendje dokumentesh): Kërkon verifikim lokal para se ta ofroni shërbimin.',
      'Mos e paraqitni veten si “kontabilist” ose “ekspert kontabël” nëse titulli mbrohet me ligj dhe nuk e keni licencën; verifikoni si mund ta emërtoni ligjërisht shërbimin tuaj.',
      'Dokumentet e klientëve përmbajnë të dhëna personale dhe financiare: verifikoni rregullat lokale të mbrojtjes së të dhënave, nënshkruani marrëveshje me shkrim për përpunimin e tyre dhe ruajini me fjalëkalim dhe kopje rezervë.',
      'Në disa vende, ofruesit e shërbimeve kontabël kanë detyrime për parandalimin e pastrimit të parave (identifikimi i klientit, raportimi i transaksioneve të dyshimta): Kërkon verifikim lokal.',
      'Regjistrimi i aktivitetit, faturimi dhe sigurimi i përgjegjësisë profesionale: verifikoni kërkesat në regjistrin zyrtar të bizneseve dhe pranë administratës tatimore.',
    ],
    licensedProfessionalsSq: [
      'Kontabilist i licencuar ose i miratuar për hartimin, nënshkrimin dhe dorëzimin e pasqyrave financiare dhe të deklaratave tatimore (ku ligji e kërkon)',
      'Këshilltar tatimor i licencuar për pyetje tatimore që dalin jashtë regjistrimeve rutinë (aty ku ky profesion ekziston)',
    ],
    adultOnly: true,
    zeroCapitalTestSq:
      'Me kompjuterin tuaj dhe një program kontabiliteti me plan falas: ofroni 3 mikrobizneseve që njihni të rregulloni falas dokumentet e një muaji (fatura, shpenzime, pagesa të papaguara) dhe t’ua dorëzoni të renditura bashkë me përmbledhjen njëfaqëshe, në këmbim të një takimi 20-minutësh për rezultatin dhe të një kontakti me kontabilistin e tyre. Pastaj u bëni 15 bizneseve të tjera ofertë me çmim për muajin e ardhshëm. Kostoja reale: koha juaj, transporti dhe, para punës së rregullt me pagesë, regjistrimi i aktivitetit (kërkon verifikim lokal).',
    revenueModelSq:
      'Abonim mujor fiks për biznes (njësia = 1 abonim/muaj), me nivel çmimi sipas numrit të dokumenteve në muaj (p.sh. deri në 50 ose deri në 150). Rregullimi i dokumenteve të muajve të kaluar faturohet veçmas dhe nuk përfshihet në modelin bazë.',
    pricing: {
      unitLabelSq: 'abonim mujor',
      priceUSD: { low: 70, base: 140, high: 280 },
      variableCostUSD: { low: 3, base: 8, high: 18 },
      unitsPerCustomerPerMonth: 1,
      collectionDays: 30,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin licencën e programit të kontabilitetit ose të skanimit për çdo klient, hapësirën në re dhe printimet. Çmimi varet kryesisht nga numri i dokumenteve në muaj, jo nga madhësia e biznesit. Çmimet janë supozime fillestare në USD; verifikojini duke pyetur 10 mikrobiznese sa i paguajnë sot kontabilistit dhe sa orë humbasin vetë me dokumentet, dhe duke kërkuar ofertat e 3 zyrave kontabël.',
    },
    startupCosts: [
      {
        id: 'laptop',
        labelSq: 'Laptop pune',
        category: 'pajisje',
        lowUSD: 400,
        highUSD: 900,
        noteSq: 'Nevojitet vetëm nëse nuk keni kompjuter; një laptop i përdorur në gjendje të mirë mjafton për programet e kontabilitetit.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['kompjuter'],
      },
      {
        id: 'scanner',
        labelSq: 'Skaner dokumentesh me ushqyes automatik dhe printer',
        category: 'pajisje',
        lowUSD: 120,
        highUSD: 400,
        noteSq:
          'Kursen orë kur klientët sjellin dokumente letre; në fillim mjafton skanimi me telefon përmes një aplikacioni falas. Krahasoni 2–3 modele sipas shpejtësisë së skanimit.',
        scalesWithPriceLevel: false,
        optional: true,
      },
      {
        id: 'training',
        labelSq: 'Kurs praktik për programin e kontabilitetit dhe rregullat bazë të faturimit',
        category: 'hapje',
        lowUSD: 0,
        highUSD: 300,
        noteSq:
          'Nëse keni përvojë, mund ta anashkaloni; përndryshe krahasoni kurset e shoqatave profesionale ose të qendrave të formimit dhe pyesni çfarë certifikate japin.',
        scalesWithPriceLevel: true,
        optional: true,
      },
      {
        id: 'registration-fees',
        labelSq: 'Regjistrim aktiviteti dhe faturim',
        category: 'tarifa',
        lowUSD: 0,
        highUSD: 200,
        noteSq: 'Tarifat ndryshojnë sipas vendit dhe formës ligjore; merrni shumën e saktë nga regjistri zyrtar i bizneseve.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: printime, transport dhe 3 klientë pilot',
        category: 'testim_tregu',
        lowUSD: 30,
        highUSD: 150,
        noteSq:
          'Fletë me ofertën dhe një shembull të përmbledhjes mujore, transport për takime dhe licenca programi për 3 klientë pilot gjatë 2 muajve.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'accounting-software',
        labelSq: 'Program kontabiliteti, ruajtje në re dhe menaxher fjalëkalimesh',
        category: 'software',
        lowUSD: 20,
        highUSD: 80,
        noteSq: 'Shumë programe kanë plane falas ose të lira për pak klientë; kostoja rritet me numrin e bizneseve që menaxhoni.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'professional-insurance',
        labelSq: 'Sigurim i përgjegjësisë profesionale',
        category: 'sigurime',
        lowUSD: 10,
        highUSD: 60,
        noteSq:
          'Mbulon dëmin që mund t’i shkaktojë klientit një gabim në regjistrime; pyesni 2–3 agjenci dhe verifikoni nëse kërkohet me ligj për shërbimin tuaj.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'phone-internet',
        labelSq: 'Telefon dhe internet pune',
        category: 'sherbime_komunale',
        lowUSD: 10,
        highUSD: 40,
        noteSq: 'Pjesa e faturës që lidhet me punën; verifikoni paketat e operatorëve lokalë.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'local-transport',
        labelSq: 'Transport për marrjen e dokumenteve dhe takime',
        category: 'transport',
        lowUSD: 10,
        highUSD: 60,
        noteSq: 'Varet nga sa klientë dërgojnë dokumentet në mënyrë digjitale; grupimi i klientëve në një zonë e ul këtë kosto.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'accountant-review',
        labelSq: 'Rishikim periodik nga një kontabilist i licencuar',
        category: 'kontabilitet',
        lowUSD: 0,
        highUSD: 120,
        noteSq:
          'Një kontabilist i licencuar që kontrollon me kampion punën tuaj çdo muaj ose tremujor ul gabimet dhe ju mëson rregullat lokale; negocioni tarifë fikse ose bashkëpunim me referime të ndërsjella.',
        scalesWithPriceLevel: true,
        optional: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 0, monthlyNewCustomers: 1, monthlyChurnPct: 4 },
      baze: { startCustomers: 1, monthlyNewCustomers: 2, monthlyChurnPct: 3 },
      optimist: { startCustomers: 2, monthlyNewCustomers: 3, monthlyChurnPct: 2 },
    },
    seasonality: [1.1, 1.05, 1.05, 1, 0.95, 0.95, 0.95, 0.9, 1, 1, 1, 1.05],
    seasonalityNoteSq:
      'Abonimet janë të qëndrueshme gjatë vitit. Hipotezë: kërkesa e re dhe puna shtesë rriten në fillim të vitit dhe para afateve vjetore të deklarimit, ndërsa vera është më e qetë. Afatet ndryshojnë sipas vendit; verifikojini dhe përshtatni kurbën.',
    macroLinks: [
      {
        indicatorCode: 'new_business_density',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Sa më shumë biznese të reja regjistrohen në raport me popullsinë në moshë pune, aq më shumë pronarë përballen për herë të parë me fatura, afate dhe dokumente pa pasur staf administrativ.',
        ifSupportsSq:
          'Dendësia e lartë e bizneseve të reja sugjeron një rrjedhë të vazhdueshme klientësh të mundshëm që kanë nevojë për rregull në dokumente.',
        ifContradictsSq:
          'Me pak biznese të reja, tregu varet nga bizneset ekzistuese që shpesh kanë tashmë kontabilist; specializohuni në një nish (p.sh. profesionistë të lirë) dhe testoni me kujdes.',
      },
      {
        indicatorCode: 'private_credit_gdp',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Kur kredia për sektorin privat është më e përhapur, më shumë mikrobiznese aplikojnë për kredi ose qira financiare, dhe bankat kërkojnë regjistrime të rregullta dhe pasqyra të besueshme.',
        ifSupportsSq:
          'Kredia e përhapur e rrit vlerën e dokumenteve të rregullta: pronari paguan edhe për të qenë gati kur i duhet financim.',
        ifContradictsSq:
          'Me kredi të pakët, argumenti “gati për bankën” është i dobët; mbështetuni te kursimi i kohës dhe shmangia e gjobave.',
      },
      {
        indicatorCode: 'services_va_gdp',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Ekonomitë ku shërbimet zënë peshë të madhe kanë zakonisht shumë biznese të vogla shërbimi (servise, profesionistë, tregti e vogël) me shumë fatura të vogla dhe pa staf zyre.',
        ifSupportsSq:
          'Pesha e lartë e shërbimeve sugjeron më shumë klientë të mundshëm me nevojë për administrim të rregullt (duhet konfirmuar lokalisht).',
        ifContradictsSq:
          'Me peshë të ulët të shërbimeve, bizneset e vogla mund të jenë më të pakta ose më të shpërndara; numëroni klientët e mundshëm në zonë para se të investoni kohë.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Gjithnjë e më shumë fatura, pagesa dhe njoftime zyrtare kalojnë në formë elektronike, ndërsa mikrobizneset vazhdojnë të mos kenë staf administrativ.',
      problemSq:
        'Dokumentet e çrregullta u kushtojnë pronarëve orë pune, fatura të paarkëtuara, tarifa më të larta te kontabilisti dhe rrezik gjobash për afate të humbura.',
      customerSq: 'Pronarë mikrobiznesesh dhe profesionistë të lirë që e bëjnë vetë administrimin në mbrëmje ose në fundjavë.',
      offerSq: 'Një person i besuar që i mban dokumentet në rregull çdo muaj dhe i dorëzon kontabilistit të licencuar një dosje të plotë.',
      reasonToPaySq:
        'Kohë e kursyer, më pak para të harruara te klientët dhe qetësi për afatet; mundësisht edhe më pak orë të faturuara nga kontabilisti, sepse merr dokumente të plota.',
      profitConditionsSq:
        'Fitimi kërkon 15–25 klientë me procese standarde (dokumentet vijnë në të njëjtën mënyrë çdo javë), çmim sipas vëllimit të dokumenteve dhe pagesa të rregullta brenda 30 ditëve.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq: 'Pronarët e pranojnë rrëmujën, por e shohin si punë që e bëjnë “falas” vetë dhe nuk paguajnë çdo muaj.',
      },
      {
        kind: 'cmim',
        textSq: 'Klientët e krahasojnë çmimin me tarifën e ulët të kontabilistit ekzistues, edhe pse ai nuk bën administrimin e përditshëm.',
      },
      {
        kind: 'konkurrence',
        textSq: 'Zyrat kontabël ofrojnë paketa të plota, ndërsa programet e faturimit premtojnë automatizim pa ndihmë njerëzore.',
      },
      {
        kind: 'kosto',
        textSq: 'Disa klientë sjellin dokumente shumë të çrregullta dhe kërkojnë dyfishin e orëve të planifikuara.',
      },
      {
        kind: 'vonesa_pagesash',
        textSq: 'Mikrobizneset me para të pakta vonojnë pikërisht pagesën e shërbimeve administrative.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Kalimi pa dashje në punë që lejohet vetëm për kontabilistë të licencuar, ose një gabim që i shkakton klientit gjobë, sjell përgjegjësi ligjore dhe humbje besimi.',
      },
      {
        kind: 'aftesi',
        textSq: 'Pa njohje të mirë të rregullave të faturimit dhe të programit, gabimet e vogla përsëriten çdo muaj.',
      },
    ],
    falsifiersSq: [
      'Nga 20 mikrobiznese të intervistuara, më pak se 6 kanë humbur fatura, kanë paguar gjobë ose kanë vonuar faturimin gjatë vitit të fundit.',
      'Pas 20 ofertave me çmim konkret, më pak se 2 biznese paguajnë muajin e parë.',
      'Pas 3 muajsh me klientë pilot, puna mesatare për klient kalon 8 orë në muaj me çmimin bazë, pra çmimi nuk e mbulon kohën.',
      'Kontabilistët e licencuar në zonë refuzojnë të punojnë me dosje të përgatitura nga të tjerët ose e ofrojnë vetë administrimin me çmim më të ulët.',
    ],
    differentiationSq: [
      'Dorëzim i dokumenteve me një rutinë të thjeshtë javore (foto ose kuti fizike), pa pritur fundin e muajit.',
      'Përmbledhje njëfaqëshe çdo muaj në gjuhë të thjeshtë: sa hyri, sa doli, kush ju detyrohet dhe cili afat po vjen.',
      'Bashkëpunim i qartë me kontabilistin e licencuar të klientit, jo konkurrencë me të.',
      'Specializim në një lloj biznesi (p.sh. vetëm servise ose profesionistë të lirë) me lista kontrolli të gatshme.',
    ],
    competitorTypesSq: [
      'Zyra kontabël që ofrojnë paketa të plota me kontabilist të licencuar',
      'Programe faturimi dhe kontabiliteti “bëje vetë”',
      'Të afërm ose punonjës që e bëjnë administrimin herë pas here',
      'Kontabilistë të pavarur që marrin dokumentet vetëm në fund të muajit',
    ],
    cheapestTestSq:
      'Rregullim falas i dokumenteve të një muaji për 3 mikrobiznese, i ndjekur nga 20 oferta me çmim konkret për muajin e ardhshëm. Masni sa paguajnë dhe sa orë kërkon realisht çdo klient, jo sa thonë se “kanë nevojë”.',
    interviewQuestionsSq: [
      'Si i mblidhni sot faturat dhe shpenzimet gjatë muajit?',
      'Kur ishte hera e fundit që nuk e gjetët një faturë ose një dokument kur ju duhej?',
      'Sa orë ju mori muajin e kaluar puna me dokumentet, faturat dhe pagesat?',
      'Sa i paguani sot kontabilistit dhe çfarë përfshin saktësisht ajo pagesë?',
      'Keni paguar ndonjëherë gjobë ose kamatë për një afat të humbur? Çfarë ndodhi?',
      'Sa para ju detyrojnë klientët tani dhe si i ndiqni pagesat e vonuara?',
      'Çfarë keni provuar më parë për t’i mbajtur dokumentet në rregull dhe pse e latë?',
    ],
    firstCustomers: {
      whereSq: [
        'Mikrobiznese ku jeni vetë klient ose që i njihni personalisht (servise, dyqane, zanatçinj)',
        'Profesionistë të lirë që sapo kanë hapur aktivitetin',
        'Kontabilistë të licencuar që kanë shumë klientë të vegjël me dokumente të çrregullta (bashkëpunim për referime)',
        'Shoqatat lokale të biznesit dhe takimet e hapura të dhomave të tregtisë',
      ],
      howToContactSq: [
        'Vizitë personale në orë të qeta, me një shembull të përmbledhjes mujore dhe ofertën me shkrim',
        'Takime me 5 kontabilistë të licencuar për t’u ofruar dosje të rregullta për klientët e tyre të vegjël',
        'Rekomandime nga klientët pilot, pa lista të blera dhe pa mesazhe masive',
      ],
      offerSq: 'Rregullim falas i dokumenteve të një muaji, pastaj abonim mujor pa detyrim afatgjatë (anulim me njoftim 30-ditor).',
      followUpSq:
        'Regjistroni çdo kontakt në një tabelë (data, përgjigjja, hapi i radhës); një rikujtesë e vetme pas 7 ditësh, pastaj ndaloni nëse nuk ka interes.',
      metricsSq: [
        'Kontakte → takime (%)',
        'Takime → abonime me pagesë (%)',
        'Orë pune për klient në muaj',
        'Fatura të paguara brenda 30 ditëve (%)',
        'Klientë që anulojnë në 3 muajt e parë',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje, jam [emri]. Ndihmoj biznese si [emri i biznesit] t’i mbajnë faturat, shpenzimet dhe pagesat në rregull gjatë gjithë muajit, që kontabilisti juaj të marrë një dosje të plotë dhe ju të dini kush ju detyrohet. Nuk e zëvendësoj kontabilistin tuaj; bëj punën e përditshme që sot ju merr [numri] orë në muaj. Mund t’jua rregulloj falas dokumentet e një muaji, që ta shihni vetë rezultatin.',
    offerTemplateSq:
      'Oferta për [emri i biznesit]: (1) mbledhje e dokumenteve çdo [dita e javës], me foto ose në kuti; (2) regjistrim i të ardhurave dhe i shpenzimeve deri në [numri] dokumente në muaj; (3) përgatitje e faturave dhe kujtesa për pagesat e vonuara; (4) dosje mujore për kontabilistin tuaj të licencuar deri më [data]; (5) përmbledhje njëfaqëshe mujore. Çmimi: [çmimi] në muaj, pagesë brenda 30 ditëve nga fatura. Anulim me njoftim 30-ditor. Pasqyrat financiare dhe deklaratat i harton dhe i nënshkruan kontabilisti i licencuar; ne nuk premtojmë ulje taksash, por dokumente të plota dhe në kohë.',
    feedbackQuestionsSq: [
      'Sa orë ju kursyen gjatë muajit të fundit, sipas vlerësimit tuaj?',
      'Çfarë ju tha kontabilisti për dosjen që i dorëzuam?',
      'Cila pjesë e shërbimit ju duket më pak e dobishme?',
      'A ka pasur ndonjë dokument që humbi ose u vonua? Si ndodhi?',
    ],
    goCriteriaSq: [
      'Të paktën 3 biznese paguajnë muajin e parë me çmim të plotë pas 20 ofertave konkrete.',
      'Koha mesatare për klient mbetet nën 6 orë në muaj pas muajit të dytë.',
      'Të paktën 1 kontabilist i licencuar pranon bashkëpunimin dhe referon një klient brenda 3 muajve.',
    ],
    killCriteriaSq: [
      'Pas 40 kontakteve dhe 20 ofertave, më pak se 2 klientë me pagesë.',
      'Më shumë se gjysma e klientëve pilot anulojnë brenda 2 muajve.',
      'Verifikimi ligjor tregon se detyrat kryesore të paketës lejohen vetëm për kontabilistë të licencuar dhe nuk keni rrugë realiste për licencë ose partneritet.',
    ],
    phaseNotesSq: {
      p10_20: ['Intervistoni 20 pronarë mikrobiznesesh dhe 3 kontabilistë të licencuar për mënyrën si qarkullojnë dokumentet sot.'],
      p20_30: ['Kërkoni oferta reale nga 3 zyra kontabël për një mikrobiznes tipik dhe shënoni çfarë përfshijnë dhe çfarë jo.'],
      p40_50: [
        'Verifikoni me shkrim cilat detyra lejohen pa licencë kontabël, si emërtohet ligjërisht shërbimi dhe nëse keni detyrime për parandalimin e pastrimit të parave.',
      ],
      p50_60: ['Ndërtoni një listë kontrolli mujore dhe një strukturë dosjesh të njëjtë për çdo klient, me kopje rezervë të enkriptuar.'],
      p60_70: ['Pilot me 3 biznese për 2 muaj; matni orët për klient dhe dokumentet që mungojnë çdo muaj.'],
    },
    assumptionsSq: [
      'Një person mund të shërbejë 15–25 mikrobiznese me procese të standardizuara.',
      'Kontabilistët e licencuar e pranojnë punën përgatitore të një personi tjetër kur dosja është e rregullt.',
      'Detyrat e paketës (regjistrime, faturim, rendje dokumentesh) lejohen pa licencë në vendin tuaj — duhet verifikuar.',
      'Interesi verbal nuk është provë; vetëm pagesa e muajit të parë konfirmon kërkesën.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },
];
