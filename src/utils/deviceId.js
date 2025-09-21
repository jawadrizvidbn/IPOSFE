// /utils/deviceId.ts
export function getOrCreateDeviceId() {
  if (typeof window === 'undefined') return '' // SSR guard

  let id = localStorage.getItem('ipos-device-id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('ipos-device-id', id)
  }

  console.log('Device ID', id)
  return id
}
