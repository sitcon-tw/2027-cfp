import content from '@/content.json'
// Every outbound destination in one place, so pages and the shell share them.

export const links = {
  about: '/about',
  sponsorIndividual: content.links.donate,
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
