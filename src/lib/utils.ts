import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Register the custom tokens from `src/index.css` so tailwind-merge resolves
// conflicts correctly: `--text-*` sizes (otherwise `text-paragraph` and
// `text-foreground` look like a conflict) and named `--spacing-*` sizes
// (otherwise `h-control` and `h-12` both survive).
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ['control', 'control-lg', 'control-icon', 'header'],
    },
    classGroups: {
      'font-size': [
        {
          text: [
            'mega',
            'headline',
            'stat',
            'display',
            'h1',
            'eyebrow',
            'h2',
            'h3',
            'lead',
            'paragraph',
            'subheading',
            'body',
            'caption',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Props of a Base UI part, with `className` narrowed to a string for `cn()`. */
export type WithClassName<P> = Omit<P, 'className'> & { className?: string }

/** Zero-pads a number to two digits: `5` → `05`. */
export const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Fills a `content.json` sentence's `{name}` placeholders, each with the
 * result of `render(name)`, keeping the words between them as strings. This
 * is `String.replace` for when a value needs markup of its own, e.g. a bold
 * number: `fillPlaceholders('{days} 天', (name) => <b>…</b>)` → `[<b>…</b>, ' 天']`.
 */
export function fillPlaceholders<T>(
  format: string,
  render: (name: string) => T,
): (string | T)[] {
  return format
    .split(/(\{\w+\})/)
    .filter(Boolean)
    .map((part) => {
      const placeholder = /^\{(\w+)\}$/.exec(part)
      return placeholder ? render(placeholder[1]) : part
    })
}
