import { base64, base64url, utf8 } from './encoding'
import { GoogleApiError } from './google-auth'

export interface EmailMessage {
  to: string
  subject: string
  text: string
  html: string
}

export interface Envelope {
  from: { name: string; address: string }
  replyTo: string
}

/** Printable ASCII that needs no encoding in a header. */
const plainHeader = /^[\x20-\x7e]*$/

/**
 * RFC 2047 encoded words for non-ASCII header text. Each word holds at most
 * 39 bytes of UTF-8 (52 of base64, 64 with its markers), so even the first
 * line, after `Subject: `, stays within 78 characters. Characters are never
 * split.
 */
export function encodeHeader(text: string): string {
  if (plainHeader.test(text)) return text
  const words: string[] = []
  let chunk = ''
  for (const character of text) {
    if (utf8(chunk + character).length > 39) {
      words.push(chunk)
      chunk = ''
    }
    chunk += character
  }
  if (chunk) words.push(chunk)
  return words.map((word) => `=?UTF-8?B?${base64(word)}?=`).join('\r\n ')
}

function displayName(name: string) {
  return plainHeader.test(name) && !/["\\]/.test(name)
    ? `"${name}"`
    : encodeHeader(name)
}

/** Base64 in 76-character lines, as MIME requires. */
function bodyLines(text: string) {
  return base64(text).replace(/.{76}(?=.)/g, '$&\r\n')
}

/**
 * An RFC 5322 message with plain-text and HTML alternatives. Header values
 * never contain line breaks: addresses are validated before they get here,
 * and subjects and names are encoded.
 */
export function buildMime(
  envelope: Envelope,
  message: EmailMessage,
  boundary = `b-${crypto.randomUUID()}`,
): string {
  for (const address of [envelope.from.address, envelope.replyTo, message.to]) {
    if (/[\s<>,;"]/.test(address)) throw new Error('Unsafe email address')
  }
  const part = (type: string, content: string) =>
    [
      `--${boundary}`,
      `Content-Type: ${type}; charset=UTF-8`,
      'Content-Transfer-Encoding: base64',
      '',
      bodyLines(content),
    ].join('\r\n')

  return [
    `From: ${displayName(envelope.from.name)} <${envelope.from.address}>`,
    `To: ${message.to}`,
    `Reply-To: ${envelope.replyTo}`,
    `Subject: ${encodeHeader(message.subject)}`,
    'MIME-Version: 1.0',
    // Marks it as automatic, so out-of-office replies skip it (RFC 3834).
    'Auto-Submitted: auto-generated',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    part('text/plain', message.text),
    part('text/html', message.html),
    `--${boundary}--`,
    '',
  ].join('\r\n')
}

/**
 * Sends through the Gmail API as the Workspace user the token impersonates.
 * Google signs it with the domain's DKIM key and sends it from its own
 * servers, so SPF, DKIM and DMARC all align with the sender's domain.
 */
export async function sendGmail(accessToken: string, mime: string) {
  const response = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: base64url(mime) }),
    },
  )
  if (!response.ok) {
    throw new GoogleApiError(
      'Gmail send',
      response.status,
      await response.text(),
    )
  }
}
