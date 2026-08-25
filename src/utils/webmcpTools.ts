// The three WebMCP tool descriptors and the registration guard.
//
// Kept apart from `webmcp.ts` so the answers stay pure and testable and this
// file holds only the wiring: schemas, annotations, feature detection.
//
// Every tool is read-only. Nothing here writes, sends, navigates, or mutates
// the page — `prepare_inquiry` composes a mailto: link and hands it back; the
// visitor's own mail client and the visitor's own click do the rest.

import {
  AI_MATURITIES,
  COMPANY_SIZES,
  LANGUAGES,
  OBJECTIVES,
  SERVICE_IDS,
  getServices,
  normalizeLanguage,
  prepareInquiry,
  recommendService,
  type AiMaturity,
  type CompanySize,
  type LanguageCode,
  type Objective,
  type ServiceId,
} from './webmcp.ts';

export interface ToolAnnotations {
  readOnlyHint?: boolean;
  openWorldHint?: boolean;
}

export interface ToolResult {
  content: { type: 'text'; text: string }[];
  structuredContent: unknown;
}

export interface WebMcpTool {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: ToolAnnotations;
  execute: (input: Record<string, unknown>) => Promise<ToolResult>;
}

interface ModelContextLike {
  registerTool?: (tool: WebMcpTool) => unknown;
}

// `unknown` rather than a typed host: the point of the feature detection is
// that `modelContext` is absent from `Document` in every browser that has not
// shipped WebMCP, so nothing here may assume it exists.
type ModelContextHost = { modelContext?: ModelContextLike } | undefined;

const READ_ONLY: ToolAnnotations = { readOnlyHint: true, openWorldHint: false };

const result = (text: string, structuredContent: unknown): ToolResult => ({
  content: [{ type: 'text', text }],
  structuredContent,
});

// The agent may pass anything; each value is checked against the same list the
// schema advertises, and anything else falls back rather than throwing.
const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

const pickOptional = <T extends string>(value: unknown, allowed: readonly T[]): T | undefined =>
  allowed.includes(value as T) ? (value as T) : undefined;

const languageProperty = {
  type: 'string',
  enum: [...LANGUAGES],
  description: 'Language of the answer. Defaults to the language of the page.',
} as const;

export const buildTools = (pageLanguage: LanguageCode = 'pl'): WebMcpTool[] => [
  {
    name: 'get_services',
    title: 'Services and prices',
    description:
      'List the services ^Kunke Consulting sells — AI training and AI advisory — with what each one includes, its starting price in PLN, and who it suits. Read-only.',
    inputSchema: {
      type: 'object',
      properties: { language: languageProperty },
      required: [],
      additionalProperties: false,
    },
    annotations: READ_ONLY,
    execute: async (input) => {
      const language = normalizeLanguage(input?.language, pageLanguage);
      const data = getServices(language);

      const text = [
        ...data.services.map((service) =>
          [
            `${service.name} (${service.id}) — ${service.tag}`,
            `Price: ${service.price}`,
            service.summary,
            `Includes: ${service.includes.join('; ')}`,
            `Suitable for: ${service.suitableFor}`,
          ].join('\n')
        ),
        data.delivery,
        `Contact: ${data.contactEmail}`,
      ].join('\n\n');

      return result(text, data);
    },
  },
  {
    name: 'recommend_service',
    title: 'Recommend a service',
    description:
      'Given a company size, how far along it is with AI, and what it wants to achieve, name which of the three existing ^Kunke Consulting packages fits best, with a one-sentence reason and a second choice. Recommends only existing offers; read-only.',
    inputSchema: {
      type: 'object',
      properties: {
        company_size: {
          type: 'string',
          enum: [...COMPANY_SIZES],
          description: 'micro = 1-9 employees, small = 10-49, medium = 50-249, large = 250+.',
        },
        ai_maturity: {
          type: 'string',
          enum: [...AI_MATURITIES],
          description:
            'none = has not started, experimenting = individuals trying tools, piloting = one process under way, scaling = rolling out across teams.',
        },
        objective: {
          type: 'string',
          enum: [...OBJECTIVES],
          description: 'What the company wants out of this.',
        },
        language: languageProperty,
      },
      required: ['company_size', 'ai_maturity', 'objective'],
      additionalProperties: false,
    },
    annotations: READ_ONLY,
    execute: async (input) => {
      const language = normalizeLanguage(input?.language, pageLanguage);
      const data = recommendService({
        companySize: pick<CompanySize>(input?.company_size, COMPANY_SIZES, 'small'),
        aiMaturity: pick<AiMaturity>(input?.ai_maturity, AI_MATURITIES, 'none'),
        objective: pick<Objective>(input?.objective, OBJECTIVES, 'team_skills'),
        language,
      });

      const text = [
        `Recommended: ${data.recommended.name} (${data.recommended.id}) — ${data.recommended.price}`,
        data.reason,
        `Also worth considering: ${data.alternative.name} (${data.alternative.id}) — ${data.alternative.price}`,
        data.nextStep,
      ].join('\n');

      return result(text, data);
    },
  },
  {
    name: 'prepare_inquiry',
    title: 'Draft an enquiry email',
    description:
      'Compose the subject, body and mailto: link for an enquiry to ^Kunke Consulting about one of its packages. It only returns text — it never sends the message, opens the mail client, or stores anything. The visitor decides whether to use the link.',
    inputSchema: {
      type: 'object',
      properties: {
        service: {
          type: 'string',
          enum: [...SERVICE_IDS],
          description: 'Which package the enquiry is about.',
        },
        company_size: { type: 'string', enum: [...COMPANY_SIZES] },
        objective: { type: 'string', enum: [...OBJECTIVES] },
        team_size: {
          type: 'integer',
          minimum: 1,
          maximum: 500,
          description: 'How many people would take part. Optional.',
        },
        notes: {
          type: 'string',
          maxLength: 300,
          description:
            'One or two sentences of context from the visitor. Do not put personal data here.',
        },
        language: languageProperty,
      },
      required: ['service'],
      additionalProperties: false,
    },
    annotations: READ_ONLY,
    execute: async (input) => {
      const language = normalizeLanguage(input?.language, pageLanguage);
      const rawTeamSize = Number(input?.team_size);
      const data = prepareInquiry({
        service: pick<ServiceId>(input?.service, SERVICE_IDS, 'ai-training'),
        companySize: pickOptional<CompanySize>(input?.company_size, COMPANY_SIZES),
        objective: pickOptional<Objective>(input?.objective, OBJECTIVES),
        teamSize:
          Number.isFinite(rawTeamSize) && rawTeamSize >= 1 && rawTeamSize <= 500
            ? rawTeamSize
            : undefined,
        notes: typeof input?.notes === 'string' ? input.notes : undefined,
        language,
      });

      const text = [
        `To: ${data.recipient}`,
        `Subject: ${data.subject}`,
        '',
        data.body,
        '',
        `mailto link: ${data.mailtoUrl}`,
        data.note,
      ].join('\n');

      return result(text, data);
    },
  },
];

export const isSupported = (host: unknown): boolean =>
  typeof (host as ModelContextHost)?.modelContext?.registerTool === 'function';

// Registers the three tools if — and only if — the browser implements WebMCP.
// Returns the names actually registered, so a caller (and the tests) can tell
// the difference between "unsupported" and "registered". A browser without
// WebMCP takes the first `return []` and nothing else on the page changes.
export const registerWebMcpTools = (
  host: unknown,
  pageLanguage: LanguageCode = 'pl'
): string[] => {
  if (!isSupported(host)) return [];

  const modelContext = (host as { modelContext: ModelContextLike }).modelContext;
  const registerTool = modelContext.registerTool!.bind(modelContext);
  const registered: string[] = [];

  for (const tool of buildTools(pageLanguage)) {
    try {
      const pending = registerTool(tool);
      // registerTool returns a promise in the spec; a rejection must not
      // surface as an unhandled rejection on a marketing page.
      if (pending && typeof (pending as Promise<unknown>).catch === 'function') {
        (pending as Promise<unknown>).catch(() => {});
      }
      registered.push(tool.name);
    } catch {
      // One tool failing to register is not a reason to drop the others.
    }
  }

  return registered;
};
