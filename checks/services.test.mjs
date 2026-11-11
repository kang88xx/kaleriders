import test from 'node:test';
import assert from 'node:assert/strict';
import { services } from '../public/refresh-services.js';

test('each service drawing numbers its cards to match the listed steps', () => {
  assert.equal(services.length, 5);
  for (const service of services) {
    const badges = [...service.art.matchAll(/<text data-badge[^>]*>(\d+)<\/text>/g)].map(match => Number(match[1]));
    assert.deepEqual(badges, service.pills.map((_, index) => index + 1), `${service.id}: card numbers do not match its steps`);
  }
});

// The screenshot QA measures each label against the [data-card] shape of its <g data-box>.
test('every labelled box in the drawings has exactly one bounding card', () => {
  for (const service of services) {
    const boxes = [...service.art.matchAll(/<g data-box>([\s\S]*?)<\/g>/g)].map(match => match[1]);
    assert(boxes.length >= 3, `${service.id}: fewer than three boxes`);
    boxes.forEach((box, index) => {
      assert.equal(box.match(/data-card/g)?.length, 1, `${service.id} box ${index + 1}`);
      assert(!box.includes('<g'), `${service.id} box ${index + 1} nests a group, which the box pattern cannot read`);
    });
    for (const [, ko, en] of service.art.matchAll(/<tspan data-rs-ko="([^"]*)" data-rs-en="([^"]*)">/g)) {
      assert(ko.trim() && en.trim(), `${service.id}: a label is missing a language`);
    }
  }
});

// Text without a <tspan> does not change with the language switch.
const neutral = /^(?:[\d:/]+|0x[\da-f]+…[\da-f]+|K|KBW|EN|KO)$/;
// The KOL post and the press headline show Korean output on purpose, in both languages.
const koreanSamples = new Set(['새 프로젝트를 소개해요', '프로젝트, 한국 시장 진출']);

test('drawing text that skips the language switch is language-neutral or a deliberate Korean sample', () => {
  const seen = new Set();
  for (const service of services) {
    for (const [, content] of service.art.matchAll(/<text\b[^>]*>([^<]+)<\/text>/g)) {
      if (koreanSamples.has(content)) seen.add(content);
      else assert.match(content, neutral, `${service.id}: "${content}" stays the same in both languages`);
    }
  }
  assert.deepEqual([...seen].sort(), [...koreanSamples].sort());
});
