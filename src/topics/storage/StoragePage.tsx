import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { SimControls } from '../../components/SimControls'
import { TopicLayout } from '../../components/TopicLayout'
import { Button, Callout, Card, Field, Segmented, Stat } from '../../components/ui'
import { cx, inputClass } from '../../lib/utils'
import { jobColors } from '../../data/palette'
import {
  appendBlock,
  createFile,
  createFs,
  diskSchedule,
  META,
  mkdir,
  pathOf,
  remove,
  ROOT,
  type AllocMethod,
  type DiskAlgo,
  type FileSystem,
  type FsResult,
} from '../../engines/storage'
import { Challenges } from '../../components/Challenges'
import { useChallenges } from '../../data/challenges'
import { useQuiz } from '../../data/quizzes'
import { useSimulation } from '../../hooks/useSimulation'
import { codecs, useUrlState } from '../../hooks/useUrlState'
import { useBidi, useText } from '../../i18n'
import { storageText } from './pageText'

function usePick() {
  const challenges = useChallenges('storage')
  return (...ids: string[]) => challenges.filter((c) => ids.includes(c.id))
}

export default function StoragePage() {
  const t = useText(storageText)
  const questions = useQuiz('storage')
  return (
    <TopicLayout topicId="storage" questions={questions} intro={t.intro} keyIdeas={t.keyIdeas}>
      <FileSystemLab />
      <AllocationComparison />
      <DiskSchedulingLab />
    </TopicLayout>
  )
}

function seed(method: AllocMethod): FileSystem {
  let fs = createFs(method)
  const steps: ((f: FileSystem) => FsResult)[] = [
    (f) => mkdir(f, ROOT, 'etc'),
    (f) => mkdir(f, ROOT, 'home'),
    (f) => createFile(f, 1, 'passwd', 2),
    (f) => createFile(f, 2, 'notes.txt', 3),
    (f) => createFile(f, 2, 'photo.jpg', 5),
    (f) => createFile(f, ROOT, 'kernel', 4),
  ]
  for (const s of steps) fs = s(fs).fs
  // Delete one file so that free space starts out fragmented.
  return remove(fs, 4).fs
}

function inodeColor(id: number) {
  return jobColors[(id * 3) % jobColors.length]
}

function FileSystemLab() {
  const t = useText(storageText)
  const fix = useBidi()
  const pick = usePick()
  const [method, setMethod] = useUrlState<AllocMethod>('allocation', 'contiguous', codecs.oneOf(['contiguous', 'linked', 'indexed']))
  const [fs, setFs] = useState(() => seed(method))
  const [selected, setSelected] = useState<number>(5)
  const [cwd, setCwd] = useState<number>(ROOT)
  const [name, setName] = useState('report.pdf')
  const [size, setSize] = useState(4)
  const [result, setResult] = useState<FsResult | null>(null)
  const [growFailed, setGrowFailed] = useState(false)
  const sel = fs.inodes[selected]
  const scattered =
    method === 'linked' && Object.values(fs.inodes).some((n) => n.type === 'file' && n.blocks.some((b, i) => i > 0 && b !== n.blocks[i - 1] + 1))

  const apply = (r: FsResult, select?: number) => {
    setResult(r)
    if (r.ok) {
      setFs(r.fs)
      if (select !== undefined) setSelected(select)
    }
  }

  const changeMethod = (m: AllocMethod) => {
    setMethod(m)
    setFs(seed(m))
    setSelected(5)
    setCwd(ROOT)
    setResult(null)
  }

  const touched = new Set(result?.ok ? result.touched : [])
  const used = fs.disk.filter((b) => b !== null).length

  return (
    <Card
      id="explorer"
      share
      title={t.explorerTitle}
      subtitle={t.explorerSubtitle}
      actions={
        <Segmented
          label={t.methodLabel}
          value={method}
          onChange={changeMethod}
          options={[
            { value: 'contiguous', label: 'Contiguous' },
            { value: 'linked', label: 'Linked' },
            { value: 'indexed', label: 'Indexed' },
          ]}
        />
      }
    >
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <div className="grid content-start gap-4">
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{t.dirTree}</div>
            <div className="rounded-xl border border-line bg-surface-2 p-2">
              <Tree fs={fs} id={ROOT} selected={selected} cwd={cwd} onSelect={(id) => {
                setSelected(id)
                if (fs.inodes[id].type === 'dir') setCwd(id)
              }} />
            </div>
          </div>
          <div className="grid gap-2 rounded-xl border border-line bg-surface-2 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              {t.inDir} <span className="font-mono normal-case" dir="ltr">{pathOf(fs, cwd)}</span>
            </div>
            <Field label={t.name}>
              <input value={name} onChange={(e) => setName(e.target.value.replace(/[/\s]/g, ''))} className={inputClass} />
            </Field>
            <Field label={t.size(size)}>
              <input type="range" min={1} max={8} value={size} onChange={(e) => setSize(Number(e.target.value))} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="primary" onClick={() => apply(createFile(fs, cwd, name, size), fs.nextInode)}>
                {t.newFile}
              </Button>
              <Button size="sm" onClick={() => apply(mkdir(fs, cwd, name), fs.nextInode)}>
                {t.newFolder}
              </Button>
            </div>
          </div>
          {sel && sel.id !== ROOT && (
            <div className="flex flex-wrap gap-2">
              {sel.type === 'file' && (
                <Button
                  size="sm"
                  onClick={() => {
                    const r = appendBlock(fs, sel.id)
                    if (!r.ok && method === 'contiguous') setGrowFailed(true)
                    apply(r)
                  }}
                >
                  {t.append}
                </Button>
              )}
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  const parent = sel.parent ?? ROOT
                  apply(remove(fs, sel.id), parent)
                  setCwd(parent)
                }}
              >
                {sel.type === 'dir' ? t.deleteFolder : t.deleteFile}
              </Button>
            </div>
          )}
        </div>

        <div className="grid content-start gap-4">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted">
              <span>{t.diskBlocks}</span>
              <span className="normal-case tracking-normal">
                {t.used(used, fs.disk.length)}
              </span>
            </div>
            <div className="grid grid-cols-8 gap-1.5" dir="ltr">
              {fs.disk.map((owner, b) => {
                const isSel = sel && owner === sel.id
                const isIndex = owner !== null && owner !== META && fs.inodes[owner]?.indexBlock === b
                const order = isSel && !isIndex ? sel.blocks.indexOf(b) : -1
                return (
                  <motion.button
                    key={b}
                    type="button"
                    onClick={() => owner !== null && owner !== META && setSelected(owner)}
                    animate={touched.has(b) ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                    transition={{ duration: 0.4 }}
                    title={owner === null ? t.blockFree(b) : owner === META ? (b === 0 ? t.blockSuperblock(b) : t.blockInodeTable(b)) : t.blockOwner(b, fs.inodes[owner]?.name)}
                    className={cx(
                      'relative flex aspect-square flex-col items-center justify-center rounded-lg border font-mono text-[10px] sm:text-xs',
                      owner === null && 'border-dashed border-line text-muted',
                      owner === META && 'border-slate-500 bg-slate-500/30',
                      owner !== null && owner !== META && 'border-transparent text-white',
                      isSel && 'ring-2 ring-ink ring-offset-2 ring-offset-surface',
                      sel && owner !== null && owner !== META && !isSel && 'opacity-50',
                    )}
                    style={owner !== null && owner !== META ? { background: inodeColor(owner) } : undefined}
                  >
                    <span className="absolute start-1 top-0.5 text-[9px] opacity-70">{b}</span>
                    <span className="font-bold">
                      {owner === META ? (b === 0 ? 'SB' : 'IT') : isIndex ? 'IDX' : order >= 0 ? `#${order}` : ''}
                    </span>
                    {method === 'linked' && fs.next[b] !== null && <span className="text-[9px] opacity-90">{fs.next[b] === -1 ? t.end : `->${fs.next[b]}`}</span>}
                  </motion.button>
                )
              })}
            </div>
            <p className="mt-1 text-xs text-muted">{t.blocksLegend}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{fix(t.inodeTitle(sel?.id ?? '-'))}</div>
              {sel ? (
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
                  <dt className="text-muted">{t.rows.path}</dt>
                  <dd className="break-all">
                    <span dir="ltr">{pathOf(fs, sel.id)}</span>
                  </dd>
                  <dt className="text-muted">{t.rows.type}</dt>
                  <dd>{t.types[sel.type]}</dd>
                  {sel.type === 'file' ? (
                    <>
                      <dt className="text-muted">{t.rows.size}</dt>
                      <dd>{t.sizeValue(sel.blocks.length)}</dd>
                      {method === 'contiguous' && (
                        <>
                          <dt className="text-muted">{t.rows.startLength}</dt>
                          <dd>
                            <span dir="ltr">
                              {sel.blocks[0]}, {sel.blocks.length}
                            </span>
                          </dd>
                        </>
                      )}
                      {method === 'linked' && (
                        <>
                          <dt className="text-muted">{t.rows.firstBlock}</dt>
                          <dd>{sel.blocks[0]}</dd>
                        </>
                      )}
                      {method === 'indexed' && (
                        <>
                          <dt className="text-muted">{t.rows.indexBlock}</dt>
                          <dd>{sel.indexBlock}</dd>
                        </>
                      )}
                      <dt className="text-muted">{t.rows.dataBlocks}</dt>
                      <dd>
                        <span dir="ltr">[{sel.blocks.join(', ')}]</span>
                      </dd>
                    </>
                  ) : (
                    <>
                      <dt className="text-muted">{t.rows.entries}</dt>
                      <dd>{sel.children.length ? <span dir="ltr">{sel.children.map((c) => `${fs.inodes[c].name} -> ${c}`).join(', ')}</span> : t.empty}</dd>
                    </>
                  )}
                </dl>
              ) : (
                <p className="text-sm text-muted">{t.selectHint}</p>
              )}
            </div>
            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t.bitmapTitle}</div>
              <div className="grid gap-0.5 font-mono text-[10px]" dir="ltr" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                {fs.disk.map((o, b) => (
                  <span key={b} className={cx('rounded-sm text-center', o === null ? 'bg-emerald-500/20' : 'bg-rose-500/25', touched.has(b) && 'ring-1 ring-amber-500')}>
                    {o === null ? 0 : 1}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">{t.bitmapLegend}</p>
            </div>
          </div>

          {result && <Callout tone={result.ok ? 'good' : 'bad'}>{t.msg(result.msg)}</Callout>}
          <Challenges items={pick('ch-sto-grow', 'ch-sto-scatter')} met={{ 'ch-sto-grow': growFailed, 'ch-sto-scatter': scattered }} />
        </div>
      </div>
    </Card>
  )
}

function Tree({
  fs,
  id,
  selected,
  cwd,
  onSelect,
}: {
  fs: FileSystem
  id: number
  selected: number
  cwd: number
  onSelect: (id: number) => void
}) {
  const node = fs.inodes[id]
  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(id)}
        className={cx(
          'flex w-full items-center gap-2 rounded-md px-2 py-1 text-start font-mono text-sm',
          selected === id ? 'bg-sky-600 text-white' : 'hover:bg-surface',
        )}
      >
        <span className="size-2.5 shrink-0 rounded-sm" style={{ background: node.type === 'dir' ? 'transparent' : inodeColor(id), border: node.type === 'dir' ? '2px solid currentColor' : undefined }} />
        <span className="truncate">
          {node.name}
          {node.type === 'dir' && id !== ROOT ? '/' : ''}
        </span>
        {cwd === id && node.type === 'dir' && <span className="ms-auto text-[10px] uppercase opacity-70">cwd</span>}
      </button>
      {node.children.length > 0 && (
        <div className="ms-3 border-s border-line ps-2">
          {[...node.children]
            .sort((a, b) => fs.inodes[a].name.localeCompare(fs.inodes[b].name))
            .map((c) => (
              <Tree key={c} fs={fs} id={c} selected={selected} cwd={cwd} onSelect={onSelect} />
            ))}
        </div>
      )}
    </div>
  )
}

function AllocationComparison() {
  const t = useText(storageText)
  return (
    <Card title={t.compareTitle} subtitle={t.compareSubtitle}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-start text-xs uppercase tracking-wide text-muted">
            <tr>
              {t.compareHeaders.map((h) => (
                <th key={h} className="py-2 pe-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.compareRows.map((r) => (
              <tr key={r[0]} className="border-t border-line">
                {r.map((c, i) => (
                  <td key={i} className={cx('py-2 pe-3', i === 0 && 'font-semibold')}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted">{t.compareNote}</p>
    </Card>
  )
}

const MAX_CYL = 199

function parseList(s: string) {
  return s
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= MAX_CYL)
    .slice(0, 16)
}

function DiskSchedulingLab() {
  const t = useText(storageText)
  const pick = usePick()
  const [reqText, setReqText] = useUrlState('requests', '98, 183, 37, 122, 14, 124, 65, 67', codecs.text(120))
  const [head, setHead] = useUrlState('head', 53, codecs.int(0, MAX_CYL))
  const [algo, setAlgo] = useUrlState<DiskAlgo>('disk', 'FCFS', codecs.oneOf(['FCFS', 'SSTF', 'SCAN', 'CSCAN']))
  const [direction, setDirection] = useUrlState<'up' | 'down'>('direction', 'up', codecs.oneOf(['up', 'down']))
  const requests = useMemo(() => parseList(reqText), [reqText])
  const plan = useMemo(() => diskSchedule(requests, head, algo, MAX_CYL, direction), [requests, head, algo, direction])
  const compare = useMemo(
    () => (['FCFS', 'SSTF', 'SCAN', 'CSCAN'] as const).map((a) => ({ a, total: diskSchedule(requests, head, a, MAX_CYL, direction).total })),
    [requests, head, direction],
  )
  const maxTotal = Math.max(1, ...compare.map((c) => c.total))

  const sim = useSimulation({ initial: () => 0, step: (i) => i + 1, isDone: (i) => i >= plan.path.length - 1 })
  const { reset } = sim
  useEffect(() => reset(0), [plan, reset])
  const shown = Math.min(sim.state, plan.path.length - 1)
  const moved = plan.path.slice(0, shown + 1).reduce((acc, c, i, arr) => (i === 0 ? 0 : acc + Math.abs(c - arr[i - 1])), 0)

  const W = 800
  const rowH = 26
  const H = Math.max(plan.path.length, 2) * rowH + 30
  const x = (c: number) => 20 + (c / MAX_CYL) * (W - 40)
  const y = (i: number) => 24 + i * rowH
  const pts = plan.path.slice(0, shown + 1).map((c, i) => `${x(c)},${y(i)}`)

  return (
    <Card
      id="disk"
      share
      title={t.diskTitle}
      subtitle={t.diskSubtitle}
      actions={
        <Segmented
          label={t.algoLabel}
          value={algo}
          onChange={setAlgo}
          options={[
            { value: 'FCFS', label: 'FCFS' },
            { value: 'SSTF', label: 'SSTF' },
            { value: 'SCAN', label: 'SCAN' },
            { value: 'CSCAN', label: 'C-SCAN' },
          ]}
        />
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <Field label={t.queueLabel(MAX_CYL)}>
          <input value={reqText} onChange={(e) => setReqText(e.target.value)} className={cx(inputClass, 'w-80 max-w-full')} dir="ltr" />
        </Field>
        <Field label={t.headStart}>
          <input type="number" min={0} max={MAX_CYL} value={head} onChange={(e) => setHead(Math.max(0, Math.min(MAX_CYL, Number(e.target.value) || 0)))} className={cx(inputClass, 'w-24')} />
        </Field>
        {algo === 'SCAN' && (
          <Segmented
            label={t.direction}
            value={direction}
            onChange={setDirection}
            options={[
              { value: 'up', label: t.toward199 },
              { value: 'down', label: t.toward0 },
            ]}
          />
        )}
        <Button size="sm" onClick={() => setReqText(Array.from({ length: 8 }, () => Math.floor(Math.random() * 200)).join(', '))}>
          {t.randomRequests}
        </Button>
      </div>

      <SimControls sim={sim} label={t.moved(moved)} />

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface-2 p-2" dir="ltr">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img" aria-label={t.pathLabel(plan.path.slice(0, shown + 1))}>
          {[0, 50, 100, 150, 199].map((c) => (
            <g key={c}>
              <line x1={x(c)} x2={x(c)} y1={14} y2={H - 4} stroke="var(--line)" />
              <text x={x(c)} y={10} textAnchor="middle" fontSize={11} fill="var(--muted)">
                {c}
              </text>
            </g>
          ))}
          {requests.map((r, i) => (
            <circle key={`req-${i}`} cx={x(r)} cy={14} r={4} fill="var(--muted)" opacity={0.6} />
          ))}
          <polyline points={pts.join(' ')} fill="none" stroke="#0ea5e9" strokeWidth={2.5} strokeLinejoin="round" />
          {plan.path.slice(0, shown + 1).map((c, i) => {
            const isExtra = plan.extra.includes(i)
            return (
              <g key={i}>
                <circle cx={x(c)} cy={y(i)} r={i === shown ? 7 : 4.5} fill={i === 0 ? '#f59e0b' : isExtra ? 'var(--muted)' : '#0ea5e9'} />
                <text x={x(c) + 10} y={y(i) + 4} fontSize={11} fill="var(--ink)">
                  {c}
                  {i === 0 ? t.start : isExtra ? t.edge : ''}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]">
        <div className="grid content-start gap-2">
          <Stat label={t.total(algo === 'CSCAN' ? 'C-SCAN' : algo)} value={t.cylinders(plan.total)} />
          <p className="text-sm text-muted">
            {t.algoNotes[algo]}
          </p>
        </div>
        <div className="grid content-start gap-1.5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t.compareMovement}</div>
          {compare.map((c) => (
            <div key={c.a} className="grid grid-cols-[60px_1fr_60px] items-center gap-2 text-sm">
              <span className={cx('font-mono', c.a === algo && 'font-bold')}>{c.a === 'CSCAN' ? 'C-SCAN' : c.a}</span>
              <div className="h-3 overflow-hidden rounded-full bg-surface-2">
                <motion.div className={cx('h-full rounded-full', c.a === algo ? 'bg-sky-500' : 'bg-muted/50')} animate={{ width: `${(c.total / maxTotal) * 100}%` }} />
              </div>
              <span className="text-end font-mono">{c.total}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <Challenges items={pick('ch-sto-sstf')} met={{ 'ch-sto-sstf': requests.length > 1 && compare[1].total * 3 < compare[0].total }} />
      </div>
    </Card>
  )
}
