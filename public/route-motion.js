// Keep the existing 860 → 0 SVG dash travel, at twice its former speed.
const cycleMilliseconds = 5000;
const dashRepeat = 864;
const travelDistance = 860;

export function initRouteMotion(board, {
  onStageChange,
  doc = board?.ownerDocument,
  view = doc?.defaultView,
} = {}) {
  if (!board) return () => {};
  const line = board.querySelector('.moving-line');
  const buttons = [...board.querySelectorAll('[data-stage]')];
  if (!line || buttons.length !== 3) return () => {};
  const length = line.getTotalLength();
  if (!(length > 0)) return () => {};

  const previousMarker = board.getAttribute('data-route-motion');
  const previousStyles = ['animation', 'stroke-dashoffset'].map(name => ({
    name, value: line.style.getPropertyValue(name), priority: line.style.getPropertyPriority(name),
  }));
  board.setAttribute('data-route-motion', 'true');
  line.style.setProperty('animation', 'none');

  const reduced = view.matchMedia('(prefers-reduced-motion: reduce)');
  const hovered = new Set();
  const focused = new Set(buttons.filter(button => button === doc.activeElement));
  const listeners = [];
  let paused = doc.documentElement.classList.contains('motion-paused');
  let visible = !view.IntersectionObserver;
  let disposed = false;
  let frame = 0;
  let previousTime = null;
  let selected = Math.max(0, buttons.findIndex(button => button.getAttribute('aria-pressed') === 'true'));
  const stageTime = index => {
    const distance = [4, length / 2, Math.max(4, length - 14)][index];
    return Math.max(0, Math.min(1, (distance - 4) / travelDistance)) * cycleMilliseconds;
  };
  let elapsed = stageTime(selected);

  const canAnimate = () => !disposed && visible && !paused && !reduced.matches
    && !doc.hidden && !hovered.size && !focused.size;
  const draw = automatic => {
    const offset = travelDistance * (1 - elapsed / cycleMilliseconds);
    line.style.setProperty('stroke-dashoffset', String(offset));
    const distance = Math.min(length, (dashRepeat - offset) % dashRepeat);
    const index = distance < length / 4 ? 0 : distance < length * .75 ? 1 : 2;
    if (index !== selected || !automatic) {
      selected = index;
      onStageChange?.(index, { automatic });
    }
  };
  function tick(now) {
    frame = 0;
    if (!canAnimate()) return;
    if (previousTime !== null) elapsed = (elapsed + Math.max(0, now - previousTime)) % cycleMilliseconds;
    previousTime = now;
    draw(true);
    if (canAnimate()) frame = view.requestAnimationFrame(tick);
  }
  function sync() {
    if (canAnimate()) {
      if (!frame) {
        previousTime = null;
        frame = view.requestAnimationFrame(tick);
      }
    } else {
      view.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = null;
    }
  }
  const listen = (target, name, callback) => {
    target.addEventListener(name, callback);
    listeners.push(() => target.removeEventListener(name, callback));
  };
  buttons.forEach((button, index) => {
    listen(button, 'click', () => {
      elapsed = stageTime(index);
      previousTime = null;
      draw(false);
      sync();
    });
    listen(button, 'pointerenter', event => {
      if (event.pointerType === 'touch') return;
      hovered.add(button);
      sync();
    });
    const leave = () => { hovered.delete(button); sync(); };
    listen(button, 'pointerleave', leave);
    listen(button, 'pointercancel', leave);
    listen(button, 'focus', () => { focused.add(button); sync(); });
    listen(button, 'blur', () => { focused.delete(button); sync(); });
  });
  listen(doc, 'kaky:motion', event => { paused = Boolean(event.detail?.paused); sync(); });
  listen(doc, 'visibilitychange', sync);
  listen(reduced, 'change', sync);
  const observer = view.IntersectionObserver ? new view.IntersectionObserver(entries => {
    for (const entry of entries) if (entry.target === board) visible = entry.isIntersecting;
    sync();
  }) : null;
  observer?.observe(board);
  draw(false);
  sync();

  return () => {
    if (disposed) return;
    disposed = true;
    view.cancelAnimationFrame(frame);
    observer?.disconnect();
    listeners.forEach(remove => remove());
    for (const { name, value, priority } of previousStyles) {
      if (value) line.style.setProperty(name, value, priority);
      else line.style.removeProperty(name);
    }
    if (previousMarker === null) board.removeAttribute('data-route-motion');
    else board.setAttribute('data-route-motion', previousMarker);
  };
}
