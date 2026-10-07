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
import { links } from '@/lib/links'
import { sessionTypes } from '@/lib/session-types'
import { cn } from '@/lib/utils'

/**
 * The glass navbar. It is `pt-header` tall and overlays the top of the page,
 * so each page paints its own background behind it.
 */
export function SiteHeader({ className }: { className?: string }) {
  return (
    <header className={cn('px-2.5 pt-7.5 pb-2.5', className)}>
      <div className="mx-auto flex h-control-lg max-w-content items-center justify-between rounded-full bg-black/35 px-10 backdrop-blur-lg">
        <Link
          to="/"
          className="rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          <img src={sitconWordmark} alt={content.site_header.homeAlt} />
        </Link>
        <NavigationMenu>
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
              <NavigationMenuLink topLevel href="/#sponsor">
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
      </div>
    </header>
  )
}
