export const PALETTE = ['#d8ee7a', '#b8c6f3', '#e8b58d', '#f4f3eb'];
const BLUE = '#254ad8';
const PAPER = '#f4f3eb';
export const PAINT_LOOP = 16;
let artworkId = 0;
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

export function footerFrame(seconds) {
  const time = ((seconds % PAINT_LOOP) + PAINT_LOOP) % PAINT_LOOP;
  return { time, paint: clamp((time - .45) / 10.4), reset: smooth((time - 13.2) / 2.8), light: time < 11.4 ? 1 : .16 };
}

export function lightPoint(index, progress) {
  const t = clamp(progress);
  return {
    x: index === 0 ? 80 + 620 * t : 1320 - 620 * t,
    y: 220 + Math.sin(t * Math.PI * 3 + index * Math.PI) * 92,
  };
}

export function paintArrival(x, y) {
  let closest = Infinity, arrival = 0;
  for (let index = 0; index < 2; index++) {
    for (let sample = 0; sample <= 100; sample++) {
      const point = lightPoint(index, sample / 100);
      const distance = Math.hypot(x - point.x, y - point.y);
      if (distance < closest) {
        closest = distance;
        arrival = .45 + sample / 100 * 10.4 + Math.min(.75, distance / 240);
      }
    }
  }
  return Math.min(11.6, arrival);
}

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

function star(points, outer, inner) {
  return Array.from({ length: points * 2 }, (_, i) => {
    const angle = i * Math.PI / points - Math.PI / 2, radius = i % 2 ? inner : outer;
    return `${Math.cos(angle) * radius},${Math.sin(angle) * radius}`;
  }).join(' ');
}

function motif(index) {
  const color = 'currentColor';
  switch (index % 8) {
    case 0: return Array.from({ length: 7 }, (_, i) => `<ellipse cy="-24" rx="11" ry="24" transform="rotate(${i * 360 / 7})" fill="${color}"/>`).join('') + `<circle r="12" fill="${PAPER}"/><circle r="5" fill="${color}"/>`;
    case 1: return `<g transform="rotate(-35)"><rect x="-38" y="-17" width="48" height="34" rx="17" fill="${color}"/><rect x="-8" y="-17" width="48" height="34" rx="17" fill="${PAPER}"/><path d="M-24 0H-3M7 0H25" stroke-width="7" stroke-linecap="round"/></g>`;
    case 2: return `<circle r="28" fill="${color}"/><ellipse rx="44" ry="13" transform="rotate(-32)" fill="none" stroke-width="3"/><circle cx="35" cy="-22" r="6" fill="${PAPER}"/><path d="M-20-11Q-4-26 12-17M-16 15Q2 24 18 9" fill="none"/>`;
    case 3: return `<polygon points="${star(9, 45, 20)}" fill="${color}"/><circle r="12" fill="${PAPER}"/><circle r="5" fill="${color}"/>`;
    case 4: return `<circle r="39" fill="${color}"/><circle r="29" fill="none"/><circle r="19" fill="${PAPER}"/><circle r="9" fill="${color}"/><path d="M-38 27L38-27" stroke-width="2"/>`;
    case 5: return Array.from({ length: 12 }, (_, i) => `<ellipse cy="-25" rx="4.5" ry="23" transform="rotate(${i * 30})" fill="${color}"/>`).join('') + `<circle r="12" fill="${PAPER}"/>`;
    case 6: return `<path d="M0-44C18-42 23-24 18-12C43-23 52 3 32 17C42 41 12 48 0 30C-13 51-42 36-31 17C-56 4-33-22-18-12C-27-33-12-45 0-44Z" fill="${color}"/><circle r="12" fill="${PAPER}"/><path d="M0-30V-16M27 8L15 4M-27 8L-15 4M16 28L8 16M-16 28L-8 16"/>`;
    default: return `<path d="M-40 35Q-43-35 18-40Q47 18-40 35Z" fill="${color}"/><path d="M-35 29L14-34M-23 16L-25-14M-11 4L15 8M1-11L0-30M-29 23L-5 25" fill="none" stroke-width="2"/><circle cx="29" cy="28" r="13" fill="${PAPER}"/><circle cx="29" cy="28" r="5" fill="${color}"/>`;
  }
}

export function buildMotifs() {
  let seed = 4197;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  return Array.from({ length: 280 }, (_, i) => {
    const row = Math.floor(i / 28), col = i % 28;
    const x = col * 54 - 28 + (row % 2) * 26 + random() * 18;
    const y = row * 51 - 25 + random() * 22;
    return { x, y, angle: random() * 360, size: .61 + random() * .35, variant: Math.floor(random() * 8), color: Math.floor(random() * 4), arrival: paintArrival(x, y) };
  });
}

export function patternMarkup(text, illuminated) {
  const id = `member-letter-${++artworkId}`;
  const label = text === 'Kale Riders' ? 'Kale Riders' : 'CRYPTO';
  const letters = `x="700" y="${illuminated ? 325 : 350}" text-anchor="middle" textLength="1320" lengthAdjust="spacingAndGlyphs" font-family="Arial, Helvetica, sans-serif" font-size="${illuminated ? 300 : 390}" font-weight="900" letter-spacing="-18"`;
  const items = buildMotifs();
  const marks = items.map((item, i) => `<g data-pattern-motif data-x="${item.x}" data-y="${item.y}" data-angle="${item.angle}" data-size="${item.size}" data-color="${item.color}" data-arrival="${item.arrival}" transform="translate(${item.x} ${item.y})" style="color:${PALETTE[item.color]}"><g data-motif-motion transform="rotate(${item.angle}) scale(${item.size})">${motif(item.variant)}</g></g>`).join('');
  const gradients = illuminated ? [0, 1].map(i => `<linearGradient id="${id}-beam-${i}" gradientUnits="userSpaceOnUse" data-beam-gradient><stop stop-color="${PALETTE[i ? 2 : 0]}" stop-opacity=".12"/><stop offset="1" stop-color="${PALETTE[i ? 2 : 0]}" stop-opacity=".5"/></linearGradient><radialGradient id="${id}-halo-${i}"><stop stop-color="${PALETTE[i ? 2 : 0]}" stop-opacity=".76"/><stop offset=".72" stop-color="${PALETTE[i ? 2 : 0]}" stop-opacity=".38"/><stop offset="1" stop-color="${PALETTE[i ? 2 : 0]}" stop-opacity="0"/></radialGradient>`).join('') : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 450" width="1400" height="450" aria-hidden="true" focusable="false">
    <defs><clipPath id="${id}-clip"><text ${letters}>${label}</text></clipPath>${gradients}<radialGradient id="${id}-shine"><stop stop-color="${PAPER}" stop-opacity=".4"/><stop offset="1" stop-color="${PAPER}" stop-opacity="0"/></radialGradient></defs>
    ${illuminated ? [0,1].map(i => `<g data-light-atmosphere><path data-light-beam fill="url(#${id}-beam-${i})"/><ellipse data-light-halo rx="143" ry="112" fill="url(#${id}-halo-${i})"/></g>`).join('') : ''}
    <g clip-path="url(#${id}-clip)">
      <rect width="1400" height="450" fill="${BLUE}"/>
      <g fill="none" stroke="${PALETTE[1]}" stroke-width="1.2" opacity=".38">${items.filter((_,i)=>i%3===0).map(item=>`<circle cx="${item.x}" cy="${item.y}" r="${item.size*30}"/><path d="M${item.x-30} ${item.y}h60M${item.x} ${item.y-30}v60"/>`).join('')}</g>
      <g data-pattern-color><g data-pattern-drift stroke="${BLUE}" stroke-width="1.7" stroke-linejoin="round">${marks}</g></g>
      ${illuminated ? [0,1].map(()=>`<circle data-light-spot r="160" fill="url(#${id}-shine)"/>`).join('') : ''}
    </g>
    <text ${letters} fill="none" stroke="${BLUE}" stroke-width="1.3">${label}</text>
  </svg>`;
}
