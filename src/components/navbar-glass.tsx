import { useEffect, useState, type RefObject } from 'react'

import { cn } from '@/lib/utils'

type NavbarGlassProps = {
  barRef: RefObject<HTMLDivElement | null>
  triggerRef: RefObject<HTMLButtonElement | null>
  positionerRef: RefObject<HTMLDivElement | null>
  popupRef: RefObject<HTMLDivElement | null>
  open: boolean
}

type GlassSize = {
  width: number
  height: number
  triggerCenter: number
  dropLeft: number
  dropWidth: number
  dropHeight: number
  shoulderRadius: number
  bottomRadius: number
}

const curve = 0.5522847498 // Cubic approximation of a quarter-circle.

/**
 * The positioner's left edge where Base UI is moving it. Its `left`/`right`
 * are transitioned, so the box alone lags behind; the inline style holds the
 * target and the computed style the value mid-transition.
 */
function targetLeft(positioner: HTMLElement) {
  const box = positioner.getBoundingClientRect()
  const current = getComputedStyle(positioner)
  const { left, right } = positioner.style
  if (left)
    return box.left + Number.parseFloat(left) - Number.parseFloat(current.left)
  if (right)
    return (
      box.left - Number.parseFloat(right) + Number.parseFloat(current.right)
    )
  return box.left
}

/** A single clipped backdrop keeps reflections continuous across the bar and drop. */
function glassOutline(size: GlassSize, open: boolean) {
  const { width: w, height: h } = size
  const pill = h / 2
  const dropHeight = open ? size.dropHeight : 0
  // The drop has to leave from the bar's straight bottom edge, between the
  // pill's rounded ends; outside it the outline would cross itself.
  const clamp = (value: number) => Math.min(Math.max(value, pill), w - pill)
  const left = clamp(open ? size.dropLeft : size.triggerCenter)
  const right = clamp(open ? size.dropLeft + size.dropWidth : left)
  const dropWidth = right - left
  const shoulder = Math.max(
    0,
    Math.min(
      size.shoulderRadius,
      dropHeight / 2,
      dropWidth / 4,
      left - pill,
      w - pill - right,
    ),
  )
  const bottom = Math.min(
    size.bottomRadius,
    dropHeight - shoulder,
    dropWidth / 2,
  )

  const outline = [
    `M ${pill} 0`,
    `H ${w - pill}`,
    `C ${w - pill + curve * pill} 0 ${w} ${pill - curve * pill} ${w} ${pill}`,
    `V ${h - pill}`,
    `C ${w} ${h - pill + curve * pill} ${w - pill + curve * pill} ${h} ${w - pill} ${h}`,
    `H ${right + shoulder}`,
    `C ${right + shoulder - curve * shoulder} ${h} ${right} ${h + shoulder - curve * shoulder} ${right} ${h + shoulder}`,
    `V ${h + dropHeight - bottom}`,
    `C ${right} ${h + dropHeight - bottom + curve * bottom} ${right - bottom + curve * bottom} ${h + dropHeight} ${right - bottom} ${h + dropHeight}`,
    `H ${left + bottom}`,
    `C ${left + bottom - curve * bottom} ${h + dropHeight} ${left} ${h + dropHeight - bottom + curve * bottom} ${left} ${h + dropHeight - bottom}`,
    `V ${h + shoulder}`,
    `C ${left} ${h + shoulder - curve * shoulder} ${left - shoulder + curve * shoulder} ${h} ${left - shoulder} ${h}`,
    `H ${pill}`,
    `C ${pill - curve * pill} ${h} 0 ${h - pill + curve * pill} 0 ${h - pill}`,
    `V ${pill}`,
    `C 0 ${pill - curve * pill} ${pill - curve * pill} 0 ${pill} 0`,
    'Z',
  ].join(' ')

  return `path('${outline}')`
}

export function NavbarGlass({
  barRef,
  triggerRef,
  positionerRef,
  popupRef,
  open,
}: NavbarGlassProps) {
  const [size, setSize] = useState<GlassSize | null>(null)

  useEffect(() => {
    const bar = barRef.current
    const trigger = triggerRef.current
    if (!bar || !trigger) return

    const observer = new ResizeObserver(() => measure())
    // Base UI writes each new position to the positioner's inline style.
    const positionObserver = new MutationObserver(() => measure())
    const observed = new Set<Element>()
    const observe = (element: HTMLElement | null) => {
      if (!element || observed.has(element)) return
      observed.add(element)
      if (element === positionerRef.current) {
        positionObserver.observe(element, { attributeFilter: ['style'] })
      } else {
        observer.observe(element)
      }
    }

    const measure = () => {
      // The popup and positioner mount after the menu opens.
      observe(popupRef.current)
      observe(positionerRef.current)
      const barBox = bar.getBoundingClientRect()
      const triggerBox = trigger.getBoundingClientRect()
      const popup = popupRef.current
      const positioner = positionerRef.current
      const rootStyle = getComputedStyle(document.documentElement)
      const rem = Number.parseFloat(rootStyle.fontSize)
      const radius = (token: string) => {
        const value = rootStyle.getPropertyValue(token).trim()
        return Number.parseFloat(value) * (value.endsWith('rem') ? rem : 1)
      }
      const shoulderRadius = radius('--radius-md')
      const bottomRadius = radius('--radius-xl')

      setSize((previous) => {
        const dropWidth = popup?.offsetWidth ?? previous?.dropWidth ?? 0
        const dropHeight = popup?.offsetHeight ?? previous?.dropHeight ?? 0
        const triggerCenter =
          triggerBox.left - barBox.left + triggerBox.width / 2
        const dropLeft =
          popup && positioner
            ? targetLeft(positioner) - barBox.left
            : triggerCenter - dropWidth / 2
        const next = {
          width: barBox.width,
          height: barBox.height,
          triggerCenter,
          dropLeft,
          dropWidth,
          dropHeight,
          shoulderRadius,
          bottomRadius,
        }
        const unchanged =
          previous &&
          (Object.keys(next) as (keyof GlassSize)[]).every(
            (key) => previous[key] === next[key],
          )
        return unchanged ? previous : next
      })
    }

    observe(bar)
    observe(trigger)
    const frame = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      positionObserver.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure)
    }
  }, [barRef, triggerRef, positionerRef, popupRef, open])

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 -z-10 hidden bg-black/35 backdrop-blur-lg transition-[clip-path] duration-500 ease-smooth motion-reduce:transition-none md:block',
        !size && 'h-full rounded-full',
      )}
      style={
        size
          ? {
              width: size.width,
              height: size.height + size.dropHeight,
              clipPath: glassOutline(size, open),
            }
          : undefined
      }
    />
  )
}
