import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { SimControls } from '../../components/SimControls'
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
import { Challenges } from '../../components/Challenges'
import { useChallenges } from '../../data/challenges'
import { useQuiz } from '../../data/quizzes'
import { ltr, useText } from '../../i18n'
import { useSimulation } from '../../hooks/useSimulation'
import { codecs, useUrlState, type Codec } from '../../hooks/useUrlState'
import { memoryText, type AllocMsg } from './pageText'

export default function MemoryPage() {
  const t = useText(memoryText)
  const questions = useQuiz('memory')
  return (
    <TopicLayout topicId="memory" questions={questions} intro={t.intro} keyIdeas={t.keyIdeas}>
      <AddressTranslation />
      <PageReplacementLab />
      <AllocationLab />
    </TopicLayout>
  )
}

const PAGES = 8
const FRAMES = 8

function useMemoryChallenges(...ids: string[]) {
  return useChallenges('memory').filter((c) => ids.includes(c.id))
}
const fifoFaults = (refs: number[], frames: number) => pageReplacement(refs, frames, 'FIFO').at(-1)?.faults ?? 0

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

/** Page table as frame numbers per page, "-" for pages not in RAM. */
const tableCodec: Codec<PageTableEntry[]> = {
  format: (t) => t.map((e) => (e.valid ? e.frame : '-')).join('.'),
  parse: (s) => {
    const parts = s.split('.')
    if (parts.length !== PAGES) return undefined
    const t = parts.map((x) => (x === '-' ? { frame: null, valid: false } : { frame: Number(x), valid: true }))
    const frames = t.filter((e) => e.valid).map((e) => e.frame!)
    const ok = frames.every((f) => Number.isInteger(f) && f >= 0 && f < FRAMES) && new Set(frames).size === frames.length
    return ok ? t : undefined
  },
}

function AddressTranslation() {
  const t = useText(memoryText).tr
  const challenges = useMemoryChallenges('ch-mem-fault')
  const [pageSize, setPageSize] = useUrlState('pagesize', 256, codecs.intOneOf([256, 1024, 4096]))
  const [table, setTable] = useUrlState('table', initialTable(), tableCodec)
  const [input, setInput] = useUrlState('address', '820', codecs.text(12))
  const parsed = input.trim().toLowerCase().startsWith('0x') ? parseInt(input, 16) : parseInt(input, 10)
  const limit = PAGES * pageSize
  const valid = Number.isFinite(parsed) && parsed >= 0
  const tr = valid ? translate(parsed, pageSize, table) : null
  const used = new Set(table.filter((e) => e.valid).map((e) => e.frame))
  const [lastLoaded, setLastLoaded] = useState<number | null>(null)
  const [handledFault, setHandledFault] = useState(false)

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
    setHandledFault(true)
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
      id="translation"
      share
      title={t.title}
      subtitle={t.subtitle}
      actions={
        <Segmented
          label={t.pageSize}
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
        <Field label={t.addrLabel(limit - 1)}>
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
          <div className="inline-flex items-stretch gap-1 font-mono text-sm" dir="ltr">
            <div className="rounded-s-xl bg-emerald-500/20 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-muted">{t.pageBits(tr.pageBits)}</div>
              <div className="font-bold">{binary.slice(0, totalBits - tr.offsetBits)}</div>
              <div className="text-xs">= {tr.page}</div>
            </div>
            <div className="rounded-e-xl bg-sky-500/20 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-muted">{t.offsetBits(tr.offsetBits)}</div>
              <div className="font-bold">{binary.slice(totalBits - tr.offsetBits)}</div>
              <div className="text-xs">= {tr.offset}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <MemColumn
          title={t.virtualPages}
          count={PAGES}
          highlight={tr && !tr.outOfRange ? tr.page : null}
          label={t.page}
          sub={(i) => ltr(`${i * pageSize}-${(i + 1) * pageSize - 1}`)}
          tone="emerald"
        />
        <FlowArrow />
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t.tableTitle}</div>
          <table className="w-full font-mono text-sm">
            <thead className="text-xs text-muted">
              <tr>
                {t.cols.map((c) => (
                  <th key={c} className="text-start font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((e, i) => (
                <tr
                  key={i}
                  tabIndex={0}
                  aria-label={t.rowLabel(i, e.valid ? e.frame : null)}
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
          title={t.physicalFrames}
          count={FRAMES}
          highlight={tr?.frame ?? null}
          label={t.frame}
          sub={(i) => {
            const p = table.findIndex((e) => e.valid && e.frame === i)
            return p >= 0 ? t.holds(p) : t.free
          }}
          tone="sky"
        />
      </div>

      <div className="mt-4">
        {!valid ? (
          <Callout tone="warn">{t.notNumber}</Callout>
        ) : tr?.outOfRange ? (
          <Callout tone="bad">{t.outOfRange(parsed, PAGES)}</Callout>
        ) : tr?.fault ? (
          <Callout tone="bad">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{t.fault(tr.page)}</span>
              <Button variant="danger" size="sm" onClick={handleFault}>
                {t.handle}
              </Button>
            </div>
          </Callout>
        ) : (
          tr && <Callout tone="good">{t.ok(tr.page, tr.frame!, pageSize, tr.offset, tr.physical!)}</Callout>
        )}
      </div>
      <div className="mt-4">
        <Challenges items={challenges} met={{ 'ch-mem-fault': handledFault }} />
      </div>
    </Card>
  )
}

function FlowArrow() {
  return (
    <div className="hidden self-center text-2xl text-muted lg:block rtl:-scale-x-100" aria-hidden="true">
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
  const t = useText(memoryText).rep
  const challenges = useMemoryChallenges('ch-mem-lru', 'ch-mem-belady')
  const [refText, setRefText] = useUrlState('refs', '7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1', codecs.text(120))
  const [frames, setFrames] = useUrlState('frames', 3, codecs.int(1, 6))
  const [algo, setAlgo] = useUrlState<ReplaceAlgo>('replace', 'FIFO', codecs.oneOf(['FIFO', 'LRU', 'OPT']))
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
      id="replacement"
      share
      title={t.title}
      subtitle={t.subtitle}
      actions={
        <Segmented
          label={t.algo}
          value={algo}
          onChange={setAlgo}
          options={[
            { value: 'FIFO', label: 'FIFO' },
            { value: 'LRU', label: 'LRU' },
            { value: 'OPT', label: t.optimal },
          ]}
        />
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <Field label={t.refs}>
          <input value={refText} onChange={(e) => setRefText(e.target.value)} className={cx(inputClass, 'w-80 max-w-full')} dir="ltr" />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">{t.frames}</span>
          <input type="range" min={1} max={6} value={frames} onChange={(e) => setFrames(Number(e.target.value))} />
          <span className="font-mono">{frames}</span>
        </label>
        <Button size="sm" onClick={() => setRefText('1 2 3 4 1 2 5 1 2 3 4 5')}>
          {t.belady}
        </Button>
      </div>

      <SimControls sim={sim} label={t.progress(shown, steps.length)} />

      <div className="mt-4 overflow-x-auto pb-2" dir="ltr">
        <table className="border-separate border-spacing-1 font-mono text-sm">
          <tbody>
            <tr>
              <th className="pe-2 text-start text-xs font-medium text-muted">{t.rowRef}</th>
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
                <th className="pe-2 text-start text-xs font-medium text-muted">{t.rowFrame(f)}</th>
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
              <th className="pe-2 text-start text-xs font-medium text-muted">{t.rowResult}</th>
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
              <Callout>{t.start}</Callout>
            ) : cur.hit ? (
              <Callout tone="good">{t.hit(cur.ref, cur.slot!)}</Callout>
            ) : cur.victim === null ? (
              <Callout tone="warn">{t.freeFrame(cur.ref, cur.slot!)}</Callout>
            ) : (
              <Callout tone="bad">{t.evict(cur.ref, algo, cur.victim)}</Callout>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="grid grid-cols-4 gap-2">
          <Stat label={t.faults} value={cur?.faults ?? 0} />
          {totals.map((x) => (
            <Stat key={x.a} label={t.total(x.a)} value={x.faults} />
          ))}
        </div>
      </div>
      <div className="mt-4">
        <Challenges
          items={challenges}
          met={{
            'ch-mem-lru': totals[0].faults - totals[1].faults >= 4,
            'ch-mem-belady': algo === 'FIFO' && fifoFaults(refs, frames + 1) > fifoFaults(refs, frames),
          }}
        />
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

/** Memory layout as "owner.size" blocks in address order; "-" marks a hole. */
const blocksCodec: Codec<MemBlock[]> = {
  format: (bs) => bs.map((b) => `${b.owner ?? '-'}.${b.size}`).join('_'),
  parse: (s) => {
    let start = 0
    const bs: MemBlock[] = []
    for (const part of s.split('_')) {
      const [owner, size] = part.split('.')
      const n = Number(size)
      if (!/^(-|OS|P\d{1,3})$/.test(owner) || !Number.isInteger(n) || n <= 0) return undefined
      bs.push({ start, size: n, owner: owner === '-' ? null : owner })
      start += n
    }
    return start === 100 ? bs : undefined
  },
}

const nextProcessNumber = (bs: MemBlock[]) => Math.max(0, ...bs.map((b) => (b.owner?.startsWith('P') ? Number(b.owner.slice(1)) : 0))) + 1

function AllocationLab() {
  const t = useText(memoryText).alloc
  const challenges = useMemoryChallenges('ch-mem-frag')
  const [blocks, setBlocks] = useUrlState('memory', initialMem(), blocksCodec)
  const [strategy, setStrategy] = useUrlState<FitStrategy>('fit', 'first', codecs.oneOf(['first', 'best', 'worst']))
  const [size, setSize] = useUrlState('size', 15, codecs.int(1, 100))
  const [counter, setCounter] = useState(() => nextProcessNumber(blocks))
  const [message, setMessage] = useState<{ tone: 'good' | 'bad' | 'info'; msg: AllocMsg } | null>(null)
  const [candidates, setCandidates] = useState<{ starts: number[]; chosen: number | null }>({ starts: [], chosen: null })
  const [fragFailure, setFragFailure] = useState(false)
  const frag = fragmentation(blocks)

  const doAlloc = () => {
    const name = `P${counter}`
    const res = allocate(blocks, name, size, strategy)
    setCandidates({ starts: res.candidates.map((i) => blocks[i].start), chosen: res.chosen === null ? null : blocks[res.chosen].start })
    if (!res.ok) {
      if (frag.totalFree >= size) setFragFailure(true)
      setMessage({
        tone: 'bad',
        msg:
          frag.totalFree >= size
            ? { k: 'fragFail', size, free: frag.totalFree, largest: frag.largest }
            : { k: 'noMem', size, free: frag.totalFree },
      })
      return
    }
    setBlocks(res.blocks)
    setCounter((c) => c + 1)
    setMessage({
      tone: 'good',
      msg: { k: 'placed', name, size, at: blocks[res.chosen!].start, holes: res.candidates.length, strategy },
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
    setMessage({ tone: 'info', msg: { k: 'fragmented' } })
  }

  const owners = [...new Set(blocks.map((b) => b.owner).filter((o): o is string => o !== null && o !== 'OS'))]

  return (
    <Card
      id="allocation"
      share
      title={t.title}
      subtitle={t.subtitle}
      actions={
        <Segmented
          label={t.fit}
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
        <Field label={t.size}>
          <input type="number" min={1} max={88} value={size} onChange={(e) => setSize(Math.max(1, Math.min(88, Number(e.target.value) || 1)))} className={cx(inputClass, 'w-28')} />
        </Field>
        <Button variant="primary" onClick={doAlloc}>
          {t.allocate(`P${counter}`)}
        </Button>
        <Button onClick={fragmentDemo}>{t.fragmented}</Button>
        <Button
          onClick={() => {
            setBlocks(initialMem())
            setCounter(1)
            setMessage(null)
            setCandidates({ starts: [], chosen: null })
          }}
        >
          {t.reset}
        </Button>
      </div>

      <div className="relative flex h-24 overflow-hidden rounded-2xl border border-line bg-surface-2" dir="ltr">
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
                setMessage({ tone: 'info', msg: { k: 'freed', owner: b.owner, size: b.size } })
              }}
              title={b.owner ? t.blockTitle(b.owner, b.size) : t.holeTitle(b.size)}
              className={cx(
                'relative flex flex-col items-center justify-center overflow-hidden border-e border-page text-xs font-semibold',
                b.owner ? 'text-white' : 'text-muted',
                isCandidate && 'ring-2 ring-inset ring-amber-500',
              )}
              style={{
                width: `${(b.size / MEM_SIZE) * 100}%`,
                background: color ?? 'repeating-linear-gradient(45deg, transparent 0 6px, color-mix(in srgb, var(--line) 60%, transparent) 6px 12px)',
              }}
            >
              <span>{b.owner ?? t.free}</span>
              <span className="font-mono opacity-80">{b.size}K</span>
            </motion.button>
          )
        })}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted" dir="ltr">
        <span>0 KB</span>
        <span>50 KB</span>
        <span>100 KB</span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
        <div>{message && <Callout tone={message.tone}>{t.msg(message.msg)}</Callout>}</div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label={t.freeTotal} value={`${frag.totalFree}K`} />
          <Stat label={t.largest} value={`${frag.largest}K`} />
          <Stat label={t.extFrag} value={`${Math.round(frag.external * 100)}%`} hint={t.extFragHint} />
        </div>
      </div>
      <div className="mt-4">
        <Challenges items={challenges} met={{ 'ch-mem-frag': fragFailure }} />
      </div>
    </Card>
  )
}
