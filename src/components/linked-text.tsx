import type { ReactNode } from 'react'

// `[label](https://…)`, the only markup copy in JSON may use.
const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g

/**
 * Renders JSON copy, turning `[label](url)` into links that open in a new
 * tab. Inline link styling is not in Figma yet — a proposal.
 */
export function LinkedText({ text }: { text: string }) {
  const parts: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(linkPattern)) {
    parts.push(text.slice(last, match.index))
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noreferrer"
        className="rounded-xs text-foreground underline underline-offset-4 transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        {match[1]}
      </a>,
    )
    last = match.index + match[0].length
  }
  parts.push(text.slice(last))
  return <>{parts}</>
}
