import test from 'node:test';
import assert from 'node:assert/strict';
import { initFaq } from '../public/faq.js';

class Summary extends EventTarget {
  getBoundingClientRect() { return { height: 60 }; }
  click() {
    const event = new Event('click', { cancelable: true });
    this.dispatchEvent(event);
    return event.defaultPrevented;
  }
}

class Details {
  constructor(open = false) {
    this.open = open;
    this.style = { overflow: '' };
    this.summary = new Summary();
    this.animations = [];
    this.active = null;
  }
  querySelector() { return this.summary; }
  getBoundingClientRect() { return { height: this.active?.height ?? (this.open ? 201 : 61) }; }
  get offsetHeight() { return this.getBoundingClientRect().height; }
  get clientHeight() { return this.offsetHeight - 1; }
  animate(frames, options) {
    const animation = {
      frames, options, height: parseFloat(frames[0].height), cancelled: false,
      cancel: () => { animation.cancelled = true; if (this.active === animation) this.active = null; },
      finish: () => { animation.height = parseFloat(frames[1].height); animation.onfinish?.(); },
    };
    this.animations.push(animation);
    this.active = animation;
    return animation;
  }
}

function fixture({ reduced = false, animated = true, initial = [false, false, false] } = {}) {
  const details = initial.map(open => new Details(open));
  if (!animated) details.forEach(item => { item.animate = undefined; });
  const doc = new EventTarget();
  doc.querySelectorAll = () => details;
  const view = new EventTarget();
  const media = new EventTarget();
  media.matches = reduced;
  view.matchMedia = () => media;
  const cleanup = initFaq(doc, view);
  return { details, doc, view, media, cleanup };
}

const finish = (...items) => items.forEach(item => item.active?.finish());

test('opens and closes the same native details with measured height animations', () => {
  const { details: [item] } = fixture();
  assert.equal(item.summary.click(), true);
  assert.equal(item.open, true);
  assert.deepEqual(item.active.frames, [{ height: '61px' }, { height: '201px' }]);
  assert.equal(item.style.overflow, 'hidden');
  finish(item);
  assert.equal(item.open, true);
  assert.equal(item.style.overflow, '');
  item.summary.click();
  assert.equal(item.open, true, 'answer remains rendered throughout the closing animation');
  assert.deepEqual(item.active.frames, [{ height: '201px' }, { height: '61px' }]);
  finish(item);
  assert.equal(item.open, false);
  assert.equal(item.active, null);
});

test('opening a different question closes the previous question, and both can finish closed', () => {
  const { details: [a, b, c] } = fixture();
  a.summary.click(); finish(a);
  b.summary.click();
  assert.equal(a.active.frames[1].height, '61px');
  finish(a, b);
  assert.deepEqual([a.open, b.open, c.open], [false, true, false]);
  b.summary.click(); finish(b);
  assert.deepEqual([a.open, b.open, c.open], [false, false, false]);
});

test('rapid reversal starts at the current rendered height and stale finishes cannot change the target', () => {
  const { details: [item] } = fixture();
  item.summary.click();
  const opening = item.active;
  opening.height = 110;
  item.summary.click();
  const closing = item.active;
  assert.equal(opening.cancelled, true);
  assert.equal(closing.frames[0].height, '110px');
  closing.height = 90;
  item.summary.click();
  const reopening = item.active;
  assert.equal(reopening.frames[0].height, '90px');
  opening.onfinish(); closing.onfinish();
  assert.equal(item.active, reopening);
  finish(item);
  assert.equal(item.open, true);
  assert.equal(item.style.overflow, '');
});

test('rapid question changes leave only the latest choice open', () => {
  const { details: [a, b, c] } = fixture();
  a.summary.click(); b.summary.click(); c.summary.click(); a.summary.click();
  finish(c, a, b);
  assert.deepEqual([a.open, b.open, c.open], [true, false, false]);
});

for (const options of [{ reduced: true }, { animated: false }]) {
  test(`instant mode retains accordion semantics: ${JSON.stringify(options)}`, () => {
    const { details: [a, b] } = fixture(options);
    a.summary.click();
    assert.equal(a.open, true);
    b.summary.click();
    assert.deepEqual([a.open, b.open], [false, true]);
    b.summary.click();
    assert.equal(b.open, false);
    assert.equal(a.animations.length + b.animations.length, 0);
  });
}

test('live reduced motion settles outstanding transitions and stops future animation', () => {
  const { details: [a, b], media } = fixture();
  a.summary.click(); b.summary.click();
  media.matches = true;
  media.dispatchEvent(new Event('change'));
  assert.deepEqual([a.open, b.open], [false, true]);
  assert.equal(a.active, null);
  assert.equal(b.active, null);
  b.summary.click();
  assert.equal(b.open, false);
  assert.equal(b.active, null);
});

for (const [target, event] of [['view', 'resize'], ['doc', 'languagechange']]) {
  test(`${event} clears stale animation height without losing the intended open panel`, () => {
    const f = fixture();
    f.details[0].summary.click();
    f[target].dispatchEvent(new Event(event));
    assert.equal(f.details[0].open, true);
    assert.equal(f.details[0].active, null);
    assert.equal(f.details[0].style.overflow, '');
  });
}

test('normalizes multiple initially open panels and cleanup restores native click ownership', () => {
  const f = fixture({ initial: [true, true, false] });
  assert.deepEqual(f.details.map(item => item.open), [true, false, false]);
  f.details[1].summary.click();
  f.cleanup();
  assert.deepEqual(f.details.map(item => item.open), [false, true, false]);
  assert.ok(f.details.every(item => item.active === null && item.style.overflow === ''));
  assert.equal(f.details[1].summary.click(), false, 'native summary default is no longer intercepted');
  f.media.matches = true;
  f.media.dispatchEvent(new Event('change'));
  assert.deepEqual(f.details.map(item => item.open), [false, true, false]);
});
