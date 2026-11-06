import { ChevronDown } from 'lucide-react'

import content from '@/content.json'
import { buttonVariants, type ButtonVariant } from '@/components/ui/button'
import {
  Menu,
  MenuContent,
  MenuLinkItem,
  MenuTrigger,
} from '@/components/ui/menu'
import { cn } from '@/lib/utils'

// Calendar items are taller and bold, and highlight dark so keyboard focus
// stands out on the light popup.
const CALENDAR_ITEM =
  'min-h-control rounded-xl py-2.5 font-bold data-highlighted:bg-background data-highlighted:text-foreground'

export interface CalendarMenuProps {
  /** The published `.ics` file (`content.links.*CalendarFile`). */
  file: string
  variant?: ButtonVariant
  size?: 'md' | 'lg'
  align?: 'start' | 'end'
}

/**
 * 加入行事曆: subscribe to one of the site's `.ics` calendars in Google or
 * Apple Calendar, or download it. Subscribers pick up later changes to the
 * file, so every button for the same audience points at the same file.
 */
export function CalendarMenu({
  file,
  variant = 'muted',
  size = 'md',
  align = 'end',
}: CalendarMenuProps) {
  const labels = content.submission_deadline
  const webcal = file.replace(/^https?:/, 'webcal:')
  return (
    <Menu>
      <MenuTrigger
        className={buttonVariants({
          variant,
          size,
          className: 'data-popup-open:brightness-90',
        })}
      >
        {labels.addCalendar}
        <ChevronDown
          aria-hidden
          className={cn(
            'transition-transform duration-200 in-data-popup-open:rotate-180 motion-reduce:transition-none',
            size === 'lg' ? 'size-6' : 'size-5',
          )}
        />
      </MenuTrigger>
      {/* A light surface, to pair with the buttons and cream cards around
          it, instead of the default glass popup. */}
      <MenuContent
        align={align}
        className="rounded-xl border-0 bg-light bg-none text-background backdrop-blur-none transition-opacity duration-300 ease-smooth data-ending-style:scale-100 data-starting-style:scale-100"
      >
        <MenuLinkItem
          className={CALENDAR_ITEM}
          href={content.links.googleCalendarSubscribe.replace(
            '{url}',
            encodeURIComponent(webcal),
          )}
          target="_blank"
          rel="noreferrer"
        >
          {labels.calendarGoogle}
        </MenuLinkItem>
        <MenuLinkItem className={CALENDAR_ITEM} href={webcal}>
          {labels.calendarApple}
        </MenuLinkItem>
        <MenuLinkItem className={CALENDAR_ITEM} href={file} download>
          {labels.calendarDownload}
        </MenuLinkItem>
      </MenuContent>
    </Menu>
  )
}
