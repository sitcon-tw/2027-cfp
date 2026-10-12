import { ArrowUpRight, Coffee } from 'lucide-react'

import content from '@/content.json'
import { LinkedText } from '@/components/linked-text'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SectionHeading } from '@/components/section-heading'
import { links } from '@/lib/links'

const sponsor = content.sponsor_section

/** The two ways to support, in the order the paragraphs introduce them. */
const actions = [
  { href: links.sponsorIndividual, label: sponsor.individual },
  { href: links.sponsorProspectus, label: sponsor.prospectus },
]

/**
 * 想要支持？ — the cream section that closes the homepage. Says why SITCON
 * needs support, then invites individuals and companies, linking the
 * donation page and the sponsorship prospectus like sitcon.org's 支持我們.
 */
export function SponsorSection() {
  return (
    <section
      id="sponsor"
      aria-labelledby="sponsor-title"
      className="relative bg-foreground px-2.5 py-20 text-background"
    >
      <SlantedEdge />
      <div className="relative mx-auto flex max-w-content flex-col gap-2.5 p-2.5">
        <SectionHeading id="sponsor-title">{sponsor.title}</SectionHeading>
        <div className="py-2.5">
          <Card tone="ink" className="relative rounded-xl p-2.5">
            {/* Anchored to the bottom so it sits beside the buttons, clear of the text. */}
            <Coffee
              aria-hidden
              className="absolute -right-25.25 -bottom-10 size-56 rotate-20 text-foreground/30"
            />
            <div className="relative flex flex-col gap-2.5 p-5">
              {sponsor.description.map((paragraph) => (
                <p key={paragraph} className="text-paragraph">
                  <LinkedText text={paragraph} />
                </p>
              ))}
              <div className="flex flex-wrap justify-end gap-5 py-2.5">
                {actions.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({ variant: 'cream' })}
                  >
                    {label}
                    <ArrowUpRight aria-hidden className="size-5 shrink-0" />
                  </a>
                ))}
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
