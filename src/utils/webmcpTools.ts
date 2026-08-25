// The three WebMCP tool descriptors and the registration guard.
//
// Kept apart from `webmcp.ts` so the answers stay pure and testable and this
// file holds only the wiring: schemas, validation, annotations, feature
// detection.
//
// Every tool is read-only. Nothing here writes, sends, navigates, or mutates
// the page — `prepare_inquiry` composes a mailto: link and hands it back; the
// visitor's own mail client and the visitor's own click do the rest.
//
// Two rules from Chrome's WebMCP security guidance shape what follows:
// a 1.5K character budget per tool output, and `untrustedContentHint` on any
// tool whose output carries user-supplied text.
// https://developer.chrome.com/docs/ai/webmcp/secure-tools

import {
  AI_MATURITIES,
  COMPANY_SIZES,
  LANGUAGES,
  MAX_NOTES_CHARS,
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

// The WebMCP ToolAnnotations dictionary defines exactly two members. MCP's
// wider set (openWorldHint, idempotentHint and friends) is not part of this
// spec, so nothing else belongs here.
export interface ToolAnnotations {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
}

export interface ToolError {
  error: 'invalid_input';
  field: string;
  allowed: readonly string[];
  message: string;
}

export interface WebMcpTool {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: ToolAnnotations;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

interface ModelContextLike {
  registerTool?: (tool: WebMcpTool) => unknown;
}

// `unknown` rather than a typed host: the point of the feature detection is
// that `modelContext` is absent from `Document` in every browser that has not
// shipped WebMCP, so nothing here may assume it exists.
type ModelContextHost = { modelContext?: ModelContextLike } | undefined;

// A required enum argument that is missing or unrecognised is an error, not a
// cue to guess. Guessing produced a plausible-looking recommendation for input
// the visitor never gave, which is the one failure mode that turns a helpful
// tool into a misleading one.
const require = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string
): T | ToolError =>
  allowed.includes(value as T)
    ? (value as T)
    : {
        error: 'invalid_input',
        field,
        allowed,
        message: `${field} must be one of: ${allowed.join(', ')}.`,
      };

const isError = (value: unknown): value is ToolError =>
  typeof value === 'object' && value !== null && 'error' in value;

// Optional arguments stay lenient: an unrecognised value is simply left out of
// the answer, which cannot mislead anyone.
const optional = <T extends string>(value: unknown, allowed: readonly T[]): T | undefined =>
  allowed.includes(value as T) ? (value as T) : undefined;

const languageProperty = {
  type: 'string',
  enum: [...LANGUAGES],
  description: 'Answer language. Optional; defaults to the language of the page.',
} as const;

// The spec asks for titles in the user's language, since they are what a
// browser shows in its own UI. Descriptions stay in English: they are read by
// the model, not displayed.
const TITLES: Record<LanguageCode, [string, string, string]> = {
  pl: ['Usługi i ceny', 'Dobierz usługę', 'Przygotuj zapytanie'],
  en: ['Services and prices', 'Recommend a service', 'Draft an enquiry'],
};

export const buildTools = (pageLanguage: LanguageCode = 'pl'): WebMcpTool[] => {
  const titles = TITLES[pageLanguage];

  return [
    {
      name: 'get_services',
      title: titles[0],
      description:
        'List the services ^Kunke Consulting sells — AI training and AI advisory — with what each includes, its starting price in PLN, and who it suits. Read-only.',
      inputSchema: {
        type: 'object',
        properties: { language: languageProperty },
        required: [],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (input) => getServices(normalizeLanguage(input?.language, pageLanguage)),
    },
    {
      name: 'recommend_service',
      title: titles[1],
      description:
        'Given a company size, how far along it is with AI, and what it wants to achieve, name which of the three existing ^Kunke Consulting packages fits best, with a one-sentence reason and a second choice. All three arguments are required; an unrecognised value returns an error rather than a guess. Read-only.',
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
      annotations: { readOnlyHint: true },
      execute: async (input) => {
        const companySize = require<CompanySize>(input?.company_size, COMPANY_SIZES, 'company_size');
        if (isError(companySize)) return companySize;

        const aiMaturity = require<AiMaturity>(input?.ai_maturity, AI_MATURITIES, 'ai_maturity');
        if (isError(aiMaturity)) return aiMaturity;

        const objective = require<Objective>(input?.objective, OBJECTIVES, 'objective');
        if (isError(objective)) return objective;

        return recommendService({
          companySize,
          aiMaturity,
          objective,
          language: normalizeLanguage(input?.language, pageLanguage),
        });
      },
    },
    {
      name: 'prepare_inquiry',
      title: titles[2],
      description:
        'Compose the subject, body and mailto: link for an enquiry to ^Kunke Consulting about one of its packages. It only returns text — it never sends the message, opens the mail client, or stores anything. The visitor decides whether to use the link. `service` is required.',
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
            maxLength: MAX_NOTES_CHARS,
            description: `One sentence of context from the visitor, ${MAX_NOTES_CHARS} characters at most. Do not put personal data here.`,
          },
          language: languageProperty,
        },
        required: ['service'],
        additionalProperties: false,
      },
      // The body echoes the visitor's own `notes` back, so the payload carries
      // text this site did not author.
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async (input) => {
        const service = require<ServiceId>(input?.service, SERVICE_IDS, 'service');
        if (isError(service)) return service;

        const teamSize = Number(input?.team_size);

        return prepareInquiry({
          service,
          companySize: optional<CompanySize>(input?.company_size, COMPANY_SIZES),
          objective: optional<Objective>(input?.objective, OBJECTIVES),
          teamSize:
            Number.isFinite(teamSize) && teamSize >= 1 && teamSize <= 500 ? teamSize : undefined,
          notes: typeof input?.notes === 'string' ? input.notes : undefined,
          language: normalizeLanguage(input?.language, pageLanguage),
        });
      },
    },
  ];
};

export const isSupported = (host: unknown): boolean =>
  typeof (host as ModelContextHost)?.modelContext?.registerTool === 'function';

export interface RegisterOptions {
  // Called when a tool fails to register. Left unset in production; the page
  // passes a console warning in dev builds so a bad schema is visible instead
  // of silent.
  onError?: (toolName: string, cause: unknown) => void;
}

// Registers the three tools if — and only if — the browser implements WebMCP.
// Returns the names actually registered, so a caller (and the tests) can tell
// the difference between "unsupported" and "registered". A browser without
// WebMCP takes the first `return []` and nothing else on the page changes.
export const registerWebMcpTools = (
  host: unknown,
  pageLanguage: LanguageCode = 'pl',
  options: RegisterOptions = {}
): string[] => {
  if (!isSupported(host)) return [];

  const modelContext = (host as { modelContext: ModelContextLike }).modelContext;
  const registerTool = modelContext.registerTool!.bind(modelContext);
  const registered: string[] = [];

  for (const tool of buildTools(pageLanguage)) {
    try {
      const pending = registerTool(tool);
      // registerTool returns a promise in the spec. A rejection must not
      // surface as an unhandled rejection on a marketing page, but it should
      // still reach whoever asked to hear about it.
      if (pending && typeof (pending as Promise<unknown>).catch === 'function') {
        (pending as Promise<unknown>).catch((cause: unknown) => options.onError?.(tool.name, cause));
      }
      registered.push(tool.name);
    } catch (cause) {
      // One tool failing to register is not a reason to drop the others.
      options.onError?.(tool.name, cause);
    }
  }

  return registered;
};
