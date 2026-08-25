import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONTACT_EMAIL,
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
          assert.notEqual(out.recommended.id, out.alternative.id);
          assert.ok(out.reason.length > 0);
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
  assert.equal(inquiry.recipient, CONTACT_EMAIL);
  assert.equal(inquiry.subject, 'Zapytanie: Szkolenie AI');
  assert.match(inquiry.body, /od 6 000 zł \+ VAT/);
  assert.match(inquiry.body, /Liczba uczestników: 12/);
  assert.ok(inquiry.mailtoUrl.startsWith(`mailto:${CONTACT_EMAIL}?subject=`));
  assert.match(inquiry.mailtoUrl, /&body=/);
  const parsed = new URL(inquiry.mailtoUrl);
  assert.equal(parsed.searchParams.get('subject'), inquiry.subject);
  assert.equal(parsed.searchParams.get('body'), inquiry.body);
});

test('notes are folded onto one line and capped', () => {
  const inquiry = prepareInquiry({
    service: 'ai-implementation',
    language: 'en',
    notes: `line one\r\nBcc: someone@example.com\n${'x'.repeat(400)}`,
  });

  const notesLine = inquiry.body.split('\n').find((line) => line.startsWith('Additional detail:'));
  assert.ok(notesLine);
  assert.ok(notesLine.length <= 'Additional detail: '.length + 300);
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

test('tool handlers answer with text and structured data', async () => {
  const [services, recommend, inquiry] = buildTools('en');

  const listed = await services.execute({});
  assert.equal(listed.content[0].type, 'text');
  assert.match(listed.content[0].text, /from PLN 6,000 \+ VAT/);

  const advised = await recommend.execute({
    company_size: 'medium',
    ai_maturity: 'piloting',
    objective: 'automate_process',
  });
  assert.match(advised.content[0].text, /AI implementation/);

  const drafted = await inquiry.execute({ service: 'ai-projects', team_size: 9999 });
  assert.match(drafted.content[0].text, /mailto link: mailto:info@kunkeconsulting\.pl\?/);
  assert.doesNotMatch(drafted.content[0].text, /\n\n\n/);
  // Out-of-range numbers are dropped, not clamped into the message.
  assert.doesNotMatch(drafted.content[0].text, /9999/);
});

test('junk arguments fall back instead of throwing', async () => {
  const [, recommend] = buildTools('pl');
  const out = await recommend.execute({
    company_size: 'enormous',
    ai_maturity: null,
    objective: { nested: true },
    language: 'de',
  });
  assert.match(out.content[0].text, /Szkolenie AI|Wdrożenie AI|Projekty AI/);
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

  assert.deepEqual(registerWebMcpTools(host, 'pl'), ['get_services', 'prepare_inquiry']);
});
