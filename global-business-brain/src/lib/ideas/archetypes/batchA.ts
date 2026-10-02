import type { BusinessArchetype } from '@/lib/domain/types';

/**
 * Batch A — shërbime me kapital të ulët, të përshtatshme për nisje individuale.
 * The first entry is the reference example for tone, depth and honesty; keep new entries at this level.
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
];
