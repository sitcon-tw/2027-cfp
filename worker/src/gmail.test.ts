import { describe, expect, it } from 'vitest'

import { buildMime, encodeHeader } from './gmail'

const decodeWords = (header: string) =>
  header
    .split('\r\n ')
    .map((word) => {
      const base64 = /^=\?UTF-8\?B\?(.*)\?=$/.exec(word)![1]
      return new TextDecoder().decode(
        Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)),
      )
    })
    .join('')

describe('encodeHeader', () => {
  it('leaves ASCII alone', () => {
    expect(encodeHeader('Hello SITCON')).toBe('Hello SITCON')
  })

  it('encodes long non-ASCII text in short, whole-character words', () => {
    const subject = 'SITCON 2027 投稿副本：' + '我的議程題目很長'.repeat(8)
    const encoded = encodeHeader(subject)
    expect(decodeWords(encoded)).toBe(subject)
    for (const line of encoded.split('\r\n')) {
      expect(`Subject: ${line}`.length).toBeLessThanOrEqual(78)
    }
  })
})

describe('buildMime', () => {
  const envelope = {
    from: { name: 'SITCON 2027 議程組', address: 'noreply@sitcon.org' },
    replyTo: 'session@sitcon.org',
  }
  const message = {
    to: 'speaker@example.com',
    subject: '請驗證',
    text: '純文字'.repeat(40),
    html: '<p>HTML</p>',
  }

  it('builds multipart/alternative with both parts', () => {
    const mime = buildMime(envelope, message, 'BOUNDARY')
    const [head] = mime.split('\r\n\r\n')
    expect(head).toContain('To: speaker@example.com')
    expect(head).toContain('Reply-To: session@sitcon.org')
    expect(head).toMatch(/^From: =\?UTF-8\?B\?.+\?= <noreply@sitcon\.org>$/m)
    expect(head).toContain('Auto-Submitted: auto-generated')
    expect(mime).toContain('Content-Type: text/plain; charset=UTF-8')
    expect(mime).toContain('Content-Type: text/html; charset=UTF-8')
    expect(mime.trimEnd().endsWith('--BOUNDARY--')).toBe(true)
    for (const line of mime.split('\r\n')) {
      expect(line.length).toBeLessThanOrEqual(78)
    }
  })

  it('refuses addresses that would add recipients or headers', () => {
    for (const to of [
      'a@example.com,b@example.com',
      'a@example.com\r\nBcc: b@example.com',
      '<a@example.com>',
    ]) {
      expect(() => buildMime(envelope, { ...message, to })).toThrow()
    }
  })
})
