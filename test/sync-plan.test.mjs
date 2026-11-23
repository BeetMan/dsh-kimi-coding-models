import test from 'node:test'
import assert from 'node:assert/strict'
import { applyModelSettings, applySyncPlanToConfig, createSyncPlan, isSyncConfirmationCurrent, syncValueFingerprint } from '../sync-plan.js'
import { parseSyncResult, REMOTE } from '../remote.js'

const config = {
  endpoint: 'https://api.kimi.com/coding/v1/models',
  baseURL: 'https://api.kimi.com/coding/v1',
  apiKeyEnv: 'KIMI_CODING_API_KEY',
  defaultMaxTokens: 131072,
}
const live = [
  { id: 'k3', name: 'Kimi K3', input: ['text', 'image'] },
  { id: 'k3.1-pro', name: 'Kimi K3.1 Pro', input: ['text', 'image'] },
]

test('removal report includes configured and served entries absent from live catalog', () => {
  const route = {
    api: 'openai-completions',
    models: [
      { id: 'custom-local', name: 'Local custom model' },
      { id: 'k3', name: 'Old K3 name', maxTokens: 131072 },
    ],
  }
  const plan = createSyncPlan(live.slice(0, 1), route, ['k3', 'served-old'], config)
  assert.deepEqual(plan.removed, ['custom-local', 'served-old'])
  assert.deepEqual(plan.route.models, [{ id: 'k3', name: 'Kimi K3', maxTokens: 131072 }])
  assert.equal(plan.changed, true)
  assert.equal(isSyncConfirmationCurrent(plan, plan.syncToken), true)
})

test('a confirmation is bound to endpoint, live plan, and current route', () => {
  const route = { api: 'openai-completions', models: [{ id: 'k3' }] }
  const plan = createSyncPlan(live, route, ['k3'], config)
  const same = createSyncPlan(live, { models: [{ id: 'k3' }], api: 'openai-completions' }, ['k3'], config)
  assert.equal(plan.syncToken, same.syncToken)
  assert.equal(isSyncConfirmationCurrent(plan, same.syncToken), true)

  const changedLive = createSyncPlan(live.slice(0, 1), route, ['k3'], config)
  const changedRoute = createSyncPlan(live, { ...route, baseURL: 'https://example.invalid/v1' }, ['k3'], config)
  const unserved = createSyncPlan(live, { ...route, models: [...route.models, { id: 'local-only' }] }, ['k3'], config)
  assert.deepEqual(unserved.route, plan.route)
  assert.deepEqual(unserved.removed, ['local-only'])
  assert.equal(isSyncConfirmationCurrent(unserved, plan.syncToken), false)
  const changedEndpoint = createSyncPlan(live, route, ['k3'], { ...config, endpoint: 'https://example.invalid/models' })
  const changedServed = createSyncPlan(live, route, ['k3', 'served-old'], config)
  assert.equal(isSyncConfirmationCurrent(plan, changedLive.syncToken), false)
  assert.equal(isSyncConfirmationCurrent(plan, changedRoute.syncToken), false)
  assert.equal(isSyncConfirmationCurrent(plan, changedEndpoint.syncToken), false)
  assert.equal(isSyncConfirmationCurrent(plan, changedServed.syncToken), false)
  assert.equal(isSyncConfirmationCurrent(plan, undefined), false)
})

test('route fingerprints are stable across object key order', () => {
  assert.equal(syncValueFingerprint({ b: 1, a: { d: 2, c: 3 } }), syncValueFingerprint({ a: { c: 3, d: 2 }, b: 1 }))
})

test('new models use the pi-ai limits snapshot while existing capacities survive', () => {
  const route = { models: [{ id: 'k3', name: 'K3', maxTokens: 131072 }] }
  const plan = createSyncPlan(live, route, ['k3'], config)
  assert.equal(plan.route.models[0].maxTokens, 131072)
  assert.equal(plan.route.models[1].maxTokens, 1048576)
  assert.equal(plan.route.models[1].contextWindow, 1048576)
  assert.equal(plan.route.models[1].name, 'Kimi K3.1 Pro')
})

test('an unknown model falls back to the configured output cap', () => {
  const unknown = [{ id: 'kimi-future', name: 'Kimi Future', input: ['text'] }]
  const plan = createSyncPlan(unknown, { models: [] }, [], config)
  assert.equal(plan.route.models[0].maxTokens, 131072)
  assert.equal(plan.route.models[0].contextWindow, 1048576)
})

test('per-model limits are written only to the matching entries', () => {
  const route = {
    api: 'openai-completions',
    models: [
      { id: 'k3', name: 'Kimi K3' },
      { id: 'k3.1-pro', name: 'Kimi K3.1 Pro', maxTokens: 32768, contextWindow: 1048576 },
    ],
  }
  const next = applyModelSettings(route, [
    { id: 'k3', contextWindow: 1048576, maxTokens: 1048576 },
    { id: 'k3.1-pro', maxTokens: 1048576 },
  ])
  assert.deepEqual(next.models, [
    { id: 'k3', name: 'Kimi K3', contextWindow: 1048576, maxTokens: 1048576 },
    { id: 'k3.1-pro', name: 'Kimi K3.1 Pro', maxTokens: 1048576, contextWindow: 1048576 },
  ])
  assert.equal(route.models[0].maxTokens, undefined)
})

test('a null limit restores inheritance and unknown ids are rejected', () => {
  const route = { models: [{ id: 'k3', name: 'K3', maxTokens: 1048576, contextWindow: 1048576 }] }
  const cleared = applyModelSettings(route, [{ id: 'k3', contextWindow: null }])
  assert.deepEqual(cleared.models, [{ id: 'k3', name: 'K3', maxTokens: 1048576 }])
  assert.throws(() => applyModelSettings(route, [{ id: 'missing', maxTokens: 1 }]), /does not list missing/)
  assert.throws(() => applyModelSettings(undefined, [{ id: 'k3', maxTokens: 1 }]), /no kimi-coding model list/)
})

test('final write accepts only the route snapshot used by the plan', () => {
  const route = { api: 'openai-completions', models: [{ id: 'k3' }] }
  const current = { providers: { 'kimi-coding': route }, untouched: { keep: true } }
  const plan = createSyncPlan(live, route, ['k3'], config)
  const next = applySyncPlanToConfig(current, plan)
  assert.deepEqual(next.providers['kimi-coding'], plan.route)
  assert.deepEqual(next.untouched, { keep: true })
  assert.deepEqual(current.providers['kimi-coding'], route)
  assert.throws(
    () => applySyncPlanToConfig({ providers: { 'kimi-coding': { ...route, baseURL: 'https://changed.invalid' } } }, plan),
    /changed during synchronization/,
  )
})

test('Remote result carries the confirmation token and stale marker', () => {
  const value = {
    provider: 'kimi-coding', endpoint: config.endpoint, checkedAt: new Date().toISOString(),
    live: [{ id: 'k3', name: 'Kimi K3' }], served: ['k3'], added: [], kept: ['k3'], removed: [],
    applied: false, changed: false, syncToken: 'abc123', confirmationStale: false,
  }
  const parsed = parseSyncResult(value)
  assert.equal(parsed.syncToken, 'abc123')
  assert.equal(parsed.confirmationStale, false)
  assert.throws(() => parseSyncResult({ ...value, syncToken: undefined }), /sync result metadata/)
  const sync = REMOTE.descriptors.find(item => item.method === 'sync')
  const confirmation = sync.parameters.find(item => item.name === 'confirmation')
  assert.equal(confirmation.codec.schema.parse('abc123'), 'abc123')
  assert.equal(confirmation.codec.schema.parse(undefined), undefined)
})
