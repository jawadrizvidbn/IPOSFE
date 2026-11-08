const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

// Evaluate the browser helper with isolated globals instead of Node's own crypto API.
const source = fs
  .readFileSync(path.join(__dirname, '../src/utils/deviceId.js'), 'utf8')
  .replace('export function', 'function')

function browserContext(crypto, savedId = null) {
  const stored = new Map(savedId ? [['ipos-device-id', savedId]] : [])
  const context = {
    window: { crypto },
    localStorage: {
      getItem: key => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, value)
    }
  }

  vm.createContext(context)
  vm.runInContext(source, context)

  return { getId: context.getOrCreateDeviceId, stored }
}

// SSR must return without touching window, storage or crypto.
test('returns an empty device ID during server rendering', () => {
  const context = vm.createContext({})

  vm.runInContext(source, context)
  assert.equal(context.getOrCreateDeviceId(), '')
})

// Existing installations retain their identifier even when randomUUID is unavailable.
test('preserves an existing device ID without generating another', () => {
  const browser = browserContext({}, 'existing-device-id')

  assert.equal(browser.getId(), 'existing-device-id')
  assert.equal(browser.stored.get('ipos-device-id'), 'existing-device-id')
})

// Secure contexts should continue to use the browser's native UUID implementation.
test('uses native randomUUID once and persists its result', () => {
  let calls = 0
  const nativeId = '12345678-1234-4123-8123-123456789abc'
  const crypto = {
    randomUUID() {
      calls++
      assert.equal(this, crypto)
      return nativeId
    }
  }
  const browser = browserContext(crypto)

  assert.equal(browser.getId(), nativeId)
  assert.equal(browser.getId(), nativeId)
  assert.equal(calls, 1)
})

// Reproduce HTTP browsers where getRandomValues exists but randomUUID does not.
test('generates a valid persisted UUID v4 on HTTP without randomUUID', () => {
  let calls = 0
  const crypto = {
    getRandomValues(bytes) {
      calls++
      assert.equal(this, crypto)
      for (let i = 0; i < bytes.length; i++) bytes[i] = i
      return bytes
    }
  }
  const browser = browserContext(crypto)
  const id = browser.getId()

  assert.equal(id, '00010203-0405-4607-8809-0a0b0c0d0e0f')
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  assert.equal(browser.getId(), id)
  assert.equal(calls, 1)
})

// Unsupported browsers must not crash initialization or persist an invalid identifier.
test('returns an empty ID when secure randomness is unavailable', () => {
  for (const crypto of [undefined, {}]) {
    const browser = browserContext(crypto)

    assert.equal(browser.getId(), '')
    assert.equal(browser.stored.size, 0)
  }
})
