import { Link } from '@tanstack/react-router'

import content from '@/content.json'
import { HomeBackdrop } from '@/components/home/home-backdrop'
import { buttonVariants } from '@/components/ui/button'

const text = content.not_found_page

/**
 * 404 page for paths no route matches and for unknown session types. Laid
 * out like the homepage hero, over the same backdrop.
 */
export function NotFound() {
  return (
    <main className="relative isolate overflow-x-clip pt-header">
      <HomeBackdrop />
      <section className="px-2.5 pt-20 pb-25">
        <div className="mx-auto flex max-w-content flex-col gap-10 p-2.5">
          <div className="flex flex-col gap-5">
            <h1 className="flex flex-col gap-5 font-extrabold">
              <span className="font-numeric text-eyebrow">{text.eyebrow}</span>
              <span className="text-headline text-balance">{text.title}</span>
            </h1>
            <p className="text-paragraph">{text.description}</p>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link to="/" className={buttonVariants({ size: 'lg' })}>
              {text.home}
            </Link>
            <Link
              to="/submit/$type"
              params={{ type: 'general' }}
              className={buttonVariants({ variant: 'blue', size: 'lg' })}
            >
              {text.submit}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
