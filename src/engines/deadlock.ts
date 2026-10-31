/** Single-instance resource allocation graph and the banker's safety algorithm. */

export interface RagState {
  processes: string[]
  resources: string[]
  /** Resource -> process holding it. */
  holder: Record<string, string | null>
  /** Process -> resource it is waiting for. A waiting process cannot do anything else. */
  waiting: Record<string, string | null>
}

export function initialRag(processes = ['P1', 'P2', 'P3'], resources = ['R1', 'R2', 'R3']): RagState {
  return {
    processes,
    resources,
    holder: Object.fromEntries(resources.map((r) => [r, null])),
    waiting: Object.fromEntries(processes.map((p) => [p, null])),
  }
}

export function request(s: RagState, p: string, r: string): RagState {
  if (s.waiting[p] || s.holder[r] === p) return s
  if (s.holder[r] === null) return { ...s, holder: { ...s.holder, [r]: p } }
  return { ...s, waiting: { ...s.waiting, [p]: r } }
}

export function release(s: RagState, p: string, r: string): RagState {
  if (s.holder[r] !== p) return s
  // Hand the resource to the first process waiting for it, if any.
  const next = s.processes.find((q) => s.waiting[q] === r) ?? null
  return {
    ...s,
    holder: { ...s.holder, [r]: next },
    waiting: next ? { ...s.waiting, [next]: null } : s.waiting,
  }
}

/** With one instance per resource, a cycle in the wait-for graph means deadlock. Returns the processes on the cycle. */
export function findCycle(s: RagState): string[] | null {
  const waitsFor = (p: string) => {
    const r = s.waiting[p]
    return r ? s.holder[r] : null
  }
  for (const start of s.processes) {
    const path: string[] = []
    let cur: string | null = start
    while (cur && !path.includes(cur)) {
      path.push(cur)
      cur = waitsFor(cur)
    }
    if (cur) return path.slice(path.indexOf(cur))
  }
  return null
}

// ---------- Banker's algorithm ----------

export interface BankerInput {
  available: number[]
  max: number[][]
  allocation: number[][]
}

export interface SafetyStep {
  process: number
  need: number[]
  work: number[]
  ok: boolean
}

export function need(input: BankerInput): number[][] {
  return input.max.map((row, i) => row.map((m, j) => m - input.allocation[i][j]))
}

/** The first process holding more of a resource than its Max, if any. */
export interface BankerError {
  process: number
  resource: string
}

export function validate(input: BankerInput): BankerError | null {
  for (let i = 0; i < input.max.length; i++)
    for (let j = 0; j < input.available.length; j++)
      if (input.allocation[i][j] > input.max[i][j]) return { process: i, resource: String.fromCharCode(65 + j) }
  return null
}

/** Classic safety check: scan the processes repeatedly, finishing any whose Need fits in Work. */
export function safety(input: BankerInput): { steps: SafetyStep[]; sequence: number[]; safe: boolean } {
  const needs = need(input)
  const n = input.max.length
  let work = [...input.available]
  const finished = Array(n).fill(false)
  const steps: SafetyStep[] = []
  const sequence: number[] = []
  let progress = true
  while (progress && sequence.length < n) {
    progress = false
    for (let i = 0; i < n; i++) {
      if (finished[i]) continue
      const ok = needs[i].every((x, j) => x <= work[j])
      steps.push({ process: i, need: needs[i], work, ok })
      if (ok) {
        work = work.map((w, j) => w + input.allocation[i][j])
        finished[i] = true
        sequence.push(i)
        progress = true
      }
    }
  }
  return { steps, sequence, safe: sequence.length === n }
}

export const textbookExample: BankerInput = {
  available: [3, 3, 2],
  max: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ],
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ],
}
