import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { arrangeWall, eventFilms, initRefreshMedia, orderFilms, phoneTiles, thumbOf, wallPhotos, wallPool, wallTiles } from '../public/refresh-media.js';
import { initRefreshGallery } from '../public/refresh-gallery.js';

// The owner chose 25 columns on 2026-11-12 (tiles 20% smaller). Eleven rows keep the wall about as
// tall as before, which takes more tiles than there are photos.
test('the wall fills 25 x 11 tiles in a fixed order: every photo once, then some a second time', () => {
  const wall = arrangeWall();
  const sources = wall.map(photo => photo.src);
  assert.equal(wall.length, wallTiles);
  assert.equal(wallTiles, 25 * 11);
  assert.deepEqual(arrangeWall().map(photo => photo.src), sources, 'The order changes between visits');
  assert.equal(new Set(sources.slice(0, wallPool.length)).size, wallPool.length, 'A photo is missing from the first pass');
  assert.notDeepEqual(sources.slice(0, wallPool.length), wallPool.map(photo => photo.src), 'The wall is not mixed');
  const counts = new Map();
  sources.forEach(src => counts.set(src, (counts.get(src) || 0) + 1));
  for (const [src, count] of counts) assert(count <= 2, `${src} appears ${count} times`);
  sources.forEach((src, index) => {
    for (const [column, row] of [[-1, 0], [0, -1], [-1, -1], [1, -1]]) {
      const x = index % 25 + column;
      const y = Math.floor(index / 25) + row;
      if (x >= 0 && x < 25 && y >= 0) assert.notEqual(sources[y * 25 + x], src, `tile ${index + 1} repeats a photo it touches`);
    }
  });
});

test('phones show every photo once in whole rows of 10', () => {
  assert.equal(phoneTiles % 10, 0, 'The last row is incomplete at 10 columns');
  assert.equal(phoneTiles, wallPool.length, 'A photo is left off the phone wall');
});

test('a larger wall repeats photos evenly without a repeat beside or above', () => {
  const pool = wallPool.slice(0, 35);
  const wall = arrangeWall(pool, 100);
  assert.equal(wall.length, 100);
  const counts = new Map();
  wall.forEach(photo => counts.set(photo.src, (counts.get(photo.src) || 0) + 1));
  assert.equal(counts.size, pool.length, 'A photo is missing from the wall');
  for (const [src, count] of counts) assert(count >= 2 && count <= 3, `${src} appears ${count} times`);
  for (const columns of [25, 20, 10]) {
    wall.forEach((photo, index) => {
      if (index % columns) assert.notEqual(wall[index - 1].src, photo.src, `tile ${index + 1} repeats its left neighbour at ${columns} columns`);
      if (index >= columns) assert.notEqual(wall[index - columns].src, photo.src, `tile ${index + 1} repeats the tile above at ${columns} columns`);
    });
  }
});

// The wall draws small copies; 180 full files would be about 40 MB on the homepage.
test('every wall photo has a small copy under assets/cases/thumbs/', () => {
  for (const photo of wallPool) {
    assert.equal(photo.thumb, thumbOf(photo.src));
    assert.match(photo.thumb, /^assets\/cases\/thumbs\/.+\.jpg$/);
    const file = new URL(`../public/${photo.thumb}`, import.meta.url);
    assert(existsSync(file), `${photo.thumb} is missing`);
    const bytes = readFileSync(file);
    assert(bytes[0] === 0xff && bytes[1] === 0xd8, `${photo.thumb} is not a JPEG`);
    assert(bytes.length < 60000, `${photo.thumb} is ${bytes.length} bytes, too large for a wall tile`);
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
  assert(wallPhotos.some(photo => photo.position), 'No wall photo sets a crop focus');
  const focused = wall.find(photo => photo.position);
  assert(focused, 'No wall photo sets a crop focus');
  for (const [viewport, width, columns, used] of [[1440, 1000, 25, wallTiles], [390, 390, 10, phoneTiles]]) {
    const { doc, grid } = fakeGallery(width, viewport);
    const gallery = initRefreshGallery(grid, wall, doc, { compactCount: phoneTiles });
    const [underlay, ...allTiles] = grid.children;
    const cell = width / columns;
    const frameHeight = `${used / columns * cell}px`;
    assert.equal(allTiles.length, wall.length);
    assert.equal(underlay.children.length, wall.length);
    assert.equal(grid.style.height, frameHeight);
    // Phones lay out the first pass only; the second-pass tiles are taken out.
    allTiles.slice(used).forEach((tile, index) => assert.equal(tile.style.display, 'none', `tile ${used + index + 1} should be hidden`));
    underlay.children.slice(used).forEach((image, index) => assert.equal(image.style.display, 'none', `underlay ${used + index + 1} should be hidden`));
    const tiles = allTiles.slice(0, used);
    tiles.forEach((tile, index) => {
      assert.equal(tile.style.display, '', `tile ${index + 1} is hidden`);
      assert.equal(tile.style.width, `${cell}px`, `tile ${index + 1} width at ${columns} columns`);
      assert.equal(tile.style.height, `${cell}px`, `tile ${index + 1} height at ${columns} columns`);
      assert.equal(tile.firstElementChild.style.objectPosition, wall[index].position, `tile ${index + 1} crop`);
      assert(tile.firstElementChild.src.endsWith(`/public/${wall[index].thumb}`), `tile ${index + 1} draws the small copy`);
      assert(underlay.children[index].src.endsWith(`/public/${wall[index].thumb}`), `underlay ${index + 1} draws the small copy`);
      assert.equal(underlay.children[index].style.objectPosition, wall[index].position, `underlay ${index + 1} crop`);
    });

    const index = wall.indexOf(focused);
    tiles[index].listeners.get('click')[0]();
    assert(tiles[index].classList.contains('is-open'));
    assert.equal(tiles[index].style.width, `${(columns === 25 ? 10 : 8) * cell}px`, 'The opened photo has the wrong width');
    assert.equal(tiles[index].style.height, `${(columns === 25 ? 7 : 5) * cell}px`, 'The opened photo has the wrong height');
    assert.match(tiles[index].getAttribute('aria-label'), new RegExp(`^${index + 1}/${used} `), 'The label counts tiles that are not shown');
    assert(tiles[index].firstElementChild.src.endsWith(`/public/${focused.src}`), 'The opened photo did not load its full file');
    assert(tiles[(index + 1) % tiles.length].firstElementChild.src.endsWith(`/public/${wall[(index + 1) % tiles.length].thumb}`), 'A closed tile loaded its full file');
    assert.equal(grid.style.height, frameHeight, 'Opening a photo resized the frame');
    gallery.updateLanguage('en');
    assert.equal(tiles[index].firstElementChild.alt, focused.alt.en);
    assert(grid.previousSibling.textContent.includes(focused.alt.en), 'The status does not describe the opened photo');
  }
});

test('any film can be the large one, with the other two after it in their listed order', () => {
  const ids = eventFilms.map(film => film.id);
  assert.deepEqual(orderFilms(eventFilms, 0).map(film => film.id), ids);
  assert.deepEqual(orderFilms(eventFilms, 1).map(film => film.id), [ids[1], ids[0], ids[2]]);
  assert.deepEqual(orderFilms(eventFilms, 2).map(film => film.id), [ids[2], ids[0], ids[1]]);
});

test('the film block renders every event film, the randomly chosen one first, with labels in both languages', t => {
  // The page draws the large film with Math.random; .99 picks the last listed film, KGEN.
  t.mock.method(Math, 'random', () => .99);
  const { doc } = fakeGallery(1000, 1440);
  const roots = { 'refresh-gallery-root': new FakeElement('div'), 'refresh-friends-root': new FakeElement('div') };
  doc.getElementById = id => roots[id] ?? null;
  doc.createElement = tag => Object.assign(new FakeElement(tag), { clientWidth: 1000 }); // the wall grid needs a width
  let changeLanguage;
  doc.addEventListener = (type, listener) => { if (type === 'languagechange') changeLanguage = listener; };
  initRefreshMedia(doc);
  const descendants = node => [node, ...node.children.flatMap(descendants)];
  const films = descendants(roots['refresh-gallery-root']).filter(node => node.className === 'rm-event-film');
  assert.deepEqual(films.map(film => film.getAttribute('aria-labelledby')), ['rm-film-title-kgen', 'rm-film-title-fogo-mainnet', 'rm-film-title-fogo-meetup']);
  const kgen = descendants(films[0]);
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
