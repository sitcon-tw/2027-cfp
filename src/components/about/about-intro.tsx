import content from '@/content.json'

const intro = content.about_page.intro

/** 關於 SITCON — page title, subtitle and introduction on cream. */
export function AboutIntro() {
  return (
    <section
      id="introduction"
      aria-labelledby="introduction-title"
      className="px-2.5 py-15"
    >
      <div className="mx-auto flex max-w-content flex-col gap-2.5 p-2.5">
        <h1
          id="introduction-title"
          className="text-display font-extrabold text-balance"
        >
          {intro.title}
        </h1>
        <p className="text-h3 font-bold">{intro.subtitle}</p>
        <p className="text-paragraph">{intro.body}</p>
      </div>
    </section>
  )
}
