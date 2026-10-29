import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../public/sample.html', import.meta.url), 'utf8');
const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

test('both sample paths route to the dedicated draft without rewriting the homepage', () => {
  for (const source of ['/sample', '/sample/']) {
    assert(config.rewrites.some(rule => rule.source === source && rule.destination === '/sample.html'));
  }
  assert(!config.rewrites.some(rule => ['/', '/:path*'].includes(rule.source)));
  assert.match(html, /src="\/sample-app\.js\?/);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.match(html, /rel="canonical" href="https:\/\/kaleriders\.com\/sample"/);
  assert(!html.includes('<base'), 'Fragment navigation must stay on /sample');
});

test('sample assets resolve from the domain root, including on the trailing slash alias', () => {
  const references = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map(match => match[1]);
  const local = references.filter(value => !/^(?:https?:|mailto:|#)/.test(value));
  assert(local.length > 10);
  for (const value of local) {
    assert(value.startsWith('/'), `Document-relative asset: ${value}`);
    const path = value.split(/[?#]/)[0];
    assert(existsSync(new URL(`../public${path}`, import.meta.url)), `Missing asset: ${path}`);
  }
});
