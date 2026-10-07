// Every outbound destination in one place, so pages and the shell share them.

/** Stand-in for destinations whose page or URL is not decided yet. */
export const TODO_HREF = '#'

export const links = {
  tickets: TODO_HREF,
  about: TODO_HREF,
  theme: TODO_HREF,
  submit: {
    general: TODO_HREF,
    open: TODO_HREF,
    demo: TODO_HREF,
  },
  sessions: {
    general: TODO_HREF,
    open: TODO_HREF,
    demo: TODO_HREF,
  },
  sponsorIndividual: TODO_HREF,
  sponsorProspectus: TODO_HREF,
  contactEmail: 'mailto:contact@sitcon.org',
  pastSite: (year: number) => `https://sitcon.org/${year}/`,
  // TODO: verify each account with the organizers.
  social: {
    facebook: 'https://www.facebook.com/SITCON.tw',
    instagram: 'https://www.instagram.com/sitcon.tw',
    telegram: 'https://t.me/SITCONtw',
    flickr: 'https://www.flickr.com/photos/sitcon',
    youtube: 'https://www.youtube.com/@SITCONtw',
  },
} as const
