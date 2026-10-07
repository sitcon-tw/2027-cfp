import content from '@/content.json'
import { buttonVariants } from '@/components/ui/button'
import { links } from '@/lib/links'

export function Hero() {
  return (
    <section className="px-2.5 py-25">
      <div className="mx-auto max-w-content pb-2.5 pl-2.5">
        <h1 className="font-extrabold">
          <span className="block text-eyebrow">{content.hero.eventName}</span>
          <span className="block text-display">{content.hero.title}</span>
        </h1>
        <p className="py-5 text-paragraph leading-none font-extrabold">
          <time dateTime={content.hero.dateTime}>{content.hero.date}</time>{' '}
          {content.hero.venue}
        </p>
        <div className="flex flex-wrap gap-6.25 py-2.5">
          <a
            href={links.tickets}
            className={buttonVariants({ variant: 'red' })}
          >
            {content.hero.attend}
          </a>
          <a href="#speakers" className={buttonVariants({ variant: 'blue' })}>
            {content.hero.submit}
          </a>
          <a href="#sponsor" className={buttonVariants({ variant: 'green' })}>
            {content.hero.sponsor}
          </a>
        </div>
      </div>
    </section>
  )
}
