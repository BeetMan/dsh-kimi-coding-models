import test from 'node:test'
import assert from 'node:assert/strict'
import { appendSample, projectHoursToExhaustion, TREND_RETENTION_MS, trendView } from '../quota-trend.js'

const RESET = '2026-11-24T10:00:00.000Z'
const NEXT_RESET = '2026-11-24T15:00:00.000Z'
const sample = (t, rolling, weekly = 10, rollingResetAt = RESET, weeklyResetAt = RESET) => ({
  t, rollingPercent: rolling, weeklyPercent: weekly, rollingResetAt, weeklyResetAt,
})

test('appendSample prunes entries older than the retention window', () => {
  const now = 1_800_000_000_000
  const history = [sample(now - TREND_RETENTION_MS - 1, 50), sample(now - 1000, 60)]
  const next = appendSample(history, sample(now, 70), now)
  assert.deepEqual(next, [sample(now - 1000, 60), sample(now, 70)])
})

test('appendSample rejects malformed samples', () => {
  assert.throws(() => appendSample([], { t: 1, rollingPercent: 10 }), /weeklyPercent/)
  assert.throws(() => appendSample([], { t: 1, rollingPercent: 10, weeklyPercent: 5 }), /rollingResetAt/)
  assert.throws(() => appendSample([], sample(1, 10, 5, 'not-a-date')), /rollingResetAt/)
})

test('a steady climb projects the hours left until exhaustion', () => {
  const resetAt = '2026-11-24T10:00:00.000Z'
  const resetMs = Date.parse(resetAt)
  const now = resetMs - 3 * 60 * 60 * 1000
  // 1%/min climb for ten minutes, sitting at 80% three hours before reset.
  const samples = Array.from({ length: 11 }, (_, index) => sample(now - (10 - index) * 60_000, 70 + index, 10, resetAt))
  const hours = projectHoursToExhaustion(samples, 'rollingPercent', now)
  assert.ok(Math.abs(hours - 20 / 60) < 0.01)
})

test('a projection never outlives the window reset time', () => {
  // 1%/min climb ending at the current 80%: exhaustion in 20 minutes.
  const build = (now, resetAt) => Array.from({ length: 11 },
    (_, index) => sample(now - (10 - index) * 60_000, 70 + index, 10, resetAt))
  const base = Date.parse('2026-11-24T10:00:00.000Z')

  const beforeReset = build(base - 30 * 60 * 1000, '2026-11-24T10:30:00.000Z')
  const hours = projectHoursToExhaustion(beforeReset, 'rollingPercent', base - 30 * 60 * 1000)
  assert.ok(Math.abs(hours - 20 / 60) < 0.01)

  const resetFirst = build(base - 2 * 60 * 1000, '2026-11-24T10:02:00.000Z')
  assert.equal(projectHoursToExhaustion(resetFirst, 'rollingPercent', base - 2 * 60 * 1000), undefined)
})

test('projections ignore samples from a previous cycle', () => {
  const oldReset = '2026-11-23T10:00:00.000Z'
  const newReset = '2026-11-24T10:00:00.000Z'
  const newResetMs = Date.parse(newReset)
  const now = newResetMs - 2 * 60 * 60 * 1000
  const oldCycle = Array.from({ length: 8 }, (_, index) => sample(now - (30 - index) * 60_000, 95 + index, 10, oldReset))
  const newCycle = Array.from({ length: 5 }, (_, index) => sample(now - (4 - index) * 60_000, 10 + index, 10, newReset))
  const hours = projectHoursToExhaustion([...oldCycle, ...newCycle], 'rollingPercent', now)
  // Only the five new-cycle samples count: 1%/min from 14%, two hours to reset.
  assert.ok(hours !== undefined && hours < 2)
})

test('a flat or shrinking window reports no exhaustion', () => {
  const now = Date.parse(RESET) - 3 * 60 * 60 * 1000
  const flat = Array.from({ length: 10 }, (_, index) => sample(now - (9 - index) * 60_000, 40))
  assert.equal(projectHoursToExhaustion(flat, 'rollingPercent', now), undefined)
  const falling = Array.from({ length: 10 }, (_, index) => sample(now - (9 - index) * 60_000, 90 - index))
  assert.equal(projectHoursToExhaustion(falling, 'rollingPercent', now), undefined)
})

test('too little recent or new-cycle data projects nothing', () => {
  const now = Date.parse(RESET) - 3 * 60 * 60 * 1000
  const sparse = [sample(now - 3 * 60_000, 50), sample(now, 55)]
  assert.equal(projectHoursToExhaustion(sparse, 'rollingPercent', now), undefined)
  const oldCycle = Array.from({ length: 10 }, (_, index) => sample(now - (9 - index) * 60_000, 80 + index, 10, NEXT_RESET))
  const fresh = sample(now, 5, 10)
  assert.equal(projectHoursToExhaustion([...oldCycle, fresh], 'rollingPercent', now), undefined)
})

test('trendView caps the series and nulls missing projections', () => {
  const now = 1_800_000_000_000
  const farReset = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString()
  const samples = Array.from({ length: 100 }, (_, index) => sample(now - (99 - index) * 60_000, index / 10, 10, farReset, farReset))
  const view = trendView(samples, 60, now)
  assert.equal(view.rolling.length, 60)
  assert.equal(view.weekly.length, 60)
  assert.equal(typeof view.rollingHoursToExhaustion, 'number')
  assert.equal(view.weeklyHoursToExhaustion, null)
  assert.equal(trendView([], 60, now), undefined)
})
