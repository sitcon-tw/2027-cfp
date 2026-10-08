import { Coffee } from 'lucide-react'

import content from '@/content.json'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SectionHeading } from '@/components/section-heading'
import { links } from '@/lib/links'

/** 想要支持？ — the cream section that closes the homepage. */
export function SponsorSection() {
  return (
    <section
      id="sponsor"
      aria-labelledby="sponsor-title"
      className="relative bg-foreground px-2.5 py-20 text-background"
    >
      <SlantedEdge />
      <div className="relative mx-auto flex max-w-content flex-col gap-2.5 p-2.5">
        <SectionHeading id="sponsor-title">
          {content.sponsor_section.title}
        </SectionHeading>
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
 * A single solid wedge on the section's top edge, so the dark page above
 * meets the cream on one clean diagonal. Stretches to any width.
 */
function SlantedEdge() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      className="pointer-events-none absolute bottom-full left-0 h-15 w-full fill-foreground"
    >
      <polygon points="0,10 100,0 100,10" />
    </svg>
  )
}
