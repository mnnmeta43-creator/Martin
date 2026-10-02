/**
 * "Ku ta nis": registration country vs operating country vs customers' country, what must be
 * verified locally, and a concrete field-research plan.
 *
 * We hold no verified city or neighbourhood data, so this module never recommends a precise
 * location, never assumes the user may register, work or relocate anywhere, and never suggests
 * moving or registering abroad because of a single tax figure. Legal and tax points are phrased
 * as things to verify with official sources; links come only from the source registry.
 * Server-side only (uses the country catalogue).
 */
import type { BusinessArchetype, CountryCode, LocationAnalysis, UserProfile } from '@/lib/domain/types';
import { getCountry } from '@/lib/data/countries';
import { getOfficialLinks } from '@/lib/data/sources/registry';

type FieldStep = LocationAnalysis['fieldResearchPlan'][number];

const VERIFY = 'Kërkon verifikim lokal.';
const GOODS_SECTORS: ReadonlySet<BusinessArchetype['sector']> = new Set(['tregti', 'prodhim', 'ushqim', 'bujqesi']);
const MAX_FIELD_STEPS = 8;
const MIN_FIELD_STEPS = 6;

/** Facts about the archetype that change what the user must verify and research. */
interface Shape {
  remoteOnly: boolean; // every mode is online
  physical: boolean; // part of the work happens face to face
  needsPremises: boolean; // cannot start from home
  international: boolean;
  localOnly: boolean;
  sellsGoods: boolean;
  online: boolean;
}

function shapeOf(a: BusinessArchetype): Shape {
  const hasInventory = a.startupCosts.some((c) => c.category === 'inventar');
  return {
    remoteOnly: a.modes.length > 0 && a.modes.every((m) => m === 'online'),
    physical: a.modes.includes('fizik') || !a.canStartFromHome,
    needsPremises: !a.canStartFromHome,
    international: a.marketScopes.includes('nderkombetar'),
    localOnly: a.marketScopes.length > 0 && a.marketScopes.every((s) => s === 'lokal'),
    sellsGoods: hasInventory || GOODS_SECTORS.has(a.sector),
    online: a.modes.includes('online') || a.modes.includes('kombinuar'),
  };
}

interface Place {
  code: CountryCode;
  nameSq: string;
  isDemo: boolean;
}

function placeOf(code: CountryCode): Place {
  const country = getCountry(code, { includeDemo: true });
  return { code: code.toUpperCase(), nameSq: country?.nameSq ?? code.toUpperCase(), isDemo: country?.isDemo ?? false };
}

function areaSq(country: Place, city: string | null): string {
  return city ? `${city} (${country.nameSq})` : country.nameSq;
}

function registrationSq(a: BusinessArchetype, shape: Shape, country: Place, residence: Place): string {
  const noTaxShopping =
    'Mos e zgjidhni vendin e regjistrimit vetëm sepse një tregues tatimor duket më i ulët: regjistrimi jashtë vendit sjell detyrime atje dhe kërkon të drejtë ligjore për ta bërë.';
  if (shape.remoteOnly && shape.international) {
    return `Për një shërbim online me klientë edhe jashtë vendit, biznesi zakonisht regjistrohet aty ku jetoni dhe keni rezidencën tatimore (sipas profilit: ${residence.nameSq}), jo domosdoshmërisht aty ku janë klientët. ${noTaxShopping} ${VERIFY}`;
  }
  if (shape.physical) {
    const away =
      country.code === residence.code
        ? ''
        : ` Ju jetoni në ${residence.nameSq}: verifikoni nëse si jo-rezident mund të regjistroni biznes në ${country.nameSq} dhe me cilat kushte.`;
    return `Meqë «${a.nameSq}» kryhet fizikisht, biznesi zakonisht regjistrohet në vendin ku kryhet puna: ${country.nameSq}.${away} ${VERIFY}`;
  }
  return `Biznesi zakonisht regjistrohet në vendin ku jetoni dhe punoni realisht (sipas profilit: ${residence.nameSq}); nëse po shqyrtoni ${country.nameSq} si vend tjetër, verifikoni nëse keni të drejtë ta regjistroni atje. ${noTaxShopping} ${VERIFY}`;
}

function operationSq(shape: Shape, country: Place, city: string | null, profile: UserProfile): string {
  const declared = profile.operableCountries.map((c) => c.toUpperCase()).includes(country.code);
  const status = declared
    ? `Ju e keni deklaruar ${country.nameSq} si vend ku mund të operoni ligjërisht — kjo është vetëdeklarim, aplikacioni nuk e verifikon.`
    : `Nuk e keni deklaruar ${country.nameSq} si vend ku mund të operoni: verifikoni të drejtën e qëndrimit dhe të punës përpara çdo hapi.`;
  if (shape.remoteOnly) {
    return `Puna mund të kryhet në distancë, por vendi ku ndodheni fizikisht kur punoni zakonisht përcakton tatimet dhe të drejtën e punës. ${status}`;
  }
  const premises = shape.needsPremises ? ' Ky aktivitet kërkon ambient, prandaj vlen edhe leja e përdorimit të lokalit.' : '';
  return `Puna kryhet fizikisht në ${areaSq(country, city)}: aty duhet të keni të drejtë qëndrimi dhe pune, lejet e aktivitetit dhe sigurimet.${premises} ${status}`;
}

function customersSq(a: BusinessArchetype, shape: Shape, country: Place, city: string | null, profile: UserProfile): string {
  const b2b = a.customerSegments.includes('b2b');
  const who = b2b ? 'Klientët janë kryesisht biznese' : 'Klientët janë kryesisht individë';
  if (shape.international) {
    const targets = profile.targetCountries
      .map((c) => c.toUpperCase())
      .filter((c) => c !== country.code)
      .map((c) => placeOf(c).nameSq);
    const where = targets.length > 0 ? ` (sipas profilit: ${targets.join(', ')})` : '';
    return `${who} dhe mund të jenë edhe në vende të tjera${where}. Kjo sjell pyetje për TVSH-në e shërbimeve ndërkufitare, monedhën e faturimit, pagesat ndërkombëtare dhe rregullat e konsumatorit e të të dhënave në vendin e klientit. ${VERIFY}`;
  }
  return `${who} në zonën ku operoni: ${areaSq(country, city)}. Çmimi, gjuha, orari dhe mënyrat e pagesës duhet t’u përshtaten atyre; kërkesën e vërtetoni me bisedat dhe numërimet e planit më poshtë.`;
}

function verificationList(a: BusinessArchetype, shape: Shape, country: Place): string[] {
  const items = [
    `E drejta juaj për të qëndruar dhe për të punuar si i vetëpunësuar ose pronar biznesi në ${country.nameSq} (leje qëndrimi/pune nëse nuk jeni shtetas). Mos supozoni se mund të regjistroheni, punoni ose zhvendoseni kudo. ${VERIFY}`,
    `Nëse jo-rezidentët mund të regjistrojnë biznes në ${country.nameSq} dhe me cilat kushte (adresë vendore, përfaqësues, numër identifikimi tatimor). ${VERIFY}`,
    `Rezidenca juaj tatimore: ku tatoheni ju personalisht dhe ku tatohet biznesi, sidomos nëse jetoni në një vend dhe regjistroheni ose keni klientë në një tjetër. Verifikojeni me administratën tatimore ose me një këshilltar tatimor të licencuar. ${VERIFY}`,
    `Hapja e llogarisë bankare të biznesit dhe disponueshmëria e pagesave me kartë ose online për biznesin tuaj në ${country.nameSq} — jo çdo shërbim pagesash funksionon në çdo vend. ${VERIFY}`,
    a.regulated
      ? `Licencat dhe lejet e aktivitetit për «${a.nameSq}»${a.licensedProfessionalsSq.length > 0 ? `, si dhe profesionistët e licencuar që duhen (${a.licensedProfessionalsSq.join(', ')})` : ''}. ${VERIFY}`
      : `Kodi i veprimtarisë, lejet e bashkisë dhe çdo licencë që mund të kërkohet për «${a.nameSq}». ${VERIFY}`,
    ...a.regulationNotesSq.map((n) => (/verifik/i.test(n) ? n : `${n} ${VERIFY}`)),
    `Sigurimet e nevojshme ose të arsyeshme: përgjegjësia ndaj palëve të treta, dëmtimi i pajisjeve ose i mallit dhe sigurimet shoqërore e shëndetësore për veten. ${VERIFY}`,
    `Mbrojtja e të dhënave personale nëse ruani emra, telefona, adresa ose të dhëna pagese të klientëve: pëlqimi, ruajtja e sigurt dhe fshirja me kërkesë. ${VERIFY}`,
  ];
  if (shape.needsPremises) {
    items.push(`Zonimi dhe leja e përdorimit të ambientit (a lejohet ky aktivitet në atë lokal), si dhe kushtet e kontratës së qirasë. ${VERIFY}`);
  } else {
    items.push(`A lejohet ushtrimi i këtij aktiviteti nga banesa (rregullat e bashkisë dhe të pallatit, adresa zyrtare e biznesit). ${VERIFY}`);
  }
  if (shape.sellsGoods) {
    items.push(`Rregullat e importit/eksportit dhe të doganës për mallrat, si dhe standardet, etiketimi dhe certifikatat e produkteve. ${VERIFY}`);
  }
  if (shape.international || shape.online) {
    items.push(`TVSH-ja dhe faturimi për shërbime ndërkufitare: rregullat mund të ndryshojnë sipas vendit të klientit dhe nëse klienti është biznes apo individ. ${VERIFY}`);
  }
  return [...new Set(items)];
}

function largestStartupLabels(a: BusinessArchetype, count: number): string[] {
  return [...a.startupCosts]
    .filter((c) => c.category !== 'testim_tregu' && c.category !== 'tarifa')
    .sort((x, y) => y.highUSD - x.highUSD || x.id.localeCompare(y.id))
    .slice(0, count)
    .map((c) => c.labelSq.toLowerCase());
}

function competitorStep(a: BusinessArchetype, shape: Shape, area: string): FieldStep {
  const types = a.competitorTypesSq.slice(0, 3).join('; ');
  const how = shape.remoteOnly
    ? `Kërkoni në motorët e kërkimit, tregjet online dhe hartat online alternativat e këtyre llojeve: ${types}. Shënoni edhe ato që klientët përmendin në biseda.`
    : `Kërkoni në hartat online alternativat brenda zonës ${area} (${types}), pastaj ecni në këmbë zonën për të gjetur ato që nuk shfaqen online.`;
  return {
    stepSq: 'Numëroni konkurrentët dhe alternativat',
    howSq: how,
    outputSq: 'Listë me çdo alternativë: lloji, vendndodhja ose kanali, çmimi i shpallur (nëse ka) dhe orari.',
    costSq: 'Kryesisht kohë (3–5 orë) dhe transport lokal.',
  };
}

function priceStep(a: BusinessArchetype): FieldStep {
  return {
    stepSq: 'Anketë çmimesh për të paktën 10 alternativa',
    howSq: `Mblidhni çmimin për të njëjtën njësi («${a.pricing.unitLabelSq}») nga të paktën 10 alternativa: lista publike çmimesh, faqe zyrtare ose duke kërkuar ofertë hapur, duke thënë se po krahasoni çmime.`,
    outputSq: 'Tabelë me ≥10 çmime, data dhe burimi i secilit, me diapazonin dhe vlerën e mesme.',
    costSq: 'Kohë dhe disa telefonata.',
  };
}

function footTrafficStep(area: string): FieldStep {
  return {
    stepSq: 'Numëroni kalimtarët dhe klientët e alternativave',
    howSq: `Në pikat që ju interesojnë në ${area}, numëroni për 30 minuta njerëzit që kalojnë ose hyjnë te alternativat, në 3 orare (mëngjes, mesditë, mbrëmje) dhe në 2 ditë të ndryshme (një ditë pune dhe një ditë fundjave).`,
    outputSq: '6 numërime të dokumentuara me datë, orë dhe vend.',
    costSq: 'Kohë (rreth 3 orë gjithsej).',
  };
}

function rentStep(area: string): FieldStep {
  return {
    stepSq: 'Merrni 3 oferta qiraje',
    howSq: `Kërkoni të paktën 3 oferta reale qiraje për ambiente të përshtatshme në ${area}; pyesni për depozitën, kohëzgjatjen e kontratës, kush paguan rregullimet dhe nëse lejohet ky aktivitet në lokal.`,
    outputSq: '3 oferta me shkrim me çmim, sipërfaqe, depozitë dhe kushte — futini në modelin financiar si «ofertë».',
    costSq: 'Kohë; disa agjenci marrin tarifë — pyesni paraprakisht.',
  };
}

function licensingStep(a: BusinessArchetype, area: string): FieldStep {
  return {
    stepSq: 'Vizitoni zyrën e licencimit të bashkisë',
    howSq: `Pyesni në zyrën e bashkisë ose në sportelin e biznesit në ${area} çfarë lejesh, kodesh veprimtarie dhe inspektimesh kërkohen për «${a.nameSq}»; kërkoni listën me shkrim ose lidhjen zyrtare.`,
    outputSq: 'Listë dokumentesh, tarifash dhe afatesh, me burimin zyrtar dhe datën.',
    costSq: 'Kohë; tarifat zyrtare paguhen vetëm kur aplikoni.',
  };
}

function conversationsStep(a: BusinessArchetype): FieldStep {
  return {
    stepSq: 'Bisedoni me të paktën 10 klientë të mundshëm',
    howSq: `Bisedoni me të paktën 10 persona nga grupi «${a.payingCustomerSq}» me pyetjet për sjelljen e kaluar nga kompleti i validimit; mos e prezantoni idenë tuaj në fillim të bisedës.`,
    outputSq: 'Shënime për çdo bisedë: problemi, si e zgjidhin sot, sa paguajnë sot dhe kush vendos.',
    costSq: 'Kohë; ndoshta transport ose një kafe.',
  };
}

function suppliersStep(a: BusinessArchetype): FieldStep {
  const items = largestStartupLabels(a, 3);
  const what = items.length > 0 ? ` për zërat më të mëdhenj të kostos (${items.join(', ')})` : '';
  return {
    stepSq: 'Kërkoni oferta nga furnitorët',
    howSq: `Kërkoni të paktën 2–3 oferta me shkrim${what} dhe për furnizimet e përsëritura; pyesni për afatin e dorëzimit dhe kushtet e pagesës.`,
    outputSq: 'Oferta me çmim, datë, afat dorëzimi dhe kushte pagese — zëvendësojnë supozimet në modelin financiar.',
    costSq: 'Kohë.',
  };
}

function channelsStep(a: BusinessArchetype): FieldStep {
  return {
    stepSq: 'Vëzhgoni kanalet ku klientët kërkojnë zgjidhje',
    howSq: `Identifikoni 5 kanale (grupe profesionale, tregje online, forume, shoqata) ku persona nga grupi «${a.payingCustomerSq}» kërkojnë këtë lloj zgjidhjeje; për 2 javë numëroni kërkesat publike që shfaqen, pa dërguar mesazhe masive.`,
    outputSq: 'Listë kanalesh me numrin e kërkesave të vëzhguara dhe shembuj të fjalëve që përdorin klientët.',
    costSq: 'Kohë.',
  };
}

function fieldPlan(a: BusinessArchetype, shape: Shape, area: string): FieldStep[] {
  const steps = [competitorStep(a, shape, area), priceStep(a)];
  if (shape.physical) steps.push(footTrafficStep(area));
  if (shape.needsPremises) steps.push(rentStep(area));
  steps.push(licensingStep(a, area), conversationsStep(a), suppliersStep(a));
  if (shape.online || steps.length < MIN_FIELD_STEPS) steps.push(channelsStep(a));
  return steps.slice(0, MAX_FIELD_STEPS);
}

function noteSq(country: Place, city: string | null): string {
  const cityPart = city ? `, përfshirë ${city},` : ',';
  const base = `Nuk kemi të dhëna të verifikuara për qytete ose lagje${cityPart} prandaj ky është plan kërkimi në terren, jo rekomandim i saktë vendndodhjeje. Zgjidhni zonën vetëm pasi të keni numërimet, çmimet dhe bisedat që mblidhni vetë. Mos vendosni të zhvendoseni ose të regjistroni biznesin jashtë vendit mbi bazën e një treguesi të vetëm tatimor.`;
  if (!country.isDemo) return base;
  return `${base} ${country.nameSq} është ekonomi DEMO fiktive: nuk ka lidhje zyrtare dhe asnjë rregull real nuk zbatohet për të.`;
}

/** Location analysis for one idea in one operating country (and optionally a city). */
export function buildLocationAnalysis(
  a: BusinessArchetype,
  profile: UserProfile,
  countryCode: CountryCode,
  city?: string | null,
): LocationAnalysis {
  const shape = shapeOf(a);
  const country = placeOf(countryCode);
  const residence = placeOf(profile.residenceCountry);
  const cleanCity = city?.trim() ? city.trim() : null;
  return {
    registrationVsOperationSq: {
      registrationSq: registrationSq(a, shape, country, residence),
      operationSq: operationSq(shape, country, cleanCity, profile),
      customersSq: customersSq(a, shape, country, cleanCity, profile),
    },
    toVerifySq: verificationList(a, shape, country),
    fieldResearchPlan: fieldPlan(a, shape, areaSq(country, cleanCity)),
    officialLinks: country.isDemo ? [] : getOfficialLinks(country.code),
    noteSq: noteSq(country, cleanCity),
  };
}
