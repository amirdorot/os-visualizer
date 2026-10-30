import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { SimControls } from '../../components/SimControls'
import { Term } from '../../components/Term'
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
import { useSimulation } from '../../hooks/useSimulation'
import { storageQuiz } from './quiz'

export default function StoragePage() {
  return (
    <TopicLayout
      topicId="storage"
      questions={storageQuiz}
      intro={
        <>
          A disk is just a long array of numbered <Term k="block">blocks</Term>. The file system builds files and folders
          on top of it: <Term k="inode">inodes</Term> describe files, directories map names to inodes, and a{' '}
          <Term k="bitmap">free-block bitmap</Term> tracks which blocks are in use.
        </>
      }
      keyIdeas={[
        <>
          <strong>Allocation method</strong> decides which blocks a file gets: contiguous, linked chain, or an index block
          of pointers.
        </>,
        <>
          <strong>Deleting a file</strong> only frees its inode and blocks; the bytes stay on disk until reused.
        </>,
        <>
          <strong>Disk scheduling</strong> reorders pending requests to cut <Term k="seek">seek time</Term> on spinning
          disks.
        </>,
      ]}
    >
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
  const [method, setMethod] = useState<AllocMethod>('contiguous')
  const [fs, setFs] = useState(() => seed('contiguous'))
  const [selected, setSelected] = useState<number>(5)
  const [cwd, setCwd] = useState<number>(ROOT)
  const [name, setName] = useState('report.pdf')
  const [size, setSize] = useState(4)
  const [result, setResult] = useState<FsResult | null>(null)
  const sel = fs.inodes[selected]

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
      title="File system explorer"
      subtitle="Create, grow and delete files and watch the inodes, directory tree, disk blocks and bitmap change together."
      actions={
        <Segmented
          label="Allocation method"
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
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Directory tree</div>
            <div className="rounded-xl border border-line bg-surface-2 p-2">
              <Tree fs={fs} id={ROOT} selected={selected} cwd={cwd} onSelect={(id) => {
                setSelected(id)
                if (fs.inodes[id].type === 'dir') setCwd(id)
              }} />
            </div>
          </div>
          <div className="grid gap-2 rounded-xl border border-line bg-surface-2 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              In <span className="font-mono normal-case">{pathOf(fs, cwd)}</span>
            </div>
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value.replace(/[/\s]/g, ''))} className={inputClass} />
            </Field>
            <Field label={`Size: ${size} block(s)`}>
              <input type="range" min={1} max={8} value={size} onChange={(e) => setSize(Number(e.target.value))} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="primary" onClick={() => apply(createFile(fs, cwd, name, size), fs.nextInode)}>
                New file
              </Button>
              <Button size="sm" onClick={() => apply(mkdir(fs, cwd, name), fs.nextInode)}>
                New folder
              </Button>
            </div>
          </div>
          {sel && sel.id !== ROOT && (
            <div className="flex flex-wrap gap-2">
              {sel.type === 'file' && (
                <Button size="sm" onClick={() => apply(appendBlock(fs, sel.id))}>
                  Append a block
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
                Delete {sel.type === 'dir' ? 'folder' : 'file'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid content-start gap-4">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted">
              <span>Disk blocks</span>
              <span className="normal-case tracking-normal">
                {used}/{fs.disk.length} used
              </span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
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
                    title={owner === null ? `block ${b}: free` : owner === META ? `block ${b}: ${b === 0 ? 'superblock' : 'inode table'}` : `block ${b}: ${fs.inodes[owner]?.name}`}
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
                    <span className="absolute left-1 top-0.5 text-[9px] opacity-70">{b}</span>
                    <span className="font-bold">
                      {owner === META ? (b === 0 ? 'SB' : 'IT') : isIndex ? 'IDX' : order >= 0 ? `#${order}` : ''}
                    </span>
                    {method === 'linked' && fs.next[b] !== null && <span className="text-[9px] opacity-90">{fs.next[b] === -1 ? 'end' : `->${fs.next[b]}`}</span>}
                  </motion.button>
                )
              })}
            </div>
            <p className="mt-1 text-xs text-muted">SB = superblock, IT = inode table. Click a block to select its file.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Inode {sel?.id ?? '-'}</div>
              {sel ? (
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
                  <dt className="text-muted">path</dt>
                  <dd className="break-all">{pathOf(fs, sel.id)}</dd>
                  <dt className="text-muted">type</dt>
                  <dd>{sel.type}</dd>
                  {sel.type === 'file' ? (
                    <>
                      <dt className="text-muted">size</dt>
                      <dd>
                        {sel.blocks.length} blocks ({sel.blocks.length * 4} KiB)
                      </dd>
                      {method === 'contiguous' && (
                        <>
                          <dt className="text-muted">start, length</dt>
                          <dd>
                            {sel.blocks[0]}, {sel.blocks.length}
                          </dd>
                        </>
                      )}
                      {method === 'linked' && (
                        <>
                          <dt className="text-muted">first block</dt>
                          <dd>{sel.blocks[0]}</dd>
                        </>
                      )}
                      {method === 'indexed' && (
                        <>
                          <dt className="text-muted">index block</dt>
                          <dd>{sel.indexBlock}</dd>
                        </>
                      )}
                      <dt className="text-muted">data blocks</dt>
                      <dd>[{sel.blocks.join(', ')}]</dd>
                    </>
                  ) : (
                    <>
                      <dt className="text-muted">entries</dt>
                      <dd>{sel.children.map((c) => `${fs.inodes[c].name} -> ${c}`).join(', ') || '(empty)'}</dd>
                    </>
                  )}
                </dl>
              ) : (
                <p className="text-sm text-muted">Select a file or folder.</p>
              )}
            </div>
            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Free-block bitmap</div>
              <div className="grid gap-0.5 font-mono text-[10px]" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                {fs.disk.map((o, b) => (
                  <span key={b} className={cx('rounded-sm text-center', o === null ? 'bg-emerald-500/20' : 'bg-rose-500/25', touched.has(b) && 'ring-1 ring-amber-500')}>
                    {o === null ? 0 : 1}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">1 = used, 0 = free. The allocator scans this to find space.</p>
            </div>
          </div>

          {result && <Callout tone={result.ok ? 'good' : 'bad'}>{result.message}</Callout>}
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
          'flex w-full items-center gap-2 rounded-md px-2 py-1 text-left font-mono text-sm',
          selected === id ? 'bg-sky-600 text-white' : 'hover:bg-surface',
        )}
      >
        <span className="size-2.5 shrink-0 rounded-sm" style={{ background: node.type === 'dir' ? 'transparent' : inodeColor(id), border: node.type === 'dir' ? '2px solid currentColor' : undefined }} />
        <span className="truncate">
          {node.name}
          {node.type === 'dir' && id !== ROOT ? '/' : ''}
        </span>
        {cwd === id && node.type === 'dir' && <span className="ml-auto text-[10px] uppercase opacity-70">cwd</span>}
      </button>
      {node.children.length > 0 && (
        <div className="ml-3 border-l border-line pl-2">
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
  const rows = [
    ['Contiguous', 'start block + length', 'Excellent', 'Excellent', 'Hard: next block may be taken', 'Yes (external)'],
    ['Linked', 'first block; each block points to the next', 'Good', 'Poor: must follow the chain', 'Easy', 'No'],
    ['Indexed', 'an index block listing all data blocks', 'Good', 'Good: one lookup', 'Easy until the index fills', 'No'],
  ]
  return (
    <Card title="Allocation methods compared" subtitle="Switch the method in the explorer above and try growing a file to feel the difference.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              {['Method', 'Inode stores', 'Sequential read', 'Random access', 'Growing a file', 'Fragmentation'].map((h) => (
                <th key={h} className="py-2 pr-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className="border-t border-line">
                {r.map((c, i) => (
                  <td key={i} className={cx('py-2 pr-3', i === 0 && 'font-semibold')}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted">
        Real systems mix these ideas: ext4 uses <em>extents</em> (contiguous runs) described by an index tree, and classic
        Unix inodes have direct pointers plus single, double and triple indirect blocks.
      </p>
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
  const [reqText, setReqText] = useState('98, 183, 37, 122, 14, 124, 65, 67')
  const [head, setHead] = useState(53)
  const [algo, setAlgo] = useState<DiskAlgo>('FCFS')
  const [direction, setDirection] = useState<'up' | 'down'>('up')
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
      title="Disk scheduling"
      subtitle="The disk head must visit every pending cylinder. Different orders mean very different amounts of head movement."
      actions={
        <Segmented
          label="Disk scheduling algorithm"
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
        <Field label={`Request queue (cylinders 0-${MAX_CYL})`}>
          <input value={reqText} onChange={(e) => setReqText(e.target.value)} className={cx(inputClass, 'w-80 max-w-full')} />
        </Field>
        <Field label="Head starts at">
          <input type="number" min={0} max={MAX_CYL} value={head} onChange={(e) => setHead(Math.max(0, Math.min(MAX_CYL, Number(e.target.value) || 0)))} className={cx(inputClass, 'w-24')} />
        </Field>
        {algo === 'SCAN' && (
          <Segmented
            label="Initial direction"
            value={direction}
            onChange={setDirection}
            options={[
              { value: 'up', label: 'Toward 199' },
              { value: 'down', label: 'Toward 0' },
            ]}
          />
        )}
        <Button size="sm" onClick={() => setReqText(Array.from({ length: 8 }, () => Math.floor(Math.random() * 200)).join(', '))}>
          Random requests
        </Button>
      </div>

      <SimControls sim={sim} label={`head movement: ${moved} cylinders`} />

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface-2 p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img" aria-label={`Disk head path: ${plan.path.slice(0, shown + 1).join(' to ')}`}>
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
                  {i === 0 ? ' (start)' : isExtra ? ' (edge)' : ''}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]">
        <div className="grid content-start gap-2">
          <Stat label={`${algo} total`} value={`${plan.total} cylinders`} />
          <p className="text-sm text-muted">
            {algo === 'FCFS' && 'Serves requests in arrival order. Fair, but the head zig-zags wildly.'}
            {algo === 'SSTF' && 'Always goes to the closest pending request. Much less movement, but far-away requests can starve.'}
            {algo === 'SCAN' && 'The elevator algorithm: sweep in one direction to the edge, then reverse. Predictable waits.'}
            {algo === 'CSCAN' && 'Sweep up to the edge, jump back to cylinder 0 and sweep up again. More uniform wait times than SCAN.'}
          </p>
        </div>
        <div className="grid content-start gap-1.5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Compare total head movement</div>
          {compare.map((c) => (
            <div key={c.a} className="grid grid-cols-[60px_1fr_60px] items-center gap-2 text-sm">
              <span className={cx('font-mono', c.a === algo && 'font-bold')}>{c.a === 'CSCAN' ? 'C-SCAN' : c.a}</span>
              <div className="h-3 overflow-hidden rounded-full bg-surface-2">
                <motion.div className={cx('h-full rounded-full', c.a === algo ? 'bg-sky-500' : 'bg-muted/50')} animate={{ width: `${(c.total / maxTotal) * 100}%` }} />
              </div>
              <span className="text-right font-mono">{c.total}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
