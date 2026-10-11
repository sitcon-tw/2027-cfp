// Import queries handled by vite-imagetools; the presets are in `vite.config.ts`.

declare module '*?responsive' {
  const picture: import('vite-imagetools').Picture
  export default picture
}

declare module '*?placeholder' {
  /** A data URL of the image about 32px wide. */
  const src: string
  export default src
}
