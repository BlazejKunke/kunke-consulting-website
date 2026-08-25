// WebMCP (Site Tools) — the tools this site offers to an AI agent running in
// the visitor's browser.
//
// Three tools, all read-only: they describe the offer, recommend one of the
// three existing packages, and draft an enquiry email. Nothing here sends a
// message, writes to storage, calls the network, or touches the DOM, so the
// page looks and behaves exactly the same whether or not a browser supports
// WebMCP.
//
// The service copy and the prices below are the ones on the two homepages
// (`src/pages/index.astro` and `src/pages/en/index.astro`) verbatim. If a
// package name, its bullet list or its price changes there, change it here
// too — an agent quoting a stale price is worse than an agent quoting none.
//
// Answers are kept deliberately terse. Chrome's WebMCP security guidance sets
// a 1.5K character budget per tool output, and every field here is counted
// against it — see `tests/webmcp.test.ts`, which fails the build if a payload
// grows past it.
//
// API shape follows the WebMCP draft: `document.modelContext.registerTool()`,
// a JSON Schema `inputSchema`, and an `execute` callback. See
// https://webmachinelearning.github.io/webmcp/,
// https://developer.chrome.com/docs/ai/webmcp and
// https://developer.chrome.com/docs/ai/webmcp/secure-tools

export type LanguageCode = 'pl' | 'en';

export type ServiceId = 'ai-training' | 'ai-implementation' | 'ai-projects';

export type CompanySize = 'micro' | 'small' | 'medium' | 'large';

export type AiMaturity = 'none' | 'experimenting' | 'piloting' | 'scaling';

export type Objective =
  | 'team_skills'
  | 'find_use_cases'
  | 'automate_process'
  | 'compliance'
  | 'ongoing_support';

export const LANGUAGES: readonly LanguageCode[] = ['pl', 'en'];

export const SERVICE_IDS: readonly ServiceId[] = [
  'ai-training',
  'ai-implementation',
  'ai-projects',
];

export const COMPANY_SIZES: readonly CompanySize[] = ['micro', 'small', 'medium', 'large'];

export const AI_MATURITIES: readonly AiMaturity[] = [
  'none',
  'experimenting',
  'piloting',
  'scaling',
];

export const OBJECTIVES: readonly Objective[] = [
  'team_skills',
  'find_use_cases',
  'automate_process',
  'compliance',
  'ongoing_support',
];

export const CONTACT_EMAIL = 'info@kunkeconsulting.pl';

// Chrome's guidance: "1.5K character limit per individual tool output".
export const MAX_RESPONSE_CHARS = 1500;

// Free text is the single field that can push a response over the budget, so
// it is capped well inside it — the cap has to survive percent-encoding into
// the mailto: URL, which roughly triples non-ASCII text.
export const MAX_NOTES_CHARS = 160;

export interface Service {
  id: ServiceId;
  name: string;
  tag: string;
  price: string;
  summary: string;
  includes: string[];
  fits: string;
}

// Verbatim from the homepage `packages` arrays, plus a `fits` line drawn from
// the same pages' process steps and FAQ.
const SERVICES: Record<LanguageCode, Service[]> = {
  pl: [
    {
      id: 'ai-training',
      name: 'Szkolenie AI',
      tag: 'Pierwszy krok',
      price: 'od 6 000 zł + VAT',
      summary: 'Dwa dni warsztatów, po których zespół używa AI w swojej pracy.',
      includes: [
        'Praktyczne narzędzia AI',
        'Inżynieria promptu',
        'Obraz, dźwięk, wideo',
        'Etyka, prawo, środowisko',
        'Materiały PDF i certyfikat',
      ],
      fits: 'Zespoły zaczynające z AI. Dwa dni po pięć godzin, na waszych zadaniach. Dla początkujących.',
    },
    {
      id: 'ai-implementation',
      name: 'Wdrożenie AI',
      tag: 'Program na miarę',
      price: 'od 24 000 zł + VAT',
      summary: 'Od badania potrzeb do pilotażu w wybranych procesach.',
      includes: [
        'Badanie potrzeb zespołu',
        'Strategia i mapa zastosowań',
        'Pierwsi asystenci AI',
        'Konsultacja prawna (RODO, AI Act)',
        'Pilotaż i pomiar efektów',
      ],
      fits: 'Firmy szukające, gdzie AI da zwrot: pierwsi asystenci w jednym procesie, RODO i AI Act.',
    },
    {
      id: 'ai-projects',
      name: 'Projekty AI',
      tag: 'Stała współpraca',
      price: 'wycena indywidualna',
      summary: 'Dla firm, które chcą rozwijać AI dłużej niż jeden kwartał.',
      includes: [
        'Asystenci AI dla zespołów',
        'Cykliczne szkolenia',
        'Wsparcie inżynieryjne',
        'Wsparcie prawne',
        'Doradztwo bieżące',
      ],
      fits: 'Firmy po pierwszym wdrożeniu, skalujące AI na kolejne zespoły, ze stałym wsparciem.',
    },
  ],
  en: [
    {
      id: 'ai-training',
      name: 'AI training',
      tag: 'First step',
      price: 'from PLN 6,000 + VAT',
      summary: 'Two days of workshops, after which your team uses AI in their own work.',
      includes: [
        'Practical AI tools',
        'Prompt engineering',
        'Image, audio, video',
        'Ethics, law, environment',
        'PDF materials and a certificate',
      ],
      fits: 'Teams starting with AI. Two days of five hours on your own tasks. Suits beginners.',
    },
    {
      id: 'ai-implementation',
      name: 'AI implementation',
      tag: 'Tailored program',
      price: 'from PLN 24,000 + VAT',
      summary: 'From a needs assessment to a pilot in selected processes.',
      includes: [
        'Assessment of the team’s needs',
        'Strategy and a map of use cases',
        'The first AI assistants',
        'Legal review (GDPR, AI Act)',
        'Pilot and measurement of results',
      ],
      fits: 'Companies finding where AI pays back: first assistants in one process, GDPR and AI Act.',
    },
    {
      id: 'ai-projects',
      name: 'AI projects',
      tag: 'Ongoing partnership',
      price: 'individual quote',
      summary: 'For companies that want to keep developing AI for longer than a single quarter.',
      includes: [
        'AI assistants for teams',
        'Recurring training',
        'Engineering support',
        'Legal support',
        'Day-to-day advisory',
      ],
      fits: 'Companies past a first rollout, scaling AI to more teams, with continuing support.',
    },
  ],
};

const HOMEPAGE: Record<LanguageCode, string> = {
  pl: 'https://kunkeconsulting.pl/',
  en: 'https://kunkeconsulting.pl/en/',
};

const DELIVERY: Record<LanguageCode, string> = {
  pl: 'Poznań i cała Polska, stacjonarnie i zdalnie. Po polsku i po angielsku. Kontakt tylko mailowy.',
  en: 'Poznań and all of Poland, in person or remote. Polish and English. Contact by email only.',
};

export const normalizeLanguage = (value: unknown, fallback: LanguageCode = 'pl'): LanguageCode =>
  value === 'pl' || value === 'en' ? value : fallback;

export interface ServicesResult {
  lang: LanguageCode;
  currency: 'PLN';
  url: string;
  email: string;
  delivery: string;
  services: Service[];
}

export const getServices = (language: LanguageCode = 'pl'): ServicesResult => ({
  lang: language,
  currency: 'PLN',
  url: HOMEPAGE[language],
  email: CONTACT_EMAIL,
  delivery: DELIVERY[language],
  services: SERVICES[language].map((service) => ({ ...service, includes: [...service.includes] })),
});

export const getService = (id: ServiceId, language: LanguageCode = 'pl'): Service => {
  const service = SERVICES[language].find((candidate) => candidate.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
};

export interface RecommendationInput {
  companySize: CompanySize;
  aiMaturity: AiMaturity;
  objective: Objective;
  language?: LanguageCode;
}

export interface Recommendation {
  lang: LanguageCode;
  recommended: Service;
  alternative: { id: ServiceId; name: string; price: string };
  why: string;
  nextStep: string;
}

// Which of the three existing packages fits. Deliberately a short, readable
// ladder rather than a score: the answer has to be explainable to the visitor
// in one sentence, and there are only three possible outcomes.
export const chooseService = (input: {
  companySize: CompanySize;
  aiMaturity: AiMaturity;
  objective: Objective;
}): ServiceId => {
  const { companySize, aiMaturity, objective } = input;

  // Anything that runs past a single quarter is the ongoing package — it is
  // the only one written for that, whatever the immediate objective is.
  if (objective === 'ongoing_support' || aiMaturity === 'scaling') return 'ai-projects';

  if (objective === 'team_skills') return 'ai-training';

  // A company that has not started yet gets the workshop first: the site's own
  // sequence is diagnosis, then skills, then a pilot, and the smallest firms
  // rarely need a full implementation programme to begin with.
  if (aiMaturity === 'none' && (companySize === 'micro' || objective === 'find_use_cases')) {
    return 'ai-training';
  }

  return 'ai-implementation';
};

const WHY: Record<LanguageCode, Record<ServiceId, string>> = {
  pl: {
    'ai-training':
      'Zespół najpierw potrzebuje umiejętności do użycia następnego dnia. Dwa dni warsztatów to najtańszy pierwszy krok.',
    'ai-implementation':
      'Cel jest procesowy, nie szkoleniowy: badanie potrzeb, mapa zastosowań, pilotaż z pomiarem efektów i konsultacją prawną.',
    'ai-projects':
      'AI już u was działa, więc wartość jest w stałym wsparciu: kolejni asystenci, cykliczne szkolenia, pomoc inżynieryjna i prawna.',
  },
  en: {
    'ai-training':
      'The team needs a skill it can use the next day first. Two days of workshops is the cheapest first step.',
    'ai-implementation':
      'The objective is about a process, not training: needs assessment, a map of use cases, a measured pilot and a legal review.',
    'ai-projects':
      'AI already runs with you, so the value is continuing support: more assistants, recurring training, engineering and legal help.',
  },
};

const NEXT_STEP: Record<LanguageCode, string> = {
  pl: `Napisz na ${CONTACT_EMAIL}. Użyj prepare_inquiry, żeby przygotować wiadomość.`,
  en: `Email ${CONTACT_EMAIL}. Use prepare_inquiry to draft the message.`,
};

// The second-best fit, so the visitor sees a choice rather than a verdict.
const ALTERNATIVE: Record<ServiceId, ServiceId> = {
  'ai-training': 'ai-implementation',
  'ai-implementation': 'ai-training',
  'ai-projects': 'ai-implementation',
};

export const recommendService = (input: RecommendationInput): Recommendation => {
  const language = normalizeLanguage(input.language);
  const id = chooseService(input);
  const alternative = getService(ALTERNATIVE[id], language);

  return {
    lang: language,
    recommended: getService(id, language),
    alternative: { id: alternative.id, name: alternative.name, price: alternative.price },
    why: WHY[language][id],
    nextStep: NEXT_STEP[language],
  };
};

export interface InquiryInput {
  service: ServiceId;
  language?: LanguageCode;
  companySize?: CompanySize;
  objective?: Objective;
  teamSize?: number;
  notes?: string;
}

export interface Inquiry {
  lang: LanguageCode;
  to: string;
  subject: string;
  body: string;
  mailto: string;
  sent: false;
  note: string;
}

const COMPANY_SIZE_LABELS: Record<LanguageCode, Record<CompanySize, string>> = {
  pl: { micro: '1–9 osób', small: '10–49 osób', medium: '50–249 osób', large: '250+ osób' },
  en: { micro: '1–9 people', small: '10–49 people', medium: '50–249 people', large: '250+ people' },
};

const OBJECTIVE_LABELS: Record<LanguageCode, Record<Objective, string>> = {
  pl: {
    team_skills: 'kompetencje zespołu',
    find_use_cases: 'znalezienie zastosowań AI',
    automate_process: 'automatyzacja procesu',
    compliance: 'zgodność z RODO i AI Act',
    ongoing_support: 'stała współpraca',
  },
  en: {
    team_skills: 'the team’s skills',
    find_use_cases: 'finding where AI fits',
    automate_process: 'automating a process',
    compliance: 'GDPR and AI Act compliance',
    ongoing_support: 'an ongoing partnership',
  },
};

const INQUIRY_COPY: Record<
  LanguageCode,
  {
    subject: (name: string) => string;
    greeting: string;
    intro: (name: string, price: string) => string;
    sizeLine: string;
    teamLine: string;
    objectiveLine: string;
    notesLine: string;
    closing: string;
    note: string;
  }
> = {
  pl: {
    subject: (name) => `Zapytanie: ${name}`,
    greeting: 'Dzień dobry,',
    intro: (name, price) => `piszę w sprawie pakietu „${name}” (${price}).`,
    sizeLine: 'Firma',
    teamLine: 'Uczestnicy',
    objectiveLine: 'Cel',
    notesLine: 'Uwagi',
    closing: 'Proszę o kontakt i propozycję terminu.',
    note: 'Nic nie wysłano ani nie zapisano. Link otwiera wersję roboczą u użytkownika.',
  },
  en: {
    subject: (name) => `Enquiry: ${name}`,
    greeting: 'Hello,',
    intro: (name, price) => `I am writing about the “${name}” package (${price}).`,
    sizeLine: 'Company',
    teamLine: 'Participants',
    objectiveLine: 'Objective',
    notesLine: 'Notes',
    closing: 'Please get in touch with a suggested date.',
    note: 'Nothing was sent or stored. The link opens a draft in the visitor’s own client.',
  },
};

// Free text goes into a mail header-adjacent context, so newlines are folded
// and the length is capped before it reaches the URL.
export const cleanNotes = (notes: string): string =>
  notes.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_NOTES_CHARS);

export const prepareInquiry = (input: InquiryInput): Inquiry => {
  const language = normalizeLanguage(input.language);
  const service = getService(input.service, language);
  const copy = INQUIRY_COPY[language];

  const build = (notes: string): Inquiry => {
    const lines: string[] = [copy.greeting, '', copy.intro(service.name, service.price), ''];

    if (input.companySize) {
      lines.push(`${copy.sizeLine}: ${COMPANY_SIZE_LABELS[language][input.companySize]}`);
    }
    if (typeof input.teamSize === 'number' && Number.isFinite(input.teamSize)) {
      lines.push(`${copy.teamLine}: ${Math.round(input.teamSize)}`);
    }
    if (input.objective) {
      lines.push(`${copy.objectiveLine}: ${OBJECTIVE_LABELS[language][input.objective]}`);
    }
    if (notes) lines.push(`${copy.notesLine}: ${notes}`);

    lines.push('', copy.closing);

    const subject = copy.subject(service.name);
    // Collapse the gap that appears when every optional field was left out.
    const body = lines.filter((line, i) => line !== '' || lines[i - 1] !== '').join('\n');

    return {
      lang: language,
      to: CONTACT_EMAIL,
      subject,
      body,
      mailto: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      sent: false,
      note: copy.note,
    };
  };

  // The character cap has to hold for the payload that actually goes over the
  // wire, not for the note in isolation: percent-encoding into the mailto: URL
  // costs six characters per Polish letter, so a note inside its own limit can
  // still push the response past the budget. Shrink the note until the whole
  // response fits. Free text is the only field it is safe to lose.
  let notes = input.notes ? cleanNotes(input.notes) : '';
  let result = build(notes);

  while (notes.length > 0 && JSON.stringify(result).length > MAX_RESPONSE_CHARS) {
    notes = notes.slice(0, Math.max(0, notes.length - 16)).trimEnd();
    result = build(notes);
  }

  return result;
};
