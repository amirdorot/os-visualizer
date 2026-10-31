import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { Button } from './ui'

/** Copies a link to the current page, including the lab's settings in the query string, scrolled to `target`. */
export function ShareButton({ target, label = 'Share setup' }: { target?: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(t)
  }, [copied])

  const copy = async () => {
    const url = new URL(window.location.href)
    url.hash = target ?? ''
    try {
      await navigator.clipboard.writeText(url.toString())
      setCopied(true)
    } catch {
      window.prompt('Copy this link:', url.toString())
    }
  }

  return (
    <Button size="sm" variant="ghost" onClick={copy} title="Copy a link that opens this simulation with the same settings" aria-live="polite">
      <Icon name={copied ? 'check' : 'link'} className="size-3.5" />
      {copied ? 'Link copied' : label}
    </Button>
  )
}
