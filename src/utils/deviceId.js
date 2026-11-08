// Generate a UUID using secure browser randomness, including on plain HTTP origins.
function createDeviceId() {
  const browserCrypto = window.crypto

  // Prefer the native UUID API when the browser exposes it in this context.
  if (typeof browserCrypto?.randomUUID === 'function') {
    return browserCrypto.randomUUID()
  }

  // getRandomValues remains available on HTTP where randomUUID may be absent.
  if (typeof browserCrypto?.getRandomValues !== 'function') return ''

  const bytes = browserCrypto.getRandomValues(new Uint8Array(16))

  // Set the UUID version to 4 and variant to RFC 4122 before formatting the bytes.
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

// Preserve the existing stored identifier and avoid accessing browser APIs during SSR.
export function getOrCreateDeviceId() {
  if (typeof window === 'undefined') return ''

  let id = localStorage.getItem('ipos-device-id')

  // Create and persist an identifier only when none was saved previously.
  if (!id) {
    id = createDeviceId()

    // Leave the ID unset if no secure randomness exists; the backend can use its fallback.
    if (id) localStorage.setItem('ipos-device-id', id)
  }

  return id
}
