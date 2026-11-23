/**
 * Interval scheduling for background catalog synchronization. The Host checks
 * once per tick whether the configured interval has elapsed; keeping the
 * decision pure makes the boundary behavior testable without a timer.
 */

/** How often the background scheduler looks at the configured interval. */
export const AUTO_SYNC_TICK_MS = 60_000

/** Longest accepted interval, in minutes: one week. */
export const MAX_SYNC_INTERVAL_MINUTES = 10_080

/** Milliseconds represented by a configured interval, or 0 when disabled. */
export function syncIntervalMs(minutes) {
  return typeof minutes === 'number' && Number.isFinite(minutes) && minutes > 0
    ? Math.min(minutes, MAX_SYNC_INTERVAL_MINUTES) * 60_000
    : 0
}

/**
 * Whether the scheduler should attempt one sync now. The first enabled tick
 * runs immediately so a newly saved interval takes effect without waiting a
 * full period; later attempts wait for the configured interval.
 */
export function isAutoSyncDue(now, lastAttemptAt, minutes) {
  const interval = syncIntervalMs(minutes)
  if (interval === 0) return false
  if (typeof lastAttemptAt !== 'number' || !Number.isFinite(lastAttemptAt) || lastAttemptAt <= 0) return true
  return now - lastAttemptAt >= interval
}
