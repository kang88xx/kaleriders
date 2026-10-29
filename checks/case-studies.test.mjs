import test from 'node:test';
import assert from 'node:assert/strict';
import { statSync, readFileSync } from 'node:fs';
import { caseStudies, contentStatus } from '../public/case-studies-data.js';

test('illustrative cases remain explicitly marked as drafts', () => {
  assert.equal(contentStatus, 'draft');
  assert.equal(caseStudies.length, 5);
  assert.equal(new Set(caseStudies.map(item => item.id)).size, 5);
  assert(caseStudies.every(item => item.status === 'draft'));
});

test('every story, metric and accessible description has complete bilingual copy', () => {
  function inspect(value, path) {
    if (!value || typeof value !== 'object') return;
    if ('ko' in value || 'en' in value) {
      assert.equal(typeof value.ko, 'string', `${path}.ko`);
      assert.equal(typeof value.en, 'string', `${path}.en`);
      assert(value.ko.trim() && value.en.trim(), `${path} is not empty`);
      assert(!/[가-힣]/u.test(value.en), `${path} English contains untranslated Korean`);
    }
    for (const [key, child] of Object.entries(value)) inspect(child, `${path}.${key}`);
  }
  inspect(caseStudies, 'cases');
});

test('every gallery image, video and poster resolves to a nonempty local asset', () => {
  for (const item of caseStudies) {
    for (const src of [item.media.src, item.media.poster, ...item.gallery.map(photo => photo.src)].filter(Boolean)) {
      assert(src.startsWith('assets/cases/') && !src.includes('..'), src);
      assert(statSync(new URL(`../public/${src}`, import.meta.url)).size > 0, src);
    }
  }
  assert.equal(caseStudies.filter(item => item.media.type === 'video').length, 3);
  assert.equal(caseStudies.reduce((total, item) => total + item.gallery.length + (item.media.type === 'image' ? 1 : 0), 0), 14);
});

test('original video sources are MP4 containers and posters are JPEG images', () => {
  for (const item of caseStudies.filter(item => item.media.type === 'video')) {
    const media = readFileSync(new URL(`../public/${item.media.src}`, import.meta.url));
    assert.equal(media.toString('ascii', 4, 8), 'ftyp');
    const poster = readFileSync(new URL(`../public/${item.media.poster}`, import.meta.url));
    assert.equal(poster.readUInt16BE(0), 0xffd8);
  }
});
