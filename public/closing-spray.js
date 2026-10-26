import { avatarMarkup } from './character-art.js';
import { DEFAULT_ARTWORK } from './pattern-art.js?v=garden-bloom-20261026';
import { DRONES, LOOP_SECONDS, PAINT_END, droneFrame, drawDroneFrames, stampsFor, beamArrivalU, paintProgressFor, prerasterDroneSprites } from './reference-spray.js';

const WIDTH = 1240, HEIGHT = 290, BLEED = 80;
const TOTAL_WIDTH = WIDTH + BLEED * 2, TOTAL_HEIGHT = HEIGHT + BLEED * 2;
const BLUE = '#254ad8';
const clamp = value => Math.max(0, Math.min(1, value));

// Keep the reference's reset timing, applied only to paint opacity. The user
// requested fixed lettering while retaining the original spray/body motion.
export function wordReset(phase, index) {
  const progress = clamp((phase - (PAINT_END + .0067 * index)) / .07);
  if (progress === 0 || progress === 1) return progress;
  let t = progress;
  for (let i = 0; i < 8; i++) {
    const error = ((1.9 * t - 2.85) * t + 1.95) * t - progress;
    if (Math.abs(error) < 1e-5) break;
    const slope = (5.7 * t - 5.7) * t + 1.95;
    if (Math.abs(slope) < 1e-6) break;
    t -= error / slope;
  }
  return (3 - 2 * t) * t * t;
}

export function flowerGrowth(progress, arrival) {
  return 1 - (1 - clamp((progress - arrival) / .08)) ** 3;
}

function svgImage(markup) {
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  return image.decode().then(() => image);
}

function spriteMarkup(member) {
  // Existing character artwork; only the small sprayer is attached to its hand.
  const art = avatarMarkup(member).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="380" viewBox="0 0 80 80">${art}<g transform="translate(57 51) rotate(18)"><rect x="-6" y="-4" width="13" height="8" rx="2" fill="#f4f3eb" stroke="${BLUE}"/><path d="M-4-4V4M3-4V4" stroke="${BLUE}" stroke-width="3"/><rect x="6" y="-2" width="4" height="4" rx="1" fill="${BLUE}"/><path d="M3-4V-6" stroke="${BLUE}" stroke-width="3"/></g></svg>`;
}

export function createClosingSpray(scene, onReady, { beamColor = '#d8ee7a', artwork = DEFAULT_ARTWORK } = {}) {
  const palette = artwork.palette;
  const motifMarkup = artwork.motif;
  const canvas = document.createElement('canvas');
  canvas.className = 'closing-spray-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  scene.pattern.appendChild(canvas);
  const context = canvas.getContext('2d');
  const surface = () => {
    const element = document.createElement('canvas');
    element.width = TOTAL_WIDTH; element.height = TOTAL_HEIGHT;
    return { canvas: element, ctx: element.getContext('2d') };
  };
  const base = surface(), paint = surface();
  const nozzle = { x: (57 + 10 * Math.cos(Math.PI / 10)) / 80, y: (51 + 10 * Math.sin(Math.PI / 10)) / 80 };
  const sprites = ['kang', 'kalya'].map(() => {
    const set = { meta: { vbW: 380, vbH: 380, nozzle, faces: 1 }, frames: [], rasters: [null], shadows: [null], shadowColor: '#bdc4e5' };
    return { hover: set, active: set };
  });
  // Match the current wordmark's typography while normalizing each original route
  // to its own word, exactly as the reference component does.
  base.ctx.font = '900 300px Arial, Helvetica, sans-serif';
  base.ctx.letterSpacing = '-18px';
  const kaleWidth = base.ctx.measureText('Kale').width;
  const ridersWidth = base.ctx.measureText('Riders').width;
  const factor = WIDTH / (kaleWidth + ridersWidth + 42);
  const split = kaleWidth * factor;
  const boxes = [{ x: 0, y: 16, w: split, h: 219 }, { x: split + 42 * factor, y: 16, w: ridersWidth * factor, h: 219 }];
  const maskMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="450" viewBox="0 0 1400 450"><text x="80" y="315" textLength="1240" lengthAdjust="spacingAndGlyphs" font-family="Arial, Helvetica, sans-serif" font-size="300" font-weight="900" letter-spacing="-18" fill="white">Kale Riders</text></svg>`;
  const stamps = boxes.map((box, index) => stampsFor([DRONES[index]], [box]));
  const motifs = artwork.buildMotifs().map(item => {
    const word = item.x < BLEED + split + 21 * factor ? 0 : 1;
    return { ...item, word, arrival: beamArrivalU(item.x - BLEED, item.y - BLEED, stamps[word]), forced: Infinity };
  });
  let mask, tiles, loaded = false, disposed = false, lastCycle = -1, lastFrames = [];
  const ready = Promise.all([
    svgImage(maskMarkup),
    Promise.all(palette.flatMap(color => Array.from({ length: 8 }, (_, index) => svgImage(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="-60 -60 120 120"><g color="${color}" stroke="${BLUE}" stroke-width="1.7" stroke-linejoin="round">${motifMarkup(index)}</g></svg>`)))),
    Promise.all(['kang', 'kalya'].map(member => svgImage(spriteMarkup(member)))),
  ]).then(([wordMask, flowerTiles, characters]) => {
    if (disposed) return;
    mask = wordMask; tiles = flowerTiles;
    characters.forEach((image, index) => { sprites[index].hover.frames = [image]; });
    prerasterDroneSprites(sprites);
    base.ctx.fillStyle = BLUE; base.ctx.fillRect(0, 0, TOTAL_WIDTH, TOTAL_HEIGHT);
    base.ctx.globalAlpha = .16;
    for (const item of motifs.filter((_, index) => index % 3 === 0)) {
      base.ctx.save(); base.ctx.translate(item.x, item.y); base.ctx.rotate(item.angle * Math.PI / 180);
      const size = 120 * item.size;
      base.ctx.drawImage(tiles[item.color * 8 + item.variant], -size / 2, -size / 2, size, size); base.ctx.restore();
    }
    base.ctx.globalAlpha = 1; base.ctx.globalCompositeOperation = 'destination-in'; base.ctx.drawImage(mask, 0, 0); base.ctx.globalCompositeOperation = 'source-over';
    loaded = true;
    scene.container.classList.add('spray-ready');
    onReady();
  }).catch(error => {
    // Keep the SVG and DOM characters visible if an image cannot be decoded.
    console.error('Closing artwork could not be prepared', error);
  });

  function measure() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(TOTAL_WIDTH * scene.scale * ratio));
    canvas.height = Math.max(1, Math.round(TOTAL_HEIGHT * scene.scale * ratio));
    canvas.style.width = `${TOTAL_WIDTH * scene.scale}px`;
    canvas.style.height = `${TOTAL_HEIGHT * scene.scale}px`;
  }

  function renderActor(actor, still) {
    const phase = still ? .34 : (scene.elapsed / LOOP_SECONDS) % 1;
    const state = droneFrame(DRONES[actor.index], sprites[actor.index], phase, boxes[actor.index], WIDTH, HEIGHT, BLEED);
    state.scale = actor.manual?.scale ?? state.scale;
    actor.sprayScale = state.scale;
    state.scale *= scene.width <= 639 ? 1.5 : 1;
    const size = 380 * .269 * state.scale * scene.scale;
    const facing = DRONES[actor.index].flipX;
    const angle = actor.manual?.angle ?? state.swingRad * 180 / Math.PI;
    const radians = angle * Math.PI / 180;
    const localX = (facing === 1 ? nozzle.x : 1 - nozzle.x) * size;
    const localY = nozzle.y * size;
    const ox = localX * Math.cos(radians) - localY * Math.sin(radians);
    const oy = localX * Math.sin(radians) + localY * Math.cos(radians);
    let x = scene.svgX + state.nozzle.x * scene.scale - ox;
    let y = scene.svgY + state.nozzle.y * scene.scale - oy;
    if (actor.manual) {
      const cx = [0, size * Math.cos(radians), -size * Math.sin(radians), size * (Math.cos(radians) - Math.sin(radians))];
      const cy = [0, size * Math.sin(radians), size * Math.cos(radians), size * (Math.sin(radians) + Math.cos(radians))];
      x = Math.max(12 - Math.min(...cx), Math.min(scene.width - 12 - Math.max(...cx), actor.manual.x * scene.width));
      y = Math.max(12 - Math.min(...cy), Math.min(scene.height - 12 - Math.max(...cy), actor.manual.y * scene.height));
      state.nozzle = { x: (x + ox - scene.svgX) / scene.scale, y: (y + oy - scene.svgY) / scene.scale };
      state.spot = { x: state.nozzle.x + facing * 35, y: state.nozzle.y + 70 };
      state.swingRad = radians;
    }
    actor.width = actor.height = size;
    actor.pose = { x, y, angle };
    actor.element.style.width = `${size}px`; actor.element.style.height = `${size}px`;
    actor.element.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${angle.toFixed(2)}deg)`;
    actor.element.style.opacity = '1';
    actor.element.setAttribute('data-placed', String(Boolean(actor.manual)));
    lastFrames[actor.index] = state;
  }

  function render(still) {
    if (!loaded || !context || !scene.scale) return;
    const phase = still ? .34 : (scene.elapsed / LOOP_SECONDS) % 1;
    const cycle = Math.floor(scene.elapsed / LOOP_SECONDS);
    if (cycle !== lastCycle) { motifs.forEach(item => { item.forced = Infinity; }); lastCycle = cycle; }
    const ctx = paint.ctx;
    ctx.clearRect(0, 0, TOTAL_WIDTH, TOTAL_HEIGHT); ctx.drawImage(base.canvas, 0, 0);
    for (let index = 0; index < motifs.length; index++) {
      const item = motifs[index];
      for (const actor of scene.actors) {
        const state = lastFrames[actor.index];
        if (actor.manual && state?.intensity > .02 && Math.hypot(item.x - state.spot.x, item.y - state.spot.y) < 62.5 && !Number.isFinite(item.forced)) item.forced = scene.elapsed;
      }
      const growth = still ? 1 : Math.max(flowerGrowth(paintProgressFor(DRONES[item.word], phase), item.arrival), 1 - (1 - clamp((scene.elapsed - item.forced) / .9)) ** 3);
      if (growth <= .001) continue;
      const sway = still ? 0 : Math.sin(scene.elapsed * 1.1 + index * 1.7) * 4;
      ctx.save(); ctx.translate(item.x, item.y); ctx.rotate((item.angle + sway + 45 * (1 - growth)) * Math.PI / 180);
      const size = 120 * item.size * growth;
      ctx.drawImage(tiles[item.color * 8 + item.variant], -size / 2, -size / 2, size, size); ctx.restore();
    }
    ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(mask, 0, 0); ctx.globalCompositeOperation = 'source-over';
    const ratio = canvas.width / TOTAL_WIDTH;
    context.setTransform(ratio, 0, 0, ratio, 0, 0); context.clearRect(0, 0, TOTAL_WIDTH, TOTAL_HEIGHT);
    context.drawImage(base.canvas, 0, 0);
    boxes.forEach((_, index) => {
      const reset = still ? 0 : wordReset(phase, index);
      const left = index === 0 ? 0 : BLEED + split + 21 * factor;
      const width = index === 0 ? BLEED + split + 21 * factor : TOTAL_WIDTH - left;
      // Keep the lettering anchored. Only the painted pattern clears for replay;
      // the original character and beam timeline continues unchanged.
      context.globalAlpha = 1 - reset;
      context.drawImage(paint.canvas, left, 0, width, TOTAL_HEIGHT, left, 0, width, TOTAL_HEIGHT);
    });
    context.globalAlpha = 1;
    // Same destination canvas is essential: original beams use overlay blending.
    drawDroneFrames(context, lastFrames, DRONES.map(drone => drone.flipX), beamColor);
  }
  return { ready, measure, renderActor, render, dispose() { disposed = true; canvas.remove(); } };
}
