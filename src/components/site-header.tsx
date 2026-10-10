import { ArrowRight, Menu } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'

import content from '@/content.json'
import sitconWordmark from '@/assets/sitcon-wordmark.svg'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { links } from '@/lib/links'
import { sessionTypes } from '@/lib/session-types'
import { cn } from '@/lib/utils'

/**
 * The glass navbar. It is `pt-header` tall and stays fixed over the page,
 * so each page paints its own background behind it.
 */
export function SiteHeader({ className }: { className?: string }) {
  const anchor = useRef<HTMLDivElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 48rem)')
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileOpen(false)
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  return (
    <header
      className={cn('pointer-events-none px-2.5 pt-7.5 pb-2.5', className)}
    >
      <div
        ref={anchor}
        className="pointer-events-auto mx-auto flex h-control-lg max-w-content items-center justify-between px-5 md:rounded-full md:bg-black/35 md:px-10 md:backdrop-blur-lg"
      >
        <Link
          to="/"
          className="-translate-y-1/8 rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          <img
            className="block"
            src={sitconWordmark}
            alt={content.site_header.homeAlt}
          />
        </Link>
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList className="p-2.5">
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                {content.site_header.submission}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                {sessionTypes.map(({ id, title }) => (
                  <NavigationMenuLink key={id} href={links.sessions[id]}>
                    {title}
                  </NavigationMenuLink>
                ))}
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                topLevel
                render={<Link to="/" hash="sponsor" />}
              >
                {content.site_header.sponsor}
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink topLevel href={links.about}>
                {content.site_header.about}
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Popover open={mobileOpen} onOpenChange={setMobileOpen}>
          <PopoverTrigger
            className="md:hidden"
            aria-label={
              mobileOpen
                ? content.site_header.closeMenu
                : content.site_header.openMenu
            }
          >
            <Menu className="size-10" aria-hidden="true" />
          </PopoverTrigger>
          <PopoverContent
            anchor={anchor}
            aria-label={content.site_header.navigation}
            className="md:hidden"
          >
            <nav aria-label={content.site_header.navigation}>
              <ul>
                {(
                  [
                    {
                      to: '/submit/$type',
                      params: { type: 'general' },
                      label: content.site_footer.submitGeneral,
                    },
                    {
                      to: '/submit/$type',
                      params: { type: 'open' },
                      label: content.site_footer.submitOpen,
                    },
                    {
                      to: '/submit/$type',
                      params: { type: 'demo' },
                      label: content.site_footer.submitDemo,
                    },
                    {
                      to: '/',
                      hash: 'sponsor',
                      label: content.site_header.sponsor,
                    },
                    { to: '/about', label: content.site_header.about },
                  ] as const
                ).map(({ label, ...destination }) => (
                  <li key={label}>
                    <Link
                      {...destination}
                      onClick={() => setMobileOpen(false)}
                      className="flex min-h-control-lg items-center justify-between gap-5 rounded-xs px-5 py-7.5 text-h3 hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                    >
                      {label}
                      <ArrowRight
                        className="size-8 shrink-0"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
