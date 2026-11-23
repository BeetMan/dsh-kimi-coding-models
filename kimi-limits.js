/**
 * Kimi Coding model limits snapshot from @earendil-works/pi-ai 1.6.0.
 *
 * The live listing discloses no output cap, and the pi-ai build bundled with
 * the running DSH may predate a model or carry an older cap. These values are
 * used only when neither the listing nor an existing route entry supplies one;
 * a per-model setting in Settings always wins, and existing entries keep their
 * configured capacities.
 */
const LIMITS = Object.freeze({
  'k3': { contextWindow: 1_048_576, maxTokens: 1_048_576 },
  'k3-256k': { contextWindow: 262_144, maxTokens: 262_144 },
  'k3.1-pro': { contextWindow: 1_048_576, maxTokens: 1_048_576 },
  'k3.1-pro-highspeed': { contextWindow: 1_048_576, maxTokens: 1_048_576 },
  'kimi-for-coding': { contextWindow: 1_048_576, maxTokens: 32_768 },
  'kimi-for-coding-highspeed': { contextWindow: 262_144, maxTokens: 32_768 },
})

/** Known limits for one model id, or undefined for an unknown model. */
export function limitsOf(id) {
  return Object.hasOwn(LIMITS, id) ? LIMITS[id] : undefined
}
