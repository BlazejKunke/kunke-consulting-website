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
// API shape follows the WebMCP draft: `document.modelContext.registerTool()`,
// a JSON Schema `inputSchema`, and an `execute` callback. See
// https://webmachinelearning.github.io/webmcp/ and
// https://developer.chrome.com/docs/ai/webmcp

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

export interface Service {
  id: ServiceId;
  tag: string;
  name: string;
  summary: string;
  includes: string[];
  price: string;
  suitableFor: string;
  url: string;
}

// Verbatim from the homepage `packages` arrays, plus a `suitableFor` line
// drawn from the same pages' process steps and FAQ.
const SERVICES: Record<LanguageCode, Service[]> = {
  pl: [
    {
      id: 'ai-training',
      tag: 'Pierwszy krok',
      name: 'Szkolenie AI',
      summary: 'Dwa dni warsztatów, po których zespół używa AI w swojej pracy.',
      includes: [
        'Praktyczne narzędzia AI',
        'Inżynieria promptu',
        'Obraz, dźwięk, wideo',
        'Etyka, prawo, środowisko',
        'Materiały PDF i certyfikat',
      ],
      price: 'od 6 000 zł + VAT',
      suitableFor:
        'Zespoły, które zaczynają z AI. Standardowo dwa dni po pięć godzin, na realnych zadaniach zespołu. Odpowiednie dla początkujących.',
      url: 'https://kunkeconsulting.pl/',
    },
    {
      id: 'ai-implementation',
      tag: 'Program na miarę',
      name: 'Wdrożenie AI',
      summary: 'Od badania potrzeb do pilotażu w wybranych procesach.',
      includes: [
        'Badanie potrzeb zespołu',
        'Strategia i mapa zastosowań',
        'Pierwsi asystenci AI',
        'Konsultacja prawna (RODO, AI Act)',
        'Pilotaż i pomiar efektów',
      ],
      price: 'od 24 000 zł + VAT',
      suitableFor:
        'Firmy, które chcą wiedzieć, gdzie AI da największy zwrot, i uruchomić pierwszych asystentów w jednym procesie — z pomiarem efektów i zgodnością z RODO oraz AI Act.',
      url: 'https://kunkeconsulting.pl/',
    },
    {
      id: 'ai-projects',
      tag: 'Stała współpraca',
      name: 'Projekty AI',
      summary: 'Dla firm, które chcą rozwijać AI dłużej niż jeden kwartał.',
      includes: [
        'Asystenci AI dla zespołów',
        'Cykliczne szkolenia',
        'Wsparcie inżynieryjne',
        'Wsparcie prawne',
        'Doradztwo bieżące',
      ],
      price: 'wycena indywidualna',
      suitableFor:
        'Firmy po pierwszym wdrożeniu, które skalują AI na kolejne zespoły i potrzebują stałego wsparcia inżynieryjnego, prawnego i szkoleniowego.',
      url: 'https://kunkeconsulting.pl/',
    },
  ],
  en: [
    {
      id: 'ai-training',
      tag: 'First step',
      name: 'AI training',
      summary: 'Two days of workshops, after which your team uses AI in their own work.',
      includes: [
        'Practical AI tools',
        'Prompt engineering',
        'Image, audio, video',
        'Ethics, law, environment',
        'PDF materials and a certificate',
      ],
      price: 'from PLN 6,000 + VAT',
      suitableFor:
        'Teams starting with AI. Two days of five hours each as standard, built on the team’s real tasks. Suitable for beginners.',
      url: 'https://kunkeconsulting.pl/en/',
    },
    {
      id: 'ai-implementation',
      tag: 'Tailored program',
      name: 'AI implementation',
      summary: 'From a needs assessment to a pilot in selected processes.',
      includes: [
        'Assessment of the team’s needs',
        'Strategy and a map of use cases',
        'The first AI assistants',
        'Legal review (GDPR, AI Act)',
        'Pilot and measurement of results',
      ],
      price: 'from PLN 24,000 + VAT',
      suitableFor:
        'Companies that want to know where AI gives the biggest return and to put the first assistants into one process — with measured results and GDPR and AI Act compliance.',
      url: 'https://kunkeconsulting.pl/en/',
    },
    {
      id: 'ai-projects',
      tag: 'Ongoing partnership',
      name: 'AI projects',
      summary: 'For companies that want to keep developing AI for longer than a single quarter.',
      includes: [
        'AI assistants for teams',
        'Recurring training',
        'Engineering support',
        'Legal support',
        'Day-to-day advisory',
      ],
      price: 'individual quote',
      suitableFor:
        'Companies past a first implementation that are scaling AI to further teams and need continuing engineering, legal and training support.',
      url: 'https://kunkeconsulting.pl/en/',
    },
  ],
};

const DELIVERY_NOTE: Record<LanguageCode, string> = {
  pl: 'Poznań i cała Polska, stacjonarnie i zdalnie. Prowadzimy po polsku i po angielsku. Kontakt wyłącznie mailowy — na stronie nie ma formularza.',
  en: 'Poznań and all of Poland, in person and remote. Delivered in Polish and in English. Contact is by email only — the site has no contact form.',
};

export const normalizeLanguage = (value: unknown, fallback: LanguageCode = 'pl'): LanguageCode =>
  value === 'pl' || value === 'en' ? value : fallback;

export interface ServicesResult {
  language: LanguageCode;
  currency: 'PLN';
  services: Service[];
  delivery: string;
  contactEmail: string;
}

export const getServices = (language: LanguageCode = 'pl'): ServicesResult => ({
  language,
  currency: 'PLN',
  services: SERVICES[language].map((service) => ({ ...service, includes: [...service.includes] })),
  delivery: DELIVERY_NOTE[language],
  contactEmail: CONTACT_EMAIL,
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
  language: LanguageCode;
  recommended: Service;
  alternative: Service;
  reason: string;
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

const REASONS: Record<LanguageCode, Record<ServiceId, string>> = {
  pl: {
    'ai-training':
      'Zespół najpierw potrzebuje umiejętności, których można użyć następnego dnia — dwa dni warsztatów na waszych realnych zadaniach są najtańszym pierwszym krokiem.',
    'ai-implementation':
      'Cel jest procesowy, nie szkoleniowy: zaczynamy od badania potrzeb i mapy zastosowań, a kończymy pilotażem z pomiarem efektów i konsultacją prawną.',
    'ai-projects':
      'AI jest już u was uruchomione, więc wartość jest w stałym wsparciu — kolejni asystenci, cykliczne szkolenia oraz wsparcie inżynieryjne i prawne.',
  },
  en: {
    'ai-training':
      'The team needs a skill it can use the next day first — two days of workshops on your own real tasks is the cheapest first step.',
    'ai-implementation':
      'The objective is about a process, not about training: this starts with a needs assessment and a map of use cases, and ends with a measured pilot plus a legal review.',
    'ai-projects':
      'AI is already running with you, so the value is in continuing support — further assistants, recurring training, and engineering and legal help.',
  },
};

const NEXT_STEP: Record<LanguageCode, string> = {
  pl: `Napisz na ${CONTACT_EMAIL} — użyj narzędzia prepare_inquiry, żeby przygotować treść wiadomości.`,
  en: `Email ${CONTACT_EMAIL} — use the prepare_inquiry tool to draft the message.`,
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

  return {
    language,
    recommended: getService(id, language),
    alternative: getService(ALTERNATIVE[id], language),
    reason: REASONS[language][id],
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
  language: LanguageCode;
  recipient: string;
  subject: string;
  body: string;
  mailtoUrl: string;
  sent: false;
  note: string;
}

const COMPANY_SIZE_LABELS: Record<LanguageCode, Record<CompanySize, string>> = {
  pl: {
    micro: '1–9 osób',
    small: '10–49 osób',
    medium: '50–249 osób',
    large: '250+ osób',
  },
  en: {
    micro: '1–9 people',
    small: '10–49 people',
    medium: '50–249 people',
    large: '250+ people',
  },
};

const OBJECTIVE_LABELS: Record<LanguageCode, Record<Objective, string>> = {
  pl: {
    team_skills: 'podniesienie kompetencji zespołu',
    find_use_cases: 'znalezienie zastosowań AI w firmie',
    automate_process: 'automatyzacja konkretnego procesu',
    compliance: 'zgodność z RODO i AI Act',
    ongoing_support: 'stała współpraca przy rozwoju AI',
  },
  en: {
    team_skills: 'raising the team’s skills',
    find_use_cases: 'finding where AI fits in the company',
    automate_process: 'automating a specific process',
    compliance: 'GDPR and AI Act compliance',
    ongoing_support: 'an ongoing partnership on AI',
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
    intro: (name, price) =>
      `piszę w sprawie pakietu „${name}” (${price}) ze strony kunkeconsulting.pl.`,
    sizeLine: 'Wielkość firmy',
    teamLine: 'Liczba uczestników',
    objectiveLine: 'Cel',
    notesLine: 'Dodatkowe informacje',
    closing: 'Proszę o kontakt i propozycję terminu.',
    note: 'Wiadomość nie została wysłana ani zapisana. Link mailto otwiera roboczą wersję w kliencie pocztowym użytkownika — wysyłka należy do niego.',
  },
  en: {
    subject: (name) => `Enquiry: ${name}`,
    greeting: 'Hello,',
    intro: (name, price) =>
      `I am writing about the “${name}” package (${price}) from kunkeconsulting.pl.`,
    sizeLine: 'Company size',
    teamLine: 'Number of participants',
    objectiveLine: 'Objective',
    notesLine: 'Additional detail',
    closing: 'Please get in touch with a suggested date.',
    note: 'Nothing was sent or stored. The mailto link opens a draft in the visitor’s own mail client — sending it is their action.',
  },
};

// Free text goes into a mail header-adjacent context, so newlines are folded
// and the length is capped before it reaches the URL.
const cleanNotes = (notes: string): string =>
  notes.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);

export const prepareInquiry = (input: InquiryInput): Inquiry => {
  const language = normalizeLanguage(input.language);
  const service = getService(input.service, language);
  const copy = INQUIRY_COPY[language];

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

  const notes = input.notes ? cleanNotes(input.notes) : '';
  if (notes) lines.push(`${copy.notesLine}: ${notes}`);

  lines.push('', copy.closing);

  const subject = copy.subject(service.name);
  // Collapse the gap that appears when every optional field was left out.
  const body = lines.filter((line, i) => line !== '' || lines[i - 1] !== '').join('\n');

  return {
    language,
    recipient: CONTACT_EMAIL,
    subject,
    body,
    mailtoUrl: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    sent: false,
    note: copy.note,
  };
};
