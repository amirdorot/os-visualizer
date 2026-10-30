export type Op = 'LOCK' | 'LOAD' | 'ADD' | 'STORE' | 'UNLOCK'

export interface ThreadState {
  id: number
  pc: number
  reg: number
  iter: number
  blocked: boolean
  done: boolean
}

export interface RaceState {
  counter: number
  threads: ThreadState[]
  lockHolder: number | null
  useMutex: boolean
  iterations: number
  seed: number
  last: { thread: number; op: Op; blocked: boolean } | null
  steps: number
}

export function program(useMutex: boolean): Op[] {
  return useMutex ? ['LOCK', 'LOAD', 'ADD', 'STORE', 'UNLOCK'] : ['LOAD', 'ADD', 'STORE']
}

export const opText: Record<Op, string> = {
  LOCK: 'lock(&m)',
  LOAD: 'reg = counter',
  ADD: 'reg = reg + 1',
  STORE: 'counter = reg',
  UNLOCK: 'unlock(&m)',
}

export function initialRace(threads: number, iterations: number, useMutex: boolean, seed = 42): RaceState {
  return {
    counter: 0,
    threads: Array.from({ length: threads }, (_, id) => ({ id, pc: 0, reg: 0, iter: 0, blocked: false, done: false })),
    lockHolder: null,
    useMutex,
    iterations,
    seed,
    last: null,
    steps: 0,
  }
}

/** Deterministic PRNG (mulberry32) so a seed always replays the same interleaving. */
export function nextRandom(seed: number): [number, number] {
  const s = (seed + 0x6d2b79f5) | 0
  let t = s
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s]
}

export function isRunnable(s: RaceState, t: ThreadState) {
  return !t.done && !(t.blocked && s.lockHolder !== null && s.lockHolder !== t.id)
}

export function raceDone(s: RaceState) {
  return s.threads.every((t) => t.done)
}

export function expected(s: RaceState) {
  return s.threads.length * s.iterations
}

/** Execute the next instruction of thread `tid`. */
export function stepThread(s: RaceState, tid: number): RaceState {
  const t = s.threads[tid]
  if (!t || !isRunnable(s, t)) return s
  const prog = program(s.useMutex)
  const op = prog[t.pc]
  let counter = s.counter
  let lockHolder = s.lockHolder
  let next: ThreadState = { ...t, blocked: false }

  switch (op) {
    case 'LOCK':
      if (lockHolder !== null && lockHolder !== tid) {
        next.blocked = true
        return {
          ...s,
          threads: s.threads.map((x) => (x.id === tid ? next : x)),
          last: { thread: tid, op, blocked: true },
          steps: s.steps + 1,
        }
      }
      lockHolder = tid
      break
    case 'LOAD':
      next.reg = counter
      break
    case 'ADD':
      next.reg = next.reg + 1
      break
    case 'STORE':
      counter = next.reg
      break
    case 'UNLOCK':
      lockHolder = null
      break
  }

  next.pc++
  if (next.pc >= prog.length) {
    next = { ...next, pc: 0, iter: next.iter + 1 }
    if (next.iter >= s.iterations) next.done = true
  }

  const threads = s.threads.map((x) => (x.id === tid ? next : op === 'UNLOCK' ? { ...x, blocked: false } : x))
  return { ...s, counter, lockHolder, threads, last: { thread: tid, op, blocked: false }, steps: s.steps + 1 }
}

/** Let the "scheduler" pick a random runnable thread and run one instruction. */
export function stepRandom(s: RaceState): RaceState {
  const runnable = s.threads.filter((t) => isRunnable(s, t))
  if (runnable.length === 0) return s
  const [r, seed] = nextRandom(s.seed)
  const pick = runnable[Math.floor(r * runnable.length)]
  return { ...stepThread(s, pick.id), seed }
}
