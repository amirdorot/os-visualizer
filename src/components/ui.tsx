import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../lib/utils'
import { ShareButton } from './ShareButton'

export function Card({
  id,
  share,
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  /** Anchor id; with `share`, a Share button links straight to this card. */
  id?: string
  share?: boolean
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cx('scroll-mt-20 rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5', className)}>
      {(title || actions || share) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-base font-semibold">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          {(actions || share) && (
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              {share && <ShareButton target={id} />}
            </div>
          )}
        </header>
      )}
      {children}
    </section>
  )
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' }) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm',
        variant === 'primary' && 'bg-indigo-600 text-white hover:bg-indigo-500',
        variant === 'secondary' && 'border border-line bg-surface-2 hover:border-indigo-400',
        variant === 'ghost' && 'hover:bg-surface-2',
        variant === 'danger' && 'bg-rose-600 text-white hover:bg-rose-500',
        className,
      )}
      {...props}
    />
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap rounded-lg border border-line bg-surface-2 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === o.value ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 px-3 py-2" title={hint}>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 font-mono text-lg font-semibold">{value}</div>
    </div>
  )
}

export function Callout({ tone = 'info', children }: { tone?: 'info' | 'good' | 'bad' | 'warn'; children: ReactNode }) {
  return (
    <div
      role="status"
      className={cx(
        'rounded-xl border px-3 py-2 text-sm',
        tone === 'info' && 'border-indigo-500/30 bg-indigo-500/10',
        tone === 'good' && 'border-emerald-500/30 bg-emerald-500/10',
        tone === 'bad' && 'border-rose-500/30 bg-rose-500/10',
        tone === 'warn' && 'border-amber-500/30 bg-amber-500/10',
      )}
    >
      {children}
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  )
}