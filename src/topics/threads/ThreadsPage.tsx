import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type CSSProperties } from 'react'
import { SimControls } from '../../components/SimControls'
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
import { useChallenges } from '../../data/challenges'
import { useQuiz } from '../../data/quizzes'
import { useText } from '../../i18n'
import { useSimulation } from '../../hooks/useSimulation'
import { codecs, useUrlState } from '../../hooks/useUrlState'
import { threadsText } from './pageText'

const threadColor = (id: number) => jobColors[(id + 3) % jobColors.length]

export default function ThreadsPage() {
  const t = useText(threadsText)
  const questions = useQuiz('threads')
  return (
    <TopicLayout topicId="threads" questions={questions} intro={t.intro} keyIdeas={t.keyIdeas}>
      <AddressSpace />
      <RaceLab />
    </TopicLayout>
  )
}

const segmentHeights = ['h-14', 'h-14', 'h-20', 'h-12']

function AddressSpace() {
  const t = useText(threadsText)
  const [count, setCount] = useState(3)
  return (
    <Card
      title={t.spaceTitle}
      subtitle={t.spaceSubtitle}
      actions={
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCount((c) => Math.max(1, c - 1))} disabled={count <= 1} aria-label={t.removeThread}>
            -
          </Button>
          <span className="font-mono text-sm">{t.threadCount(count)}</span>
          <Button size="sm" onClick={() => setCount((c) => Math.min(5, c + 1))} disabled={count >= 5} aria-label={t.addThread}>
            +
          </Button>
        </div>
      }
    >
      <div className="rounded-2xl border-2 border-pink-500/40 p-3 sm:p-4">
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-300">{t.addressSpace}</div>
        <div className="grid gap-4 md:grid-cols-[1fr_1.6fr]">
          <div className="grid content-start gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t.sharedBy}</div>
            {t.segments.map(([name, desc], i) => (
              <div key={i} className={cx('flex flex-col justify-center rounded-xl border border-line bg-surface-2 px-3', segmentHeights[i])}>
                <div className="text-sm font-semibold">{name}</div>
                <div className="text-xs text-muted">{desc}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t.privateTo}</div>
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
                      {t.thread(i)}
                    </div>
                    <div className="mb-1 rounded-md bg-surface-2 px-2 py-1 font-mono text-[11px]" dir="ltr">
                      PC 0x{(0x4000 + i * 0x30).toString(16)}
                      <br />
                      SP 0x{(0x7ff0 - i * 0x1000).toString(16)}
                    </div>
                    <div className="grid gap-0.5" dir="ltr">
                      {['main()', 'work()', 'add()'].slice(0, 1 + (i % 3)).map((f) => (
                        <div key={f} className="rounded bg-surface-2 px-2 py-0.5 font-mono text-[11px]">
                          {f}
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-wide text-muted">{t.stackRegs}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <p className="mt-3 text-sm text-muted">{t.sameCounter(<code className="font-mono">counter</code>)}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function RaceLab() {
  const t = useText(threadsText)
  const challenges = useChallenges('threads')
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
  const lastThread = s.last && (
    <span className="font-semibold" style={{ color: threadColor(s.last.thread) }}>
      {t.thread(s.last.thread)}
    </span>
  )

  return (
    <Card id="race-lab" share title={t.labTitle} subtitle={t.labSubtitle}>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">{t.mutex}</span>
          <Segmented
            label={t.mutex}
            value={mutex}
            onChange={setMutex}
            options={[
              { value: 'off', label: t.off },
              { value: 'on', label: t.on },
            ]}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">{t.threads}</span>
          <input type="range" min={2} max={4} value={threads} onChange={(e) => setThreads(Number(e.target.value))} />
          <span className="font-mono">{threads}</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">{t.incrementsEach}</span>
          <input type="range" min={1} max={5} value={iterations} onChange={(e) => setIterations(Number(e.target.value))} />
          <span className="font-mono">{iterations}</span>
        </label>
        <Button size="sm" onClick={() => setSeed(Math.floor(Math.random() * 1e6))}>
          {t.newSeed}
        </Button>
      </div>

      <SimControls sim={sim} label={t.executed(s.steps)} onReset={() => reset(fresh())} />

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
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t.sharedCounter}</div>
            <div className="font-mono text-5xl font-bold">{s.counter}</div>
            <div className="mt-1 text-xs text-muted">{t.completed(completed, exp)}</div>
          </motion.div>
          {s.useMutex && (
            <div className={cx('rounded-xl border-2 p-3 text-center text-sm', s.lockHolder === null ? 'border-emerald-500/50' : 'border-amber-500')}>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t.mutexName}</div>
              <div className="font-semibold">{s.lockHolder === null ? t.unlocked : t.heldBy(s.lockHolder)}</div>
            </div>
          )}
          {s.last && (
            <div className="rounded-xl bg-surface-2 p-3 text-sm">
              {s.last.blocked ? t.lastBlocked(lastThread) : t.lastRan(lastThread, <code className="font-mono" dir="ltr">{opText[s.last.op]}</code>)}
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {s.threads.map((th) => {
            const runnable = isRunnable(s, th)
            const active = s.last?.thread === th.id
            return (
              <div
                key={th.id}
                className={cx('rounded-2xl border-2 bg-surface-2 p-3 transition-shadow', active && 'shadow-lg')}
                style={{ borderColor: active ? threadColor(th.id) : 'var(--line)' }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-bold" style={{ color: threadColor(th.id) }}>
                    {t.thread(th.id)}
                  </div>
                  <div className="text-xs text-muted">{th.done ? t.finished : th.blocked ? t.blocked : t.loop(th.iter + 1, s.iterations)}</div>
                </div>
                <ol className="mb-2 grid gap-0.5 font-mono text-xs" dir="ltr">
                  {prog.map((op, i) => {
                    const current = !th.done && th.pc === i
                    const critical = s.useMutex && i > 0 && i < prog.length - 1
                    return (
                      <li
                        key={op}
                        className={cx(
                          'flex items-center gap-2 rounded px-2 py-1',
                          current ? 'bg-surface font-bold text-ink ring-2' : 'text-muted',
                          critical && 'border-s-2 border-amber-500',
                        )}
                        style={current ? ({ '--tw-ring-color': threadColor(th.id) } as CSSProperties) : undefined}
                      >
                        <span className="w-3">{current ? '>' : ''}</span>
                        {opText[op]}
                      </li>
                    )
                  })}
                </ol>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs" dir="ltr">
                    reg = <strong>{th.reg}</strong>
                  </span>
                  <Button size="sm" disabled={!runnable || sim.playing} onClick={() => sim.push(stepThread(s, th.id))}>
                    {t.runNext}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        <Challenges
          items={challenges}
          met={{
            'ch-thr-lose2': done && !s.useMutex && exp - s.counter >= 2,
            'ch-thr-perfect': done && !s.useMutex && s.counter === exp && s.threads.length >= 2 && s.iterations >= 2,
            'ch-thr-mutex': done && s.useMutex && s.threads.length >= 3,
          }}
        />
        {done ? (
          s.counter === exp ? (
            <Callout tone="good">{s.useMutex ? t.goodMutex(s.counter, exp) : t.goodLucky(s.counter, exp)}</Callout>
          ) : (
            <Callout tone="bad">{t.bad(s.counter, exp, exp - s.counter)}</Callout>
          )
        ) : completed > s.counter ? (
          <Callout tone="warn">{t.warn(completed, s.counter, completed - s.counter)}</Callout>
        ) : (
          <Callout>{t.tip}</Callout>
        )}
      </div>
    </Card>
  )
}
