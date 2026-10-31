import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SimControls } from '../../components/SimControls'
import { Term } from '../../components/Term'
import { TopicLayout } from '../../components/TopicLayout'
import { Button, Callout, Card, Segmented, Stat } from '../../components/ui'
import { cx, inputClass } from '../../lib/utils'
import { colorFor } from '../../data/palette'
import { simulate, type Job, type SchedAlgo, type Tick } from '../../engines/scheduler'
import { Challenges } from '../../components/Challenges'
import { challenges } from '../../data/challenges'
import { useSimulation } from '../../hooks/useSimulation'
import { codecs, useUrlState, type Codec } from '../../hooks/useUrlState'
import { schedulingQuiz } from './quiz'

interface WorkJob extends Job {
  name: string
}

const pool = [
  { name: 'Shell', burst: 1, priority: 1 },
  { name: 'Music player', burst: 2, priority: 1 },
  { name: 'Browser', burst: 5, priority: 2 },
  { name: 'Game', burst: 6, priority: 2 },
  { name: 'Compiler', burst: 8, priority: 3 },
  { name: 'Backup', burst: 10, priority: 4 },
]

const defaultJobs: WorkJob[] = [
  { id: 'P1', name: 'Compiler', arrival: 0, burst: 8, priority: 3 },
  { id: 'P2', name: 'Browser', arrival: 1, burst: 4, priority: 2 },
  { id: 'P3', name: 'Backup', arrival: 2, burst: 9, priority: 4 },
  { id: 'P4', name: 'Music player', arrival: 3, burst: 2, priority: 1 },
]

const algos: { value: SchedAlgo; label: string }[] = [
  { value: 'FCFS', label: 'FCFS' },
  { value: 'SJF', label: 'SJF' },
  { value: 'SRTF', label: 'SRTF' },
  { value: 'RR', label: 'Round Robin' },
  { value: 'PRIORITY', label: 'Priority' },
]

const algoInfo: Record<SchedAlgo, string> = {
  FCFS: 'First-Come, First-Served: run jobs in arrival order until each finishes. Simple, but short jobs get stuck behind long ones (the convoy effect).',
  SJF: 'Shortest Job First (non-preemptive): when the CPU frees up, pick the job with the smallest burst. Optimal average waiting time, but long jobs can starve.',
  SRTF: 'Shortest Remaining Time First: preemptive SJF. A newly arrived job with less remaining work kicks the current job off the CPU.',
  RR: 'Round Robin: every job gets a fixed time quantum, then goes to the back of the queue. Great response time for interactive systems.',
  PRIORITY: 'Priority (non-preemptive): the job with the lowest priority number runs next. Low-priority jobs may starve without aging.',
}

function registers(job: Job, tick: Tick | undefined, idx: number) {
  const executed = tick ? job.burst - (tick.remaining[job.id] ?? job.burst) : 0
  return {
    PC: `0x${(0x4000 + idx * 0x1000 + executed * 0x10).toString(16)}`,
    SP: `0x${(0x7ff0 - idx * 0x200 - executed * 8).toString(16)}`,
    R0: String(executed * 7 + idx),
  }
}

/** Jobs as "program.arrival.burst.priority" separated by "_"; the program is an index into `pool`. */
const jobsCodec: Codec<WorkJob[]> = {
  format: (jobs) => jobs.map((j) => [pool.findIndex((p) => p.name === j.name), j.arrival, j.burst, j.priority].join('.')).join('_'),
  parse: (s) => {
    if (s === '') return []
    const jobs = s.split('_').map((part, i) => {
      const [p, arrival, burst, priority] = part.split('.').map(Number)
      const ok = pool[p] && [arrival, burst, priority].every((n) => Number.isInteger(n) && n >= 0 && n <= 99) && burst > 0
      return ok ? { id: `P${i + 1}`, name: pool[p].name, arrival, burst, priority } : null
    })
    return jobs.length <= 8 && jobs.every(Boolean) ? (jobs as WorkJob[]) : undefined
  },
}

export default function SchedulingPage() {
  const [jobs, setJobs] = useUrlState('jobs', defaultJobs, jobsCodec)
  const [algo, setAlgo] = useUrlState<SchedAlgo>('algo', 'FCFS', codecs.oneOf(['FCFS', 'SJF', 'SRTF', 'RR', 'PRIORITY']))
  const [quantum, setQuantum] = useUrlState('quantum', 2, codecs.int(1, 6))
  const schedule = useMemo(() => simulate(jobs, algo, quantum), [jobs, algo, quantum])
  const ids = jobs.map((j) => j.id)

  const sim = useSimulation({
    initial: () => 0,
    step: (t) => t + 1,
    isDone: (t) => t >= schedule.ticks.length - 1,
  })
  const { reset } = sim
  useEffect(() => reset(0), [schedule, reset])

  const t = Math.min(sim.state, Math.max(schedule.ticks.length - 1, 0))
  const tick = schedule.ticks[t]
  const isLast = t === schedule.ticks.length - 1
  const filled = isLast ? t : t + 1
  const jobById = (id: string) => jobs.find((j) => j.id === id)!

  const met = useMemo((): Record<string, boolean> => {
    if (jobs.length === 0) return {}
    const fcfs = simulate(jobs, 'FCFS').avgWaiting
    const sjf = simulate(jobs, 'SJF').avgWaiting
    const runs = schedule.segments.filter((s) => s.id !== null).map((s) => s.id)
    return {
      'ch-sched-rr-beats': algo === 'RR' && schedule.avgWaiting < fcfs - 1e-9,
      'ch-sched-convoy': jobs.length >= 3 && fcfs > 0 && fcfs >= 3 * sjf,
      'ch-sched-switches': schedule.contextSwitches >= 8,
      'ch-sched-srtf': algo === 'SRTF' && new Set(runs).size < runs.length,
    }
  }, [jobs, algo, schedule])

  const addJob = (p: (typeof pool)[number]) => {
    if (jobs.length >= 8) return
    const nextNum = Math.max(0, ...jobs.map((j) => Number(j.id.slice(1)))) + 1
    setJobs([...jobs, { id: `P${nextNum}`, name: p.name, arrival: jobs.length, burst: p.burst, priority: p.priority }])
  }
  const updateJob = (id: string, patch: Partial<WorkJob>) => setJobs(jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)))

  return (
    <TopicLayout
      topicId="scheduling"
      questions={schedulingQuiz}
      intro={
        <>
          A CPU core can run only one thread at a time. The scheduler decides which ready process runs next and for how
          long. Switching between processes requires a <Term k="context">context switch</Term>: the kernel saves the
          running process's registers into its PCB and restores another's.
        </>
      }
      keyIdeas={[
        <>
          <strong>Ready queue:</strong> processes that could run right now, waiting for the CPU.
        </>,
        <>
          <strong>Metrics:</strong> <Term k="turnaround">turnaround</Term> = completion - arrival;{' '}
          <Term k="waiting">waiting</Term> = turnaround - burst.
        </>,
        <>
          <strong><Term k="preemption">Preemptive</Term></strong> schedulers can take the CPU away mid-burst; non-preemptive
          ones wait for the job to finish.
        </>,
      ]}
    >
      <Card
        id="workload"
        share
        title="1. Build a workload"
        subtitle="Drag programs from the pool into the workload (or click them), then tune arrival, burst and priority."
      >
        <Workload jobs={jobs} onAdd={addJob} onUpdate={updateJob} onRemove={(id) => setJobs(jobs.filter((j) => j.id !== id))} ids={ids} />
      </Card>

      <Card
        title="2. Choose a scheduling algorithm"
        actions={
          <Segmented label="Scheduling algorithm" value={algo} options={algos} onChange={setAlgo} />
        }
      >
        <div className="flex flex-wrap items-center gap-4">
          <p className="flex-1 text-sm text-muted">{algoInfo[algo]}</p>
          {algo === 'RR' && (
            <label className="flex items-center gap-3 text-sm">
              <Term k="quantum">Quantum</Term>
              <input type="range" min={1} max={6} value={quantum} onChange={(e) => setQuantum(Number(e.target.value))} />
              <span className="w-6 font-mono">{quantum}</span>
            </label>
          )}
        </div>
      </Card>

      <Card title="3. Run it" actions={<SimControls sim={sim} label={`t = ${tick?.time ?? 0}`} />}>
        {jobs.length === 0 ? (
          <Callout>Add at least one job to the workload to start the simulation.</Callout>
        ) : (
          <div className="grid gap-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <CpuView tick={tick} ids={ids} jobById={jobById} isLast={isLast} />
              <ContextSwitchView tick={tick} ids={ids} jobById={jobById} switchCount={schedule.ticks.slice(0, t + 1).filter((x) => x.switchFrom).length} />
            </div>
            <Gantt segments={schedule.segments} total={schedule.ticks.length - 1} filled={filled} ids={ids} />
            <StatsTable schedule={schedule} filled={filled} ids={ids} jobs={jobs} />
          </div>
        )}
        <div className="mt-5">
          <Challenges items={challenges.scheduling} met={met} />
        </div>
      </Card>
    </TopicLayout>
  )
}

function Workload({
  jobs,
  ids,
  onAdd,
  onUpdate,
  onRemove,
}: {
  jobs: WorkJob[]
  ids: string[]
  onAdd: (p: (typeof pool)[number]) => void
  onUpdate: (id: string, patch: Partial<WorkJob>) => void
  onRemove: (id: string) => void
}) {
  const dropRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)
  const dragged = useRef(false)
  const inside = (x: number, y: number) => {
    const r = dropRef.current?.getBoundingClientRect()
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Program pool</div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {pool.map((p) => (
            <motion.button
              key={p.name}
              type="button"
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.05, zIndex: 30 }}
              onDragStart={() => (dragged.current = true)}
              onDrag={(_, info) => setHover(inside(info.point.x - window.scrollX, info.point.y - window.scrollY))}
              onDragEnd={(_, info) => {
                setHover(false)
                if (inside(info.point.x - window.scrollX, info.point.y - window.scrollY)) onAdd(p)
                window.setTimeout(() => (dragged.current = false), 0)
              }}
              onClick={() => {
                if (!dragged.current) onAdd(p)
              }}
              className="relative cursor-grab rounded-xl border border-line bg-surface-2 px-3 py-2 text-left text-sm shadow-sm active:cursor-grabbing"
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-muted">
                burst {p.burst} - prio {p.priority}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
      <div
        ref={dropRef}
        className={cx(
          'min-h-40 rounded-2xl border-2 border-dashed p-3 transition-colors',
          hover ? 'border-amber-500 bg-amber-500/10' : 'border-line',
        )}
      >
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted">
          <span>Workload ({jobs.length}/8)</span>
          <span className="normal-case tracking-normal">Drop programs here</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[460px] text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="py-1 font-medium">Process</th>
                <th className="py-1 font-medium">Arrival</th>
                <th className="py-1 font-medium">Burst</th>
                <th className="py-1 font-medium">Priority</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {jobs.map((j) => (
                  <motion.tr key={j.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <td className="py-1">
                      <span className="inline-flex items-center gap-2">
                        <span className="size-3 rounded-full" style={{ background: colorFor(ids, j.id) }} />
                        <span className="font-mono font-semibold">{j.id}</span>
                        <span className="text-muted">{j.name}</span>
                      </span>
                    </td>
                    {(['arrival', 'burst', 'priority'] as const).map((field) => (
                      <td key={field} className="py-1 pr-2">
                        <input
                          type="number"
                          aria-label={`${j.id} ${field}`}
                          min={field === 'arrival' ? 0 : 1}
                          max={field === 'arrival' ? 30 : 15}
                          value={j[field]}
                          onChange={(e) => {
                            const v = Math.max(field === 'arrival' ? 0 : 1, Math.min(30, Math.floor(Number(e.target.value) || 0)))
                            onUpdate(j.id, { [field]: v })
                          }}
                          className={cx(inputClass, 'w-20')}
                        />
                      </td>
                    ))}
                    <td className="py-1 text-right">
                      <Button size="sm" variant="ghost" onClick={() => onRemove(j.id)} aria-label={`Remove ${j.id}`}>
                        Remove
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Chip({ id, ids, small, label }: { id: string; ids: string[]; small?: boolean; label?: string }) {
  return (
    <motion.div
      layoutId={`chip-${id}`}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className={cx(
        'grid place-items-center rounded-xl font-mono font-bold text-white shadow-md',
        small ? 'h-10 min-w-12 px-2 text-sm' : 'h-20 min-w-28 px-4 text-2xl',
      )}
      style={{ background: colorFor(ids, id) }}
    >
      <span>
        {id}
        {label && <span className="block text-[10px] font-medium opacity-90">{label}</span>}
      </span>
    </motion.div>
  )
}

function CpuView({
  tick,
  ids,
  jobById,
  isLast,
}: {
  tick: Tick | undefined
  ids: string[]
  jobById: (id: string) => WorkJob
  isLast: boolean
}) {
  if (!tick) return null
  return (
    <div className="grid gap-4 rounded-2xl border border-line bg-surface-2 p-4">
      <div className="flex items-center gap-4">
        <div className="relative grid size-36 shrink-0 place-items-center rounded-2xl border-4 border-amber-500/60 bg-surface">
          <span className="absolute left-2 top-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-300">CPU</span>
          {tick.running ? (
            <Chip id={tick.running} ids={ids} label={`${tick.remaining[tick.running]} left`} />
          ) : (
            <span className="text-sm text-muted">{isLast ? 'All done' : 'Idle'}</span>
          )}
        </div>
        <div className="text-sm">
          {tick.running ? (
            <>
              <div className="font-semibold">
                {tick.running} ({jobById(tick.running).name}) is running
              </div>
              <div className="text-muted">It needs {tick.remaining[tick.running]} more time unit(s).</div>
            </>
          ) : (
            <div className="text-muted">{isLast ? 'Every job has completed.' : 'No process is ready, so the CPU idles.'}</div>
          )}
          {tick.arrived.length > 0 && <div className="mt-1 text-emerald-600 dark:text-emerald-400">Arrived: {tick.arrived.join(', ')}</div>}
          {tick.completed.length > 0 && <div className="mt-1 text-indigo-600 dark:text-indigo-300">Finished: {tick.completed.join(', ')}</div>}
        </div>
      </div>
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Ready queue (front to back)</div>
        <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-dashed border-line p-2">
          {tick.ready.length === 0 && <span className="text-xs text-muted">empty</span>}
          {tick.ready.map((id) => (
            <Chip key={id} id={id} ids={ids} small />
          ))}
        </div>
      </div>
    </div>
  )
}

function PcbCard({ job, tick, ids, role }: { job: WorkJob; tick: Tick; ids: string[]; role: 'save' | 'load' }) {
  const regs = registers(job, tick, ids.indexOf(job.id))
  return (
    <motion.div
      initial={{ opacity: 0, y: role === 'save' ? -10 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-line bg-surface p-3 font-mono text-xs"
    >
      <div className="mb-1 flex items-center gap-2 font-sans text-sm font-semibold">
        <span className="size-3 rounded-full" style={{ background: colorFor(ids, job.id) }} />
        PCB of {job.id}
      </div>
      {Object.entries(regs).map(([k, v]) => (
        <div key={k} className="flex justify-between">
          <span className="text-muted">{k}</span>
          <span>{v}</span>
        </div>
      ))}
      <div className="flex justify-between">
        <span className="text-muted">state</span>
        <span>{role === 'save' ? 'ready' : 'running'}</span>
      </div>
    </motion.div>
  )
}

function ContextSwitchView({
  tick,
  ids,
  jobById,
  switchCount,
}: {
  tick: Tick | undefined
  ids: string[]
  jobById: (id: string) => WorkJob
  switchCount: number
}) {
  if (!tick) return null
  const from = tick.switchFrom
  const to = tick.running
  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">Context switch</div>
        <div className="text-xs text-muted">
          switches so far: <span className="font-mono font-semibold text-ink">{switchCount}</span>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {from && to ? (
          <motion.div key={`${tick.time}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-3">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <PcbCard job={jobById(from)} tick={tick} ids={ids} role="save" />
              <motion.div
                className="text-center text-xs font-semibold text-amber-600 dark:text-amber-300"
                animate={{ x: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                kernel
                <br />
                swap
              </motion.div>
              <PcbCard job={jobById(to)} tick={tick} ids={ids} role="load" />
            </div>
            <ol className="list-decimal space-y-0.5 pl-5 text-sm text-muted">
              <li>Interrupt: CPU traps into the kernel.</li>
              <li>Save {from}'s PC, SP and registers into PCB({from}).</li>
              <li>Scheduler selects {to}.</li>
              <li>Restore PCB({to}) into the CPU and return to user mode.</li>
            </ol>
          </motion.div>
        ) : (
          <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted">
            {to
              ? `${to} keeps the CPU this tick, so no state needs to be saved or restored.`
              : 'Nothing to switch right now.'}{' '}
            Step through the simulation and watch for switches: each one costs time in a real system.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function Gantt({
  segments,
  total,
  filled,
  ids,
}: {
  segments: { id: string | null; start: number; end: number }[]
  total: number
  filled: number
  ids: string[]
}) {
  const width = Math.max(total, 1)
  const step = total > 30 ? 5 : total > 15 ? 2 : 1
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Gantt chart</div>
      <div className="relative h-12 overflow-hidden rounded-xl border border-line bg-surface-2">
        {segments
          .filter((s) => s.start < filled)
          .map((s) => {
            const end = Math.min(s.end, filled)
            return (
              <motion.div
                key={`${s.id}-${s.start}`}
                layout
                className={cx(
                  'absolute inset-y-1 grid place-items-center overflow-hidden rounded-md font-mono text-xs font-bold text-white',
                  s.id === null && 'border border-dashed border-line text-muted',
                )}
                style={{
                  left: `calc(${(s.start / width) * 100}% + 1px)`,
                  width: `calc(${((end - s.start) / width) * 100}% - 2px)`,
                  background: s.id ? colorFor(ids, s.id) : undefined,
                }}
              >
                {s.id ?? 'idle'}
              </motion.div>
            )
          })}
        <div className="absolute inset-y-0 w-0.5 bg-ink/70 transition-all" style={{ left: `${(filled / width) * 100}%` }} />
      </div>
      <div className="relative mt-1 h-4 font-mono text-[10px] text-muted">
        {Array.from({ length: Math.floor(total / step) + 1 }, (_, i) => i * step).map((x) => (
          <span key={x} className="absolute -translate-x-1/2" style={{ left: `${(x / width) * 100}%` }}>
            {x}
          </span>
        ))}
      </div>
    </div>
  )
}

function StatsTable({
  schedule,
  filled,
  ids,
  jobs,
}: {
  schedule: ReturnType<typeof simulate>
  filled: number
  ids: string[]
  jobs: WorkJob[]
}) {
  const allDone = schedule.stats.every((s) => s.completion <= filled)
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              <th className="py-1 font-medium">Process</th>
              <th className="py-1 font-medium">Arrival</th>
              <th className="py-1 font-medium">Burst</th>
              <th className="py-1 font-medium">Completion</th>
              <th className="py-1 font-medium">Turnaround</th>
              <th className="py-1 font-medium">Waiting</th>
              <th className="py-1 font-medium">Response</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {schedule.stats.map((s) => {
              const done = s.completion <= filled
              return (
                <tr key={s.id} className="border-t border-line">
                  <td className="py-1.5">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-3 rounded-full" style={{ background: colorFor(ids, s.id) }} />
                      {s.id}
                      <span className="font-sans text-xs text-muted">{jobs.find((j) => j.id === s.id)?.name}</span>
                    </span>
                  </td>
                  <td>{s.arrival}</td>
                  <td>{s.burst}</td>
                  <td>{done ? s.completion : '...'}</td>
                  <td>{done ? s.turnaround : '...'}</td>
                  <td>{done ? s.waiting : '...'}</td>
                  <td>{s.start < filled ? s.response : '...'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 content-start gap-2 lg:w-64">
        <Stat label="Avg waiting" value={allDone ? schedule.avgWaiting.toFixed(2) : '?'} />
        <Stat label="Avg turnaround" value={allDone ? schedule.avgTurnaround.toFixed(2) : '?'} />
        <Stat label="Avg response" value={allDone ? schedule.avgResponse.toFixed(2) : '?'} />
        <Stat label="Switches" value={allDone ? schedule.contextSwitches : '?'} />
      </div>
    </div>
  )
}
