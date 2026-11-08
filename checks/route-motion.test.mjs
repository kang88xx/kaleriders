import test from 'node:test';
import assert from 'node:assert/strict';
import { initRouteMotion } from '../public/route-motion.js';

class Element extends EventTarget {
  attributes = new Map();
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
}

function fixture({ reduced = false, paused = false, selected = 0, observer = true } = {}) {
  const board = new Element();
  const line = new Element();
  const properties = new Map();
  line.style = {
    getPropertyValue: name => properties.get(name)?.value ?? '',
    getPropertyPriority: name => properties.get(name)?.priority ?? '',
    setProperty: (name, value, priority = '') => properties.set(name, { value, priority }),
    removeProperty: name => properties.delete(name),
  };
  line.getTotalLength = () => 700;
  const buttons = Array.from({ length: 3 }, (_, index) => {
    const button = new Element();
    button.setAttribute('aria-pressed', String(index === selected));
    return button;
  });
  board.querySelector = selector => selector === '.moving-line' ? line : null;
  board.querySelectorAll = selector => selector === '[data-stage]' ? buttons : [];
  const doc = new EventTarget();
  doc.hidden = false;
  doc.activeElement = null;
  doc.documentElement = { classList: { contains: name => name === 'motion-paused' && paused } };
  const media = new EventTarget();
  media.matches = reduced;
  let now = 0;
  let nextFrame = 0;
  const pending = new Map();
  const observers = [];
  const view = {
    matchMedia: () => media,
    requestAnimationFrame(callback) { pending.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: id => pending.delete(id),
  };
  if (observer) view.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
  };
  doc.defaultView = view;
  board.ownerDocument = doc;
  const changes = [];
  const start = () => initRouteMotion(board, {
    onStageChange(index, detail) {
      changes.push({ index, ...detail });
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    },
  });
  const emit = (target, name, values = {}) => {
    const event = new Event(name);
    Object.assign(event, values);
    target.dispatchEvent(event);
  };
  return {
    board, line, buttons, doc, media, pending, observers, changes, start,
    offset: () => Number(line.style.getPropertyValue('stroke-dashoffset')),
    active: () => buttons.findIndex(button => button.getAttribute('aria-pressed') === 'true'),
    step(milliseconds = 0) {
      now += milliseconds;
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach(callback => callback(now));
      assert(pending.size <= 1, 'Only one animation frame is pending');
    },
    visible(value) { observers[0].callback([{ target: board, isIntersecting: value }]); },
    hidden(value) { doc.hidden = value; emit(doc, 'visibilitychange'); },
    motion(value) { emit(doc, 'kaky:motion', { detail: { paused: value } }); },
    reduce(value) { media.matches = value; emit(media, 'change'); },
    event: emit,
  };
}

test('one five-second clock moves the original dash and selects the nearest stage, then wraps', () => {
  const f = fixture();
  const cleanup = f.start();
  assert.equal(f.line.style.getPropertyValue('animation'), 'none');
  assert.equal(f.pending.size, 0, 'Wait for the board to enter the viewport');
  f.visible(true);
  f.step();
  assert.equal(f.offset(), 860);
  assert.equal(f.active(), 0);
  f.step(1250);
  assert.equal(f.offset(), 645);
  assert.equal(f.active(), 1, 'The pulse at distance 219 is nearest the middle stage');
  f.step(1250);
  assert.equal(f.offset(), 430);
  assert.equal(f.active(), 1);
  f.step(1250);
  assert.equal(f.offset(), 215);
  assert.equal(f.active(), 2);
  f.step(750);
  assert.equal(f.active(), 2, 'Keep the final stage while the pulse is beyond the path');
  f.step(500);
  assert.equal(f.offset(), 860);
  assert.equal(f.active(), 0, 'The full loop lasts exactly 5000ms');
  assert.deepEqual(f.changes, [
    { index: 0, automatic: false }, { index: 1, automatic: true },
    { index: 2, automatic: true }, { index: 0, automatic: true },
  ]);
  cleanup();
});

test('manual selection seeks the pulse and hover/focus jointly preserve reading state', () => {
  const f = fixture();
  const cleanup = f.start();
  f.visible(true);
  f.step();
  f.event(f.buttons[1], 'pointerenter', { pointerType: 'mouse' });
  f.event(f.buttons[1], 'focus');
  f.event(f.buttons[1], 'click');
  assert.equal(f.pending.size, 0);
  assert.equal(f.offset(), 514, 'The middle selection moves the pulse to path distance 350');
  assert.equal(f.active(), 1);
  assert.deepEqual(f.changes.at(-1), { index: 1, automatic: false });
  f.step(20000);
  f.event(f.buttons[1], 'pointerleave');
  assert.equal(f.pending.size, 0, 'Focus continues to pause after hover leaves');
  f.event(f.buttons[1], 'blur');
  f.step(10000);
  assert.equal(f.offset(), 514, 'Resume does not count time spent paused');
  f.step(500);
  assert(Math.abs(f.offset() - 428) < 1e-9);
  f.event(f.buttons[2], 'click');
  assert(Math.abs(f.offset() - 178) < 1e-9);
  assert.equal(f.active(), 2);
  f.event(f.buttons[2], 'click');
  assert.deepEqual(f.changes.slice(-2), [{ index: 2, automatic: false }, { index: 2, automatic: false }]);
  cleanup();
});

test('touch pointer entry does not create a stuck hover pause', () => {
  const f = fixture();
  const cleanup = f.start();
  f.visible(true);
  f.event(f.buttons[0], 'pointerenter', { pointerType: 'touch' });
  assert.equal(f.pending.size, 1);
  f.step();
  f.step(1000);
  assert.equal(f.offset(), 688);
  f.event(f.buttons[0], 'pointerenter', { pointerType: 'pen' });
  assert.equal(f.pending.size, 0);
  f.event(f.buttons[0], 'pointercancel');
  assert.equal(f.pending.size, 1);
  cleanup();
});

test('initial and live reduced motion stop autoplay while preserving manual choices', () => {
  const f = fixture({ reduced: true, selected: 2 });
  const cleanup = f.start();
  f.visible(true);
  assert.equal(f.active(), 2);
  assert.equal(f.pending.size, 0);
  f.event(f.buttons[0], 'click');
  assert.equal(f.active(), 0);
  assert.equal(f.offset(), 860);
  f.reduce(false);
  f.step();
  f.step(1000);
  assert.equal(f.offset(), 688);
  f.reduce(true);
  assert.equal(f.pending.size, 0);
  f.step(10000);
  assert.equal(f.offset(), 688);
  f.event(f.buttons[1], 'click');
  assert.equal(f.active(), 1);
  assert.equal(f.pending.size, 0);
  cleanup();
});

test('initial page pause and repeated visibility events preserve one clock without resume jumps', () => {
  const f = fixture({ paused: true });
  const cleanup = f.start();
  f.visible(true);
  assert.equal(f.pending.size, 0);
  f.motion(false);
  f.visible(true);
  f.visible(true);
  assert.equal(f.pending.size, 1);
  f.step();
  f.step(1000);
  for (const [stop, resume] of [
    [() => f.visible(false), () => f.visible(true)],
    [() => f.hidden(true), () => f.hidden(false)],
    [() => f.motion(true), () => f.motion(false)],
  ]) {
    const offset = f.offset();
    stop();
    assert.equal(f.pending.size, 0);
    f.step(30000);
    resume();
    f.step(1000);
    assert.equal(f.offset(), offset);
    f.step(100);
    assert.notEqual(f.offset(), offset);
  }
  cleanup();
});

test('cleanup restores owned styles/marker and detaches all event sources', () => {
  const f = fixture();
  f.board.setAttribute('data-route-motion', 'previous');
  f.line.style.setProperty('animation', 'travel 10s linear infinite', 'important');
  f.line.style.setProperty('stroke-dashoffset', '123');
  const cleanup = f.start();
  f.visible(true);
  assert.equal(f.pending.size, 1);
  cleanup();
  cleanup();
  assert.equal(f.pending.size, 0);
  assert(f.observers[0].disconnected);
  assert.equal(f.board.getAttribute('data-route-motion'), 'previous');
  assert.equal(f.line.style.getPropertyValue('animation'), 'travel 10s linear infinite');
  assert.equal(f.line.style.getPropertyPriority('animation'), 'important');
  assert.equal(f.offset(), 123);
  const count = f.changes.length;
  f.event(f.buttons[2], 'click');
  f.event(f.buttons[0], 'pointerenter', { pointerType: 'mouse' });
  f.event(f.buttons[0], 'pointerleave');
  f.event(f.buttons[0], 'focus');
  f.event(f.buttons[0], 'blur');
  f.motion(false);
  f.hidden(false);
  f.reduce(false);
  f.visible(true);
  f.step(10000);
  assert.equal(f.changes.length, count);
  assert.equal(f.offset(), 123);
  assert.equal(f.pending.size, 0);
});

test('missing board is a no-op and unsupported intersection observation still animates', () => {
  initRouteMotion(null)();
  const f = fixture({ observer: false });
  const cleanup = f.start();
  assert.equal(f.pending.size, 1);
  f.step();
  f.step(2500);
  assert.equal(f.active(), 1);
  cleanup();
  assert.equal(f.board.getAttribute('data-route-motion'), null);
  assert.equal(f.line.style.getPropertyValue('animation'), '');
  assert.equal(f.line.style.getPropertyValue('stroke-dashoffset'), '');
});
