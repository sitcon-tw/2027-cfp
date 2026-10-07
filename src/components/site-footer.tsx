import type { ComponentProps, ReactNode } from 'react'

import content from '@/content.json'
import facebookIcon from '@/assets/facebook.svg'
import flickrIcon from '@/assets/flickr.svg'
import instagramIcon from '@/assets/instagram.svg'
import sitconLogo from '@/assets/sitcon-logo-full.svg'
import telegramIcon from '@/assets/telegram.svg'
import youtubeIcon from '@/assets/youtube.svg'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { links } from '@/lib/links'
import { cn } from '@/lib/utils'

// SITCON skipped 2023.
const pastYears = content.site_footer.pastYears

const socials = [
  {
    name: content.social.facebook,
    href: links.social.facebook,
    icon: facebookIcon,
  },
  {
    name: content.social.instagram,
    href: links.social.instagram,
    icon: instagramIcon,
  },
  {
    name: content.social.telegram,
    href: links.social.telegram,
    icon: telegramIcon,
  },
  { name: content.social.flickr, href: links.social.flickr, icon: flickrIcon },
  {
    name: content.social.youtube,
    href: links.social.youtube,
    icon: youtubeIcon,
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-gray bg-foreground px-2.5 py-16.25 text-background">
      <div className="mx-auto flex max-w-content flex-col gap-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-0">
          <FooterColumn title={content.site_footer.linksTitle}>
            <FooterLink href="/">{content.site_footer.home}</FooterLink>
            <FooterLink href={links.theme}>
              {content.site_footer.theme}
            </FooterLink>
            <FooterLink href={links.submit.general}>
              {content.site_footer.submitGeneral}
            </FooterLink>
            <FooterLink href={links.submit.open}>
              {content.site_footer.submitOpen}
            </FooterLink>
            <FooterLink href={links.submit.demo}>
              {content.site_footer.submitDemo}
            </FooterLink>
          </FooterColumn>
          <FooterColumn title={content.site_footer.supportTitle}>
            <FooterLink href="/#sponsor">
              {content.site_footer.sponsor}
            </FooterLink>
            <FooterLink href={links.sponsorProspectus}>
              {content.site_footer.prospectus}
            </FooterLink>
          </FooterColumn>
          <FooterColumn title={content.site_footer.pastSitesTitle}>
            <ul className="flex flex-wrap gap-x-5.5 gap-y-1.5">
              {pastYears.map((year) => (
                <li key={year} className="w-12.25">
                  <FooterLink href={links.pastSite(year)}>{year}</FooterLink>
                </li>
              ))}
            </ul>
          </FooterColumn>
          <FooterColumn title={content.site_footer.contactTitle}>
            <FooterLink href={links.contactEmail}>
              {content.site_footer.email}
            </FooterLink>
          </FooterColumn>
        </div>

        <Separator className="bg-background" />

        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-5.75">
            <img src={sitconLogo} alt={content.site_footer.logoAlt} />
            <p className="w-66.25 text-caption">
              {content.site_footer.nameZh}
              <br />
              {content.site_footer.nameEn}
            </p>
          </div>
          <ul className="flex gap-5">
            {socials.map(({ name, href, icon }) => (
              <li key={name}>
                <a
                  href={href}
                  aria-label={name}
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'icon',
                  })}
                >
                  <img src={icon} alt="" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <h2 className="text-subheading font-bold">{title}</h2>
      {children}
    </div>
  )
}

function FooterLink({ className, ...props }: ComponentProps<'a'>) {
  return (
    <a
      className={cn(
        'self-start rounded-xs text-body hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
        className,
      )}
      {...props}
    />
  )
}
