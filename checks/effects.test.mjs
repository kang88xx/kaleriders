import test from 'node:test';
import assert from 'node:assert/strict';
import { PALETTE, PAINT_LOOP, footerFrame, lightPoint, paintArrival, bloomProgress, waveColor, buildMotifs, patternMarkup } from '../public/pattern-art.js';
import { initMemberArt } from '../public/member-art.js';

test('paint arrives along both light paths progressively rather than appearing together', () => {
  for (const side of [0, 1]) {
    const arrivals = [0, .2, .4, .6, .8, 1].map(progress => {
      const point = lightPoint(side, progress);
      const arrival = paintArrival(point.x, point.y);
      assert(Math.abs(arrival - (.45 + progress * 10.4)) < .12, 'A path point paints near its beam arrival');
      return arrival;
    });
    assert(arrivals.every((value, index) => index === 0 || value > arrivals[index - 1]));
  }
  const motifs = buildMotifs();
  for (const item of motifs) assert(item.arrival >= .45 && item.arrival <= 11.6);
  const counts = [0, 3, 6, 9, 12].map(time => motifs.filter(item => bloomProgress(time, item.arrival).opacity === 1).length);
  assert.equal(counts[0], 0);
  assert.equal(counts.at(-1), motifs.length);
  assert(counts.every((count, index) => index === 0 || count > counts[index - 1]));
});

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

test('paint clears through a bounded fade and is visually continuous across loop reset', () => {
  const motifs = buildMotifs();
  let lastReset = 0;
  for (let i = 0; i <= 1000; i++) {
    const time = 13.2 + i / 1000 * 2.79999;
    const frame = footerFrame(time);
    assert(frame.reset >= lastReset && frame.reset <= 1);
    lastReset = frame.reset;
  }
  for (const time of [-32.5, 0, 3, 13, 15.999, 16, 99]) {
    const frame = footerFrame(time);
    assert(frame.time >= 0 && frame.time < PAINT_LOOP);
    assert(frame.paint >= 0 && frame.paint <= 1);
    assert(frame.reset >= 0 && frame.reset <= 1);
  }
  const effectiveOpacity = (seconds, item) => {
    const frame = footerFrame(seconds);
    return bloomProgress(frame.time, item.arrival).opacity * (1 - frame.reset);
  };
  for (const item of motifs) {
    assert.equal(effectiveOpacity(12, item), 1, 'Completed paint stays visible before reset');
    assert(effectiveOpacity(15.99, item) < .001);
    assert.equal(effectiveOpacity(16, item), 0);
    assert(Math.abs(effectiveOpacity(15.999, item) - effectiveOpacity(16.001, item)) < .00001);
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

test('artwork is deterministic, richly varied and has exactly two footer lighting layers', () => {
  assert.deepEqual(buildMotifs(), buildMotifs());
  const motifs = buildMotifs();
  assert.equal(new Set(motifs.map(item => item.variant)).size, 8);
  assert.equal(new Set(motifs.map(item => item.color)).size, 4);
  const one = patternMarkup('Start today', true);
  const two = patternMarkup('Start today', true);
  assert.equal(one.replace(/member-letter-\d+/g, 'scene'), two.replace(/member-letter-\d+/g, 'scene'));
  const ids = [...(one + two).matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'Separate scenes cannot collide in SVG IDs');
  for (const selector of ['data-light-atmosphere', 'data-light-beam ', 'data-beam-gradient', 'data-light-halo', 'data-light-spot']) {
    assert.equal(one.split(selector).length - 1, 2, selector);
  }
  assert(!patternMarkup('CRYPTO', false).includes('data-light-atmosphere'));
  assert.equal((one.match(/data-pattern-motif /g) || []).length, motifs.length);
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
  const pattern = new Element({ patternText: closing ? 'Start today' : 'CRYPTO' });
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
  const f = effectsFixture({ reduced: true, closing: true });
  try {
    assert.equal(f.pending.size, 0);
    assert.equal(f.motif.style.opacity, '1');
    assert.equal(f.color.style.opacity, '1');
    assert(f.motion.attributes.get('transform').includes('scale(0.8)'));
  } finally { f.restore(); }
});

test('live reduced motion completes an unfinished bloom instead of freezing invisible paint', () => {
  const f = effectsFixture({ closing: true });
  try {
    f.step(10);
    assert.equal(f.motif.style.opacity, '0');
    f.media.matches = true;
    f.media.dispatchEvent(new Event('change'));
    assert.equal(f.pending.size, 0);
    assert.equal(f.motif.style.opacity, '1', 'Reduced-motion state reveals all motifs immediately');
    assert.equal(f.color.style.opacity, '1');
  } finally { f.restore(); }
});
