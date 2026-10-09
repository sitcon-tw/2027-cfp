import { buttonVariants, type ButtonVariant } from '@/components/ui/button'

export interface PhotoCtaAction {
  label: string
  href: string
  variant?: ButtonVariant
}

export interface PhotoCtaProps {
  title: string
  /** One or more link buttons under the title. */
  actions: PhotoCtaAction[]
  /** Decorative background photo, dimmed and faded in from the top. */
  image?: string
}

/**
 * Full-width photo band with a heading and link buttons, above the footer:
 * 想要在舞臺發光發熱？ on session pages, 參考更多稿件 on the submission page.
 */
export function PhotoCta({ title, actions, image }: PhotoCtaProps) {
  return (
    <section className="relative isolate px-2.5 pt-20 pb-15">
      {image && (
        <div aria-hidden className="absolute inset-0 -z-10">
          <img
            src={image}
            alt=""
            className="size-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-linear-to-b from-background from-2% to-black/0" />
        </div>
      )}
      <div className="mx-auto flex max-w-content flex-col items-center gap-10 p-2.5 text-center">
        <h2 className="text-h1 font-extrabold">{title}</h2>
        {actions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-5">
            {actions.map(({ label, href, variant = 'cream' }) => (
              <a
                key={href + label}
                href={href}
                className={buttonVariants({
                  variant,
                  className: 'rounded-full',
                })}
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
