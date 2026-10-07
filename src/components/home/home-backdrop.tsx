import heroIcon from '@/assets/sitcon-icon-hero.svg'
import topIcon from '@/assets/sitcon-icon-backdrop-top.svg'

/**
 * Dark gradient and faint SITCON icons behind the top of the homepage. Fills
 * its nearest positioned ancestor, which must be `isolate`.
 */
export function HomeBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 -bg-linear-75 from-black/43 from-1% via-black/30 via-28% to-foreground/13 to-90%"
    >
      <img
        src={topIcon}
        alt=""
        className="absolute top-6.5 -left-28 -rotate-28 blur-md"
      />
      <img
        src={heroIcon}
        alt=""
        className="absolute top-22.5 left-1/2 ml-69.5"
      />
    </div>
  )
}
