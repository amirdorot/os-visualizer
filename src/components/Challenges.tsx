import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cx } from '../lib/utils'
import { useProgress } from '../store/progress'
import type { ChallengeMeta } from '../types'
import { Icon } from './Icon'

/**
 * Goals for a simulation. `met` maps challenge ids to whether the current simulation
 * state satisfies them; once met, a challenge stays completed.
 */
export function Challenges({ items, met }: { items: ChallengeMeta[]; met: Record<string, boolean> }) {
  const done = useProgress((s) => s.challenges)
  const complete = useProgress((s) => s.completeChallenge)
  const last = useProgress((s) => s.lastChallenge)
  const clearLast = useProgress((s) => s.clearLastChallenge)
  const [openHint, setOpenHint] = useState<string | null>(null)
  const justDone = last && items.some((c) => c.id === last) ? last : null

  useEffect(() => {
    for (const c of items) if (met[c.id] && !done[c.id]) complete(c.id)
  }, [items, met, done, complete])

  useEffect(() => {
    if (!justDone) return
    const t = window.setTimeout(clearLast, 3500)
    return () => window.clearTimeout(t)
  }, [justDone, clearLast])

  const count = items.filter((c) => done[c.id]).length

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="flag" className="size-4 text-indigo-500" />
          Challenges
        </div>
        <span className="font-mono text-xs text-muted">
          {count}/{items.length} done
        </span>
      </div>
      <ul className="grid gap-1.5">
        {items.map((c) => {
          const isDone = !!done[c.id]
          return (
            <li key={c.id} className={cx('rounded-xl border px-3 py-2 text-sm transition-colors', isDone ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-line bg-surface')}>
              <div className="flex items-start gap-2">
                <span
                  className={cx('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border', isDone ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-line')}
                  aria-hidden="true"
                >
                  {isDone && <Icon name="check" className="size-3" />}
                </span>
                <span className="flex-1">
                  <span className={cx(isDone && 'text-muted line-through decoration-emerald-500/60')}>{c.title}</span>
                  <span className="sr-only">{isDone ? ' (completed)' : ' (not completed)'}</span>
                  {openHint === c.id && <span className="mt-1 block text-xs text-muted">{c.hint}</span>}
                </span>
                {!isDone && (
                  <button
                    type="button"
                    onClick={() => setOpenHint(openHint === c.id ? null : c.id)}
                    className="shrink-0 text-xs text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-300"
                    aria-expanded={openHint === c.id}
                  >
                    {openHint === c.id ? 'Hide hint' : 'Hint'}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <AnimatePresence>
        {justDone && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
          >
            Challenge complete: {items.find((c) => c.id === justDone)?.title}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
