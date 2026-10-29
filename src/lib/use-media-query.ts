import { useSyncExternalStore } from 'react'

/**
 * Whether a CSS media query matches, kept live as it changes (a resized
 * window, reduced motion switched on mid-session). Prerendering and
 * hydration use `serverValue`, so pick the one that is safe before the
 * real answer is known.
 */
export function useMediaQuery(query: string, serverValue = true) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  )
}

/** Live `prefers-reduced-motion: reduce`; assumed on until hydrated. */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
