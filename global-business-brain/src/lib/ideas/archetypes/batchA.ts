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

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Product photos + listing preparation — home studio, solo, online, can serve
  //    international sellers remotely
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'fotografi-produktesh-per-shites-online',
    nameSq: 'Fotografi produktesh dhe përgatitje listimesh për shitës online',
    taglineSq: 'Foto të pastra, përmasa të sakta dhe përshkrime të qarta — nga një studio e vogël në shtëpi.',
    descriptionSq:
      'Shërbim për shitës të vegjël online (artizanë, dyqane me faqe interneti, shitës në tregjet online dhe në rrjetet sociale) që i fotografojnë produktet me telefon, në dritë të dobët dhe me sfonde të ndryshme. Produktet fotografohen në një studio të vogël në shtëpi me sfond neutral dhe dritë të njëtrajtshme, përpunohen sipas kërkesave teknike të platformës dhe dorëzohen bashkë me titullin, përmasat dhe përshkrimin e listimit. Shitësit jashtë vendit mund të shërbehen në distancë: përpunim i fotove të tyre, përshkrime në disa gjuhë ose fotografim i mostrave që dërgohen me korrier.',
    sector: 'digjitale',
    offerSq:
      'Paketë për produkt: 5–7 foto (sfond i bardhë, kënde të ndryshme, detaje dhe, kur ka kuptim, produkti në përdorim), përpunim i ngjyrës dhe i përmasave sipas kërkesave të platformës, dhe draft listimi (titull, pikat kryesore, përmasat dhe materialet sipas informacionit të shitësit). Dorëzim brenda 5 ditëve pune nga marrja e produkteve; kthim i produkteve dorazi ose me korrier.',
    payingCustomerSq: 'Shitës i vogël online ose artizan që ka 10–200 produkte dhe shton artikuj të rinj çdo muaj.',
    customerSegments: ['b2b'],
    problemSq:
      'Fotot e dobëta dhe përshkrimet e paplota i bëjnë blerësit të hezitojnë, të bëjnë të njëjtat pyetje ose t’i kthejnë produktet sepse nuk dukeshin si në foto; shitësi e di, por nuk ka dritë, sfond, kohë ose aftësi për të fotografuar mirë dhjetëra produkte.',
    modes: ['online', 'kombinuar'],
    marketScopes: ['lokal', 'nderkombetar'],
    canStartFromHome: true,
    minTeam: 'vetem',
    requiredSkills: ['fotografi_video'],
    helpfulSkills: ['dizajn_grafik', 'shkrim_perkthim', 'gjuhe_te_huaja', 'marketing_digjital', 'shitje'],
    helpfulAssets: ['kamera', 'kompjuter', 'internet_i_qendrueshem', 'telefon_smart', 'apartament_shtese'],
    minHoursPerWeek: 12,
    regulated: false,
    regulationNotesSq: [
      'Regjistrimi i aktivitetit dhe faturimi, përfshirë faturimin e klientëve jashtë vendit: Kërkon verifikim lokal.',
      'Të drejtat e përdorimit të fotove: shkruani në marrëveshje kush i zotëron fotot dhe ku mund të përdoren; verifikoni rregullat lokale të së drejtës së autorit.',
      'Mostrat që vijnë nga jashtë vendit mund të kenë procedura doganore, taksa ose ndalime për disa kategori produktesh; verifikoni para se të pranoni dërgesën dhe vendosni me shkrim kush i paguan.',
      'Përshkrimet e listimit shkruhen vetëm me informacionin që jep shitësi; mos shtoni pretendime shëndetësore, sigurie ose certifikimesh që nuk janë të dokumentuara.',
      'Nëse në foto shfaqen persona, merrni pëlqimin e tyre me shkrim për përdorimin e imazhit.',
    ],
    licensedProfessionalsSq: [],
    adultOnly: false,
    zeroCapitalTestSq:
      'Me kamerën ose telefonin që keni, një dritare me dritë natyrale dhe një fletë të bardhë kartoni: fotografoni falas 3 produkte për 5 shitës lokalë që i shihni të shesin online me foto të dobëta, dhe u dërgoni krahasimin “para/pas” bashkë me ofertën me çmim për 20 produktet e ardhshme. Kostoja reale: kartoni, transporti për marrjen e produkteve dhe koha juaj; dritat dhe sfondet profesionale blihen vetëm pasi të keni porosinë e parë me pagesë.',
    revenueModelSq:
      'Çmim për produkt të fotografuar dhe të përgatitur (njësia = 1 produkt), me paradhënie 50% për porositë e reja. Fotot me modele ose në ambiente dhe videot e shkurtra faturohen veçmas dhe nuk përfshihen në modelin bazë.',
    pricing: {
      unitLabelSq: 'produkt',
      priceUSD: { low: 8, base: 15, high: 30 },
      variableCostUSD: { low: 0.5, base: 1.5, high: 4 },
      unitsPerCustomerPerMonth: 20,
      collectionDays: 7,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin konsumin e sfondeve dhe të materialeve, hapësirën në re dhe një pjesë të korrierit kur nuk e paguan shitësi. “Klient” = një shitës me mesatarisht rreth 20 produkte në muaj; humbja mujore në skenarë pasqyron që shumë shitës vijnë për një koleksion dhe kthehen vetëm kur kanë produkte të reja. Çmimet janë supozime në USD; verifikoni duke pyetur 10 shitës sa paguajnë sot dhe duke kërkuar çmimet e 3 fotografëve.',
    },
    startupCosts: [
      {
        id: 'lighting-kit',
        labelSq: 'Drita të vazhdueshme LED me softbox dhe mbajtëse',
        category: 'pajisje',
        lowUSD: 150,
        highUSD: 500,
        noteSq:
          'Drita e njëtrajtshme është pjesa më e rëndësishme e studios; krahasoni fuqinë dhe saktësinë e ngjyrave (indeksi CRI) para se të blini.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'studio-props',
        labelSq: 'Tavolinë fotografimi, sfonde, kuti drite, trekëmbësh dhe reflektorë',
        category: 'pajisje',
        lowUSD: 80,
        highUSD: 300,
        noteSq: 'Shumë pjesë mund të ndërtohen me materiale të thjeshta; blini vetëm ato që kërkojnë produktet që fotografoni më shpesh.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'camera-body',
        labelSq: 'Kamerë me objektiv standard ose makro',
        category: 'pajisje',
        lowUSD: 500,
        highUSD: 1500,
        noteSq:
          'Nevojitet vetëm nëse nuk keni kamerë; një kamerë e përdorur me objektiv të mirë mjafton. Telefoni mund të mjaftojë për testin, jo gjithmonë për klientë që kërkojnë detaje.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['kamera'],
      },
      {
        id: 'laptop',
        labelSq: 'Kompjuter me ekran të përshtatshëm për përpunim fotosh',
        category: 'pajisje',
        lowUSD: 500,
        highUSD: 1000,
        noteSq: 'Nevojitet vetëm nëse nuk keni kompjuter; ekrani duhet të tregojë ngjyrat me saktësi të arsyeshme.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['kompjuter'],
      },
      {
        id: 'registration-fees',
        labelSq: 'Regjistrim aktiviteti dhe faturim',
        category: 'tarifa',
        lowUSD: 0,
        highUSD: 150,
        noteSq: 'Tarifat ndryshojnë sipas vendit dhe formës ligjore; merrni shumën e saktë nga regjistri zyrtar i bizneseve.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: sfonde provë, transport dhe portofol me 15 produkte',
        category: 'testim_tregu',
        lowUSD: 30,
        highUSD: 150,
        noteSq:
          'Kartonë dhe sfonde provë, transport për marrjen dhe kthimin e produkteve të shitësve pilot, dhe printim i shembujve “para/pas”.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'editing-software',
        labelSq: 'Program përpunimi fotosh dhe ruajtje në re',
        category: 'software',
        lowUSD: 15,
        highUSD: 60,
        noteSq: 'Ka edhe programe falas; abonimet me pagesë kursejnë kohë kur përpunoni qindra foto në muaj.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'phone-internet',
        labelSq: 'Internet i shpejtë dhe telefon pune',
        category: 'sherbime_komunale',
        lowUSD: 15,
        highUSD: 45,
        noteSq: 'Ngarkimi i qindra fotove kërkon internet të qëndrueshëm; verifikoni paketat e operatorëve lokalë.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'courier-transport',
        labelSq: 'Korrier dhe transport për produktet',
        category: 'transport',
        lowUSD: 10,
        highUSD: 60,
        noteSq: 'Varet nga sa shitës i sjellin vetë produktet; vendosni në ofertë kush paguan korrierin në secilin drejtim.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'goods-insurance',
        labelSq: 'Sigurim për produktet e klientëve ndërsa janë te ju',
        category: 'sigurime',
        lowUSD: 0,
        highUSD: 40,
        noteSq:
          'Për produkte me vlerë (bizhuteri, elektronikë) pyesni 2–3 agjenci; për produkte të lira mjafton një procesverbal i shkruar marrjeje dhe kthimi.',
        scalesWithPriceLevel: true,
        optional: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 0, monthlyNewCustomers: 1, monthlyChurnPct: 40 },
      baze: { startCustomers: 1, monthlyNewCustomers: 2, monthlyChurnPct: 30 },
      optimist: { startCustomers: 2, monthlyNewCustomers: 4, monthlyChurnPct: 25 },
    },
    seasonality: [0.85, 1, 1.05, 0.95, 0.9, 0.85, 0.8, 0.95, 1.15, 1.25, 1.2, 1.05],
    seasonalityNoteSq:
      'Hipotezë: shitësit përgatisin produkte të reja para sezonit të festave (shtator–nëntor) dhe para koleksioneve të pranverës, ndërsa vera është më e qetë. Shitësit jashtë vendit mund të kenë kalendar tjetër; verifikojeni me porositë tuaja pas 6 muajsh.',
    macroLinks: [
      {
        indicatorCode: 'internet_users_pct',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Sa më shumë njerëz përdorin internetin, aq më shumë blerje kalojnë online dhe aq më shumë shitës konkurrojnë me foto — cilësia e fotos bëhet dallim.',
        ifSupportsSq: 'Përdorimi i lartë i internetit sugjeron më shumë shitës online dhe më shumë konkurrencë mes tyre për vëmendjen e blerësit.',
        ifContradictsSq:
          'Me përdorim të ulët të internetit, shitësit lokalë online janë më të paktë; fokusohuni te shitësit jashtë vendit ose te bizneset që shesin në rrjetet sociale.',
      },
      {
        indicatorCode: 'account_ownership',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Pagesat online kërkojnë llogari bankare ose elektronike; kur më shumë të rritur kanë llogari, më shumë blerje bëhen online dhe më shumë shitës kanë nevojë për listime të mira.',
        ifSupportsSq: 'Përhapja e llogarive sugjeron një treg online lokal që mund të rritet, bashkë me nevojën për katalogë profesionalë.',
        ifContradictsSq:
          'Me pak llogari, shitja online mbetet më shumë me pagesë në dorëzim dhe tregu lokal i këtij shërbimi mund të jetë më i vogël.',
      },
      {
        indicatorCode: 'exchange_rate_lcu_usd',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Kur monedha vendase dobësohet ndaj dollarit (më shumë njësi për 1 USD), çmimi juaj bëhet më konkurrues për shitësit jashtë vendit dhe pagesat e tyre vlejnë më shumë në monedhë vendase.',
        ifSupportsSq: 'Dobësimi i monedhës e forcon ofertën për klientë jashtë vendit — por pajisjet e importuara shtrenjtohen.',
        ifContradictsSq:
          'Me monedhë vendase që forcohet, avantazhi i çmimit ndaj klientëve të huaj zvogëlohet; konkurroni me cilësi dhe shpejtësi, jo me çmim.',
      },
      {
        indicatorCode: 'new_business_density',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Shumë biznese të reja të vogla nisin direkt me shitje online dhe kanë nevojë për foto produktesh që në muajin e parë.',
        ifSupportsSq: 'Dendësia e lartë e bizneseve të reja sugjeron klientë të rinj çdo muaj, jo vetëm shitës ekzistues.',
        ifContradictsSq: 'Me pak biznese të reja, klientët vijnë kryesisht nga shitësit ekzistues që rinovojnë katalogun; ndiqni më nga afër porositë e përsëritura.',
      },
    ],
    whyItCouldWork: {
      changeSq: 'Gjithnjë e më shumë produkte, edhe artizanale dhe lokale, shiten përmes faqeve online, tregjeve online dhe rrjeteve sociale.',
      problemSq: 'Blerësi online nuk e prek produktin; fotot e dobëta dhe përshkrimet e paqarta sjellin pyetje, hezitim dhe kthime.',
      customerSq: 'Shitës të vegjël dhe artizanë që shtojnë produkte rregullisht, por nuk kanë studio ose kohë.',
      offerSq: 'Foto të njëtrajtshme dhe listime gati për t’u ngarkuar, me afat të qartë dorëzimi.',
      reasonToPaySq:
        'Kursim kohe dhe një katalog që duket profesional; shitësi paguan për të mos u marrë vetë me dritën, sfondin dhe përpunimin.',
      profitConditionsSq:
        'Fitimi kërkon procese të shpejta (shumë produkte në një seancë), shitës që kthehen me koleksione të reja dhe të paktën disa klientë që porosisin volume të mëdha ose paguajnë në monedhë të huaj.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq: 'Shitësit lokalë janë të kënaqur me fotot e telefonit dhe nuk e lidhin cilësinë e fotos me shitjet.',
      },
      {
        kind: 'cmim',
        textSq: 'Shitësit e vegjël me marzhe të ulëta nuk paguajnë më shumë se pak për produkt, sidomos për artikuj të lirë.',
      },
      {
        kind: 'konkurrence',
        textSq: 'Freelancerë në platforma ndërkombëtare me çmime shumë të ulëta dhe mjete automatike për heqjen e sfondit.',
      },
      {
        kind: 'kosto',
        textSq: 'Marrja, ruajtja dhe kthimi i produkteve kërkojnë më shumë kohë dhe transport sesa vetë fotografimi.',
      },
      {
        kind: 'operacionale',
        textSq: 'Një produkt i dëmtuar ose i humbur ndërsa është te ju kërkon kompensim dhe dëmton besimin.',
      },
      {
        kind: 'sezonalitet',
        textSq: 'Porositë grumbullohen para festave dhe mungojnë në verë, ndërsa kostot fikse vazhdojnë.',
      },
      {
        kind: 'aftesi',
        textSq:
          'Fotografimi i produkteve me reflektime (qelq, metal, bizhuteri) kërkon teknikë të veçantë; pa të, fotot nuk dallojnë nga ato të telefonit.',
      },
    ],
    falsifiersSq: [
      'Nga 30 shitës online të kontaktuar, më pak se 5 pranojnë t’ju japin produkte për provë falas.',
      'Pas 15 ofertave me çmim konkret, më pak se 2 shitës paguajnë një porosi prej të paktën 10 produktesh.',
      'Koha reale për produkt (marrje, fotografim, përpunim, listim, kthim) kalon 45 minuta, pra çmimi bazë nuk e mbulon orën tuaj.',
      'Asnjë nga klientët e parë nuk kthehet me produkte të reja brenda 3 muajve.',
    ],
    differentiationSq: [
      'Paketë e plotë: foto, përmasa dhe draft listimi gati për t’u ngarkuar, jo vetëm foto.',
      'Stil i njëtrajtshëm për gjithë katalogun e shitësit, me udhëzues të ruajtur për porositë e ardhshme.',
      'Përshkrime në disa gjuhë për shitësit që shesin jashtë vendit (vetëm për gjuhët që i zotëroni mirë).',
      'Afat i shkruar dorëzimi dhe procesverbal për marrjen dhe kthimin e produkteve.',
    ],
    competitorTypesSq: [
      'Fotografë studioje që punojnë kryesisht për reklama dhe janë më të shtrenjtë',
      'Freelancerë në platforma ndërkombëtare që përpunojnë fotot në distancë',
      'Fotot me telefon të vetë shitësit, me aplikacione për heqjen e sfondit',
      'Agjenci marketingu që e përfshijnë fotografimin në paketa më të mëdha',
    ],
    cheapestTestSq:
      'Fotografim falas i 3 produkteve për 5 shitës, me krahasim “para/pas”, i ndjekur nga 15 oferta me çmim për 20 produktet e ardhshme. Matni sa paguajnë dhe sa minuta merr realisht çdo produkt.',
    interviewQuestionsSq: [
      'Si i bëni sot fotot e produkteve dhe kush i bën?',
      'Sa kohë ju mori hera e fundit që shtuat një produkt të ri online, nga fotoja deri te publikimi?',
      'Kur ishte hera e fundit që një blerës ju pyeti për diçka që duhej të dukej në foto ose në përshkrim?',
      'Sa produkte të reja shtoni zakonisht në muaj?',
      'Keni paguar ndonjëherë dikë për foto produktesh? Sa paguat dhe pse vazhduat ose ndaluat?',
      'Sa kthime patët muajin e kaluar dhe çfarë arsyesh dhanë blerësit?',
      'Kush tjetër vendos kur bëhet fjalë për shpenzime për katalogun ose marketingun?',
    ],
    firstCustomers: {
      whereSq: [
        'Shitës lokalë që shesin në rrjetet sociale ose në tregjet online me foto të dobëta',
        'Artizanë dhe prodhues të vegjël në panaire dhe tregje lokale',
        'Dyqane fizike që po hapin dyqan online për herë të parë',
        'Komunitete online të shitësve ku lejohet prezantimi i shërbimeve, sipas rregullave të grupit',
      ],
      howToContactSq: [
        'Mesazh i personalizuar, një herë, në kanalin publik të shitësit, me një shembull konkret se si do të dukej një nga produktet e tij',
        'Vizitë në panaire dhe tregje me një album të vogël “para/pas”',
        'Profil portofoli në platforma freelance për klientët jashtë vendit, pa vlerësime të rreme dhe pa mesazhe masive',
      ],
      offerSq: 'Fotografim falas i 3 produkteve, pastaj porosi me çmim për produkt dhe paradhënie 50%, pa kontratë afatgjatë.',
      followUpSq:
        'Shënoni çdo kontakt në një tabelë; një rikujtesë e vetme pas 7 ditësh. Pas çdo porosie, pyetni pas 30 ditësh nëse vunë re ndryshim në pyetjet e blerësve — pa e paraqitur si premtim shitjesh.',
      metricsSq: [
        'Kontakte → produkte provë të pranuara (%)',
        'Provë → porosi me pagesë (%)',
        'Minuta pune për produkt',
        'Klientë që kthehen me porosi të re brenda 3 muajve (%)',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje [emri], pashë produktet tuaja në [platforma], sidomos [produkti]. Jam [emri] dhe bëj foto produktesh në studion time të vogël, me sfond të njëtrajtshëm dhe përshkrim gati për listim. Mund t’ju fotografoj falas 3 produkte, që t’i krahasoni me fotot aktuale. Nëse ju duken të dobishme, çmimi për porositë e tjera është [çmimi] për produkt.',
    offerTemplateSq:
      'Oferta për [emri i shitësit]: (1) [numri] produkte, 5–7 foto për secilin, me sfond [ngjyra] dhe detaje; (2) përpunim sipas kërkesave të [platforma]; (3) draft listimi me titull, përmasa dhe materiale sipas informacionit tuaj; (4) dorëzim brenda [numri] ditëve pune nga marrja e produkteve, me procesverbal marrjeje dhe kthimi. Çmimi: [çmimi] për produkt, paradhënie 50% dhe pjesa tjetër në dorëzim. Fotot mund t’i përdorni në [kanalet]. Nuk premtojmë rritje shitjesh; premtojmë foto të njëtrajtshme dhe në afat.',
    feedbackQuestionsSq: [
      'Sa kohë ju kursyen fotot dhe listimet e gatshme?',
      'A ndryshuan pyetjet që ju bëjnë blerësit pas fotove të reja? Si?',
      'Çfarë do të ndryshonit në stilin ose në afatin e dorëzimit?',
      'Si ju duk procesi i dërgimit dhe i kthimit të produkteve?',
    ],
    goCriteriaSq: [
      'Të paktën 3 shitës paguajnë porosi prej 10 ose më shumë produktesh pas 15 ofertave konkrete.',
      'Koha mesatare për produkt bie nën 30 minuta pas porosisë së tretë.',
      'Të paktën 1 klient kthehet me porosi të re brenda 2 muajve.',
    ],
    killCriteriaSq: [
      'Pas 30 kontakteve dhe 15 ofertave, më pak se 2 porosi me pagesë.',
      'Çmimi i pranuar nga tregu, i pjesëtuar me minutat reale për produkt, jep më pak se të ardhura për orë që ju nevojiten.',
      'Pas 4 muajsh, më pak se 20% e klientëve kthehen me porosi të re.',
    ],
    phaseNotesSq: {
      p10_20: [
        'Shikoni 30 shitës online në zonën ose kategorinë tuaj dhe shënoni çfarë problemesh kanë fotot dhe listimet e tyre para intervistave.',
      ],
      p20_30: [
        'Kërkoni oferta si klient nga 3 fotografë lokalë dhe 3 freelancerë ndërkombëtarë për 20 produkte, me afat dhe çfarë përfshijnë.',
      ],
      p50_60: [
        'Ndërtoni një procedurë standarde: procesverbal marrjeje, cilësimet e dritës për çdo lloj produkti, emërtimi i skedarëve dhe kthimi.',
      ],
      p60_70: ['Pilot me 5 shitës; matni minutat për produkt në çdo hap, si dhe dëmtimet ose vonesat.'],
      p90_100: [
        'Shtoni klientë jashtë vendit vetëm pasi procesi lokal të jetë i qëndrueshëm dhe të keni verifikuar faturimin dhe procedurat për mostrat nga jashtë.',
      ],
    },
    assumptionsSq: [
      'Shitësit e vegjël shtojnë produkte të reja rregullisht dhe kthehen për porosi të tjera.',
      'Një person mund të fotografojë dhe përpunojë 15–25 produkte në një ditë pune me procese standarde.',
      'Shumica e produkteve janë të vogla dhe mund të fotografohen mbi tavolinë.',
      'Interesi për provën falas nuk është provë kërkese; vetëm porosia e paguar e konfirmon.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 4. Turnover cleaning + linen coordination for short-term-rental hosts — B2B,
  //    physical, needs a partner (same-day windows + backup), strongly seasonal
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'pastrim-ndermjet-qiramarresve-afatshkurter',
    nameSq: 'Pastrim mes mysafirëve për apartamente me qira afatshkurtër',
    taglineSq: 'Pastrim, tekstile të pastra dhe kontroll i apartamentit në orët mes daljes dhe hyrjes së mysafirëve.',
    descriptionSq:
      'Shërbim për pronarë dhe administratorë apartamentesh me qira afatshkurtër (mysafirë për disa netë) që nuk mund të jenë vetë aty mes një mysafiri dhe tjetrit. Pas çdo largimi, ekipi pastron sipas një liste kontrolli, ndërron çarçafët dhe peshqirët në koordinim me një lavanteri, plotëson materialet e konsumit nga stoku i pronarit, fotografon gjendjen dhe raporton menjëherë dëmtimet ose defektet. Puna përqendrohet në pak orë mes daljes dhe hyrjes së mysafirëve, prandaj zakonisht kërkon të paktën dy persona dhe një plan zëvendësimi.',
    sector: 'turizem',
    offerSq:
      'Për çdo largim mysafiri: pastrim sipas listës së kontrollit të pronarit (kuzhinë, banjë, dysheme, pluhur, mbeturina), ndërrim i çarçafëve dhe i peshqirëve, dërgim dhe marrje e tekstileve te lavanteria, plotësim i materialeve të konsumit nga stoku i pronarit, 8–12 foto të gjendjes pas pastrimit dhe raport dëmtimesh brenda ditës. Planifikim nga kalendari i përbashkët i rezervimeve; çmim fiks sipas madhësisë së apartamentit.',
    payingCustomerSq:
      'Pronari ose administratori që menaxhon 1–10 apartamente me qira afatshkurtër dhe nuk jeton pranë tyre ose nuk ka kohë.',
    customerSegments: ['b2b'],
    problemSq:
      'Mes daljes dhe hyrjes së mysafirëve ka vetëm pak orë; një pastrim i dobët, çarçafë të palarë ose një defekt i paraportuar sjellin ankesa, vlerësime të ulëta dhe rimbursime. Pronarët që jetojnë larg ose kanë punë tjetër varen nga persona të rastësishëm që nuk vijnë gjithmonë.',
    modes: ['fizik'],
    marketScopes: ['lokal'],
    canStartFromHome: true,
    minTeam: 'partner',
    requiredSkills: ['pastrim'],
    helpfulSkills: ['mikpritje', 'drejtim_mjeti', 'logjistike', 'sherbim_klienti', 'gjuhe_te_huaja'],
    helpfulAssets: ['automjet', 'telefon_smart', 'magazine', 'motor_bicikleta'],
    minHoursPerWeek: 25,
    regulated: true,
    regulationNotesSq: [
      'Regjistrimi i aktivitetit të pastrimit dhe faturimi për pronarët: Kërkon verifikim lokal.',
      'Nëse punësoni ose paguani persona të tjerë, kontratat, sigurimet shoqërore dhe sigurimi nga aksidentet në punë kërkojnë verifikim lokal; mos punoni me persona të padeklaruar.',
      'Çelësat dhe kodet e hyrjes: marrëveshje me shkrim për ruajtjen e tyre, regjistër i hyrjeve dhe sigurim përgjegjësie për dëmet ose humbjet në pronë — verifikoni çfarë mbulojnë agjencitë e sigurimit në zonë.',
      'Produktet kimike të pastrimit: përdorini vetëm sipas etiketës dhe fletës së sigurisë, mos i përzieni kurrë me njëri-tjetrin, mbani doreza dhe ajrosni ambientin; verifikoni rregullat lokale për ruajtjen dhe asgjësimin e tyre.',
      'Regjistrimi i apartamentit, i mysafirëve dhe taksat turistike janë detyrime të pronarit, jo të shërbimit të pastrimit; mos merrni përsipër detyra ligjore të pronarit pa verifikim.',
      'Defektet elektrike, të gazit ose të ujit vetëm raportohen te pronari; riparimin e bën profesionist i licencuar.',
    ],
    licensedProfessionalsSq: [
      'Elektricist i licencuar dhe teknik gazi i licencuar për defektet që zbulohen gjatë pastrimit (ekipi vetëm i raporton)',
    ],
    adultOnly: true,
    zeroCapitalTestSq:
      'Me veglat e pastrimit që keni në shtëpi: pyesni në rrjetin tuaj dhe në grupet lokale të pronarëve (sipas rregullave të grupit) kush ka apartamente me qira afatshkurtër, kontaktoni personalisht 20 prej tyre dhe ofroni një pastrim provë me çmim të ulët, me listë kontrolli dhe foto pas pastrimit. Në këtë fazë çarçafët i lan pronari ose lavanteria e tij. Kostoja reale: produktet e pastrimit, transporti dhe koha juaj; para punës së rregullt duhen regjistrimi dhe sigurimi i përgjegjësisë (kërkon verifikim lokal), sepse do të mbani çelësat e pronës së dikujt tjetër.',
    revenueModelSq:
      'Çmim fiks për çdo pastrim mes mysafirëve (njësia = 1 pastrim), sipas madhësisë së apartamentit, i faturuar çdo dy javë. Lavanteria i faturohet pronarit me koston reale plus një tarifë të vogël koordinimi dhe nuk përfshihet në modelin bazë; as pastrimet e thella sezonale.',
    pricing: {
      unitLabelSq: 'pastrim mes mysafirëve',
      priceUSD: { low: 40, base: 70, high: 120 },
      variableCostUSD: { low: 4, base: 8, high: 14 },
      unitsPerCustomerPerMonth: 6,
      collectionDays: 15,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin produktet e pastrimit, qeset e mbeturinave, dorezat dhe karburantin për çdo vizitë; nuk përfshin lavanterinë (që faturohet veçmas) dhe as pagat. “Klient” = një pronar me mesatarisht rreth 6 pastrime në muaj (më shumë në sezon). Çmimet janë supozime në USD; verifikoni sa paguajnë sot pronarët në zonë dhe sa kohë merr realisht një pastrim për çdo madhësi apartamenti.',
    },
    startupCosts: [
      {
        id: 'cleaning-equipment',
        labelSq: 'Fshesë elektrike profesionale, mopa, kova, karrocë dhe furça',
        category: 'pajisje',
        lowUSD: 250,
        highUSD: 800,
        noteSq:
          'Një fshesë elektrike e qëndrueshme dhe mopat me mikrofibër kursejnë kohë në çdo pastrim; krahasoni ofertat e furnitorëve të produkteve profesionale.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'starter-supplies',
        labelSq: 'Stok fillestar produktesh pastrimi dhe materialesh konsumi',
        category: 'inventar',
        lowUSD: 80,
        highUSD: 250,
        noteSq: 'Blini me shumicë vetëm produktet që përdorni çdo ditë dhe kërkoni nga furnitori fletët e sigurisë për secilin.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'linen-rotation',
        labelSq: 'Stok çarçafësh dhe peshqirësh për rotacion',
        category: 'inventar',
        lowUSD: 300,
        highUSD: 1500,
        noteSq:
          'Vetëm nëse pronarët nuk kanë komplete rezervë; disa shërbime ua japin me qira mujore. Nisni pa të dhe shtojeni pasi të keni kontrata.',
        scalesWithPriceLevel: false,
        optional: true,
      },
      {
        id: 'uniforms-ppe',
        labelSq: 'Uniforma, doreza, maska dhe çanta të sigurta për çelësat',
        category: 'hapje',
        lowUSD: 50,
        highUSD: 200,
        noteSq: 'Pamja e njëtrajtshme rrit besimin e pronarëve; mjetet mbrojtëse janë të domosdoshme kur punohet me produkte kimike.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'registration-fees',
        labelSq: 'Regjistrim aktiviteti dhe faturim',
        category: 'tarifa',
        lowUSD: 50,
        highUSD: 300,
        noteSq: 'Tarifat ndryshojnë sipas vendit dhe formës ligjore; merrni shumën e saktë nga regjistri zyrtar i bizneseve.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: 5 pastrime provë, printime dhe transport',
        category: 'testim_tregu',
        lowUSD: 50,
        highUSD: 200,
        noteSq:
          'Produktet dhe transporti për pastrimet provë me çmim të ulët, printimi i listës së kontrollit dhe i çmimeve, si dhe koha e matur për çdo madhësi apartamenti.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'transport-fuel',
        labelSq: 'Transport dhe karburant mes apartamenteve',
        category: 'transport',
        lowUSD: 80,
        highUSD: 300,
        noteSq:
          'Varet nga distanca mes apartamenteve dhe nga mjeti; grupimi i klientëve në 1–2 lagje e ul shumë këtë kosto. Pa automjet, tekstilet transportohen me vështirësi.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'liability-insurance',
        labelSq: 'Sigurim përgjegjësie për dëme në pronë dhe për çelësat',
        category: 'sigurime',
        lowUSD: 25,
        highUSD: 100,
        noteSq: 'Pyesni 2–3 agjenci nëse mbulojnë humbjen e çelësave dhe dëmet aksidentale gjatë pastrimit, jo vetëm aksidentet personale.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'scheduling-phone',
        labelSq: 'Telefon, aplikacion planifikimi dhe ruajtje fotosh',
        category: 'software',
        lowUSD: 15,
        highUSD: 50,
        noteSq: 'Një kalendar i përbashkët me pronarët dhe një dosje fotosh për çdo apartament mjaftojnë në fillim.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'seasonal-helper',
        labelSq: 'Ndihmës me orë në sezonin e pikut',
        category: 'paga',
        lowUSD: 0,
        highUSD: 1200,
        noteSq:
          'Pagesë për orë për një person të tretë në muajt me shumë largime; llogaritni edhe kontratën dhe sigurimet sipas rregullave lokale.',
        scalesWithPriceLevel: true,
        optional: true,
      },
      {
        id: 'bookkeeping',
        labelSq: 'Kontabilist i jashtëm',
        category: 'kontabilitet',
        lowUSD: 30,
        highUSD: 100,
        noteSq: 'Me fatura të shpeshta dhe ndihmës sezonalë, një kontabilist me çmim fiks kursen kohë; verifikoni detyrimet lokale.',
        scalesWithPriceLevel: true,
        optional: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 1, monthlyNewCustomers: 1, monthlyChurnPct: 8 },
      baze: { startCustomers: 2, monthlyNewCustomers: 2, monthlyChurnPct: 6 },
      optimist: { startCustomers: 3, monthlyNewCustomers: 3, monthlyChurnPct: 5 },
    },
    seasonality: [0.5, 0.5, 0.7, 0.9, 1.1, 1.4, 1.7, 1.8, 1.3, 0.9, 0.6, 0.6],
    seasonalityNoteSq:
      'Shembull për një destinacion me kulm veror: në korrik–gusht ka shumë më tepër largime sesa në dimër. Në qytete me vizitorë gjatë gjithë vitit kurba është më e sheshtë, ndërsa në zona malore kulmi mund të jetë në dimër. Përshtateni sipas zonës suaj; muajt e qetë kërkojnë rezervë parash.',
    macroLinks: [
      {
        indicatorCode: 'tourism_arrivals',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Më shumë vizitorë ndërkombëtarë do të thotë më shumë netë në apartamente me qira afatshkurtër dhe më shumë largime që kërkojnë pastrim brenda pak orësh.',
        ifSupportsSq:
          'Rritja e mbërritjeve mbështet kërkesën për pastrime mes mysafirëve — por vetëm aty ku vizitorët qëndrojnë në apartamente, jo vetëm në hotele.',
        ifContradictsSq:
          'Pa rritje të vizitorëve, kërkesa varet nga pronarët që kalojnë nga qiraja afatgjatë në atë afatshkurtër; testoni me kujdes dhe mbani kosto fikse të ulëta.',
      },
      {
        indicatorCode: 'tourism_receipts_usd',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Kur të ardhurat nga turizmi rriten, pronarët fitojnë më shumë për natë dhe vlerësimet e mysafirëve kanë më shumë vlerë — kjo e bën më të arsyeshme pagesën për pastrim profesional.',
        ifSupportsSq: 'Rritja e të ardhurave nga turizmi sugjeron që pronarët kanë marzh për ta paguar shërbimin.',
        ifContradictsSq:
          'Me të ardhura në rënie, pronarët i ulin kostot dhe e bëjnë vetë pastrimin; çmimi juaj do të jetë nën presion.',
      },
      {
        indicatorCode: 'inflation_cpi',
        direction: 'me_i_ulet_mbeshtet',
        mechanismSq:
          'Produktet e pastrimit, karburanti dhe pagat rriten me inflacionin, ndërsa çmimi për pastrim shpesh fiksohet me pronarin për gjithë sezonin.',
        ifSupportsSq: 'Inflacioni i ulët e mban marzhin të parashikueshëm gjatë sezonit.',
        ifContradictsSq:
          'Me inflacion të lartë, vendosni në marrëveshje rishikimin e çmimit çdo 6 muaj, përndryshe marzhi ngushtohet.',
      },
    ],
    whyItCouldWork: {
      changeSq: 'Shumë banesa në zona turistike dhe në qytete janë kaluar nga qiraja afatgjatë në qira afatshkurtër për mysafirë.',
      problemSq: 'Çdo largim mysafiri kërkon pastrim të shpejtë dhe të besueshëm, shpesh kur pronari nuk është aty.',
      customerSq: 'Pronarë dhe administratorë me 1–10 apartamente, shpesh me punë tjetër ose që jetojnë larg.',
      offerSq: 'Ekip i vogël që pastron sipas listës, ndërron tekstilet, fotografon gjendjen dhe raporton dëmtimet brenda ditës.',
      reasonToPaySq:
        'Vlerësimet e mysafirëve dhe ankesat varen drejtpërdrejt nga pastërtia; pronari paguan për besueshmëri dhe kohë të kursyer.',
      profitConditionsSq:
        'Fitimi kërkon apartamente të grupuara afër njëri-tjetrit, kohë të qëndrueshme për pastrim, çmim që mbulon edhe muajt e qetë dhe pronarë që paguajnë çdo dy javë.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq: 'Pronarët në zonë janë pak ose e bëjnë vetë pastrimin me të afërm.',
      },
      {
        kind: 'cmim',
        textSq: 'Çmimi që pranojnë pronarët nuk mbulon kohën reale, sidomos për apartamente të mëdha ose shumë të ndotura.',
      },
      {
        kind: 'konkurrence',
        textSq: 'Pastrues informalë me çmim shumë të ulët dhe agjenci menaxhimi që e kanë pastrimin brenda paketës së tyre.',
      },
      {
        kind: 'kosto',
        textSq: 'Transporti mes apartamenteve të shpërndara dhe orët e humbura në pritje e hanë marzhin.',
      },
      {
        kind: 'sezonalitet',
        textSq: 'Në muajt e qetë të ardhurat bien shumë, ndërsa sigurimi, transporti dhe pagat vazhdojnë.',
      },
      {
        kind: 'operacionale',
        textSq: 'Dy largime në të njëjtën orë ose një person i sëmurë në kulm të sezonit sjellin vonesa dhe ankesa.',
      },
      {
        kind: 'ligjore',
        textSq: 'Dëmtimet në pronë, humbja e çelësave ose puna me persona të padeklaruar sjellin përgjegjësi dhe gjoba.',
      },
    ],
    falsifiersSq: [
      'Nga 20 pronarë të kontaktuar, më pak se 3 pranojnë një pastrim provë me pagesë.',
      'Koha mesatare për një pastrim standard kalon 2,5 orë për dy persona, gjë që e bën çmimin bazë të pamjaftueshëm.',
      'Pas 10 pastrimeve provë, ka më shumë se 2 ankesa për cilësinë nga pronarët ose nga mysafirët.',
      'Në muajt e qetë, numri i pastrimeve bie nën 25% të kulmit dhe kostot fikse nuk mbulohen.',
    ],
    differentiationSq: [
      'Raport me foto pas çdo pastrimi dhe njoftim për dëmtimet brenda ditës.',
      'Listë kontrolli e përbashkët me pronarin, e përditësuar sipas vërejtjeve të mysafirëve.',
      'Koordinim i plotë i tekstileve me lavanterinë, që pronari të mos merret me çarçafët.',
      'Plan zëvendësimi i shkruar: kush vjen nëse njëri nga ekipi sëmuret.',
    ],
    competitorTypesSq: [
      'Pastrues informalë me pagesë në dorë',
      'Agjenci menaxhimi pronash që e përfshijnë pastrimin në komision',
      'Kompani pastrimi të përgjithshme pa specializim në largimet e mysafirëve',
      'Vetë pronari ose të afërmit e tij',
    ],
    cheapestTestSq:
      'Pesë pastrime provë me çmim të ulët për pronarë të ndryshëm, me listë kontrolli dhe foto. Matni kohën reale për çdo madhësi apartamenti, ankesat dhe sa pronarë e kërkojnë pastrimin e radhës me çmim të plotë.',
    interviewQuestionsSq: [
      'Kush e pastron sot apartamentin tuaj mes mysafirëve dhe si e organizoni?',
      'Kur ishte hera e fundit që një mysafir u ankua për pastërtinë ose për çarçafët?',
      'Sa paguani sot për një pastrim dhe sa për larjen e tekstileve?',
      'Çfarë ndodhi herën e fundit kur personi që pastron nuk erdhi ose u vonua?',
      'Si i merrni vesh sot dëmtimet ose sendet që mungojnë pas largimit të mysafirit?',
      'Sa largime mysafirësh patët muajin e kaluar dhe sa në muajin më të ngarkuar të vitit?',
      'Kush tjetër merr pjesë në vendimin për ndërrimin e personit që pastron?',
    ],
    firstCustomers: {
      whereSq: [
        'Pronarë që njihni personalisht ose përmes të afërmve dhe fqinjëve',
        'Administratorë që menaxhojnë disa apartamente për pronarë të tjerë',
        'Grupet lokale të pronarëve të apartamenteve me qira, ku lejohet prezantimi i shërbimeve sipas rregullave të grupit',
        'Pronarë në diasporë që i japin me qira afatshkurtër apartamentet në vendlindje',
      ],
      howToContactSq: [
        'Takim personal ose telefonatë me rekomandim nga një i njohur',
        'Një prezantim i shkurtër në grupet lokale të pronarëve, pa mesazhe masive në privat',
        'Fletë e thjeshtë me çmimet dhe listën e kontrollit, e lënë te administratorët e ndërtesave me lejen e tyre',
      ],
      offerSq: 'Pastrim provë me çmim të reduktuar dhe raport fotografik; pastaj çmim fiks për pastrim, pa detyrim afatgjatë.',
      followUpSq:
        'Pas pastrimit provë, telefononi pronarin brenda 48 orëve për vërejtje; një rikujtesë e vetme pas 7 ditësh nëse nuk përgjigjet, pastaj ndaloni.',
      metricsSq: [
        'Kontakte → pastrime provë (%)',
        'Provë → klientë të rregullt (%)',
        'Minuta për pastrim sipas madhësisë së apartamentit',
        'Ankesa për çdo 100 pastrime',
        'Pronarë që largohen në 3 muajt e parë',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje [emri], jam [emri] dhe bashkë me [emri i partnerit] pastrojmë apartamente me qira afatshkurtër mes një mysafiri dhe tjetrit në [zona]. Punojmë me listën tuaj të kontrollit, ndërrojmë çarçafët, ju dërgojmë foto pas çdo pastrimi dhe ju njoftojmë brenda ditës nëse diçka është dëmtuar. Mund të bëjmë një pastrim provë për [çmimi i provës], që ta shihni vetë cilësinë.',
    offerTemplateSq:
      'Oferta për [emri i pronarit] — [adresa ose zona]: (1) pastrim pas çdo largimi sipas listës së kontrollit, brenda orarit [ora e daljes]–[ora e hyrjes]; (2) ndërrim i çarçafëve dhe i peshqirëve dhe koordinim me lavanterinë, me koston reale plus [tarifa e koordinimit]; (3) foto të gjendjes dhe raport dëmtimesh brenda ditës; (4) ruajtje e çelësave sipas marrëveshjes së shkruar. Çmimi: [çmimi] për pastrim për apartament [madhësia], faturë çdo dy javë, pagesë brenda 15 ditëve. Anulim me njoftim 30-ditor. Nuk premtojmë vlerësime të caktuara nga mysafirët; premtojmë pastrim sipas listës dhe raport të saktë.',
    feedbackQuestionsSq: [
      'A ka pasur ndonjë ankesë nga mysafirët që lidhet me pastrimin?',
      'Cila pikë e listës së kontrollit duhet përmirësuar?',
      'A ju mjaftojnë fotot dhe raportet që ju dërgojmë?',
      'Si e vlerësoni komunikimin kur ndryshojnë oraret e mysafirëve?',
    ],
    goCriteriaSq: [
      'Të paktën 4 pronarë me pastrime të rregullta me pagesë pas 20 kontakteve.',
      'Koha mesatare për pastrim standard nën 2 orë për dy persona dhe më pak se 2 ankesa për çdo 50 pastrime.',
    ],
    killCriteriaSq: [
      'Pas 30 kontakteve dhe 10 pastrimeve provë, më pak se 2 pronarë të rregullt.',
      'Çmimi i pranuar nuk mbulon transportin, produktet dhe pagën minimale për orë të dy personave.',
      'Më shumë se 1 incident serioz me çelësa ose dëme në pronë gjatë 3 muajve të parë, pa një proces që e parandalon përsëritjen.',
    ],
    phaseNotesSq: {
      p10_20: [
        'Intervistoni 15 pronarë dhe 3 administratorë për mënyrën si e organizojnë sot pastrimin dhe çfarë ndodhi herën e fundit kur diçka shkoi keq.',
      ],
      p40_50: [
        'Verifikoni regjistrimin, sigurimin për çelësat dhe dëmet, si dhe rregullat për punësimin e ndihmësve sezonalë, para kontratave të para.',
      ],
      p50_60: [
        'Merrni oferta nga 2–3 lavanteri për larjen e tekstileve dhe testoni afatet e tyre me një ngarkesë provë.',
        'Hartoni listën e kontrollit dhe protokollin e çelësave (ku ruhen, kush i merr, regjistri i hyrjeve).',
      ],
      p60_70: ['Bëni 5–10 pastrime provë dhe matni kohën për çdo madhësi apartamenti.'],
      p80_90: ['Gruponi klientët sipas lagjes dhe rishikoni çmimet përpara sezonit të ardhshëm.'],
    },
    assumptionsSq: [
      'Dy persona mund të bëjnë 3–5 pastrime në ditë kur apartamentet janë afër njëri-tjetrit.',
      'Pronarët pranojnë faturim çdo dy javë dhe paguajnë brenda 15 ditëve.',
      'Lavanteria faturohet veçmas me koston reale, ndaj nuk ndikon në marzhin bazë.',
      'Sezonaliteti ndryshon shumë sipas zonës; kurba bazë është për një destinacion veror.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 5. Handyman maintenance plans for landlords — physical, solo, tools + vehicle;
  //    electrical, gas, structural and height work only by licensed professionals
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'riparime-te-vogla-me-abonim-per-pronare',
    nameSq: 'Riparime të vogla me abonim për pronarë banesash me qira',
    taglineSq: 'Kontroll periodik dhe riparime të vogla me çmim mujor; elektrika, gazi dhe struktura vetëm nga profesionistë të licencuar.',
    descriptionSq:
      'Plan mirëmbajtjeje mujor për pronarë që japin me qira 1–5 banesa dhe nuk kanë kohë, vegla ose njerëz të besuar për defektet e vogla: rubinete që pikojnë, dyer dhe dollapë që nuk mbyllen, silikon i dëmtuar, doreza, perde, montime të vogla dhe retushime boje. Përfshin një vizitë kontrolli çdo tremujor me raport fotografik dhe disa orë riparimi në muaj. Punët elektrike, të gazit, strukturore ose në lartësi nuk kryhen: ato raportohen dhe koordinohen me profesionistë të licencuar.',
    sector: 'riparime',
    offerSq:
      'Abonim mujor për banesë: vizitë kontrolli çdo tremujor me listë (lagështi, rrjedhje, mbyllje, silikone, aspiratorë) dhe raport me foto; deri në 2 orë riparime të vogla në muaj të përfshira; reagim brenda 48 orëve për kërkesat e qiramarrësve; materialet faturohen me koston reale dhe me faturë; koordinim me profesionistë të licencuar për punët që i kalojnë kufijtë e shërbimit.',
    payingCustomerSq:
      'Pronar me 1–5 banesa me qira afatgjatë, shpesh me punë tjetër ose që jeton në një qytet tjetër ose jashtë vendit.',
    customerSegments: ['b2c', 'b2b'],
    problemSq:
      'Defektet e vogla që nuk rregullohen në kohë kthehen në dëme të shtrenjta (lagështi, dyer të dëmtuara) dhe në konflikte me qiramarrësit; pronari humbet kohë duke kërkuar mjeshtër për punë të vogla që askush nuk i merr përsipër, ose paguan shtrenjtë për një vizitë të vetme.',
    modes: ['fizik'],
    marketScopes: ['lokal'],
    canStartFromHome: true,
    minTeam: 'vetem',
    requiredSkills: ['riparime_shtepie'],
    helpfulSkills: ['hidraulik', 'zdrukthtari', 'sherbim_klienti', 'drejtim_mjeti', 'shitje'],
    helpfulAssets: ['vegla_pune', 'automjet', 'furgon', 'punishte', 'telefon_smart', 'rrjet_diaspore'],
    minHoursPerWeek: 20,
    regulated: true,
    regulationNotesSq: [
      'Punimet elektrike, të gazit, ndërhyrjet në mure mbajtëse ose në strukturë dhe punimet në lartësi kërkojnë profesionistë të licencuar ose të certifikuar; shërbimi juaj vetëm i identifikon dhe i raporton. Kufijtë e saktë të punës pa licencë: Kërkon verifikim lokal.',
      'Lidhjet me rrjetin e ujit ose të kanalizimeve mund të kërkojnë hidraulik të certifikuar në disa vende; verifikoni para se t’i përfshini në paketë.',
      'Hyrja në banesë me qiramarrës: vetëm me njoftim paraprak dhe me pëlqim sipas kontratës së qirasë dhe rregullave lokale; mos hyni kurrë pa praninë ose lejen e qiramarrësit.',
      'Sigurimi i përgjegjësisë për dëme në pronë, regjistrimi i aktivitetit, faturimi dhe garancia për punën: Kërkon verifikim lokal.',
      'Mbetjet e materialeve (bojë, silikon, mbeturina ndërtimi) hidhen sipas rregullave lokale; verifikoni pikat e grumbullimit.',
      'Përdorni veglat dhe shkallët vetëm sipas udhëzimeve të prodhuesit dhe rregullave të sigurisë në punë; punët që kërkojnë skela ose rripa sigurie u lihen profesionistëve.',
    ],
    licensedProfessionalsSq: [
      'Elektricist i licencuar për çdo punim në instalimet elektrike, në priza ose në panel',
      'Teknik i licencuar për instalimet e gazit',
      'Inxhinier strukturist për çdo ndërhyrje në mure mbajtëse, ballkone ose strukturë',
      'Hidraulik i certifikuar për lidhjet me rrjetin, aty ku kërkohet',
    ],
    adultOnly: true,
    zeroCapitalTestSq:
      'Me veglat e dorës që keni: ofroni 5 pronarëve që njihni një vizitë kontrolli falas në një nga banesat e tyre me qira (me pëlqimin e qiramarrësit), me listë të shkruar dhe raport fotografik të defekteve të vogla. Pastaj u bëni ofertë me çmim për riparimet e gjetura dhe për planin mujor. Kostoja reale: transporti, materialet e riparimeve (që i paguan pronari) dhe koha juaj; regjistrimi dhe sigurimi për dëme në pronë duhen para punës së rregullt (kërkon verifikim lokal).',
    revenueModelSq:
      'Abonim mujor për banesë (njësia = 1 banesë/muaj) që përfshin kontrollin tremujor dhe deri në 2 orë riparime; orët shtesë dhe materialet faturohen veçmas me tarifë të shpallur dhe nuk përfshihen në modelin bazë.',
    pricing: {
      unitLabelSq: 'abonim mujor për banesë',
      priceUSD: { low: 30, base: 50, high: 90 },
      variableCostUSD: { low: 3, base: 6, high: 12 },
      unitsPerCustomerPerMonth: 1.5,
      collectionDays: 20,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin materialet e vogla të konsumit që nuk faturohen veçmas (vida, silikon, fasheta) dhe karburantin për vizitat. “Klient” = një pronar me mesatarisht 1–2 banesa. Rreziku kryesor është që një banesë të kërkojë shumë më tepër orë sesa përfshin abonimi: vendosni kufi të qartë orësh. Çmimet janë supozime në USD; verifikoni sa paguajnë pronarët për vizitat e mjeshtrave dhe sa kërkojnë shërbimet e menaxhimit të pronave.',
    },
    startupCosts: [
      {
        id: 'hand-power-tools',
        labelSq: 'Vegla dore dhe elektrike (trapan, nivel, çelësa, sharrë dore)',
        category: 'pajisje',
        lowUSD: 400,
        highUSD: 1500,
        noteSq:
          'Nevojiten vetëm nëse nuk i keni; blini cilësi të mirë për veglat që përdorni çdo javë dhe merrni me qira ato që përdorni rrallë.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['vegla_pune'],
      },
      {
        id: 'safety-gear',
        labelSq: 'Shkallë e qëndrueshme, syze, doreza, maskë dhe detektor kabllosh e tubash në mur',
        category: 'pajisje',
        lowUSD: 120,
        highUSD: 350,
        noteSq:
          'Pajisje për sigurinë personale; detektori shërben për të mos shpuar kabllo ose tuba gjatë montimeve, jo për punë elektrike.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'materials-starter',
        labelSq: 'Stok fillestar materialesh (silikon, vida, fasheta, doreza, bojë retushi)',
        category: 'inventar',
        lowUSD: 100,
        highUSD: 300,
        noteSq: 'Mbani vetëm materialet që kërkohen më shpesh; pjesët e veçanta blihen për çdo punë dhe i faturohen pronarit.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'vehicle-organizer',
        labelSq: 'Kuti dhe organizues veglash për automjetin',
        category: 'hapje',
        lowUSD: 50,
        highUSD: 200,
        noteSq: 'Kursen kohë në çdo vizitë dhe i mbron veglat; mund të shtyhet derisa të keni disa klientë të rregullt.',
        scalesWithPriceLevel: false,
        optional: true,
      },
      {
        id: 'registration-fees',
        labelSq: 'Regjistrim aktiviteti dhe faturim',
        category: 'tarifa',
        lowUSD: 50,
        highUSD: 300,
        noteSq: 'Tarifat ndryshojnë sipas vendit dhe formës ligjore; merrni shumën e saktë nga regjistri zyrtar i bizneseve.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'market-test',
        labelSq: 'Test tregu: 5 vizita kontrolli falas, printime dhe transport',
        category: 'testim_tregu',
        lowUSD: 40,
        highUSD: 180,
        noteSq: 'Transport për vizitat falas, printim i listës së kontrollit dhe i raporteve shembull, si dhe disa materiale për riparime provë.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'transport-fuel',
        labelSq: 'Karburant dhe mirëmbajtje e automjetit',
        category: 'transport',
        lowUSD: 80,
        highUSD: 300,
        noteSq:
          'Varet nga distanca mes banesave; grupimi i klientëve në 1–2 lagje e ul ndjeshëm. Pa automjet, transporti i veglave dhe i materialeve bëhet i vështirë.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'liability-insurance',
        labelSq: 'Sigurim përgjegjësie për dëme në pronë',
        category: 'sigurime',
        lowUSD: 25,
        highUSD: 100,
        noteSq: 'Mbulon dëmet aksidentale gjatë punës (p.sh. rrjedhje uji pas një riparimi); pyesni 2–3 agjenci çfarë mbulojnë saktësisht.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'phone-scheduling',
        labelSq: 'Telefon dhe aplikacion për kërkesat dhe raportet',
        category: 'software',
        lowUSD: 10,
        highUSD: 40,
        noteSq: 'Një tabelë e thjeshtë dhe një dosje fotosh për çdo banesë mjaftojnë në fillim; rritet me numrin e klientëve.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'tool-maintenance',
        labelSq: 'Riparim dhe zëvendësim veglash',
        category: 'mirembajtje',
        lowUSD: 15,
        highUSD: 60,
        noteSq: 'Veglat që përdoren çdo ditë konsumohen; planifikoni një shumë të vogël çdo muaj në vend të blerjeve të papritura.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'bookkeeping',
        labelSq: 'Kontabilist i jashtëm',
        category: 'kontabilitet',
        lowUSD: 0,
        highUSD: 80,
        noteSq: 'Në disa vende aktiviteti i vogël mund ta mbajë vetë kontabilitetin; verifikoni detyrimet lokale.',
        scalesWithPriceLevel: true,
        optional: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 0, monthlyNewCustomers: 1, monthlyChurnPct: 6 },
      baze: { startCustomers: 1, monthlyNewCustomers: 2, monthlyChurnPct: 4 },
      optimist: { startCustomers: 2, monthlyNewCustomers: 3, monthlyChurnPct: 3 },
    },
    seasonality: [0.95, 0.9, 1, 1.05, 1, 1, 0.95, 1.05, 1.1, 1.05, 1, 0.95],
    seasonalityNoteSq:
      'Abonimet janë të qëndrueshme; ndryshimet vijnë kryesisht nga numri i klientëve të rinj. Hipotezë: kërkesat rriten kur ndërrohen qiramarrësit (fund vere, para vitit shkollor) dhe në fillim të sezonit të ngrohjes. Verifikojeni me regjistrin tuaj të kërkesave.',
    macroLinks: [
      {
        indicatorCode: 'urban_population_growth',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Kur popullsia urbane rritet, rritet edhe kërkesa për banesa me qira në qytete dhe numri i pronarëve që japin me qira një ose disa banesa.',
        ifSupportsSq: 'Rritja e popullsisë urbane sugjeron më shumë banesa me qira dhe më shumë pronarë që kanë nevojë për mirëmbajtje.',
        ifContradictsSq:
          'Me popullsi urbane që nuk rritet, tregu i qirave është më i qëndrueshëm por jo në zgjerim; fokusohuni te banesat më të vjetra që kërkojnë më shumë kujdes.',
      },
      {
        indicatorCode: 'remittances_gdp',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Në vendet me remitanca të larta, shumë familje në diasporë kanë blerë banesa në vendlindje dhe i japin me qira, por nuk janë aty për defektet e vogla.',
        ifSupportsSq: 'Remitancat e larta sugjerojnë një segment pronarësh që jetojnë larg dhe paguajnë për dikë të besuar në vend.',
        ifContradictsSq: 'Me remitanca të ulëta, fokusohuni te pronarët vendas me disa banesa dhe te administratorët e ndërtesave.',
      },
      {
        indicatorCode: 'inflation_cpi',
        direction: 'me_i_ulet_mbeshtet',
        mechanismSq:
          'Abonimi ka çmim fiks, ndërsa karburanti dhe materialet ndjekin inflacionin; inflacioni i lartë e ngushton marzhin nëse çmimi nuk rishikohet.',
        ifSupportsSq: 'Inflacioni i ulët e bën çmimin mujor fiks të qëndrueshëm për të dyja palët.',
        ifContradictsSq: 'Me inflacion të lartë, vendosni në kontratë rishikim vjetor të çmimit dhe faturoni materialet gjithmonë me koston reale.',
      },
    ],
    whyItCouldWork: {
      changeSq: 'Gjithnjë e më shumë banesa jepen me qira nga pronarë individualë, shumë prej të cilëve kanë punë tjetër ose jetojnë larg.',
      problemSq: 'Defektet e vogla të parregulluara kthehen në dëme të shtrenjta dhe në konflikte me qiramarrësit.',
      customerSq: 'Pronarë me 1–5 banesa me qira që nuk kanë kohë ose mjeshtër të besuar.',
      offerSq: 'Një person i besuar me çmim mujor të parashikueshëm, kontroll periodik dhe reagim brenda 48 orëve.',
      reasonToPaySq:
        'Më pak telefonata nga qiramarrësit, më pak dëme të mëdha dhe qiramarrës që qëndrojnë më gjatë; pronari paguan për qetësi dhe parashikueshmëri.',
      profitConditionsSq:
        'Fitimi kërkon banesa të grupuara afër njëra-tjetrës, kufi të qartë orësh në abonim, faturim të rregullt të orëve shtesë dhe pak klientë që kërkojnë shumë më tepër punë sesa paguajnë.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq: 'Pronarët preferojnë të paguajnë vetëm kur prishet diçka dhe nuk e shohin vlerën e abonimit.',
      },
      {
        kind: 'cmim',
        textSq: 'Pronarët e krahasojnë abonimin me çmimin e ulët të mjeshtrave informalë për një punë të vetme.',
      },
      {
        kind: 'konkurrence',
        textSq: 'Mjeshtra lokalë, agjenci menaxhimi pronash dhe administratorë ndërtesash që ofrojnë riparime si shërbim shtesë.',
      },
      {
        kind: 'kosto',
        textSq: 'Disa banesa të vjetra kërkojnë shumë më tepër orë dhe vizita sesa përfshin abonimi.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Kalimi pa dashje në punë elektrike, gazi ose strukturore, ose një dëm i shkaktuar në pronë, rrezikon njerëzit dhe sjell përgjegjësi ligjore.',
      },
      {
        kind: 'vonesa_pagesash',
        textSq: 'Pronarët që jetojnë jashtë vendit vonojnë pagesat ose kontestojnë orët shtesë.',
      },
      {
        kind: 'operacionale',
        textSq: 'Shumë kërkesa urgjente njëkohësisht e bëjnë të pamundur reagimin brenda 48 orëve për një person të vetëm.',
      },
    ],
    falsifiersSq: [
      'Nga 20 pronarë të intervistuar, më pak se 5 kanë pasur të paktën 3 defekte të vogla gjatë vitit të fundit.',
      'Pas 15 ofertave me çmim konkret, më pak se 2 pronarë paguajnë muajin e parë të abonimit.',
      'Gjatë 3 muajve pilot, banesat kërkojnë mesatarisht mbi 4 orë punë në muaj, pra dyfishin e asaj që përfshin abonimi.',
      'Mbi gjysma e kërkesave reale janë punë elektrike, gazi ose strukturore që nuk mund t’i kryeni vetë.',
    ],
    differentiationSq: [
      'Raport me foto pas çdo vizite, që pronari e sheh edhe nga jashtë vendit.',
      'Kufi i qartë i shërbimit: çfarë bëjmë vetë dhe çfarë koordinojmë me profesionistë të licencuar.',
      'Reagim i shkruar brenda 48 orëve dhe tarifë e shpallur për orët shtesë.',
      'Materialet me faturë dhe me koston reale, pa marzh të fshehur.',
    ],
    competitorTypesSq: [
      'Mjeshtra të pavarur që thirren për çdo punë veç e veç',
      'Agjenci menaxhimi pronash që i faturojnë riparimet me marzh',
      'Administratorë ndërtesash që ofrojnë ndihmë të rastësishme',
      'Vetë pronari ose të afërmit e tij',
      'Qiramarrës që i rregullojnë vetë defektet në këmbim të një zbritjeje në qira',
    ],
    cheapestTestSq:
      'Pesë vizita kontrolli falas te pronarë të njohur, me raport fotografik dhe ofertë me çmim për riparimet dhe për planin mujor. Matni sa riparime pranohen, sa abonime paguhen dhe sa orë kërkon realisht një banesë në muaj.',
    interviewQuestionsSq: [
      'Kur ishte hera e fundit që një qiramarrës ju njoftoi për një defekt dhe çfarë bëtë?',
      'Sa ditë u deshën për ta rregulluar dhe sa ju kushtoi?',
      'Si e gjeni sot mjeshtrin për punët e vogla dhe çfarë problemesh keni pasur?',
      'Sa defekte të vogla keni pasur në banesat tuaja gjatë vitit të fundit?',
      'Keni pasur ndonjë dëm të madh që filloi si problem i vogël? Si ndodhi?',
      'Sa shpenzuat gjithsej për riparime vitin e kaluar, përafërsisht?',
      'Kush tjetër merret me banesën kur ju nuk jeni aty?',
    ],
    firstCustomers: {
      whereSq: [
        'Pronarë banesash me qira në rrethin tuaj të të afërmve, miqve dhe fqinjëve',
        'Pronarë në diasporë me banesa me qira në qytetin tuaj, përmes rrjetit të familjeve',
        'Administratorë ndërtesash dhe agjenci të vogla qiraje që nuk kanë mjeshtër të tyre',
        'Qiramarrës që njihni dhe që mund t’ia përmendin shërbimin pronarit të tyre',
      ],
      howToContactSq: [
        'Telefonatë ose takim me rekomandim personal, me një shembull raporti kontrolli',
        'Fletë me çmimet e lënë te administratorët e ndërtesave dhe agjencitë e qirasë, me lejen e tyre',
        'Mesazh i personalizuar, një herë, te pronarët në diasporë që jua rekomandojnë të afërmit e tyre, pa mesazhe masive',
      ],
      offerSq: 'Vizitë kontrolli falas me raport fotografik, pastaj abonim mujor pa detyrim afatgjatë (anulim me njoftim 30-ditor).',
      followUpSq:
        'Dërgoni raportin brenda 24 orëve pas vizitës; një telefonatë pas 5 ditësh për ofertën, pastaj ndaloni nëse nuk ka interes.',
      metricsSq: [
        'Vizita kontrolli → abonime me pagesë (%)',
        'Orë pune për banesë në muaj',
        'Kërkesa të zgjidhura brenda 48 orëve (%)',
        'Pronarë që anulojnë në 6 muajt e parë',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje [emri], jam [emri] dhe merrem me riparime të vogla për pronarë banesash me qira në [zona]. Me një çmim mujor, e kontrolloj banesën çdo tremujor, rregulloj defektet e vogla brenda 48 orëve dhe ju dërgoj foto pas çdo vizite. Punët elektrike ose të gazit nuk i bëj vetë; i koordinoj me profesionistë të licencuar. Mund të bëj një kontroll falas në banesën tuaj, që ta shihni vetë raportin.',
    offerTemplateSq:
      'Oferta për [emri i pronarit] — banesa në [adresa ose zona]: (1) kontroll çdo tremujor me listë dhe raport me foto; (2) deri në [numri] orë riparime të vogla në muaj të përfshira; (3) reagim brenda 48 orëve për kërkesat e qiramarrësit, me pëlqimin e tij për hyrjen; (4) materialet me faturë dhe me koston reale; (5) orët shtesë me [tarifa] për orë. Çmimi: [çmimi] në muaj për banesë, pagesë brenda 20 ditëve nga fatura. Anulim me njoftim 30-ditor. Punët elektrike, të gazit dhe strukturore i kryejnë vetëm profesionistë të licencuar, me ofertë të veçantë.',
    feedbackQuestionsSq: [
      'Sa telefonata nga qiramarrësit morët vetë këtë muaj, krahasuar me më parë?',
      'A u zgjidhën kërkesat brenda afatit që premtuam?',
      'A ju duken të qarta raportet dhe faturat e materialeve?',
      'Çfarë do të shtonit ose do të hiqnit nga plani?',
    ],
    goCriteriaSq: [
      'Të paktën 4 banesa me abonim të paguar pas 15 ofertave.',
      'Orët mesatare për banesë mbeten brenda kufirit të abonimit në 2 muajt e parë.',
    ],
    killCriteriaSq: [
      'Pas 25 kontakteve dhe 15 ofertave, më pak se 2 abonime me pagesë.',
      'Më shumë se gjysma e kërkesave janë punë që kërkojnë profesionist të licencuar.',
      'Të ardhurat nga abonimet, pas transportit dhe materialeve, nuk mbulojnë pagën minimale që ju nevojitet edhe me 30 banesa.',
    ],
    phaseNotesSq: {
      p10_20: ['Intervistoni 15–20 pronarë, përfshirë disa në diasporë, për defektet e vitit të fundit dhe sa u kushtuan.'],
      p40_50: [
        'Verifikoni me shkrim cilat punë lejohen pa licencë, sigurimin për dëme në pronë dhe rregullat e hyrjes në banesë me qiramarrës.',
      ],
      p50_60: [
        'Gjeni 1 elektricist dhe 1 teknik gazi të licencuar me të cilët mund të koordinoni punët jashtë kufijve tuaj.',
        'Hartoni listën e kontrollit tremujor dhe shabllonin e raportit me foto.',
      ],
      p60_70: ['Pilot me 5 banesa për 2 muaj; shënoni orët, materialet dhe llojin e çdo kërkese.'],
    },
    assumptionsSq: [
      'Një person mund të mbulojë 30–50 banesa kur ato janë afër njëra-tjetrës dhe orët për banesë mbeten brenda kufirit.',
      'Shumica e defekteve në banesat me qira janë të vogla dhe nuk kërkojnë licencë.',
      'Pronarët pranojnë një çmim mujor për parashikueshmëri, edhe në muajt pa defekte.',
      'Materialet faturohen me koston reale dhe nuk ndikojnë në marzhin bazë.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 6. Small-group exam tutoring (maths/languages) — solo, rented room or online,
  //    works with minors (safeguarding), school-year seasonality
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'mesim-ne-grupe-te-vogla-per-provime',
    nameSq: 'Mësim në grupe të vogla për përgatitje provimesh (matematikë dhe gjuhë)',
    taglineSq: 'Grupe me 4–6 nxënës, test diagnostikues në fillim dhe raport i shkurtër për prindërit çdo muaj.',
    descriptionSq:
      'Kurse përgatitore për provimet kombëtare, provimet e pranimit ose certifikatat e gjuhëve të huaja, në grupe me 4–6 nxënës të të njëjtit nivel. Çdo nxënës fillon me një test diagnostikues, grupi ndjek një plan me tema dhe teste provë, dhe prindërit marrin çdo muaj një raport të shkurtër. Grupi i vogël e bën çmimin për nxënës më të ulët se mësimi privat individual, ndërsa mësuesi fiton më shumë për orë. Punohet me të mitur, prandaj kontrolli i sigurisë dhe rregullat e mbrojtjes së fëmijëve janë pjesë e shërbimit, jo opsion.',
    sector: 'edukim',
    offerSq:
      'Paketë mujore për nxënës: 8 seanca 90-minutëshe në grup me 4–6 nxënës (në një sallë të marrë me orë ose online), test diagnostikues në fillim, test provë çdo muaj në kushte provimi, ushtrime për shtëpi me korrigjim dhe raport mujor për prindin me temat ku nxënësi ka nevojë për më shumë punë.',
    payingCustomerSq:
      'Prindi i një nxënësi që përgatitet për provimet kombëtare, provimet e pranimit ose një certifikatë gjuhe; ose vetë studenti i rritur.',
    customerSegments: ['b2c'],
    problemSq:
      'Para provimeve, nxënësit kanë boshllëqe në tema të caktuara dhe pak praktikë në kushtet e provimit; mësimi privat individual është i shtrenjtë për shumë familje, ndërsa kurset e mëdha nuk e ndjekin çdo nxënës veç e veç.',
    modes: ['fizik', 'kombinuar'],
    marketScopes: ['lokal'],
    canStartFromHome: true,
    minTeam: 'vetem',
    requiredSkills: ['mesimdhenie'],
    helpfulSkills: ['gjuhe_te_huaja', 'analize_te_dhenash', 'marketing_digjital', 'sherbim_klienti'],
    helpfulAssets: ['kompjuter', 'internet_i_qendrueshem', 'apartament_shtese', 'dyqan_lokal'],
    minHoursPerWeek: 10,
    regulated: true,
    regulationNotesSq: [
      'Puna me të mitur: në shumë vende kërkohet ose rekomandohet vërtetimi i gjendjes gjyqësore (mungesa e dënimeve) për çdo person që jep mësim; Kërkon verifikim lokal. Merreni edhe kur nuk është i detyrueshëm dhe tregojani prindërve.',
      'Hartoni një politikë të thjeshtë mbrojtjeje të fëmijëve: asnjëherë vetëm me një nxënës në ambient të mbyllur pa dijeninë e prindit, komunikim vetëm përmes kanaleve që njeh prindi, pëlqim me shkrim nga prindi për seancat online dhe për çdo foto.',
      'Qendrat private të mësimit ose kurset me shumë nxënës mund të kërkojnë licencë ose regjistrim nga autoriteti arsimor dhe kushte për ambientin (sipërfaqe, dalje emergjence): Kërkon verifikim lokal.',
      'Nëse jeni mësues në një shkollë publike, verifikoni rregullat për konfliktin e interesit (p.sh. ndalimin e mësimit me pagesë për nxënësit tuaj).',
      'Notat, testet dhe kontaktet e nxënësve janë të dhëna personale të të miturve: verifikoni rregullat lokale të mbrojtjes së të dhënave dhe ruajini të sigurta.',
      'Regjistrimi i aktivitetit, faturimi dhe sigurimi i përgjegjësisë për ambientin: Kërkon verifikim lokal.',
    ],
    licensedProfessionalsSq: ['Mësues i kualifikuar për lëndën, kur rregullat lokale e kërkojnë për kurset ose qendrat e mësimit'],
    adultOnly: true,
    zeroCapitalTestSq:
      'Me kompjuterin dhe njohuritë që keni: ofroni një test diagnostikues falas në kushte provimi për 10–15 nxënës të njohur ose të rekomanduar nga prindërit, në praninë ose me pëlqimin e prindit, dhe u jepni prindërve një raport me temat e dobëta. Pastaj ofroni një paketë mujore me çmim për grupin e parë, online ose në një sallë komunitare të marrë falas ose për një orë. Kostoja reale: printimi i testeve, vërtetimi i gjendjes gjyqësore dhe koha juaj; regjistrimi i aktivitetit kërkon verifikim lokal para se të merrni pagesa.',
    revenueModelSq:
      'Paketë mujore për nxënës (njësia = 1 nxënës/muaj), e paguar në fillim të muajit. Kurset intensive para provimeve dhe mësimi individual faturohen veçmas dhe nuk përfshihen në modelin bazë.',
    pricing: {
      unitLabelSq: 'paketë mujore për nxënës',
      priceUSD: { low: 120, base: 200, high: 360 },
      variableCostUSD: { low: 3, base: 6, high: 12 },
      unitsPerCustomerPerMonth: 1,
      collectionDays: 0,
      supplierPaymentDays: 0,
      noteSq:
        'Kostoja variabël përfshin printimin e testeve dhe të materialeve dhe një pjesë të platformës online për nxënës; qiraja e sallës është kosto fikse. Fitimi varet nga mbushja e grupeve: një grup me 2 nxënës kërkon po aq orë sa një me 6. Çmimet janë supozime në USD; verifikoni sa paguajnë sot prindërit për mësim privat dhe për kurse në zonë.',
    },
    startupCosts: [
      {
        id: 'teaching-materials',
        labelSq: 'Libra përgatitorë, teste të viteve të kaluara dhe tabelë',
        category: 'hapje',
        lowUSD: 50,
        highUSD: 250,
        noteSq: 'Shumë teste të viteve të kaluara publikohen nga institucionet zyrtare; blini vetëm librat që përdorni realisht në plan.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'background-check',
        labelSq: 'Vërtetim i gjendjes gjyqësore dhe dokumente të tjera',
        category: 'tarifa',
        lowUSD: 5,
        highUSD: 60,
        noteSq:
          'Procedura dhe tarifa ndryshojnë sipas vendit; merrni informacionin nga zyra zyrtare përkatëse dhe rinovojeni sipas afatit të vlefshmërisë.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'safeguarding-training',
        labelSq: 'Trajnim për mbrojtjen e fëmijëve dhe ndihmën e parë',
        category: 'hapje',
        lowUSD: 0,
        highUSD: 150,
        noteSq: 'Disa organizata ofrojnë kurse bazë falas ose me tarifë të ulët; prindërit e vlerësojnë kur u tregoni certifikatën.',
        scalesWithPriceLevel: true,
        optional: true,
      },
      {
        id: 'laptop',
        labelSq: 'Laptop me kamerë për seancat online',
        category: 'pajisje',
        lowUSD: 400,
        highUSD: 900,
        noteSq: 'Nevojitet vetëm nëse nuk keni kompjuter; për seancat online kamera dhe mikrofoni duhen provuar paraprakisht.',
        scalesWithPriceLevel: false,
        optional: true,
        avoidedByAssets: ['kompjuter'],
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
        labelSq: 'Test tregu: teste diagnostikuese falas, printime dhe sallë për një ditë',
        category: 'testim_tregu',
        lowUSD: 30,
        highUSD: 150,
        noteSq: 'Printimi i testeve dhe i raporteve për prindërit, qiraja e një salle për testin diagnostikues dhe transporti.',
        scalesWithPriceLevel: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'room-rental',
        labelSq: 'Sallë e marrë me orë (qendër komunitare, zyrë ose sallë trajnimi)',
        category: 'qira',
        lowUSD: 80,
        highUSD: 400,
        noteSq:
          'Varet nga orët në javë dhe nga zona; krahasoni 3 opsione dhe kontrolloni dritën, ajrosjen dhe daljet. Seancat online e shmangin këtë kosto.',
        scalesWithPriceLevel: true,
        optional: true,
        avoidedByAssets: ['apartament_shtese', 'dyqan_lokal'],
      },
      {
        id: 'online-platform',
        labelSq: 'Platformë videokonferencash dhe planifikimi',
        category: 'software',
        lowUSD: 10,
        highUSD: 35,
        noteSq: 'Planet falas kanë shpesh kufi kohe për seancë; kontrolloni nëse ju mjaftojnë 90 minuta pa ndërprerje.',
        scalesWithPriceLevel: false,
      },
      {
        id: 'liability-insurance',
        labelSq: 'Sigurim përgjegjësie',
        category: 'sigurime',
        lowUSD: 10,
        highUSD: 50,
        noteSq: 'Mbulon aksidentet në ambientin e mësimit; pyesni 2–3 agjenci dhe pronarin e sallës çfarë mbulon sigurimi i tij.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'phone-internet',
        labelSq: 'Telefon dhe internet pune',
        category: 'sherbime_komunale',
        lowUSD: 10,
        highUSD: 40,
        noteSq: 'Për seancat online interneti duhet të jetë i qëndrueshëm; verifikoni paketat e operatorëve lokalë.',
        scalesWithPriceLevel: true,
      },
      {
        id: 'local-marketing',
        labelSq: 'Njoftime të printuara në libraritë dhe tabelat e lejuara',
        category: 'marketing',
        lowUSD: 0,
        highUSD: 40,
        noteSq: 'Rekomandimet nga prindërit zakonisht sjellin më shumë nxënës; printoni pak dhe vetëm aty ku lejohet.',
        scalesWithPriceLevel: true,
        optional: true,
      },
    ],
    ramp: {
      konservator: { startCustomers: 2, monthlyNewCustomers: 2, monthlyChurnPct: 12 },
      baze: { startCustomers: 4, monthlyNewCustomers: 3, monthlyChurnPct: 10 },
      optimist: { startCustomers: 6, monthlyNewCustomers: 5, monthlyChurnPct: 8 },
    },
    seasonality: [1.1, 1.2, 1.3, 1.4, 1.35, 0.6, 0.3, 0.4, 0.9, 1.1, 1.15, 1.2],
    seasonalityNoteSq:
      'Kurba ndjek vitin shkollor: kërkesa rritet nga janari deri në maj para provimeve, bie fort në verë dhe rifillon në shtator. Datat e provimeve ndryshojnë sipas vendit, ndërsa kurset verore për rimarrje ose për provimet e pranimit mund ta ndryshojnë kurbën. Planifikoni rezervë parash për verën.',
    macroLinks: [
      {
        indicatorCode: 'population_0_14_pct',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Një pjesë më e madhe e fëmijëve në popullsi do të thotë më shumë nxënës që në vitet e ardhshme do të përballen me provimet kombëtare dhe të pranimit.',
        ifSupportsSq: 'Pesha e lartë e fëmijëve sugjeron një treg që rinovohet çdo vit.',
        ifContradictsSq:
          'Me pak fëmijë dhe një popullsi që plaket, numri i nxënësve bie; fokusohuni te certifikatat e gjuhëve për të rinjtë dhe të rriturit.',
      },
      {
        indicatorCode: 'youth_unemployment',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq:
          'Kur të rinjtë e kanë të vështirë të gjejnë punë, familjet investojnë më shumë në rezultatet e provimeve dhe në certifikatat e gjuhëve për studime ose punë jashtë vendit.',
        ifSupportsSq:
          'Papunësia e lartë e të rinjve mund ta rrisë rëndësinë e provimeve dhe të certifikatave — por mund ta ulë edhe buxhetin e familjeve.',
        ifContradictsSq: 'Me papunësi të ulët, presioni për provime mbetet, por argumenti “certifikatë për punë jashtë” dobësohet.',
      },
      {
        indicatorCode: 'household_consumption_growth',
        direction: 'rritja_mbeshtet',
        mechanismSq:
          'Mësimi shtesë është shpenzim që familjet e shtyjnë kur buxheti ngushtohet; rritja e konsumit të familjeve e bën më të lehtë pagesën mujore.',
        ifSupportsSq: 'Rritja e konsumit të familjeve sugjeron hapësirë për shpenzime arsimore shtesë.',
        ifContradictsSq: 'Me konsum në rënie, prindërit kërkojnë paketa më të lira; mbani grupet të plota dhe kostot fikse të ulëta.',
      },
      {
        indicatorCode: 'remittances_gdp',
        direction: 'me_i_larte_mbeshtet',
        mechanismSq: 'Në shumë familje, remitancat nga të afërmit jashtë vendit financojnë shpenzimet për arsim, përfshirë kurset para provimeve.',
        ifSupportsSq: 'Remitancat e larta sugjerojnë që një pjesë e familjeve kanë burim shtesë për kurset.',
        ifContradictsSq: 'Me remitanca të ulëta, kërkesa varet vetëm nga të ardhurat vendase; testoni me kujdes nivelin e çmimit.',
      },
    ],
    whyItCouldWork: {
      changeSq:
        'Provimet kombëtare, provimet e pranimit dhe certifikatat e gjuhëve kanë peshë të madhe për studimet dhe punën, përfshirë studimet jashtë vendit.',
      problemSq: 'Shumë nxënës kanë boshllëqe dhe pak praktikë në kushtet e provimit, ndërsa mësimi individual kushton shumë.',
      customerSq: 'Prindër që duan përgatitje të strukturuar me çmim më të ulët se mësimi privat individual.',
      offerSq: 'Grupe të vogla me plan, teste provë dhe raport mujor për çdo nxënës.',
      reasonToPaySq: 'Përgatitje e matshme dhe e ndjekur, me çmim të përballueshëm, nga një mësues i besuar dhe i kontrolluar.',
      profitConditionsSq:
        'Fitimi kërkon grupe me të paktën 4 nxënës, sallë me kosto të ulët, pagesë në fillim të muajit dhe rezervë parash për muajt e verës.',
    },
    failureModes: [
      {
        kind: 'kerkese_e_pamjaftueshme',
        textSq: 'Prindërit preferojnë mësimin individual ose vetëm shkollën dhe nuk e shohin vlerën e grupit të vogël.',
      },
      {
        kind: 'cmim',
        textSq: 'Familjet nuk paguajnë çmimin që mbulon sallën dhe kohën kur grupet nuk mbushen.',
      },
      {
        kind: 'konkurrence',
        textSq: 'Mësues shkollash që japin mësim privat, qendra të mëdha kursesh dhe materiale falas online.',
      },
      {
        kind: 'kosto',
        textSq: 'Qiraja e sallës dhe orët e përgatitjes rriten më shpejt se numri i nxënësve.',
      },
      {
        kind: 'sezonalitet',
        textSq: 'Në verë të ardhurat bien pothuajse në zero, ndërsa disa kosto vazhdojnë.',
      },
      {
        kind: 'ligjore',
        textSq:
          'Mungesa e vërtetimit, e pëlqimit të prindërve ose e licencës kur kërkohet mund ta ndalojë aktivitetin dhe dëmton besimin.',
      },
      {
        kind: 'operacionale',
        textSq: 'Nxënës me nivele shumë të ndryshme në të njëjtin grup e ulin cilësinë për të gjithë.',
      },
    ],
    falsifiersSq: [
      'Nga 15 nxënës që bëjnë testin diagnostikues falas, më pak se 3 prindër paguajnë muajin e parë.',
      'Pas 2 muajsh, grupet kanë mesatarisht më pak se 3 nxënës, pra çmimi nuk mbulon sallën dhe kohën.',
      'Nga 20 prindër të intervistuar, më pak se 5 kanë paguar ndonjëherë për mësim shtesë.',
      'Më shumë se 30% e nxënësve largohen para provimit për shkak të cilësisë ose të orarit.',
    ],
    differentiationSq: [
      'Test diagnostikues në fillim dhe test provë çdo muaj në kushte provimi.',
      'Raport mujor i shkurtër për prindin, me temat konkrete ku duhet punuar.',
      'Grupe të ndara sipas nivelit, jo vetëm sipas klasës.',
      'Politikë e shkruar e mbrojtjes së fëmijëve dhe vërtetim i gjendjes gjyqësore që u tregohet prindërve.',
    ],
    competitorTypesSq: [
      'Mësues që japin mësim privat individual',
      'Qendra të mëdha kursesh me klasa të mëdha',
      'Materiale dhe video falas online',
      'Orët shtesë që organizon vetë shkolla',
    ],
    cheapestTestSq:
      'Test diagnostikues falas për 10–15 nxënës me raport për prindërit, i ndjekur nga ofertë me çmim për grupin e parë. Masni sa prindër paguajnë muajin e parë dhe sa nxënës mbeten pas muajit të dytë.',
    interviewQuestionsSq: [
      'Si po përgatitet sot fëmija juaj për provimin dhe kush e ndihmon?',
      'Sa paguat vitin e kaluar për mësim shtesë ose për kurse, nëse paguat?',
      'Kur ishte hera e fundit që e kuptuat se fëmija kishte vështirësi në një temë? Çfarë bëtë?',
      'Si e zgjodhët mësuesin ose kursin herën e fundit?',
      'Çfarë ju shqetësoi në kurset ose në mësimin privat që keni provuar?',
      'Çfarë informacioni merrni sot për përparimin e fëmijës dhe sa shpesh?',
      'Kush tjetër në familje merr pjesë në vendimin për kurset?',
    ],
    firstCustomers: {
      whereSq: [
        'Prindër në rrethin tuaj të njohjeve dhe të rekomanduar prej tyre',
        'Shoqatat e prindërve dhe takimet në shkolla, kur administrata e lejon prezantimin',
        'Libraritë dhe qendrat komunitare ku lejohen njoftimet',
        'Ish-nxënës ose studentë që ju njohin si mësues',
      ],
      howToContactSq: [
        'Prezantim i shkurtër për prindërit me lejen e organizatorit, me datën e testit diagnostikues falas',
        'Njoftim i printuar në tabelat ku lejohet, pa mesazhe masive dhe pa kontaktuar drejtpërdrejt nxënës të mitur',
        'Rekomandime nga prindër të kënaqur, pa dhurata në këmbim të vlerësimeve',
      ],
      offerSq:
        'Test diagnostikues falas me raport për prindin, pastaj paketë mujore me pagesë në fillim të muajit, pa detyrim për më shumë se një muaj.',
      followUpSq:
        'Takim ose telefonatë me prindin brenda 3 ditëve pas testit për të shpjeguar raportin; një rikujtesë e vetme pas 7 ditësh, pastaj ndaloni.',
      metricsSq: [
        'Teste diagnostikuese → nxënës që paguajnë (%)',
        'Nxënës mesatarisht për grup',
        'Nxënës që vazhdojnë pas muajit të dytë (%)',
        'Përmirësimi në testet provë nga muaji i parë te i treti',
      ],
    },
    pitchTemplateSq:
      'Përshëndetje [emri i prindit], jam [emri] dhe jap mësim [lënda] prej [numri] vitesh. Po organizoj grupe të vogla me 4–6 nxënës për përgatitjen e [provimi], me test provë çdo muaj dhe një raport të shkurtër për ju. Më [data] do të bëj një test diagnostikues falas, që të shihni vetë ku ka nevojë fëmija juaj; testi zhvillohet në [vendi] dhe prindërit janë të mirëpritur.',
    offerTemplateSq:
      'Oferta për [emri i nxënësit]: (1) 8 seanca 90-minutëshe në muaj në grup me [numri] nxënës të nivelit të ngjashëm, [ditët dhe ora], në [vendi ose online]; (2) test provë çdo muaj në kushte provimi; (3) ushtrime për shtëpi me korrigjim; (4) raport mujor për prindin. Çmimi: [çmimi] në muaj, pagesë në fillim të muajit; seancat e anuluara nga mësuesi rikuperohen. Komunikimi bëhet vetëm përmes kanaleve që miraton prindi. Nuk premtojmë notë ose rezultat të caktuar në provim; premtojmë plan, praktikë dhe informim të rregullt.',
    feedbackQuestionsSq: [
      'Çfarë ka ndryshuar në mënyrën si përgatitet fëmija juaj në shtëpi?',
      'A ju ndihmon raporti mujor? Çfarë mungon?',
      'Si i duken fëmijës ritmi dhe niveli i grupit?',
      'A ju përshtaten orari dhe vendi?',
    ],
    goCriteriaSq: [
      'Të paktën 2 grupe me 4 ose më shumë nxënës që paguajnë muajin e parë pas testit diagnostikues.',
      'Të paktën 80% e nxënësve vazhdojnë në muajin e dytë.',
    ],
    killCriteriaSq: [
      'Pas 2 testeve diagnostikuese me gjithsej 25 nxënës, më pak se 4 paguajnë.',
      'Grupet mbeten mesatarisht nën 3 nxënës edhe pas 3 muajsh.',
      'Vërtetimi ose licenca që kërkohet nuk mund të merret në vendin tuaj.',
    ],
    phaseNotesSq: {
      p10_20: ['Intervistoni 15–20 prindër dhe 5 nxënës të rritur për mënyrën si përgatiten sot dhe sa paguajnë.'],
      p20_30: ['Mblidhni çmimet dhe formatet e mësimit privat dhe të kurseve në zonë duke pyetur si prind, jo duke supozuar.'],
      p40_50: [
        'Merrni vërtetimin e gjendjes gjyqësore, verifikoni nëse kurset kërkojnë licencë nga autoriteti arsimor dhe shkruani politikën e mbrojtjes së fëmijëve.',
      ],
      p60_70: ['Organizoni një test diagnostikues falas dhe një muaj provë me grupin e parë.'],
      p80_90: ['Krahasoni rezultatet e testeve provë nga muaji i parë te i treti dhe riorganizoni grupet sipas nivelit.'],
    },
    assumptionsSq: [
      'Grupet mbushen mesatarisht me 4–5 nxënës.',
      'Prindërit paguajnë në fillim të muajit (0 ditë arkëtim).',
      'Një mësues mund të drejtojë 3–5 grupe në javë pa ulur cilësinë.',
      'Rezultati në provim nuk varet vetëm nga kursi; shërbimi premton proces, jo notë.',
    ],
    sourcesNoteSq:
      'Çmimet dhe kostot janë supozime të përgjithshme të bibliotekës në USD, jo çmime të verifikuara për ndonjë vend. Treguesit makro vijnë nga burimet e regjistrit me datë dhe periudhë.',
    assumptionsDate: '2026-10-02',
  },
];
