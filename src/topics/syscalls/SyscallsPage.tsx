import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { SimControls } from '../../components/SimControls'
import { Term } from '../../components/Term'
import { TopicLayout } from '../../components/TopicLayout'
import { Button, Callout, Card, Segmented } from '../../components/ui'
import { cx } from '../../lib/utils'
import { layers, syscallSteps, type SyscallName } from '../../engines/syscalls'
import { Challenges } from '../../components/Challenges'
import { challenges } from '../../data/challenges'
import { useSimulation } from '../../hooks/useSimulation'
import { syscallsQuiz } from './quiz'

export default function SyscallsPage() {
  return (
    <TopicLayout
      topicId="syscalls"
      questions={syscallsQuiz}
      intro={
        <>
          User programs run in a restricted CPU mode. To do anything involving hardware or other processes, like reading a
          file, they must ask the kernel through a <Term k="syscall">system call</Term>. A{' '}
          <Term k="trap">trap</Term> instruction switches the CPU into <Term k="kernelmode">kernel mode</Term>, runs the
          kernel's handler, then returns.
        </>
      }
      keyIdeas={[
        <>
          <strong>Mode bit:</strong> the CPU knows whether it is running user or kernel code and refuses privileged
          instructions in user mode.
        </>,
        <>
          <strong>One controlled door:</strong> the trap always enters at the same kernel entry point, which dispatches
          by system call number.
        </>,
        <>
          <strong>Not free:</strong> each call costs two mode switches, and slow devices make the process block.
        </>,
      ]}
    >
      <SyscallWalkthrough />
      <PrivilegeDemo />
    </TopicLayout>
  )
}

function SyscallWalkthrough() {
  const [name, setName] = useState<SyscallName>('read')
  const steps = useMemo(() => syscallSteps(name), [name])
  const sim = useSimulation({ initial: () => 0, step: (i) => i + 1, isDone: (i) => i >= steps.length - 1 })
  const { reset } = sim
  useEffect(() => reset(0), [steps, reset])
  const i = Math.min(sim.state, steps.length - 1)
  const step = steps[i]

  return (
    <Card
      title="Follow a system call"
      subtitle="Step through and watch the call travel down through the layers, across the user/kernel boundary, and back."
      actions={
        <Segmented
          label="System call"
          value={name}
          onChange={setName}
          options={[
            { value: 'read', label: 'read()' },
            { value: 'write', label: 'write()' },
            { value: 'getpid', label: 'getpid()' },
          ]}
        />
      }
    >
      <SimControls sim={sim} label={`step ${i + 1}/${steps.length}`} />

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
                  {space === 'user' ? 'User space (ring 3)' : space === 'kernel' ? 'Kernel space (ring 0)' : 'Hardware'}
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
                        {l.label}
                        {active && (
                          <motion.div
                            layoutId="syscall-token"
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            className="rounded-full bg-rose-500 px-2.5 py-0.5 font-mono text-xs text-white shadow"
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
                  privilege boundary
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid content-start gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className={cx('rounded-xl border-2 p-3 text-center transition-colors', step.mode === 'kernel' ? 'border-rose-500 bg-rose-500/10' : 'border-sky-500 bg-sky-500/10')}>
              <div className="text-xs uppercase tracking-wide text-muted">CPU mode</div>
              <div className="text-lg font-bold">{step.mode === 'kernel' ? 'KERNEL' : 'USER'}</div>
              <div className="font-mono text-xs text-muted">mode bit = {step.mode === 'kernel' ? 0 : 1}</div>
            </div>
            <div className={cx('rounded-xl border-2 p-3 text-center transition-colors', step.processState === 'waiting' ? 'border-amber-500 bg-amber-500/10' : 'border-emerald-500 bg-emerald-500/10')}>
              <div className="text-xs uppercase tracking-wide text-muted">Process state</div>
              <div className="text-lg font-bold">{step.processState === 'waiting' ? 'WAITING' : 'RUNNING'}</div>
              <div className="text-xs text-muted">{step.processState === 'waiting' ? 'other processes run' : 'on the CPU'}</div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={`${name}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-xl border border-line bg-surface-2 p-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-rose-500">Step {i + 1}</div>
              <div className="mb-1 font-semibold">{step.title}</div>
              <p className="text-sm text-muted">{step.detail}</p>
            </motion.div>
          </AnimatePresence>

          <div className="rounded-xl border border-line bg-surface-2 p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Registers</div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-sm">
              {Object.entries(step.registers).map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted">{k}</dt>
                  <dd>
                    <motion.span key={v} initial={{ backgroundColor: 'rgba(244,63,94,0.35)' }} animate={{ backgroundColor: 'rgba(244,63,94,0)' }} transition={{ duration: 1 }} className="rounded px-1">
                      {v}
                    </motion.span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <Challenges
            items={challenges.syscalls.filter((c) => c.id !== 'ch-sys-break')}
            met={{ 'ch-sys-read': name === 'read' && i === steps.length - 1, 'ch-sys-block': step.processState === 'waiting' }}
          />
        </div>
      </div>
    </Card>
  )
}

function PrivilegeDemo() {
  const [attempt, setAttempt] = useState<'none' | 'cli' | 'kernel' | 'syscall'>('none')
  return (
    <Card title="Try to break the rules" subtitle="What happens when user-mode code tries to do privileged things directly?">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={() => setAttempt('cli')}>Execute "cli" (disable interrupts)</Button>
        <Button onClick={() => setAttempt('kernel')}>Read kernel memory directly</Button>
        <Button variant="primary" onClick={() => setAttempt('syscall')}>
          Ask politely with a system call
        </Button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={attempt} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {attempt === 'none' && <Callout>Pick an action above.</Callout>}
          {attempt === 'cli' && (
            <Callout tone="bad">
              <strong>General protection fault.</strong> cli is privileged. The CPU refuses in user mode and traps to the
              kernel, which kills the process with SIGSEGV. If user code could disable interrupts, it could freeze the whole
              machine.
            </Callout>
          )}
          {attempt === 'kernel' && (
            <Callout tone="bad">
              <strong>Page fault: protection violation.</strong> Kernel pages are marked supervisor-only in the page table. The
              MMU blocks the access and the process receives SIGSEGV. This keeps programs from reading other processes' data
              or passwords.
            </Callout>
          )}
          {attempt === 'syscall' && (
            <Callout tone="good">
              <strong>Allowed.</strong> The syscall instruction enters the kernel at its official entry point. The kernel checks
              your permissions and arguments and performs the operation on your behalf. Safe, controlled and auditable.
            </Callout>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="mt-4">
        <Challenges items={challenges.syscalls.filter((c) => c.id === 'ch-sys-break')} met={{ 'ch-sys-break': attempt === 'cli' || attempt === 'kernel' }} />
      </div>
    </Card>
  )
}
