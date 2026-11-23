/**
 * Wire contract shared by the Host Remote service and the browser panel.
 * The descriptors are handwritten so the local-directory plugin needs no
 * Typert code-generation build.
 */

/** Validate the stable string list carried by a sync report. */
function stringList(value, field) {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    throw new Error(`Invalid Kimi Coding sync result: ${field}`)
  }
  return [...value]
}

/** Validate and detach one sync report crossing the Remote boundary. */
export function parseSyncResult(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid Kimi Coding sync result')
  }
  if (typeof value.provider !== 'string' || typeof value.endpoint !== 'string'
    || typeof value.checkedAt !== 'string' || !Number.isFinite(Date.parse(value.checkedAt))
    || typeof value.applied !== 'boolean' || typeof value.changed !== 'boolean'
    || typeof value.syncToken !== 'string' || value.syncToken.length === 0
    || typeof value.confirmationStale !== 'boolean') {
    throw new Error('Invalid Kimi Coding sync result metadata')
  }
  if (!Array.isArray(value.live)) throw new Error('Invalid Kimi Coding live model list')
  const live = value.live.map((model) => {
    if (model === null || typeof model !== 'object' || Array.isArray(model)
      || typeof model.id !== 'string' || typeof model.name !== 'string') {
      throw new Error('Invalid Kimi Coding live model')
    }
    return { id: model.id, name: model.name }
  })
  return {
    provider: value.provider,
    endpoint: value.endpoint,
    checkedAt: value.checkedAt,
    live,
    served: stringList(value.served, 'served'),
    added: stringList(value.added, 'added'),
    kept: stringList(value.kept, 'kept'),
    removed: stringList(value.removed, 'removed'),
    applied: value.applied,
    changed: value.changed,
    syncToken: value.syncToken,
    confirmationStale: value.confirmationStale,
  }
}

/** Validate one configured model entry crossing the Remote boundary. */
function parseModelSummary(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)
    || typeof value.id !== 'string' || value.id.length === 0) {
    throw new Error('Invalid Kimi Coding model entry')
  }
  const model = { id: value.id }
  if (value.name !== undefined) {
    if (typeof value.name !== 'string') throw new Error('Invalid Kimi Coding model name')
    model.name = value.name
  }
  for (const key of ['maxTokens', 'contextWindow']) {
    if (value[key] === undefined) continue
    if (!Number.isInteger(value[key]) || value[key] <= 0) throw new Error(`Invalid Kimi Coding model ${key}`)
    model[key] = value[key]
  }
  return model
}

/** Validate and detach the configured model list crossing the Remote boundary. */
export function parseModelsResult(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)
    || typeof value.provider !== 'string' || !Array.isArray(value.models)) {
    throw new Error('Invalid Kimi Coding model list')
  }
  return { provider: value.provider, models: value.models.map(parseModelSummary) }
}

/** Validate the per-model output-cap edits carried by a save request. */
export function parseCapsInput(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value) || !Array.isArray(value.caps)) {
    throw new Error('Invalid Kimi Coding output-cap request')
  }
  const caps = value.caps.map((cap) => {
    if (cap === null || typeof cap !== 'object' || Array.isArray(cap)
      || typeof cap.id !== 'string' || cap.id.length === 0) {
      throw new Error('Invalid Kimi Coding output-cap entry')
    }
    if (cap.maxTokens === null) return { id: cap.id, maxTokens: null }
    if (!Number.isInteger(cap.maxTokens) || cap.maxTokens <= 0) {
      throw new Error('Invalid Kimi Coding output-cap value')
    }
    return { id: cap.id, maxTokens: cap.maxTokens }
  })
  return { caps }
}

/** Validate one quota window, preserving only non-secret quota facts. */
function parseQuotaWindow(value, field) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid Kimi Coding quota ${field}`)
  }
  const result = {}
  for (const key of ['limit', 'used', 'remaining', 'usedPercent']) {
    if (typeof value[key] !== 'number' || !Number.isFinite(value[key]) || value[key] < 0) {
      throw new Error(`Invalid Kimi Coding quota ${field}.${key}`)
    }
    result[key] = value[key]
  }
  if (typeof value.resetAt !== 'string' || !Number.isFinite(Date.parse(value.resetAt))) {
    throw new Error(`Invalid Kimi Coding quota ${field}.resetAt`)
  }
  result.resetAt = value.resetAt
  if (value.durationMinutes !== undefined) {
    if (!Number.isInteger(value.durationMinutes) || value.durationMinutes <= 0) {
      throw new Error(`Invalid Kimi Coding quota ${field}.durationMinutes`)
    }
    result.durationMinutes = value.durationMinutes
  }
  return result
}

/** Validate and detach one quota snapshot crossing the Remote boundary. */
export function parseUsageResult(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)
    || typeof value.checkedAt !== 'string' || !Number.isFinite(Date.parse(value.checkedAt))) {
    throw new Error('Invalid Kimi Coding quota result')
  }
  return {
    checkedAt: value.checkedAt,
    rolling: parseQuotaWindow(value.rolling, 'rolling'),
    weekly: parseQuotaWindow(value.weekly, 'weekly'),
    ...typeof value.membership === 'string' ? { membership: value.membership } : {},
  }
}

const resultCodec = {
  mode: 'strict',
  typeSymbol: 'dsh-kimi-coding-models#SyncResult',
  schema: { parse: parseSyncResult },
  create: () => ({ parse: parseSyncResult }),
}

const usageCodec = {
  mode: 'strict',
  typeSymbol: 'dsh-kimi-coding-models#UsageResult',
  schema: { parse: parseUsageResult },
  create: () => ({ parse: parseUsageResult }),
}

const modelsCodec = {
  mode: 'strict',
  typeSymbol: 'dsh-kimi-coding-models#ModelsResult',
  schema: { parse: parseModelsResult },
  create: () => ({ parse: parseModelsResult }),
}

const capsCodec = {
  mode: 'strict',
  typeSymbol: 'dsh-kimi-coding-models#CapsInput',
  schema: { parse: parseCapsInput },
  create: () => ({ parse: parseCapsInput }),
}

const applyCodec = {
  mode: 'strict',
  typeSymbol: 'dsh-kimi-coding-models#Apply',
  schema: { parse: (value) => {
    if (typeof value !== 'boolean') throw new Error('apply must be a boolean')
    return value
  } },
  create: () => ({ parse: (value) => {
    if (typeof value !== 'boolean') throw new Error('apply must be a boolean')
    return value
  } }),
}

const confirmationCodec = {
  mode: 'strict',
  typeSymbol: 'dsh-kimi-coding-models#Confirmation',
  schema: { parse: (value) => {
    if (value === undefined) return undefined
    if (typeof value !== 'string') throw new Error('confirmation must be a string')
    return value
  } },
  create: () => ({ parse: (value) => {
    if (value === undefined) return undefined
    if (typeof value !== 'string') throw new Error('confirmation must be a string')
    return value
  } }),
}

/** Host registration and Client mount consume the same descriptors. */
export const REMOTE = {
  package: 'dsh-kimi-coding-models',
  descriptors: [
    {
      id: 'dsh-kimi-coding-models#kimiCodingModels/read',
      service: 'kimiCodingModels',
      namespace: 'kimiCodingModels',
      method: 'read',
      invocation: { kind: 'direct' },
      parameters: [],
      cancellation: { parameter: 'signal' },
      result: resultCodec,
    },
    {
      id: 'dsh-kimi-coding-models#kimiCodingModels/usage',
      service: 'kimiCodingModels',
      namespace: 'kimiCodingModels',
      method: 'usage',
      invocation: { kind: 'direct' },
      parameters: [],
      cancellation: { parameter: 'signal' },
      result: usageCodec,
    },
    {
      id: 'dsh-kimi-coding-models#kimiCodingModels/sync',
      service: 'kimiCodingModels',
      namespace: 'kimiCodingModels',
      method: 'sync',
      invocation: { kind: 'direct' },
      parameters: [
        { name: 'apply', wire: 'apply', source: 'json', codec: applyCodec },
        { name: 'confirmation', wire: 'confirmation', source: 'json', codec: confirmationCodec },
      ],
      cancellation: { parameter: 'signal' },
      result: resultCodec,
    },
    {
      id: 'dsh-kimi-coding-models#kimiCodingModels/models',
      service: 'kimiCodingModels',
      namespace: 'kimiCodingModels',
      method: 'models',
      invocation: { kind: 'direct' },
      parameters: [],
      cancellation: { parameter: 'signal' },
      result: modelsCodec,
    },
    {
      id: 'dsh-kimi-coding-models#kimiCodingModels/saveCaps',
      service: 'kimiCodingModels',
      namespace: 'kimiCodingModels',
      method: 'saveCaps',
      invocation: { kind: 'direct' },
      parameters: [
        { name: 'input', wire: 'input', source: 'json', codec: capsCodec },
      ],
      cancellation: { parameter: 'signal' },
      result: modelsCodec,
    },
  ],
}
