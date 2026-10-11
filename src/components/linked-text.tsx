import type { ReactNode } from 'react'

import { parseInlineText } from '@/lib/inline-text'
import { cn } from '@/lib/utils'

/**
 * Renders JSON copy, turning `[label](url)` into links that open in a new
 * tab. Inline link styling is not in Figma yet — a proposal.
 */
export function LinkedText({ text }: { text: string }) {
  const tokens = parseInlineText(text)
  const parts: ReactNode[] = tokens.map((token, index) => {
    if (token.type === 'strong') {
      const previous = tokens[index - 1]
      const next = tokens[index + 1]
      const before =
        previous?.type === 'link' ? previous.label : previous?.value
      const after = next?.type === 'link' ? next.label : next?.value

      return (
        <strong
          key={index}
          // Visual spacing leaves copied text intact. Keep brackets and
          // closing punctuation attached; adjacent strong spans share one gap.
          className={cn(
            'font-bold text-foreground',
            before &&
              previous?.type !== 'strong' &&
              !/[\s([{（［｛「『〈《【]$/u.test(before) &&
              'ms-1.25',
            after &&
              !/^[\s,.;:!?%…，。；：！？、）］｝」』〉》】)\]}]/u.test(after) &&
              'me-1.25',
          )}
        >
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
