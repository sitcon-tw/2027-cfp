import type { ComponentProps, ReactNode } from 'react'

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
const pastYears = [
  2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2024, 2025, 2026,
]

const socials = [
  { name: 'Facebook', href: links.social.facebook, icon: facebookIcon },
  { name: 'Instagram', href: links.social.instagram, icon: instagramIcon },
  { name: 'Telegram', href: links.social.telegram, icon: telegramIcon },
  { name: 'Flickr', href: links.social.flickr, icon: flickrIcon },
  { name: 'YouTube', href: links.social.youtube, icon: youtubeIcon },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-gray bg-foreground px-2.5 py-16.25 text-background">
      <div className="mx-auto flex max-w-content flex-col gap-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-0">
          <FooterColumn title="連結">
            <FooterLink href="/">首頁</FooterLink>
            <FooterLink href={links.theme}>年會主題</FooterLink>
            <FooterLink href={links.submit.general}>一般議程投稿</FooterLink>
            <FooterLink href={links.submit.open}>開放式議程投稿</FooterLink>
            <FooterLink href={links.submit.demo}>Demo 展投稿</FooterLink>
          </FooterColumn>
          <FooterColumn title="支持我們">
            <FooterLink href="/#sponsor">我要贊助</FooterLink>
            <FooterLink href={links.sponsorProspectus}>
              索取贊助徵求書
            </FooterLink>
          </FooterColumn>
          <FooterColumn title="歷年主題網站">
            <ul className="flex flex-wrap gap-x-5.5 gap-y-1.5">
              {pastYears.map((year) => (
                <li key={year} className="w-12.25">
                  <FooterLink href={links.pastSite(year)}>{year}</FooterLink>
                </li>
              ))}
            </ul>
          </FooterColumn>
          <FooterColumn title="聯絡我們">
            <FooterLink href={links.contactEmail}>
              contact@sitcon.org
            </FooterLink>
          </FooterColumn>
        </div>

        <Separator className="bg-background" />

        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-5.75">
            <img src={sitconLogo} alt="SITCON" />
            <p className="w-66.25 text-caption">
              學生計算機年會
              <br />
              Students&apos; Information Technology Conference
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
