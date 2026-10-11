export type InlineTextToken =
  | { type: 'text'; value: string }
  | { type: 'strong'; value: string }
  | { type: 'link'; label: string; href: string }

/** Parses the small, safe subset of inline markup used in organizer copy. */
export function parseInlineText(text: string): InlineTextToken[] {
  const tokens: InlineTextToken[] = []
  let textStart = 0
  let position = 0

  while (position < text.length) {
    const adjacentStrongOpener =
      position === textStart &&
      position >= 2 &&
      text[position - 1] === '*' &&
      text[position - 2] === '*'
    if (
      text.startsWith('**', position) &&
      (text[position - 1] !== '*' || adjacentStrongOpener) &&
      text[position + 2] !== '*'
    ) {
      let end = position + 2
      while (end < text.length) {
        if (text.startsWith('**', end) && text[end - 1] !== '*') {
          const twoStars = text[end + 2] !== '*'
          const fourStars =
            text[end + 2] === '*' &&
            text[end + 3] === '*' &&
            text[end + 4] !== '*'
          if (twoStars || fourStars) break
        }
        end++
      }

      if (end === text.length) break
      if (position > textStart) {
        tokens.push({ type: 'text', value: text.slice(textStart, position) })
      }
      tokens.push({ type: 'strong', value: text.slice(position + 2, end) })
      position = end + 2
      textStart = position
      continue
    }

    if (
      text[position] === '[' &&
      text[position - 1] !== '!' &&
      text[position + 1] !== ']'
    ) {
      let labelEnd = position + 1
      while (
        labelEnd < text.length &&
        text[labelEnd] !== ']' &&
        text[labelEnd] !== '['
      ) {
        labelEnd++
      }
      if (labelEnd === text.length || text[labelEnd] === '[') break

      const targetStart = labelEnd + 1
      const scheme = text.startsWith('(https://', targetStart)
        ? 'https://'
        : text.startsWith('(mailto:', targetStart)
          ? 'mailto:'
          : null
      if (scheme) {
        const hrefStart = targetStart + 1
        let urlEnd = hrefStart
        while (
          urlEnd < text.length &&
          text[urlEnd] !== ')' &&
          !/\s/.test(text[urlEnd])
        ) {
          urlEnd++
        }
        if (text[urlEnd] === ')' && urlEnd > hrefStart + scheme.length) {
          if (position > textStart) {
            tokens.push({
              type: 'text',
              value: text.slice(textStart, position),
            })
          }
          tokens.push({
            type: 'link',
            label: text.slice(position + 1, labelEnd),
            href: text.slice(hrefStart, urlEnd),
          })
          position = urlEnd + 1
          textStart = position
          continue
        }
        if (urlEnd === text.length) break
        position = urlEnd + (text[urlEnd] === ')' ? 1 : 0)
        continue
      }
    }

    position++
  }

  if (textStart < text.length) {
    tokens.push({ type: 'text', value: text.slice(textStart) })
  }
  return tokens
}
