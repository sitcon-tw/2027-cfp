import type { ReactNode } from 'react'

// `[label](https://…)` or `[label](mailto:…)`, and `**bold**`: the only
// markup copy in JSON may use.
const markupPattern =
  /\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)|\*\*(.+?)\*\*/g

/**
 * Renders JSON copy, turning `[label](url)` into links that open in a new
 * tab and `**text**` into bold, as in the source documents. Inline link
 * styling is not in Figma yet — a proposal.
 */
export function LinkedText({ text }: { text: string }) {
  const parts: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(markupPattern)) {
    parts.push(text.slice(last, match.index))
    parts.push(
      match[3] === undefined ? (
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noreferrer"
          className="rounded-xs text-foreground underline underline-offset-4 transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          {match[1]}
        </a>
      ) : (
        <strong key={match.index} className="font-bold">
          {match[3]}
        </strong>
      ),
    )
    last = match.index + match[0].length
  }
  parts.push(text.slice(last))
  return <>{parts}</>
}
