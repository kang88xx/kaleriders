import test from 'node:test';
import assert from 'node:assert/strict';
import { getPerformanceSummary, performanceData } from '../public/service-performance-data.js';

// The owner asked on 2026-11-12 for 2, 4 and 8 weeks in place of 4, 8 and 12.
test('the report example offers 2, 4 and 8 weeks and its data ends at the longest period', () => {
  assert.deepEqual(performanceData.periods, [2, 4, 8]);
  // The report plays 2, 4, 8 weeks by itself from the first period; with reduced motion it stays on this one.
  assert.equal(performanceData.defaultPeriod, 4, 'The resting report should show the middle period');
  assert.equal(performanceData.weeks.length, Math.max(...performanceData.periods), 'The chart would end before or after the longest period');
  assert.deepEqual(performanceData.weeks.map(row => row.week), [1, 2, 3, 4, 5, 6, 7, 8]);
  // The chart's scale runs 0, 500, 1,000, 1,500, 2,000 (owner, 2026-11-13); the line should use it.
  const peak = Math.max(...performanceData.weeks.map(row => row.actions));
  assert(peak > 1500 && peak <= 2000, `The weekly peak ${peak} does not fit a 0 to 2,000 scale`);
});

test('each period sums the weeks up to it', () => {
  for (const period of performanceData.periods) {
    const summary = getPerformanceSummary(period);
    assert.equal(summary.weeks.length, period);
    assert.equal(summary.actions, performanceData.weeks.slice(0, period).reduce((sum, row) => sum + row.actions, 0));
    assert(summary.conversion > 0 && summary.conversion < 100);
  }
  assert.throws(() => getPerformanceSummary(12), RangeError);
});

// The owner asked on 2026-11-13 for the chart's scale and the figure by the end point to be drawn
// as a mosaic, like the three totals. Only the week labels (W1, 2주) remain as text in the chart.
test('the chart writes no figure as text', async () => {
  const { readFileSync } = await import('node:fs');
  const source = readFileSync(new URL('../public/refresh-insights.js', import.meta.url), 'utf8');
  const texts = [...source.matchAll(/<text\b[^>]*>(.*?)<\/text>/g)];
  assert.equal(texts.length, 1, 'The chart should hold one kind of text: the week labels');
  assert(!texts[0][1].includes('number('), 'A chart text shows a figure');
  assert.match(source, /<svg class="ri-chart-value" data-ri-value/, 'The figure by the end point should be a mosaic');
  assert.match(source, /\$\{axisMosaic\(tick\)\}/, 'The scale should be drawn with mosaics');
  assert(!/textContent\s*=\s*number\(/.test(source), 'A figure is written into the chart as text');
});

// The chart mosaics are filled with currentColor, so each needs a colour from the stylesheet:
// without one they would take the page's text colour by accident.
test('the stylesheet colours both chart mosaics', async () => {
  const { readFileSync } = await import('node:fs');
  const source = readFileSync(new URL('../public/refresh-insights.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../public/refresh-insights.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const name of ['ri-axis-mosaic', 'ri-chart-value']) {
    assert(source.includes(`<svg class="${name}"`), `The chart no longer draws .${name}`);
    const rules = [...css.matchAll(new RegExp(`\\.${name}\\s*\\{([^}]*)\\}`, 'g'))].map(match => match[1]);
    assert(rules.some(rule => /(^|;)\s*color\s*:/.test(rule)), `.${name} has no colour`);
    assert(!rules.some(rule => /\bfont(-size)?\s*:/.test(rule)), `.${name} still carries text styles`);
  }
});
