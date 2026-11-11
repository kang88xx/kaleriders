import test from 'node:test';
import assert from 'node:assert/strict';
import { statSync, readFileSync } from 'node:fs';
import { caseStudies, contentStatus } from '../public/case-studies-data.js';
import { eventFilms, wallPhotos } from '../public/refresh-media.js';

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
  assert.equal(caseStudies.filter(item => item.media.type === 'video').length, 2);
  assert.equal(caseStudies.reduce((total, item) => total + item.gallery.length + (item.media.type === 'image' ? 1 : 0), 0), 19);
});

test('photo wall additions are distinct local JPEGs with complete bilingual descriptions', () => {
  const casePhotos = caseStudies.flatMap(item => [...(item.media.type === 'image' ? [item.media.src] : []), ...item.gallery.map(photo => photo.src)]);
  const sources = [...casePhotos, ...wallPhotos.map(photo => photo.src)];
  assert.equal(sources.length, 31);
  assert.equal(new Set(sources).size, sources.length, 'The wall repeats a photo source');
  for (const photo of wallPhotos) {
    assert(photo.src.startsWith('assets/cases/') && !photo.src.includes('..'), photo.src);
    assert.equal(readFileSync(new URL(`../public/${photo.src}`, import.meta.url)).readUInt16BE(0), 0xffd8, photo.src);
    assert(photo.alt.ko.trim() && photo.alt.en.trim(), `${photo.src} description`);
    assert(!/[가-힣]/u.test(photo.alt.en), `${photo.src} English contains untranslated Korean`);
    if ('position' in photo) assert.match(photo.position, /^\d{1,3}% \d{1,3}%$/, photo.src);
  }
});

test('original video sources are MP4 containers and posters are JPEG images', () => {
  for (const item of caseStudies.filter(item => item.media.type === 'video')) {
    const media = readFileSync(new URL(`../public/${item.media.src}`, import.meta.url));
    assert.equal(media.toString('ascii', 4, 8), 'ftyp');
    const poster = readFileSync(new URL(`../public/${item.media.poster}`, import.meta.url));
    assert.equal(poster.readUInt16BE(0), 0xffd8);
  }
});

test('the film row shows one film per case: an MP4 with a JPEG poster and bilingual descriptions', () => {
  const byId = new Map(caseStudies.map(item => [item.id, item]));
  assert.deepEqual(eventFilms.map(film => film.id), ['fogo-mainnet', 'fogo-meetup', 'kgen']);
  for (const film of eventFilms) {
    assert(byId.has(film.id), `${film.id} is not a case`);
    const media = film.media || byId.get(film.id).media;
    assert.equal(media.type, 'video', film.id);
    for (const src of [media.src, media.poster]) assert(src.startsWith('assets/cases/') && !src.includes('..'), src);
    assert.equal(readFileSync(new URL(`../public/${media.src}`, import.meta.url)).toString('ascii', 4, 8), 'ftyp', media.src);
    assert.equal(readFileSync(new URL(`../public/${media.poster}`, import.meta.url)).readUInt16BE(0), 0xffd8, media.poster);
    assert(media.alt.ko.trim() && media.alt.en.trim(), `${film.id} description`);
    assert(!/[가-힣]/u.test(media.alt.en), `${film.id} English contains untranslated Korean`);
  }
});
