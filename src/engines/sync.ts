import { nextRandom } from './threads'

/** Bounded-buffer (producer-consumer) problem with counting semaphores. */

export type SemName = 'empty' | 'full' | 'mutex'

export type SyncOp =
  | { kind: 'produce' }
  | { kind: 'consume' }
  | { kind: 'wait'; sem: SemName }
  | { kind: 'signal'; sem: SemName }
  | { kind: 'put' }
  | { kind: 'take' }

export type Role = 'producer' | 'consumer'

export const programs: Record<'safe' | 'unsafe', Record<Role, SyncOp[]>> = {
  safe: {
    producer: [
      { kind: 'produce' },
      { kind: 'wait', sem: 'empty' },
      { kind: 'wait', sem: 'mutex' },
      { kind: 'put' },
      { kind: 'signal', sem: 'mutex' },
      { kind: 'signal', sem: 'full' },
    ],
    consumer: [
      { kind: 'wait', sem: 'full' },
      { kind: 'wait', sem: 'mutex' },
      { kind: 'take' },
      { kind: 'signal', sem: 'mutex' },
      { kind: 'signal', sem: 'empty' },
      { kind: 'consume' },
    ],
  },
  unsafe: {
    producer: [{ kind: 'produce' }, { kind: 'put' }],
    consumer: [{ kind: 'take' }, { kind: 'consume' }],
  },
}

export function opLabel(op: SyncOp): string {
  switch (op.kind) {
    case 'produce':
      return 'item = produce()'
    case 'consume':
      return 'consume(item)'
    case 'put':
      return 'buffer.put(item)'
    case 'take':
      return 'item = buffer.take()'
    case 'wait':
      return `wait(${op.sem})`
    case 'signal':
      return `signal(${op.sem})`
  }
}

export interface Actor {
  id: number
  role: Role
  /** Index of the next instruction in this actor's loop. */
  pc: number
  /** The item the actor is holding: just produced, or just taken. -1 means garbage read from an empty slot. */
  item: number | null
}

export interface SyncState {
  safe: boolean
  capacity: number
  buffer: number[]
  sems: Record<SemName, number>
  actors: Actor[]
  nextItem: number
  produced: number
  consumed: number
  steps: number
  stats: { producerBlocks: number; consumerBlocks: number; overflows: number; underflows: number }
  last: { actor: number; op: SyncOp; blocked: boolean; error?: 'overflow' | 'underflow' } | null
  seed: number
}

export function initialSync(opts: { safe: boolean; capacity?: number; producers?: number; consumers?: number; seed?: number }): SyncState {
  const capacity = opts.capacity ?? 3
  const producers = opts.producers ?? 1
  const consumers = opts.consumers ?? 1
  const actors: Actor[] = [
    ...Array.from({ length: producers }, (_, i) => ({ id: i, role: 'producer' as const, pc: 0, item: null })),
    ...Array.from({ length: consumers }, (_, i) => ({ id: producers + i, role: 'consumer' as const, pc: 0, item: null })),
  ]
  return {
    safe: opts.safe,
    capacity,
    buffer: [],
    sems: { empty: capacity, full: 0, mutex: 1 },
    actors,
    nextItem: 1,
    produced: 0,
    consumed: 0,
    steps: 0,
    stats: { producerBlocks: 0, consumerBlocks: 0, overflows: 0, underflows: 0 },
    last: null,
    seed: opts.seed ?? 11,
  }
}

export function program(s: SyncState, a: Actor) {
  return programs[s.safe ? 'safe' : 'unsafe'][a.role]
}

export function currentOp(s: SyncState, a: Actor): SyncOp {
  return program(s, a)[a.pc]
}

/** A thread is blocked when its next instruction is wait() on a semaphore whose value is 0. */
export function isBlocked(s: SyncState, a: Actor) {
  const op = currentOp(s, a)
  return op.kind === 'wait' && s.sems[op.sem] === 0
}

export function stepActor(s: SyncState, id: number): SyncState {
  const a = s.actors.find((x) => x.id === id)
  if (!a) return s
  const op = currentOp(s, a)
  const prog = program(s, a)

  if (isBlocked(s, a)) {
    const stats = { ...s.stats }
    if (op.kind === 'wait' && op.sem === 'empty') stats.producerBlocks++
    else if (op.kind === 'wait' && op.sem === 'full') stats.consumerBlocks++
    return { ...s, stats, last: { actor: id, op, blocked: true } }
  }

  const next = { ...a, pc: (a.pc + 1) % prog.length }
  let { buffer, sems, nextItem, produced, consumed } = s
  const stats = { ...s.stats }
  let error: 'overflow' | 'underflow' | undefined

  switch (op.kind) {
    case 'produce':
      next.item = nextItem++
      break
    case 'wait':
      sems = { ...sems, [op.sem]: sems[op.sem] - 1 }
      break
    case 'signal':
      sems = { ...sems, [op.sem]: sems[op.sem] + 1 }
      break
    case 'put':
      if (buffer.length >= s.capacity) {
        error = 'overflow'
        stats.overflows++
        // The item overwrites the oldest slot: data is silently lost.
        buffer = [...buffer.slice(1), next.item ?? -1]
      } else {
        buffer = [...buffer, next.item ?? -1]
      }
      produced++
      next.item = null
      break
    case 'take':
      if (buffer.length === 0) {
        error = 'underflow'
        stats.underflows++
        next.item = -1
      } else {
        next.item = buffer[0]
        buffer = buffer.slice(1)
      }
      break
    case 'consume':
      consumed++
      next.item = null
      break
  }

  return {
    ...s,
    buffer,
    sems,
    nextItem,
    produced,
    consumed,
    stats,
    steps: s.steps + 1,
    actors: s.actors.map((x) => (x.id === id ? next : x)),
    last: { actor: id, op, blocked: false, error },
  }
}

export function stepRandomSync(s: SyncState): SyncState {
  const runnable = s.actors.filter((a) => !isBlocked(s, a))
  if (runnable.length === 0) return s
  const [r, seed] = nextRandom(s.seed)
  return { ...stepActor(s, runnable[Math.floor(r * runnable.length)].id), seed }
}

/** Plain counting semaphore used by the practice generator: returns the final value and how many threads are left blocked. */
export function runSemaphore(initial: number, ops: ('wait' | 'signal')[]) {
  let value = initial
  let blocked = 0
  for (const op of ops) {
    if (op === 'wait') {
      if (value > 0) value--
      else blocked++
    } else if (blocked > 0) {
      blocked--
    } else {
      value++
    }
  }
  return { value, blocked }
}
