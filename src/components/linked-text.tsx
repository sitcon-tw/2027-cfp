import type { ReactNode } from 'react'

// `**strong**`, `[label](https://…)` or `[label](mailto:…)`, the only markup
// copy in JSON may use. Spans are flat: no nesting.
const markupPattern =
  /\*\*(.+?)\*\*|\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/g

/**
 * Renders JSON copy, turning `**strong**` into bold text and `[label](url)`
 * into links that open in a new tab. Inline link styling is our own; Figma
 * has none.
 */
export function LinkedText({ text }: { text: string }) {
  const parts: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(markupPattern)) {
    parts.push(text.slice(last, match.index))
    parts.push(
      match[1] != null ? (
        <strong key={match.index} className="font-bold text-foreground">
          {match[1]}
        </strong>
      ) : (
        <a
          key={match.index}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="rounded-xs text-foreground underline underline-offset-4 transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          {match[2]}
        </a>
      ),
    )
    last = match.index + match[0].length
  }
  parts.push(text.slice(last))
  return <>{parts}</>
}
