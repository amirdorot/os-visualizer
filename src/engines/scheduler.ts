export type SchedAlgo = 'FCFS' | 'SJF' | 'SRTF' | 'RR' | 'PRIORITY'

export interface Job {
  id: string
  arrival: number
  burst: number
  /** Lower number = higher priority. */
  priority: number
}

export interface Tick {
  time: number
  running: string | null
  ready: string[]
  remaining: Record<string, number>
  /** Set when the CPU switched from one process to a different one at the start of this tick. */
  switchFrom: string | null
  arrived: string[]
  completed: string[]
}

export interface Segment {
  id: string | null
  start: number
  end: number
}

export interface JobStats {
  id: string
  arrival: number
  burst: number
  start: number
  completion: number
  turnaround: number
  waiting: number
  response: number
}

export interface Schedule {
  ticks: Tick[]
  segments: Segment[]
  stats: JobStats[]
  avgWaiting: number
  avgTurnaround: number
  avgResponse: number
  contextSwitches: number
}

function pick(ready: string[], algo: SchedAlgo, jobs: Map<string, Job>, remaining: Record<string, number>): string {
  if (algo === 'FCFS' || algo === 'RR') return ready[0]
  let best = ready[0]
  for (const id of ready) {
    const a = algo === 'PRIORITY' ? jobs.get(id)!.priority : remaining[id]
    const b = algo === 'PRIORITY' ? jobs.get(best)!.priority : remaining[best]
    if (a < b) best = id
  }
  return best
}

/**
 * Simulates a single CPU one time unit at a time.
 * SJF and PRIORITY are non-preemptive; SRTF and RR are preemptive.
 * Ties are broken by queue order (arrival, then input order).
 */
export function simulate(input: Job[], algo: SchedAlgo, quantum = 2): Schedule {
  const jobs = new Map(input.map((j) => [j.id, j]))
  const order = [...input].sort((a, b) => a.arrival - b.arrival)
  const remaining: Record<string, number> = Object.fromEntries(input.map((j) => [j.id, j.burst]))
  const firstStart: Record<string, number> = {}
  const completion: Record<string, number> = {}
  const ticks: Tick[] = []
  const ready: string[] = []
  let current: string | null = null
  let prevRunning: string | null = null
  let used = 0
  let nextArrival = 0
  let doneCount = 0
  let t = 0
  let switches = 0
  let justCompleted: string[] = []

  if (input.length === 0) {
    return { ticks: [], segments: [], stats: [], avgWaiting: 0, avgTurnaround: 0, avgResponse: 0, contextSwitches: 0 }
  }

  while (doneCount < input.length) {
    const arrived: string[] = []
    while (nextArrival < order.length && order[nextArrival].arrival <= t) {
      ready.push(order[nextArrival].id)
      arrived.push(order[nextArrival].id)
      nextArrival++
    }

    if (current && algo === 'RR' && used >= quantum && ready.length > 0) {
      ready.push(current)
      current = null
    }
    if (current && algo === 'SRTF' && ready.length > 0) {
      const challenger = pick(ready, 'SRTF', jobs, remaining)
      if (remaining[challenger] < remaining[current]) {
        ready.push(current)
        current = null
      }
    }
    if (!current && ready.length > 0) {
      current = pick(ready, algo, jobs, remaining)
      ready.splice(ready.indexOf(current), 1)
      used = 0
      if (firstStart[current] === undefined) firstStart[current] = t
    }
    if (current && algo === 'RR' && used >= quantum) used = 0

    const switchFrom = current && prevRunning && prevRunning !== current ? prevRunning : null
    if (switchFrom) switches++

    ticks.push({
      time: t,
      running: current,
      ready: [...ready],
      remaining: { ...remaining },
      switchFrom,
      arrived,
      completed: justCompleted,
    })
    justCompleted = []

    if (current) {
      remaining[current]--
      used++
      if (remaining[current] === 0) {
        completion[current] = t + 1
        justCompleted = [current]
        doneCount++
        current = null
      }
    }
    prevRunning = ticks[ticks.length - 1].running
    t++
  }

  ticks.push({
    time: t,
    running: null,
    ready: [],
    remaining: { ...remaining },
    switchFrom: null,
    arrived: [],
    completed: justCompleted,
  })

  const segments: Segment[] = []
  for (const tick of ticks.slice(0, -1)) {
    const last = segments[segments.length - 1]
    if (last && last.id === tick.running) last.end = tick.time + 1
    else segments.push({ id: tick.running, start: tick.time, end: tick.time + 1 })
  }

  const stats: JobStats[] = input.map((j) => {
    const turnaround = completion[j.id] - j.arrival
    return {
      id: j.id,
      arrival: j.arrival,
      burst: j.burst,
      start: firstStart[j.id],
      completion: completion[j.id],
      turnaround,
      waiting: turnaround - j.burst,
      response: firstStart[j.id] - j.arrival,
    }
  })
  const avg = (f: (s: JobStats) => number) => stats.reduce((a, s) => a + f(s), 0) / stats.length

  return {
    ticks,
    segments,
    stats,
    avgWaiting: avg((s) => s.waiting),
    avgTurnaround: avg((s) => s.turnaround),
    avgResponse: avg((s) => s.response),
    contextSwitches: switches,
  }
}
