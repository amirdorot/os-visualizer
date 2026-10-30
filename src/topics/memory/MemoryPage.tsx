import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { SimControls } from '../../components/SimControls'
import { Term } from '../../components/Term'
import { TopicLayout } from '../../components/TopicLayout'
import { Button, Callout, Card, Field, Segmented, Stat } from '../../components/ui'
import { cx, inputClass } from '../../lib/utils'
import { jobColors } from '../../data/palette'
import {
  allocate,
  fragmentation,
  free,
  pageReplacement,
  translate,
  type FitStrategy,
  type MemBlock,
  type PageTableEntry,
  type ReplaceAlgo,
} from '../../engines/memory'
import { useSimulation } from '../../hooks/useSimulation'
import { memoryQuiz } from './quiz'

export default function MemoryPage() {
  return (
    <TopicLayout
      topicId="memory"
      questions={memoryQuiz}
      intro={
        <>
          Every process believes it has its own private memory starting at address 0. That illusion is{' '}
          <Term k="virtual">virtual memory</Term>: the MMU translates each address through a page table, and the OS moves{' '}
          <Term k="page">pages</Term> between RAM and disk on demand.
        </>
      }
      keyIdeas={[
        <>
          <strong>Address = page number + offset.</strong> Only the page number is translated; the offset is copied as-is.
        </>,
        <>
          <strong>Missing page?</strong> A <Term k="pagefault">page fault</Term> loads it from disk, evicting a victim
          chosen by the replacement policy.
        </>,
        <>
          <strong>Contiguous allocation</strong> suffers from <Term k="fragmentation">external fragmentation</Term>; paging
          avoids it.
        </>,
      ]}
    >
      <AddressTranslation />
      <PageReplacementLab />
      <AllocationLab />
    </TopicLayout>
  )
}

const PAGES = 8
const FRAMES = 8

function initialTable(): PageTableEntry[] {
  return [
    { frame: 3, valid: true },
    { frame: 6, valid: true },
    { frame: null, valid: false },
    { frame: 1, valid: true },
    { frame: null, valid: false },
    { frame: 4, valid: true },
    { frame: null, valid: false },
    { frame: 0, valid: true },
  ]
}

function bits(n: number, width: number) {
  return n.toString(2).padStart(width, '0')
}

function AddressTranslation() {
  const [pageSize, setPageSize] = useState(256)
  const [table, setTable] = useState(initialTable)
  const [input, setInput] = useState('820')
  const parsed = input.trim().toLowerCase().startsWith('0x') ? parseInt(input, 16) : parseInt(input, 10)
  const limit = PAGES * pageSize
  const valid = Number.isFinite(parsed) && parsed >= 0
  const tr = valid ? translate(parsed, pageSize, table) : null
  const used = new Set(table.filter((e) => e.valid).map((e) => e.frame))
  const [lastLoaded, setLastLoaded] = useState<number | null>(null)

  const handleFault = () => {
    if (!tr || !tr.fault) return
    let frame = [...Array(FRAMES).keys()].find((f) => !used.has(f))
    const next = table.map((e) => ({ ...e }))
    if (frame === undefined) {
      const victimPage = next.findIndex((e, i) => e.valid && i !== tr.page)
      frame = next[victimPage].frame!
      next[victimPage] = { frame: null, valid: false }
    }
    next[tr.page] = { frame, valid: true }
    setTable(next)
    setLastLoaded(tr.page)
  }

  const togglePage = (i: number) => {
    const next = table.map((e) => ({ ...e }))
    if (next[i].valid) next[i] = { frame: null, valid: false }
    else {
      const frame = [...Array(FRAMES).keys()].find((f) => !used.has(f))
      if (frame === undefined) return
      next[i] = { frame, valid: true }
    }
    setTable(next)
  }

  const totalBits = Math.log2(limit)
  const binary = tr && !tr.outOfRange ? bits(parsed, totalBits) : null

  return (
    <Card
      title="Virtual to physical address translation"
      subtitle="Type a virtual address (decimal or 0x hex). Click page-table rows to swap pages in or out."
      actions={
        <Segmented
          label="Page size"
          value={String(pageSize)}
          onChange={(v) => setPageSize(Number(v))}
          options={[
            { value: '256', label: '256 B' },
            { value: '1024', label: '1 KiB' },
            { value: '4096', label: '4 KiB' },
          ]}
        />
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <Field label={`Virtual address (0 - ${limit - 1})`}>
          <input value={input} onChange={(e) => setInput(e.target.value)} className={cx(inputClass, 'w-40')} />
        </Field>
        <div className="flex flex-wrap gap-2">
          {[0, Math.floor(pageSize * 1.5), pageSize * 2 + 5, pageSize * 5 + pageSize / 2, limit - 1].map((v) => (
            <Button key={v} size="sm" onClick={() => setInput(String(v))}>
              {v}
            </Button>
          ))}
        </div>
      </div>

      {binary && tr && (
        <div className="mb-5 overflow-x-auto">
          <div className="inline-flex items-stretch gap-1 font-mono text-sm">
            <div className="rounded-l-xl bg-emerald-500/20 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-muted">page ({tr.pageBits} bits)</div>
              <div className="font-bold">{binary.slice(0, totalBits - tr.offsetBits)}</div>
              <div className="text-xs">= {tr.page}</div>
            </div>
            <div className="rounded-r-xl bg-sky-500/20 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-muted">offset ({tr.offsetBits} bits)</div>
              <div className="font-bold">{binary.slice(totalBits - tr.offsetBits)}</div>
              <div className="text-xs">= {tr.offset}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <MemColumn title="Virtual pages" count={PAGES} highlight={tr && !tr.outOfRange ? tr.page : null} label={(i) => `Page ${i}`} sub={(i) => `${i * pageSize}-${(i + 1) * pageSize - 1}`} tone="emerald" />
        <FlowArrow />
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Page table (click a row)</div>
          <table className="w-full font-mono text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="text-left font-medium">page</th>
                <th className="text-left font-medium">frame</th>
                <th className="text-left font-medium">valid</th>
              </tr>
            </thead>
            <tbody>
              {table.map((e, i) => (
                <tr
                  key={i}
                  tabIndex={0}
                  aria-label={`Page ${i}: ${e.valid ? `in frame ${e.frame}` : 'not in memory'}. Press Enter to swap ${e.valid ? 'out' : 'in'}.`}
                  onClick={() => togglePage(i)}
                  onKeyDown={(ev) => {
                    if (ev.key === 'Enter' || ev.key === ' ') {
                      ev.preventDefault()
                      togglePage(i)
                    }
                  }}
                  className={cx(
                    'cursor-pointer border-t border-line transition-colors hover:bg-surface-2',
                    tr?.page === i && !tr.outOfRange && (tr.fault ? 'bg-rose-500/15' : 'bg-emerald-500/15'),
                    lastLoaded === i && 'animate-pulse',
                  )}
                >
                  <td className="py-1">{i}</td>
                  <td>{e.valid ? e.frame : '-'}</td>
                  <td className={e.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>{e.valid ? 'v' : 'i'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <FlowArrow />
        <MemColumn
          title="Physical frames (RAM)"
          count={FRAMES}
          highlight={tr?.frame ?? null}
          label={(i) => `Frame ${i}`}
          sub={(i) => {
            const p = table.findIndex((e) => e.valid && e.frame === i)
            return p >= 0 ? `holds page ${p}` : 'free'
          }}
          tone="sky"
        />
      </div>

      <div className="mt-4">
        {!valid ? (
          <Callout tone="warn">Enter a non-negative number.</Callout>
        ) : tr?.outOfRange ? (
          <Callout tone="bad">
            Address {parsed} is beyond the {PAGES}-page address space. The MMU raises a segmentation fault and the process is killed.
          </Callout>
        ) : tr?.fault ? (
          <Callout tone="bad">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>
                <strong>Page fault!</strong> Page {tr.page} is not in RAM. The kernel must load it from disk.
              </span>
              <Button variant="danger" size="sm" onClick={handleFault}>
                Handle page fault
              </Button>
            </div>
          </Callout>
        ) : (
          tr && (
            <Callout tone="good">
              Page {tr.page} lives in frame {tr.frame}. Physical address = {tr.frame} x {pageSize} + {tr.offset} ={' '}
              <strong className="font-mono">{tr.physical}</strong> (0x{tr.physical!.toString(16)}).
            </Callout>
          )
        )}
      </div>
    </Card>
  )
}

function FlowArrow() {
  return (
    <div className="hidden self-center text-2xl text-muted lg:block" aria-hidden="true">
      <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
        &rarr;
      </motion.span>
    </div>
  )
}

function MemColumn({
  title,
  count,
  highlight,
  label,
  sub,
  tone,
}: {
  title: string
  count: number
  highlight: number | null
  label: (i: number) => string
  sub: (i: number) => string
  tone: 'emerald' | 'sky'
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{title}</div>
      <div className="grid gap-1">
        {Array.from({ length: count }, (_, i) => (
          <motion.div
            key={i}
            animate={highlight === i ? { scale: 1.03 } : { scale: 1 }}
            className={cx(
              'flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm',
              highlight === i
                ? tone === 'emerald'
                  ? 'border-emerald-500 bg-emerald-500/20'
                  : 'border-sky-500 bg-sky-500/20'
                : 'border-line bg-surface-2',
            )}
          >
            <span className="font-medium">{label(i)}</span>
            <span className="font-mono text-xs text-muted">{sub(i)}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function parseRefs(s: string) {
  return s
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 0 && n < 100)
    .slice(0, 30)
}

function PageReplacementLab() {
  const [refText, setRefText] = useState('7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1')
  const [frames, setFrames] = useState(3)
  const [algo, setAlgo] = useState<ReplaceAlgo>('FIFO')
  const refs = useMemo(() => parseRefs(refText), [refText])
  const steps = useMemo(() => pageReplacement(refs, frames, algo), [refs, frames, algo])
  const totals = useMemo(
    () => (['FIFO', 'LRU', 'OPT'] as const).map((a) => ({ a, faults: pageReplacement(refs, frames, a).at(-1)?.faults ?? 0 })),
    [refs, frames],
  )

  const sim = useSimulation({ initial: () => 0, step: (i) => i + 1, isDone: (i) => i >= steps.length })
  const { reset } = sim
  useEffect(() => reset(0), [steps, reset])
  const shown = Math.min(sim.state, steps.length)
  const cur = steps[shown - 1]

  return (
    <Card
      title="Page replacement"
      subtitle="RAM has only a few frames. Step through the reference string and watch which page gets evicted on each fault."
      actions={
        <Segmented
          label="Replacement algorithm"
          value={algo}
          onChange={setAlgo}
          options={[
            { value: 'FIFO', label: 'FIFO' },
            { value: 'LRU', label: 'LRU' },
            { value: 'OPT', label: 'Optimal' },
          ]}
        />
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <Field label="Reference string (page numbers)">
          <input value={refText} onChange={(e) => setRefText(e.target.value)} className={cx(inputClass, 'w-80 max-w-full')} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Frames</span>
          <input type="range" min={1} max={6} value={frames} onChange={(e) => setFrames(Number(e.target.value))} />
          <span className="font-mono">{frames}</span>
        </label>
        <Button size="sm" onClick={() => setRefText('1 2 3 4 1 2 5 1 2 3 4 5')}>
          Belady example
        </Button>
      </div>

      <SimControls sim={sim} label={`reference ${shown}/${steps.length}`} />

      <div className="mt-4 overflow-x-auto pb-2">
        <table className="border-separate border-spacing-1 font-mono text-sm">
          <tbody>
            <tr>
              <th className="pr-2 text-left text-xs font-medium text-muted">ref</th>
              {refs.map((r, i) => (
                <td
                  key={i}
                  className={cx('size-9 rounded-md text-center font-bold', i === shown - 1 ? 'bg-emerald-500 text-white' : i < shown ? 'bg-surface-2' : 'text-muted')}
                >
                  {r}
                </td>
              ))}
            </tr>
            {Array.from({ length: frames }, (_, f) => (
              <tr key={f}>
                <th className="pr-2 text-left text-xs font-medium text-muted">frame {f}</th>
                {steps.map((s, i) => {
                  const visible = i < shown
                  const changed = !s.hit && s.slot === f
                  return (
                    <td
                      key={i}
                      className={cx(
                        'size-9 rounded-md border text-center',
                        !visible && 'border-transparent',
                        visible && (changed ? 'border-rose-500 bg-rose-500/15 font-bold' : s.hit && s.slot === f ? 'border-emerald-500 bg-emerald-500/15' : 'border-line'),
                      )}
                    >
                      {visible ? (s.frames[f] ?? '') : ''}
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr>
              <th className="pr-2 text-left text-xs font-medium text-muted">result</th>
              {steps.map((s, i) => (
                <td key={i} className={cx('text-center text-xs font-bold', s.hit ? 'text-emerald-500' : 'text-rose-500')}>
                  {i < shown ? (s.hit ? 'hit' : 'F') : ''}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto]">
        <AnimatePresence mode="wait">
          <motion.div key={shown} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
            {!cur ? (
              <Callout>Press play or step forward. Frames start empty, so the first references always fault.</Callout>
            ) : cur.hit ? (
              <Callout tone="good">Page {cur.ref} is already in frame {cur.slot}: a hit, no disk access needed.</Callout>
            ) : cur.victim === null ? (
              <Callout tone="warn">Page fault on {cur.ref}. A free frame ({cur.slot}) is available, so no eviction is needed.</Callout>
            ) : (
              <Callout tone="bad">
                Page fault on {cur.ref}. All frames are full, so {algo} evicts page {cur.victim}
                {algo === 'FIFO' && ' (the one loaded earliest)'}
                {algo === 'LRU' && ' (the one used least recently)'}
                {algo === 'OPT' && ' (the one needed furthest in the future)'}.
              </Callout>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="grid grid-cols-4 gap-2">
          <Stat label="Faults" value={cur?.faults ?? 0} />
          {totals.map((t) => (
            <Stat key={t.a} label={`${t.a} total`} value={t.faults} />
          ))}
        </div>
      </div>
    </Card>
  )
}

const MEM_SIZE = 100

function initialMem(): MemBlock[] {
  return [
    { start: 0, size: 12, owner: 'OS' },
    { start: 12, size: 88, owner: null },
  ]
}

function AllocationLab() {
  const [blocks, setBlocks] = useState(initialMem)
  const [strategy, setStrategy] = useState<FitStrategy>('first')
  const [size, setSize] = useState(15)
  const [counter, setCounter] = useState(1)
  const [message, setMessage] = useState<{ tone: 'good' | 'bad' | 'info'; text: string } | null>(null)
  const [candidates, setCandidates] = useState<{ starts: number[]; chosen: number | null }>({ starts: [], chosen: null })
  const frag = fragmentation(blocks)

  const doAlloc = () => {
    const name = `P${counter}`
    const res = allocate(blocks, name, size, strategy)
    setCandidates({ starts: res.candidates.map((i) => blocks[i].start), chosen: res.chosen === null ? null : blocks[res.chosen].start })
    if (!res.ok) {
      setMessage({
        tone: 'bad',
        text:
          frag.totalFree >= size
            ? `Allocation of ${size} KB failed even though ${frag.totalFree} KB is free in total: the largest hole is only ${frag.largest} KB. That is external fragmentation.`
            : `Allocation of ${size} KB failed: only ${frag.totalFree} KB is free.`,
      })
      return
    }
    setBlocks(res.blocks)
    setCounter((c) => c + 1)
    setMessage({
      tone: 'good',
      text: `${name} (${size} KB) placed at ${blocks[res.chosen!].start} KB. ${res.candidates.length} hole(s) were big enough; ${strategy}-fit chose the ${strategy === 'first' ? 'first one' : strategy === 'best' ? 'smallest one' : 'largest one'}.`,
    })
  }

  const fragmentDemo = () => {
    setBlocks([
      { start: 0, size: 12, owner: 'OS' },
      { start: 12, size: 10, owner: null },
      { start: 22, size: 14, owner: 'P1' },
      { start: 36, size: 6, owner: null },
      { start: 42, size: 18, owner: 'P2' },
      { start: 60, size: 12, owner: null },
      { start: 72, size: 8, owner: 'P3' },
      { start: 80, size: 20, owner: null },
    ])
    setCounter(4)
    setCandidates({ starts: [], chosen: null })
    setMessage({ tone: 'info', text: 'Memory is now fragmented into four holes of 10, 6, 12 and 20 KB. Try placing a 9 KB process with each strategy.' })
  }

  const owners = [...new Set(blocks.map((b) => b.owner).filter((o): o is string => o !== null && o !== 'OS'))]

  return (
    <Card
      title="Contiguous memory allocation"
      subtitle="Allocate processes into a 100 KB memory, click a process to free it, and watch holes appear."
      actions={
        <Segmented
          label="Fit strategy"
          value={strategy}
          onChange={setStrategy}
          options={[
            { value: 'first', label: 'First fit' },
            { value: 'best', label: 'Best fit' },
            { value: 'worst', label: 'Worst fit' },
          ]}
        />
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Field label="Process size (KB)">
          <input type="number" min={1} max={88} value={size} onChange={(e) => setSize(Math.max(1, Math.min(88, Number(e.target.value) || 1)))} className={cx(inputClass, 'w-28')} />
        </Field>
        <Button variant="primary" onClick={doAlloc}>
          Allocate P{counter}
        </Button>
        <Button onClick={fragmentDemo}>Load fragmented example</Button>
        <Button
          onClick={() => {
            setBlocks(initialMem())
            setCounter(1)
            setMessage(null)
            setCandidates({ starts: [], chosen: null })
          }}
        >
          Reset
        </Button>
      </div>

      <div className="relative flex h-24 overflow-hidden rounded-2xl border border-line bg-surface-2">
        {blocks.map((b) => {
          const color = b.owner === 'OS' ? '#64748b' : b.owner ? jobColors[owners.indexOf(b.owner) % jobColors.length] : undefined
          const isCandidate = b.owner === null && candidates.starts.includes(b.start)
          return (
            <motion.button
              layout
              key={`${b.start}-${b.owner}`}
              type="button"
              disabled={!b.owner || b.owner === 'OS'}
              onClick={() => {
                if (!b.owner || b.owner === 'OS') return
                setBlocks(free(blocks, b.owner))
                setCandidates({ starts: [], chosen: null })
                setMessage({ tone: 'info', text: `${b.owner} exited and freed ${b.size} KB. Adjacent holes are merged (coalesced).` })
              }}
              title={b.owner ? `${b.owner}: ${b.size} KB (click to free)` : `hole: ${b.size} KB`}
              className={cx(
                'relative flex flex-col items-center justify-center overflow-hidden border-r border-page text-xs font-semibold',
                b.owner ? 'text-white' : 'text-muted',
                isCandidate && 'ring-2 ring-inset ring-amber-500',
              )}
              style={{
                width: `${(b.size / MEM_SIZE) * 100}%`,
                background: color ?? 'repeating-linear-gradient(45deg, transparent 0 6px, color-mix(in srgb, var(--line) 60%, transparent) 6px 12px)',
              }}
            >
              <span>{b.owner ?? 'free'}</span>
              <span className="font-mono opacity-80">{b.size}K</span>
            </motion.button>
          )
        })}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted">
        <span>0 KB</span>
        <span>50 KB</span>
        <span>100 KB</span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
        <div>{message && <Callout tone={message.tone}>{message.text}</Callout>}</div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Free total" value={`${frag.totalFree}K`} />
          <Stat label="Largest hole" value={`${frag.largest}K`} />
          <Stat label="Ext. frag" value={`${Math.round(frag.external * 100)}%`} hint="1 - largest hole / total free" />
        </div>
      </div>
    </Card>
  )
}
