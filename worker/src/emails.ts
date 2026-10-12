import content from '@/content.json'
import type { SessionTypeId } from '@/lib/session-type-ids'
import {
  getSubmissionFields,
  isFieldVisible,
  type SubmissionValues,
} from '@/lib/submission'
import { verifyTokenHours } from '@/lib/submission-api'

import type { EmailMessage } from './gmail'

const text = content.submission_email

const sessionTitles: Record<SessionTypeId, string> = {
  general: content.sessions.generalTitle,
  open: content.sessions.openTitle,
  demo: content.sessions.demoTitle,
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]!,
  )
}

const htmlText = (value: string) => escapeHtml(value).replace(/\r?\n/g, '<br>')

interface Layout {
  heading: string
  paragraphs: string[]
  button: { label: string; href: string }
  /** Already-escaped HTML after the button. */
  details?: string
  /** Plain-text counterpart of `details`. */
  detailsText?: string
  note?: string
}

/**
 * One centered column with inline styles and a table-based button, which
 * mail clients render consistently, light in every theme.
 */
function render(layout: Layout): Pick<EmailMessage, 'text' | 'html'> {
  const { heading, paragraphs, button, details, detailsText, note } = layout
  const paragraph = (value: string) =>
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#101312">${htmlText(value)}</p>`
  const small = (value: string) =>
    `<p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#555555">${htmlText(value)}</p>`

  const html = `<!doctype html>
<html lang="${escapeHtml(content.metadata.lang)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:#f9f5ef">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9f5ef"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px"><tr><td style="padding:32px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang TC','Noto Sans TC','Microsoft JhengHei',sans-serif">
<h1 style="margin:0 0 20px;font-size:22px;line-height:1.4;color:#101312">${escapeHtml(heading)}</h1>
${paragraphs.map(paragraph).join('\n')}
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px 0 24px"><tr><td style="border-radius:999px;background:#6a74e3"><a href="${escapeHtml(button.href)}" style="display:inline-block;padding:12px 28px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none">${escapeHtml(button.label)}</a></td></tr></table>
${small(text.fallback)}
<p style="margin:0 0 24px;font-size:13px;line-height:1.6;word-break:break-all"><a href="${escapeHtml(button.href)}" style="color:#6a74e3">${escapeHtml(button.href)}</a></p>
${details ?? ''}
${note ? small(note) : ''}
<hr style="margin:24px 0 16px;border:0;border-top:1px solid #e3e0dc">
${small(text.footer)}
</td></tr></table>
</td></tr></table>
</body>
</html>
`

  const plain = [
    heading,
    '',
    ...paragraphs.flatMap((value) => [value, '']),
    button.label,
    button.href,
    '',
    ...(detailsText ? [detailsText, ''] : []),
    ...(note ? [note, ''] : []),
    '--',
    text.footer,
    '',
  ].join('\n')

  return { text: plain, html }
}

/**
 * The link to confirm the address. It carries no submitted text, so the form
 * can't be used to send someone else's words from our domain.
 */
export function verificationEmail(to: string, link: string): EmailMessage {
  const verify = text.verify
  return {
    to,
    subject: verify.subject,
    ...render({
      heading: verify.heading,
      paragraphs: verify.body.map((value) =>
        value.replace('{hours}', String(verifyTokenHours)),
      ),
      button: { label: verify.button, href: link },
      note: verify.ignore,
    }),
  }
}

/** The verified submission, every answer listed, with its edit link. */
export function copyEmail({
  to,
  type,
  id,
  values,
  link,
  deadline,
}: {
  to: string
  type: SessionTypeId
  id: string
  values: SubmissionValues
  link: string
  deadline: string
}): EmailMessage {
  const copy = text.copy
  const answers = [
    { label: copy.sessionType, value: sessionTitles[type] },
    ...getSubmissionFields(type)
      .filter((field) => isFieldVisible(field, values))
      .map((field) => {
        const value = values[field.key]
        const answer = (Array.isArray(value) ? value.join(', ') : value).trim()
        return { label: field.label, value: answer || copy.empty }
      }),
  ]
  const title = typeof values.title === 'string' ? values.title : ''

  return {
    to,
    // One line, whatever was typed into the title.
    subject: copy.subject.replace(
      '{title}',
      title.replace(/\s+/g, ' ').trim() || id,
    ),
    ...render({
      heading: copy.heading,
      paragraphs: copy.body.map((value) =>
        value.replace('{id}', id).replace('{deadline}', deadline),
      ),
      button: { label: copy.button, href: link },
      details: answers
        .map(
          ({ label, value }) =>
            `<p style="margin:0 0 4px;font-size:13px;font-weight:bold;color:#2b2b2b">${htmlText(label)}</p>\n<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#101312">${htmlText(value)}</p>`,
        )
        .join('\n'),
      detailsText: answers
        .map(({ label, value }) => `${label}\n${value}`)
        .join('\n\n'),
    }),
  }
}
