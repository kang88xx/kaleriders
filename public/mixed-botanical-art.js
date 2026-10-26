import { BOTANICAL_VARIANTS } from './botanical-art.js?v=garden-bloom-20261026';

const BLUE = '#254ad8';
const PAPER = '#f4f3eb';
const GARDEN = BOTANICAL_VARIANTS.find(variant => variant.id === 'garden');
const PALETTE = [...GARDEN.palette];

// These three flowers retain the original site's paths and petal proportions
// from public/pattern-art.js (original variants 0, 5 and 6).
function roundedFlower() {
  return Array.from({ length: 7 }, (_, index) => `<ellipse cy="-24" rx="11" ry="24" transform="rotate(${index * 360 / 7})" fill="currentColor"/>`).join('') +
    `<circle r="12" fill="${PAPER}"/><circle r="5" fill="currentColor"/>`;
}

function slenderFlower() {
  return Array.from({ length: 12 }, (_, index) => `<ellipse cy="-25" rx="4.5" ry="23" transform="rotate(${index * 30})" fill="currentColor"/>`).join('') +
    `<circle r="12" fill="${PAPER}"/>`;
}

function softFlower() {
  return `<path d="M0-44C18-42 23-24 18-12C43-23 52 3 32 17C42 41 12 48 0 30C-13 51-42 36-31 17C-56 4-33-22-18-12C-27-33-12-45 0-44Z" fill="currentColor"/><circle r="12" fill="${PAPER}"/><path d="M0-30V-16M27 8L15 4M-27 8L-15 4M16 28L8 16M-16 28L-8 16"/>`;
}

// 0–4: diagonal kale, upright kale, folded kale, curled frond, grasses.
// 5–7: original rounded, slender and soft flowers.
const FORMS = [
  () => GARDEN.motif(0), () => GARDEN.motif(1), () => GARDEN.motif(5),
  () => GARDEN.motif(3), () => GARDEN.motif(4),
  roundedFlower, slenderFlower, softFlower,
];

function motif(index) {
  const form = FORMS[((index % FORMS.length) + FORMS.length) % FORMS.length];
  return `<g fill="none" stroke="${BLUE}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${form()}</g>`;
}

function seededRandom(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

function accentField() {
  const random = seededRandom(3168);
  const foliage = [0, 3, 1, 4, 0, 2, 1, 3, 2];
  const leafColors = [0, 3, 0, 1, 0, 0, 3, 0, 1, 0, 3, 2];
  const flowerColors = [3, 1, 2, 0, 1, 3];
  let leafIndex = 0, flowerIndex = 0;
  return Array.from({ length: 180 }, (_, index) => {
    const row = Math.floor(index / 20), column = index % 20;
    const isFlower = (column + row) % 4 === 3;
    const sequence = isFlower ? flowerIndex++ : leafIndex++;
    const variant = isFlower ? 5 + sequence % 3 : foliage[sequence % foliage.length];
    const colors = isFlower ? flowerColors : leafColors;
    return {
      x: column * 74 - 15 + (row % 2) * 27 + random() * 10 - 5,
      y: row * 56 - 9 + (isFlower ? 6 : 0) + random() * 10 - 5,
      size: isFlower ? .54 + random() * .14 : (variant < 3 ? .85 : .69) + random() * .13,
      angle: isFlower ? [-10, 16, 4][sequence % 3] : [-24, 9, 24, -9][(column + row) % 4] + random() * 8 - 4,
      variant,
      color: colors[sequence % colors.length],
    };
  });
}

function bloomField() {
  const random = seededRandom(6743);
  // Each twenty-position phrase has eleven plants and nine flowers. Offsetting
  // rows makes small flower groups nest between the large directional leaves.
  const arrangement = [0, 5, 3, 7, 1, 4, 6, 0, 5, 2, 7, 3, 1, 6, 4, 5, 2, 7, 0, 6];
  const leafColors = [0, 0, 3, 1, 0, 3, 0, 1, 0, 2, 0];
  const flowerColors = [1, 3, 0, 2, 1, 0, 3, 0, 1];
  let leafIndex = 0, flowerIndex = 0;
  return Array.from({ length: 220 }, (_, index) => {
    const row = Math.floor(index / 22), column = index % 22;
    const variant = arrangement[index % arrangement.length];
    const isFlower = variant >= 5;
    const sequence = isFlower ? flowerIndex++ : leafIndex++;
    const colors = isFlower ? flowerColors : leafColors;
    return {
      x: column * 66 - 13 + (row % 2) * 25 + random() * 12 - 6,
      y: row * 51 - 9 + Math.sin(column * 1.1 + row) * 6 + random() * 8 - 4,
      size: isFlower ? [.64, .83, .73, .91][sequence % 4] + random() * .06 : (variant < 3 ? .82 : .68) + random() * .14,
      angle: isFlower ? [0, 18, -12, 8][sequence % 4] : [-28, 18, -8, 30][(column + row * 2) % 4] + random() * 8 - 4,
      variant,
      color: colors[sequence % colors.length],
    };
  });
}

export const MIXED_BOTANICAL_VARIANTS = [
  {
    id: 'garden-accent', name: '케일에 꽃 한 송이', eyebrow: 'A LITTLE BLOOM',
    description: '큰 케일 잎과 풀 사이에 작은 꽃을 띄엄띄엄 심었습니다. 케일 가든의 여유로운 인상에 원래 꽃무늬의 경쾌함을 살짝 더합니다.',
    palette: [...PALETTE], buildMotifs: accentField, motif, specimens: [0, 3, 5, 7],
  },
  {
    id: 'garden-bloom', name: '꽃이 핀 케일 가든', eyebrow: 'THE GARDEN IN BLOOM',
    description: '물결치는 케일 잎 사이로 크고 작은 꽃이 풍성하게 피어납니다. 기존 꽃의 둥근 형태와 잎맥의 곡선을 함께 살린 생기 있는 정원입니다.',
    palette: [...PALETTE], buildMotifs: bloomField, motif, specimens: [1, 2, 6, 7],
  },
];

export function mixedFieldMarkup(id, { width = 1400, height = 450 } = {}) {
  const study = MIXED_BOTANICAL_VARIANTS.find(variant => variant.id === id) ?? MIXED_BOTANICAL_VARIANTS[0];
  const marks = study.buildMotifs().map(item => `<g transform="translate(${item.x} ${item.y}) rotate(${item.angle}) scale(${item.size})" color="${study.palette[item.color]}">${study.motif(item.variant)}</g>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1400 450" role="img" aria-label="${study.name} 식물과 꽃 패턴"><rect width="1400" height="450" fill="${BLUE}"/>${marks}</svg>`;
}
