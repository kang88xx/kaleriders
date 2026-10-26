// Botanical studies for the KALE wordmark. Shapes are original vector drawings
// informed by the brand's asymmetric, lobed leaf and branching central vein.
// All tile geometry fits a 120 × 120 viewBox centered on the origin.
const BLUE = '#254ad8';
const PAPER = '#f4f3eb';
const PALETTE = ['#d8ee7a', '#b8c6f3', '#e8b58d', PAPER];
const LEAF = 'currentColor';

const outline = (path, fill = LEAF, width = 2.6) => `<path d="${path}" fill="${fill}" stroke="${BLUE}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const vein = (path, width = 2.5) => outline(path, 'none', width);
// Filled stems stay connected on the blue field while keeping the same blue
// interior line as the veins within the leaves.
const stalk = path => `<path d="${path}" fill="none" stroke="currentColor" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round"/>${vein(path, 2.1)}`;
const group = (transform, content) => `<g transform="${transform}">${content}</g>`;

function kale() {
  return group('scale(.94)',
    outline('M-48 43C-52 37-42 37-37 33C-26 26-24 21-28 14C-34 4-26-3-18 1C-10 5-7-1-12-9C-18-20-8-28 1-20C8-13 13-17 10-27C7-40 20-47 27-37C31-31 35-39 41-35C49-31 45-23 44-19C56-18 55-8 47-4C41-1 47 3 46 9C46 18 36 20 31 16C25 12 23 17 25 22C27 31 15 35 8 28C3 24-2 27-2 33C-2 43-12 46-19 39C-27 31-38 49-48 43Z') +
    vein('M-43 40C-18 30 12 7 34-27', 3.2) +
    vein('M-24 29Q-13 18-18 8M-22 29Q-9 23 2 27M-7 18Q4 5-1-10M-6 18Q8 10 23 13M12 1Q23-11 21-26M12 1Q26-8 39-8') +
    `<path d="M-8-15Q-5-20 0-16M15-30Q14-36 19-37" fill="none" stroke="${PAPER}" stroke-width="2.4" stroke-linecap="round"/>`);
}

function uprightKale() {
  return outline('M-5 48C-5 35-13 35-18 28C-28 29-34 21-28 14C-39 9-38-3-28-6C-36-16-29-24-20-23C-25-34-15-40-8-35C-7-50 6-52 10-40C19-47 29-39 26-29C38-32 43-21 34-15C46-7 41 4 31 6C38 18 28 26 19 23C18 34 7 33 4 46Z') +
    vein('M0 46Q-1 8 7-37', 3.1) +
    vein('M0 30Q-9 26-16 19M0 23Q12 16 21 15M1 8Q-12 6-22-1M3-1Q17-6 25-12M4-12Q-7-17-15-25M6-22Q15-25 19-32');
}

function slenderKale() {
  return outline('M-9 47Q-7 38-10 29C-22 24-23 16-16 11C-29 4-24-7-16-9C-23-18-16-26-9-25C-14-34-5-41 2-36C4-48 15-50 19-40C28-40 33-32 25-26C36-18 32-9 23-8C31 1 24 10 15 8C22 18 14 26 7 25Q1 35-1 48Z') +
    vein('M-5 45Q-5 3 15-36', 3) +
    vein('M-5 28Q-10 22-14 19M-4 20Q3 19 9 15M-2 9Q-9 5-14-2M2-4Q12-5 18-13M5-13Q-2-17-5-25M10-25Q18-28 20-33', 2.3);
}

function foldedKale() {
  return outline('M-38 40Q-22 25-24 16C-37 10-34-3-24-4C-32-17-20-25-10-19C-10-34 3-37 9-27C15-43 28-43 30-31C43-34 48-21 37-14C52-8 46 7 35 6C43 19 30 28 21 21C18 35 7 36 1 28Q-17 37-33 45Z') +
    outline('M-36 41Q-10 20 29-29Q9 14-4 32Q-19 37-36 41Z', PAPER, 2.2) +
    vein('M-34 41Q-4 18 29-29', 3) +
    vein('M-19 29Q-16 15-23 7M-4 15Q-5 1-10-9M11-4Q11-15 13-22M-6 29Q6 20 17 23M10 10Q21 4 31 7M25-13Q31-16 37-16', 2.2);
}

function grass() {
  return outline('M-8 48C-13 19-29-10-43-23C-18-17-4 7 1 29C0-3 7-33 18-49C19-15 14 14 7 43C17 14 31-2 48-8C28 11 22 31 14 49Z') +
    vein('M-4 45Q-17 0-35-17M5 45Q10 3 17-37M10 45Q26 9 40-2', 2.2);
}

function ribbons() {
  return outline('M-15 48C-18 10-17-24-5-49C-3-20-5 15-8 39C1 9 17-13 40-22C22 0 10 24-1 48Z') +
    vein('M-11 44Q-13-10-6-38M-6 45Q12 3 32-15', 2.3) +
    outline('M8 49C18 32 31 25 47 27C29 34 25 42 20 49Z', PAPER, 2.1);
}

function sprout() {
  return stalk('M-1 47Q4 18-1-12') +
    outline('M0 14C-22 16-42 4-44-19C-20-19-3-9 0 14Z') +
    outline('M1 1C3-25 21-40 43-39C42-17 26 0 1 1Z') +
    vein('M0 14Q-22-2-35-12M2 0Q24-21 35-31', 2.3);
}

function archedStem() {
  return stalk('M-30 49C-3 24 11-5 20-45') +
    outline('M-17 32C-38 26-45 12-39-6C-21 1-15 15-17 32Z') +
    outline('M-7 19C14 13 30 18 36 34C15 39 2 30-7 19Z') +
    outline('M5-1C-15-5-27-20-22-37C-4-31 4-18 5-1Z') +
    outline('M12-20C22-37 39-44 48-35C41-19 28-14 12-20Z') +
    vein('M-18 30L-34 4M-5 20L25 30M5-2L-17-29M14-20L40-33', 1.9);
}

function frond() {
  return stalk('M-21 49C-11 25 1 7 11-16C24-42 46-45 45-28C44-16 25-14 26-26C27-33 36-33 36-27') +
    outline('M-13 32Q-40 31-42 9Q-19 7-13 32Z') +
    outline('M-7 20Q18 12 28 30Q8 40-7 20Z') +
    outline('M0 5Q-25-2-22-24Q0-19 0 5Z') +
    outline('M8-10Q28-9 30 5Q14 12 8-10Z') +
    vein('M-14 31L-34 17M-6 21L19 29M0 4L-17-15M9-9L23 3', 1.9);
}

function broadBlades() {
  return outline('M-13 47C-18 24-30 8-45 0C-20-2-3 16 0 38C1 4-5-20-17-45C8-26 14-1 8 37C17 13 29 0 46-3C29 18 24 33 19 49Z') +
    vein('M-8 44Q-19 16-35 6M5 43Q8 0-11-34M14 44Q27 13 38 3', 2.3);
}

const kaleForms = [kale, () => group('scale(-1 1)', kale()), uprightKale, slenderKale,
  foldedKale, () => group('rotate(-28) scale(.84)', uprightKale()),
  () => group('rotate(26) scale(.88)', slenderKale()), () => group('scale(-1 1)', foldedKale())];
const meadowForms = [grass, ribbons, sprout, archedStem, slenderKale,
  () => group('scale(-1 1)', ribbons()), broadBlades, () => group('rotate(-14) scale(.86)', uprightKale())];
const gardenForms = [kale, uprightKale, sprout, frond, grass, foldedKale,
  () => group('scale(-1 1)', archedStem()), () => group('scale(-1 1)', frond())];

function seededRandom(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

function signatureField() {
  const random = seededRandom(417);
  const colors = [0, 0, 3, 0, 1, 0, 3, 0, 1, 0, 3, 2];
  const variants = [0, 2, 1, 3, 0, 4, 1, 2, 6, 0, 7, 5];
  return Array.from({ length: 180 }, (_, index) => {
    const row = Math.floor(index / 20), column = index % 20;
    return {
      x: column * 74 - 20 + (row % 2) * 32 + random() * 9,
      y: row * 56 - 12 + random() * 9,
      size: .79 + random() * .16,
      angle: [-12, 12, -24, 18][(column + row) % 4] + random() * 8 - 4,
      variant: variants[(column + row * 3) % variants.length],
      color: colors[(column * 5 + row * 3) % colors.length],
    };
  });
}

function meadowField() {
  const random = seededRandom(825);
  const colors = [0, 3, 0, 1, 3, 0, 0, 1, 0, 3, 0, 2];
  // Alternating curving stems make continuous windward lanes rather than a
  // random scatter. Young kale recurs at every fourth planting position.
  const variants = [0, 1, 4, 2, 5, 0, 7, 6, 3, 1, 4, 0];
  return Array.from({ length: 216 }, (_, index) => {
    const row = Math.floor(index / 24), column = index % 24;
    return {
      x: column * 62 - 15 + (row % 2) * 22 + random() * 8,
      y: row * 56 - 7 + Math.sin(column * .9) * 8 + random() * 5,
      size: .7 + random() * .2,
      angle: -18 + Math.sin(column * .7 + row * .4) * 15,
      variant: variants[(column + row * 2) % variants.length],
      color: colors[(column * 7 + row * 3) % colors.length],
    };
  });
}

function gardenField() {
  const random = seededRandom(1203);
  const colors = [0, 0, 3, 1, 0, 2, 0, 3, 0, 1, 3, 0];
  const variants = [0, 3, 2, 1, 6, 4, 5, 7, 0, 2, 3, 1];
  return Array.from({ length: 189 }, (_, index) => {
    const row = Math.floor(index / 21), column = index % 21;
    const slot = (column + row * 4) % variants.length;
    const isKale = [0, 1, 5].includes(variants[slot]);
    return {
      x: column * 71 - 16 + (row % 2) * 26 + random() * 8,
      y: row * 56 - 11 + (column % 3 - 1) * 8 + random() * 7,
      size: (isKale ? .83 : .65) + random() * .15,
      angle: (isKale ? [-26, 12, 30][column % 3] : [-18, 14, -6][column % 3]) + random() * 10 - 5,
      variant: variants[slot],
      color: colors[(column * 5 + row * 2) % colors.length],
    };
  });
}

function drawFrom(forms, index) {
  return `<g stroke-linecap="round" stroke-linejoin="round">${forms[((index % forms.length) + forms.length) % forms.length]()}</g>`;
}

export const BOTANICAL_VARIANTS = [
  {
    id: 'signature', name: '케일 시그니처', eyebrow: 'THE KALE SIGNATURE',
    description: '물결치는 케일 잎과 선명한 잎맥. 로고의 실루엣을 크고 또렷하게 반복해 브랜드의 인상을 가장 직접적으로 전합니다.',
    palette: [...PALETTE], buildMotifs: signatureField, motif: index => drawFrom(kaleForms, index),
  },
  {
    id: 'meadow', name: '바람의 풀숲', eyebrow: 'A GENTLE FIELD',
    description: '한 방향으로 흐르는 풀잎 사이에 어린 케일과 새싹이 자랍니다. 가는 곡선과 여백으로 가볍고 유연한 움직임을 만듭니다.',
    palette: [...PALETTE], buildMotifs: meadowField, motif: index => drawFrom(meadowForms, index),
  },
  {
    id: 'garden', name: '케일 가든', eyebrow: 'GROWING TOGETHER',
    description: '큰 케일 잎, 작은 새싹, 말린 잎과 풀줄기를 겹쳐 심었습니다. 서로 다른 크기의 식물이 만나 풍성한 생장감을 전합니다.',
    palette: [...PALETTE], buildMotifs: gardenField, motif: index => drawFrom(gardenForms, index),
  },
];

export function botanicalFieldMarkup(id, { width = 1400, height = 450 } = {}) {
  const study = BOTANICAL_VARIANTS.find(item => item.id === id) ?? BOTANICAL_VARIANTS[0];
  const marks = study.buildMotifs().map(item => `<g transform="translate(${item.x} ${item.y}) rotate(${item.angle}) scale(${item.size})" color="${study.palette[item.color]}">${study.motif(item.variant)}</g>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1400 450" role="img" aria-label="${study.name} 식물 패턴"><rect width="1400" height="450" fill="${BLUE}"/>${marks}</svg>`;
}
