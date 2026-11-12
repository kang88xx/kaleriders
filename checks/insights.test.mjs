import test from 'node:test';
import assert from 'node:assert/strict';
import { getPerformanceSummary, performanceData } from '../public/service-performance-data.js';

// The owner asked on 2026-11-12 for 2, 4 and 8 weeks in place of 4, 8 and 12.
test('the report example offers 2, 4 and 8 weeks and its data ends at the longest period', () => {
  assert.deepEqual(performanceData.periods, [2, 4, 8]);
  assert.equal(performanceData.defaultPeriod, 4, 'The report should open on the middle period');
  assert.equal(performanceData.weeks.length, Math.max(...performanceData.periods), 'The chart would end before or after the longest period');
  assert.deepEqual(performanceData.weeks.map(row => row.week), [1, 2, 3, 4, 5, 6, 7, 8]);
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
