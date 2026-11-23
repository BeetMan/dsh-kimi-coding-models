import test from 'node:test'
import assert from 'node:assert/strict'
import { parseCapsInput, parseModelsResult, REMOTE } from '../remote.js'

test('model list parsing keeps only normalized, non-secret fields', () => {
  const parsed = parseModelsResult({
    provider: 'kimi-coding',
    models: [
      { id: 'k3', name: 'Kimi K3', maxTokens: 131072, contextWindow: 1048576, apiKey: 'secret' },
      { id: 'k3.1-pro' },
    ],
  })
  assert.deepEqual(parsed, {
    provider: 'kimi-coding',
    models: [
      { id: 'k3', name: 'Kimi K3', maxTokens: 131072, contextWindow: 1048576 },
      { id: 'k3.1-pro' },
    ],
  })
  assert.throws(() => parseModelsResult({ provider: 'kimi-coding', models: [{ id: '' }] }), /model entry/)
  assert.throws(() => parseModelsResult({ provider: 'kimi-coding', models: [{ id: 'k3', maxTokens: 0 }] }), /maxTokens/)
})

test('cap edits accept positive integers and null but reject other values', () => {
  assert.deepEqual(parseCapsInput({ caps: [{ id: 'k3', maxTokens: 131072 }, { id: 'k3.1-pro', maxTokens: null }] }), {
    caps: [{ id: 'k3', maxTokens: 131072 }, { id: 'k3.1-pro', maxTokens: null }],
  })
  assert.throws(() => parseCapsInput({ caps: [{ id: 'k3', maxTokens: 0 }] }), /output-cap value/)
  assert.throws(() => parseCapsInput({ caps: [{ id: 'k3', maxTokens: 'big' }] }), /output-cap value/)
  assert.throws(() => parseCapsInput({ caps: [{ maxTokens: 1 }] }), /output-cap entry/)
  assert.throws(() => parseCapsInput({}), /output-cap request/)
})

test('Remote descriptors expose the model list and cap-editing methods', () => {
  const methods = REMOTE.descriptors.map(descriptor => descriptor.method).sort()
  assert.deepEqual(methods, ['models', 'read', 'saveCaps', 'sync', 'usage'])
})
