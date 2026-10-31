import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { Button } from './ui'
import { useUi } from '../i18n/ui'

/** Copies a link to the current page, including the lab's settings in the query string, scrolled to `target`. */
export function ShareButton({ target, label }: { target?: string; label?: string }) {
  const t = useUi().share
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    const url = new URL(window.location.href)
    url.hash = target ?? ''
    url.searchParams.delete('lang')
    try {
      await navigator.clipboard.writeText(url.toString())
      setCopied(true)
    } catch {
      window.prompt(t.prompt, url.toString())
    }
  }

  return (
    <Button size="sm" variant="ghost" onClick={copy} title={t.hint} aria-live="polite">
      <Icon name={copied ? 'check' : 'link'} className="size-3.5" />
      {copied ? t.copied : label ?? t.setup}
    </Button>
  )
}
