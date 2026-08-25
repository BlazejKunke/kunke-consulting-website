import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONTACT_EMAIL,
  MAX_NOTES_CHARS,
  MAX_RESPONSE_CHARS,
  chooseService,
  getServices,
  prepareInquiry,
  recommendService,
} from '../src/utils/webmcp.ts';
import { buildTools, isSupported, registerWebMcpTools } from '../src/utils/webmcpTools.ts';

test('the catalogue carries the homepage prices verbatim', () => {
  const pl = getServices('pl').services;
  const en = getServices('en').services;

  assert.deepEqual(
    pl.map((service) => service.price),
    ['od 6 000 zł + VAT', 'od 24 000 zł + VAT', 'wycena indywidualna']
  );
  assert.deepEqual(
    en.map((service) => service.price),
    ['from PLN 6,000 + VAT', 'from PLN 24,000 + VAT', 'individual quote']
  );
  assert.deepEqual(
    pl.map((service) => service.id),
    en.map((service) => service.id)
  );
});

test('only the two promoted offers are described', () => {
  const text = JSON.stringify(getServices('pl')) + JSON.stringify(getServices('en'));
  assert.match(text, /Szkolenie AI/);
  assert.match(text, /Wdrożenie AI/);
  // Excel work is deliberately not promoted anywhere on the site.
  assert.doesNotMatch(text, /Excel/i);
});

test('recommendations land on an existing package', () => {
  assert.equal(
    chooseService({ companySize: 'medium', aiMaturity: 'none', objective: 'team_skills' }),
    'ai-training'
  );
  assert.equal(
    chooseService({ companySize: 'micro', aiMaturity: 'none', objective: 'automate_process' }),
    'ai-training'
  );
  assert.equal(
    chooseService({ companySize: 'medium', aiMaturity: 'experimenting', objective: 'automate_process' }),
    'ai-implementation'
  );
  assert.equal(
    chooseService({ companySize: 'small', aiMaturity: 'piloting', objective: 'compliance' }),
    'ai-implementation'
  );
  assert.equal(
    chooseService({ companySize: 'large', aiMaturity: 'scaling', objective: 'team_skills' }),
    'ai-projects'
  );
  assert.equal(
    chooseService({ companySize: 'micro', aiMaturity: 'none', objective: 'ongoing_support' }),
    'ai-projects'
  );
});

test('every input combination returns a real offer and a distinct alternative', () => {
  const sizes = ['micro', 'small', 'medium', 'large'] as const;
  const maturities = ['none', 'experimenting', 'piloting', 'scaling'] as const;
  const objectives = [
    'team_skills',
    'find_use_cases',
    'automate_process',
    'compliance',
    'ongoing_support',
  ] as const;
  const ids = getServices('pl').services.map((service) => service.id);

  for (const companySize of sizes) {
    for (const aiMaturity of maturities) {
      for (const objective of objectives) {
        for (const language of ['pl', 'en'] as const) {
          const out = recommendService({ companySize, aiMaturity, objective, language });
          assert.ok(ids.includes(out.recommended.id));
          assert.ok(ids.includes(out.alternative.id));
          assert.ok(out.alternative.price.length > 0);
          assert.notEqual(out.recommended.id, out.alternative.id);
          assert.ok(out.why.length > 0);
          assert.equal(out.recommended.price, out.recommended.price.trim());
        }
      }
    }
  }
});

test('an enquiry is a draft: subject, body and mailto, nothing sent', () => {
  const inquiry = prepareInquiry({
    service: 'ai-training',
    language: 'pl',
    companySize: 'small',
    objective: 'team_skills',
    teamSize: 12,
  });

  assert.equal(inquiry.sent, false);
  assert.equal(inquiry.to, CONTACT_EMAIL);
  assert.equal(inquiry.subject, 'Zapytanie: Szkolenie AI');
  assert.match(inquiry.body, /od 6 000 zł \+ VAT/);
  assert.match(inquiry.body, /Uczestnicy: 12/);
  assert.ok(inquiry.mailto.startsWith(`mailto:${CONTACT_EMAIL}?subject=`));
  assert.match(inquiry.mailto, /&body=/);
  const parsed = new URL(inquiry.mailto);
  assert.equal(parsed.searchParams.get('subject'), inquiry.subject);
  assert.equal(parsed.searchParams.get('body'), inquiry.body);
});

test('notes are folded onto one line and capped', () => {
  const inquiry = prepareInquiry({
    service: 'ai-implementation',
    language: 'en',
    notes: `line one\r\nBcc: someone@example.com\n${'x'.repeat(400)}`,
  });

  const notesLine = inquiry.body.split('\n').find((line) => line.startsWith('Notes:'));
  assert.ok(notesLine);
  assert.ok(notesLine.length <= 'Notes: '.length + MAX_NOTES_CHARS);
  assert.doesNotMatch(inquiry.body, /\r/);
  assert.equal(inquiry.body.split('\n').filter((line) => line.includes('example.com')).length, 1);
});

test('the three tools are read-only and take closed schemas', () => {
  const tools = buildTools('pl');

  assert.deepEqual(
    tools.map((tool) => tool.name),
    ['get_services', 'recommend_service', 'prepare_inquiry']
  );

  for (const tool of tools) {
    assert.equal(tool.annotations.readOnlyHint, true);
    // WebMCP's ToolAnnotations dictionary defines readOnlyHint and
    // untrustedContentHint and nothing else. MCP's wider set does not apply.
    for (const key of Object.keys(tool.annotations)) {
      assert.ok(['readOnlyHint', 'untrustedContentHint'].includes(key), `${tool.name}: ${key}`);
    }
    assert.equal(tool.inputSchema.type, 'object');
    assert.equal(tool.inputSchema.additionalProperties, false);
    assert.ok(tool.description.length > 0);

    const properties = tool.inputSchema.properties as Record<string, { type: string; enum?: string[] }>;
    for (const [name, schema] of Object.entries(properties)) {
      assert.ok(schema.type, `${tool.name}.${name} declares a type`);
      // Narrow inputs: every string field is either an enum or length-capped.
      if (schema.type === 'string') {
        const capped = 'maxLength' in schema;
        assert.ok(schema.enum || capped, `${tool.name}.${name} is constrained`);
      }
    }
  }
});

test('tool handlers answer with one compact object', async () => {
  const [services, recommend, inquiry] = buildTools('en');

  const listed = JSON.stringify(await services.execute({}));
  assert.match(listed, /from PLN 6,000 \+ VAT/);
  // One payload, not the same facts twice.
  assert.doesNotMatch(listed, /structuredContent|"content":/);

  const advised = JSON.stringify(
    await recommend.execute({
      company_size: 'medium',
      ai_maturity: 'piloting',
      objective: 'automate_process',
    })
  );
  assert.match(advised, /AI implementation/);

  const drafted = JSON.stringify(await inquiry.execute({ service: 'ai-projects', team_size: 9999 }));
  assert.match(drafted, /mailto:info@kunkeconsulting\.pl\?/);
  // Out-of-range numbers are dropped, not clamped into the message.
  assert.doesNotMatch(drafted, /9999/);
});

test('a required argument that is missing or unknown is an error, not a guess', async () => {
  const [, recommend, inquiry] = buildTools('pl');

  const junk = await recommend.execute({
    company_size: 'enormous',
    ai_maturity: null,
    objective: { nested: true },
  });
  assert.equal((junk as { error: string }).error, 'invalid_input');
  assert.equal((junk as { field: string }).field, 'company_size');
  assert.doesNotMatch(JSON.stringify(junk), /Szkolenie AI|mailto:/);

  // Each required field is reported in turn rather than all at once.
  const second = await recommend.execute({ company_size: 'medium', objective: 'compliance' });
  assert.equal((second as { field: string }).field, 'ai_maturity');

  // The earlier bug: no service at all still produced a training enquiry.
  const noService = await inquiry.execute({ team_size: 10 });
  assert.equal((noService as { error: string }).error, 'invalid_input');
  assert.equal((noService as { field: string }).field, 'service');
  assert.doesNotMatch(JSON.stringify(noService), /mailto:/);
});

test('optional arguments stay lenient', async () => {
  const [services, recommend] = buildTools('pl');

  // An unusable language falls back to the page language instead of erroring.
  assert.equal(((await services.execute({ language: 'de' })) as { lang: string }).lang, 'pl');
  const out = await recommend.execute({
    company_size: 'medium',
    ai_maturity: 'piloting',
    objective: 'automate_process',
    language: 42,
  });
  assert.equal((out as { lang: string }).lang, 'pl');
});

test('every response stays inside the 1.5K character budget', async () => {
  for (const language of ['pl', 'en'] as const) {
    const [services, recommend, inquiry] = buildTools(language);

    const payloads: unknown[] = [await services.execute({})];

    for (const company_size of ['micro', 'small', 'medium', 'large']) {
      for (const ai_maturity of ['none', 'experimenting', 'piloting', 'scaling']) {
        for (const objective of [
          'team_skills',
          'find_use_cases',
          'automate_process',
          'compliance',
          'ongoing_support',
        ]) {
          payloads.push(await recommend.execute({ company_size, ai_maturity, objective }));
          payloads.push(
            await inquiry.execute({
              service: 'ai-implementation',
              company_size,
              objective,
              team_size: 500,
              // Worst case for the budget: each Polish letter costs six
              // characters once percent-encoded into the mailto: URL.
              notes: 'ą'.repeat(MAX_NOTES_CHARS * 3),
            })
          );
        }
      }
    }

    for (const payload of payloads) {
      const size = JSON.stringify(payload).length;
      assert.ok(size <= MAX_RESPONSE_CHARS, `${language}: ${size} chars exceeds the budget`);
    }
  }
});

test('prepare_inquiry marks its output as carrying visitor text', () => {
  const [services, recommend, inquiry] = buildTools('pl');
  assert.equal(inquiry.annotations.untrustedContentHint, true);
  // The other two return only copy this site wrote.
  assert.notEqual(services.annotations.untrustedContentHint, true);
  assert.notEqual(recommend.annotations.untrustedContentHint, true);
});

test('titles are localized, descriptions are not', () => {
  assert.deepEqual(
    buildTools('pl').map((tool) => tool.title),
    ['Usługi i ceny', 'Dobierz usługę', 'Przygotuj zapytanie']
  );
  assert.deepEqual(
    buildTools('en').map((tool) => tool.title),
    ['Services and prices', 'Recommend a service', 'Draft an enquiry']
  );
  assert.deepEqual(
    buildTools('pl').map((tool) => tool.description),
    buildTools('en').map((tool) => tool.description)
  );
});

test('a browser without WebMCP registers nothing', () => {
  assert.equal(isSupported(undefined), false);
  assert.equal(isSupported({}), false);
  assert.equal(isSupported({ modelContext: {} }), false);
  assert.deepEqual(registerWebMcpTools({}, 'pl'), []);
  assert.deepEqual(registerWebMcpTools(undefined, 'pl'), []);
});

test('a browser with WebMCP gets all three tools', () => {
  const calls: { name: string }[] = [];
  const host = {
    modelContext: {
      registerTool: (tool: { name: string }) => {
        calls.push(tool);
        return Promise.resolve();
      },
    },
  };

  assert.deepEqual(registerWebMcpTools(host, 'en'), [
    'get_services',
    'recommend_service',
    'prepare_inquiry',
  ]);
  assert.equal(calls.length, 3);
});

test('one failing registration does not take down the others', () => {
  const host = {
    modelContext: {
      registerTool: (tool: { name: string }) => {
        if (tool.name === 'recommend_service') throw new Error('nope');
        return Promise.reject(new Error('async nope'));
      },
    },
  };

  const seen: string[] = [];
  assert.deepEqual(registerWebMcpTools(host, 'pl', { onError: (name) => seen.push(name) }), [
    'get_services',
    'prepare_inquiry',
  ]);
  // The synchronous throw is reported rather than swallowed.
  assert.ok(seen.includes('recommend_service'));
});

test('an async registration rejection reaches onError', async () => {
  const seen: [string, string][] = [];
  const host = {
    modelContext: {
      registerTool: (tool: { name: string }) =>
        tool.name === 'get_services'
          ? Promise.reject(new Error('bad schema'))
          : Promise.resolve(),
    },
  };

  registerWebMcpTools(host, 'pl', {
    onError: (name, cause) => seen.push([name, (cause as Error).message]),
  });
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.deepEqual(seen, [['get_services', 'bad schema']]);
});
