import test from 'node:test'
import assert from 'node:assert/strict'
import { parseModelsInput, parseModelsResult, REMOTE } from '../remote.js'

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

test('model-limit edits accept positive integers and null but reject other values', () => {
  assert.deepEqual(parseModelsInput({ models: [
    { id: 'k3', contextWindow: 1048576, maxTokens: 1048576 },
    { id: 'k3.1-pro', maxTokens: null },
  ] }), {
    models: [
      { id: 'k3', contextWindow: 1048576, maxTokens: 1048576 },
      { id: 'k3.1-pro', maxTokens: null },
    ],
  })
  assert.throws(() => parseModelsInput({ models: [{ id: 'k3', maxTokens: 0 }] }), /model-limit value/)
  assert.throws(() => parseModelsInput({ models: [{ id: 'k3', contextWindow: 'big' }] }), /model-limit value/)
  assert.throws(() => parseModelsInput({ models: [{ maxTokens: 1 }] }), /model-limit entry/)
  assert.throws(() => parseModelsInput({ models: [{ id: 'k3' }] }), /model-limit entry/)
  assert.throws(() => parseModelsInput({}), /model-limit request/)
})

test('Remote descriptors expose the model list and cap-editing methods', () => {
  const methods = REMOTE.descriptors.map(descriptor => descriptor.method).sort()
  assert.deepEqual(methods, ['models', 'read', 'saveModels', 'sync', 'usage'])
})
