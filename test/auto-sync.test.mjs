import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AUTO_SYNC_TICK_MS, MAX_SYNC_INTERVAL_MINUTES, isAutoSyncDue, syncIntervalMs } from '../auto-sync.js'

test('interval zero or an unusable value disables scheduling', () => {
  for (const minutes of [0, -5, undefined, null, Number.NaN, '30']) {
    assert.equal(syncIntervalMs(minutes), 0)
    assert.equal(isAutoSyncDue(Date.now(), 0, minutes), false)
  }
})

test('a configured interval is expressed in milliseconds and capped at one week', () => {
  assert.equal(syncIntervalMs(1), 60_000)
  assert.equal(syncIntervalMs(90), 5_400_000)
  assert.equal(syncIntervalMs(MAX_SYNC_INTERVAL_MINUTES), MAX_SYNC_INTERVAL_MINUTES * 60_000)
  assert.equal(syncIntervalMs(MAX_SYNC_INTERVAL_MINUTES + 1), MAX_SYNC_INTERVAL_MINUTES * 60_000)
})

test('the first enabled tick is due immediately', () => {
  const now = 1_700_000_000_000
  assert.equal(isAutoSyncDue(now, 0, 30), true)
  assert.equal(isAutoSyncDue(now, -1, 30), true)
  assert.equal(isAutoSyncDue(now, undefined, 30), true)
})

test('later ticks wait for the configured interval and fire at the boundary', () => {
  const start = 1_700_000_000_000
  assert.equal(isAutoSyncDue(start + AUTO_SYNC_TICK_MS, start, 30), false)
  assert.equal(isAutoSyncDue(start + 29 * 60_000, start, 30), false)
  assert.equal(isAutoSyncDue(start + 30 * 60_000, start, 30), true)
  assert.equal(isAutoSyncDue(start + 31 * 60_000, start, 30), true)
})

test('the tick is at most one minute so precision never exceeds the interval', () => {
  assert.equal(AUTO_SYNC_TICK_MS, 60_000)
})
