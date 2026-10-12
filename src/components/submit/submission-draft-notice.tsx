import { useState } from 'react'

import content from '@/content.json'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

const text = content.submit_page.draft

/**
 * Says that drafts are saved in this browser and 基本資料 is shared between
 * the types, with a confirmed way to clear them on a shared computer. Not in
 * Figma.
 */
export function SubmissionDraftNotice({ onClear }: { onClear: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col items-start gap-5 p-2.5 md:flex-row md:items-center md:justify-between">
      <p className="text-body text-light md:w-2/3">{text.notice}</p>
      <Button variant="muted" shape="pill" onClick={() => setOpen(true)}>
        {text.clear}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-2.5">
            <DialogTitle className="text-balance">
              {text.confirmTitle}
            </DialogTitle>
            <DialogClose aria-label={content.submit_page.sent.close} />
          </div>
          <DialogDescription>{text.confirmDescription}</DialogDescription>
          <div className="flex flex-wrap justify-end gap-2.5">
            <Button
              variant="outline"
              shape="pill"
              onClick={() => setOpen(false)}
            >
              {text.cancel}
            </Button>
            <Button
              variant="dark"
              shape="pill"
              onClick={() => {
                onClear()
                setOpen(false)
              }}
            >
              {text.confirm}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
