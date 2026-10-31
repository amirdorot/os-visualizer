import { findCycle, initialRag, need, request, safety } from '../engines/deadlock'
import { runSemaphore } from '../engines/sync'
import { pageReplacement, translate, type ReplaceAlgo } from '../engines/memory'
import { simulate, type Job, type SchedAlgo } from '../engines/scheduler'
import { diskSchedule, type DiskAlgo } from '../engines/storage'
import { initialRace, opText, program, stepThread } from '../engines/threads'
import { pick, type Locale } from '../i18n'
import { processesGenText } from '../topics/processes/content'
import type { Question } from '../types'

export type Rng = () => number

const int = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1))
const choice = <T>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)]
const uid = (rng: Rng, prefix: string) => `gen-${prefix}-${Math.floor(rng() * 1e9).toString(36)}`
const round2 = (n: number) => Math.round(n * 100) / 100

function shuffled<T>(rng: Rng, items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function mcq(rng: Rng, prefix: string, prompt: string, correct: string, wrong: string[], explanation: string, scenario?: string): Question {
  const options = shuffled(rng, [correct, ...wrong])
  return { kind: 'mcq', id: uid(rng, prefix), prompt, scenario, options, answer: options.indexOf(correct), explanation }
}

// ---------- Scheduling ----------

const algoNames: Record<SchedAlgo, string> = {
  FCFS: 'FCFS',
  SJF: 'SJF (non-preemptive)',
  SRTF: 'SRTF (preemptive SJF)',
  RR: 'Round Robin with quantum 2',
  PRIORITY: 'Priority (non-preemptive, lower number = higher priority)',
}

function randomJobs(rng: Rng): Job[] {
  const n = int(rng, 3, 4)
  let t = 0
  return Array.from({ length: n }, (_, i) => {
    const arrival = i === 0 ? 0 : (t += int(rng, 0, 3))
    return { id: `P${i + 1}`, arrival, burst: int(rng, 1, 8), priority: int(rng, 1, 4) }
  })
}

function jobTable(jobs: Job[], withPriority = false) {
  return jobs.map((j) => `${j.id}: arrival ${j.arrival}, burst ${j.burst}${withPriority ? `, priority ${j.priority}` : ''}`).join('\n')
}

function gantt(s: ReturnType<typeof simulate>) {
  return s.segments.map((x) => `${x.id ?? 'idle'} ${x.start}-${x.end}`).join(', ')
}

function schedAvgWait(rng: Rng): Question {
  const jobs = randomJobs(rng)
  const algo = choice(rng, ['FCFS', 'SJF', 'SRTF', 'RR', 'PRIORITY'] as const)
  const s = simulate(jobs, algo, 2)
  return {
    kind: 'predict',
    id: uid(rng, 'sched-wait'),
    prompt: `Using ${algoNames[algo]}, what is the average waiting time? (Round to 2 decimals.)`,
    scenario: jobTable(jobs, algo === 'PRIORITY'),
    answer: round2(s.avgWaiting),
    tolerance: 0.011,
    unit: 'time units',
    explanation: `Schedule: ${gantt(s)}.\nWaiting times: ${s.stats.map((x) => `${x.id} = ${x.waiting}`).join(', ')}.\nAverage = ${s.stats.reduce((a, x) => a + x.waiting, 0)} / ${s.stats.length} = ${round2(s.avgWaiting)}.`,
  }
}

function schedCompletion(rng: Rng): Question {
  const jobs = randomJobs(rng)
  const algo = choice(rng, ['FCFS', 'SJF', 'SRTF', 'RR'] as const)
  const s = simulate(jobs, algo, 2)
  const target = choice(rng, s.stats)
  return {
    kind: 'predict',
    id: uid(rng, 'sched-done'),
    prompt: `Using ${algoNames[algo]}, at what time does ${target.id} finish?`,
    scenario: jobTable(jobs),
    answer: target.completion,
    explanation: `Schedule: ${gantt(s)}. ${target.id} completes at time ${target.completion}.`,
  }
}

// ---------- Processes ----------

function forkCount(rng: Rng, locale: Locale): Question {
  const t = pick(processesGenText, locale)
  const n = int(rng, 2, 4)
  const counts = Array.from({ length: n }, (_, i) => 2 ** (i + 1))
  if (rng() < 0.5) {
    return {
      kind: 'predict',
      id: uid(rng, 'proc-fork'),
      prompt: t.forkPrompt,
      scenario: `for (int i = 0; i < ${n}; i++)\n  fork();`,
      answer: 2 ** n,
      unit: t.forkUnit,
      explanation: t.forkExplain(counts),
    }
  }
  const total = 2 ** (n + 1) - 2
  return {
    kind: 'predict',
    id: uid(rng, 'proc-print'),
    prompt: t.printPrompt,
    scenario: `for (int i = 0; i < ${n}; i++) {\n  fork();\n  printf("hi\\n");\n}`,
    answer: total,
    unit: t.printUnit,
    explanation: t.printExplain(counts, total),
  }
}

const transitions = [
  { from: 'Running', to: 'Ready' },
  { from: 'Running', to: 'Waiting' },
  { from: 'Waiting', to: 'Ready' },
  { from: 'Ready', to: 'Running' },
  { from: 'Running', to: 'Terminated' },
  { from: 'New', to: 'Ready' },
  { from: 'Running', to: 'Waiting' },
]

function stateTransition(rng: Rng, locale: Locale): Question {
  const text = pick(processesGenText, locale)
  const i = Math.floor(rng() * transitions.length)
  const t = transitions[i]
  const [event, why] = text.transitions[i]
  const others = ['New', 'Ready', 'Running', 'Waiting', 'Terminated'].filter((s) => s !== t.to && s !== t.from)
  return mcq(rng, 'proc-state', text.statePrompt(t.from, event), t.to, others.slice(0, 3), why)
}

// ---------- Threads ----------

function interleaving(rng: Rng): Question {
  const order = shuffled(rng, [0, 0, 0, 1, 1, 1])
  let s = initialRace(2, 1, false)
  const prog = program(false)
  const lines: string[] = []
  const pcs = [0, 0]
  for (const tid of order) {
    lines.push(`T${tid}: ${opText[prog[pcs[tid]]]}`)
    pcs[tid]++
    s = stepThread(s, tid)
  }
  return {
    kind: 'predict',
    id: uid(rng, 'thr-interleave'),
    prompt: 'counter starts at 0 and each thread has its own register. Two threads run counter++ in this exact interleaving. What is the final value of counter?',
    scenario: lines.join('\n'),
    answer: s.counter,
    explanation:
      s.counter === 2
        ? 'Each thread finished its STORE before the other one LOADed, so no update was lost: 2.'
        : 'Both threads LOADed the same old value before either stored its result, so one increment overwrote the other: the final value is 1.',
  }
}

// ---------- Memory ----------

function translation(rng: Rng): Question {
  const pageSize = choice(rng, [256, 512, 1024, 4096])
  const pages = int(rng, 4, 6)
  const frames = shuffled(rng, [...Array(12).keys()]).slice(0, pages)
  const table = frames.map((f) => ({ frame: f, valid: rng() > 0.2 }))
  const page = int(rng, 0, pages - 1)
  table[page] = { frame: frames[page], valid: true }
  const offset = int(rng, 0, pageSize - 1)
  const va = page * pageSize + offset
  const tr = translate(va, pageSize, table)
  return {
    kind: 'predict',
    id: uid(rng, 'mem-tr'),
    prompt: `Page size is ${pageSize} bytes. What physical address does virtual address ${va} map to?`,
    scenario: `Page table (page -> frame):\n${table.map((e, i) => `  ${i} -> ${e.valid ? e.frame : 'invalid'}`).join('\n')}`,
    answer: tr.physical!,
    explanation: `${va} / ${pageSize} = page ${page}, offset ${offset}. Page ${page} is in frame ${tr.frame}, so the physical address is ${tr.frame} x ${pageSize} + ${offset} = ${tr.physical}.`,
  }
}

function faults(rng: Rng): Question {
  const refs = Array.from({ length: int(rng, 10, 12) }, () => int(rng, 0, 4))
  const frames = 3
  const algo = choice(rng, ['FIFO', 'LRU', 'OPT'] as const satisfies readonly ReplaceAlgo[])
  const steps = pageReplacement(refs, frames, algo)
  return {
    kind: 'predict',
    id: uid(rng, 'mem-faults'),
    prompt: `With ${frames} empty frames and ${algo === 'OPT' ? 'Optimal' : algo} replacement, how many page faults occur?`,
    scenario: `Reference string: ${refs.join(' ')}`,
    answer: steps.at(-1)!.faults,
    unit: 'faults',
    explanation: `${refs.map((r, i) => `${r}:${steps[i].hit ? 'hit' : 'F'}`).join(' ')}\nTotal faults: ${steps.at(-1)!.faults}.`,
  }
}

function addressBits(rng: Rng): Question {
  const k = int(rng, 9, 14)
  const bitsTotal = choice(rng, [16, 32])
  const pageSize = 2 ** k
  if (rng() < 0.5) {
    return {
      kind: 'predict',
      id: uid(rng, 'mem-offset'),
      prompt: `Pages are ${pageSize.toLocaleString('en-US')} bytes. How many bits of the address are the page offset?`,
      answer: k,
      unit: 'bits',
      explanation: `${pageSize} = 2^${k}, so ${k} bits are needed to address every byte within a page.`,
    }
  }
  return {
    kind: 'predict',
    id: uid(rng, 'mem-pagebits'),
    prompt: `A ${bitsTotal}-bit virtual address space uses ${pageSize.toLocaleString('en-US')}-byte pages. How many bits are the page number?`,
    answer: bitsTotal - k,
    unit: 'bits',
    explanation: `The offset takes ${k} bits (2^${k} = ${pageSize}); the remaining ${bitsTotal} - ${k} = ${bitsTotal - k} bits select the page.`,
  }
}

// ---------- Storage ----------

const diskNames: Record<DiskAlgo, string> = { FCFS: 'FCFS', SSTF: 'SSTF', SCAN: 'SCAN (moving toward 199 first)', CSCAN: 'C-SCAN (moving toward 199, wrap-around counted)' }

function headMovement(rng: Rng): Question {
  const requests = Array.from({ length: int(rng, 4, 6) }, () => int(rng, 0, 199))
  const head = int(rng, 20, 180)
  const algo = choice(rng, ['FCFS', 'SSTF', 'SCAN', 'CSCAN'] as const)
  const plan = diskSchedule(requests, head, algo)
  return {
    kind: 'predict',
    id: uid(rng, 'sto-disk'),
    prompt: `Using ${diskNames[algo]}, what is the total head movement in cylinders? (Cylinders 0-199.)`,
    scenario: `Head at ${head}\nQueue: ${requests.join(', ')}`,
    answer: plan.total,
    unit: 'cylinders',
    explanation: `Path: ${plan.path.join(' -> ')}.\nTotal = ${plan.path.slice(1).map((c, i) => Math.abs(c - plan.path[i])).join(' + ')} = ${plan.total}.`,
  }
}

function blocksNeeded(rng: Rng): Question {
  const blockSize = 4096
  const size = int(rng, 1, 40) * 1000 + int(rng, 0, 999)
  const data = Math.ceil(size / blockSize)
  const indexed = rng() < 0.5
  return {
    kind: 'predict',
    id: uid(rng, 'sto-blocks'),
    prompt: `Blocks are 4 KiB (4096 bytes). How many disk blocks does a ${size.toLocaleString('en-US')}-byte file use with ${indexed ? 'indexed allocation (one index block per file)' : 'contiguous allocation'}?`,
    answer: data + (indexed ? 1 : 0),
    unit: 'blocks',
    explanation: `${size} / 4096 rounded up = ${data} data blocks${indexed ? ', plus 1 index block' : ''}. The unused space in the last block is internal fragmentation.`,
  }
}

// ---------- System calls ----------

const needsSyscall = ['Opening a file', 'Creating a new process', 'Writing text to the terminal', 'Asking the OS for more heap memory', 'Sending a network packet', 'Sleeping for one second', 'Getting the current process ID']
const noSyscall = ['Adding two integers', 'Calling a function in your own program', 'Reading a local variable', 'Sorting an array in memory', 'Computing a square root', 'Comparing two strings']

function syscallOrNot(rng: Rng): Question {
  if (rng() < 0.6) {
    const yes = choice(rng, needsSyscall)
    return mcq(rng, 'sys-needs', 'Which of these requires a system call?', yes, shuffled(rng, noSyscall).slice(0, 3), `"${yes}" touches something only the kernel controls (files, devices, processes or memory mappings). The others are plain computation in user mode.`)
  }
  const no = choice(rng, noSyscall)
  return mcq(rng, 'sys-not', 'Which of these does NOT need a system call?', no, shuffled(rng, needsSyscall).slice(0, 3), `"${no}" is ordinary computation on the program's own memory, so it runs entirely in user mode.`)
}

// ---------- Synchronization ----------

function semaphoreTrace(rng: Rng): Question {
  const initial = int(rng, 0, 3)
  const ops = Array.from({ length: int(rng, 4, 7) }, () => (rng() < 0.6 ? 'wait' : 'signal') as 'wait' | 'signal')
  const final = runSemaphore(initial, ops)
  const askBlocked = rng() < 0.5
  let value = initial
  let blocked = 0
  const trace = ops.map((op) => {
    if (op === 'wait') {
      if (value > 0) return `wait: ${value} -> ${--value}`
      blocked++
      return `wait: value is 0, the thread blocks (${blocked} blocked)`
    }
    if (blocked > 0) return `signal: wakes a blocked thread (${--blocked} blocked)`
    return `signal: ${value} -> ${++value}`
  })
  return {
    kind: 'predict',
    id: uid(rng, 'sync-sem'),
    prompt: `A semaphore starts at ${initial}. Different threads perform these operations in order. ${askBlocked ? 'How many threads are blocked at the end?' : 'What is the semaphore value at the end?'}`,
    scenario: ops.join(', '),
    answer: askBlocked ? final.blocked : final.value,
    unit: askBlocked ? 'threads' : undefined,
    explanation: `${trace.join('\n')}\nFinal value ${final.value}, ${final.blocked} thread(s) blocked. Note that signal() wakes a waiting thread instead of incrementing when someone is blocked.`,
  }
}

// ---------- Deadlock ----------

function ragDeadlock(rng: Rng): Question {
  let s = initialRag()
  const moves = int(rng, 4, 7)
  for (let i = 0; i < moves; i++) s = request(s, choice(rng, s.processes), choice(rng, s.resources))
  const cycle = findCycle(s)
  const holds = s.resources.map((r) => `${r} held by ${s.holder[r] ?? 'nobody'}`)
  const waits = s.processes.filter((p) => s.waiting[p]).map((p) => `${p} waits for ${s.waiting[p]}`)
  return mcq(
    rng,
    'dl-rag',
    'Each resource has a single instance. Is the system deadlocked?',
    cycle ? 'Yes' : 'No',
    [cycle ? 'No' : 'Yes'],
    cycle
      ? `There is a cycle: ${[...cycle, cycle[0]].join(' -> ')}, where each process waits for a resource held by the next one. With single-instance resources a cycle means deadlock.`
      : 'Follow each "waits for" edge to the holder: no chain loops back to where it started, so there is no circular wait and no deadlock.',
    [...holds, ...(waits.length ? waits : ['No process is waiting'])].join('\n'),
  )
}

function bankerSafe(rng: Rng): Question {
  const n = 3
  const allocation = Array.from({ length: n }, () => [int(rng, 0, 3), int(rng, 0, 3)])
  const max = allocation.map((row) => row.map((a) => a + int(rng, 0, 4)))
  const input = { available: [int(rng, 0, 3), int(rng, 0, 3)], max, allocation }
  const res = safety(input)
  const needs = need(input)
  const fmt = (v: number[]) => `(${v.join(', ')})`
  return mcq(
    rng,
    'dl-banker',
    "Two resource types A and B. Is this state safe according to the banker's algorithm?",
    res.safe ? 'Safe' : 'Unsafe',
    [res.safe ? 'Unsafe' : 'Safe'],
    `Need = Max - Allocation: ${needs.map((x, i) => `P${i} ${fmt(x)}`).join(', ')}.\n` +
      (res.safe
        ? `Safe sequence: ${res.sequence.map((i) => `P${i}`).join(', ')}. Each one's Need fits in Work, and when it finishes its Allocation is added back to Work.`
        : `Starting from Work = ${fmt(input.available)}${res.sequence.length ? `, ${res.sequence.map((i) => `P${i}`).join(', ')} can finish, but then` : ''} no remaining process's Need fits in Work, so no safe sequence exists.`),
    `Available: ${fmt(input.available)}\n${allocation.map((a, i) => `P${i}: Allocation ${fmt(a)}, Max ${fmt(max[i])}`).join('\n')}`,
  )
}

/** Generators take the language for their text; topics that are not translated yet ignore it. */
export const generators: Record<string, ((rng: Rng, locale: Locale) => Question)[]> = {
  processes: [forkCount, stateTransition],
  threads: [interleaving],
  sync: [semaphoreTrace],
  deadlock: [ragDeadlock, bankerSafe],
  scheduling: [schedAvgWait, schedCompletion],
  memory: [translation, faults, addressBits],
  storage: [headMovement, blocksNeeded],
  syscalls: [syscallOrNot],
}

export function generate(topics: string[], rng: Rng = Math.random, locale: Locale = 'en'): { topic: string; question: Question } {
  const available = topics.filter((t) => generators[t]?.length)
  const topic = choice(rng, available)
  return { topic, question: choice(rng, generators[topic])(rng, locale) }
}
