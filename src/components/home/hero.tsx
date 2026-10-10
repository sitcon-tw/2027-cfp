import content from '@/content.json'
import { buttonVariants } from '@/components/ui/button'

/**
 * Sized to match the 甚麼是 SITCON ? section below it: the title uses
 * `text-mega`.
 */
export function Hero() {
  return (
    <section className="px-2.5 pt-20 pb-25">
      <div className="mx-auto flex max-w-content flex-col gap-10 p-2.5">
        <h1 className="flex flex-col gap-5 font-extrabold">
          <span className="text-eyebrow">{content.hero.eventName}</span>
          <span className="text-mega tracking-tight">{content.hero.title}</span>
        </h1>
        <p className="flex flex-col gap-x-7.5 gap-y-5 text-h1 font-bold md:flex-row md:items-center">
          <time dateTime={content.hero.dateTime} className="font-numeric">
            {content.hero.date}
          </time>
          <span
            aria-hidden
            className="hidden w-0.5 self-stretch bg-foreground/40 md:block"
          />
          <span>{content.hero.venue}</span>
        </p>
        <div className="flex flex-wrap gap-5">
          <a
            href="#attend"
            className={buttonVariants({ variant: 'red', size: 'lg' })}
          >
            {content.hero.attend}
          </a>
          <a
            href="#speakers"
            className={buttonVariants({ variant: 'blue', size: 'lg' })}
          >
            {content.hero.submit}
          </a>
          <a
            href="#sponsor"
            className={buttonVariants({ variant: 'green', size: 'lg' })}
          >
            {content.hero.sponsor}
          </a>
        </div>
      </div>
    </section>
  )
}
