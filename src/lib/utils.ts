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
            'title',
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
