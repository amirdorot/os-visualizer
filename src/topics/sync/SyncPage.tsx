import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Challenges } from '../../components/Challenges'
import { SimControls } from '../../components/SimControls'
import { Term } from '../../components/Term'
import { TopicLayout } from '../../components/TopicLayout'
import { Button, Callout, Card, Segmented } from '../../components/ui'
import { challenges } from '../../data/challenges'
import { jobColors } from '../../data/palette'
import { currentOp, initialSync, isBlocked, opLabel, program, stepActor, stepRandomSync, type SemName, type SyncState } from '../../engines/sync'
import { useSimulation } from '../../hooks/useSimulation'
import { codecs, useUrlState } from '../../hooks/useUrlState'
import { cx } from '../../lib/utils'
import { syncQuiz } from './quiz'

const itemColor = (n: number) => (n < 0 ? '#71717a' : jobColors[n % jobColors.length])

export default function SyncPage() {
  return (
    <TopicLayout
      topicId="sync"
      questions={syncQuiz}
      intro={
        <>
          A mutex lets one thread in at a time. Many problems need more: a producer must <em>wait</em> until there is room,
          and a consumer must wait until there is something to take. A <Term k="semaphore">semaphore</Term> is a counter
          that threads can sleep on, and it solves both. The classic exercise is the{' '}
          <Term k="boundedbuffer">bounded buffer</Term>.
        </>
      }
      keyIdeas={[
        <>
          <strong>wait(s)</strong>: if s &gt; 0, decrement and continue; otherwise sleep until someone signals.{' '}
          <strong>signal(s)</strong>: increment, or wake one sleeping thread.
        </>,
        <>
          <strong>empty</strong> counts free slots and <strong>full</strong> counts filled ones. They make threads wait for
          a condition, instead of <Term k="busywait">busy waiting</Term>.
        </>,
        <>
          <strong>mutex</strong> (a semaphore starting at 1) keeps two threads from editing the buffer's head and tail at the
          same moment.
        </>,
      ]}
    >
      <SemaphorePlayground />
      <BufferLab />
    </TopicLayout>
  )
}

function SemaphorePlayground() {
  const [value, setValue] = useState(2)
  const [queue, setQueue] = useState<number[]>([])
  const [nextThread, setNextThread] = useState(1)
  const [log, setLog] = useState<string>('Click wait() or signal() to see what happens to the counter and the queue.')

  const wait = () => {
    const t = nextThread
    setNextThread(t + 1)
    if (value > 0) {
      setValue(value - 1)
      setLog(`T${t} called wait(): value was ${value}, now ${value - 1}. T${t} continues.`)
    } else {
      setQueue([...queue, t])
      setLog(`T${t} called wait(): value is 0, so T${t} goes to sleep in the queue.`)
    }
  }
  const signal = () => {
    if (queue.length > 0) {
      setLog(`signal(): T${queue[0]} was waiting, so it wakes up and continues. The value stays ${value}.`)
      setQueue(queue.slice(1))
    } else {
      setValue(value + 1)
      setLog(`signal(): nobody is waiting, so the value goes from ${value} to ${value + 1}.`)
    }
  }
  const reset = (v: number) => {
    setValue(v)
    setQueue([])
    setNextThread(1)
    setLog('Click wait() or signal() to see what happens to the counter and the queue.')
  }

  return (
    <Card
      title="Semaphore playground"
      subtitle="A semaphore is a counter plus a queue of sleeping threads. Each wait() comes from a new thread."
      actions={
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Start at</span>
          <select value="" onChange={(e) => reset(Number(e.target.value))} className="rounded-md border border-line bg-surface-2 px-1.5 py-1" aria-label="Initial value">
            <option value="" disabled>
              choose
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
              <div className="text-xs uppercase tracking-wide text-muted">value</div>
              <div className="font-mono text-4xl font-bold">{value}</div>
            </div>
          </motion.div>
          <div className="grid gap-2">
            <Button variant="primary" onClick={wait}>
              wait()
            </Button>
            <Button onClick={signal}>signal()</Button>
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Sleeping threads (wait queue)</div>
          <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-dashed border-line p-2">
            <AnimatePresence>
              {queue.map((t) => (
                <motion.span
                  key={t}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="rounded-lg bg-surface-2 px-2.5 py-1 font-mono text-sm"
                >
                  T{t}
                </motion.span>
              ))}
            </AnimatePresence>
            {queue.length === 0 && <span className="text-sm text-muted">empty</span>}
          </div>
          <p className="mt-2 text-sm" aria-live="polite">
            {log}
          </p>
        </div>
      </div>
    </Card>
  )
}

const semInfo: Record<SemName, string> = {
  empty: 'free slots',
  full: 'filled slots',
  mutex: '1 = buffer unlocked',
}

function BufferLab() {
  const [mode, setMode] = useUrlState<'safe' | 'unsafe'>('version', 'safe', codecs.oneOf(['safe', 'unsafe']))
  const [capacity, setCapacity] = useUrlState('slots', 3, codecs.int(2, 6))
  const [producers, setProducers] = useUrlState('producers', 1, codecs.int(1, 2))
  const [consumers, setConsumers] = useUrlState('consumers', 1, codecs.int(1, 2))
  const [seed, setSeed] = useUrlState('seed', 11, codecs.int(0, 1e6))
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
    return `${a.role === 'producer' ? 'Producer' : 'Consumer'} ${idx}`
  }

  return (
    <Card
      id="buffer-lab"
      share
      title="Bounded buffer lab"
      subtitle="Producers put items into a shared buffer and consumers take them out. Press Play for a random schedule, or run each thread yourself."
    >
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Segmented
          label="Version"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'safe', label: 'With semaphores' },
            { value: 'unsafe', label: 'No semaphores' },
          ]}
        />
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Slots</span>
          <input type="range" min={2} max={6} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
          <span className="font-mono">{capacity}</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Producers</span>
          <input type="range" min={1} max={2} value={producers} onChange={(e) => setProducers(Number(e.target.value))} />
          <span className="font-mono">{producers}</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Consumers</span>
          <input type="range" min={1} max={2} value={consumers} onChange={(e) => setConsumers(Number(e.target.value))} />
          <span className="font-mono">{consumers}</span>
        </label>
        <Button size="sm" onClick={() => setSeed(Math.floor(Math.random() * 1e6))}>
          New random schedule
        </Button>
      </div>

      <SimControls sim={sim} label={`produced ${s.produced}, consumed ${s.consumed}`} onReset={() => reset(fresh())} />

      <div className="mt-5 grid gap-4">
        <div className="rounded-2xl border border-line bg-surface-2 p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted">
            <span>Shared buffer</span>
            <span>
              {s.buffer.length} / {s.capacity} used
            </span>
          </div>
          <div className="flex flex-wrap gap-2" aria-label={`Buffer contains ${s.buffer.length} items`}>
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
                  <div className="text-[11px] text-muted">{semInfo[k]}</div>
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
                    {blocked && op.kind === 'wait' ? `sleeping on ${op.sem}` : a.item !== null ? `holding ${a.item < 0 ? 'garbage' : `#${a.item}`}` : 'ready'}
                  </span>
                </div>
                <ol className="mb-2 grid gap-0.5 font-mono text-xs">
                  {program(s, a).map((o, i) => (
                    <li key={i} className={cx('flex gap-2 rounded px-2 py-1', a.pc === i ? 'bg-surface font-bold text-ink ring-2 ring-cyan-500' : 'text-muted')}>
                      <span className="w-3">{a.pc === i ? '>' : ''}</span>
                      {opLabel(o)}
                    </li>
                  ))}
                </ol>
                <div className="text-right">
                  <Button size="sm" disabled={sim.playing} onClick={() => sim.push(stepActor(s, a.id))}>
                    {blocked ? 'Try to run (will block)' : 'Run next instruction'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {last && (
          <div className="rounded-xl bg-surface-2 p-3 text-sm" aria-live="polite">
            <strong>{name(last.actor)}</strong>{' '}
            {last.blocked && (last.op.kind === 'wait' || last.op.kind === 'signal') ? (
              <>
                tried <code className="font-mono">{opLabel(last.op)}</code> but {last.op.sem} is 0, so it sleeps.{' '}
                {last.op.sem === 'empty' ? 'The buffer is full; it must wait for a consumer.' : last.op.sem === 'full' ? 'The buffer is empty; it must wait for a producer.' : 'Another thread is inside the buffer.'}
              </>
            ) : (
              <>
                ran <code className="font-mono">{opLabel(last.op)}</code>.
              </>
            )}
          </div>
        )}

        {last?.error === 'overflow' && (
          <Callout tone="bad">
            Overflow! The producer wrote into a full buffer and overwrote an item nobody had consumed yet. With semaphores,
            wait(empty) would have put it to sleep instead.
          </Callout>
        )}
        {last?.error === 'underflow' && (
          <Callout tone="bad">
            Underflow! The consumer took from an empty buffer and got garbage. With semaphores, wait(full) would have put it
            to sleep instead.
          </Callout>
        )}
        {!s.safe && s.stats.overflows + s.stats.underflows > 0 && !last?.error && (
          <Callout tone="warn">
            So far: {s.stats.overflows} overflow(s) and {s.stats.underflows} underflow(s). Nothing stops a thread from running
            at the wrong moment.
          </Callout>
        )}

        <Challenges
          items={challenges.sync}
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
