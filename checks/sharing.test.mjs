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
    assert.match(metadata[key], /KALE Riders.*Korea.*lasting fan relationships/);
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
  assert.match(metadata['og:image:alt'], /Global projects.*Local connections/);
});
