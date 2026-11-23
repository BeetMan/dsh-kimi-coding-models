/**
 * Keep this profile's `kimi-coding` LLM route in step with Kimi Coding's live
 * model catalog. The Settings panel and the agent tool call the same Host
 * operation; configuration is persisted through the profile's settings seam.
 */
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { AsyncLocalStorage } from 'node:async_hooks'
import { REMOTE } from './remote.js'
import { limitsOf } from './kimi-limits.js'
import { AUTO_SYNC_TICK_MS, MAX_SYNC_INTERVAL_MINUTES, isAutoSyncDue } from './auto-sync.js'
import { applyModelSettings, applySyncPlanToConfig, createSyncPlan, isSyncConfirmationCurrent } from './sync-plan.js'

// Linked local bundles resolve modules from their real directory, not the
// profile's node_modules. Resolve only official runtime packages from the DSH
// installation so a fresh clone needs no dependency-install step.
const installCandidates = [
  // Only shell tool executions receive DSH_INSTALL_DIR: dsh-shell-env builds
  // that DSH_* overlay per call, so the Host process itself never has it. Keep
  // it first for CLI and source launches, then accept the packaged Desktop
  // layouts, whose asar root is itself a valid require anchor.
  process.env.DSH_INSTALL_DIR,
  ...process.resourcesPath ? [join(process.resourcesPath, 'app.asar')] : [],
  ...process.resourcesPath ? [join(process.resourcesPath, 'app')] : [],
  ...process.resourcesPath ? [join(process.resourcesPath, 'app.asar/dsh/node_modules/@deepseek-ai/dsh')] : [],
].filter(Boolean)
const installAnchor = installCandidates.find(path => existsSync(join(path, 'package.json')))
  ?? installCandidates.find(path => existsSync(join(path, 'node_modules/@deepseek-ai/schemastery')))
if (installAnchor === undefined) throw new Error(
  `kimi-coding-models: could not locate the running DSH installation (tried: ${installCandidates.join(', ') || 'nothing'})`,
)
const hostRequire = createRequire(join(installAnchor, 'package.json'))
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
/** Output cap assumed when the listing discloses none; Kimi documents 131072 for K3. */
const DEFAULT_MAX_TOKENS = 131_072
/** Request modalities this harness can attach. */
const SUPPORTED_INPUTS = new Set(['text', 'image'])
/** Credential-reference grammar accepted by the Settings panel. */
const CREDENTIAL_REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/

/**
 * HMR keeps the active reload transaction in an AsyncLocalStorage on its
 * service. A timer created while a plugin is hot-reloaded inherits that
 * context, and a configuration write started from it would be rejected as a
 * nested HMR transaction. Background syncs therefore run outside that context
 * whenever the service exposes it; without HMR they run unchanged.
 */
function hmrTransactionStorage(ctx) {
  const hmr = ctx.get('hmr')
  if (hmr === undefined || hmr === null) return undefined
  if (hmr.executing instanceof AsyncLocalStorage) return hmr.executing
  for (const value of Object.values(hmr)) {
    if (value instanceof AsyncLocalStorage) return value
  }
  return undefined
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
  /** Run a background sync at most once per this many minutes; 0 disables it. */
  syncIntervalMinutes: z.number().step(1).min(0).max(MAX_SYNC_INTERVAL_MINUTES).default(0),
  /** Show the quota pill while the conversation uses the kimi-coding route. */
  showChatQuota: z.boolean().default(true),
  /** Visual treatment of the chat quota pill. */
  chatQuotaStyle: z.union([z.const('badge'), z.const('plain'), z.const('bars'), z.const('ring'), z.const('bar'), z.const('dot')]).default('badge'),
  /** Draw the bordered pill around the chat quota indicator. */
  chatQuotaBorder: z.boolean().default(true),
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

/** Normalize selector labels to a single, recognizable Kimi prefix. */
function kimiDisplayName(raw) {
  const name = String(raw).trim()
  return /^kimi(?:\s|[-_]|$)/i.test(name) ? name : `Kimi ${name}`
}

/** One live catalog entry reduced to the fields a route entry needs. */
function toLiveModel(entry) {
  const displayName = typeof entry.display_name === 'string' && entry.display_name.length > 0 ? entry.display_name : entry.id
  return {
    id: entry.id,
    name: kimiDisplayName(displayName),
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

/** Accept HTTPS endpoints and HTTP proxies on the loopback interface. */
function endpointUrl(value) {
  const url = URL.parse(value)
  if (url?.protocol === 'https:') return url
  if (url?.protocol === 'http:') {
    const host = url.hostname
    if (host === 'localhost' || host === '[::1]' || /^127(?:\.\d+){3}$/.test(host)) return url
  }
  throw new Error('use an HTTPS endpoint or a loopback HTTP address')
}

/** Keep credentials and query parameters out of reports and diagnostics. */
function displayEndpoint(url) {
  return url.origin + url.pathname
}

async function readEndpoint(url, headers, signal) {
  const label = displayEndpoint(url)
  const deadline = AbortSignal.timeout(30_000)
  const requestSignal = signal === undefined ? deadline : AbortSignal.any([signal, deadline])
  let response
  try {
    response = await fetch(url, { headers, signal: requestSignal })
  } catch {
    const reason = signal?.aborted ? 'cancelled' : deadline.aborted ? 'timed out after 30 seconds' : 'unreachable'
    throw new Error(`could not read ${label} (${reason})`)
  }
  if (!response.ok) {
    const hint = response.status === 401 || response.status === 403 ? '; check the Kimi Coding API key' : ''
    throw new Error(`${label} answered ${response.status}${hint}`)
  }
  try {
    return await response.json()
  } catch {
    throw new Error(`${label} did not answer JSON`)
  }
}

/** Read the complete live catalog before planning any removals. */
async function fetchLiveModels(url, apiKey, signal) {
  const headers = { accept: 'application/json' }
  if (apiKey !== undefined) headers.authorization = `Bearer ${apiKey}`
  const body = await readEndpoint(url, headers, signal)
  if (!Array.isArray(body?.data)) throw new Error(`${displayEndpoint(url)} did not answer a model listing`)
  if (body.data.some(row => typeof row?.id !== 'string' || !row.id.trim())) {
    throw new Error(`${displayEndpoint(url)} returned a model without a valid id`)
  }
  return body.data.map(toLiveModel)
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
  const body = await readEndpoint(endpointUrl(config.usageEndpoint), headers, signal)
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
  } catch (error) {
    throw new Error(`could not list the models currently served by ${PROVIDER}`, { cause: error })
  }
}

/** The complete configured route, used to plan and guard one exact write. */
function configuredRoute(ctx) {
  const editor = ctx.get('configEditor')
  if (editor === undefined) return undefined
  const entry = editor.entries().find(item => item.options.id === PI_AI_ENTRY)
  return entry?.options.config?.providers?.[PROVIDER]
}

/** Write one planned route only if the current route still matches its snapshot. */
async function writeRoute(ctx, plan) {
  const editor = ctx.get('configEditor')
  if (editor === undefined) {
    throw new Error('this profile has no configuration editor, so the model list cannot be saved')
  }
  const entry = editor.entries().find(item => item.options.id === PI_AI_ENTRY)
  if (entry === undefined) {
    throw new Error(`this profile has no "${PI_AI_ENTRY}" entry to configure the ${PROVIDER} route on`)
  }
  await editor.edit(entry, current => applySyncPlanToConfig(current, plan))
}

/** One configured model reduced to the fields the Settings editor needs. */
function modelSummary(model) {
  const limits = limitsOf(model.id)
  return {
    id: model.id,
    ...typeof model.name === 'string' && model.name.length > 0 ? { name: model.name } : {},
    ...positiveInt(model.maxTokens) === undefined ? {} : { maxTokens: model.maxTokens },
    ...positiveInt(model.contextWindow) === undefined ? {} : { contextWindow: model.contextWindow },
    ...limits === undefined ? {} : {
      ...limits.contextWindow === undefined ? {} : { piContextWindow: limits.contextWindow },
      ...limits.maxTokens === undefined ? {} : { piMaxTokens: limits.maxTokens },
    },
  }
}

/** Configured route models as the Settings editor sees them. */
function configuredModels(ctx) {
  const route = configuredRoute(ctx)
  const models = Array.isArray(route?.models) ? route.models : []
  return {
    provider: PROVIDER,
    models: models
      .filter(model => model !== null && typeof model === 'object'
        && typeof model.id === 'string' && model.id.length > 0)
      .map(modelSummary),
  }
}

/** Set or clear explicit context and output limits on configured route entries. */
async function writeModelSettings(ctx, settings) {
  const editor = ctx.get('configEditor')
  if (editor === undefined) {
    throw new Error('this profile has no configuration editor, so model limits cannot be saved')
  }
  const entry = editor.entries().find(item => item.options.id === PI_AI_ENTRY)
  if (entry === undefined) {
    throw new Error(`this profile has no "${PI_AI_ENTRY}" entry to configure the ${PROVIDER} route on`)
  }
  await editor.edit(entry, (current) => {
    const providers = { ...(current?.providers ?? {}) }
    providers[PROVIDER] = applyModelSettings(providers[PROVIDER], settings)
    return { ...current, providers }
  })
  return configuredModels(ctx)
}

/** One check-and-optionally-write pass shared by the tool, UI, and startup sync. */
async function sync(ctx, config, apply, signal, options = {}) {
  const apiKey = await resolveApiKey(ctx, config.apiKeyEnv)
  const endpoint = endpointUrl(config.endpoint)
  const live = await fetchLiveModels(endpoint, apiKey, signal)
  const served = await servedModelIds(ctx)
  const route = configuredRoute(ctx)
  const plan = createSyncPlan(live, route, served, config)
  if (apply && live.length === 0 && plan.removed.length > 0 && !options.requireConfirmation) {
    throw new Error('the catalog is empty; review and confirm the removals in Settings → Kimi Coding')
  }
  const confirmationCurrent = !options.requireConfirmation
    || isSyncConfirmationCurrent(plan, options.confirmation)
  const staleConfirmation = Boolean(apply && plan.changed && !confirmationCurrent)
  const write = apply && plan.changed && confirmationCurrent
  if (write) {
    if (typeof route?.baseURL !== 'string') endpointUrl(config.baseURL)
    await writeRoute(ctx, plan)
  }
  return {
    provider: PROVIDER,
    endpoint: displayEndpoint(endpoint),
    checkedAt: new Date().toISOString(),
    live: live.map(model => ({ id: model.id, name: model.name })),
    served: write ? await servedModelIds(ctx) : served,
    added: plan.added,
    kept: plan.kept,
    removed: plan.removed,
    applied: write,
    changed: plan.changed,
    syncToken: plan.syncToken,
    confirmationStale: staleConfirmation,
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

  async sync(apply, confirmation, signal) {
    try {
      return await this.options.operation(apply, signal, { requireConfirmation: true, confirmation })
    } catch (error) {
      throw remoteFailure(error)
    }
  }

  async models() {
    try {
      return this.options.models()
    } catch (error) {
      throw remoteFailure(error)
    }
  }

  async saveModels(input, signal) {
    try {
      return await this.options.saveModels(input.models)
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
    if (value.removed.length > 0) lines.push(`Configured or served but no longer published: ${value.removed.join(', ')}`)
    if (value.live.length === 0 && value.removed.length > 0) {
      lines.push('Review and confirm the empty catalog in Settings → Kimi Coding to remove these models.')
    } else {
      lines.push(value.changed
        ? 'Nothing was written. Call again with apply: true to update the route.'
        : 'The route already matches the live catalog.')
    }
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

/** Normalize the tool's optional per-model limit edits. */
function normalizedModelSettings(value) {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) throw new Error('models must be an array of { id, contextWindow?, maxTokens? } entries')
  return value.map((setting) => {
    if (setting === null || typeof setting !== 'object' || typeof setting.id !== 'string' || setting.id.length === 0) {
      throw new Error('each model entry needs the model id')
    }
    const model = { id: setting.id }
    for (const field of ['contextWindow', 'maxTokens']) {
      if (setting[field] === undefined) continue
      if (setting[field] === null) {
        model[field] = null
        continue
      }
      if (!Number.isInteger(setting[field]) || setting[field] <= 0) {
        throw new Error(`the ${field} for ${setting.id} must be a positive whole number or null`)
      }
      model[field] = setting[field]
    }
    if (!Object.hasOwn(model, 'contextWindow') && !Object.hasOwn(model, 'maxTokens')) {
      throw new Error(`the entry for ${setting.id} sets no limit`)
    }
    return model
  })
}

/** Model-facing report of the configured models and their explicit limits. */
function formatModelsReport(value) {
  if (value.models.length === 0) return `The ${value.provider} route currently lists no models.`
  const lines = [`${value.provider} route: ${value.models.length} model(s).`]
  for (const model of value.models) {
    const context = model.contextWindow === undefined ? 'inherits the catalog context' : `context ${model.contextWindow}`
    const output = model.maxTokens === undefined ? 'inherits the catalog output cap' : `max output ${model.maxTokens}`
    lines.push(`- ${model.name ?? model.id} (${model.id}): ${context}; ${output}`)
  }
  return lines.join('\n')
}

/** Register the Remote service, model-sync and quota tools, Settings policy, startup sync, and interval sync. */
export function apply(ctx, config) {
  const current = () => currentConfig(config)
  const transaction = hmrTransactionStorage(ctx)
  const outsideTransaction = operation => transaction === undefined ? operation() : transaction.exit(operation)
  const warn = message => ctx.logger?.('kimi-coding-models')?.warn?.(message)
  const info = message => ctx.logger?.('kimi-coding-models')?.info?.(message)
  // The UI, the agent tool, the startup sync, and the interval scheduler share
  // one in-flight flag so a background write never races a foreground one.
  let syncing = false
  const runSync = async (apply, signal, options) => {
    if (syncing) throw new Error('a Kimi Coding catalog check or sync is already in progress')
    syncing = true
    try {
      return await sync(ctx, current(), apply, signal, options)
    } finally {
      syncing = false
    }
  }
  const operation = (apply, signal, options) => runSync(apply, signal, options)
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
  ctx.plugin(KimiCodingModelsService, {
    operation,
    usage,
    models: () => configuredModels(ctx),
    saveModels: settings => writeModelSettings(ctx, settings),
  })
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
        required: ['provider', 'endpoint', 'checkedAt', 'live', 'served', 'added', 'kept', 'removed', 'applied', 'changed', 'syncToken', 'confirmationStale'],
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
          syncToken: { type: 'string' },
          confirmationStale: { type: 'boolean' },
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

  ctx.tools.register({
    name: 'kimi_coding_model_settings',
    description: "List the models configured on this profile's kimi-coding route with their explicit context window "
      + 'and output cap, or set those limits per model. Setting writes the route configuration; a null field restores '
      + 'catalog inheritance.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        models: {
          type: 'array',
          description: 'Per-model limits to write. Omit to only list the route models.',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id'],
            properties: {
              id: { type: 'string' },
              contextWindow: { anyOf: [{ type: 'integer', minimum: 1 }, { type: 'null' }] },
              maxTokens: { anyOf: [{ type: 'integer', minimum: 1 }, { type: 'null' }] },
            },
          },
        },
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['provider', 'models'],
        properties: {
          provider: { type: 'string' },
          models: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['id'],
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                contextWindow: { type: 'integer' },
                maxTokens: { type: 'integer' },
                piContextWindow: { type: 'integer' },
                piMaxTokens: { type: 'integer' },
              },
            },
          },
        },
      },
      render: (_args, value) => [{ type: 'text', text: formatModelsReport(value) }],
      presentationMeta: (_args, value) => value,
    },
    timeoutMs: 30_000,
    execute: async (args) => {
      const models = normalizedModelSettings(args?.models)
      return models === undefined ? configuredModels(ctx) : writeModelSettings(ctx, models)
    },
  })

  ctx.effect(() => {
    if (!current().syncOnStart) return undefined
    let active = true
    void outsideTransaction(() => runSync(true, undefined)).catch((error) => {
      if (!active) return
      warn(`startup sync failed: ${error instanceof Error ? error.message : String(error)}`)
    })
    return () => { active = false }
  }, 'kimi-coding-models: startup sync')

  // Interval synchronization reads the live configuration on every tick, so a
  // saved interval takes effect without reloading the plugin. The tick is one
  // minute; the configured interval decides when a sync is actually due, and
  // the first enabled tick runs one immediately.
  ctx.inject(['timer'], (timerScope) => {
    timerScope.effect(() => {
      let lastAttemptAt = 0
      const tick = () => {
        const minutes = current().syncIntervalMinutes
        if (!isAutoSyncDue(Date.now(), lastAttemptAt, minutes)) return
        if (syncing) return
        lastAttemptAt = Date.now()
        void outsideTransaction(() => runSync(true, undefined)).then((result) => {
          if (result.applied) {
            info(`interval sync updated the ${PROVIDER} route (${result.added.length} added, ${result.removed.length} removed)`)
          }
        }).catch((error) => {
          warn(`interval sync failed: ${error instanceof Error ? error.message : String(error)}`)
        })
      }
      return timerScope.interval(tick, AUTO_SYNC_TICK_MS)
    }, 'kimi-coding-models: interval sync')
  })
}
