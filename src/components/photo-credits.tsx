import content from '@/content.json'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const linkClassName =
  'rounded-xs underline underline-offset-4 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function PhotoCredits() {
  const credits = content.about_section.photoCredits

  return (
    <Dialog>
      <DialogTrigger className="self-start rounded-xs text-body transition-opacity duration-300 ease-smooth hover:underline hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none">
        {credits.trigger}
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-5">
          <DialogTitle>{credits.title}</DialogTitle>
          <DialogClose aria-label={content.schedule.close} />
        </div>
        <DialogDescription>{credits.description}</DialogDescription>
        <ul className="grid gap-5 md:grid-cols-2">
          {credits.items.map((photo) => (
            <li key={photo.file} className="flex flex-col gap-1.25 text-body">
              <a
                href={photo.href}
                target="_blank"
                rel="noreferrer"
                className={linkClassName}
              >
                {photo.label}
              </a>
              <p className="text-gray">
                {credits.attribution.replace('{title}', photo.title)}
              </p>
              <a
                href={photo.licenseHref}
                target="_blank"
                rel="noreferrer"
                className={linkClassName}
              >
                {photo.license}
              </a>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
