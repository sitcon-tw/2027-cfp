import { useEffect, useRef } from 'react'

/** The subset of Cloudflare's Turnstile API this widget uses. */
interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
      theme: 'dark'
      language: 'auto'
      size: 'flexible'
    },
  ): string
  remove(widgetId: string): void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const scriptUrl =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let loading: Promise<TurnstileApi> | undefined

function loadTurnstile() {
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = scriptUrl
    script.async = true
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error())
    script.onerror = () => {
      loading = undefined
      reject(new Error('Turnstile failed to load'))
    }
    document.head.append(script)
  })
  return loading
}

/**
 * Cloudflare Turnstile, the bot check the submission API requires before it
 * emails a verification link. Usually passes without any interaction. Each
 * token is single use: remount (`key`) for a fresh one after every send.
 * Not in Figma; Cloudflare draws the widget.
 */
export function Turnstile({
  siteKey,
  onToken,
}: {
  siteKey: string
  onToken: (token: string | null) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const onTokenRef = useRef(onToken)
  useEffect(() => {
    onTokenRef.current = onToken
  })

  useEffect(() => {
    let widgetId: string | undefined
    let active = true
    void loadTurnstile()
      .then((turnstile) => {
        if (!active || !container.current) return
        widgetId = turnstile.render(container.current, {
          sitekey: siteKey,
          callback: (token) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
          theme: 'dark',
          // Follows the browser, like the rest of the page's chrome.
          language: 'auto',
          size: 'flexible',
        })
      })
      // Without the widget, sending reports the missing check.
      .catch(() => onTokenRef.current(null))
    return () => {
      active = false
      if (widgetId) window.turnstile?.remove(widgetId)
    }
  }, [siteKey])

  return <div ref={container} className="w-full max-w-183.5" />
}
