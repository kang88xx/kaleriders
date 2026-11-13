import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../public/mobile-compact.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

// The top-level blocks of the stylesheet as { prelude, body }.
function topLevelBlocks(source) {
  const blocks = [];
  let depth = 0;
  let start = 0;
  let open = 0;
  for (let index = 0; index < source.length; index++) {
    if (source[index] === '{') {
      if (depth === 0) open = index;
      depth++;
    } else if (source[index] === '}') {
      depth--;
      assert(depth >= 0, 'The stylesheet closes a block it never opened');
      if (depth === 0) {
        blocks.push({ prelude: source.slice(start, open).trim(), body: source.slice(open + 1, index).trim() });
        start = index + 1;
      }
    }
  }
  assert.equal(depth, 0, 'The stylesheet leaves a block open');
  assert.equal(source.slice(start).trim(), '', 'There is text after the last block');
  return blocks;
}

// The owner asked for a shorter page on phones only (2026-11-13). Screens 761px and wider must
// render as before, so every rule sits in a phone-width query. The two exceptions touch nothing
// but the film position dots this stylesheet's slider adds.
test('the phone layout cannot reach screens wider than 760px', () => {
  const blocks = topLevelBlocks(css);
  assert(blocks.length >= 3, 'The stylesheet is unexpectedly empty');
  for (const { prelude, body } of blocks) {
    assert(prelude.startsWith('@media'), `A rule sits outside a media query: ${prelude.slice(0, 60)}`);
    const phone = /^@media \(max-width: (\d+)px\)$/.exec(prelude);
    if (phone) {
      assert(Number(phone[1]) <= 760, `${prelude} reaches screens wider than 760px`);
      continue;
    }
    assert(['@media (min-width: 761px)', '@media (prefers-reduced-motion: reduce)'].includes(prelude), `Unexpected query: ${prelude}`);
    const selectors = [...body.matchAll(/([^{}]+)\{/g)].map(match => match[1].trim());
    assert(selectors.length > 0 && selectors.every(selector => selector.startsWith('.rm-film-dots')), `${prelude} touches more than the film dots: ${selectors.join(' | ')}`);
  }
});

test('the phone layout leaves the inquiry dialog and the menu alone', () => {
  for (const name of ['brief', 'dialog', 'mobile-nav', 'menu-toggle']) assert(!css.includes(name), `The phone layout styles ${name}`);
});

test('the homepage links the phone layout after every other stylesheet', () => {
  const sheets = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(match => match[1]);
  assert(sheets.at(-1).startsWith('mobile-compact.css?v='), `The last stylesheet is ${sheets.at(-1)}`);
  assert.equal(sheets.filter(sheet => sheet.startsWith('mobile-compact.css')).length, 1);
});
