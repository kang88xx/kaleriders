import test from 'node:test';
import assert from 'node:assert/strict';
import { services, sectionCopy, escape, localize, serviceCycle } from '../public/services-content.js';
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
  Object.values(teamCopy).forEach(pair => bilingual(pair, 'team label'));
});

// The owner asked on 2026-11-11 for a light infographic without photos, project records, example
// documents, a per-service inquiry button or (later that day) the 01-05 numbers.
test('the section stays a light infographic without numbers', () => {
  const html = sectionMarkup();
  assert.match(html, /<h2 id="services-title">/);
  assert(!/<img|<video|<table|data-open-brief|예시|Example|사례 입력|sf-no|aria-pressed|aria-live/.test(html), 'a photo, record, inquiry button, number, toggle or live region is back');
  assert(!/>0[1-5]</.test(html), 'a 01-05 number is visible again');
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

// Just enough of a button and a clock for serviceCycle.
const fakeButton = () => {
  const classes = new Set();
  return {
    on: {}, classes, focusVisible: false,
    addEventListener(type, listener) { this.on[type] = listener; },
    classList: { toggle: (name, force) => (force ? classes.add(name) : classes.delete(name)) },
    matches(selector) { return selector === ':focus-visible' && this.focusVisible; },
  };
};
const fakeClock = () => {
  let now = 0;
  let next = null;
  return {
    setTimeout(callback, delay) { next = { callback, at: now + delay }; return 1; },
    clearTimeout() { next = null; },
    // Runs every timer due within `ms`, in order.
    tick(ms) {
      const end = now + ms;
      while (next && next.at <= end) { const { callback, at } = next; next = null; now = at; callback(); }
      now = end;
    },
  };
};

test('the highlight moves every 1.2 seconds from the first service to the last and round again', () => {
  const buttons = services.map(fakeButton);
  const clock = fakeClock();
  const shown = [];
  const cycle = serviceCycle(buttons, index => shown.push(index), { timers: clock });
  assert.deepEqual(shown, [-1], 'nothing is highlighted before the cycle starts');
  cycle.start();
  assert.equal(shown.at(-1), 0, 'the first service shows as soon as the cycle starts');
  clock.tick(1199);
  assert.equal(shown.at(-1), 0);
  clock.tick(1);
  assert.equal(shown.at(-1), 1, 'the next service after 1.2 seconds');
  clock.tick(1200 * 4);
  assert.deepEqual(shown.slice(-5), [1, 2, 3, 4, 0], 'after the fifth comes the first again');
  assert(buttons[0].classes.has('is-shown') && [1, 2, 3, 4].every(index => !buttons[index].classes.has('is-shown')), 'only the shown service is highlighted');
  cycle.stop();
  clock.tick(5000);
  assert.equal(shown.at(-1), 0, 'stop() halts the cycle');
});

test('pointing at, pressing or keyboard-focusing a service holds it for 3 seconds', () => {
  const buttons = services.map(fakeButton);
  const clock = fakeClock();
  const shown = [];
  const cycle = serviceCycle(buttons, index => shown.push(index), { timers: clock });
  cycle.start();
  buttons[3].on.pointerenter({ pointerType: 'mouse' });
  assert.equal(shown.at(-1), 3, 'pointing shows the service at once');
  clock.tick(2999);
  assert.equal(shown.at(-1), 3, 'and holds it');
  clock.tick(1);
  assert.equal(shown.at(-1), 4, 'then the cycle continues from there');
  clock.tick(1200);
  assert.equal(shown.at(-1), 0, 'at the usual pace');
  buttons[1].on.click();
  clock.tick(2999);
  assert.equal(shown.at(-1), 1, 'a press holds for 3 seconds too');
  clock.tick(1);
  assert.equal(shown.at(-1), 2);
  const count = shown.length;
  buttons[4].on.pointerenter({ pointerType: 'touch' });
  buttons[4].on.focus();
  assert.equal(shown.length, count, 'a touch enter or a mouse-press focus does not count as pointing');
  buttons[4].focusVisible = true;
  buttons[4].on.focus();
  assert.equal(shown.at(-1), 4, 'keyboard focus holds too');
  cycle.stop();
  buttons[0].on.click();
  clock.tick(10000);
  assert.equal(shown.at(-1), 0, 'with the cycle stopped (off screen or reduced motion), a press just shows the service');
});

test('the five services feed one team label through five lines', () => {
  const html = sectionMarkup();
  services.forEach((service, index) => {
    const button = serviceMarkup(service, index);
    assert(button.includes(`data-index="${index}" aria-controls="sf-team" aria-describedby="sf-steps-${index}"`), `${service.id}: button`);
  });
  const paths = [...html.matchAll(/<path data-index="(\d)" d="M(\d+) 0 C\d+ \d+ \d+ \d+ (\d+) (\d+)"\/>/g)];
  assert.deepEqual(paths.map(match => [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])]), services.map((_, index) => [index, 100 + index * 200, 500, 96]), 'each line runs from its column centre to the team label');
  const team = teamMarkup();
  assert.match(team, /^<p class="sf-team" id="sf-team">/);
  services.forEach((_, index) => assert.equal(team.match(new RegExp(`id="sf-steps-${index}"`, 'g'))?.length, 1, `steps ${index + 1} have one target`));
  assert.equal(team.match(/class="sf-team-state/g).length, services.length + 1);
  assert.deepEqual([...team.matchAll(/class="sf-team-state is-active" data-state="(-?\d)"/g)].map(match => match[1]), ['-1'], 'only the team line shows at first');
});
