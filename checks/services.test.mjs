import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { services, sectionCopy, escape, localize, serviceCycle, logoGroup, partners } from '../public/services-content.js';
import { sectionMarkup, serviceMarkup, signMarkup, teamMarkup, teamCopy } from '../public/refresh-services.js';

const bilingual = (pair, where) => {
  assert(Array.isArray(pair) && pair.length === 2, `${where}: expected a [ko, en] pair`);
  assert(pair[0].trim() && pair[1].trim(), `${where}: a language is missing`);
};

test('the six services keep their order, each with a short line and three or four steps in both languages', () => {
  assert.deepEqual(services.map(service => service.id), ['kol', 'community', 'meetup', 'press', 'airdrop', 'events']);
  for (const service of services) {
    bilingual(service.label, `${service.id} label`);
    bilingual(service.line, `${service.id} line`);
    // Airdrops is the longest: on 2026-11-13 the owner asked for whitelists and sale allocation in it
    // and approved the draft with this line and four steps. The others stay at three.
    assert(service.line[0].length <= 24 && service.line[1].length <= 48, `${service.id}: a line is too long for the graphic`);
    assert.equal(service.steps.length, service.id === 'airdrop' ? 4 : 3, service.id);
    service.steps.forEach((step, index) => bilingual(step, `${service.id} step ${index + 1}`));
    // One sign per circle: a line icon, lettering (KOL) or a logo file drawn in the text colour (KBW).
    assert.equal([service.icon, service.word, service.mark].filter(Boolean).length, 1, `${service.id}: exactly one sign`);
    if (service.icon) assert.match(service.icon, /^(<(path|circle|rect) [^<>]*\/>)+$/, `${service.id}: the icon holds only drawing elements`);
    if (service.word) assert.match(service.word, /^[A-Z]{2,4}$/, `${service.id}: short lettering`);
    if (service.mark) assert(service.mark.startsWith('assets/references/') && existsSync(new URL(`../public/${service.mark}`, import.meta.url)), `${service.id}: missing ${service.mark}`);
    assert.match(signMarkup(service), /^<(svg class="service-icon"|span class="sf-(word|mark)") aria-hidden="true"/, `${service.id}: the sign is decoration beside the name`);
  }
  [...sectionCopy.title, ...sectionCopy.intro].forEach((line, index) => bilingual(line, `heading line ${index + 1}`));
  Object.values(teamCopy).forEach(pair => bilingual(pair, 'team label'));
});

// The owner asked on 2026-11-11 for a light infographic without photos, project records, example
// documents, a per-service inquiry button or (later that day) the 01-05 numbers.
test('the section stays a light infographic without numbers', () => {
  const html = sectionMarkup();
  assert.match(html, /<h2 id="services-title">/);
  assert.equal(html.match(/<img /g).length, services.reduce((sum, service) => sum + service.partners.length, 0), 'the only images are the partner symbols in the team label');
  assert.deepEqual(services.filter(service => service.word).map(service => service.id), ['kol']);
  assert.deepEqual(services.filter(service => service.mark).map(service => service.id), ['events']);
  assert(!/<video|<table|data-open-brief|예시|Example|사례 입력|sf-no|aria-pressed|aria-live/.test(html), 'a photo, record, inquiry button, number, toggle or live region is back');
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

test('the highlight moves every 1.56 seconds from the first service to the sixth and round again', () => {
  const buttons = services.map(fakeButton);
  const clock = fakeClock();
  const shown = [];
  const cycle = serviceCycle(buttons, index => shown.push(index), { timers: clock });
  assert.deepEqual(shown, [-1], 'nothing is highlighted before the cycle starts');
  cycle.start();
  assert.equal(shown.at(-1), 0, 'the first service shows as soon as the cycle starts');
  clock.tick(1559);
  assert.equal(shown.at(-1), 0);
  clock.tick(1);
  assert.equal(shown.at(-1), 1, 'the next service after 1.56 seconds');
  clock.tick(1560 * 5);
  assert.deepEqual(shown.slice(-6), [1, 2, 3, 4, 5, 0], 'after the sixth comes the first again');
  assert(buttons[0].classes.has('is-shown') && [1, 2, 3, 4, 5].every(index => !buttons[index].classes.has('is-shown')), 'only the shown service is highlighted');
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
  clock.tick(1560);
  assert.equal(shown.at(-1), 5, 'at the usual pace');
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

test('the six services feed one team label through six lines', () => {
  const html = sectionMarkup();
  services.forEach((service, index) => {
    const button = serviceMarkup(service, index);
    assert(button.includes(`data-index="${index}" aria-controls="sf-team" aria-describedby="sf-steps-${index}"`), `${service.id}: button`);
  });
  const paths = [...html.matchAll(/<path data-index="(\d)" d="M([\d.]+) 0 C[\d.]+ \d+ \d+ \d+ (\d+) (\d+)"\/>/g)];
  assert.deepEqual(paths.map(match => [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])]), services.map((_, index) => [index, Number(((index + 0.5) * 1000 / services.length).toFixed(1)), 500, 96]), 'each line runs from its column centre to the team label');
  const team = teamMarkup();
  assert.match(team, /^<p class="sf-team" id="sf-team">/);
  services.forEach((_, index) => assert.equal(team.match(new RegExp(`id="sf-steps-${index}"`, 'g'))?.length, 1, `steps ${index + 1} have one target`));
  assert.equal(team.match(/class="sf-team-state/g).length, services.length + 1);
  assert.deepEqual([...team.matchAll(/class="sf-team-state is-active" data-state="(-?\d)"/g)].map(match => match[1]), ['-1'], 'only the team line shows at first');
});

// The owner asked on 2026-11-12 for the partner symbols in the team label. Only the projects
// already shown in the partner-logo strip appear.
test('each service shows its own partner projects and +N in the team label, as decoration', () => {
  const page = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  const strip = page.slice(page.indexOf('class="reference-strip"'), page.indexOf('<section id="services"'));
  for (const partner of partners) {
    assert(existsSync(new URL(`../public/${partner.src}`, import.meta.url)), `${partner.name}: missing ${partner.src}`);
    assert(partner.src.startsWith('assets/references/'), `${partner.name}: symbol comes from the reference logos`);
    assert(strip.includes(`alt="${partner.name}"`), `${partner.name} is not in the partner-logo strip`);
  }
  // On 2026-11-13 the owner listed each service's projects and its "+N"; KGeN comes last in a row.
  const expected = {
    kol: [['axis', 'buidlpad', 'fogo', 'kgen'], 12],
    community: [['axis', 'buidlpad', 'fogo', 'superwalk'], 7],
    meetup: [['axis', 'buidlpad', 'fogo', 'kgen'], 6],
    press: [['axis', 'kgen'], 5],
    airdrop: [['axis', 'buidlpad', 'fogo', 'superwalk', 'kgen'], 9],
    events: [['axis', 'buidlpad', 'fogo', 'kgen'], 3],
  };
  assert.equal(partners.at(-1).id, 'kgen', 'KGeN should close the row');
  for (const service of services) {
    assert.deepEqual([service.partners, service.more], expected[service.id], `${service.id}: projects and +N`);
    const group = logoGroup(service);
    assert.match(group, /^<span class="sf-logos" aria-hidden="true">/);
    const shown = [...group.matchAll(/<span class="sf-logo"[^>]* title="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(shown, partners.filter(partner => service.partners.includes(partner.id)).map(partner => partner.name), `${service.id}: one circle per listed project, in the row's order`);
    assert.equal(group.match(/<img [^>]*alt=""/g).length, service.partners.length, 'the symbols carry no alt text of their own');
    assert.equal(group.replace(/<[^>]+>/g, ''), `+${service.more}`, `${service.id}: the only text in the row is its +N, after the symbols`);
    assert(group.endsWith(`<span class="sf-logo sf-logo-more">+${service.more}</span></span>`), `${service.id}: +N comes last`);
  }
  const team = teamMarkup();
  assert.equal(team.match(/class="sf-logos"/g).length, services.length, 'one row per service state');
  assert(!team.slice(0, team.indexOf('data-state="0"')).includes('sf-logos'), 'the resting team line has no symbols');
});

// On 2026-11-13 the owner replaced the check on each circle with the team's own leaf, shown only
// on the highlighted service, and asked for whitelists and sale allocation under Airdrops.
test('the highlighted service carries the KALE Riders leaf, and Airdrops names whitelists and sale allocation', () => {
  const html = sectionMarkup();
  assert.equal(html.match(/<i class="sf-leaf" aria-hidden="true"><\/i>/g).length, services.length, 'one leaf slot per service');
  assert(!html.includes('sf-check'), 'the check is back');
  const css = readFileSync(new URL('../public/refresh-services.css', import.meta.url), 'utf8');
  assert.match(css, /\.sf-leaf \{[^}]*opacity: 0/, 'a quiet service should show no leaf');
  assert.match(css, /\.sf-service\.is-shown \.sf-leaf \{[^}]*opacity: 1/);
  const leaf = readFileSync(new URL('../public/assets/kale-leaf-128.png', import.meta.url));
  assert.equal(leaf.readUInt32BE(0), 0x89504e47, 'the leaf is a PNG');
  assert(leaf.length < 40000, 'the leaf should stay a small file');
  const airdrop = services.find(service => service.id === 'airdrop');
  assert.deepEqual(airdrop.steps.map(step => step[1]), ['Mission design', 'Whitelist', 'Sale allocation', 'Participation review']);
  assert.deepEqual(airdrop.steps.map(step => step[0]), ['참여 미션 설계', '화이트리스트', '세일 물량 배정', '참여 결과 확인']);
  assert.match(airdrop.line[1], /whitelists and sale allocation/);
});
