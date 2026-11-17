import { ArrowUpRight } from 'lucide-react'

import content from '@/content.json'
import { SectionHeading } from '@/components/section-heading'
import { links } from '@/lib/links'

const theme = content.theme_section

/**
 * 關於今年的 SITCON 主題 — the 42 essay at the foot of the homepage. Not in
 * Figma, so it continues the cream of the sponsor section above and keeps
 * to plain type: the answer, the essay, and the closing invitation.
 */
export function ThemeSection() {
  return (
    <section
      id="theme"
      aria-labelledby="theme-title"
      className="bg-foreground px-2.5 py-20 text-background"
    >
      <div className="mx-auto flex max-w-content flex-col gap-2.5 p-2.5">
        <SectionHeading id="theme-title">{theme.title}</SectionHeading>
        <div className="flex flex-col gap-7.5 py-5">
          <p className="flex flex-col gap-2.5">
            <span className="font-numeric text-stat font-bold tracking-tight">
              {theme.answer}
            </span>
            <span className="text-h3 font-bold">{theme.tagline}</span>
          </p>
          {theme.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-paragraph">
              {paragraph}
            </p>
          ))}
          <p className="flex flex-col border-l-2 border-blue pl-5 text-lead font-bold">
            {theme.questions.map((question) => (
              <span key={question}>{question}</span>
            ))}
          </p>
          <p className="text-paragraph">{theme.closing}</p>
          <p className="flex flex-col gap-2.5">
            <span className="text-paragraph">{theme.finale.lead}</span>
            <strong className="text-h2 font-extrabold">
              {theme.finale.emphasis}
            </strong>
          </p>
        </div>
        <div className="flex flex-col gap-5 border-t border-background/20 pt-7.5">
          <h3 className="text-h3 font-bold">{theme.socialKitTitle}</h3>
          <p className="text-paragraph">{content.social_kit.description}</p>
          <a
            href={links.socialKit}
            className="inline-flex min-h-control items-center gap-2.5 self-start rounded-xs text-paragraph underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            {content.social_kit.action}
            <ArrowUpRight aria-hidden className="size-5 shrink-0" />
          </a>
        </div>
      </div>
    </section>
  )
}
