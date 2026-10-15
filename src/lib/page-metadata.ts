import content from '@/content.json'

export const publicPagePaths = ['/', ...Object.keys(content.metadata.pages)]

export function pageMetadata(pathname: string, basepath = '/') {
  const base = basepath.replace(/\/$/, '')
  const relative =
    pathname === base
      ? '/'
      : base && pathname.startsWith(`${base}/`)
        ? pathname.slice(base.length)
        : pathname
  const path = relative.replace(/\/$/, '') || '/'
  const pages = content.metadata.pages
  const page = Object.hasOwn(pages, path)
    ? pages[path as keyof typeof pages]
    : undefined

  return {
    title: page?.title ?? content.metadata.title,
    description: page?.description ?? content.metadata.description,
    noindex: path.startsWith('/submit/'),
    canonical:
      path === '/' || page
        ? new URL(path === '/' ? '' : `${path.slice(1)}/`, content.metadata.url)
            .href
        : undefined,
  }
}
