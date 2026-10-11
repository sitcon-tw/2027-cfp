import type { Picture } from 'vite-imagetools'

/**
 * Starts downloading `image` as a `<picture>` with these `sizes` would: the
 * browser picks the format and width, even though it is never shown.
 */
export function preloadImage(image: Picture, sizes: string) {
  const picture = document.createElement('picture')
  for (const [format, srcSet] of Object.entries(image.sources)) {
    const source = document.createElement('source')
    source.type = `image/${format}`
    source.srcset = srcSet
    source.sizes = sizes
    picture.append(source)
  }
  const img = new Image()
  picture.append(img)
  img.src = image.img.src
}
