import { FileText, Upload, X } from 'lucide-react'
import { useId, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface FileInputProps {
  /** The chosen files; at most one unless `multiple`. */
  value: readonly File[]
  onValueChange: (files: File[]) => void
  /** Native `accept`: MIME types, `type/*` or `.ext`, comma-separated. */
  accept?: string
  /** Each pick adds to the list instead of replacing it. */
  multiple?: boolean
  disabled?: boolean
  invalid?: boolean
  /** Visible text of the pick button. */
  chooseLabel: string
  /** Accessible name of a file's remove button, given the file name. */
  removeLabel: (name: string) => string
  /** Shown while no file is chosen. */
  emptyLabel: string
  /** Labels the pick button together with its own text. */
  'aria-labelledby'?: string
  'aria-describedby'?: string
  className?: string
}

/**
 * A pick button over a hidden native file input, then the chosen files, each
 * removable. Holds `File`s only: reading or uploading them is up to the
 * caller. Not in Figma yet — the button and file rows are proposals.
 */
export function FileInput({
  value,
  onValueChange,
  accept,
  multiple = false,
  disabled,
  invalid,
  chooseLabel,
  removeLabel,
  emptyLabel,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  className,
}: FileInputProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  function add(picked: File[]) {
    if (!picked.length) return
    if (!multiple) return onValueChange(picked.slice(0, 1))
    const isNew = (file: File) =>
      !value.some(
        (other) =>
          other.name === file.name &&
          other.size === file.size &&
          other.lastModified === file.lastModified,
      )
    onValueChange([...value, ...picked.filter(isNew)])
  }

  return (
    <div className={cn('flex w-full flex-col gap-2.5', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        hidden
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          add(Array.from(event.currentTarget.files ?? []))
          // Clear it, so picking the same file again still fires a change.
          event.currentTarget.value = ''
        }}
      />
      <div className="flex flex-wrap items-center gap-5">
        <Button
          type="button"
          variant="muted"
          disabled={disabled}
          aria-labelledby={[labelledBy, `${id}-choose`]
            .filter(Boolean)
            .join(' ')}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={cn(invalid && 'outline-2 outline-red')}
          onClick={() => inputRef.current?.click()}
        >
          <Upload aria-hidden className="size-6" />
          <span id={`${id}-choose`}>{chooseLabel}</span>
        </Button>
        {!value.length && (
          <span className="text-body text-light">{emptyLabel}</span>
        )}
      </div>
      {value.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {value.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="flex min-h-20 items-center gap-2.5 rounded-sm border-2 border-gray py-2.5 pr-2.5 pl-5 text-paragraph text-foreground"
            >
              <FileText aria-hidden className="size-6 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <Button
                type="button"
                variant="dark"
                size="icon"
                shape="pill"
                disabled={disabled}
                aria-label={removeLabel(file.name)}
                onClick={() =>
                  onValueChange(value.filter((_, other) => other !== index))
                }
              >
                <X aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
