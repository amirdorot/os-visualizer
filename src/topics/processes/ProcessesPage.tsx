import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { TopicLayout } from '../../components/TopicLayout'
import { Button, Card } from '../../components/ui'
import { cx, inputClass } from '../../lib/utils'
import { Challenges } from '../../components/Challenges'
import { useChallenges } from '../../data/challenges'
import { useQuiz } from '../../data/quizzes'
import { useBidi, useText } from '../../i18n'
import { processesText } from './pageText'
import { blockedReason, initialOS, INIT_PID, reduceOS, running, treeDepth, type OSState, type PCB, type PState, type ProcAction } from '../../engines/processes'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useSimulation } from '../../hooks/useSimulation'

interface ProcSim {
  os: OSState
  arrow: string | null
}

const boxes: Record<PState, { x: number; y: number; w: number; h: number; label: string; tone: string }> = {
  new: { x: 20, y: 20, w: 220, h: 120, label: 'New', tone: 'border-slate-400/60 bg-slate-500/10' },
  terminated: { x: 760, y: 20, w: 220, h: 120, label: 'Terminated', tone: 'border-rose-500/50 bg-rose-500/10' },
  ready: { x: 150, y: 210, w: 280, h: 150, label: 'Ready', tone: 'border-sky-500/50 bg-sky-500/10' },
  running: { x: 570, y: 210, w: 280, h: 150, label: 'Running', tone: 'border-emerald-500/60 bg-emerald-500/10' },
  waiting: { x: 360, y: 420, w: 280, h: 130, label: 'Waiting', tone: 'border-amber-500/50 bg-amber-500/10' },
}

interface Arrow {
  id: string
  d: string
  label: string
  lx: number
  ly: number
}

const arrows: (Arrow & { from: PState; to: PState })[] = [
  { id: 'admit', d: 'M 180 140 Q 200 175 230 210', label: 'admit', lx: 150, ly: 185, from: 'new', to: 'ready' },
  { id: 'dispatch', d: 'M 430 255 L 570 255', label: 'dispatch', lx: 500, ly: 245, from: 'ready', to: 'running' },
  { id: 'timeout', d: 'M 570 320 L 430 320', label: 'interrupt', lx: 500, ly: 340, from: 'running', to: 'ready' },
  { id: 'block', d: 'M 700 360 Q 690 440 640 470', label: 'blockArrow', lx: 745, ly: 430, from: 'running', to: 'waiting' },
  { id: 'wake', d: 'M 360 470 Q 300 440 290 360', label: 'wakeArrow', lx: 225, ly: 430, from: 'waiting', to: 'ready' },
  { id: 'exit', d: 'M 780 210 Q 820 175 840 140', label: 'exit()', lx: 860, ly: 185, from: 'running', to: 'terminated' },
]

function arrowFor(a: ProcAction, prev: OSState, next: OSState): string | null {
  if (blockedReason(prev, a)) return null
  switch (a.type) {
    case 'admit':
      return 'admit'
    case 'dispatch':
      return 'dispatch'
    case 'timeout':
      return 'timeout'
    case 'io':
      return 'block'
    case 'ioDone':
      return 'wake'
    case 'wait':
      return running(next) ? null : 'block'
    case 'exit':
      return 'exit'
    default:
      return null
  }
}

const programs = ['vim', 'ls', 'gcc', 'python', 'nginx']

export default function ProcessesPage() {
  const sim = useSimulation<ProcSim>({
    initial: () => ({ os: initialOS(), arrow: null }),
    step: (s) => s,
    isDone: () => true,
  })
  const { os, arrow } = sim.state
  const t = useText(processesText)
  const questions = useQuiz('processes')
  const challenges = useChallenges('processes')
  const [selected, setSelected] = useState<number>(100)
  const [program, setProgram] = useState('vim')

  const act = (a: ProcAction) => {
    const next = reduceOS(os, a)
    sim.push({ os: next, arrow: arrowFor(a, os, next) })
    if ((a.type === 'create' || a.type === 'fork') && !blockedReason(os, a)) setSelected(os.nextPid)
  }

  const sel = os.procs.find((p) => p.pid === selected) ?? running(os) ?? os.procs[0]

  return (
    <TopicLayout
      topicId="processes"
      questions={questions}
      intro={t.intro}
      keyIdeas={t.keyIdeas}
    >
      <Card
        title={t.diagramTitle}
        subtitle={t.diagramSubtitle}
        actions={
          <>
            <Button size="sm" onClick={sim.back} disabled={!sim.canBack}>
              <Icon name="stepBack" className="size-3.5" /> {t.undo}
            </Button>
            <Button size="sm" onClick={sim.forward} disabled={!sim.canForward}>
              {t.redo} <Icon name="stepForward" className="size-3.5" />
            </Button>
            <Button size="sm" onClick={() => sim.reset()}>
              <Icon name="reset" className="size-3.5" /> {t.reset}
            </Button>
          </>
        }
      >
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <div className="overflow-x-auto">
            <StateDiagram os={os} selected={sel?.pid ?? null} onSelect={setSelected} highlighted={arrow} animKey={sim.index} />
          </div>
          <div className="grid content-start gap-4">
            <Actions os={os} sel={sel} act={act} program={program} setProgram={setProgram} />
            <Challenges
              items={challenges}
              met={{
                'ch-proc-zombie': os.stats.zombies > 0,
                'ch-proc-reap': os.stats.reaped > 0,
                'ch-proc-orphan': os.stats.orphans > 0,
                'ch-proc-tree': treeDepth(os) >= 3,
                'ch-proc-shell': os.procs.some((p) => {
                  const parent = os.procs.find((x) => x.pid === p.ppid)
                  return !!parent && parent.program !== p.program
                }),
              }}
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card title="Process Control Block" subtitle={t.pcbSubtitle}>
          {sel ? <PcbView pcb={sel} /> : <p className="text-sm text-muted">{t.noProcs}</p>}
        </Card>
        <Card title={t.treeTitle} subtitle={t.treeSubtitle}>
          <ProcessTree os={os} selected={sel?.pid ?? null} onSelect={setSelected} />
        </Card>
      </div>

      <Card title={t.logTitle} subtitle={t.logSubtitle}>
        <ol className="grid max-h-64 gap-1.5 overflow-y-auto text-sm" aria-live="polite">
          <AnimatePresence initial={false}>
            {os.log.map((l, i) => (
              <motion.li
                key={os.log.length - i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cx(
                  'rounded-lg border-s-4 bg-surface-2 px-3 py-1.5',
                  l.tone === 'good' && 'border-emerald-500',
                  l.tone === 'bad' && 'border-rose-500',
                  l.tone === 'info' && 'border-sky-500',
                  i > 0 && 'opacity-70',
                )}
              >
                {t.msg(l.msg)}
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      </Card>
    </TopicLayout>
  )
}

function StateDiagram({
  os,
  selected,
  onSelect,
  highlighted,
  animKey,
}: {
  os: OSState
  selected: number | null
  onSelect: (pid: number) => void
  highlighted: string | null
  animKey: number
}) {
  const narrow = useMediaQuery('(max-width: 639px)')
  const t = useText(processesText)
  const fix = useBidi()
  const arrowLabel = (a: Arrow) => (a.label === 'blockArrow' ? t.blockArrow : a.label === 'wakeArrow' ? t.wakeArrow : fix(a.label))
  const tokens = (state: PState) =>
    os.procs.filter((p) => p.state === state).map((p) => <ProcToken key={p.pid} p={p} selected={selected === p.pid} onSelect={onSelect} />)

  if (narrow) {
    const last = arrows.find((a) => a.id === highlighted)
    const order: PState[] = ['new', 'terminated', 'ready', 'running', 'waiting']
    return (
      <div className="grid gap-2">
        <div className="grid grid-cols-2 gap-2">
          {order.map((state) => {
            const b = boxes[state]
            const hot = last && (last.to === state || last.from === state)
            return (
              <div key={state} className={cx('flex min-h-24 flex-col rounded-2xl border-2 p-2', b.tone, state === 'waiting' && 'col-span-2', hot && 'ring-2 ring-violet-500')}>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  {b.label}
                  {state === 'running' && <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] text-white">CPU</span>}
                </div>
                <div className="mt-1 flex flex-1 flex-wrap content-start gap-1.5">{tokens(state)}</div>
              </div>
            )
          })}
        </div>
        <p className="rounded-xl bg-surface-2 px-3 py-2 text-sm" aria-live="polite">
          {last ? (
            <>
              {t.lastTransition(boxes[last.from].label, boxes[last.to].label, arrowLabel(last))}
            </>
          ) : (
            <span className="text-muted">{t.transitionsHelp}</span>
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="relative mx-auto aspect-[1000/570] w-full min-w-[620px] max-w-[900px]">
      <svg viewBox="0 0 1000 570" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>
        {arrows.map((a) => {
          const on = a.id === highlighted
          return (
            <g key={a.id} className={on ? 'text-violet-500' : 'text-muted'}>
              <path d={a.d} fill="none" stroke="currentColor" strokeWidth={2.5} markerEnd="url(#arrowhead)" opacity={on ? 0.35 : 1} />
              {on && (
                <motion.path
                  key={animKey}
                  d={a.d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={6}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
              )}
              <text x={a.lx} y={a.ly} textAnchor="middle" className="fill-current text-[18px] font-semibold">
                {arrowLabel(a)}
              </text>
            </g>
          )
        })}
      </svg>
      {(Object.keys(boxes) as PState[]).map((state) => {
        const b = boxes[state]
        return (
          <div
            key={state}
            className={cx('absolute flex flex-col rounded-2xl border-2 p-2', b.tone)}
            style={{ left: `${b.x / 10}%`, top: `${(b.y / 570) * 100}%`, width: `${b.w / 10}%`, height: `${(b.h / 570) * 100}%` }}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              {b.label}
              {state === 'running' && <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] text-white">CPU</span>}
            </div>
            <div className="mt-1 flex flex-1 flex-wrap content-start gap-1.5">{tokens(state)}</div>
          </div>
        )
      })}
    </div>
  )
}

function ProcToken({ p, selected, onSelect }: { p: PCB; selected: boolean; onSelect: (pid: number) => void }) {
  return (
    <motion.button
      layoutId={`proc-${p.pid}`}
      type="button"
      onClick={() => onSelect(p.pid)}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      aria-pressed={selected}
      aria-label={`PID ${p.pid} ${p.program}, ${p.state}`}
      className={cx(
        'rounded-lg border px-2 py-1 text-start font-mono text-xs shadow-sm',
        selected ? 'border-violet-500 bg-violet-600 text-white' : 'border-line bg-surface',
        p.state === 'terminated' && 'opacity-80',
      )}
    >
      <div className="font-bold">{p.pid}</div>
      <div className="opacity-80">
        {p.program}
        {p.state === 'terminated' && ' (zombie)'}
        {p.waitingFor === 'child' && ' (wait)'}
        {p.waitingFor === 'io' && ' (I/O)'}
      </div>
    </motion.button>
  )
}

function Actions({
  os,
  sel,
  act,
  program,
  setProgram,
}: {
  os: OSState
  sel: PCB | undefined
  act: (a: ProcAction) => void
  program: string
  setProgram: (p: string) => void
}) {
  const r = running(os)
  const t = useText(processesText)
  const b = t.buttons
  const fix = useBidi()
  const btn = (a: ProcAction, [label, hint]: [string, string], variant: 'primary' | 'secondary' = 'secondary') => {
    const reason = blockedReason(os, a)
    return (
      <Button key={a.type} variant={variant} size="sm" onClick={() => act(a)} disabled={reason !== null} title={reason ? t.msg(reason) : hint}>
        {label}
      </Button>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-line bg-surface-2 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t.selected}: {sel ? fix(`PID ${sel.pid} (${sel.state})`) : t.none}</div>
        <div className="flex flex-wrap gap-2">
          {sel?.state === 'new' && btn({ type: 'admit', pid: sel.pid }, b.admit, 'primary')}
          {sel?.state === 'ready' && btn({ type: 'dispatch', pid: sel.pid }, b.dispatch, 'primary')}
          {sel?.waitingFor === 'io' && btn({ type: 'ioDone', pid: sel.pid }, b.ioDone, 'primary')}
          {sel?.waitingFor === 'child' && <p className="text-sm text-muted">{t.inWait}</p>}
          {sel?.state === 'terminated' && <p className="text-sm text-muted">{t.zombieNote}</p>}
          {sel?.state === 'running' && <p className="text-sm text-muted">{t.runningNote}</p>}
        </div>
      </div>

      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          {t.running}: {r ? fix(`PID ${r.pid} (${r.program})`) : t.idle}
        </div>
        <div className="flex flex-wrap gap-2">
          {btn({ type: 'tick' }, b.tick)}
          {btn({ type: 'timeout' }, b.timeout)}
          {btn({ type: 'io' }, b.io)}
          {btn({ type: 'fork' }, [fix('fork()'), b.fork])}
          {btn({ type: 'exec', program }, [fix(`exec("${program}")`), b.exec])}
          {btn({ type: 'wait' }, [fix('wait()'), b.wait])}
          {btn({ type: 'exit' }, [fix('exit()'), b.exit])}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface-2 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t.launch}</div>
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label={t.program} value={program} onChange={(e) => setProgram(e.target.value)} className={inputClass}>
            {programs.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          {btn({ type: 'create', program }, b.create)}
        </div>
      </div>
    </>
  )
}

function PcbView({ pcb }: { pcb: PCB }) {
  const t = useText(processesText)
  const fix = useBidi()
  const values = [
    String(pcb.pid),
    pcb.ppid === INIT_PID ? '1 (init)' : String(pcb.ppid),
    pcb.state + (pcb.state === 'terminated' ? ' (zombie)' : ''),
    pcb.program,
    `0x${pcb.pc.toString(16)}`,
    `${pcb.cpuTime} ticks`,
    pcb.waitingFor ?? '-',
    pcb.openFiles.join(', ') || t.closed,
  ].map(fix)
  const rows = t.pcbRows.map((label, i) => [label, values[i]] as const)
  return (
    <motion.dl key={pcb.pid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 font-mono text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </motion.dl>
  )
}

function ProcessTree({ os, selected, onSelect }: { os: OSState; selected: number | null; onSelect: (pid: number) => void }) {
  const children = (ppid: number) => os.procs.filter((p) => p.ppid === ppid)
  const render = (p: PCB) => (
    <li key={p.pid} className="mt-1">
      <button
        type="button"
        onClick={() => onSelect(p.pid)}
        className={cx('rounded-md px-2 py-0.5 font-mono text-sm', selected === p.pid ? 'bg-violet-600 text-white' : 'hover:bg-surface-2')}
      >
        {p.pid} {p.program} <span className="text-xs opacity-70">[{p.state}]</span>
      </button>
      {children(p.pid).length > 0 && <ul className="ms-4 border-s border-line ps-3">{children(p.pid).map(render)}</ul>}
    </li>
  )
  return (
    <div className="font-mono text-sm">
      <div className="rounded-md px-2 py-0.5 text-muted">1 init</div>
      <ul className="ms-4 border-s border-line ps-3">{children(INIT_PID).map(render)}</ul>
    </div>
  )
}
