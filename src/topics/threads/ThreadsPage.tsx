import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type CSSProperties } from 'react'
import { SimControls } from '../../components/SimControls'
import { Term } from '../../components/Term'
import { TopicLayout } from '../../components/TopicLayout'
import { Button, Callout, Card, Segmented } from '../../components/ui'
import { cx } from '../../lib/utils'
import { jobColors } from '../../data/palette'
import {
  expected,
  initialRace,
  isRunnable,
  opText,
  program,
  raceDone,
  stepRandom,
  stepThread,
  type RaceState,
} from '../../engines/threads'
import { Challenges } from '../../components/Challenges'
import { challenges } from '../../data/challenges'
import { useSimulation } from '../../hooks/useSimulation'
import { codecs, useUrlState } from '../../hooks/useUrlState'
import { threadsQuiz } from './quiz'

const threadColor = (id: number) => jobColors[(id + 3) % jobColors.length]

export default function ThreadsPage() {
  return (
    <TopicLayout
      topicId="threads"
      questions={threadsQuiz}
      intro={
        <>
          A <Term k="thread">thread</Term> is a separate flow of execution inside a process. Threads share almost
          everything, which makes communication fast and cheap, but it also means two threads can modify the same data at
          the same time. Without synchronization this causes a <Term k="race">race condition</Term>.
        </>
      }
      keyIdeas={[
        <>
          <strong>Shared:</strong> code, global data, heap, open files. <strong>Private:</strong> stack, registers,
          program counter.
        </>,
        <>
          <strong>counter++ is not atomic.</strong> It is three machine instructions, and the scheduler can switch threads
          between any two of them.
        </>,
        <>
          A <Term k="mutex">mutex</Term> turns the read-modify-write into a <Term k="critical">critical section</Term> that
          only one thread can be inside at a time.
        </>,
      ]}
    >
      <AddressSpace />
      <RaceLab />
    </TopicLayout>
  )
}

function AddressSpace() {
  const [count, setCount] = useState(3)
  const shared = [
    { name: 'Code (text)', desc: 'The program instructions', h: 'h-14' },
    { name: 'Data (globals)', desc: 'int counter; static variables', h: 'h-14' },
    { name: 'Heap', desc: 'malloc() / new: grows upward', h: 'h-20' },
    { name: 'Open files', desc: 'fd 0, 1, 2, sockets', h: 'h-12' },
  ]
  return (
    <Card
      title="One process, many threads"
      subtitle="Add threads and see what they share and what each one owns."
      actions={
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCount((c) => Math.max(1, c - 1))} disabled={count <= 1} aria-label="Remove thread">
            -
          </Button>
          <span className="font-mono text-sm">{count} threads</span>
          <Button size="sm" onClick={() => setCount((c) => Math.min(5, c + 1))} disabled={count >= 5} aria-label="Add thread">
            +
          </Button>
        </div>
      }
    >
      <div className="rounded-2xl border-2 border-pink-500/40 p-3 sm:p-4">
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-300">Process address space</div>
        <div className="grid gap-4 md:grid-cols-[1fr_1.6fr]">
          <div className="grid content-start gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Shared by all threads</div>
            {shared.map((s) => (
              <div key={s.name} className={cx('flex flex-col justify-center rounded-xl border border-line bg-surface-2 px-3', s.h)}>
                <div className="text-sm font-semibold">{s.name}</div>
                <div className="text-xs text-muted">{s.desc}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Private to each thread</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              <AnimatePresence>
                {Array.from({ length: count }, (_, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="rounded-xl border-2 p-2"
                    style={{ borderColor: threadColor(i) }}
                  >
                    <div className="mb-1 text-sm font-bold" style={{ color: threadColor(i) }}>
                      Thread {i}
                    </div>
                    <div className="mb-1 rounded-md bg-surface-2 px-2 py-1 font-mono text-[11px]">
                      PC 0x{(0x4000 + i * 0x30).toString(16)}
                      <br />
                      SP 0x{(0x7ff0 - i * 0x1000).toString(16)}
                    </div>
                    <div className="grid gap-0.5">
                      {['main()', 'work()', 'add()'].slice(0, 1 + (i % 3)).map((f) => (
                        <div key={f} className="rounded bg-surface-2 px-2 py-0.5 font-mono text-[11px]">
                          {f}
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-wide text-muted">stack + registers</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <p className="mt-3 text-sm text-muted">
              Every thread sees the same <code className="font-mono">counter</code> in the data segment. That is
              convenient, and it is exactly what makes the experiment below go wrong.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function RaceLab() {
  const [threads, setThreads] = useUrlState('threads', 2, codecs.int(2, 4))
  const [iterations, setIterations] = useUrlState('increments', 3, codecs.int(1, 5))
  const [mutex, setMutex] = useUrlState<'off' | 'on'>('mutex', 'off', codecs.oneOf(['off', 'on']))
  const [seed, setSeed] = useUrlState('seed', 7, codecs.int(0, 1e6))
  const fresh = () => initialRace(threads, iterations, mutex === 'on', seed)

  const sim = useSimulation<RaceState>({
    initial: fresh,
    step: stepRandom,
    isDone: raceDone,
  })
  const { reset } = sim
  useEffect(() => reset(initialRace(threads, iterations, mutex === 'on', seed)), [threads, iterations, mutex, seed, reset])

  const s = sim.state
  const done = raceDone(s)
  const exp = expected(s)
  const completed = s.threads.reduce((a, t) => a + t.iter, 0)
  const prog = program(s.useMutex)
  const lastOp = s.last?.op

  return (
    <Card
      id="race-lab"
      share
      title="Race condition lab"
      subtitle="Each thread runs counter++ several times. Let the scheduler interleave randomly, or play scheduler yourself by clicking a thread's Run button."
    >
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Mutex</span>
          <Segmented
            label="Mutex"
            value={mutex}
            onChange={setMutex}
            options={[
              { value: 'off', label: 'Off' },
              { value: 'on', label: 'On' },
            ]}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Threads</span>
          <input type="range" min={2} max={4} value={threads} onChange={(e) => setThreads(Number(e.target.value))} />
          <span className="font-mono">{threads}</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Increments each</span>
          <input type="range" min={1} max={5} value={iterations} onChange={(e) => setIterations(Number(e.target.value))} />
          <span className="font-mono">{iterations}</span>
        </label>
        <Button size="sm" onClick={() => setSeed(Math.floor(Math.random() * 1e6))}>
          New random interleaving
        </Button>
      </div>

      <SimControls sim={sim} label={`instructions executed: ${s.steps}`} onReset={() => reset(fresh())} />

      <div className="mt-5 grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="grid content-start gap-3">
          <motion.div
            key={`${s.counter}-${s.steps}`}
            animate={lastOp === 'STORE' || lastOp === 'LOAD' ? { scale: [1, 1.06, 1] } : {}}
            className={cx(
              'rounded-2xl border-2 p-4 text-center',
              lastOp === 'STORE' ? 'border-pink-500' : lastOp === 'LOAD' ? 'border-sky-500' : 'border-line',
            )}
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">shared counter</div>
            <div className="font-mono text-5xl font-bold">{s.counter}</div>
            <div className="mt-1 text-xs text-muted">
              increments completed: {completed} / {exp}
            </div>
          </motion.div>
          {s.useMutex && (
            <div className={cx('rounded-xl border-2 p-3 text-center text-sm', s.lockHolder === null ? 'border-emerald-500/50' : 'border-amber-500')}>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">mutex m</div>
              <div className="font-semibold">{s.lockHolder === null ? 'unlocked' : `held by Thread ${s.lockHolder}`}</div>
            </div>
          )}
          {s.last && (
            <div className="rounded-xl bg-surface-2 p-3 text-sm">
              <span className="font-semibold" style={{ color: threadColor(s.last.thread) }}>
                Thread {s.last.thread}
              </span>{' '}
              {s.last.blocked ? 'tried to lock the mutex and blocked.' : <>ran <code className="font-mono">{opText[s.last.op]}</code></>}
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {s.threads.map((t) => {
            const runnable = isRunnable(s, t)
            const active = s.last?.thread === t.id
            return (
              <div
                key={t.id}
                className={cx('rounded-2xl border-2 bg-surface-2 p-3 transition-shadow', active && 'shadow-lg')}
                style={{ borderColor: active ? threadColor(t.id) : 'var(--line)' }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-bold" style={{ color: threadColor(t.id) }}>
                    Thread {t.id}
                  </div>
                  <div className="text-xs text-muted">
                    {t.done ? 'finished' : t.blocked ? 'blocked on mutex' : `loop ${t.iter + 1} of ${s.iterations}`}
                  </div>
                </div>
                <ol className="mb-2 grid gap-0.5 font-mono text-xs">
                  {prog.map((op, i) => {
                    const current = !t.done && t.pc === i
                    const critical = s.useMutex && i > 0 && i < prog.length - 1
                    return (
                      <li
                        key={op}
                        className={cx(
                          'flex items-center gap-2 rounded px-2 py-1',
                          current ? 'bg-surface font-bold text-ink ring-2' : 'text-muted',
                          critical && 'border-l-2 border-amber-500',
                        )}
                        style={current ? ({ '--tw-ring-color': threadColor(t.id) } as CSSProperties) : undefined}
                      >
                        <span className="w-3">{current ? '>' : ''}</span>
                        {opText[op]}
                      </li>
                    )
                  })}
                </ol>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">
                    reg = <strong>{t.reg}</strong>
                  </span>
                  <Button size="sm" disabled={!runnable || sim.playing} onClick={() => sim.push(stepThread(s, t.id))}>
                    Run next instruction
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        <Challenges
          items={challenges.threads}
          met={{
            'ch-thr-lose2': done && !s.useMutex && exp - s.counter >= 2,
            'ch-thr-perfect': done && !s.useMutex && s.counter === exp && s.threads.length >= 2 && s.iterations >= 2,
            'ch-thr-mutex': done && s.useMutex && s.threads.length >= 3,
          }}
        />
        {done ? (
          s.counter === exp ? (
            <Callout tone="good">
              Final value {s.counter} = {exp}. {s.useMutex ? 'The mutex guaranteed no update was lost.' : 'Lucky interleaving! Try another one: without a lock the result is not guaranteed.'}
            </Callout>
          ) : (
            <Callout tone="bad">
              Final value {s.counter}, but {exp} increments were executed: {exp - s.counter} update(s) were lost because two
              threads read the same old value before either wrote it back. Turn the mutex on and run again.
            </Callout>
          )
        ) : completed > s.counter ? (
          <Callout tone="warn">
            {completed} increments have finished, but the counter only says {s.counter}. {completed - s.counter} update(s) have
            already been lost: a thread overwrote the counter with a stale value.
          </Callout>
        ) : (
          <Callout>
            Tip: with the mutex off, click Thread 0 "Run" once (LOAD), then Thread 1 "Run" once (LOAD). Both now hold the same
            value in reg, and one increment is doomed.
          </Callout>
        )}
      </div>
    </Card>
  )
}
