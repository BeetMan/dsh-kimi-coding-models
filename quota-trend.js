/**
 * Quota history sampling and exhaustion projection. Pure functions only; the
 * Host owns persistence and calls these to append samples and derive the
 * wire-level trend view.
 */

/** Keep at most seven days of one-per-minute samples. */
export const TREND_RETENTION_MS = 7 * 24 * 60 * 60 * 1000
export const TREND_SAMPLE_LIMIT = 10_080

/**
 * Append one sample and prune anything older than the retention window.
 * A sample carries both windows' percent and reset time so a projection can
 * tell cycles apart. Samples are kept in arrival order.
 */
export function appendSample(history, sample, now = Date.now()) {
  for (const key of ['t', 'rollingPercent', 'weeklyPercent']) {
    if (!Number.isFinite(sample?.[key])) throw new Error(`a quota sample needs a finite ${key}`)
  }
  for (const key of ['rollingResetAt', 'weeklyResetAt']) {
    if (typeof sample?.[key] !== 'string' || !Number.isFinite(Date.parse(sample[key]))) {
      throw new Error(`a quota sample needs a parseable ${key}`)
    }
  }
  const cutoff = now - TREND_RETENTION_MS
  const kept = history.filter(item => item.t >= cutoff)
  kept.push(sample)
  return kept.length > TREND_SAMPLE_LIMIT ? kept.slice(kept.length - TREND_SAMPLE_LIMIT) : kept
}

const RESET_KEY = { rollingPercent: 'rollingResetAt', weeklyPercent: 'weeklyResetAt' }

/**
 * Hours until a window reaches 100% at the pace of the last `windowMs` of
 * samples in the same quota cycle as the newest sample, by least-squares on
 * percent-versus-time. Returns undefined when the slope is not clearly
 * positive, there is too little data, or the window resets before the
 * projected exhaustion — that cycle simply will not run out.
 */
export function projectHoursToExhaustion(samples, field, now = Date.now(), windowMs = 2 * 60 * 60 * 1000) {
  const cutoff = now - windowMs
  const recent = samples.filter(item => item.t >= cutoff)
  if (recent.length < 6) return undefined
  const resetKey = RESET_KEY[field]
  const cycle = recent[recent.length - 1][resetKey]
  const cycleSamples = recent.filter(item => item[resetKey] === cycle)
  if (cycleSamples.length < 3) return undefined
  const slope = leastSquaresSlope(cycleSamples.map(item => [item.t / 3_600_000, item[field]]))
  if (slope === undefined || slope <= 0.25) return undefined
  const current = cycleSamples[cycleSamples.length - 1][field]
  const hours = (100 - current) / slope
  if (!Number.isFinite(hours) || hours <= 0) return undefined
  const hoursUntilReset = (Date.parse(cycle) - now) / 3_600_000
  if (!Number.isFinite(hoursUntilReset) || hours >= hoursUntilReset) return undefined
  return Math.min(hours, 24 * 30)
}

/** Slope (y per x) of the least-squares line, or undefined with no variance in x. */
function leastSquaresSlope(points) {
  const n = points.length
  if (n < 2) return undefined
  let sumX = 0; let sumY = 0; let sumXY = 0; let sumXX = 0
  for (const [x, y] of points) {
    sumX += x; sumY += y; sumXY += x * y; sumXX += x * x
  }
  const variance = n * sumXX - sumX * sumX
  if (variance === 0) return undefined
  return (n * sumXY - sumX * sumY) / variance
}

/**
 * Wire-level trend view: the newest `points` samples as two percent series
 * plus per-window exhaustion estimates. Returns undefined without history.
 */
export function trendView(samples, points = 60, now = Date.now()) {
  if (!Array.isArray(samples) || samples.length === 0) return undefined
  const recent = samples.slice(-points)
  const round = value => Math.round(value * 10) / 10
  return {
    rolling: recent.map(item => round(item.rollingPercent)),
    weekly: recent.map(item => round(item.weeklyPercent)),
    rollingHoursToExhaustion: projectHoursToExhaustion(samples, 'rollingPercent', now) ?? null,
    weeklyHoursToExhaustion: projectHoursToExhaustion(samples, 'weeklyPercent', now) ?? null,
  }
}
