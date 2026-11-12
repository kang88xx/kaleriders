import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { arrangeWall, eventFilms, initRefreshMedia, wallPhotos, wallPool } from '../public/refresh-media.js';
import { initRefreshGallery } from '../public/refresh-gallery.js';

test('the wall spreads every photo evenly without a repeat beside or above it', () => {
  const wall = arrangeWall();
  assert.equal(wall.length, 100);
  assert.deepEqual(arrangeWall().map(photo => photo.src), wall.map(photo => photo.src), 'The order changes between visits');
  const counts = new Map();
  wall.forEach(photo => counts.set(photo.src, (counts.get(photo.src) || 0) + 1));
  assert.equal(counts.size, wallPool.length, 'A photo is missing from the wall');
  const low = Math.floor(100 / wallPool.length);
  const high = Math.ceil(100 / wallPool.length);
  for (const [src, count] of counts) assert(count >= low && count <= high, `${src} appears ${count} times`);
  for (const columns of [20, 10]) {
    wall.forEach((photo, index) => {
      if (index % columns) assert.notEqual(wall[index - 1].src, photo.src, `tile ${index + 1} repeats its left neighbour at ${columns} columns`);
      if (index >= columns) assert.notEqual(wall[index - columns].src, photo.src, `tile ${index + 1} repeats the tile above at ${columns} columns`);
    });
  }
});

// Just enough DOM for initRefreshGallery under reduced motion, where nothing animates.
class FakeElement {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.style = {};
    this.dataset = {};
    this.attributes = new Map();
    this.listeners = new Map();
    const classes = new Set();
    this.classList = {
      add: (...names) => names.forEach(name => classes.add(name)),
      toggle: (name, force = !classes.has(name)) => { if (force) classes.add(name); else classes.delete(name); return force; },
      contains: name => classes.has(name),
    };
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  append(...nodes) { nodes.forEach(node => { node.parentNode = this; this.children.push(node); }); }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  before(node) { this.previousSibling = node; }
  addEventListener(type, listener) { this.listeners.set(type, [...(this.listeners.get(type) || []), listener]); }
  contains(node) {
    for (let current = node; current; current = current.parentNode) if (current === this) return true;
    return false;
  }
  get firstElementChild() { return this.children[0] ?? null; }
  getBoundingClientRect() {
    const number = value => Number.parseFloat(value) || 0;
    return { left: number(this.style.left), top: number(this.style.top), width: number(this.style.width) || this.clientWidth || 0, height: number(this.style.height) };
  }
  focus() {}
  animate() { return { cancel() {}, finished: Promise.resolve() }; }
}

function fakeGallery(width, viewport) {
  const view = {
    innerWidth: viewport,
    matchMedia: () => ({ matches: true, addEventListener() {} }),
    getComputedStyle: element => ({ opacity: element.style.opacity ?? '1' }),
    IntersectionObserver: class { observe() {} },
    ResizeObserver: class { observe() {} },
    addEventListener() {},
    setTimeout: () => 0,
    clearTimeout() {},
  };
  const doc = { defaultView: view, documentElement: { lang: 'ko' }, hidden: false, activeElement: null, createElement: tag => new FakeElement(tag), addEventListener() {} };
  const grid = new FakeElement('div');
  grid.clientWidth = width;
  return { doc, grid };
}

test('the gallery keeps square tiles in a fixed frame and applies a photo crop focus', () => {
  const wall = arrangeWall();
  const focused = wallPhotos.find(photo => photo.position);
  assert(focused, 'No wall photo sets a crop focus');
  for (const [viewport, width, columns] of [[1440, 1000, 20], [390, 390, 10]]) {
    const { doc, grid } = fakeGallery(width, viewport);
    const gallery = initRefreshGallery(grid, wall, doc);
    const [underlay, ...tiles] = grid.children;
    const cell = width / columns;
    const frameHeight = `${Math.ceil(wall.length / columns) * cell}px`;
    assert.equal(tiles.length, wall.length);
    assert.equal(underlay.children.length, wall.length);
    assert.equal(grid.style.height, frameHeight);
    tiles.forEach((tile, index) => {
      assert.equal(tile.style.width, `${cell}px`, `tile ${index + 1} width at ${columns} columns`);
      assert.equal(tile.style.height, `${cell}px`, `tile ${index + 1} height at ${columns} columns`);
      assert.equal(tile.firstElementChild.style.objectPosition, wall[index].position, `tile ${index + 1} crop`);
      assert.equal(underlay.children[index].style.objectPosition, wall[index].position, `underlay ${index + 1} crop`);
    });

    const index = wall.indexOf(focused);
    tiles[index].listeners.get('click')[0]();
    assert(tiles[index].classList.contains('is-open'));
    assert(Number.parseFloat(tiles[index].style.width) > cell, 'The opened photo did not enlarge');
    assert.equal(grid.style.height, frameHeight, 'Opening a photo resized the frame');
    gallery.updateLanguage('en');
    assert.equal(tiles[index].firstElementChild.alt, focused.alt.en);
    assert(grid.previousSibling.textContent.includes(focused.alt.en), 'The status does not describe the opened photo');
  }
});

test('the film row renders every event film, the KGEN after-movie last, with labels in both languages', () => {
  const { doc } = fakeGallery(1000, 1440);
  const roots = { 'refresh-gallery-root': new FakeElement('div'), 'refresh-friends-root': new FakeElement('div') };
  doc.getElementById = id => roots[id] ?? null;
  doc.createElement = tag => Object.assign(new FakeElement(tag), { clientWidth: 1000 }); // the wall grid needs a width
  let changeLanguage;
  doc.addEventListener = (type, listener) => { if (type === 'languagechange') changeLanguage = listener; };
  initRefreshMedia(doc);
  const descendants = node => [node, ...node.children.flatMap(descendants)];
  const films = descendants(roots['refresh-gallery-root']).filter(node => node.className === 'rm-event-film');
  assert.deepEqual(films.map(film => film.getAttribute('aria-labelledby')), ['rm-film-title-fogo-mainnet', 'rm-film-title-fogo-meetup', 'rm-film-title-kgen']);
  const kgen = descendants(films[2]);
  const video = kgen.find(node => node.tagName === 'VIDEO');
  const heading = kgen.find(node => node.tagName === 'H4');
  const play = kgen.find(node => node.className === 'rm-video-launch');
  assert.match(video.src, /\/assets\/cases\/kgen\/after-movie\.mp4$/);
  assert.match(video.poster, /\/assets\/cases\/kgen\/after-movie\.jpg$/);
  assert.equal(heading.id, 'rm-film-title-kgen');
  assert.equal(heading.textContent, 'KGEN · VeriFi Korea');
  assert.equal(video.getAttribute('aria-label'), 'KGEN · VeriFi Korea 현장 애프터무비');
  assert.equal(play.getAttribute('aria-label'), '영상 재생: KGEN · VeriFi Korea 현장 애프터무비');
  changeLanguage({ detail: { language: 'en' } });
  assert.equal(video.getAttribute('aria-label'), 'KGEN · VeriFi Korea event after-movie');
  assert.equal(play.getAttribute('aria-label'), 'Play video: KGEN · VeriFi Korea event after-movie');
});

test('source records match every published wall photo and added film byte for byte', () => {
  const record = JSON.parse(readFileSync(new URL('../docs/case-study-sources.json', import.meta.url), 'utf8'));
  const located = new Map(record.sources.filter(item => item.localPath).map(item => [item.localPath, item]));
  for (const [path, item] of located) {
    const bytes = readFileSync(new URL(`../public/${path}`, import.meta.url));
    assert.equal(bytes.length, item.bytes, path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, path);
  }
  for (const photo of wallPhotos) assert(located.has(photo.src), `${photo.src} has no source record`);
  for (const { media } of eventFilms.filter(film => film.media)) {
    for (const path of [media.src, media.poster]) assert(located.has(path), `${path} has no source record`);
  }
});

// A module requested under two query strings is fetched and run twice on the same page.
const specifiers = /\b(?:import|export)\s[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)|\bimport\s*['"]([^'"]+)['"]/g;
const publicRoot = new URL('../public/', import.meta.url);

function moduleTokens(page) {
  const pageURL = new URL(page, import.meta.url);
  const html = readFileSync(pageURL, 'utf8');
  const queue = [...html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"/g)]
    .map(match => (match[1].startsWith('/') ? new URL(`.${match[1]}`, publicRoot) : new URL(match[1], pageURL)));
  const tokens = new Map();
  const visited = new Set();
  while (queue.length) {
    const url = queue.shift();
    const file = new URL(url);
    file.search = '';
    const path = fileURLToPath(file);
    tokens.set(path, new Set([...(tokens.get(path) || []), url.search]));
    if (visited.has(path) || !existsSync(path)) continue;
    visited.add(path);
    for (const match of readFileSync(path, 'utf8').matchAll(specifiers)) {
      const specifier = match[1] || match[2] || match[3];
      if (specifier.startsWith('./') || specifier.startsWith('../')) queue.push(new URL(specifier, url));
    }
  }
  return tokens;
}

// The page is hidden until app.js has run (see the language script in index.html), so its modules
// are preloaded side by side instead of being found one import level at a time.
test('the homepage preloads exactly the modules it runs, under the same version tokens', () => {
  const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  const preloaded = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map(match => match[1]);
  const entry = fileURLToPath(new URL('../public/app.js', import.meta.url));
  const expected = [...moduleTokens('../public/index.html')]
    .filter(([path]) => path !== entry)
    .map(([path, queries]) => `${path.slice(fileURLToPath(publicRoot).length)}${[...queries][0]}`);
  assert.equal(new Set(preloaded).size, preloaded.length, 'A module is preloaded twice');
  assert.deepEqual([...preloaded].sort(), expected.sort());
  assert(html.indexOf('rel="modulepreload"') < html.indexOf('<script type="module"'), 'Preloads come before the module script');
});

test('each page loads every module once, under a single version token', () => {
  for (const page of ['../public/index.html', '../public/sample.html']) {
    const tokens = moduleTokens(page);
    for (const [path, queries] of tokens) {
      assert(existsSync(path), `${page} imports a missing module ${path}`);
      assert.equal(queries.size, 1, `${path} loads as ${[...queries].join(' and ')} on ${page}`);
    }
    for (const required of ['../public/app.js', '../public/refresh-media.js', '../public/refresh-gallery.js']) {
      assert(tokens.has(fileURLToPath(new URL(required, import.meta.url))), `${page} does not load ${required}`);
    }
  }
});
