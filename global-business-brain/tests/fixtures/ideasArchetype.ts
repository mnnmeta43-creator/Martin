/**
 * Arketip testues për motorin e ideve, pikëzimin dhe krahasimin (complete, valid BusinessArchetype).
 *
 * SYNTHETIC — every amount, threshold and text below is a made-up test value. It describes no
 * real market, price, company or statistic. The macro links deliberately cover every direction
 * rule (level with/without reference, rise, fall) so claims and scoring can be tested.
 */
import type { BusinessArchetype, UserProfile } from '@/lib/domain/types';

export const IDEAS_ARCHETYPE: BusinessArchetype = {
  id: 'arketip-testues-ide',
  nameSq: 'Shërbim testues për motorin e ideve',
  taglineSq: 'Arketip sintetik: abonim mujor për biznese të vogla fiktive.',
  descriptionSq:
    'Arketip i plotë dhe fiktiv që përdoret vetëm në teste. Përshkruan një shërbim mujor për biznese të vogla, me shifra të rrumbullakëta që lejojnë kontrollin e rregullave të përputhjes, pohimeve dhe pikëzimit.',
  sector: 'sherbime_biznesi',
  offerSq: 'Paketë mujore fiktive: dy vizita shërbimi në muaj dhe një raport i shkurtër me shkrim për klientin.',
  payingCustomerSq: 'Pronari i një biznesi të vogël fiktiv.',
  customerSegments: ['b2b'],
  problemSq: 'Bizneset fiktive humbasin kohë çdo javë me një detyrë administrative që askush nuk e ka në përgjegjësi.',
  modes: ['kombinuar', 'online'],
  marketScopes: ['lokal'],
  canStartFromHome: true,
  minTeam: 'vetem',
  requiredSkills: ['administrim', 'shitje'],
  helpfulSkills: ['kontabilitet', 'sherbim_klienti'],
  helpfulAssets: ['kompjuter', 'telefon_smart'],
  minHoursPerWeek: 15,
  regulated: false,
  regulationNotesSq: ['Regjistrimi dhe faturimi: Kërkon verifikim lokal.'],
  licensedProfessionalsSq: [],
  adultOnly: false,
  zeroCapitalTestSq:
    'Test fiktiv pa kapital: bisedoni me 10 pronarë biznesesh dhe u ofroni një vizitë prove pa pagesë; kostoja reale është vetëm koha juaj.',
  revenueModelSq: 'Abonim mujor fiktiv: një njësi është një vizitë shërbimi, dy vizita në muaj për klient.',
  pricing: {
    unitLabelSq: 'vizitë shërbimi',
    priceUSD: { low: 20, base: 40, high: 60 },
    variableCostUSD: { low: 2, base: 4, high: 6 },
    unitsPerCustomerPerMonth: 2,
    collectionDays: 30,
    supplierPaymentDays: 0,
    noteSq: 'Vlera sintetike testi, jo çmime reale.',
  },
  startupCosts: [
    {
      id: 'laptop',
      labelSq: 'Laptop pune',
      category: 'pajisje',
      lowUSD: 400,
      highUSD: 800,
      noteSq: 'Shënim testi: shmanget nëse përdoruesi ka kompjuter.',
      scalesWithPriceLevel: false,
      optional: true,
      avoidedByAssets: ['kompjuter'],
    },
    {
      id: 'materiale',
      labelSq: 'Materiale fillestare',
      category: 'inventar',
      lowUSD: 100,
      highUSD: 200,
      noteSq: 'Shënim testi për materialet fillestare.',
      scalesWithPriceLevel: false,
    },
    {
      id: 'regjistrim',
      labelSq: 'Regjistrim aktiviteti',
      category: 'tarifa',
      lowUSD: 50,
      highUSD: 150,
      noteSq: 'Shënim testi: tarifa varet nga vendi; verifikojeni.',
      scalesWithPriceLevel: true,
    },
    {
      id: 'testim',
      labelSq: 'Testim tregu',
      category: 'testim_tregu',
      lowUSD: 50,
      highUSD: 100,
      noteSq: 'Shënim testi për printime dhe transport gjatë testimit.',
      scalesWithPriceLevel: true,
    },
  ],
  monthlyFixedCosts: [
    {
      id: 'software',
      labelSq: 'Software',
      category: 'software',
      lowUSD: 20,
      highUSD: 40,
      noteSq: 'Shënim testi për abonimet software.',
      scalesWithPriceLevel: false,
    },
    {
      id: 'transport',
      labelSq: 'Transport',
      category: 'transport',
      lowUSD: 40,
      highUSD: 80,
      noteSq: 'Shënim testi për transportin drejt klientëve.',
      scalesWithPriceLevel: true,
    },
  ],
  ramp: {
    konservator: { startCustomers: 0, monthlyNewCustomers: 1, monthlyChurnPct: 8 },
    baze: { startCustomers: 1, monthlyNewCustomers: 2, monthlyChurnPct: 5 },
    optimist: { startCustomers: 2, monthlyNewCustomers: 4, monthlyChurnPct: 3 },
  },
  seasonality: [0.8, 0.9, 1, 1, 1.1, 1.2, 1.2, 1.1, 1, 0.9, 0.9, 0.8],
  seasonalityNoteSq: 'Sezonalitet sintetik testi.',
  macroLinks: [
    {
      indicatorCode: 'internet_users_pct',
      direction: 'me_i_larte_mbeshtet',
      referenceValue: 50,
      mechanismSq: 'Mekanizëm testi: më shumë përdorues interneti, më shumë klientë që kërkojnë shërbimin online.',
      ifSupportsSq: 'Shënim testi kur treguesi mbështet.',
      ifContradictsSq: 'Shënim testi kur treguesi kundërshton.',
    },
    {
      indicatorCode: 'services_va_gdp',
      direction: 'me_i_larte_mbeshtet',
      mechanismSq: 'Mekanizëm testi: më shumë biznese shërbimesh si klientë të mundshëm.',
      ifSupportsSq: 'Shënim testi kur treguesi mbështet.',
      ifContradictsSq: 'Shënim testi kur treguesi kundërshton.',
    },
    {
      indicatorCode: 'tourism_arrivals',
      direction: 'rritja_mbeshtet',
      mechanismSq: 'Mekanizëm testi: rritja e vizitorëve rrit kërkesën e bizneseve lokale.',
      ifSupportsSq: 'Shënim testi kur treguesi mbështet.',
      ifContradictsSq: 'Shënim testi kur treguesi kundërshton.',
    },
    {
      indicatorCode: 'new_business_density',
      direction: 'me_i_larte_mbeshtet',
      referenceValue: 1,
      mechanismSq: 'Mekanizëm testi: më shumë biznese të reja, më shumë klientë që kanë nevojë për ndihmë.',
      ifSupportsSq: 'Shënim testi kur treguesi mbështet.',
      ifContradictsSq: 'Shënim testi kur treguesi kundërshton.',
    },
    {
      indicatorCode: 'lending_rate',
      direction: 'me_i_ulet_mbeshtet',
      referenceValue: 8,
      mechanismSq: 'Mekanizëm testi: kredia e lirë i lë bizneseve më shumë para për shërbime.',
      ifSupportsSq: 'Shënim testi kur treguesi mbështet.',
      ifContradictsSq: 'Shënim testi kur treguesi kundërshton.',
    },
  ],
  whyItCouldWork: {
    changeSq: 'Ndryshim fiktiv testi: gjithnjë e më shumë biznese punojnë online.',
    problemSq: 'Problem fiktiv testi: detyra administrative mbeten pa u bërë.',
    customerSq: 'Klient fiktiv testi: pronari i një biznesi të vogël.',
    offerSq: 'Ofertë fiktive testi: dy vizita shërbimi në muaj.',
    reasonToPaySq: 'Arsye fiktive testi: pronari kursen kohë çdo javë.',
    profitConditionsSq: 'Kushte fiktive testi: mjaft klientë që paguajnë në kohë.',
  },
  failureModes: [
    { kind: 'kerkese_e_pamjaftueshme', textSq: 'Test: pronarët nuk e ndiejnë problemin mjaftueshëm.' },
    { kind: 'cmim', textSq: 'Test: çmimi i pranuar është shumë i ulët.' },
    { kind: 'konkurrence', textSq: 'Test: alternativa falas nga të afërmit.' },
    { kind: 'kosto', textSq: 'Test: çdo klient kërkon më shumë orë se sa ishte planifikuar.' },
    { kind: 'vonesa_pagesash', textSq: 'Test: klientët vonojnë pagesat mujore.' },
  ],
  falsifiersSq: [
    'Test: nga 15 pronarë, asnjë nuk e përmend problemin pa u pyetur.',
    'Test: pas 20 ofertave, më pak se 2 paguajnë muajin e parë.',
    'Test: koha për klient kalon 6 orë në muaj pas muajit të dytë.',
  ],
  differentiationSq: ['Dallim testi: afat i shkruar për çdo kërkesë.', 'Dallim testi: specializim në një lloj biznesi.'],
  competitorTypesSq: ['Lloj testi: freelancerë të përgjithshëm', 'Lloj testi: të afërm që e bëjnë falas'],
  cheapestTestSq: 'Test fiktiv: 20 oferta me çmim konkret për muajin e parë dhe numërimi i pagesave.',
  interviewQuestionsSq: [
    'Kur ishte hera e fundit që ju ndodhi ky problem?',
    'Kush e bën sot këtë punë dhe sa shpesh?',
    'Sa kohë ju mori hera e fundit?',
    'Çfarë keni provuar më parë dhe pse e latë?',
    'Sa paguani sot për diçka të ngjashme?',
    'Kush tjetër merr pjesë në vendim?',
  ],
  firstCustomers: {
    whereSq: ['Lagjja juaj (test)', 'Bizneset ku jeni klient (test)'],
    howToContactSq: ['Vizitë personale në orë të qeta (test)', 'Rekomandim nga një klient pilot (test)'],
    offerSq: 'Ofertë testi: muaji i parë me çmim prove.',
    followUpSq: 'Një rikujtesë pas 7 ditësh, pastaj ndalni (test).',
    metricsSq: ['Kontakte → takime (%) (test)', 'Takime → pagesa (%) (test)'],
  },
  pitchTemplateSq:
    'Përshëndetje, jam [emri]. Kam vënë re se [problemi] ju merr kohë çdo javë. Mund ta provoj një muaj me çmim prove, pa kontratë afatgjatë (shabllon testi).',
  offerTemplateSq:
    'Oferta për [emri i biznesit]: dy vizita shërbimi në muaj, raport i shkurtër dhe anulim me njoftim 30-ditor. Çmimi: [çmimi] në muaj (shabllon testi).',
  feedbackQuestionsSq: ['Çfarë ndryshoi pas muajit të parë?', 'Cila pjesë ju duket më pak e vlefshme?', 'Kujt do t’ia përmendnit?'],
  goCriteriaSq: ['Test: 3 klientë me pagesë pas 20 ofertave.', 'Test: koha për klient nën 4 orë në muaj.'],
  killCriteriaSq: ['Test: më pak se 2 klientë pas 40 kontakteve.', 'Test: gjysma e pilotëve anulojnë brenda 2 muajve.'],
  phaseNotesSq: { p10_20: ['Shënim testi për fazën 10–20.'] },
  assumptionsSq: ['Supozim testi 1.', 'Supozim testi 2.', 'Supozim testi 3.'],
  sourcesNoteSq: 'Vlera sintetike testi.',
  assumptionsDate: '2026-10-02',
};

/** Variant of the test archetype with a new id (so lists never contain duplicate ids). */
export function archetypeVariant(id: string, overrides: Partial<BusinessArchetype>): BusinessArchetype {
  return { ...IDEAS_ARCHETYPE, ...overrides, id };
}

/** A complete profile that fits IDEAS_ARCHETYPE; override fields per test. */
export function testProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    residenceCountry: 'ZZA',
    operableCountries: ['ZZA'],
    targetCountries: ['ZZA'],
    capital: { amount: 5000, currency: 'EUR' },
    skills: ['administrim', 'shitje'],
    experienceYears: 3,
    experienceSectors: ['sherbime_biznesi'],
    hoursPerWeek: 30,
    assets: ['kompjuter'],
    teamMode: 'vetem',
    businessModes: ['fizik', 'online', 'kombinuar'],
    marketScopes: ['lokal', 'nderkombetar'],
    startLocations: ['shtepi', 'ambient'],
    isAdult: true,
    riskTolerance: 'mesatare',
    ownerIncomeNeedMonthly: null,
    ...overrides,
  };
}
