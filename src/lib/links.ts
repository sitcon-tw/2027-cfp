import content from '@/content.json'
// Every outbound destination in one place, so pages and the shell share them.

/** Stand-in for destinations whose page or URL is not decided yet. */
export const TODO_HREF = content.links.placeholder

export const links = {
  tickets: TODO_HREF,
  about: '/about',
  theme: TODO_HREF,
  /**
   * Policy pages linked from the session pages' notes. Keys are referenced
   * from `content.json` rich text.
   */
  policies: {
    codeOfConduct: content.links.codeOfConduct,
    submissionGuidelines: content.links.submissionGuidelines,
    license: content.links.license,
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
