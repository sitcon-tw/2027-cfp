import content from '@/content.json'
// Every outbound destination in one place, so pages and the shell share them.

/** Stand-in for destinations whose page or URL is not decided yet. */
export const TODO_HREF = content.links.placeholder

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
  contactEmail: content.links.contactEmail,
  pastSite: (year: number) =>
    content.links.pastSite.replace('{year}', String(year)),
  // TODO: verify each account with the organizers.
  social: {
    facebook: content.links.facebook,
    instagram: content.links.instagram,
    telegram: content.links.telegram,
    flickr: content.links.flickr,
    youtube: content.links.youtube,
  },
} as const
