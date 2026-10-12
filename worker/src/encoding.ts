const encoder = new TextEncoder()

export function utf8(text: string): Uint8Array<ArrayBuffer> {
  return encoder.encode(text) as Uint8Array<ArrayBuffer>
}

export function base64(input: Uint8Array | string): string {
  const bytes = typeof input === 'string' ? utf8(input) : input
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export function base64url(input: Uint8Array | string): string {
  return base64(input)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/** Decodes base64 or base64url, or returns `null` for anything else. */
export function fromBase64(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9+/_-]*=*$/.test(text)) return null
  const normalized = text
    .replace(/=+$/, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  if (normalized.length % 4 === 1) return null
  const binary = atob(
    normalized + '='.repeat((4 - (normalized.length % 4)) % 4),
  )
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}
