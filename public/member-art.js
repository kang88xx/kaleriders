import { avatarMarkup } from './character-art.js';
import { patternMarkup, PALETTE, footerFrame, lightPoint, bloomProgress, waveColor } from './pattern-art.js';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const smooth = value => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t); };

// Closed Catmull–Rom routes, normalized to the available scene bounds.
// Keeping the spline pure makes its continuity and mobile bounds testable.
export function sampleFlight(points, progress) {
  const wrapped = ((progress % 1) + 1) % 1;
  const position = wrapped * points.length;
  const segment = Math.floor(position);
  const t = position - segment;
  const at = offset => points[(segment + offset + points.length) % points.length];
  const interpolate = axis => {
    const [a, b, c, d] = [-1, 0, 1, 2].map(offset => at(offset)[axis]);
    return .5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  };
  return { x: interpolate(0), y: interpolate(1) };
}

export const FLIGHT_ROUTES = [
  [[.07,.18],[.29,.56],[.57,.24],[.83,.63],[.9,.25],[.64,.08],[.34,.77],[.08,.6]],
  [[.76,.18],[.5,.71],[.16,.37],[.12,.1],[.44,.34],[.8,.75],[.92,.43],[.62,.08]],
  [[.9,.52],[.61,.18],[.28,.72],[.08,.38],[.3,.09],[.63,.57],[.88,.8],[.93,.2]],
];

export function flightDepth(progress, index) {
  return Math.sin(progress * Math.PI * 4 + index * 1.7) < -.58 ? 2 : 4;
}

export function initMemberArt() {
  document.querySelectorAll('[data-member-avatar]').forEach(container => {
    container.innerHTML = avatarMarkup(container.dataset.memberAvatar);
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = document.documentElement.classList.contains('motion-paused');
  let frame = 0;
  let previous = null;
  let disposed = false;
  const listeners = [];
  const scenes = [...document.querySelectorAll('[data-flight-scene]')].map(container => {
    const pattern = container.querySelector('[data-member-pattern]');
    const closing = container.dataset.flightScene === 'closing';
    pattern.innerHTML = patternMarkup(pattern.dataset.patternText, closing);
    return {
      container, pattern, closing, elapsed: 0, lastPatternTime: -Infinity, visible: true,
      pointer: { active: false, x: 0, y: 0 }, pulse: null, probes: [],
      colorLayer: pattern.querySelector('[data-pattern-color]'),
      motifs: [...pattern.querySelectorAll('[data-pattern-motif]')].map(element => ({
        element, motion: element.querySelector('[data-motif-motion]'),
        x: Number(element.dataset.x), y: Number(element.dataset.y),
        size: Number(element.dataset.size), angle: Number(element.dataset.angle),
        color: Number(element.dataset.color), arrival: Number(element.dataset.arrival),
        dx: 0, dy: 0, vx: 0, vy: 0, lastColor: -1,
      })),
      drift: pattern.querySelector('[data-pattern-drift]'),
      spins: [...pattern.querySelectorAll('[data-pattern-spin]')],
      beams: [...pattern.querySelectorAll('[data-light-beam]')],
      gradients: [...pattern.querySelectorAll('[data-beam-gradient]')],
      spots: [...pattern.querySelectorAll('[data-light-spot]')],
      halos: [...pattern.querySelectorAll('[data-light-halo]')],
      atmosphere: [...pattern.querySelectorAll('[data-light-atmosphere]')],
      actors: [...container.querySelectorAll('[data-flight-member]')].map((element, index) => ({
        element, index, elapsed: 0, hovered: false, focused: false, manual: null, drag: null,
        duration: closing ? 26 + index * 9 : 32 + index * 7,
        offset: closing ? index * .47 : index * .27,
        route: FLIGHT_ROUTES[index],
        avatar: element.querySelector('.member-avatar'),
        torch: element.querySelector('.character-torch'),
      })),
    };
  });
  if (!scenes.length) return () => {};

  function measure(scene) {
    const { container, pattern } = scene;
    scene.width = container.clientWidth;
    scene.height = container.clientHeight;
    scene.scale = Math.min(pattern.clientWidth / 1400, pattern.clientHeight / 450);
    scene.svgX = pattern.offsetLeft + (pattern.clientWidth - 1400 * scene.scale) / 2;
    scene.svgY = pattern.offsetTop + (pattern.clientHeight - 450 * scene.scale) / 2;
    for (const actor of scene.actors) {
      actor.width = actor.element.offsetWidth;
      actor.height = actor.element.offsetHeight;
      actor.originX = actor.avatar.offsetLeft + actor.avatar.offsetWidth * .72;
      actor.originY = actor.avatar.offsetTop + actor.avatar.offsetHeight * .72;
      actor.torchLength = actor.torch ? actor.torch.offsetWidth + 4 : 0;
    }
  }

  function renderActor(scene, actor) {
    const progress = actor.offset + actor.elapsed / actor.duration;
    const position = sampleFlight(actor.route, progress);
    let x = 12 + position.x * Math.max(0, scene.width - actor.width - 24);
    let y = 15 + position.y * Math.max(0, scene.height - actor.height - 30);
    const interactive = actor.hovered || actor.focused || Boolean(actor.drag);
    const tangent = sampleFlight(actor.route, progress + .002);
    const bank = Math.atan2((tangent.y - position.y) * scene.height, Math.abs(tangent.x - position.x) * scene.width) * 180 / Math.PI;
    const angle = actor.manual?.angle ?? (clamp(bank * .18, -12, 12) + Math.sin(actor.elapsed * 1.8 + actor.index) * 3);
    const radians = angle * Math.PI / 180;
    const ox = actor.originX * Math.cos(radians) - actor.originY * Math.sin(radians);
    const oy = actor.originX * Math.sin(radians) + actor.originY * Math.cos(radians);
    const intro = reduced.matches ? 1 : smooth((actor.elapsed - actor.index * .3) / 1.7);
    let beamTarget;
    if (scene.closing && scene.scale) {
      const cycle = footerFrame(scene.elapsed);
      const point = lightPoint(actor.index, cycle.paint);
      const start = lightPoint(actor.index, 0);
      beamTarget = { x: point.x + (start.x - point.x) * cycle.reset, y: point.y + (start.y - point.y) * cycle.reset };
      if (scene.pointer.active && !reduced.matches) {
        beamTarget.x += clamp(scene.pointer.x - beamTarget.x, -160, 160) * .2;
        beamTarget.y += clamp(scene.pointer.y - beamTarget.y, -100, 100) * .25;
      }
      x = scene.svgX + (beamTarget.x + (actor.index ? 42 : -42) + Math.sin(actor.elapsed * 1.2) * 10) * scene.scale - ox;
      // Keep a physical torch-length clearance as well as SVG-space light reach.
      // This keeps small-screen beams aimed into the letters instead of outwards.
      y = scene.svgY + (beamTarget.y - 100) * scene.scale - actor.torchLength - oy + Math.sin(actor.elapsed * 2.8 + actor.index) * 4;
      x = clamp(x, 12, Math.max(12, scene.width - actor.width - 12));
      y = clamp(y, 12, Math.max(12, scene.height - actor.height - 12));
    } else {
      x += (1 - intro) * (actor.index % 2 ? 65 : -65);
      y += (1 - intro) * 35;
    }
    if (actor.manual) {
      // Keep the rotated character inside the stage, including after resizing.
      const cornersX = [0, actor.width * Math.cos(radians), -actor.height * Math.sin(radians), actor.width * Math.cos(radians) - actor.height * Math.sin(radians)];
      const cornersY = [0, actor.width * Math.sin(radians), actor.height * Math.cos(radians), actor.width * Math.sin(radians) + actor.height * Math.cos(radians)];
      const minX = 12 - Math.min(...cornersX), minY = 12 - Math.min(...cornersY);
      x = clamp(actor.manual.x * scene.width, minX, Math.max(minX, scene.width - 12 - Math.max(...cornersX)));
      y = clamp(actor.manual.y * scene.height, minY, Math.max(minY, scene.height - 12 - Math.max(...cornersY)));
    }
    actor.pose = { x, y, angle };
    // Briefly soften layer crossings so occlusion does not switch at full opacity.
    const depthVisibility = scene.closing || interactive || reduced.matches ? 1 : Math.min(1, Math.abs(Math.sin(progress * Math.PI * 4 + actor.index * 1.7) + .58) / .05);
    const visibility = depthVisibility * (scene.closing || interactive ? 1 : intro);
    const scale = scene.closing ? '' : ` scale(${(.94 + depthVisibility * .06).toFixed(3)})`;
    actor.element.style.opacity = String(visibility);
    actor.element.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${angle.toFixed(2)}deg)${scale}`;
    actor.element.style.zIndex = interactive ? '6' : String(scene.closing ? 4 : flightDepth(progress, actor.index));
    actor.element.setAttribute('data-frozen', String(interactive));
    if (scene.closing) actor.element.setAttribute('data-placed', String(Boolean(actor.manual)));
    scene.probes[actor.index] = scene.scale ? { x: (x + actor.width * .35 - scene.svgX) / scene.scale, y: (y + actor.height * .5 - scene.svgY) / scene.scale } : null;
    if (!scene.closing || !scene.scale) return;

    // Convert the moving torch origin into the letterboxed SVG coordinate space.
    // DOM actors rotate about their top-left corner, so the light follows it exactly.
    const handX = (x + ox - scene.svgX) / scene.scale;
    const handY = (y + oy - scene.svgY) / scene.scale;
    let aimX = beamTarget.x;
    let aimY = beamTarget.y;
    const direction = Math.atan2(aimY - handY, aimX - handX);
    // Keep the target beyond the lens, including at small mobile SVG scales.
    const reach = Math.max(Math.hypot(aimX - handX, aimY - handY), actor.torchLength / scene.scale + 80);
    aimX = handX + Math.cos(direction) * reach;
    aimY = handY + Math.sin(direction) * reach;
    if (actor.torch) actor.torch.style.transform = `rotate(${direction * 180 / Math.PI - angle}deg)`;
    const originX = handX + Math.cos(direction) * actor.torchLength / scene.scale;
    const originY = handY + Math.sin(direction) * actor.torchLength / scene.scale;
    const dx = aimX - originX, dy = aimY - originY;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const spread = 80 + Math.sin(actor.elapsed * 1.6 + actor.index) * 9;
    const sideX = -dy / distance * spread, sideY = dx / distance * spread;
    scene.beams[actor.index].setAttribute('d', `M${originX},${originY} L${aimX + sideX},${aimY + sideY} Q${aimX + dx * .15},${aimY + dy * .15} ${aimX - sideX},${aimY - sideY} Z`);
    const gradient = scene.gradients[actor.index];
    Object.entries({ x1: originX, y1: originY, x2: aimX, y2: aimY }).forEach(([key, value]) => gradient.setAttribute(key, String(value)));
    scene.spots[actor.index].setAttribute('cx', String(aimX));
    scene.spots[actor.index].setAttribute('cy', String(aimY));
    const halo = scene.halos[actor.index];
    halo?.setAttribute('cx', String(aimX));
    halo?.setAttribute('cy', String(aimY));
    const atmosphere = scene.atmosphere[actor.index];
    if (atmosphere) atmosphere.style.opacity = String(footerFrame(scene.elapsed).light * (.94 + Math.sin(actor.elapsed * 5 + actor.index) * .04));
  }

  function renderMotifs(scene, time, delta) {
    const cycle = footerFrame(time);
    const still = reduced.matches;
    if (scene.colorLayer) {
      scene.colorLayer.style.opacity = String(scene.closing && !still ? 1 - cycle.reset : 1);
      scene.colorLayer.setAttribute('transform', `translate(0 ${scene.closing && !still ? cycle.reset * -32 : 0})`);
    }
    const step = Math.min(.064, Math.max(0, delta));
    const sources = still ? [] : [...scene.probes.filter(Boolean), ...(scene.pointer.active ? [scene.pointer] : [])];
    scene.motifs.forEach((tile, index) => {
      const arrival = scene.closing ? tile.arrival : .1 + Math.hypot(tile.x - 70, tile.y - 410) / 1400 * 2.1;
      const bloom = still ? { opacity: 1, scale: 1 } : bloomProgress(scene.closing ? cycle.time : time, arrival);
      let tx = 0, ty = 0;
      for (const source of sources) {
        const dx = tile.x - source.x, dy = tile.y - source.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const force = Math.max(0, 1 - distance / 135) ** 2 * (source === scene.pointer ? 23 : 10);
        tx += dx / distance * force; ty += dy / distance * force;
      }
      tile.vx = (tile.vx + (tx - tile.dx) * 75 * step) * Math.exp(-10 * step);
      tile.vy = (tile.vy + (ty - tile.dy) * 75 * step) * Math.exp(-10 * step);
      tile.dx += tile.vx * step; tile.dy += tile.vy * step;
      let pulse = 0, recolor = 0;
      if (scene.pulse && !still) {
        const age = time - scene.pulse.time, distance = Math.hypot(tile.x - scene.pulse.x, tile.y - scene.pulse.y);
        pulse = Math.max(0, 1 - Math.abs(distance - age * 520) / 85) * Math.exp(-age * .6);
        recolor = distance <= age * 520 ? 1 : 0;
      }
      const color = scene.closing ? (tile.color + Math.floor(time / 16)) % 4 : (waveColor(time, tile.x, tile.y, tile.color) + recolor) % 4;
      if (tile.lastColor !== color) { tile.element.style.color = PALETTE[color]; tile.lastColor = color; }
      tile.element.style.opacity = String(bloom.opacity);
      const sway = still ? 0 : Math.sin(time * 1.1 + index * 1.7) * 4 + pulse * 16;
      tile.motion.setAttribute('transform', `translate(${tile.dx.toFixed(2)} ${tile.dy.toFixed(2)}) rotate(${tile.angle + sway}) scale(${Math.max(0, tile.size * bloom.scale * (1 + pulse * .2))})`);
    });
  }

  function render(scene, delta) {
    scene.elapsed += delta;
    const time = scene.elapsed;
    for (const actor of scene.actors) {
      if (!actor.hovered && !actor.focused) actor.elapsed += delta;
      renderActor(scene, actor);
    }
    // The subtle pattern moves at 24 Hz; characters and light stay at display rate.
    if (delta === 0 || time - scene.lastPatternTime >= 1 / 24) {
      const patternDelta = Number.isFinite(scene.lastPatternTime) ? time - scene.lastPatternTime : 0;
      scene.lastPatternTime = time;
      scene.drift.setAttribute('transform', `translate(${Math.sin(time * .19) * 12} ${Math.cos(time * .23) * 9})`);
      scene.spins.forEach((spin, index) => {
        spin.setAttribute('transform', `rotate(${Number(spin.dataset.angle) + Math.sin(time * .32 + index) * 16})`);
      });
      renderMotifs(scene, time, patternDelta);
    }
  }
  const canAnimate = () => !disposed && !paused && !reduced.matches && !document.hidden && scenes.some(scene => scene.visible);
  function tick(now) {
    frame = 0;
    if (!canAnimate()) return;
    const delta = previous === null ? 0 : Math.min(now - previous, 64) / 1000;
    previous = now;
    for (const scene of scenes) if (scene.visible) render(scene, delta);
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    scenes.forEach(scene => scene.container.classList.toggle?.('is-flight-visible', scene.visible && !document.hidden && !paused && !reduced.matches));
    if (canAnimate()) {
      if (!frame) { previous = null; frame = requestAnimationFrame(tick); }
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = null;
    }
  }
  function onMotion(event) { paused = Boolean(event.detail?.paused); sync(); }
  function onReducedMotion() {
    scenes.forEach(scene => render(scene, 0));
    sync();
  }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const scene = scenes.find(candidate => candidate.container === entry.target);
      if (scene) scene.visible = entry.isIntersecting;
    });
    sync();
  }) : null;
  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(() => {
    scenes.forEach(scene => { measure(scene); render(scene, 0); });
  }) : null;
  const resize = () => scenes.forEach(scene => { measure(scene); render(scene, 0); });

  function bindPlacement(scene, actor) {
    const element = actor.element;
    const point = event => {
      const bounds = scene.container.getBoundingClientRect();
      return { x: (event.clientX - bounds.left) * scene.width / bounds.width, y: (event.clientY - bounds.top) * scene.height / bounds.height };
    };
    const place = (x, y) => {
      actor.manual = { x: x / scene.width, y: y / scene.height, angle: actor.pose.angle };
      renderActor(scene, actor);
      // Store the clamped position so dragging back from an edge responds at once.
      actor.manual.x = actor.pose.x / scene.width;
      actor.manual.y = actor.pose.y / scene.height;
    };
    const finish = (event, cancelled = false) => {
      if (!actor.drag || event.pointerId !== actor.drag.id) return;
      const drag = actor.drag;
      actor.drag = null;
      if (cancelled) actor.manual = drag.previous;
      element.setAttribute('data-dragging', 'false');
      if (element.hasPointerCapture(drag.id)) element.releasePointerCapture(drag.id);
      renderActor(scene, actor);
    };
    const reset = () => {
      if (actor.drag) finish({ pointerId: actor.drag.id }, true);
      actor.manual = null;
      renderActor(scene, actor);
    };
    const handlers = {
      pointerdown(event) {
        if (event.button !== 0 || event.isPrimary === false || actor.drag) return;
        event.preventDefault();
        event.stopPropagation();
        const cursor = point(event);
        actor.drag = { id: event.pointerId, offsetX: cursor.x - actor.pose.x, offsetY: cursor.y - actor.pose.y, previous: actor.manual && { ...actor.manual } };
        scene.pointer.active = false;
        place(actor.pose.x, actor.pose.y);
        element.setAttribute('data-dragging', 'true');
        element.setPointerCapture(event.pointerId);
        element.focus({ preventScroll: true });
      },
      pointermove(event) {
        if (!actor.drag || event.pointerId !== actor.drag.id) return;
        event.preventDefault();
        event.stopPropagation();
        const cursor = point(event);
        place(cursor.x - actor.drag.offsetX, cursor.y - actor.drag.offsetY);
      },
      pointerup: event => finish(event),
      pointercancel: event => finish(event, true),
      lostpointercapture: event => finish(event, true),
      dblclick: reset,
      keydown(event) {
        if (event.key === 'Escape') { event.preventDefault(); reset(); return; }
        const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
        if (!direction || actor.drag) return;
        event.preventDefault();
        const step = event.shiftKey ? 36 : 12;
        place(actor.pose.x + direction[0] * step, actor.pose.y + direction[1] * step);
      },
      click(event) { if (event.detail === 0) reset(); },
    };
    for (const [event, handler] of Object.entries(handlers)) element.addEventListener(event, handler);
    listeners.push(() => {
      for (const [event, handler] of Object.entries(handlers)) element.removeEventListener(event, handler);
      if (actor.drag) finish({ pointerId: actor.drag.id }, true);
    });
  }

  for (const scene of scenes) {
    scene.container.classList.add('flight-ready');
    measure(scene);
    render(scene, 0);
    const pointerMove = event => {
      if (event.pointerType === 'touch' || paused || reduced.matches || !scene.scale || scene.actors.some(actor => actor.drag)) return;
      const bounds = scene.container.getBoundingClientRect();
      scene.pointer = { active: true, x: (event.clientX - bounds.left - scene.svgX) / scene.scale, y: (event.clientY - bounds.top - scene.svgY) / scene.scale };
    };
    const pointerLeave = () => { scene.pointer.active = false; };
    const pointerDown = event => {
      if (event.target?.closest?.('a,button')) return;
      pointerMove(event);
      if (scene.pointer.active && !paused && !reduced.matches) scene.pulse = { ...scene.pointer, time: scene.elapsed };
    };
    for (const [event, handler] of [['pointermove', pointerMove], ['pointerleave', pointerLeave], ['pointerdown', pointerDown]]) {
      scene.container.addEventListener(event, handler);
      listeners.push(() => scene.container.removeEventListener(event, handler));
    }
    observer?.observe(scene.container);
    resizeObserver?.observe(scene.container);
    scene.actors.forEach(actor => {
      resizeObserver?.observe(actor.element);
      if (scene.closing) bindPlacement(scene, actor);
      if (!actor.element.matches('a')) return;
      for (const [event, property, value] of [['pointerenter','hovered',true],['pointerleave','hovered',false],['focus','focused',true],['blur','focused',false]]) {
        const handler = () => { actor[property] = value; renderActor(scene, actor); };
        actor.element.addEventListener(event, handler);
        listeners.push(() => actor.element.removeEventListener(event, handler));
      }
    });
  }
  if (!resizeObserver) window.addEventListener('resize', resize);
  document.addEventListener('kaky:motion', onMotion);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', onReducedMotion);
  sync();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    resizeObserver?.disconnect();
    window.removeEventListener('resize', resize);
    document.removeEventListener('kaky:motion', onMotion);
    document.removeEventListener('visibilitychange', sync);
    reduced.removeEventListener('change', onReducedMotion);
    listeners.forEach(remove => remove());
  };
}
