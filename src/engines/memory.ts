// ---------- Address translation ----------

export interface PageTableEntry {
  frame: number | null
  valid: boolean
}

export interface Translation {
  virtual: number
  page: number
  offset: number
  offsetBits: number
  pageBits: number
  frame: number | null
  physical: number | null
  fault: boolean
  outOfRange: boolean
}

export function translate(virtual: number, pageSize: number, table: PageTableEntry[]): Translation {
  const offsetBits = Math.log2(pageSize)
  const pageBits = Math.max(1, Math.ceil(Math.log2(table.length)))
  const page = Math.floor(virtual / pageSize)
  const offset = virtual % pageSize
  const entry = table[page]
  const outOfRange = !entry
  const fault = !outOfRange && (!entry.valid || entry.frame === null)
  const frame = !outOfRange && !fault ? entry.frame : null
  return {
    virtual,
    page,
    offset,
    offsetBits,
    pageBits,
    frame,
    physical: frame === null ? null : frame * pageSize + offset,
    fault,
    outOfRange,
  }
}

// ---------- Page replacement ----------

export type ReplaceAlgo = 'FIFO' | 'LRU' | 'OPT'

export interface ReplaceStep {
  ref: number
  frames: (number | null)[]
  hit: boolean
  /** Frame slot that was filled or replaced on a miss. */
  slot: number | null
  victim: number | null
  faults: number
}

export function pageReplacement(refs: number[], frameCount: number, algo: ReplaceAlgo): ReplaceStep[] {
  const frames: (number | null)[] = Array(frameCount).fill(null)
  const loadedAt: number[] = Array(frameCount).fill(-1)
  const lastUsed: number[] = Array(frameCount).fill(-1)
  const steps: ReplaceStep[] = []
  let faults = 0

  refs.forEach((ref, i) => {
    const at = frames.indexOf(ref)
    if (at >= 0) {
      lastUsed[at] = i
      steps.push({ ref, frames: [...frames], hit: true, slot: at, victim: null, faults })
      return
    }
    faults++
    let slot = frames.indexOf(null)
    let victim: number | null = null
    if (slot < 0) {
      if (algo === 'FIFO') slot = argMin(loadedAt)
      else if (algo === 'LRU') slot = argMin(lastUsed)
      else {
        const nextUse = frames.map((p) => {
          const n = refs.indexOf(p!, i + 1)
          return n < 0 ? Infinity : n
        })
        slot = argMax(nextUse)
      }
      victim = frames[slot]
    }
    frames[slot] = ref
    loadedAt[slot] = i
    lastUsed[slot] = i
    steps.push({ ref, frames: [...frames], hit: false, slot, victim, faults })
  })
  return steps
}

function argMin(a: number[]) {
  let best = 0
  for (let i = 1; i < a.length; i++) if (a[i] < a[best]) best = i
  return best
}

function argMax(a: number[]) {
  let best = 0
  for (let i = 1; i < a.length; i++) if (a[i] > a[best]) best = i
  return best
}

// ---------- Contiguous allocation ----------

export type FitStrategy = 'first' | 'best' | 'worst'

export interface MemBlock {
  start: number
  size: number
  owner: string | null
}

export interface AllocResult {
  blocks: MemBlock[]
  ok: boolean
  chosen: number | null
  /** Indices of holes that were big enough, for visualization. */
  candidates: number[]
}

export function allocate(blocks: MemBlock[], owner: string, size: number, strategy: FitStrategy): AllocResult {
  const candidates = blocks.map((b, i) => (b.owner === null && b.size >= size ? i : -1)).filter((i) => i >= 0)
  if (candidates.length === 0) return { blocks, ok: false, chosen: null, candidates }

  let chosen = candidates[0]
  if (strategy === 'best') chosen = candidates.reduce((a, b) => (blocks[b].size < blocks[a].size ? b : a))
  if (strategy === 'worst') chosen = candidates.reduce((a, b) => (blocks[b].size > blocks[a].size ? b : a))

  const hole = blocks[chosen]
  const parts: MemBlock[] = [{ start: hole.start, size, owner }]
  if (hole.size > size) parts.push({ start: hole.start + size, size: hole.size - size, owner: null })
  const next = [...blocks.slice(0, chosen), ...parts, ...blocks.slice(chosen + 1)]
  return { blocks: next, ok: true, chosen, candidates }
}

export function free(blocks: MemBlock[], owner: string): MemBlock[] {
  const released = blocks.map((b) => (b.owner === owner ? { ...b, owner: null } : b))
  const merged: MemBlock[] = []
  for (const b of released) {
    const last = merged[merged.length - 1]
    if (last && last.owner === null && b.owner === null) last.size += b.size
    else merged.push({ ...b })
  }
  return merged
}

export function fragmentation(blocks: MemBlock[]) {
  const holes = blocks.filter((b) => b.owner === null)
  const totalFree = holes.reduce((a, b) => a + b.size, 0)
  const largest = holes.reduce((a, b) => Math.max(a, b.size), 0)
  return { totalFree, largest, holes: holes.length, external: totalFree === 0 ? 0 : 1 - largest / totalFree }
}
