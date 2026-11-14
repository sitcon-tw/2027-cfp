import content from '@/content.json'
// Every outbound destination in one place, so pages and the shell share them.

export const links = {
  about: '/about',
  sponsorIndividual: content.links.donate,
  sponsorProspectus: content.links.prospectus,
  recruitForm: content.links.recruitForm,
  contactEmail: content.links.contactEmail,
  pastSite: (year: number) =>
    content.links.pastSite.replace('{year}', String(year)),
  social: {
    facebook: content.links.facebook,
    instagram: content.links.instagram,
    threads: content.links.threads,
    telegram: content.links.telegram,
    flickr: content.links.flickr,
    youtube: content.links.youtube,
  },
} as const
