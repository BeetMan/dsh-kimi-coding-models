import { createHash } from 'node:crypto'

const DEFAULT_CONTEXT_WINDOW = 1_048_576
const KIMI_COMPAT = {
  supportsStrictMode: false,
  supportsStore: false,
  supportsDeveloperRole: false,
  supportsReasoningEffort: true,
  maxTokensField: 'max_tokens',
  thinkingFormat: 'openai',
  requiresReasoningContentOnAssistantMessages: true,
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]))
  }
  return value
}

/** Stable fingerprint for one route snapshot or synchronization plan. */
export function syncValueFingerprint(value) {
  return createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex')
}

/** Whether a Settings confirmation belongs to this exact synchronization plan. */
export function isSyncConfirmationCurrent(plan, confirmation) {
  return typeof confirmation === 'string' && confirmation.length > 0 && confirmation === plan.syncToken
}

/** Apply a plan only to the exact configuration snapshot it was created from. */
export function applySyncPlanToConfig(current, plan) {
  const currentRoute = current?.providers?.['kimi-coding']
  if (syncValueFingerprint(currentRoute ?? null) !== plan.expectedRouteFingerprint) {
    throw new Error('the kimi-coding route changed during synchronization; check again before writing')
  }
  const next = structuredClone(current ?? {})
  const providers = { ...(next.providers ?? {}) }
  providers['kimi-coding'] = structuredClone(plan.route)
  next.providers = providers
  return next
}

/**
 * Build the complete next route and report every entry that writing it removes.
 * Configured-but-not-served entries are included in `removed`: they are just as
 * affected by replacing the configured model list as entries in the live route.
 */
export function createSyncPlan(live, currentRoute, served, config) {
  const existing = Array.isArray(currentRoute?.models) ? currentRoute.models : undefined
  const written = new Map()
  for (const entry of existing ?? []) {
    if (entry !== null && typeof entry === 'object' && typeof entry.id === 'string') written.set(entry.id, entry)
  }
  const servedSet = new Set(served)
  const models = live.map((model) => {
    const kept = written.get(model.id)
    if (kept !== undefined) {
      if (typeof kept.name === 'string' && kept.name !== model.name) return { ...kept, name: model.name }
      return kept
    }
    if (servedSet.has(model.id)) return { id: model.id }
    const entry = {
      id: model.id,
      name: model.name,
      contextWindow: model.contextWindow ?? DEFAULT_CONTEXT_WINDOW,
      maxTokens: model.maxTokens ?? config.defaultMaxTokens,
      input: model.input,
      compat: { ...KIMI_COMPAT },
    }
    if (model.efforts !== undefined) entry.reasoningEfforts = model.efforts
    return entry
  })
  const liveIds = new Set(live.map(model => model.id))
  const configuredIds = [...written.keys()]
  const currentIds = [...new Set([...configuredIds, ...served])]
  const added = live.filter(model => !servedSet.has(model.id)).map(model => model.id)
  const kept = live.filter(model => servedSet.has(model.id)).map(model => model.id)
  const removed = currentIds.filter(id => !liveIds.has(id))
  const unchanged = existing !== undefined
    && existing.length === models.length
    && existing.every((entry, index) => entry?.id === models[index]?.id && entry?.name === models[index]?.name)
  const changed = added.length > 0 || removed.length > 0 || (existing !== undefined && !unchanged)
  const route = structuredClone({
    ...(currentRoute ?? {}),
    apiKeyEnv: typeof currentRoute?.apiKeyEnv === 'string' ? currentRoute.apiKeyEnv : config.apiKeyEnv,
    api: typeof currentRoute?.api === 'string' ? currentRoute.api : 'openai-completions',
    baseURL: typeof currentRoute?.baseURL === 'string' ? currentRoute.baseURL : config.baseURL,
    models,
  })
  return {
    added,
    kept,
    removed,
    changed,
    route,
    expectedRouteFingerprint: syncValueFingerprint(currentRoute ?? null),
    syncToken: syncValueFingerprint({
      endpoint: config.endpoint,
      credentialRef: config.apiKeyEnv,
      served: [...served].sort(),
      route,
    }),
  }
}
