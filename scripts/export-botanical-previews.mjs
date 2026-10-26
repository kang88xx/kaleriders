import { mkdir, writeFile } from 'node:fs/promises';
import { BOTANICAL_VARIANTS, botanicalFieldMarkup } from '../public/botanical-art.js';
import { MIXED_BOTANICAL_VARIANTS, mixedFieldMarkup } from '../public/mixed-botanical-art.js';

const directory = new URL('../public/assets/botanical/', import.meta.url);
await mkdir(directory, { recursive:true });
for (const study of [...BOTANICAL_VARIANTS, ...MIXED_BOTANICAL_VARIANTS]) {
  const mixed = MIXED_BOTANICAL_VARIANTS.includes(study);
  const field = (mixed ? mixedFieldMarkup : botanicalFieldMarkup)(study.id);
  const marks = study.buildMotifs().map(item => `<g transform="translate(${item.x} ${item.y}) rotate(${item.angle}) scale(${item.size})" color="${study.palette[item.color]}">${study.motif(item.variant)}</g>`).join('');
  const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="450" viewBox="0 0 1400 450"><defs><clipPath id="letters"><text x="80" y="315" textLength="1240" lengthAdjust="spacingAndGlyphs" font-family="Arial, Helvetica, sans-serif" font-size="300" font-weight="900" letter-spacing="-18">Kale Riders</text></clipPath></defs><g clip-path="url(#letters)"><rect width="1400" height="450" fill="#254ad8"/>${marks}</g></svg>`;
  const specimens = (study.specimens ?? [0, 2, 3, 4]).map((variant, index) => `<g transform="translate(${60 + index * 120} 60) scale(.87)" color="${study.palette[index === 1 ? 1 : index === 2 ? 2 : 0]}">${study.motif(variant)}</g>`).join('');
  const detail = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120" viewBox="0 0 480 120">${specimens}</svg>`;
  await Promise.all([
    writeFile(new URL(`${study.id}-field.svg`, directory), field),
    writeFile(new URL(`${study.id}-wordmark.svg`, directory), wordmark),
    writeFile(new URL(`${study.id}-detail.svg`, directory), detail),
  ]);
  if (mixed) {
    const hero = wordmark.replace('x="80" y="315" textLength="1240"', 'x="40" y="350" textLength="1320"').replace('font-size="300"', 'font-size="390"').replace('>Kale Riders</text>', '>CRYPTO</text>');
    await writeFile(new URL(`${study.id}-hero.svg`, directory), hero);
  }
  console.log(`${study.id}: field, wordmark, detail exported`);
}
