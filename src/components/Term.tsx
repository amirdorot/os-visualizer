import { useId, useState, type ReactNode } from 'react'
import { useGlossary } from '../data/glossaryText'

/** An inline glossary term that reveals its definition on hover or keyboard focus. */
export function Term({ k, children }: { k: string; children?: ReactNode }) {
  const entry = useGlossary()[k]
  const [open, setOpen] = useState(false)
  const id = useId()
  if (!entry) return <>{children}</>

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="cursor-help border-b border-dotted border-current font-medium"
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        {children ?? entry.term}
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute start-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rtl:translate-x-1/2 rounded-xl border border-line bg-surface p-3 text-start text-sm font-normal text-ink shadow-xl"
        >
          <span className="mb-1 block font-semibold">{entry.term}</span>
          <span className="text-muted">{entry.definition}</span>
        </span>
      )}
    </span>
  )
}
