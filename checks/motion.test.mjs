import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleFlight, FLIGHT_ROUTES, flightDepth, initMemberArt } from '../public/member-art.js';

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
    this.classList = { add() {}, contains: () => false };
    this.offsetLeft = this.offsetTop = 0;
    this.offsetWidth = 100;
    this.offsetHeight = 80;
  }
  setAttribute(key, value) { this.attributes.set(key, String(value)); }
  querySelector(selector) { return this.selectors?.[selector] ?? null; }
  querySelectorAll(selector) { return this.collections?.[selector] ?? []; }
  matches(selector) { return selector === 'a' && this.isAnchor; }
}

function fixture({ reduced = false } = {}) {
  const document = new Element();
  document.documentElement = new Element();
  document.hidden = false;
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
    const pattern = new Element({ patternText: kind === 'hero' ? 'CRYPTO' : 'Start today' });
    pattern.clientWidth = 1200;
    pattern.clientHeight = 400;
    pattern.selectors = { '[data-pattern-drift]': new Element() };
    pattern.collections = {
      '[data-pattern-spin]': [new Element({ angle: '23' })],
      '[data-light-beam]': kind === 'closing' ? [new Element(), new Element()] : [],
      '[data-beam-gradient]': kind === 'closing' ? [new Element(), new Element()] : [],
      '[data-light-spot]': kind === 'closing' ? [new Element(), new Element()] : [],
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
  const globals = { document, window, IntersectionObserver, matchMedia: () => media,
    requestAnimationFrame: callback => { pending.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: id => pending.delete(id),
  };
  const originals = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, globals);
  const cleanup = initMemberArt();
  const actor = (scene = 0, index = 0) => scenes[scene].collections['[data-flight-member]'][index];
  return {
    scenes, actor, document, window, media, observers, pending,
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

test('pause, reduced motion and document visibility stop the scheduler without resume jumps', () => {
  const f = fixture({ reduced: true });
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

test('hover and focus jointly freeze one link while other actors continue', () => {
  const f = fixture();
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

test('offscreen scenes preserve their clock; beams follow moving footer actors', () => {
  const f = fixture();
  try {
    f.step(10);
    f.visibility(0, false);
    const hiddenPose = f.actor().style.transform;
    const footerPose = f.actor(1).style.transform;
    const beams = f.scenes[1].querySelector('[data-member-pattern]').collections['[data-light-beam]'];
    const paths = beams.map(beam => beam.attributes.get('d'));
    f.step(50);
    assert.equal(f.actor().style.transform, hiddenPose);
    assert.notEqual(f.actor(1).style.transform, footerPose);
    beams.forEach((beam, i) => {
      assert.notEqual(beam.attributes.get('d'), paths[i]);
      assert(!/NaN|Infinity/.test(beam.attributes.get('d')));
    });
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

test('cleanup cancels frames, disconnects observers and removes interaction listeners', () => {
  const f = fixture();
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

test('footer beam starts at the rendered torch tip and tracks its axis through desktop/mobile letterboxing', () => {
  const f = fixture();
  try {
    const scene = f.scenes[1];
    const pattern = scene.querySelector('[data-member-pattern]');
    for (const mobile of [false, true]) {
      if (mobile) {
        scene.clientWidth = 375;
        scene.clientHeight = 205;
        pattern.clientWidth = 359;
        pattern.clientHeight = 220;
        pattern.offsetLeft = 8;
        pattern.offsetTop = 38;
        scene.collections['[data-flight-member]'].forEach(actor => {
          actor.offsetWidth = actor.offsetHeight = 50;
          const avatar = actor.querySelector('.member-avatar');
          avatar.offsetWidth = avatar.offsetHeight = 50;
          const torch = actor.querySelector('.character-torch');
          torch.offsetWidth = 17;
          torch.offsetHeight = 9;
          torch.offsetLeft = 36;
          torch.offsetTop = 31.5;
        });
        f.window.dispatchEvent(new Event('resize'));
      }
      // Reconstruct the visible nested CSS transforms, independently of route math.
      const scale = Math.min(pattern.clientWidth / 1400, pattern.clientHeight / 450);
      const svgLeft = pattern.offsetLeft + (pattern.clientWidth - 1400 * scale) / 2;
      const svgTop = pattern.offsetTop + (pattern.clientHeight - 450 * scale) / 2;
      for (let sample = 0; sample < 2300; sample++) {
        f.step();
        scene.collections['[data-flight-member]'].forEach((actor, index) => {
          const transform = actor.style.transform.match(/translate3d\(([-\d.]+)px,([-\d.]+)px,0\) rotate\(([-\d.]+)deg\)/);
          assert(transform, 'Actor exposes a valid CSS transform');
          const [, tx, ty, degrees] = transform.map(Number);
          const rotation = degrees * Math.PI / 180;
          const torch = actor.querySelector('.character-torch');
          const torchAngle = Number(torch.style.transform.match(/rotate\(([-\d.e+]+)deg\)/)[1]) * Math.PI / 180;
          const avatar = actor.querySelector('.member-avatar');
          const pivotX = avatar.offsetLeft + torch.offsetLeft;
          const pivotY = avatar.offsetTop + torch.offsetTop + torch.offsetHeight / 2;
          const localTipX = pivotX + Math.cos(torchAngle) * (torch.offsetWidth + 4);
          const localTipY = pivotY + Math.sin(torchAngle) * (torch.offsetWidth + 4);
          const tipX = tx + localTipX * Math.cos(rotation) - localTipY * Math.sin(rotation);
          const tipY = ty + localTipX * Math.sin(rotation) + localTipY * Math.cos(rotation);
          const gradient = pattern.collections['[data-beam-gradient]'][index];
          const beamX = Number(gradient.attributes.get('x1')) * scale + svgLeft;
          const beamY = Number(gradient.attributes.get('y1')) * scale + svgTop;
          const aimX = Number(gradient.attributes.get('x2')) * scale + svgLeft;
          const aimY = Number(gradient.attributes.get('y2')) * scale + svgTop;
          assert([beamX, beamY, aimX, aimY].every(Number.isFinite));
          assert(Math.hypot(beamX - tipX, beamY - tipY) < .025, 'Beam begins at actual nested-transform torch tip');
          const beam = pattern.collections['[data-light-beam]'][index].attributes.get('d');
          const origin = beam.match(/^M([^,]+),([^ ]+)/).slice(1).map(Number);
          assert(Math.abs(origin[0] - Number(gradient.attributes.get('x1'))) < 1e-8);
          assert(Math.abs(origin[1] - Number(gradient.attributes.get('y1'))) < 1e-8);
          const length = Math.hypot(aimX - beamX, aimY - beamY);
          const direction = rotation + torchAngle;
          const cross = Math.abs(Math.cos(direction) * (aimY - beamY) - Math.sin(direction) * (aimX - beamX));
          assert(cross / Math.max(length, 1) < .0001, 'Beam and visible torch are collinear');
          assert(Math.cos(direction) * (aimX - beamX) + Math.sin(direction) * (aimY - beamY) >= 0,
            `Light projects forward from the torch (mobile=${mobile}, actor=${index}, frame=${sample})`);
        });
      }
    }
  } finally { f.restore(); }
});

test('hero layer changes happen near transparent poses and focused links remain fully visible', () => {
  const f = fixture();
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

test('pattern cadence is throttled independently of per-frame actors and beams', () => {
  const f = fixture();
  try {
    f.step();
    const pattern = f.scenes[1].querySelector('[data-member-pattern]');
    const drift = pattern.querySelector('[data-pattern-drift]');
    const spin = pattern.collections['[data-pattern-spin]'][0];
    const beam = pattern.collections['[data-light-beam]'][0];
    let oldPattern = drift.attributes.get('transform');
    let oldSpin = spin.attributes.get('transform');
    let oldActor = f.actor(1).style.transform;
    let oldBeam = beam.attributes.get('d');
    let updates = 0;
    for (let frame = 0; frame < 120; frame++) {
      f.step();
      const current = drift.attributes.get('transform');
      if (current !== oldPattern) {
        updates++;
        assert.notEqual(spin.attributes.get('transform'), oldSpin);
      } else assert.equal(spin.attributes.get('transform'), oldSpin);
      assert.notEqual(f.actor(1).style.transform, oldActor, 'Actor continues on every display tick');
      assert.notEqual(beam.attributes.get('d'), oldBeam, 'Beam continues on every display tick');
      oldPattern = current;
      oldSpin = spin.attributes.get('transform');
      oldActor = f.actor(1).style.transform;
      oldBeam = beam.attributes.get('d');
    }
    assert(updates >= 30 && updates <= 47, 'Pattern runs at a bounded lower cadence over 1.92s');
  } finally { f.restore(); }
});
