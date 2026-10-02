/**
 * "Testoje përpara se të investosh": a validation kit for one idea.
 *
 * Combines the archetype's own interview questions, first-customer plan and templates with
 * general rules for honest customer research: ask about past behaviour, not hypothetical
 * purchases; trust payments over compliments; never spam, fake testimonials or mislead.
 * Decision thresholds are explicit assumptions so the user can change them, not standards.
 */
import type { BusinessArchetype, IdeaRecommendation, ValidationKit } from '@/lib/domain/types';

type DecisionCriterion = ValidationKit['decisionCriteriaSq'][number];

const EVIDENCE_LEVEL_SQ: Record<IdeaRecommendation['evidence']['level'], string> = {
  e_larte: 'e lartë',
  mesatare: 'mesatare',
  e_ulet: 'e ulët',
  shume_e_ulet: 'shumë e ulët',
};

/** General past-behaviour questions that work for any idea (none of them asks "would you buy"). */
const GENERAL_QUESTIONS_SQ = [
  'Më tregoni për herën e fundit që ju ndodhi ky problem. Çfarë bëtë konkretisht?',
  'Sa ju kushtoi ajo herë, në kohë ose në para?',
  'Çfarë keni provuar deri tani për ta zgjidhur dhe çfarë nuk ju pëlqeu?',
  'Kë tjetër më këshilloni të pyes për këtë temë?',
];

const AVOID_QUESTIONS_SQ = [
  '«A do ta blinit?» — fton një “po” të sjellshme; njerëzit rrallë thonë “jo” në sy, dhe premtimi nuk u kushton asgjë.',
  '«A ju pëlqen ideja ime?» — mat mirësjelljen, jo nevojën; flisni për jetën dhe punën e tyre, jo për idenë tuaj.',
  '«Sa do të paguanit për këtë?» — çmimet hipotetike janë të pabesueshme; pyesni sa paguajnë sot për zgjidhjen që përdorin.',
  '«Nëse do të ekzistonte një shërbim i tillë, a do ta përdornit?» — e ardhmja hipotetike nuk parashikon sjelljen; pyesni çfarë kanë bërë herën e fundit.',
  '«A mendoni se njerëzit këtu kanë nevojë për këtë?» — kërkon opinion për të tjerët; pyesni për përvojën e vetë personit.',
  'Pyetje që përmbajnë përgjigjen («Nuk është e bezdisshme kur…?») — e shtyjnë bashkëbiseduesin të pajtohet me ju.',
];

const VERBAL_VS_BEHAVIOUR_SQ =
  '“Po, do ta blija” nuk është blerje. Vlen vetëm sjellja që i kushton diçka klientit: një pagesë, një parapagim, një depozitë e rimbursueshme, një letër qëllimi me sasi dhe afat, ose koha që jep për një takim të dytë. Regjistroni çdo provë në ditarin e provave me datë dhe burim, dhe numëroni vetëm ato kur vendosni.';

function interviewQuestions(a: BusinessArchetype): string[] {
  return [...new Set([...a.interviewQuestionsSq, ...GENERAL_QUESTIONS_SQ])];
}

function interestTests(a: BusinessArchetype): string[] {
  const unit = a.pricing.unitLabelSq;
  const tests = [
    `Pilot me pagesë: ofroni «${unit}» e parë me çmim real, ose me një zbritje të qartë dhe të kufizuar në kohë, te 3–5 klientë. Pagesa është prova më e fortë.`,
    'Depozitë e rimbursueshme, vetëm aty ku lejohet ligjërisht: klienti rezervon me një shumë të vogël që i kthehet plotësisht nëse shërbimi nuk ofrohet. Verifikoni rregullat e mbrojtjes së konsumatorit para se të merrni para paraprakisht.',
  ];
  if (a.customerSegments.includes('b2b') || a.customerSegments.includes('b2g')) {
    tests.push(
      'Letër qëllimi (për klientë biznese ose institucione): një email ose dokument i shkurtër ku klienti shkruan çfarë do të blinte, sa dhe kur, nëse oferta plotëson kushtet. Nuk është kontratë, por vlen më shumë se një “po” verbale.',
    );
  }
  tests.push(
    'Listë pritjeje me çmimin të shfaqur qartë: një faqe ose formular i thjeshtë me ofertën dhe çmimin; numëroni sa persona lënë kontaktin pasi e shohin çmimin, me pëlqimin e tyre për t’u kontaktuar.',
    `Testi më i lirë për këtë ide: ${a.cheapestTestSq}`,
  );
  return tests;
}

function trialOffer(a: BusinessArchetype): string {
  return `${a.firstCustomers.offerSq} Shkruani kushtet e provës: çfarë përfshihet, sa zgjat, sa kushton pas provës dhe si anulohet — pa presion dhe pa premtuar rezultate që nuk i kontrolloni.`;
}

function generalCriteria(): DecisionCriterion[] {
  return [
    {
      metricSq: 'Intervista ku problemi përshkruhet pa e sugjeruar ju',
      thresholdSq: '≥ 10 nga 15 të intervistuar (supozim i qartë, jo standard)',
      meaningSq: 'Problemi është i zakonshëm dhe i ndjerë. Nëse janë më pak se 5 nga 15, rishikoni segmentin ose vetë problemin.',
    },
    {
      metricSq: 'Pilotë me pagesë nga ofertat konkrete',
      thresholdSq: '≥ 3 pilotë me pagesë nga 20 oferta (supozim)',
      meaningSq: 'Ka gatishmëri reale për të paguar. 0–1 nga 20 është sinjal i fortë për të ndaluar ose për të ndryshuar ofertën.',
    },
    {
      metricSq: 'Klientë që blejnë sërish ose vazhdojnë pas provës',
      thresholdSq: '≥ 50% e klientëve të provës (supozim)',
      meaningSq: 'Vlera mbetet edhe pas entuziazmit ose zbritjes fillestare; nën këtë prag, kuptoni pse largohen para se të zgjeroheni.',
    },
    {
      metricSq: 'Kontributi për njësi me çmimin e paguar realisht',
      thresholdSq: 'Më i madh se 0 (kusht minimal), dhe pika e barazimit e arritshme me orët që keni',
      meaningSq: 'Futni çmimin real në kalkulator: nëse çdo shitje nuk mbulon koston variabël, më shumë shitje e thellojnë humbjen.',
    },
  ];
}

function archetypeCriteria(a: BusinessArchetype): DecisionCriterion[] {
  const go = a.goCriteriaSq.map((thresholdSq, i) => ({
    metricSq: `Kriteri i vazhdimit ${i + 1} (nga biblioteka e idesë)`,
    thresholdSq: `${thresholdSq} (supozim)`,
    meaningSq: 'Nëse arrihet, kaloni në fazën tjetër të planit.',
  }));
  const kill = a.killCriteriaSq.map((thresholdSq, i) => ({
    metricSq: `Kriteri i ndalimit ${i + 1} (nga biblioteka e idesë)`,
    thresholdSq: `${thresholdSq} (supozim)`,
    meaningSq: 'Nëse ndodh, ndaloni ose ndryshoni ofertën para se të shpenzoni më shumë.',
  }));
  return [...go, ...kill];
}

function verbalVsBehaviour(rec: IdeaRecommendation | null | undefined): string {
  if (!rec) return VERBAL_VS_BEHAVIOUR_SQ;
  const demo = rec.isDemoData ? ' [DEMO] Të dhënat makro të këtij vendi janë fiktive, prandaj vetëm provat nga klientët realë kanë vlerë.' : '';
  return `${VERBAL_VS_BEHAVIOUR_SQ} Aktualisht cilësia e provave për këtë ide është ${EVIDENCE_LEVEL_SQ[rec.evidence.level]}.${demo}`;
}

function doNotList(a: BusinessArchetype): string[] {
  const list = [
    'Mos dërgoni mesazhe masive (spam) dhe mos përdorni lista kontaktesh të blera ose të mbledhura pa pëlqim.',
    'Mos krijoni dëshmi, vlerësime ose klientë të rremë, dhe mos u paraqitni si dikush tjetër për të marrë informacion nga konkurrentët.',
    'Mos bëni pretendime mashtruese: mos premtoni rezultate që nuk i kontrolloni dhe mos thoni të pavërteta për çmimin, cilësinë, licencat ose përvojën tuaj.',
    'Mos shpenzoni shuma të mëdha për reklama para se oferta të jetë validuar me klientë që paguajnë.',
    'Respektoni pëlqimin për të dhënat personale: ruani vetëm kontaktet që ju janë dhënë vullnetarisht, tregoni pse i ruani dhe fshijini me kërkesë.',
    'Mos merrni para paraprakisht nëse nuk jeni të sigurt që mund ta ofroni shërbimin dhe pa një mënyrë të qartë rimbursimi.',
  ];
  if (a.regulated) {
    const pros = a.licensedProfessionalsSq.length > 0 ? ` (${a.licensedProfessionalsSq.join(', ')})` : '';
    list.push(`Mos e ofroni pjesën e rregulluar të shërbimit pa licencën ose pa profesionistin e licencuar përkatës${pros}.`);
  }
  return list;
}

/** Validation kit for one idea; `rec` (optional) adds the current evidence level and demo flag. */
export function buildValidationKit(a: BusinessArchetype, rec?: IdeaRecommendation | null): ValidationKit {
  return {
    interviewQuestionsSq: interviewQuestions(a),
    avoidQuestionsSq: [...AVOID_QUESTIONS_SQ],
    interestTestsSq: interestTests(a),
    trialOfferSq: trialOffer(a),
    decisionCriteriaSq: [...generalCriteria(), ...archetypeCriteria(a)],
    verbalVsBehaviourSq: verbalVsBehaviour(rec),
    firstCustomers: {
      ...a.firstCustomers,
      whereSq: [...a.firstCustomers.whereSq],
      howToContactSq: [...a.firstCustomers.howToContactSq],
      metricsSq: [...a.firstCustomers.metricsSq],
    },
    pitchTemplateSq: a.pitchTemplateSq,
    offerTemplateSq: a.offerTemplateSq,
    feedbackQuestionsSq: [...a.feedbackQuestionsSq],
    doNotSq: doNotList(a),
  };
}
