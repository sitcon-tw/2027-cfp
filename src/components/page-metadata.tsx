import { pageMetadata } from '@/lib/page-metadata'

export function PageMetadata({ pathname }: { pathname: string }) {
  const { title, description, canonical, noindex } = pageMetadata(
    pathname,
    import.meta.env.BASE_URL,
  )

  return (
    <>
      <title data-page-metadata>{title}</title>
      <meta data-page-metadata name="description" content={description} />
      {noindex && <meta data-page-metadata name="robots" content="noindex" />}
      <meta data-page-metadata property="og:title" content={title} />
      <meta
        data-page-metadata
        property="og:description"
        content={description}
      />
      {canonical && (
        <>
          <link data-page-metadata rel="canonical" href={canonical} />
          <meta data-page-metadata property="og:url" content={canonical} />
        </>
      )}
    </>
  )
}
