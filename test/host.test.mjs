import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { syncBuiltinESMExports } from 'node:module'
import os from 'node:os'
import { join } from 'node:path'

test('Host catalog and quota operations', { skip: !process.env.DSH_INSTALL_DIR && !process.resourcesPath }, async t => {
  // Quota history must not touch the developer's real home directory.
  const testHome = await mkdtemp(join(os.tmpdir(), 'kimi-quota-test-'))
  const homeMock = t.mock.method(os, 'homedir', () => testHome)
  syncBuiltinESMExports()
  t.after(async () => {
    homeMock.mock.restore()
    syncBuiltinESMExports()
    await rm(testHome, { recursive: true, force: true })
  })
  const mod = await import('../index.js').catch((error) => {
    // The desktop shell exports process.resourcesPath but plain Node cannot
    // require through the packed asar anchor; treat that as unavailable.
    if (/could not locate the running DSH installation/.test(String(error?.message ?? error))) return undefined
    throw error
  })
  if (mod === undefined) {
    t.skip('the running DSH installation anchor is unavailable to plain Node in this environment')
    return
  }
  const { apply } = mod
  const tools = new Map()
  let operations
  let profile = { providers: { 'kimi-coding': { models: [{ id: 'local', maxTokens: 8192 }] } } }
  const config = {
    endpoint: 'https://proxy.example/models?token=catalog-secret',
    usageEndpoint: 'https://proxy.example/quota?token=quota-secret',
    baseURL: 'https://proxy.example/v1',
    apiKeyEnv: 'KIMI_CODING_API_KEY',
    defaultMaxTokens: 131072,
    syncOnStart: false,
    syncIntervalMinutes: 0,
    platform: 'china',
    pinnedModels: [],
    showChatQuota: true,
    chatQuotaStyle: 'badge',
    chatQuotaBorder: true,
  }
  const editor = {
    entries: () => [{ options: { id: 'llm-pi-ai', config: profile } }],
    edit: async (_, update) => { profile = update(profile) },
  }
  const services = { configEditor: editor, credentials: { resolve: async () => ({ value: 'test-key' }) } }
  apply({
    get: name => services[name],
    tools: { register: tool => tools.set(tool.name, tool) },
    plugin: (_, options) => { operations = options },
    inject() {},
    effect() {},
  }, Object.fromEntries(Object.keys(config).map(key => [key, { get: () => config[key] }])))

  let listing = []
  let quotaBody
  const quotaPayload = (rollingUsed, weeklyUsed, rollingReset, weeklyReset) => ({
    limits: [{
      window: { duration: 300, timeUnit: 'TIME_UNIT_MINUTE' },
      detail: { limit: 100, used: rollingUsed, remaining: 100 - rollingUsed, resetTime: rollingReset },
    }],
    usage: { limit: 100, used: weeklyUsed, remaining: 100 - weeklyUsed, resetTime: weeklyReset },
    usages: {
      limit_5h: { used_ratio: rollingUsed / 100, reset_time: rollingReset },
      limit_7d: { used_ratio: weeklyUsed / 100, reset_time: weeklyReset },
    },
  })
  const request = t.mock.method(globalThis, 'fetch', async (url, { headers }) => {
    assert.equal(headers.authorization, 'Bearer test-key')
    if (url.pathname === '/quota') {
      if (quotaBody === undefined) return new Response(null, { status: 403 })
      return Response.json(quotaBody)
    }
    assert.equal(url.searchParams.get('token'), 'catalog-secret')
    return Response.json({ data: listing })
  })
  const catalog = args => tools.get('kimi_coding_models').execute(args, {})
  const usage = args => tools.get('kimi_coding_usage').execute(args ?? {}, {})
  // Resolve only after the selected call reaches fetch, before starting its competitor.
  const holdNextQuotaRead = async (args) => {
    const entered = Promise.withResolvers()
    const response = Promise.withResolvers()
    request.mock.mockImplementationOnce(() => {
      entered.resolve()
      return response.promise
    })
    const result = usage(args)
    await Promise.race([entered.promise, result.then(() => assert.fail('expected an upstream quota request'))])
    return { result, respond: body => response.resolve(Response.json(body)) }
  }
  const initial = profile

  for (const address of ['http://192.168.1.20', 'http://127.0.0.1.example', 'file:///tmp/catalog']) {
    const endpoints = { ...config }
    config.endpoint = config.usageEndpoint = address
    await assert.rejects(catalog({}), /HTTPS/)
    await assert.rejects(usage(), /HTTPS/)
    Object.assign(config, endpoints)
  }
  assert.equal(request.mock.callCount(), 0)

  for (const host of ['localhost', '127.0.0.2', '[::1]']) {
    config.endpoint = `http://${host}/models?token=catalog-secret`
    assert.equal((await catalog({})).endpoint, `http://${host}/models`)
  }
  await assert.rejects(usage(), { message: 'https://proxy.example/quota answered 403; check the Kimi Coding API key' })

  listing = [{ id: 'new' }, {}]
  await assert.rejects(catalog({ apply: true }), /valid id/)
  assert.equal(profile, initial)
  listing = []
  await assert.rejects(catalog({ apply: true }), /confirm the removals/)
  assert.equal(profile, initial)
  const preview = await catalog({})
  const ui = confirmation => operations.operation(true, undefined, { requireConfirmation: true, confirmation })
  assert.equal((await ui(undefined)).applied, false)
  assert.equal((await ui(preview.syncToken)).applied, true)
  assert.deepEqual(profile.providers['kimi-coding'].models, [])

  listing = [{ id: 'new' }]
  const previousBase = config.baseURL
  profile = initial
  config.baseURL = 'http://proxy.example'
  await assert.rejects(catalog({ apply: true }), /HTTPS/)
  assert.equal(profile, initial)
  config.baseURL = previousBase

  const pending = Promise.withResolvers()
  request.mock.mockImplementationOnce(() => pending.promise)
  const check = catalog({})
  await assert.rejects(ui(preview.syncToken), /already in progress/)
  pending.resolve(Response.json({ data: listing }))
  await check
  assert.equal((await catalog({ apply: true })).applied, true)

  // A stale plain read that finishes after a forced refresh must not evict it.
  {
    const R = '2026-11-24T12:00:00.000Z'
    const RW = '2026-11-28T12:00:00.000Z'
    quotaBody = quotaPayload(31, 10, R, RW)
    const pendingA = Promise.withResolvers()
    request.mock.mockImplementationOnce(() => pendingA.promise)
    const A = usage({})
    quotaBody = quotaPayload(42, 10, R, RW)
    const B = await usage({ force: true })
    assert.equal(B.rolling.used, 42)
    pendingA.resolve(Response.json(quotaPayload(31, 10, R, RW)))
    const aValue = await A
    assert.equal(aValue.rolling.used, 31)
    const C = await usage({})
    assert.equal(C.rolling.used, 42)
    assert.equal(C.checkedAt, B.checkedAt)
    assert.equal(C.trend.rolling.at(-1), 42)
  }

  const historyDir = join(testHome, '.dsh', 'kimi-coding-quota-history')
  const files = await readdir(historyDir)
  assert.equal(files.length, 1)
  const readHistory = async () => JSON.parse(await readFile(join(historyDir, files[0]), 'utf8')).samples

  // A newer accepted response advances the high-water mark even when the
  // sampling interval keeps it off disk; a slower earlier request is dropped.
  {
    const R = '2026-11-24T12:00:00.000Z'
    const RW = '2026-11-28T12:00:00.000Z'
    const realNow = Date.now() + 60_000
    t.mock.timers.enable({ apis: ['Date'], now: realNow })
    try {
      quotaBody = quotaPayload(10, 10, R, RW)
      await usage({ force: true })
      t.mock.timers.tick(40_000)
      const old = await holdNextQuotaRead({ force: true })
      quotaBody = quotaPayload(42, 10, R, RW)
      await usage({ force: true })
      t.mock.timers.tick(6_000)
      old.respond(quotaPayload(31, 10, R, RW))
      assert.equal((await old.result).rolling.used, 31)
      assert.deepEqual((await readHistory()).map(sample => sample.rollingPercent), [42, 10])
      const after = await usage({})
      assert.equal(after.rolling.used, 42)
      assert.equal(after.trend.rolling.at(-1), 42)
    } finally {
      t.mock.timers.reset()
    }
  }

  // A stale response from context A cannot evict A's accepted value even
  // after context B borrowed the single cache slot.
  {
    const R = '2026-11-24T12:00:00.000Z'
    const RW = '2026-11-28T12:00:00.000Z'
    const quotaUrl = config.usageEndpoint
    config.usageEndpoint = `${quotaUrl}&account=A`
    const A = await holdNextQuotaRead({})
    quotaBody = quotaPayload(43, 10, R, RW)
    const refreshed = await usage({ force: true })
    assert.equal(refreshed.rolling.used, 43)
    config.usageEndpoint = `${quotaUrl}&account=B`
    quotaBody = quotaPayload(8, 10, R, RW)
    await usage({ force: true })
    A.respond(quotaPayload(32, 10, R, RW))
    assert.equal((await A.result).rolling.used, 32)
    config.usageEndpoint = `${quotaUrl}&account=A`
    quotaBody = quotaPayload(47, 10, R, RW)
    const before = request.mock.callCount()
    const backOnA = await usage({})
    assert.equal(backOnA.rolling.used, 47)
    assert.equal(request.mock.callCount(), before + 1)
    config.usageEndpoint = quotaUrl
  }

  // A Host restart re-imports the module: persisted history is kept, request
  // sequences restart at zero, and the first due reading updates everything.
  {
    const R = '2026-11-24T12:00:00.000Z'
    const RW = '2026-11-28T12:00:00.000Z'
    const restarted = await import(`../index.js?restart=${Date.now()}`)
    const restartedTools = new Map()
    restarted.apply({
      get: name => services[name],
      tools: { register: tool => restartedTools.set(tool.name, tool) },
      plugin() {},
      inject() {},
      effect() {},
    }, Object.fromEntries(Object.keys(config).map(key => [key, { get: () => config[key] }])))
    // Later than every sample the earlier blocks wrote for this context.
    const realNow = Date.now() + 120_000
    t.mock.timers.enable({ apis: ['Date'], now: realNow })
    try {
      quotaBody = quotaPayload(60, 10, R, RW)
      const afterRestart = await restartedTools.get('kimi_coding_usage').execute({ force: true }, {})
      assert.equal(afterRestart.rolling.used, 60)
      assert.equal(afterRestart.trend.rolling.at(-1), 60)
      assert.deepEqual((await readHistory()).map(sample => sample.rollingPercent), [42, 10, 60])
    } finally {
      t.mock.timers.reset()
    }
  }

  // A same-millisecond reading replaces the curve endpoint.
  {
    const R = '2026-11-24T12:00:00.000Z'
    const RW = '2026-11-28T12:00:00.000Z'
    t.mock.timers.enable({ apis: ['Date'], now: 1_795_470_000_000 })
    try {
      quotaBody = quotaPayload(80, 10, R, RW)
      const first = await usage({ force: true })
      assert.equal(first.trend.rolling.at(-1), 80)
      quotaBody = quotaPayload(4, 10, R, RW)
      const second = await usage({ force: true })
      assert.equal(second.rolling.used, 4)
      assert.equal(second.trend.rolling.at(-1), 4)
    } finally {
      t.mock.timers.reset()
    }
  }

  // A pin toggle during the catalog flight is honored by the write.
  listing = [{ id: 'k3' }]
  profile = initial
  config.pinnedModels = []
  const pendingPin = Promise.withResolvers()
  request.mock.mockImplementationOnce(() => pendingPin.promise)
  const pinnedSync = catalog({ apply: true })
  config.pinnedModels = ['local']
  pendingPin.resolve(Response.json({ data: listing }))
  const pinnedResult = await pinnedSync
  assert.equal(pinnedResult.applied, true)
  assert.deepEqual(pinnedResult.pinnedKept, ['local'])
  assert.deepEqual(profile.providers['kimi-coding'].models.map(model => model.id), ['k3', 'local'])
  // A stale confirmation from before the pin change no longer writes.
  const staleAfterPin = await ui(pinnedResult.syncToken)
  assert.equal(staleAfterPin.confirmationStale, true)
})
