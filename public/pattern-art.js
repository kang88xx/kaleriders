import { MIXED_BOTANICAL_VARIANTS } from './mixed-botanical-art.js?v=garden-bloom-20261026';

export const DEFAULT_ARTWORK = MIXED_BOTANICAL_VARIANTS.find(artwork => artwork.id === 'garden-bloom');
export const PALETTE = DEFAULT_ARTWORK.palette;
export const motif = DEFAULT_ARTWORK.motif;
export const buildMotifs = DEFAULT_ARTWORK.buildMotifs;
const BLUE = '#254ad8';
let artworkId = 0;
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

export function bloomProgress(time, arrival, duration = .7) {
  const t = clamp((time - arrival) / duration);
  return { opacity: smooth(t * 3), scale: t === 1 ? 1 : 1 + 2.3 * (t - 1) ** 3 + 1.3 * (t - 1) ** 2 };
}

export function waveColor(time, x, y, initial) {
  const cycle = Math.floor(Math.max(0, time - 3) / 5.5);
  const origins = [[80, 320], [1280, 90], [650, 390]];
  const [ox, oy] = origins[cycle % origins.length];
  const travel = Math.hypot(x - ox, y - oy) / 1400 * 2.4;
  const reached = time >= 3 + cycle * 5.5 + travel;
  return (initial + cycle + (reached ? 1 : 0)) % PALETTE.length;
}

export function patternMarkup(text, illuminated) {
  const id = `member-letter-${++artworkId}`;
  const label = text === 'Kale Riders' ? 'Kale Riders' : 'CRYPTO';
  const letters = `x="700" y="${illuminated ? 325 : 350}" text-anchor="middle" textLength="1320" lengthAdjust="spacingAndGlyphs" font-family="Arial, Helvetica, sans-serif" font-size="${illuminated ? 300 : 390}" font-weight="900" letter-spacing="-18"`;
  const items = buildMotifs();
  const marks = items.map((item, i) => `<g data-pattern-motif data-x="${item.x}" data-y="${item.y}" data-angle="${item.angle}" data-size="${item.size}" data-color="${item.color}" transform="translate(${item.x} ${item.y})" style="color:${PALETTE[item.color]}"><g data-motif-motion transform="rotate(${item.angle}) scale(${item.size})">${motif(item.variant)}</g></g>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 450" width="1400" height="450" data-pattern-artwork="${DEFAULT_ARTWORK.id}" aria-hidden="true" focusable="false">
    <defs><clipPath id="${id}-clip"><text ${letters}>${label}</text></clipPath></defs>
    <g clip-path="url(#${id}-clip)">
      <rect width="1400" height="450" fill="${BLUE}"/>
      <g opacity=".16">${items.filter((_,i)=>i%3===0).map(item=>`<g transform="translate(${item.x} ${item.y}) rotate(${item.angle}) scale(${item.size})" color="${PALETTE[item.color]}">${motif(item.variant)}</g>`).join('')}</g>
      <g data-pattern-color><g data-pattern-drift stroke="${BLUE}" stroke-width="1.7" stroke-linejoin="round">${marks}</g></g>
    </g>
    <text ${letters} fill="none" stroke="${BLUE}" stroke-width="1.3">${label}</text>
  </svg>`;
}
