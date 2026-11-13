import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const metadata = Object.fromEntries([...head.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)"/g)].map(match => [match[1], match[2]]));

test('initial HTML supplies English titles and descriptions to sharing crawlers', () => {
  const title = head.match(/<title[^>]*>([^<]+)<\/title>/)[1];
  assert.equal(title, 'KALE Riders | Your Local Partner in Korea');
  for (const key of ['og:title', 'twitter:title']) assert.equal(metadata[key], title);
  for (const key of ['description', 'og:description', 'twitter:description']) {
    assert.equal(metadata[key], metadata.description, 'Sharing descriptions match the page description');
    // Shortened on 2026-11-13 at the owner's request: the services, without repeating the name
    // that the title already carries.
    assert.equal(metadata[key], 'KOL campaigns, community management, meetups, press and airdrops for global projects entering Korea.');
    assert.doesNotMatch(metadata[key], /[\u3131-\u318e\uac00-\ud7a3]/);
  }
  assert.equal(metadata['og:locale'], 'en_US');
});

test('social previews resolve to an existing landscape image with accurate dimensions', () => {
  const url = new URL(metadata['og:image']);
  assert.equal(url.origin, 'https://kaleriders.com');
  assert.equal(metadata['twitter:image'], url.href);
  assert.equal(metadata['twitter:card'], 'summary_large_image');
  const png = readFileSync(new URL(`../public${url.pathname}`, import.meta.url));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  assert.equal(metadata['og:image:width'], String(width));
  assert.equal(metadata['og:image:height'], String(height));
  assert.ok(width >= 1200 && width / height > 1.8 && width / height < 2);
  // The image carries the logo and the headline only (owner, 2026-11-13: less text on it).
  assert.equal(metadata['og:image:alt'], 'KALE Riders — Global projects. Local connections.');
  assert.equal(metadata['twitter:image:alt'], metadata['og:image:alt']);
  assert.match(url.pathname, /kale-riders-social-en-v2\.png$/);
  assert.deepEqual([width, height], [1200, 630]);
  assert(png.length < 300_000, `The preview image is ${png.length} bytes; some messengers skip large images`);
});

// /sample is shared as a link too, so it carries the same preview as the homepage.
test('the sample page shares the homepage preview', () => {
  const sample = readFileSync(new URL('../public/sample.html', import.meta.url), 'utf8').match(/<head>([\s\S]*?)<\/head>/)[1];
  const sampleMetadata = Object.fromEntries([...sample.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)"/g)].map(match => [match[1], match[2]]));
  for (const key of ['description', 'og:title', 'og:description', 'og:image', 'og:image:type', 'og:image:width', 'og:image:height', 'og:image:alt', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) {
    assert.equal(sampleMetadata[key], metadata[key], `${key} differs between the homepage and /sample`);
  }
});

// Messengers keep the previews they fetched before 2026-11-13, with the first image's address.
test('the first preview image is still published', () => {
  const png = readFileSync(new URL('../public/assets/kale-riders-social-en-v1.png', import.meta.url));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
});

// The image is drawn from scripts/social-card.html by scripts/render-social-card.mjs. The owner
// asked on 2026-11-13 for less text on it: the logo and the two-line headline, nothing else.
test('the preview image source holds the headline only and its files exist', () => {
  const card = readFileSync(new URL('../scripts/social-card.html', import.meta.url), 'utf8');
  const body = card.match(/<body>([\s\S]*?)<\/body>/)[1];
  const words = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  assert.equal(words, 'Global projects. Local connections.');
  const files = [...card.matchAll(/(?:href|src|url\()=?["'(]*(\.\.\/public\/[^"')]+)/g)].map(match => match[1]);
  assert.equal(files.length, 3, `Expected the font, the logo and the leaf, found ${files.join(', ')}`);
  for (const file of files) assert(readFileSync(new URL(`../scripts/${file}`, import.meta.url)).length > 0, `${file} is missing`);
  const render = readFileSync(new URL('../scripts/render-social-card.mjs', import.meta.url), 'utf8');
  assert(render.includes(`../public${new URL(metadata['og:image']).pathname}`), 'The render script writes a different file from the one the page shares');
  assert.match(render, /width: 1200, height: 630/);
});
