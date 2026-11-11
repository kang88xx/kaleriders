import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { initRefreshTeam, members } from '../public/refresh-team.js';

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
  // member-art.js fills every [data-member-avatar] with a drawn character, which would cover these photos.
  assert.equal(root.findAll(node => 'memberAvatar' in node.dataset).length, 0);
  listeners.get('languagechange')({ detail: { language: 'en' } });
  coins.forEach((images, index) => assert.equal(images[0].alt, members[index].alt.en));
});
