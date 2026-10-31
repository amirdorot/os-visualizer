import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Challenges } from '../../components/Challenges'
import { SimControls } from '../../components/SimControls'
import { TopicLayout } from '../../components/TopicLayout'
import { Button, Callout, Card, Segmented } from '../../components/ui'
import { useChallenges } from '../../data/challenges'
import { useQuiz } from '../../data/quizzes'
import { jobColors } from '../../data/palette'
import { currentOp, initialSync, isBlocked, opLabel, program, stepActor, stepRandomSync, type SemName, type SyncState } from '../../engines/sync'
import { useSimulation } from '../../hooks/useSimulation'
import { codecs, useUrlState } from '../../hooks/useUrlState'
import { useBidi, useText } from '../../i18n'
import { cx } from '../../lib/utils'
import { syncText, type PlayLog } from './pageText'

const itemColor = (n: number) => (n < 0 ? '#71717a' : jobColors[n % jobColors.length])

export default function SyncPage() {
  const t = useText(syncText)
  const questions = useQuiz('sync')
  return (
    <TopicLayout topicId="sync" questions={questions} intro={t.intro} keyIdeas={t.keyIdeas}>
      <SemaphorePlayground />
      <BufferLab />
    </TopicLayout>
  )
}

function SemaphorePlayground() {
  const [value, setValue] = useState(2)
  const [queue, setQueue] = useState<number[]>([])
  const [nextThread, setNextThread] = useState(1)
  const [log, setLog] = useState<PlayLog>({ k: 'hint' })
  const t = useText(syncText)
  const fix = useBidi()

  const wait = () => {
    const id = nextThread
    setNextThread(id + 1)
    if (value > 0) {
      setValue(value - 1)
      setLog({ k: 'waitOk', t: id, from: value })
    } else {
      setQueue([...queue, id])
      setLog({ k: 'waitSleep', t: id })
    }
  }
  const signal = () => {
    if (queue.length > 0) {
      setLog({ k: 'signalWake', t: queue[0], value })
      setQueue(queue.slice(1))
    } else {
      setValue(value + 1)
      setLog({ k: 'signalInc', from: value })
    }
  }
  const reset = (v: number) => {
    setValue(v)
    setQueue([])
    setNextThread(1)
    setLog({ k: 'hint' })
  }

  return (
    <Card
      title={t.playTitle}
      subtitle={t.playSubtitle}
      actions={
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">{t.startAt}</span>
          <select value="" onChange={(e) => reset(Number(e.target.value))} className="rounded-md border border-line bg-surface-2 px-1.5 py-1" aria-label={t.initialValue}>
            <option value="" disabled>
              {t.choose}
            </option>
            {[0, 1, 2, 3].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      }
    >
      <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-3">
          <motion.div
            key={value}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="grid size-24 place-items-center rounded-2xl border-2 border-cyan-500 text-center"
          >
            <div>
              <div className="text-xs uppercase tracking-wide text-muted">{t.value}</div>
              <div className="font-mono text-4xl font-bold">{value}</div>
            </div>
          </motion.div>
          <div className="grid gap-2">
            <Button variant="primary" onClick={wait}>
              {fix('wait()')}
            </Button>
            <Button onClick={signal}>{fix('signal()')}</Button>
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{t.sleeping}</div>
          <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-dashed border-line p-2">
            <AnimatePresence>
              {queue.map((id) => (
                <motion.span
                  key={id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="rounded-lg bg-surface-2 px-2.5 py-1 font-mono text-sm"
                >
                  T{id}
                </motion.span>
              ))}
            </AnimatePresence>
            {queue.length === 0 && <span className="text-sm text-muted">{t.empty}</span>}
          </div>
          <p className="mt-2 text-sm" aria-live="polite">
            {t.log(log)}
          </p>
        </div>
      </div>
    </Card>
  )
}

function BufferLab() {
  const [mode, setMode] = useUrlState<'safe' | 'unsafe'>('version', 'safe', codecs.oneOf(['safe', 'unsafe']))
  const [capacity, setCapacity] = useUrlState('slots', 3, codecs.int(2, 6))
  const [producers, setProducers] = useUrlState('producers', 1, codecs.int(1, 2))
  const [consumers, setConsumers] = useUrlState('consumers', 1, codecs.int(1, 2))
  const [seed, setSeed] = useUrlState('seed', 11, codecs.int(0, 1e6))
  const t = useText(syncText)
  const fix = useBidi()
  const challenges = useChallenges('sync')
  const fresh = () => initialSync({ safe: mode === 'safe', capacity, producers, consumers, seed })

  const sim = useSimulation<SyncState>({
    initial: fresh,
    step: stepRandomSync,
    isDone: (s) => s.steps >= 500 || s.actors.every((a) => isBlocked(s, a)),
  })
  const { reset } = sim
  useEffect(
    () => reset(initialSync({ safe: mode === 'safe', capacity, producers, consumers, seed })),
    [mode, capacity, producers, consumers, seed, reset],
  )

  const s = sim.state
  const last = s.last
  const name = (id: number) => {
    const a = s.actors.find((x) => x.id === id)!
    const idx = s.actors.filter((x) => x.role === a.role).indexOf(a) + 1
    return t.actor(a.role, idx)
  }

  return (
    <Card
      id="buffer-lab"
      share
      title={t.labTitle}
      subtitle={t.labSubtitle}
    >
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Segmented
          label={t.version}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'safe', label: t.safe },
            { value: 'unsafe', label: t.unsafe },
          ]}
        />
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">{t.slots}</span>
          <input type="range" min={2} max={6} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
          <span className="font-mono">{capacity}</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">{t.producers}</span>
          <input type="range" min={1} max={2} value={producers} onChange={(e) => setProducers(Number(e.target.value))} />
          <span className="font-mono">{producers}</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">{t.consumers}</span>
          <input type="range" min={1} max={2} value={consumers} onChange={(e) => setConsumers(Number(e.target.value))} />
          <span className="font-mono">{consumers}</span>
        </label>
        <Button size="sm" onClick={() => setSeed(Math.floor(Math.random() * 1e6))}>
          {t.newSchedule}
        </Button>
      </div>

      <SimControls sim={sim} label={t.progress(s.produced, s.consumed)} onReset={() => reset(fresh())} />

      <div className="mt-5 grid gap-4">
        <div className="rounded-2xl border border-line bg-surface-2 p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted">
            <span>{t.sharedBuffer}</span>
            <span>{t.used(s.buffer.length, s.capacity)}</span>
          </div>
          <div className="flex flex-wrap gap-2" dir="ltr" aria-label={t.bufferAria(s.buffer.length)}>
            {Array.from({ length: s.capacity }, (_, i) => {
              const item = s.buffer[i]
              return (
                <div key={i} className="grid size-14 place-items-center rounded-xl border-2 border-dashed border-line">
                  <AnimatePresence mode="popLayout">
                    {item !== undefined && (
                      <motion.div
                        key={item}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="grid size-11 place-items-center rounded-lg font-mono text-sm font-bold text-white"
                        style={{ background: itemColor(item) }}
                      >
                        #{item}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
          {s.safe && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(Object.keys(s.sems) as SemName[]).map((k) => (
                <div
                  key={k}
                  className={cx(
                    'rounded-xl border-2 px-3 py-2 text-center',
                    s.sems[k] === 0 ? 'border-amber-500' : 'border-cyan-500/50',
                    last && !last.blocked && (last.op.kind === 'wait' || last.op.kind === 'signal') && last.op.sem === k && 'ring-2 ring-cyan-400',
                  )}
                >
                  <div className="font-mono text-sm font-semibold">{k}</div>
                  <div className="font-mono text-2xl font-bold">{s.sems[k]}</div>
                  <div className="text-[11px] text-muted">{t.semInfo[k]}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {s.actors.map((a) => {
            const blocked = isBlocked(s, a)
            const active = last?.actor === a.id
            const color = a.role === 'producer' ? '#06b6d4' : '#8b5cf6'
            const op = currentOp(s, a)
            return (
              <div
                key={a.id}
                className={cx('rounded-2xl border-2 bg-surface-2 p-3', active && 'shadow-lg')}
                style={{ borderColor: active ? color : 'var(--line)' }}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-bold" style={{ color }}>
                    {name(a.id)}
                  </span>
                  <span className={cx('rounded-full px-2 py-0.5 text-xs', blocked ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'text-muted')}>
                    {blocked && op.kind === 'wait' ? t.sleepingOn(op.sem) : a.item !== null ? t.holding(a.item < 0 ? t.garbage : `#${a.item}`) : t.ready}
                  </span>
                </div>
                <ol className="mb-2 grid gap-0.5 font-mono text-xs" dir="ltr">
                  {program(s, a).map((o, i) => (
                    <li key={i} className={cx('flex gap-2 rounded px-2 py-1', a.pc === i ? 'bg-surface font-bold text-ink ring-2 ring-cyan-500' : 'text-muted')}>
                      <span className="w-3">{a.pc === i ? '>' : ''}</span>
                      {opLabel(o)}
                    </li>
                  ))}
                </ol>
                <div className="text-end">
                  <Button size="sm" disabled={sim.playing} onClick={() => sim.push(stepActor(s, a.id))}>
                    {blocked ? t.runBlocked : t.runNext}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {last && (
          <div className="rounded-xl bg-surface-2 p-3 text-sm" aria-live="polite">
            {last.blocked && (last.op.kind === 'wait' || last.op.kind === 'signal')
              ? t.lastBlocked(name(last.actor), <code className="font-mono">{fix(opLabel(last.op))}</code>, last.op.sem)
              : t.lastRan(name(last.actor), <code className="font-mono">{fix(opLabel(last.op))}</code>)}
          </div>
        )}

        {last?.error === 'overflow' && (
          <Callout tone="bad">{t.overflow}</Callout>
        )}
        {last?.error === 'underflow' && (
          <Callout tone="bad">{t.underflow}</Callout>
        )}
        {!s.safe && s.stats.overflows + s.stats.underflows > 0 && !last?.error && (
          <Callout tone="warn">{t.soFar(s.stats.overflows, s.stats.underflows)}</Callout>
        )}

        <Challenges
          items={challenges}
          met={{
            'ch-sync-full': s.stats.producerBlocks > 0,
            'ch-sync-empty': s.stats.consumerBlocks > 0,
            'ch-sync-bug': s.stats.overflows + s.stats.underflows > 0,
            'ch-sync-ten': s.safe && s.consumed >= 10,
          }}
        />
      </div>
    </Card>
  )
}
