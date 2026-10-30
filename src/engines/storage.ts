// ---------- File system ----------

export type AllocMethod = 'contiguous' | 'linked' | 'indexed'

export interface Inode {
  id: number
  name: string
  type: 'file' | 'dir'
  /** Data blocks in file order. */
  blocks: number[]
  indexBlock: number | null
  parent: number | null
  children: number[]
}

export const META = -1

export interface FileSystem {
  method: AllocMethod
  /** Owner inode id per block, META for file system metadata, null if free. */
  disk: (number | null)[]
  /** Next-block pointers, used by linked allocation (-1 = end of file). */
  next: (number | null)[]
  inodes: Record<number, Inode>
  nextInode: number
}

export interface FsResult {
  fs: FileSystem
  ok: boolean
  message: string
  touched: number[]
}

export const ROOT = 0
export const MAX_INDEX = 8

export function createFs(method: AllocMethod, blocks = 48): FileSystem {
  const disk: (number | null)[] = Array(blocks).fill(null)
  disk[0] = META
  disk[1] = META
  return {
    method,
    disk,
    next: Array(blocks).fill(null),
    inodes: { [ROOT]: { id: ROOT, name: '/', type: 'dir', blocks: [], indexBlock: null, parent: null, children: [] } },
    nextInode: 1,
  }
}

function freeBlocks(fs: FileSystem) {
  return fs.disk.flatMap((o, i) => (o === null ? [i] : []))
}

function findRun(fs: FileSystem, n: number): number {
  let run = 0
  for (let i = 0; i < fs.disk.length; i++) {
    run = fs.disk[i] === null ? run + 1 : 0
    if (run === n) return i - n + 1
  }
  return -1
}

export function pathOf(fs: FileSystem, id: number): string {
  const parts: string[] = []
  let cur: Inode | undefined = fs.inodes[id]
  while (cur && cur.parent !== null) {
    parts.unshift(cur.name)
    cur = fs.inodes[cur.parent]
  }
  return '/' + parts.join('/')
}

function nameTaken(fs: FileSystem, parent: number, name: string) {
  return fs.inodes[parent].children.some((c) => fs.inodes[c].name === name)
}

function clone(fs: FileSystem): FileSystem {
  const inodes: Record<number, Inode> = {}
  for (const [k, v] of Object.entries(fs.inodes)) inodes[Number(k)] = { ...v, blocks: [...v.blocks], children: [...v.children] }
  return { ...fs, disk: [...fs.disk], next: [...fs.next], inodes }
}

export function mkdir(fs: FileSystem, parent: number, name: string): FsResult {
  if (!name) return { fs, ok: false, message: 'Name cannot be empty.', touched: [] }
  if (nameTaken(fs, parent, name)) return { fs, ok: false, message: `"${name}" already exists here.`, touched: [] }
  const f = clone(fs)
  const id = f.nextInode++
  f.inodes[id] = { id, name, type: 'dir', blocks: [], indexBlock: null, parent, children: [] }
  f.inodes[parent].children.push(id)
  return { fs: f, ok: true, message: `Created directory ${pathOf(f, id)} (inode ${id}). A directory is a list of name -> inode entries.`, touched: [] }
}

export function createFile(fs: FileSystem, parent: number, name: string, size: number): FsResult {
  if (!name) return { fs, ok: false, message: 'Name cannot be empty.', touched: [] }
  if (nameTaken(fs, parent, name)) return { fs, ok: false, message: `"${name}" already exists here.`, touched: [] }
  const free = freeBlocks(fs)
  let blocks: number[] = []
  let indexBlock: number | null = null

  if (fs.method === 'contiguous') {
    const start = findRun(fs, size)
    if (start < 0) {
      return {
        fs,
        ok: false,
        message: `No run of ${size} consecutive free blocks${free.length >= size ? ` (even though ${free.length} blocks are free: external fragmentation)` : ''}.`,
        touched: [],
      }
    }
    blocks = Array.from({ length: size }, (_, i) => start + i)
  } else if (fs.method === 'linked') {
    if (free.length < size) return { fs, ok: false, message: `Disk full: need ${size} blocks, ${free.length} free.`, touched: [] }
    blocks = free.slice(0, size)
  } else {
    if (size > MAX_INDEX) return { fs, ok: false, message: `An index block in this demo holds at most ${MAX_INDEX} pointers.`, touched: [] }
    if (free.length < size + 1) return { fs, ok: false, message: `Disk full: need ${size} data blocks plus 1 index block.`, touched: [] }
    indexBlock = free[0]
    blocks = free.slice(1, size + 1)
  }

  const f = clone(fs)
  const id = f.nextInode++
  f.inodes[id] = { id, name, type: 'file', blocks, indexBlock, parent, children: [] }
  f.inodes[parent].children.push(id)
  for (const b of blocks) f.disk[b] = id
  if (indexBlock !== null) f.disk[indexBlock] = id
  if (fs.method === 'linked') blocks.forEach((b, i) => (f.next[b] = blocks[i + 1] ?? -1))

  const detail =
    fs.method === 'contiguous'
      ? `blocks ${blocks[0]}-${blocks[blocks.length - 1]}`
      : fs.method === 'linked'
        ? `a chain starting at block ${blocks[0]}`
        : `index block ${indexBlock} pointing to [${blocks.join(', ')}]`
  return {
    fs: f,
    ok: true,
    message: `Created ${pathOf(f, id)}: inode ${id}, ${detail}. The free-block bitmap was updated.`,
    touched: indexBlock === null ? blocks : [indexBlock, ...blocks],
  }
}

export function appendBlock(fs: FileSystem, id: number): FsResult {
  const node = fs.inodes[id]
  if (!node || node.type !== 'file') return { fs, ok: false, message: 'Select a file first.', touched: [] }
  const free = freeBlocks(fs)
  let block: number

  if (fs.method === 'contiguous') {
    const after = (node.blocks.at(-1) ?? -1) + 1
    if (after >= fs.disk.length || fs.disk[after] !== null) {
      return {
        fs,
        ok: false,
        message: `Cannot grow ${node.name} in place: block ${after} is not free. Contiguous files must be moved to a larger hole to grow.`,
        touched: [],
      }
    }
    block = after
  } else {
    if (free.length === 0) return { fs, ok: false, message: 'Disk full.', touched: [] }
    if (fs.method === 'indexed' && node.blocks.length >= MAX_INDEX) {
      return { fs, ok: false, message: `The index block is full (${MAX_INDEX} pointers). Real file systems add indirect blocks.`, touched: [] }
    }
    block = free[0]
  }

  const f = clone(fs)
  const last = f.inodes[id].blocks.at(-1)
  f.inodes[id].blocks.push(block)
  f.disk[block] = id
  if (fs.method === 'linked') {
    if (last !== undefined) f.next[last] = block
    f.next[block] = -1
  }
  return { fs: f, ok: true, message: `Wrote one more block to ${node.name}: block ${block}.`, touched: [block] }
}

export function remove(fs: FileSystem, id: number): FsResult {
  if (id === ROOT) return { fs, ok: false, message: 'Cannot delete the root directory.', touched: [] }
  const f = clone(fs)
  const touched: number[] = []
  const drop = (nid: number) => {
    const n = f.inodes[nid]
    for (const c of n.children) drop(c)
    for (const b of [...n.blocks, ...(n.indexBlock !== null ? [n.indexBlock] : [])]) {
      f.disk[b] = null
      f.next[b] = null
      touched.push(b)
    }
    delete f.inodes[nid]
  }
  const node = f.inodes[id]
  const parent = f.inodes[node.parent!]
  parent.children = parent.children.filter((c) => c !== id)
  const path = pathOf(fs, id)
  drop(id)
  return {
    fs: f,
    ok: true,
    message: `Deleted ${path}. Its directory entry and inode were removed and ${touched.length} block(s) marked free. (The data itself is not erased!)`,
    touched,
  }
}

// ---------- Disk scheduling ----------

export type DiskAlgo = 'FCFS' | 'SSTF' | 'SCAN' | 'CSCAN'

export interface DiskPlan {
  path: number[]
  total: number
  /** Indices in `path` that are sweeps to the disk edge or wrap-around jumps rather than requests. */
  extra: number[]
}

export function diskSchedule(requests: number[], head: number, algo: DiskAlgo, maxCyl = 199, direction: 'up' | 'down' = 'up'): DiskPlan {
  const path = [head]
  const extra: number[] = []
  if (algo === 'FCFS') path.push(...requests)
  else if (algo === 'SSTF') {
    const pending = [...requests]
    let pos = head
    while (pending.length) {
      let best = 0
      for (let i = 1; i < pending.length; i++) if (Math.abs(pending[i] - pos) < Math.abs(pending[best] - pos)) best = i
      pos = pending.splice(best, 1)[0]
      path.push(pos)
    }
  } else {
    const up = requests.filter((r) => r >= head).sort((a, b) => a - b)
    const down = requests.filter((r) => r < head).sort((a, b) => b - a)
    if (algo === 'SCAN') {
      const [first, second, edge] = direction === 'up' ? [up, down, maxCyl] : [down, up.slice(), 0]
      path.push(...first)
      if (second.length) {
        if (path.at(-1) !== edge) {
          path.push(edge)
          extra.push(path.length - 1)
        }
        path.push(...(direction === 'up' ? second : second.sort((a, b) => a - b)))
      }
    } else {
      path.push(...up)
      if (down.length) {
        if (path.at(-1) !== maxCyl) {
          path.push(maxCyl)
          extra.push(path.length - 1)
        }
        path.push(0)
        extra.push(path.length - 1)
        path.push(...down.sort((a, b) => a - b).filter((r) => r !== 0))
      }
    }
  }
  let total = 0
  for (let i = 1; i < path.length; i++) total += Math.abs(path[i] - path[i - 1])
  return { path, total, extra }
}
