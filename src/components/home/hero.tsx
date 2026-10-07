import { buttonVariants } from '@/components/ui/button'
import { links } from '@/lib/links'

export function Hero() {
  return (
    <section className="px-2.5 py-25">
      <div className="mx-auto max-w-content pb-2.5 pl-2.5">
        <h1 className="font-extrabold">
          <span className="block text-eyebrow">SITCON 2027</span>
          <span className="block text-display">Call For Papers</span>
        </h1>
        <p className="py-5 text-paragraph leading-none font-extrabold">
          <time dateTime="2027-03-13">2027/03/13</time> 中央研究院人文社會科學館
        </p>
        <div className="flex flex-wrap gap-6.25 py-2.5">
          <a
            href={links.tickets}
            className={buttonVariants({ variant: 'red' })}
          >
            我要參加
          </a>
          <a href="#speakers" className={buttonVariants({ variant: 'blue' })}>
            我要投稿
          </a>
          <a href="#sponsor" className={buttonVariants({ variant: 'green' })}>
            我要贊助
          </a>
        </div>
      </div>
    </section>
  )
}
