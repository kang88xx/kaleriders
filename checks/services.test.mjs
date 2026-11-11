import test from 'node:test';
import assert from 'node:assert/strict';
import { services, sectionCopy, escape, localize, serviceSelection } from '../public/services-content.js';
import { sectionMarkup, serviceMarkup, teamMarkup, teamCopy } from '../public/refresh-services.js';

const bilingual = (pair, where) => {
  assert(Array.isArray(pair) && pair.length === 2, `${where}: expected a [ko, en] pair`);
  assert(pair[0].trim() && pair[1].trim(), `${where}: a language is missing`);
};

test('the five services keep their order, each with a short line and three steps in both languages', () => {
  assert.deepEqual(services.map(service => service.id), ['kol', 'meetup', 'press', 'airdrop', 'events']);
  for (const service of services) {
    bilingual(service.label, `${service.id} label`);
    bilingual(service.line, `${service.id} line`);
    assert(service.line[0].length <= 20 && service.line[1].length <= 40, `${service.id}: a line is too long for the graphic`);
    assert.equal(service.steps.length, 3, service.id);
    service.steps.forEach((step, index) => bilingual(step, `${service.id} step ${index + 1}`));
    assert.match(service.icon, /^(<(path|circle|rect) [^<>]*\/>)+$/, `${service.id}: the icon holds only drawing elements`);
  }
  [...sectionCopy.title, ...sectionCopy.intro].forEach((line, index) => bilingual(line, `heading line ${index + 1}`));
});

// The owner asked on 2026-11-11 for a light infographic instead of photos, project records,
// example documents and a per-service inquiry button.
test('the section stays a light infographic', () => {
  const html = sectionMarkup();
  assert.match(html, /<h2 id="services-title">/);
  assert(!/<img|<video|<table|data-open-brief|예시|Example|사례 입력/.test(html), 'a photo, record, table, inquiry button or example label is back');
});

test('markup escapes text and the language switch updates it', () => {
  assert.equal(escape('<a href="x">&</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;');
  const node = { dataset: { rsKo: '밋업', rsEn: 'Meetups' }, firstChild: { nodeValue: '밋업' } };
  const root = { querySelectorAll: selector => (selector === '[data-rs-ko]' ? [node] : []) };
  localize(root, 'en');
  assert.equal(node.firstChild.nodeValue, 'Meetups');
  localize(root, 'ko');
  assert.equal(node.firstChild.nodeValue, '밋업');
});

// Just enough of a button for serviceSelection.
const fakeButton = () => {
  const classes = new Set();
  return {
    on: {}, attributes: {}, classes, focusVisible: false,
    addEventListener(type, listener) { this.on[type] = listener; },
    setAttribute(name, value) { this.attributes[name] = value; },
    classList: { toggle: (name, force) => (force ? classes.add(name) : classes.delete(name)) },
    matches(selector) { return selector === ':focus-visible' && this.focusVisible; },
  };
};

test('pointing previews a service, a press pins it, and keyboard focus previews it', () => {
  const buttons = [fakeButton(), fakeButton(), fakeButton()];
  const shown = [];
  let hoverable = true;
  serviceSelection(buttons, index => shown.push(index), { canHover: () => hoverable });
  const last = () => shown.at(-1);
  const mouse = { pointerType: 'mouse' };
  assert.equal(last(), -1, 'nothing is shown at first');
  buttons[1].on.pointerenter(mouse);
  assert.equal(last(), 1, 'pointing previews');
  buttons[1].on.pointerleave(mouse);
  assert.equal(last(), -1, 'leaving clears the preview');
  buttons[2].on.click();
  assert.deepEqual([last(), buttons[2].attributes['aria-pressed'], buttons[0].attributes['aria-pressed']], [2, 'true', 'false'], 'a press pins');
  buttons[0].on.pointerenter(mouse);
  assert(buttons[0].classes.has('is-shown') && !buttons[2].classes.has('is-shown'), 'a preview outranks the pinned service');
  buttons[0].on.pointerleave(mouse);
  assert.equal(last(), 2, 'leaving returns to the pinned service');
  buttons[2].on.click();
  assert.deepEqual([last(), buttons[2].attributes['aria-pressed']], [-1, 'false'], 'a second press unpins');
  const count = shown.length;
  buttons[1].on.pointerenter({ pointerType: 'touch' });
  hoverable = false;
  buttons[1].on.pointerenter(mouse);
  assert.equal(shown.length, count, 'touch, and narrow layouts, do not preview on pointing');
  buttons[0].on.focus();
  assert.equal(shown.length, count, 'focus from a mouse press does not preview');
  buttons[0].focusVisible = true;
  buttons[0].on.focus();
  assert.equal(last(), 0, 'keyboard focus previews');
  buttons[0].on.blur();
  assert.equal(last(), -1, 'leaving with the keyboard clears the preview');
  // A stale leave or blur from another service must not clear the current preview.
  hoverable = true;
  buttons[0].on.focus();
  buttons[2].on.pointerenter(mouse);
  buttons[0].on.blur();
  buttons[0].on.pointerleave(mouse);
  assert.equal(last(), 2, 'only the previewed service can clear its own preview');
});

test('the five services feed one team label through five lines', () => {
  const html = sectionMarkup();
  services.forEach((service, index) => {
    const button = serviceMarkup(service, index);
    assert(button.includes(`data-index="${index}" aria-pressed="false" aria-controls="sf-team" aria-describedby="sf-steps-${index}"`), `${service.id}: button`);
    assert(button.includes(`<span class="sf-no" aria-hidden="true">0${index + 1}</span>`), `${service.id}: number`);
  });
  const paths = [...html.matchAll(/<path data-index="(\d)" d="M(\d+) 0 C\d+ \d+ \d+ \d+ (\d+) (\d+)"\/>/g)];
  assert.deepEqual(paths.map(match => [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])]), services.map((_, index) => [index, 100 + index * 200, 500, 96]), 'each line runs from its column centre to the team label');
  const team = teamMarkup();
  // Steps are read with each button (aria-describedby), not announced on every change.
  assert.match(team, /^<p class="sf-team" id="sf-team">/);
  assert(!html.includes('aria-live'), 'a live region would repeat every preview');
  services.forEach((_, index) => assert.equal(team.match(new RegExp(`id="sf-steps-${index}"`, 'g'))?.length, 1, `steps ${index + 1} have one target`));
  Object.values(teamCopy).forEach(pair => bilingual(pair, 'team label'));
  assert.equal(team.match(/class="sf-team-state/g).length, services.length + 1);
  assert.deepEqual([...team.matchAll(/class="sf-team-state is-active" data-state="(-?\d)"/g)].map(match => match[1]), ['-1'], 'only the team line shows at first');
});
