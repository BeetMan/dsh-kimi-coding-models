/**
 * Keep this profile's `kimi-coding` LLM route in step with Kimi Coding's live
 * model catalog. The Settings panel and the agent tool call the same Host
 * operation; configuration is persisted through the profile's settings seam.
 */
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { REMOTE } from './remote.js'

// Linked local bundles resolve modules from their real directory, not the
// profile's node_modules. Resolve only official runtime packages from the DSH
// installation so a fresh clone needs no dependency-install step.
const installCandidates = [
  process.env.DSH_INSTALL_DIR,
  ...process.resourcesPath ? [join(process.resourcesPath, 'app.asar/dsh/node_modules/@deepseek-ai/dsh')] : [],
].filter(Boolean)
const installDir = installCandidates.find(path => existsSync(join(path, 'package.json')))
if (installDir === undefined) throw new Error('kimi-coding-models: could not locate the running DSH installation')
const hostRequire = createRequire(join(installDir, 'package.json'))
const z = hostRequire('@deepseek-ai/schemastery')
const { RemoteError, TypertRemoteService } = hostRequire('@deepseek-ai/dsh-typert-protocol')

/** LLM provider route this plugin maintains. */
const PROVIDER = 'kimi-coding'
/** Configuration row that owns the route. */
const PI_AI_ENTRY = 'llm-pi-ai'
/** Default live catalog endpoint. */
const DEFAULT_ENDPOINT = 'https://api.kimi.com/coding/v1/models'
/** Default OpenAI-compatible base URL of the route. */
const DEFAULT_BASE_URL = 'https://api.kimi.com/coding/v1'
/** Default Kimi Coding subscription-quota endpoint. */
const DEFAULT_USAGE_ENDPOINT = 'https://api.kimi.com/coding/v1/usages'
/** Default credential reference holding the Kimi Coding API key. */
const DEFAULT_API_KEY_ENV = 'KIMI_CODING_API_KEY'
/** Context capacity assumed when the listing discloses none. */
const DEFAULT_CONTEXT_WINDOW = 1_048_576
/** Output cap assumed when the listing discloses none. */
const DEFAULT_MAX_TOKENS = 32_768
/** Request modalities this harness can attach. */
const SUPPORTED_INPUTS = new Set(['text', 'image'])
/** Credential-reference grammar accepted by the Settings panel. */
const CREDENTIAL_REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/
/**
 * Wire switches the installed pi-ai catalog records for Kimi Coding models.
 * Only fields the pi-ai adapter lets a profile state are named here; the
 * withheld ones keep their pi-ai detection.
 */
const KIMI_COMPAT = {
  supportsStrictMode: false,
  supportsStore: false,
  supportsDeveloperRole: false,
  supportsReasoningEffort: true,
  maxTokensField: 'max_tokens',
  thinkingFormat: 'openai',
  requiresReasoningContentOnAssistantMessages: true,
}

/** Data-only fields; Settings serializes these schemas for the browser. */
const fields = {
  /** Live model listing to read. */
  endpoint: z.string().default(DEFAULT_ENDPOINT),
  /** Base URL to give the route when it declares none. */
  baseURL: z.string().default(DEFAULT_BASE_URL),
  /** Kimi Coding subscription-quota listing to read. */
  usageEndpoint: z.string().default(DEFAULT_USAGE_ENDPOINT),
  /** Credential reference holding the Kimi Coding API key, never the key itself. */
  apiKeyEnv: z.string().role('credential-ref').pattern(CREDENTIAL_REF_PATTERN).default(DEFAULT_API_KEY_ENV),
  /** Output cap for a model whose listing discloses none. */
  defaultMaxTokens: z.number().step(1).min(1).max(Number.MAX_SAFE_INTEGER).default(DEFAULT_MAX_TOKENS),
  /** Run one background sync on the next plugin activation. */
  syncOnStart: z.boolean().default(false),
}

/** Plain schema used for diagnostics and non-Loader callers. */
export const PlainConfig = z.object(fields)
/** Every field is live-editable on Settings → Kimi Coding. */
export const Config = z.object(Object.fromEntries(
  Object.entries(fields).map(([key, schema]) => [key, schema.volatile()]),
))

/** Services this plugin requires. */
export const inject = ['tools']

/** Read current values from Loader volatile references. */
function currentConfig(config) {
  return Object.fromEntries(Object.keys(fields).map(key => [key, config[key].get()]))
}

/** A positive integer, or undefined. */
function positiveInt(value) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined
}

/** Request modalities this harness can attach, from one listing entry. */
function inputsOf(entry) {
  const declared = entry?.modalities?.input
  const inputs = Array.isArray(declared) ? declared.filter(input => SUPPORTED_INPUTS.has(input)) : []
  return inputs.length > 0 ? inputs : ['text']
}

/** Selectable reasoning efforts, from one listing entry's thinking metadata. */
function effortsOf(entry) {
  const valid = entry?.think_efforts?.valid_efforts
  if (!Array.isArray(valid)) return undefined
  const efforts = {}
  for (const effort of valid) {
    if (typeof effort === 'string' && effort.length > 0) efforts[effort] = effort
  }
  return Object.keys(efforts).length > 0 ? efforts : undefined
}

/** One live catalog entry reduced to the fields a route entry needs. */
function toLiveModel(entry) {
  return {
    id: entry.id,
    name: typeof entry.display_name === 'string' && entry.display_name.length > 0 ? entry.display_name : entry.id,
    contextWindow: positiveInt(entry.context_length) ?? positiveInt(entry.limit?.context),
    maxTokens: positiveInt(entry.limit?.output) ?? positiveInt(entry.max_output_tokens),
    input: inputsOf(entry),
    efforts: effortsOf(entry),
  }
}

/** Resolve the API key: the credential store first, then the process environment. */
async function resolveApiKey(ctx, name) {
  const credentials = ctx.get('credentials')
  if (credentials !== undefined) {
    try {
      const hit = await credentials.resolve(name)
      if (hit !== undefined && typeof hit.value === 'string' && hit.value.length > 0) return hit.value
    } catch {
      // An unusable reference falls through to the environment below.
    }
  }
  const ambient = process.env[name]
  return typeof ambient === 'string' && ambient.length > 0 ? ambient : undefined
}

/** Read the live catalog. */
async function fetchLiveModels(config, apiKey, signal) {
  const headers = { accept: 'application/json' }
  if (apiKey !== undefined) headers.authorization = `Bearer ${apiKey}`
  let response
  try {
    response = await fetch(config.endpoint, { headers, ...signal === undefined ? {} : { signal } })
  } catch (error) {
    throw new Error(`could not reach ${config.endpoint}`, { cause: error })
  }
  if (!response.ok) {
    const hint = response.status === 401 || response.status === 403 ? '; check the Kimi Coding API key' : ''
    throw new Error(`${config.endpoint} answered ${response.status}${hint}`)
  }
  let body
  try {
    body = await response.json()
  } catch (error) {
    throw new Error(`${config.endpoint} did not answer JSON`, { cause: error })
  }
  const rows = Array.isArray(body?.data) ? body.data : undefined
  if (rows === undefined) throw new Error(`${config.endpoint} did not answer a model listing`)
  return rows
    .filter(row => row !== null && typeof row === 'object' && typeof row.id === 'string' && row.id.length > 0)
    .map(toLiveModel)
}

/** A finite non-negative number from Kimi's string-or-number quota fields. */
function quotaNumber(value) {
  const number = typeof value === 'number' || typeof value === 'string' ? Number(value) : Number.NaN
  return Number.isFinite(number) && number >= 0 ? number : undefined
}

/** Normalize one quota window without retaining account or wallet metadata. */
function quotaWindow(detail, usedRatio, fallbackResetAt, durationMinutes) {
  const limit = quotaNumber(detail?.limit)
  if (limit === undefined) throw new Error('the quota response did not provide a usable limit')
  const ratio = quotaNumber(usedRatio)
  const used = quotaNumber(detail?.used) ?? (ratio === undefined ? undefined : ratio * limit)
  if (used === undefined) throw new Error('the quota response did not provide usable consumption')
  const remaining = quotaNumber(detail?.remaining) ?? Math.max(0, limit - used)
  const resetAt = detail?.resetTime ?? fallbackResetAt
  if (typeof resetAt !== 'string' || !Number.isFinite(Date.parse(resetAt))) {
    throw new Error('the quota response did not provide a usable reset time')
  }
  return {
    limit,
    used,
    remaining,
    usedPercent: ratio !== undefined ? ratio * 100 : limit > 0 ? used / limit * 100 : 0,
    resetAt,
    ...durationMinutes === undefined ? {} : { durationMinutes },
  }
}

/** Read Kimi Coding's subscription quota through its live usage endpoint. */
async function readUsage(ctx, config, signal) {
  const apiKey = await resolveApiKey(ctx, config.apiKeyEnv)
  const headers = { accept: 'application/json', 'user-agent': 'KimiCLI/1.6' }
  if (apiKey !== undefined) headers.authorization = `Bearer ${apiKey}`
  let response
  try {
    response = await fetch(config.usageEndpoint, { headers, ...signal === undefined ? {} : { signal } })
  } catch (error) {
    throw new Error(`could not reach ${config.usageEndpoint}`, { cause: error })
  }
  if (!response.ok) {
    const hint = response.status === 401 || response.status === 403 ? '; check the Kimi Coding API key' : ''
    throw new Error(`${config.usageEndpoint} answered ${response.status}${hint}`)
  }
  let body
  try {
    body = await response.json()
  } catch (error) {
    throw new Error(`${config.usageEndpoint} did not answer JSON`, { cause: error })
  }
  const rolling = Array.isArray(body?.limits)
    ? body.limits.find(item => item?.window?.duration === 300 && item?.window?.timeUnit === 'TIME_UNIT_MINUTE') ?? body.limits[0]
    : undefined
  const duration = quotaNumber(rolling?.window?.duration)
  const durationMinutes = duration === undefined ? 300
    : rolling?.window?.timeUnit === 'TIME_UNIT_HOUR' ? duration * 60 : duration
  const membership = body?.user?.membership?.level
  return {
    checkedAt: new Date().toISOString(),
    rolling: quotaWindow(rolling?.detail, body?.usages?.limit_5h?.used_ratio, body?.usages?.limit_5h?.reset_time, durationMinutes),
    weekly: quotaWindow(body?.usage, body?.usages?.limit_7d?.used_ratio, body?.usages?.limit_7d?.reset_time),
    ...typeof membership === 'string' && membership.length > 0 ? { membership } : {},
  }
}

/** Model ids the route currently advertises, empty when the route is absent. */
async function servedModelIds(ctx) {
  const llm = ctx.get('llm')
  if (llm === undefined) return []
  try {
    const models = await llm.listModels(PROVIDER)
    return models.map(model => model.id)
  } catch {
    return []
  }
}

/** The route's configured model list, when the profile already declares one. */
function configuredModels(ctx) {
  const editor = ctx.get('configEditor')
  if (editor === undefined) return undefined
  const entry = editor.entries().find(item => item.options.id === PI_AI_ENTRY)
  const route = entry?.options.config?.providers?.[PROVIDER]
  return Array.isArray(route?.models) ? route.models : undefined
}

/**
 * Build the next model list. A model already written keeps its entry verbatim;
 * a model the route already serves but the profile does not declare stays a
 * bare `{ id }` so the installed catalog keeps describing it; every other model
 * gets a complete entry derived from the listing.
 */
function buildModels(live, existing, served, config) {
  const written = new Map()
  for (const entry of existing ?? []) {
    if (entry !== null && typeof entry === 'object' && typeof entry.id === 'string') written.set(entry.id, entry)
  }
  const servedSet = new Set(served)
  return live.map((model) => {
    const kept = written.get(model.id)
    if (kept !== undefined) return kept
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
}

/** Write the model list into the profile's `llm-pi-ai` entry. */
async function writeModels(ctx, config, models) {
  const editor = ctx.get('configEditor')
  if (editor === undefined) {
    throw new Error('this profile has no configuration editor, so the model list cannot be saved')
  }
  const entry = editor.entries().find(item => item.options.id === PI_AI_ENTRY)
  if (entry === undefined) {
    throw new Error(`this profile has no "${PI_AI_ENTRY}" entry to configure the ${PROVIDER} route on`)
  }
  await editor.edit(entry, (current) => {
    const next = structuredClone(current ?? {})
    const providers = { ...(next.providers ?? {}) }
    const route = { ...(providers[PROVIDER] ?? {}) }
    route.apiKeyEnv = typeof route.apiKeyEnv === 'string' ? route.apiKeyEnv : config.apiKeyEnv
    route.api = typeof route.api === 'string' ? route.api : 'openai-completions'
    route.baseURL = typeof route.baseURL === 'string' ? route.baseURL : config.baseURL
    route.models = models
    providers[PROVIDER] = route
    next.providers = providers
    return next
  })
}

/** One check-and-optionally-write pass shared by the tool, UI, and startup sync. */
async function sync(ctx, config, apply, signal) {
  const apiKey = await resolveApiKey(ctx, config.apiKeyEnv)
  const live = await fetchLiveModels(config, apiKey, signal)
  const served = await servedModelIds(ctx)
  const existing = configuredModels(ctx)
  const liveIds = new Set(live.map(model => model.id))
  const added = live.filter(model => !served.includes(model.id)).map(model => model.id)
  const kept = live.filter(model => served.includes(model.id)).map(model => model.id)
  const removed = served.filter(id => !liveIds.has(id))
  const models = buildModels(live, existing, served, config)
  const unchanged = existing !== undefined
    && existing.length === models.length
    && existing.every((entry, index) => entry?.id === models[index]?.id)
  const changed = added.length > 0 || removed.length > 0 || (existing !== undefined && !unchanged)
  if (apply && changed) await writeModels(ctx, config, models)
  return {
    provider: PROVIDER,
    endpoint: config.endpoint,
    checkedAt: new Date().toISOString(),
    live: live.map(model => ({ id: model.id, name: model.name })),
    served: apply ? await servedModelIds(ctx) : served,
    added,
    kept,
    removed,
    applied: apply && changed,
    changed,
  }
}

/** Client-callable facade over the same operation the agent tool invokes. */
class KimiCodingModelsService extends TypertRemoteService {
  constructor(ctx, options) {
    super(ctx, 'kimiCodingModels')
    this.options = options
  }

  async read(signal) {
    try {
      return await this.options.operation(false, signal)
    } catch (error) {
      throw remoteFailure(error)
    }
  }

  async usage(signal) {
    try {
      return await this.options.usage(signal)
    } catch (error) {
      throw remoteFailure(error)
    }
  }

  async sync(apply, signal) {
    try {
      return await this.options.operation(apply, signal)
    } catch (error) {
      throw remoteFailure(error)
    }
  }
}

/** Preserve the actionable reason in the Settings panel. */
function remoteFailure(error) {
  if (error instanceof RemoteError) return error
  return new RemoteError(
    'kimi-coding-models/operation-failed',
    error instanceof Error ? error.message : String(error),
    {},
    { cause: error },
  )
}

/** Model-facing report. */
function formatReport(value) {
  const lines = [
    `Kimi Coding catalog (${value.endpoint}): ${value.live.length} model(s).`,
    `Live: ${value.live.map(model => `${model.id} (${model.name})`).join(', ')}`,
    `Route ${value.provider} currently serves: ${value.served.length > 0 ? value.served.join(', ') : '(none)'}`,
  ]
  if (value.applied) {
    lines.push(value.added.length > 0
      ? `Added to the route: ${value.added.join(', ')}`
      : 'Wrote the live catalog into the route configuration.')
    lines.push('The model selector now offers every model above.')
    if (value.removed.length > 0) lines.push(`Dropped (no longer published): ${value.removed.join(', ')}`)
  } else {
    if (value.added.length > 0) lines.push(`Not served yet: ${value.added.join(', ')}`)
    if (value.removed.length > 0) lines.push(`Served but no longer published: ${value.removed.join(', ')}`)
    lines.push(value.changed
      ? 'Nothing was written. Call again with apply: true to update the route.'
      : 'The route already matches the live catalog.')
  }
  return lines.join('\n')
}

/** Shared output schema for one normalized quota window. */
const QUOTA_WINDOW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['limit', 'used', 'remaining', 'usedPercent', 'resetAt'],
  properties: {
    limit: { type: 'number' },
    used: { type: 'number' },
    remaining: { type: 'number' },
    usedPercent: { type: 'number' },
    resetAt: { type: 'string' },
    durationMinutes: { type: 'number' },
  },
}

/** Model-facing quota report. */
function formatUsageReport(value) {
  const format = (label, window) => `${label}: ${window.usedPercent.toFixed(1)}% used, `
    + `${window.remaining}/${window.limit} remaining; resets ${window.resetAt}`
  const lines = [
    format('5-hour rolling quota', value.rolling),
    format('7-day quota', value.weekly),
    `Checked ${value.checkedAt}`,
  ]
  if (value.membership !== undefined) lines.push(`Membership: ${value.membership}`)
  return lines.join('\n')
}

/** Register the Remote service, model-sync and quota tools, Settings policy, and startup sync. */
export function apply(ctx, config) {
  const current = () => currentConfig(config)
  const operation = (apply, signal) => sync(ctx, current(), apply, signal)
  const usage = signal => readUsage(ctx, current(), signal)

  ctx.inject(['typert'], (scope) => {
    scope.effect(() => scope.typert.register({
      package: REMOTE.package,
      face: 'host',
      schemas: [],
      model: { services: [], events: [], objects: [] },
      invocations: REMOTE.descriptors,
    }), 'kimi-coding-models: remote descriptors')
  })
  ctx.plugin(KimiCodingModelsService, { operation, usage })
  ctx.inject(['settings'], (scope) => {
    scope.effect(() => scope.settings.configure({ auto: false }, ctx.fiber), 'kimi-coding-models: custom settings page')
  })

  ctx.tools.register({
    name: 'kimi_coding_models',
    description: "Read Kimi Coding's live model catalog and compare it with this profile's kimi-coding route. "
      + 'With apply, write every published model into the route configuration so model selectors offer it. '
      + 'Returns the live catalog, the models the route currently serves, and what changed.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        apply: {
          type: 'boolean',
          description: 'Write the live catalog into the profile configuration. Omit to only report the difference.',
        },
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['provider', 'endpoint', 'checkedAt', 'live', 'served', 'added', 'kept', 'removed', 'applied', 'changed'],
        properties: {
          provider: { type: 'string' },
          endpoint: { type: 'string' },
          checkedAt: { type: 'string' },
          live: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['id', 'name'],
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
          served: { type: 'array', items: { type: 'string' } },
          added: { type: 'array', items: { type: 'string' } },
          kept: { type: 'array', items: { type: 'string' } },
          removed: { type: 'array', items: { type: 'string' } },
          applied: { type: 'boolean' },
          changed: { type: 'boolean' },
        },
      },
      render: (_args, value) => [{ type: 'text', text: formatReport(value) }],
      presentationMeta: (_args, value) => value,
    },
    timeoutMs: 60_000,
    execute: async (args, exec) => operation(args?.apply === true, exec.signal),
  })

  ctx.tools.register({
    name: 'kimi_coding_usage',
    description: "Read the current Kimi Coding subscription quota: the 5-hour rolling window and 7-day quota, "
      + 'including used percentage, remaining amount, and reset times. This is read-only.',
    parameters: { type: 'object', additionalProperties: false, properties: {} },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['checkedAt', 'rolling', 'weekly'],
        properties: {
          checkedAt: { type: 'string' },
          rolling: QUOTA_WINDOW_SCHEMA,
          weekly: QUOTA_WINDOW_SCHEMA,
          membership: { type: 'string' },
        },
      },
      render: (_args, value) => [{ type: 'text', text: formatUsageReport(value) }],
      presentationMeta: (_args, value) => value,
    },
    timeoutMs: 30_000,
    isConcurrencySafe: () => true,
    execute: async (_args, exec) => usage(exec.signal),
  })

  ctx.effect(() => {
    if (!current().syncOnStart) return undefined
    let active = true
    void operation(true, undefined).catch((error) => {
      if (!active) return
      ctx.logger?.('kimi-coding-models')?.warn?.(`startup sync failed: ${error instanceof Error ? error.message : String(error)}`)
    })
    return () => { active = false }
  }, 'kimi-coding-models: startup sync')
}
