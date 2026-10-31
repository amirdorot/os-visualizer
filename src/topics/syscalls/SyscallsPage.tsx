import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { SimControls } from '../../components/SimControls'
import { TopicLayout } from '../../components/TopicLayout'
import { Button, Callout, Card, Segmented } from '../../components/ui'
import { cx } from '../../lib/utils'
import { layers, syscallSteps, type RegValue, type RetValue, type SyscallName } from '../../engines/syscalls'
import { Challenges } from '../../components/Challenges'
import { useChallenges } from '../../data/challenges'
import { useQuiz } from '../../data/quizzes'
import { useSimulation } from '../../hooks/useSimulation'
import { codecs, useUrlState } from '../../hooks/useUrlState'
import { useBidi, useText } from '../../i18n'
import { syscallsText } from './pageText'

export default function SyscallsPage() {
  const t = useText(syscallsText)
  const questions = useQuiz('syscalls')
  return (
    <TopicLayout topicId="syscalls" questions={questions} intro={t.intro} keyIdeas={t.keyIdeas}>
      <SyscallWalkthrough />
      <PrivilegeDemo />
    </TopicLayout>
  )
}

const isRetNote = (n: NonNullable<RegValue['note']>): n is RetValue['note'] => n === 'bytesRead' || n === 'bytesWritten' || n === 'pid'

function SyscallWalkthrough() {
  const t = useText(syscallsText)
  const fix = useBidi()
  const challenges = useChallenges('syscalls')
  const [name, setName] = useUrlState<SyscallName>('call', 'read', codecs.oneOf(['read', 'write', 'getpid']))
  const steps = useMemo(() => syscallSteps(name), [name])
  const sim = useSimulation({ initial: () => 0, step: (i) => i + 1, isDone: (i) => i >= steps.length - 1 })
  const { reset } = sim
  useEffect(() => reset(0), [steps, reset])
  const i = Math.min(sim.state, steps.length - 1)
  const step = steps[i]
  const [title, detail] = t.step(step.msg)
  const reg = (r: RegValue) => (r.note ? `${r.value} (${isRetNote(r.note) ? t.retNote[r.note] : r.note})` : r.value)

  return (
    <Card
      id="walkthrough"
      share
      title={t.walkTitle}
      subtitle={t.walkSubtitle}
      actions={
        <Segmented
          label={t.callLabel}
          value={name}
          onChange={setName}
          options={[
            { value: 'read', label: fix('read()') },
            { value: 'write', label: fix('write()') },
            { value: 'getpid', label: fix('getpid()') },
          ]}
        />
      }
    >
      <SimControls sim={sim} label={t.stepCounter(i + 1, steps.length)} />

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative">
          {(['user', 'kernel', 'hardware'] as const).map((space) => (
            <div
              key={space}
              className={cx(
                'relative mb-3 rounded-2xl border-2 p-3',
                space === 'user' && 'border-sky-500/40 bg-sky-500/5',
                space === 'kernel' && 'border-rose-500/40 bg-rose-500/5',
                space === 'hardware' && 'border-slate-500/40 bg-slate-500/5',
              )}
            >
              <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span className={cx(space === 'user' && 'text-sky-600 dark:text-sky-300', space === 'kernel' && 'text-rose-600 dark:text-rose-300', space === 'hardware' && 'text-muted')}>
                  {t.spaces[space]}
                </span>
              </div>
              <div className="grid gap-2">
                {layers
                  .filter((l) => l.space === space)
                  .map((l) => {
                    const active = step.layer === l.id
                    const visited = steps.slice(0, i + 1).some((s) => s.layer === l.id)
                    return (
                      <div
                        key={l.id}
                        className={cx(
                          'relative flex min-h-11 items-center justify-between rounded-xl border px-3 py-2 text-sm transition-colors',
                          active ? 'border-ink bg-surface font-semibold shadow-md' : visited ? 'border-line bg-surface' : 'border-line bg-surface-2 text-muted',
                        )}
                      >
                        {t.layers[l.id]}
                        {active && (
                          <motion.div
                            layoutId="syscall-token"
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            className="rounded-full bg-rose-500 px-2.5 py-0.5 font-mono text-xs text-white shadow"
                            dir="ltr"
                          >
                            {name}()
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
              </div>
              {space === 'user' && (
                <div className="absolute -bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-line bg-surface px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                  {t.boundary}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid content-start gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className={cx('rounded-xl border-2 p-3 text-center transition-colors', step.mode === 'kernel' ? 'border-rose-500 bg-rose-500/10' : 'border-sky-500 bg-sky-500/10')}>
              <div className="text-xs uppercase tracking-wide text-muted">{t.cpuMode}</div>
              <div className="text-lg font-bold">{step.mode === 'kernel' ? 'KERNEL' : 'USER'}</div>
              <div className="font-mono text-xs text-muted" dir="ltr">
                mode bit = {step.mode === 'kernel' ? 0 : 1}
              </div>
            </div>
            <div className={cx('rounded-xl border-2 p-3 text-center transition-colors', step.processState === 'waiting' ? 'border-amber-500 bg-amber-500/10' : 'border-emerald-500 bg-emerald-500/10')}>
              <div className="text-xs uppercase tracking-wide text-muted">{t.procState}</div>
              <div className="text-lg font-bold">{step.processState === 'waiting' ? 'WAITING' : 'RUNNING'}</div>
              <div className="text-xs text-muted">{step.processState === 'waiting' ? t.othersRun : t.onCpu}</div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={`${name}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-xl border border-line bg-surface-2 p-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-rose-500">{t.stepN(i + 1)}</div>
              <div className="mb-1 font-semibold">{title}</div>
              <p className="text-sm text-muted">{detail}</p>
            </motion.div>
          </AnimatePresence>

          <div className="rounded-xl border border-line bg-surface-2 p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t.registers}</div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-sm" dir="ltr">
              {Object.entries(step.registers).map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted">{k}</dt>
                  <dd>
                    <motion.span key={reg(v)} initial={{ backgroundColor: 'rgba(244,63,94,0.35)' }} animate={{ backgroundColor: 'rgba(244,63,94,0)' }} transition={{ duration: 1 }} className="rounded px-1">
                      {reg(v)}
                    </motion.span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <Challenges
            items={challenges.filter((c) => c.id !== 'ch-sys-break')}
            met={{ 'ch-sys-read': name === 'read' && i === steps.length - 1, 'ch-sys-block': step.processState === 'waiting' }}
          />
        </div>
      </div>
    </Card>
  )
}

function PrivilegeDemo() {
  const t = useText(syscallsText)
  const challenges = useChallenges('syscalls')
  const [attempt, setAttempt] = useState<'none' | 'cli' | 'kernel' | 'syscall'>('none')
  return (
    <Card title={t.breakTitle} subtitle={t.breakSubtitle}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={() => setAttempt('cli')}>{t.tryCli}</Button>
        <Button onClick={() => setAttempt('kernel')}>{t.tryKernel}</Button>
        <Button variant="primary" onClick={() => setAttempt('syscall')}>
          {t.trySyscall}
        </Button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={attempt} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {attempt === 'none' && <Callout>{t.pickAction}</Callout>}
          {attempt !== 'none' && (
            <Callout tone={attempt === 'syscall' ? 'good' : 'bad'}>
              <strong>{t[attempt][0]}</strong> {t[attempt][1]}
            </Callout>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="mt-4">
        <Challenges items={challenges.filter((c) => c.id === 'ch-sys-break')} met={{ 'ch-sys-break': attempt === 'cli' || attempt === 'kernel' }} />
      </div>
    </Card>
  )
}
