import test from 'node:test'
import assert from 'node:assert/strict'

test('Host catalog and quota operations', { skip: !process.env.DSH_INSTALL_DIR && !process.resourcesPath }, async t => {
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
  const request = t.mock.method(globalThis, 'fetch', async (url, { headers }) => {
    assert.equal(headers.authorization, 'Bearer test-key')
    if (url.pathname === '/quota') return new Response(null, { status: 403 })
    assert.equal(url.searchParams.get('token'), 'catalog-secret')
    return Response.json({ data: listing })
  })
  const catalog = args => tools.get('kimi_coding_models').execute(args, {})
  const usage = () => tools.get('kimi_coding_usage').execute({}, {})
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
