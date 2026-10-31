import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Challenges } from '../../components/Challenges'
import { Term } from '../../components/Term'
import { TopicLayout } from '../../components/TopicLayout'
import { Button, Callout, Card } from '../../components/ui'
import { challenges } from '../../data/challenges'
import { findCycle, initialRag, need, release, request, safety, textbookExample, validate, type BankerInput, type RagState } from '../../engines/deadlock'
import { cx, inputClass } from '../../lib/utils'
import { deadlockQuiz } from './quiz'

export default function DeadlockPage() {
  return (
    <TopicLayout
      topicId="deadlock"
      questions={deadlockQuiz}
      intro={
        <>
          A <Term k="deadlock">deadlock</Term> happens when a group of processes each hold something another one needs, and
          all of them wait forever. The OS can detect deadlocks by looking for cycles in a{' '}
          <Term k="rag">resource allocation graph</Term>, or avoid them entirely by only granting requests that keep the
          system in a <Term k="safestate">safe state</Term>.
        </>
      }
      keyIdeas={[
        <>
          All four <Term k="coffman">Coffman conditions</Term> are needed: mutual exclusion, hold and wait, no preemption,
          circular wait. Break one and deadlock is impossible.
        </>,
        <>
          With one instance of each resource, <strong>a cycle in the graph means deadlock</strong>. With several instances it
          only means deadlock is possible.
        </>,
        <>
          The <Term k="banker">banker's algorithm</Term> checks whether every process could still finish in some order before
          it grants a request.
        </>,
      ]}
    >
      <RagLab />
      <BankerLab />
    </TopicLayout>
  )
}

const NODE_R = 24

function positions(s: RagState) {
  const order = s.resources.flatMap((r, i) => [r, s.processes[i]]).filter(Boolean)
  return Object.fromEntries(
    order.map((id, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / order.length
      return [id, { x: 200 + 115 * Math.cos(a), y: 150 + 115 * Math.sin(a) }]
    }),
  )
}

function Edge({ from, to, dashed, hot }: { from: { x: number; y: number }; to: { x: number; y: number }; dashed?: boolean; hot: boolean }) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy)
  const ux = dx / len
  const uy = dy / len
  return (
    <motion.line
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      x1={from.x + ux * NODE_R}
      y1={from.y + uy * NODE_R}
      x2={to.x - ux * (NODE_R + 4)}
      y2={to.y - uy * (NODE_R + 4)}
      stroke={hot ? '#ef4444' : 'currentColor'}
      strokeWidth={hot ? 3 : 2}
      strokeDasharray={dashed ? '6 5' : undefined}
      markerEnd={hot ? 'url(#arrow-hot)' : 'url(#arrow)'}
    />
  )
}

function RagLab() {
  const [history, setHistory] = useState<RagState[]>([initialRag()])
  const s = history[history.length - 1]
  const push = (next: RagState) => next !== s && setHistory([...history, next])
  const cycle = findCycle(s)
  const pos = positions(s)
  const inCycle = (p: string) => cycle?.includes(p) ?? false
  const hotRequest = (p: string) => inCycle(p)
  const hotAssign = (r: string) => {
    const h = s.holder[r]
    return h !== null && inCycle(h) && s.processes.some((q) => inCycle(q) && s.waiting[q] === r)
  }

  return (
    <Card
      title="Resource allocation graph"
      subtitle="Each resource (square) has one instance. Use the table to make processes (circles) request and release resources, and watch for a cycle."
      actions={
        <>
          <Button size="sm" onClick={() => setHistory(history.slice(0, -1))} disabled={history.length < 2}>
            Undo
          </Button>
          <Button size="sm" onClick={() => setHistory([initialRag()])}>
            Reset
          </Button>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[400px_1fr]">
        <svg viewBox="0 0 400 300" className="w-full max-w-md text-muted" role="img" aria-label={cycle ? `Graph with a deadlock cycle through ${cycle.join(', ')}` : 'Resource allocation graph with no cycle'}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill="currentColor" />
            </marker>
            <marker id="arrow-hot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill="#ef4444" />
            </marker>
          </defs>
          {s.resources.map((r) => {
            const h = s.holder[r]
            return h ? <Edge key={`a-${r}`} from={pos[r]} to={pos[h]} hot={hotAssign(r)} /> : null
          })}
          {s.processes.map((p) => {
            const r = s.waiting[p]
            return r ? <Edge key={`w-${p}-${r}`} from={pos[p]} to={pos[r]} dashed hot={hotRequest(p)} /> : null
          })}
          {s.processes.map((p) => (
            <g key={p}>
              <circle cx={pos[p].x} cy={pos[p].y} r={NODE_R} className={cx('stroke-2', inCycle(p) ? 'fill-red-500/20 stroke-red-500' : 'fill-violet-500/15 stroke-violet-500')} />
              <text x={pos[p].x} y={pos[p].y + 5} textAnchor="middle" className="fill-ink font-mono text-sm font-bold">
                {p}
              </text>
            </g>
          ))}
          {s.resources.map((r) => (
            <g key={r}>
              <rect x={pos[r].x - NODE_R} y={pos[r].y - NODE_R} width={NODE_R * 2} height={NODE_R * 2} rx={6} className="fill-sky-500/15 stroke-sky-500 stroke-2" />
              <circle cx={pos[r].x} cy={pos[r].y + 12} r={3} className="fill-sky-500" />
              <text x={pos[r].x} y={pos[r].y + 3} textAnchor="middle" className="fill-ink font-mono text-sm font-bold">
                {r}
              </text>
            </g>
          ))}
        </svg>

        <div className="grid content-start gap-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="p-1.5">Process</th>
                  {s.resources.map((r) => (
                    <th key={r} className="p-1.5">
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.processes.map((p) => (
                  <tr key={p} className="border-t border-line">
                    <td className="p-1.5 font-mono font-bold">
                      {p}
                      {s.waiting[p] && <span className="ml-1 text-xs font-normal text-amber-600 dark:text-amber-300">waiting</span>}
                    </td>
                    {s.resources.map((r) => {
                      const holds = s.holder[r] === p
                      const waitsHere = s.waiting[p] === r
                      return (
                        <td key={r} className="p-1">
                          {holds ? (
                            <Button size="sm" className="w-full" onClick={() => push(release(s, p, r))} title={s.waiting[p] ? 'The OS preempts the resource from this process' : undefined}>
                              {s.waiting[p] ? 'Preempt' : 'Release'}
                            </Button>
                          ) : waitsHere ? (
                            <span className="block rounded-lg border border-dashed border-amber-500 px-2 py-1 text-center text-xs">requested</span>
                          ) : (
                            <Button size="sm" variant="ghost" className="w-full border border-line" disabled={s.waiting[p] !== null} onClick={() => push(request(s, p, r))}>
                              Request
                            </Button>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted">
            <span>Solid arrow R to P: P holds R</span>
            <span>Dashed arrow P to R: P is waiting for R</span>
          </div>
          {cycle ? (
            <Callout tone="bad">
              <strong>Deadlock!</strong>{' '}
              {cycle.map((p) => `${p} waits for ${s.waiting[p]}, held by ${s.holder[s.waiting[p]!]}`).join('; ')}. None of
              them can ever continue. To recover, the OS must preempt a resource or kill a process in the cycle.
            </Callout>
          ) : Object.values(s.waiting).some(Boolean) ? (
            <Callout tone="warn">Some processes are waiting, but there is no cycle: once the holder releases, they will get the resource.</Callout>
          ) : (
            <Callout>No one is waiting. Try: P1 requests R1, P2 requests R2, then P1 requests R2 and P2 requests R1.</Callout>
          )}
          <Challenges
            items={challenges.deadlock.slice(0, 2)}
            met={{
              'ch-dl-deadlock': cycle !== null,
              'ch-dl-three': (cycle?.length ?? 0) >= 3,
            }}
          />
        </div>
      </div>
    </Card>
  )
}

const RES = ['A', 'B', 'C']

function BankerLab() {
  const [input, setInput] = useState<BankerInput>(textbookExample)
  const [shown, setShown] = useState(0)
  const error = validate(input)
  const result = useMemo(() => safety(input), [input])
  const needs = need(input)
  const steps = result.steps
  const finishedCheck = !error && shown >= steps.length
  const current = shown > 0 ? steps[shown - 1] : null
  const finishedSoFar = steps.slice(0, shown).filter((x) => x.ok).map((x) => x.process)
  const work = input.available.map((a, j) => a + finishedSoFar.reduce((acc, i) => acc + input.allocation[i][j], 0))

  const update = (fn: (draft: BankerInput) => void) => {
    const next = structuredClone(input)
    fn(next)
    setInput(next)
    setShown(0)
  }
  const numInput = (value: number, onChange: (v: number) => void, label: string) => (
    <input
      type="number"
      min={0}
      max={12}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(Math.max(0, Math.min(12, Number(e.target.value) || 0)))}
      className={cx(inputClass, 'w-12 px-1 py-1 text-center font-mono')}
    />
  )

  return (
    <Card
      title="Banker's algorithm: is this state safe?"
      subtitle="Edit Allocation, Max and Available, then step through the safety check. A process can finish if its Need fits in Work; when it finishes, it gives back everything it holds."
      actions={
        <Button size="sm" onClick={() => (setInput(textbookExample), setShown(0))}>
          Load textbook example
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-muted">
              <th className="p-1.5 text-left">Process</th>
              <th className="p-1.5" colSpan={3}>
                Allocation
              </th>
              <th className="p-1.5" colSpan={3}>
                Max
              </th>
              <th className="p-1.5" colSpan={3}>
                Need = Max - Allocation
              </th>
              <th className="p-1.5 text-left">Status</th>
            </tr>
            <tr className="font-mono text-xs text-muted">
              <th />
              {[0, 1, 2].flatMap((g) => RES.map((r) => <th key={`${g}${r}`}>{r}</th>))}
              <th />
            </tr>
          </thead>
          <tbody>
            {input.max.map((_, i) => {
              const done = finishedSoFar.includes(i)
              const isCurrent = current?.process === i
              return (
                <tr key={i} className={cx('border-t border-line', isCurrent && (current.ok ? 'bg-emerald-500/10' : 'bg-rose-500/10'))}>
                  <td className="p-1.5 font-mono font-bold">P{i}</td>
                  {RES.map((r, j) => (
                    <td key={`a${r}`} className="p-0.5">
                      {numInput(input.allocation[i][j], (v) => update((d) => void (d.allocation[i][j] = v)), `P${i} allocation ${r}`)}
                    </td>
                  ))}
                  {RES.map((r, j) => (
                    <td key={`m${r}`} className="p-0.5">
                      {numInput(input.max[i][j], (v) => update((d) => void (d.max[i][j] = v)), `P${i} max ${r}`)}
                    </td>
                  ))}
                  {RES.map((r, j) => (
                    <td key={`n${r}`} className={cx('p-1.5 text-center font-mono', isCurrent && !current.ok && needs[i][j] > current.work[j] && 'font-bold text-rose-600 dark:text-rose-300')}>
                      {needs[i][j]}
                    </td>
                  ))}
                  <td className="p-1.5 text-xs">
                    {done ? <span className="font-semibold text-emerald-600 dark:text-emerald-300">finished #{finishedSoFar.indexOf(i) + 1}</span> : isCurrent ? <span className="text-rose-600 dark:text-rose-300">must wait</span> : ''}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">Available</span>
          {RES.map((r, j) => (
            <label key={r} className="flex items-center gap-1 font-mono text-xs">
              {r}
              {numInput(input.available[j], (v) => update((d) => void (d.available[j] = v)), `Available ${r}`)}
            </label>
          ))}
        </div>
        <div className="rounded-xl border-2 border-cyan-500/50 px-3 py-1.5 font-mono text-sm">
          Work = ({work.join(', ')})
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => setShown(Math.max(0, shown - 1))} disabled={shown === 0}>
          Step back
        </Button>
        <Button variant="primary" onClick={() => setShown(shown + 1)} disabled={!!error || shown >= steps.length}>
          {shown === 0 ? 'Start safety check' : 'Next step'}
        </Button>
        <Button onClick={() => setShown(steps.length)} disabled={!!error || shown >= steps.length}>
          Run to the end
        </Button>
      </div>

      <div className="mt-4 grid gap-3">
        {error ? (
          <Callout tone="warn">{error} Allocation can never exceed Max.</Callout>
        ) : current && !finishedCheck ? (
          <Callout tone={current.ok ? 'good' : 'bad'}>
            P{current.process}: Need ({current.need.join(', ')}) {current.ok ? '<=' : 'is not <='} Work ({current.work.join(', ')}).{' '}
            {current.ok
              ? `P${current.process} can get everything it needs, run to completion, and release its Allocation (${input.allocation[current.process].join(', ')}).`
              : `P${current.process} might have to wait, so skip it for now and try the next process.`}
          </Callout>
        ) : finishedCheck ? (
          result.safe ? (
            <Callout tone="good">
              <strong>Safe.</strong> Safe sequence: {result.sequence.map((i) => `P${i}`).join(', ')}. Even if every process asks for
              its maximum, they can all finish in this order.
            </Callout>
          ) : (
            <Callout tone="bad">
              <strong>Unsafe.</strong> {result.sequence.length ? `Only ${result.sequence.map((i) => `P${i}`).join(', ')} can finish. ` : ''}
              No remaining process's Need fits in Work. The banker would refuse any request leading here.
            </Callout>
          )
        ) : (
          <Callout>Press "Start safety check" to walk through the algorithm one comparison at a time.</Callout>
        )}
        <Challenges
          items={challenges.deadlock.slice(2)}
          met={{
            'ch-dl-safe': finishedCheck && result.safe,
            'ch-dl-unsafe': finishedCheck && !result.safe,
          }}
        />
      </div>
    </Card>
  )
}
