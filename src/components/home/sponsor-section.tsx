import { Coffee } from 'lucide-react'

import content from '@/content.json'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { links } from '@/lib/links'
import { cn } from '@/lib/utils'

/** 我要贊助 — the cream section that closes the homepage. */
export function SponsorSection() {
  return (
    <section
      id="sponsor"
      aria-labelledby="sponsor-title"
      className="relative bg-foreground px-2.5 py-20 text-background"
    >
      <SlantedEdge />
      <div className="relative mx-auto flex max-w-content flex-col gap-2.5 p-2.5">
        <h2 id="sponsor-title" className="text-h1 font-extrabold">
          {content.sponsor_section.title}
        </h2>
        <Separator className="rounded-full bg-background/50 data-[orientation=horizontal]:h-0.75" />
        <div className="py-2.5">
          <Card tone="ink" className="relative rounded-xl p-2.5">
            <Coffee
              aria-hidden
              className="absolute top-34.5 -right-25.25 size-56 rotate-20 text-foreground/30"
            />
            <div className="relative flex flex-col gap-2.5 p-5">
              <p className="text-paragraph">
                {content.sponsor_section.description}
              </p>
              <div className="flex flex-wrap justify-end gap-5 py-2.5">
                <a
                  href={links.sponsorIndividual}
                  className={buttonVariants({ variant: 'cream' })}
                >
                  {content.sponsor_section.individual}
                </a>
                <a
                  href={links.sponsorProspectus}
                  className={buttonVariants({ variant: 'cream' })}
                >
                  {content.sponsor_section.prospectus}
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

/**
 * Two crossing bands straddling the section's top edge, so the dark page
 * above tears into the cream. Overflows sideways; the page clips it.
 */
function SlantedEdge() {
  const band =
    'absolute top-0 left-1/2 w-screen -translate-1/2 scale-x-150 bg-foreground'
  return (
    <div aria-hidden className="pointer-events-none">
      <div className={cn(band, 'h-22.5 rotate-3 opacity-60')} />
      <div className={cn(band, 'h-20 -rotate-3')} />
    </div>
  )
}
