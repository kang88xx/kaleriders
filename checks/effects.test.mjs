import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_ARTWORK, PALETTE, bloomProgress, waveColor, buildMotifs, patternMarkup } from '../public/pattern-art.js';
import { wordReset, flowerGrowth } from '../public/closing-spray.js';
import { PAINT_END } from '../public/reference-spray.js';
import { initMemberArt } from '../public/member-art.js';

test('bloom is continuous, gently overshoots, then retains its painted state', () => {
  const arrival = 4;
  assert.equal(bloomProgress(arrival - 1, arrival).opacity, 0);
  assert(Math.abs(bloomProgress(arrival, arrival).scale) < 1e-12);
  let previous = bloomProgress(arrival, arrival);
  let maximum = 0;
  for (let i = 1; i <= 1000; i++) {
    const current = bloomProgress(arrival + i / 1000, arrival);
    assert(current.opacity >= previous.opacity && current.opacity <= 1);
    assert(current.scale >= 0 && current.scale < 1.1);
    assert(Math.abs(current.scale - previous.scale) < .02);
    maximum = Math.max(maximum, current.scale);
    previous = current;
  }
  assert(maximum > 1.01, 'Petals gently unfold beyond final size');
  for (const time of [5, 8, 12, 13.2]) assert.deepEqual(bloomProgress(time, arrival), { opacity: 1, scale: 1 });
});

test('footer flowers grow only after beam arrival and retain their completed size', () => {
  assert.equal(flowerGrowth(.4, .5), 0);
  assert.equal(flowerGrowth(.5, .5), 0);
  assert(Math.abs(flowerGrowth(.54, .5) - .875) < 1e-10);
  assert.equal(flowerGrowth(.6, .5), 1);
  assert.equal(flowerGrowth(1, .5), 1);
  assert.equal(flowerGrowth(1, Infinity), 0, 'Unreachable motifs stay unpainted');
});

test('footer reset is staggered over 1.05 seconds with a symmetric ease', () => {
  assert.equal(wordReset(PAINT_END, 0), 0);
  assert(wordReset(PAINT_END + .0067, 0) > 0);
  assert.equal(wordReset(PAINT_END + .0067, 1), 0);
  assert(Math.abs(wordReset(PAINT_END + .035, 0) - .5) < 1e-9);
  assert.equal(wordReset(PAINT_END + .07, 0), 1);
  let previous = 0;
  for (let i = 0; i <= 1000; i++) {
    const value = wordReset(PAINT_END + .07 * i / 1000, 0);
    assert(value >= previous && value <= 1);
    previous = value;
  }
});

test('hero colors propagate spatially and do not all change at a cycle boundary', () => {
  for (let initial = 0; initial < PALETTE.length; initial++) {
    assert.equal(waveColor(2.9, 80, 320, initial), initial);
    assert.equal(waveColor(3.1, 80, 320, initial), (initial + 1) % 4);
    assert.equal(waveColor(3.1, 1280, 90, initial), initial);
    assert.equal(waveColor(5.5, 1280, 90, initial), (initial + 1) % 4);
    assert.equal(waveColor(8.6, 1280, 90, initial), (initial + 2) % 4);
    assert.equal(waveColor(8.6, 80, 320, initial), (initial + 1) % 4);
  }
  for (const item of buildMotifs()) {
    assert.equal(waveColor(8.49999, item.x, item.y, item.color), waveColor(8.5, item.x, item.y, item.color));
    assert(PALETTE[waveColor(100, item.x, item.y, item.color)]);
  }
});

test('artwork is deterministic, richly varied and uses isolated wordmark masks', () => {
  assert.equal(DEFAULT_ARTWORK.id, 'garden-bloom', 'Use the selected second mixed direction');
  assert.deepEqual(buildMotifs(), buildMotifs());
  const motifs = buildMotifs();
  assert.equal(new Set(motifs.map(item => item.variant)).size, 8);
  assert.equal(new Set(motifs.map(item => item.color)).size, 4);
  const one = patternMarkup('Kale Riders', true);
  const two = patternMarkup('Kale Riders', true);
  assert.equal((one.match(/>Kale Riders<\/text>/g) || []).length, 2, 'The closing label must drive both the clip and its outline');
  assert.equal(one.replace(/member-letter-\d+/g, 'scene'), two.replace(/member-letter-\d+/g, 'scene'));
  const ids = [...(one + two).matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'Separate scenes cannot collide in SVG IDs');
  assert.equal((one.match(/data-pattern-motif /g) || []).length, motifs.length);
  for (const markup of [one, patternMarkup('CRYPTO', false)]) {
    assert(markup.includes('data-pattern-artwork="garden-bloom"'), 'Both main wordmarks use the selected artwork');
    for (let variant = 0; variant < 8; variant++) assert(markup.includes(DEFAULT_ARTWORK.motif(variant)));
  }
});

class Element extends EventTarget {
  constructor(dataset = {}) {
    super(); this.dataset = dataset; this.style = {}; this.attributes = new Map();
    this.classList = { add() {}, toggle() {}, contains: () => false };
    this.clientWidth = 1400; this.clientHeight = 450; this.offsetLeft = this.offsetTop = 0;
  }
  setAttribute(key, value) { this.attributes.set(key, String(value)); }
  querySelector(key) { return this.single?.[key] || null; }
  querySelectorAll(key) { return this.multiple?.[key] || []; }
  getBoundingClientRect() { return { left: 0, top: 0 }; }
}

// Minimal scene with a real effect-bearing motif, without flight actors. This
// exercises the actual rendering/events while isolating decorative effects.
function effectsFixture({ reduced = false, closing = false } = {}) {
  const document = new Element(); document.hidden = false; document.documentElement = new Element();
  const window = new EventTarget();
  const media = new EventTarget(); media.matches = reduced;
  const scene = new Element({ flightScene: closing ? 'closing' : 'hero' });
  const pattern = new Element({ patternText: closing ? 'Kale Riders' : 'CRYPTO' });
  const motif = new Element({ x: '400', y: '220', size: '.8', angle: '0', color: '0', arrival: '5' });
  const motion = new Element(); motif.single = { '[data-motif-motion]': motion };
  const color = new Element();
  pattern.single = { '[data-pattern-color]': color, '[data-pattern-drift]': new Element() };
  pattern.multiple = { '[data-pattern-motif]': [motif] };
  scene.single = { '[data-member-pattern]': pattern };
  document.multiple = { '[data-flight-scene]': [scene] };
  let id = 0, now = 0;
  const pending = new Map();
  const globals = { document, window, matchMedia: () => media,
    requestAnimationFrame: callback => { pending.set(++id, callback); return id; },
    cancelAnimationFrame: key => pending.delete(key) };
  const originals = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, globals);
  const cleanup = initMemberArt();
  return { motif, motion, media, color, pending,
    step(frames) { for (let i = 0; i < frames; i++) { now += 16; const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(fn => fn(now)); } },
    pointer(x, y) { const event = new Event('pointermove'); Object.assign(event, { clientX: x, clientY: y, pointerType: 'mouse' }); scene.dispatchEvent(event); },
    leave() { scene.dispatchEvent(new Event('pointerleave')); },
    restore() { cleanup(); for (const [key, descriptor] of originals) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; } },
  };
}

test('pointer displaces motifs with a bounded spring which settles after leaving', () => {
  const f = effectsFixture();
  const displacement = () => f.motion.attributes.get('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/).slice(1).map(Number);
  try {
    f.step(200);
    f.pointer(370, 220);
    f.step(100);
    const active = displacement();
    assert(active[0] > 3 && active[0] < 30, 'Nearby motif moves away from pointer without escaping its tile');
    assert(Math.abs(active[1]) < .01);
    f.leave(); f.step(400);
    assert(Math.hypot(...displacement()) < .1, 'Spring returns to rest');
  } finally { f.restore(); }
});

test('initial reduced motion displays completed paint with no scheduled frames', () => {
  const f = effectsFixture({ reduced: true });
  try {
    assert.equal(f.pending.size, 0);
    assert.equal(f.motif.style.opacity, '1');
    assert(f.motion.attributes.get('transform').includes('scale(0.8)'));
  } finally { f.restore(); }
});

test('live reduced motion completes an unfinished bloom instead of freezing invisible paint', () => {
  const f = effectsFixture();
  try {
    f.step(10);
    assert.equal(f.motif.style.opacity, '0');
    f.media.matches = true;
    f.media.dispatchEvent(new Event('change'));
    assert.equal(f.pending.size, 0);
    assert.equal(f.motif.style.opacity, '1', 'Reduced-motion state reveals all motifs immediately');
  } finally { f.restore(); }
});
