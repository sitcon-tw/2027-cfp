import type { ReactNode } from 'react'

import { parseInlineText } from '@/lib/inline-text'

/**
 * Renders JSON copy, turning `[label](url)` into links that open in a new
 * tab. Inline link styling is not in Figma yet — a proposal.
 */
export function LinkedText({ text }: { text: string }) {
  const tokens = parseInlineText(text)
  const parts: ReactNode[] = tokens.map((token, index) => {
    if (token.type === 'strong') {
      return (
        <strong key={index} className="font-bold text-foreground">
          {token.value}
        </strong>
      )
    }
    if (token.type === 'link') {
      return (
        <a
          key={index}
          href={token.href}
          target="_blank"
          rel="noreferrer"
          className="rounded-xs text-foreground underline underline-offset-4 transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          {token.label}
        </a>
      )
    }
    return token.value
  })
  return <>{parts}</>
}
