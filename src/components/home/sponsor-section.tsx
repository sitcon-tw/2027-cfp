import { Coffee } from 'lucide-react'

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
          我要贊助
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
                贊助
                SITCON，能直接接觸由學生組成、對程式設計、開源軟體、資訊安全、硬體與社群經營充滿熱情的技術社群，提升品牌在年輕科技人才與開發者中的曝光與好感度，同時支持學生交流、分享作品與探索創新的平台；簡單來說，現在投資
                SITCON，未來可能少一個凌晨三點才發現伺服器壞掉的人。
              </p>
              <div className="flex flex-wrap justify-end gap-5 py-2.5">
                <a
                  href={links.sponsorIndividual}
                  className={buttonVariants({ variant: 'cream' })}
                >
                  個人贊助
                </a>
                <a
                  href={links.sponsorProspectus}
                  className={buttonVariants({ variant: 'cream' })}
                >
                  查看贊助募集書
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
