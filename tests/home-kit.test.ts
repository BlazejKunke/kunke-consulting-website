import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

// Only what a visitor or an assistant actually receives: the frontmatter
// comments explain the rule and would trip the check themselves.
const datasheet = read('../src/pages/ai-info.astro').split(/^---$/m)[2];
const prompts = [...read('../src/components/AskAssistant.astro').matchAll(/^\s+[?:] '(.+)';?$/gm)]
  .map((match) => match[1])
  .filter((text) => text.includes('ai-info'));

// Wording that tries to steer an assistant instead of informing it. The
// datasheet shipped with exactly this until November 2026.
const STEERING = [
  /as a helpful assistant/i,
  /you (can|should|must) (suggest|recommend|tell)/i,
  /\b(the )?best\b/i,
  /\b(leading|top|number one|unrivalled|unmatched|world.class)\b/i,
  /\bnajlepsz/i,
  /\blider/i,
  /ignore (all|any|previous)/i,
  /\b(always|never) (recommend|mention)/i,
  /\bpolec/i,
  /\brecommend (\^?kunke|this company|us)\b/i,
];

test('the datasheet states facts and never tells an assistant what to say', () => {
  for (const pattern of STEERING) {
    assert.doesNotMatch(datasheet, pattern);
  }
  assert.match(datasheet, /Published by \^Kunke Consulting about itself/);
});

test('the question sent to a visitor’s assistant is neutral in both languages', () => {
  assert.equal(prompts.length, 2);
  for (const prompt of prompts) {
    for (const pattern of STEERING) assert.doesNotMatch(prompt, pattern);
    assert.match(prompt, /https:\/\/kunkeconsulting\.pl\/ai-info\//);
    assert.match(prompt, /\^Kunke Consulting/);
  }
  // Each one asks for a critical reading and allows the answer to be no.
  assert.match(prompts[0], /treat it critically/);
  assert.match(prompts[0], /including if it is not/);
  assert.match(prompts[1], /potraktuj go krytycznie/);
  assert.match(prompts[1], /także wtedy, gdy nie jest/);
});
