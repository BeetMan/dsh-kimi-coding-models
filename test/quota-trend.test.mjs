import test from 'node:test'
import assert from 'node:assert/strict'
import { appendSample, projectHoursToExhaustion, TREND_RETENTION_MS, trendView } from '../quota-trend.js'

const sample = (t, rolling, weekly = 10) => ({ t, rollingPercent: rolling, weeklyPercent: weekly })

test('appendSample prunes entries older than the retention window', () => {
  const now = 1_800_000_000_000
  const history = [sample(now - TREND_RETENTION_MS - 1, 50), sample(now - 1000, 60)]
  const next = appendSample(history, sample(now, 70), now)
  assert.deepEqual(next, [sample(now - 1000, 60), sample(now, 70)])
})

test('appendSample rejects malformed samples', () => {
  assert.throws(() => appendSample([], { t: 1, rollingPercent: 10 }), /quota sample/)
})

test('a steady climb projects the hours left until exhaustion', () => {
  const now = 1_800_000_000_000
  // 1%/min climb for ten minutes, sitting at 80% now -> 20 points / 60 points-per-hour.
  const samples = Array.from({ length: 11 }, (_, index) => sample(now - (10 - index) * 60_000, 70 + index))
  const hours = projectHoursToExhaustion(samples, 'rollingPercent', now)
  assert.ok(Math.abs(hours - 20 / 60) < 0.01)
})

test('a flat or shrinking window reports no exhaustion', () => {
  const now = 1_800_000_000_000
  const flat = Array.from({ length: 10 }, (_, index) => sample(now - (9 - index) * 60_000, 40))
  assert.equal(projectHoursToExhaustion(flat, 'rollingPercent', now), undefined)
  const falling = Array.from({ length: 10 }, (_, index) => sample(now - (9 - index) * 60_000, 90 - index))
  assert.equal(projectHoursToExhaustion(falling, 'rollingPercent', now), undefined)
})

test('too little recent data projects nothing', () => {
  const now = 1_800_000_000_000
  const sparse = [sample(now - 3 * 60_000, 50), sample(now, 55)]
  assert.equal(projectHoursToExhaustion(sparse, 'rollingPercent', now), undefined)
})

test('trendView caps the series and nulls missing projections', () => {
  const now = 1_800_000_000_000
  const samples = Array.from({ length: 100 }, (_, index) => sample(now - (99 - index) * 60_000, index / 10))
  const view = trendView(samples, 60, now)
  assert.equal(view.rolling.length, 60)
  assert.equal(view.weekly.length, 60)
  assert.equal(typeof view.rollingHoursToExhaustion, 'number')
  assert.equal(view.weeklyHoursToExhaustion, null)
  assert.equal(trendView([], 60, now), undefined)
})
