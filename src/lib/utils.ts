import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Register the custom `--text-*` sizes from `src/index.css` so tailwind-merge
// does not treat `text-paragraph` and `text-foreground` as conflicting.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
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
