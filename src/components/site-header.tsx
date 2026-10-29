import { ArrowRight, Menu } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'

import content from '@/content.json'
import sitconWordmark from '@/assets/sitcon-wordmark.svg'
import { NavbarGlass } from '@/components/navbar-glass'
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
import { Button, buttonVariants } from '@/components/ui/button'
import { useSubmissionClosed } from '@/lib/countdown'
import { links } from '@/lib/links'
import { sessionTypes } from '@/lib/session-types'
import { cn } from '@/lib/utils'

/**
 * The glass navbar. It is `pt-header` tall and stays fixed over the page,
 * so each page paints its own background behind it.
 */
export function SiteHeader({ className }: { className?: string }) {
  const anchor = useRef<HTMLDivElement>(null)
  const submissionTrigger = useRef<HTMLButtonElement>(null)
  const dropdownPositioner = useRef<HTMLDivElement>(null)
  const dropdownPopup = useRef<HTMLDivElement>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const submissionClosed = useSubmissionClosed()

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
        className="pointer-events-auto relative isolate mx-auto flex h-control-lg max-w-content items-center justify-between px-5 md:px-10"
      >
        <NavbarGlass
          barRef={anchor}
          triggerRef={submissionTrigger}
          positionerRef={dropdownPositioner}
          popupRef={dropdownPopup}
          open={dropdownOpen}
        />
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
        <div className="flex items-center gap-2.5">
          {/*
            Position the dropdown at the pill's bottom, rather than at the
            trigger's bottom. NavbarGlass draws its surface as one shape with
            the bar, so the popup drops its own.
          */}
          <NavigationMenu
            positionMethod="fixed"
            positionerRef={dropdownPositioner}
            popupRef={dropdownPopup}
            popupClassName="overflow-visible rounded-none bg-transparent backdrop-blur-none"
            viewportClassName="rounded-b-xl"
            onValueChange={(value) => setDropdownOpen(value !== null)}
            sideOffset={() => {
              const pill = anchor.current
              const trigger = submissionTrigger.current
              return pill && trigger
                ? pill.getBoundingClientRect().bottom -
                    trigger.getBoundingClientRect().bottom
                : 0
            }}
            className="hidden md:block"
          >
            <NavigationMenuList className="p-2.5">
              <NavigationMenuItem>
                <NavigationMenuTrigger ref={submissionTrigger}>
                  {content.site_header.submission}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  {sessionTypes.map(({ id, title }) => (
                    <NavigationMenuLink
                      key={id}
                      render={<Link to="/$type" params={{ type: id }} />}
                    >
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
                <NavigationMenuLink topLevel render={<Link to={links.about} />}>
                  {content.site_header.about}
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {submissionClosed ? (
            <Button
              variant="cream"
              shape="pill"
              className="hidden md:inline-flex"
              disabled
            >
              {content.submit_closed.button}
            </Button>
          ) : (
            <Link
              to="/submit/$type"
              params={{ type: 'normal' }}
              className={buttonVariants({
                variant: 'cream',
                shape: 'pill',
                className: 'hidden md:inline-flex',
              })}
            >
              {content.site_header.submit}
            </Link>
          )}
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
              positionMethod="fixed"
              aria-label={content.site_header.navigation}
              className="md:hidden"
            >
              <nav aria-label={content.site_header.navigation}>
                <ul>
                  {(
                    [
                      {
                        to: '/$type',
                        params: { type: 'normal' },
                        label: content.sessions.generalTitle,
                      },
                      {
                        to: '/$type',
                        params: { type: 'undefined' },
                        label: content.sessions.openTitle,
                      },
                      {
                        to: '/$type',
                        params: { type: 'demo' },
                        label: content.sessions.demoTitle,
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
                        className="flex min-h-control-lg items-center justify-between gap-5 rounded-xs px-5 py-7.5 text-h3 transition-colors duration-300 ease-smooth hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none"
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
                {submissionClosed ? (
                  <Button
                    variant="cream"
                    size="lg"
                    shape="pill"
                    className="mt-5 w-full"
                    disabled
                  >
                    {content.submit_closed.button}
                  </Button>
                ) : (
                  <Link
                    to="/submit/$type"
                    params={{ type: 'normal' }}
                    onClick={() => setMobileOpen(false)}
                    className={buttonVariants({
                      variant: 'cream',
                      size: 'lg',
                      shape: 'pill',
                      className: 'mt-5 w-full',
                    })}
                  >
                    {content.site_header.submit}
                  </Link>
                )}
              </nav>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
}
