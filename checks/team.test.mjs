import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { initRefreshTeam, members, pickFlips } from '../public/refresh-team.js';

test('every member has a portrait and a PFP file', () => {
  for (const member of members) {
    for (const file of [member.image, member.pfp]) {
      assert(file && existsSync(new URL(`../public/assets/team/${file}`, import.meta.url)), `${member.id}: missing ${file}`);
    }
  }
});

test('team source records match the published portraits and PFPs byte for byte', () => {
  const record = JSON.parse(readFileSync(new URL('../docs/team-image-sources.json', import.meta.url), 'utf8'));
  const recorded = new Map(record.sources.map(item => [item.localPath, item]));
  for (const [path, item] of recorded) {
    const bytes = readFileSync(new URL(`../public/${path}`, import.meta.url));
    assert.equal(bytes.length, item.bytes, path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, path);
  }
  for (const member of members) {
    assert(recorded.has(`assets/team/${member.pfp}`), `${member.id} PFP has no source record`);
    // Kang's illustration predates the record.
    if (member.id !== 'kang') assert(recorded.has(`assets/team/${member.image}`), `${member.id} portrait has no source record`);
  }
});

// Just enough DOM for initRefreshTeam under reduced motion, where nothing flips by itself.
class FakeElement {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.className = '';
    this.children = [];
    this.dataset = {};
    this.attributes = new Map();
    this.listeners = new Map();
    const classes = new Set();
    this.classList = { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) };
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  append(...nodes) { nodes.forEach(node => { node.parentNode = this; this.children.push(node); }); }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  addEventListener(type, listener) { this.listeners.set(type, [...(this.listeners.get(type) || []), listener]); }
  contains(node) {
    for (let current = node; current; current = current.parentNode) if (current === this) return true;
    return false;
  }
  closest() { return null; }
  findAll(match) { return this.children.flatMap(child => [...(match(child) ? [child] : []), ...child.findAll(match)]); }
}

test('each coin shows the member portrait and flips to their own PFP image', () => {
  const root = new FakeElement('div');
  const listeners = new Map();
  const view = {
    matchMedia: () => ({ matches: true, addEventListener() {} }),
    IntersectionObserver: class { observe() {} },
    setTimeout: () => 0,
    clearTimeout() {},
    queueMicrotask() {},
  };
  const doc = {
    defaultView: view, documentElement: { lang: 'ko' }, hidden: false, activeElement: null,
    getElementById: id => (id === 'refresh-team-root' ? root : null),
    createElement: tag => new FakeElement(tag),
    addEventListener: (type, listener) => listeners.set(type, listener),
  };
  initRefreshTeam(doc);
  const cards = root.findAll(node => node.className === 'rt-card');
  assert.deepEqual(cards.map(card => card.dataset.member), members.map(member => member.id));
  const coins = cards.map(card => card.findAll(node => node.tagName === 'IMG'));
  coins.forEach((images, index) => {
    const member = members[index];
    assert.deepEqual(images.map(image => image.className), ['rt-portrait', 'rt-pfp'], `${member.id} coin`);
    assert(images[0].src.endsWith(`/public/assets/team/${member.image}`), images[0].src);
    assert(images[1].src.endsWith(`/public/assets/team/${member.pfp}`), images[1].src);
    assert.equal(images[0].alt, member.alt.ko);
    assert.equal(images[1].alt, '');
  });
  // The role shares the name's line and the description comes under both.
  cards.forEach((card, index) => {
    const member = members[index];
    const [caption] = card.findAll(node => node.className === 'rt-caption');
    assert.deepEqual(caption.children.map(node => node.className), ['rt-name-line', 'rt-description'], `${member.id} caption`);
    const [nameLine, description] = caption.children;
    assert.deepEqual(nameLine.children.map(node => node.className || node.tagName), ['H3', 'rt-role'], `${member.id} name line`);
    assert.equal(nameLine.children[0].textContent, member.name);
    assert.equal(nameLine.children[1].textContent, member.role.ko);
    assert.equal(description.textContent, member.description.ko);
  });
  // member-art.js fills every [data-member-avatar] with a drawn character, which would cover these photos.
  assert.equal(root.findAll(node => 'memberAvatar' in node.dataset).length, 0);
  listeners.get('languagechange')({ detail: { language: 'en' } });
  coins.forEach((images, index) => assert.equal(images[0].alt, members[index].alt.en));
});

// The owner asked on 2026-11-12 for the coins to turn at random, sometimes two at once.
test('an automatic beat turns one coin, sometimes two together and now and then all three', () => {
  const rolls = values => { let next = 0; return () => values[next++ % values.length]; };
  assert.deepEqual(pickFlips(3, [], rolls([.1, 0])), [0]);
  assert.deepEqual(pickFlips(3, [], rolls([.7, 0, 0])), [0, 1]);
  assert.deepEqual(pickFlips(3, [], rolls([.95, .9, .5, 0])), [0, 1, 2]);
  // A coin that turned alone does not turn alone again on the next beat.
  assert.deepEqual(pickFlips(3, [0], rolls([.1, 0])), [1]);
  const sizes = new Map();
  let previous = [];
  for (let beat = 0; beat < 3000; beat++) {
    const turning = pickFlips(3, previous);
    assert(turning.length >= 1 && turning.length <= 3);
    assert.equal(new Set(turning).size, turning.length, 'A coin is picked twice on one beat');
    assert(turning.every(index => index >= 0 && index < 3));
    if (turning.length === 1 && previous.length === 1) assert.notEqual(turning[0], previous[0]);
    sizes.set(turning.length, (sizes.get(turning.length) || 0) + 1);
    previous = turning;
  }
  assert(sizes.get(1) > sizes.get(2) && sizes.get(2) > sizes.get(3) && sizes.get(3) > 0, 'One coin should be the usual case and three the rare one');
});

test('a pressed coin turns to its PFP and back without waiting for the others', () => {
  const root = new FakeElement('div');
  const view = {
    matchMedia: () => ({ matches: true, addEventListener() {} }),
    IntersectionObserver: class { observe() {} },
    setTimeout: () => 0,
    clearTimeout() {},
    queueMicrotask() {},
  };
  const doc = {
    defaultView: view, documentElement: { lang: 'ko' }, hidden: false, activeElement: null,
    getElementById: id => (id === 'refresh-team-root' ? root : null),
    createElement: tag => new FakeElement(tag),
    addEventListener() {},
  };
  initRefreshTeam(doc);
  const coins = root.findAll(node => node.className === 'rt-visual');
  const press = index => coins[index].listeners.get('click')[0]();
  press(0);
  press(2);
  assert.deepEqual(coins.map(coin => coin.getAttribute('aria-pressed')), ['true', 'false', 'true']);
  assert.equal(root.dataset.pfpMember, 'kang mascot');
  press(0);
  assert.deepEqual(coins.map(coin => coin.getAttribute('aria-pressed')), ['false', 'false', 'true']);
  assert.equal(root.dataset.pfpState, 'pfp');
  press(2);
  assert.equal(root.dataset.pfpState, 'portrait');
  assert.equal(root.dataset.pfpMember, undefined);
});
