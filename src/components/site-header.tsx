import { ArrowRight, Menu } from 'lucide-react'
import { useEffect, useRef, useState, type ReactElement } from 'react'
import { Link, useMatch, useParams } from '@tanstack/react-router'

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
import {
  isSessionTypeId,
  sessionTypes,
  type SessionTypeId,
} from '@/lib/session-types'
import { cn } from '@/lib/utils'

/**
 * The glass navbar. It is `pt-header` tall and stays fixed over the page,
 * so each page paints its own background behind it.
 */
export function SiteHeader({ className }: { className?: string }) {
  const anchor = useRef<HTMLDivElement>(null)
  const submitTrigger = useRef<HTMLButtonElement>(null)
  const dropdownPositioner = useRef<HTMLDivElement>(null)
  const dropdownPopup = useRef<HTMLDivElement>(null)
  const [dropdownValue, setDropdownValue] = useState<string | null>(null)
  const dropdownOpen = dropdownValue !== null
  const [mobileOpen, setMobileOpen] = useState(false)
  const submissionClosed = useSubmissionClosed()
  const submitType = useSubmitType()
  const onSubmitGuide = useMatch({ from: '/$type', shouldThrow: false })

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 48rem)')
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileOpen(false)
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  useEffect(() => {
    if (!mobileOpen && !dropdownOpen) return
    const closeOffscreen = () => {
      if (
        anchor.current &&
        anchor.current.getBoundingClientRect().bottom <= 0
      ) {
        setMobileOpen(false)
        setDropdownValue(null)
      }
    }
    window.addEventListener('scroll', closeOffscreen, { passive: true })
    return () => window.removeEventListener('scroll', closeOffscreen)
  }, [mobileOpen, dropdownOpen])

  return (
    <header
      id="page-top"
      tabIndex={-1}
      className={cn(
        'site-header pointer-events-none px-2.5 pt-7.5 pb-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
        className,
      )}
    >
      <div
        ref={anchor}
        className="pointer-events-auto relative isolate mx-auto flex h-control-lg max-w-content items-center justify-between px-5 md:px-10"
      >
        <NavbarGlass
          barRef={anchor}
          triggerRef={submitTrigger}
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
            value={dropdownValue}
            onValueChange={setDropdownValue}
            sideOffset={() => {
              const pill = anchor.current
              const trigger = submitTrigger.current
              return pill && trigger
                ? pill.getBoundingClientRect().bottom -
                    trigger.getBoundingClientRect().bottom
                : 0
            }}
            // Keep the drop under the bar's straight edge, clear of its
            // rounded ends and the glass's shoulder curve; NavbarGlass can't
            // reach past them, so text there would overflow the glass.
            collisionBoundary={anchor.current ?? undefined}
            collisionPadding={dropInset(anchor.current)}
            className="hidden md:block"
          >
            {/* No end padding: the submit pill ends the bar. */}
            <NavigationMenuList className="py-2.5 pl-2.5">
              {sessionTypes.map(({ id, title }) => (
                <NavigationMenuItem key={id}>
                  <NavigationMenuLink
                    topLevel
                    render={<Link to="/$type" params={{ type: id }} />}
                  >
                    {title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <NavigationMenuLink topLevel render={<Link to={links.about} />}>
                  {content.site_header.about}
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem value="submit">
                {submissionClosed ? (
                  <Button variant="cream" shape="pill" disabled>
                    {content.submit_closed.button}
                  </Button>
                ) : (
                  <>
                    {/*
                      One pill: the whole of it opens both choices on hover,
                      and clicking it goes to the next step (the 徵稿說明, or
                      the form from the 徵稿說明).
                    */}
                    <NavigationMenuTrigger
                      ref={submitTrigger}
                      nativeButton={false}
                      render={
                        onSubmitGuide ? (
                          <Link
                            to="/submit/$type"
                            params={{ type: submitType }}
                          />
                        ) : (
                          <Link to="/$type" params={{ type: submitType }} />
                        )
                      }
                      onClick={() => setDropdownValue(null)}
                      className={buttonVariants({
                        variant: 'cream',
                        shape: 'pill',
                        className:
                          'gap-0.5 pr-5 hover:bg-foreground hover:opacity-100 hover:brightness-90 data-popup-open:brightness-90',
                      })}
                    >
                      {onSubmitGuide
                        ? content.site_header.submitForm
                        : content.site_header.submitGuide}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="flex-col">
                      <SubmitChoice
                        link={
                          <Link to="/$type" params={{ type: submitType }} />
                        }
                        label={content.site_header.submitGuide}
                        hint={content.site_header.submitGuideHint}
                      />
                      <SubmitChoice
                        link={
                          <Link
                            to="/submit/$type"
                            params={{ type: submitType }}
                          />
                        }
                        label={content.site_header.submitForm}
                        hint={content.site_header.submitFormHint}
                      />
                    </NavigationMenuContent>
                  </>
                )}
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
                  <div className="mt-5 flex flex-col gap-2.5">
                    <Link
                      to="/$type"
                      params={{ type: submitType }}
                      onClick={() => setMobileOpen(false)}
                      className={buttonVariants({
                        variant: 'cream',
                        size: 'lg',
                        shape: 'pill',
                      })}
                    >
                      {content.site_header.submitGuide}
                    </Link>
                    <Link
                      to="/submit/$type"
                      params={{ type: submitType }}
                      onClick={() => setMobileOpen(false)}
                      className={buttonVariants({
                        variant: 'cream',
                        size: 'lg',
                        shape: 'pill',
                      })}
                    >
                      {content.site_header.submitForm}
                    </Link>
                  </div>
                )}
              </nav>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
}

/**
 * How far the glass drop stays from each end of the bar: the pill's rounded
 * end plus the shoulder curve (`--radius-md`) where the drop leaves it.
 */
function dropInset(bar: HTMLElement | null) {
  if (!bar) return 20
  const rootStyle = getComputedStyle(document.documentElement)
  const rem = Number.parseFloat(rootStyle.fontSize)
  const shoulder =
    Number.parseFloat(rootStyle.getPropertyValue('--radius-md')) * rem
  const inset = bar.offsetHeight / 2 + shoulder
  return { left: inset, right: inset }
}

/**
 * The session type the page is about (`/demo`, `/submit/demo`), so the
 * submit choices stay on it; 一般議程 elsewhere.
 */
function useSubmitType(): SessionTypeId {
  const { type } = useParams({ strict: false })
  return isSessionTypeId(type) ? type : 'normal'
}

/** A submit choice: where it leads, and who it is for. */
function SubmitChoice({
  link,
  label,
  hint,
}: {
  link: ReactElement
  label: string
  hint: string
}) {
  return (
    <NavigationMenuLink
      render={link}
      className="flex-col items-start justify-center gap-0.5 py-2.5"
    >
      {label}
      <span className="font-normal text-foreground/70">{hint}</span>
    </NavigationMenuLink>
  )
}
