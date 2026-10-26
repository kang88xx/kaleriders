import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleFlight, FLIGHT_ROUTES, flightDepth, initMemberArt } from '../public/member-art.js';
import { MIXED_BOTANICAL_VARIANTS } from '../public/mixed-botanical-art.js';

for (const [index, route] of FLIGHT_ROUTES.entries()) {
  test(`route ${index}: closed, smooth, bounded and travels across both axes`, () => {
    const samples = Array.from({ length: 4001 }, (_, i) => sampleFlight(route, i / 4000));
    assert.deepEqual(samples[0], samples.at(-1));
    assert.deepEqual(sampleFlight(route, -.25), sampleFlight(route, .75));
    const epsilon = 1e-5;
    const before = sampleFlight(route, 1 - epsilon);
    const after = sampleFlight(route, epsilon);
    const seam = samples[0];
    for (const axis of ['x', 'y']) {
      const values = samples.map(point => point[axis]);
      assert(values.every(value => Number.isFinite(value) && value >= 0 && value <= 1), `${axis} stays normalized`);
      assert(Math.max(...values) - Math.min(...values) > .6, `${axis} travels over 60% of scene`);
      assert(Math.abs(before[axis] - after[axis]) < .001, `${axis} has no seam jump`);
      const incoming = (seam[axis] - before[axis]) / epsilon;
      const outgoing = (after[axis] - seam[axis]) / epsilon;
      assert(Math.abs(incoming - outgoing) < .01, `${axis} has a continuous seam tangent`);
    }
    const depths = new Set(samples.map((_, i) => flightDepth(i / 4000, index)));
    assert.deepEqual([...depths].sort(), [2, 4], 'Each route passes behind and in front');
  });
}

// This fixture models layout measurements and events only, not the flight math.
// Position assertions compare observable transforms across real engine ticks.
class Element extends EventTarget {
  constructor(dataset = {}) {
    super();
    this.dataset = dataset;
    this.style = {};
    this.attributes = new Map();
    this.classes = new Set();
    this.classList = { add: name => this.classes.add(name), contains: name => this.classes.has(name) };
    this.children = [];
    this.offsetLeft = this.offsetTop = 0;
    this.offsetWidth = 100;
    this.offsetHeight = 80;
  }
  setAttribute(key, value) { this.attributes.set(key, String(value)); }
  querySelector(selector) { return this.selectors?.[selector] ?? null; }
  querySelectorAll(selector) { return this.collections?.[selector] ?? []; }
  matches(selector) { return selector === 'a' && this.isAnchor; }
  getBoundingClientRect() { return { left: 30, top: 50, width: this.clientWidth, height: this.clientHeight }; }
  setPointerCapture(id) { this.capturedPointer = id; }
  hasPointerCapture(id) { return this.capturedPointer === id; }
  releasePointerCapture() { this.capturedPointer = null; }
  focus() {}
  appendChild(element) { this.children.push(element); element.parent = this; }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); }
}

class CanvasContext {
  constructor(canvas) {
    this.canvas = canvas; this.calls = []; this.stack = [];
    this.matrix = [1, 0, 0, 1, 0, 0]; this.globalCompositeOperation = 'source-over'; this.globalAlpha = 1;
  }
  save() { this.stack.push([this.matrix.slice(), this.globalCompositeOperation, this.globalAlpha]); }
  restore() { [this.matrix, this.globalCompositeOperation, this.globalAlpha] = this.stack.pop(); }
  setTransform(...args) {
    this.matrix = args.length === 1 ? ['a','b','c','d','e','f'].map(key => args[0][key]) : args;
  }
  getTransform() { return Object.fromEntries(['a','b','c','d','e','f'].map((key, index) => [key, this.matrix[index]])); }
  multiply([a,b,c,d,e,f]) {
    const [u,v,w,x,y,z] = this.matrix;
    this.matrix = [u*a+w*b,v*a+x*b,u*c+w*d,v*c+x*d,u*e+w*f+y,v*e+x*f+z];
  }
  translate(x,y) { this.multiply([1,0,0,1,x,y]); }
  scale(x,y) { this.multiply([x,0,0,y,0,0]); }
  rotate(angle) { const c=Math.cos(angle), s=Math.sin(angle); this.multiply([c,s,-s,c,0,0]); }
  measureText(text) { return { width: text === 'Kale' ? 520 : 780 }; }
  clearRect() { this.calls = []; }
  drawImage(image, ...args) {
    assert(args.every(Number.isFinite), 'Drawing coordinates stay finite');
    this.calls.push({ image, args, matrix: this.matrix.slice(), alpha: this.globalAlpha, composite: this.globalCompositeOperation, beam: image.context?.gradient?.slice() });
    if (image.kind === 'character') this.canvas.kind = 'character';
  }
  createLinearGradient(...args) { assert(args.every(Number.isFinite)); this.gradient = args; return { addColorStop() {} }; }
  beginPath() {} closePath() {} moveTo() {} lineTo() {} arc() {} stroke() {} fill() {} fillRect() {}
}

async function fixture({ reduced = false, decodeFailure = false } = {}) {
  const document = new Element();
  document.documentElement = new Element();
  document.hidden = false;
  const canvases = [];
  document.createElement = tag => {
    assert.equal(tag, 'canvas');
    const canvas = new Element();
    canvas.width = 300; canvas.height = 150;
    canvas.context = new CanvasContext(canvas);
    canvas.getContext = () => canvas.context;
    canvases.push(canvas);
    return canvas;
  };
  class Image {
    complete = true;
    naturalWidth = 380;
    decode() { return decodeFailure ? Promise.reject(new Error('Artwork decode failed')) : Promise.resolve(); }
    set src(value) {
      this.url = value;
      const svg = decodeURIComponent(value.split(',')[1]);
      this.kind = svg.includes('character-body') ? 'character' : svg.includes('<text') ? 'mask' : 'flower';
    }
  }
  const window = new EventTarget();
  const media = new EventTarget();
  media.matches = reduced;
  const pending = new Map();
  let nextFrame = 0;
  let now = 0;
  const observers = [];
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  window.IntersectionObserver = IntersectionObserver;
  const scenes = ['hero', 'closing'].map(kind => {
    const scene = new Element({ flightScene: kind });
    scene.clientWidth = 1200;
    scene.clientHeight = 450;
    const pattern = new Element({ patternText: kind === 'hero' ? 'CRYPTO' : 'Kale Riders' });
    pattern.clientWidth = 1200;
    pattern.clientHeight = 400;
    pattern.selectors = { '[data-pattern-drift]': new Element(), '[data-pattern-color]': new Element() };
    pattern.collections = {
      '[data-pattern-spin]': [new Element({ angle: '23' })],

    };
    const actors = Array.from({ length: kind === 'hero' ? 3 : 2 }, () => {
      const actor = new Element();
      actor.isAnchor = kind === 'hero';
      actor.selectors = { '.member-avatar': new Element() };
      if (kind === 'closing') {
        const torch = new Element();
        torch.offsetWidth = 25;
        torch.offsetHeight = 12;
        torch.offsetLeft = 72;
        torch.offsetTop = 51.6;
        actor.selectors['.character-torch'] = torch;
      }
      return actor;
    });
    scene.selectors = { '[data-member-pattern]': pattern };
    scene.collections = { '[data-flight-member]': actors };
    return scene;
  });
  document.collections = { '[data-member-avatar]': [], '[data-flight-scene]': scenes };
  const errors = [];
  const globals = { document, window, Image, IntersectionObserver, console: { ...console, error: (...args) => errors.push(args) }, matchMedia: () => media,
    requestAnimationFrame: callback => { pending.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: id => pending.delete(id),
  };
  const originals = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, globals);
  const cleanup = initMemberArt();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(scenes[1].classes.has('spray-ready'), !decodeFailure, 'Fallback is replaced only after successful decoding');
  const actor = (scene = 0, index = 0) => scenes[scene].collections['[data-flight-member]'][index];
  return {
    scenes, actor, document, window, media, observers, pending, canvases, errors,
    canvas: canvases[0],
    step(count = 1) {
      for (let i = 0; i < count; i++) {
        now += 16;
        const callbacks = [...pending.values()];
        pending.clear();
        callbacks.forEach(callback => callback(now));
        assert(pending.size <= 1, 'At most one animation frame is scheduled');
      }
    },
    motion(paused) {
      const event = new Event('kaky:motion');
      event.detail = { paused };
      document.dispatchEvent(event);
    },
    visibility(index, visible) {
      observers[0].callback([{ target: scenes[index], isIntersecting: visible }]);
    },
    dispose: cleanup,
    restore() {
      cleanup();
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
}

function fire(element, type, properties = {}) {
  const event = new Event(type, { cancelable: true });
  Object.assign(event, { pointerId: 1, pointerType: 'mouse', button: 0, isPrimary: true }, properties);
  element.dispatchEvent(event);
  return event;
}

function pose(element) {
  const [, x, y, angle] = element.style.transform.match(/translate3d\(([-\d.]+)px,([-\d.]+)px,0\) rotate\(([-\d.]+)deg\)/);
  return { x: Number(x), y: Number(y), angle: Number(angle) };
}

test('a dragged closing character stays where placed while the other character and lights keep moving', async () => {
  const f = await fixture();
  try {
    f.step(100);
    const actor = f.actor(1), before = pose(actor);
    const start = { clientX: before.x + 60, clientY: before.y + 80 };
    fire(actor, 'pointerdown', start);
    assert.equal(actor.capturedPointer, 1);
    const beforeBeam = f.canvas.context.calls.find(call => call.composite === 'overlay').beam;
    fire(actor, 'pointermove', { clientX: start.clientX + 100, clientY: start.clientY + 40 });
    const dragged = pose(actor);
    assert(Math.abs(dragged.x - before.x - 100) < .02);
    assert(Math.abs(dragged.y - before.y - 40) < .02);
    const movedBeam = f.canvas.context.calls.find(call => call.composite === 'overlay').beam;
    const scale = 1200 / 1400;
    assert(Math.abs((movedBeam[0] - beforeBeam[0]) * scale - 100) < .02, 'The drawn spray origin follows horizontal dragging');
    assert(Math.abs((movedBeam[1] - beforeBeam[1]) * scale - 40) < .02, 'The drawn spray origin follows vertical dragging');
    fire(actor, 'pointerup');
    const other = f.actor(1, 1).style.transform;
    f.step(100);
    assert.deepEqual(pose(actor), dragged, 'Drop remains pinned across animation frames');
    assert.notEqual(f.actor(1, 1).style.transform, other);
    assert.equal(actor.capturedPointer, null);
    fire(actor, 'dblclick');
    assert.equal(actor.attributes.get('data-placed'), 'false');
    const automatic = actor.style.transform;
    f.step(10);
    assert.notEqual(actor.style.transform, automatic);
  } finally { f.restore(); }
});

test('touch placement works with reduced motion and stays inside the resized stage', async () => {
  const f = await fixture({ reduced: true });
  try {
    const actor = f.actor(1), before = pose(actor), scene = f.scenes[1];
    fire(actor, 'pointerdown', { pointerType: 'touch', clientX: before.x + 60, clientY: before.y + 80 });
    fire(actor, 'pointermove', { pointerType: 'touch', clientX: 9999, clientY: 9999 });
    fire(actor, 'pointerup', { pointerType: 'touch' });
    scene.clientWidth = 360;
    scene.clientHeight = 205;
    f.window.dispatchEvent(new Event('resize'));
    const p = pose(actor), a = p.angle * Math.PI / 180;
    const width = parseFloat(actor.style.width), height = parseFloat(actor.style.height);
    for (const [x, y] of [[0, 0], [width, 0], [0, height], [width, height]]) {
      const screenX = p.x + x * Math.cos(a) - y * Math.sin(a);
      const screenY = p.y + x * Math.sin(a) + y * Math.cos(a);
      assert(screenX >= 11.98 && screenX <= scene.clientWidth - 11.98);
      assert(screenY >= 11.98 && screenY <= scene.clientHeight - 11.98);
    }
    assert.equal(f.pending.size, 0, 'Explicit dragging does not start background animation');
    const moved = pose(actor);
    fire(actor, 'keydown', { key: 'ArrowLeft' });
    assert(Math.abs(pose(actor).x - moved.x + 12) < .02);
    fire(actor, 'keydown', { key: 'Escape' });
    assert.equal(actor.attributes.get('data-placed'), 'false');
  } finally { f.restore(); }
});

test('cancelled and foreign pointer gestures do not corrupt placement, and cleanup releases capture', async () => {
  const f = await fixture({ reduced: true });
  try {
    const actor = f.actor(1);
    fire(actor, 'keydown', { key: 'ArrowRight' });
    const placed = actor.style.transform, before = pose(actor);
    const start = { clientX: before.x + 60, clientY: before.y + 80 };
    fire(actor, 'pointerdown', { ...start, button: 2 });
    assert.equal(actor.capturedPointer, undefined);
    fire(actor, 'pointerdown', start);
    fire(actor, 'pointermove', { pointerId: 2, clientX: 9999, clientY: 9999 });
    assert.equal(actor.style.transform, placed);
    fire(actor, 'pointermove', { clientX: start.clientX + 60, clientY: start.clientY + 20 });
    assert.notEqual(actor.style.transform, placed);
    fire(actor, 'pointercancel');
    assert.equal(actor.style.transform, placed);
    fire(actor, 'pointerdown', start);
    fire(actor, 'lostpointercapture');
    assert.equal(actor.attributes.get('data-dragging'), 'false');
    fire(actor, 'pointerdown', start);
    f.dispose();
    assert.equal(actor.capturedPointer, null);
    const disposed = actor.style.transform;
    fire(actor, 'pointermove', { clientX: 900, clientY: 300 });
    assert.equal(actor.style.transform, disposed);
  } finally { f.restore(); }
});

test('pause, reduced motion and document visibility stop the scheduler without resume jumps', async () => {
  const f = await fixture({ reduced: true });
  try {
    assert.equal(f.pending.size, 0);
    const initial = f.actor().style.transform;
    assert(initial, 'Static actor pose is rendered even with reduced motion');
    f.step(30);
    assert.equal(f.actor().style.transform, initial);
    f.media.matches = false;
    f.media.dispatchEvent(new Event('change'));
    f.step(12);
    assert.notEqual(f.actor().style.transform, initial);
    for (const reason of ['manual', 'reduced', 'hidden']) {
      const pose = f.actor().style.transform;
      if (reason === 'manual') f.motion(true);
      if (reason === 'reduced') { f.media.matches = true; f.media.dispatchEvent(new Event('change')); }
      if (reason === 'hidden') { f.document.hidden = true; f.document.dispatchEvent(new Event('visibilitychange')); }
      assert.equal(f.pending.size, 0, `${reason} stops rAF`);
      const stoppedPose = f.actor().style.transform;
      if (reason !== 'reduced') assert.equal(stoppedPose, pose, 'Ordinary pause preserves the exact pose');
      f.step(100);
      assert.equal(f.actor().style.transform, stoppedPose, 'Static reduced-motion pose also stays frozen');
      if (reason === 'manual') f.motion(false);
      if (reason === 'reduced') { f.media.matches = false; f.media.dispatchEvent(new Event('change')); }
      if (reason === 'hidden') { f.document.hidden = false; f.document.dispatchEvent(new Event('visibilitychange')); }
      f.motion(false);
      f.document.dispatchEvent(new Event('visibilitychange'));
      assert.equal(f.pending.size, 1, 'Repeated sync does not duplicate rAF');
      const resumePose = f.actor().style.transform;
      f.step();
      assert.equal(f.actor().style.transform, resumePose, 'First resumed tick preserves previous pose');
      f.step(12);
      assert.notEqual(f.actor().style.transform, resumePose);
    }
  } finally { f.restore(); }
});

test('hover and focus jointly freeze one link while other actors continue', async () => {
  const f = await fixture();
  try {
    f.step(10);
    const actor = f.actor();
    actor.dispatchEvent(new Event('pointerenter'));
    actor.dispatchEvent(new Event('focus'));
    assert.equal(actor.style.zIndex, '6', 'Interactive actor is raised above lettering');
    const frozen = actor.style.transform;
    const other = f.actor(0, 1).style.transform;
    f.step(25);
    assert.equal(actor.style.transform, frozen);
    assert.notEqual(f.actor(0, 1).style.transform, other);
    actor.dispatchEvent(new Event('pointerleave'));
    f.step(25);
    assert.equal(actor.style.transform, frozen, 'Focus retains freeze after pointer leaves');
    actor.dispatchEvent(new Event('blur'));
    assert.equal(actor.style.transform, frozen, 'Blur does not jump to the global clock');
    f.step(2);
    assert.notEqual(actor.style.transform, frozen);
    actor.dispatchEvent(new Event('pointerenter'));
    actor.dispatchEvent(new Event('focus'));
    actor.dispatchEvent(new Event('blur'));
    const hovered = actor.style.transform;
    f.step(20);
    assert.equal(actor.style.transform, hovered, 'Hover retains freeze after focus leaves');
  } finally { f.restore(); }
});

test('offscreen scenes preserve their clock while the visible footer continues', async () => {
  const f = await fixture();
  try {
    f.step(10);
    f.visibility(0, false);
    const hiddenPose = f.actor().style.transform;
    const footerPose = f.actor(1).style.transform;
    f.step(50);
    assert.equal(f.actor().style.transform, hiddenPose);
    assert.notEqual(f.actor(1).style.transform, footerPose);
    f.visibility(1, false);
    assert.equal(f.pending.size, 0, 'All scenes offscreen stop rAF');
    f.step(100);
    f.visibility(0, true);
    f.step();
    assert.equal(f.actor().style.transform, hiddenPose, 'Hidden scene resumes at its own position');
    f.step(5);
    assert.notEqual(f.actor().style.transform, hiddenPose);
  } finally { f.restore(); }
});

test('cleanup cancels frames, disconnects observers and removes interaction listeners', async () => {
  const f = await fixture();
  try {
    f.step(5);
    const pose = { ...f.actor().style };
    f.dispose();
    assert.equal(f.pending.size, 0);
    assert(f.observers.every(observer => observer.disconnected));
    f.actor().dispatchEvent(new Event('focus'));
    f.motion(false);
    f.media.dispatchEvent(new Event('change'));
    f.document.dispatchEvent(new Event('visibilitychange'));
    f.window.dispatchEvent(new Event('resize'));
    f.step(10);
    assert.equal(f.pending.size, 0);
    assert.deepEqual(f.actor().style, pose);
  } finally { f.restore(); }
});


test('hero layer changes happen near transparent poses and focused links remain fully visible', async () => {
  const f = await fixture();
  try {
    const actors = f.scenes[0].collections['[data-flight-member]'];
    const previous = actors.map(actor => ({ ...actor.style }));
    const crossings = actors.map(() => 0);
    let focusChecked = false;
    for (let frame = 0; frame < 3100; frame++) {
      f.step();
      actors.forEach((actor, index) => {
        const opacity = Number(actor.style.opacity);
        assert(opacity >= 0 && opacity <= 1);
        if (actor.style.zIndex !== previous[index].zIndex) {
          crossings[index]++;
          assert(opacity < .15 && Number(previous[index].opacity) < .15, 'Both sides of layer crossing are visually softened');
          assert(actor.style.transform.includes('scale(0.94'), 'Crossing also recedes slightly');
          if (!focusChecked) {
            actor.dispatchEvent(new Event('focus'));
            assert.equal(actor.style.opacity, '1');
            assert.equal(actor.style.zIndex, '6');
            assert(actor.style.transform.endsWith('scale(1.000)'));
            const focusedPose = actor.style.transform;
            f.step(20);
            assert.equal(actor.style.transform, focusedPose);
            assert.equal(actor.style.opacity, '1');
            actor.dispatchEvent(new Event('blur'));
            focusChecked = true;
          }
        }
        previous[index] = { ...actor.style };
      });
    }
    assert(focusChecked);
    assert(crossings.every(count => count >= 4), 'Each actor completes multiple softened crossings');
  } finally { f.restore(); }
});

test('hero pattern cadence is throttled independently of per-frame actors', async () => {
  const f = await fixture();
  try {
    f.step();
    const pattern = f.scenes[0].querySelector('[data-member-pattern]');
    const drift = pattern.querySelector('[data-pattern-drift]');
    const spin = pattern.collections['[data-pattern-spin]'][0];
    let oldPattern = drift.attributes.get('transform');
    let oldSpin = spin.attributes.get('transform');
    let oldActor = f.actor(0).style.transform;
    let updates = 0;
    for (let frame = 0; frame < 120; frame++) {
      f.step();
      const current = drift.attributes.get('transform');
      if (current !== oldPattern) {
        updates++;
        assert.notEqual(spin.attributes.get('transform'), oldSpin);
      } else assert.equal(spin.attributes.get('transform'), oldSpin);
      assert.notEqual(f.actor(0).style.transform, oldActor, 'Actor continues on every display tick');
      oldPattern = current;
      oldSpin = spin.attributes.get('transform');
      oldActor = f.actor(0).style.transform;
    }
    assert(updates >= 30 && updates <= 47, 'Pattern runs at a bounded lower cadence over 1.92s');
  } finally { f.restore(); }
});




test('footer composites wordmark, spray and existing characters on the same canvas', async () => {
  const f = await fixture();
  try {
    f.step(120);
    const draws = f.canvas.context.calls;
    const overlays = draws.filter(call => call.composite === 'overlay');
    assert.equal(overlays.length, 2, 'Both original spray beams use the wordmark destination');
    assert(draws.indexOf(overlays[0]) >= 2, 'Wordmark is drawn before overlay blending');
    assert.equal(draws.filter(call => call.image.kind === 'character' && call.composite === 'source-over').length, 2);
    const before = f.actor(1).style.transform;
    f.step(20);
    assert.notEqual(f.actor(1).style.transform, before);
    const painted = f.canvas.context.calls.map(call => [call.args, call.matrix, call.composite]);
    f.motion(true); f.step(30);
    assert.deepEqual(f.canvas.context.calls.map(call => [call.args, call.matrix, call.composite]), painted);
  } finally { f.restore(); }
});

test('footer repeats its reference path after exactly fifteen seconds', async () => {
  const f = await fixture();
  try {
    f.step(101);
    const first = [f.actor(1).style.transform, f.actor(1, 1).style.transform];
    // Each simulated display frame advances 16ms. 1,875 frames is two loops.
    f.step(1875);
    assert.deepEqual([f.actor(1).style.transform, f.actor(1, 1).style.transform], first);
  } finally { f.restore(); }
});

test('footer lettering stays fixed throughout painting, reset and replay', async () => {
  const f = await fixture();
  try {
    let sawFade = false;
    for (let frame = 0; frame < 1100; frame++) {
      f.step();
      const [base, ...words] = f.canvas.context.calls.slice(0, 3);
      assert.deepEqual(base.args, [0, 0], 'The blue wordmark remains anchored');
      assert.equal(base.alpha, 1);
      for (const word of words) {
        assert.deepEqual(word.args.slice(0, 4), word.args.slice(4), 'Paint source and destination rectangles never slide');
        if (word.alpha > 0 && word.alpha < 1) sawFade = true;
      }
    }
    assert(sawFade, 'Only the painted pattern fades for the next spray loop');
  } finally { f.restore(); }
});

test('reduced motion reveals the selected flowering garden after image decoding without starting animation', async () => {
  const f = await fixture({ reduced: true });
  try {
    assert.equal(f.pending.size, 0);
    const paint = f.canvases[2].context.calls;
    const garden = MIXED_BOTANICAL_VARIANTS.find(artwork => artwork.id === 'garden-bloom');
    const leaves = paint.filter(call => call.image.kind === 'flower');
    assert.equal(leaves.length, garden.buildMotifs().length);
    const shapes = Array.from({ length: 8 }, (_, index) => garden.motif(index));
    assert(leaves.every(call => shapes.some(shape => decodeURIComponent(call.image.url).includes(shape))), 'Decoded tiles match the selected garden artwork');
    assert.equal(f.canvas.attributes.get('aria-hidden'), 'true');
    const snapshot = f.actor(1).style.transform;
    f.step(40);
    assert.equal(f.actor(1).style.transform, snapshot);
    fire(f.actor(1), 'keydown', { key: 'ArrowRight' });
    assert.notEqual(f.actor(1).style.transform, snapshot, 'Explicit placement remains available');
    assert.equal(f.pending.size, 0);
  } finally { f.restore(); }
});

test('failed artwork decoding keeps the existing SVG fallback and placement controls usable', async () => {
  const f = await fixture({ decodeFailure: true });
  try {
    assert.equal(f.errors.length, 1, 'One preparation error is reported');
    assert.equal(f.scenes[1].classes.has('spray-ready'), false, 'Fallback must not be hidden');
    assert.equal(f.canvas.context.calls.length, 0, 'Undecoded assets are never drawn');
    const previous = f.actor(1).style.transform;
    fire(f.actor(1), 'keydown', { key: 'ArrowRight' });
    assert.notEqual(f.actor(1).style.transform, previous);
    f.step(20);
    assert.equal(f.errors.length, 1, 'Animation does not repeatedly retry broken assets');
  } finally { f.restore(); }
});
