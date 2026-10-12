import { Link } from '@tanstack/react-router'

import content from '@/content.json'
import { HeroBackdrop } from '@/components/hero-backdrop'
import { Button, buttonVariants } from '@/components/ui/button'
import { useSubmissionClosed } from '@/lib/countdown'

const text = content.not_found_page

/**
 * 404 page for paths no route matches and for unknown session types. Laid
 * out like the homepage hero, over the same backdrop. Fills the screen, with
 * the content centered, so the backdrop never ends above the fold.
 */
export function NotFound() {
  const submissionClosed = useSubmissionClosed()
  return (
    <main className="relative isolate flex min-h-svh flex-col justify-center overflow-x-clip pt-header">
      <HeroBackdrop />
      <section className="px-2.5 pt-20 pb-25">
        <div className="mx-auto flex max-w-content flex-col gap-10 p-2.5">
          <h1 className="flex flex-col gap-5 font-extrabold">
            <span className="font-numeric text-eyebrow">{text.eyebrow}</span>
            <span className="text-headline text-balance">{text.title}</span>
          </h1>
          <p className="text-paragraph">{text.description}</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/" className={buttonVariants({ size: 'lg' })}>
              {text.home}
            </Link>
            {submissionClosed ? (
              <Button variant="blue" size="lg" disabled>
                {content.submit_closed.button}
              </Button>
            ) : (
              <Link
                to="/submit/$type"
                params={{ type: 'normal' }}
                className={buttonVariants({ variant: 'blue', size: 'lg' })}
              >
                {content.site_header.submit}
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
