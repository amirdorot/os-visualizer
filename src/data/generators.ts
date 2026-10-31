import { findCycle, initialRag, need, request, safety } from '../engines/deadlock'
import { runSemaphore } from '../engines/sync'
import { pageReplacement, translate, type ReplaceAlgo } from '../engines/memory'
import { simulate, type Job, type SchedAlgo } from '../engines/scheduler'
import { diskSchedule, type DiskAlgo } from '../engines/storage'
import { initialRace, opText, program, stepThread } from '../engines/threads'
import { pick, type Locale } from '../i18n'
import { processesGenText } from '../topics/processes/content'
import * as threadsContent from '../topics/threads/content'
import * as syncContent from '../topics/sync/content'
import * as deadlockContent from '../topics/deadlock/content'
import * as schedulingContent from '../topics/scheduling/content'
import * as memoryContent from '../topics/memory/content'
import * as storageContent from '../topics/storage/content'
import * as syscallsContent from '../topics/syscalls/content'
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

const algoNames = (locale: Locale): Record<SchedAlgo, string> => pick(schedulingContent.schedulingGenText, locale).algoNames

function randomJobs(rng: Rng): Job[] {
  const n = int(rng, 3, 4)
  let t = 0
  return Array.from({ length: n }, (_, i) => {
    const arrival = i === 0 ? 0 : (t += int(rng, 0, 3))
    return { id: `P${i + 1}`, arrival, burst: int(rng, 1, 8), priority: int(rng, 1, 4) }
  })
}

function jobTable(locale: Locale, jobs: Job[], withPriority = false) {
  const t = pick(schedulingContent.schedulingGenText, locale)
  return jobs.map((j) => t.job(j, withPriority)).join('\n')
}

function gantt(locale: Locale, s: ReturnType<typeof simulate>) {
  const t = pick(schedulingContent.schedulingGenText, locale)
  return s.segments.map((x) => `${x.id ?? t.idle} ${x.start}-${x.end}`).join(', ')
}

function schedAvgWait(rng: Rng, locale: Locale): Question {
  const t = pick(schedulingContent.schedulingGenText, locale)
  const jobs = randomJobs(rng)
  const algo = choice(rng, ['FCFS', 'SJF', 'SRTF', 'RR', 'PRIORITY'] as const)
  const s = simulate(jobs, algo, 2)
  return {
    kind: 'predict',
    id: uid(rng, 'sched-wait'),
    prompt: t.avgPrompt(algoNames(locale)[algo]),
    scenario: jobTable(locale, jobs, algo === 'PRIORITY'),
    answer: round2(s.avgWaiting),
    tolerance: 0.011,
    unit: t.unit,
    explanation: t.avgExplain(
      gantt(locale, s),
      s.stats.map((x) => `${x.id} = ${x.waiting}`).join(', '),
      s.stats.reduce((a, x) => a + x.waiting, 0),
      s.stats.length,
      round2(s.avgWaiting),
    ),
  }
}

function schedCompletion(rng: Rng, locale: Locale): Question {
  const t = pick(schedulingContent.schedulingGenText, locale)
  const jobs = randomJobs(rng)
  const algo = choice(rng, ['FCFS', 'SJF', 'SRTF', 'RR'] as const)
  const s = simulate(jobs, algo, 2)
  const target = choice(rng, s.stats)
  return {
    kind: 'predict',
    id: uid(rng, 'sched-done'),
    prompt: t.donePrompt(algoNames(locale)[algo], target.id),
    scenario: jobTable(locale, jobs),
    answer: target.completion,
    explanation: t.doneExplain(gantt(locale, s), target.id, target.completion),
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

function interleaving(rng: Rng, locale: Locale): Question {
  const text = pick(threadsContent.threadsGenText, locale)
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
    prompt: text.interleavePrompt,
    scenario: lines.join('\n'),
    answer: s.counter,
    explanation: s.counter === 2 ? text.noLoss : text.lost,
  }
}

// ---------- Memory ----------

function translation(rng: Rng, locale: Locale): Question {
  const t = pick(memoryContent.memoryGenText, locale)
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
    prompt: t.trPrompt(pageSize, va),
    scenario: `${t.trTable}\n${table.map((e, i) => t.seq(`  ${i} -> ${e.valid ? e.frame : t.invalid}`)).join('\n')}`,
    answer: tr.physical!,
    explanation: t.trExplain(va, pageSize, page, offset, tr.frame!, tr.physical!),
  }
}

function faults(rng: Rng, locale: Locale): Question {
  const t = pick(memoryContent.memoryGenText, locale)
  const refs = Array.from({ length: int(rng, 10, 12) }, () => int(rng, 0, 4))
  const frames = 3
  const algo = choice(rng, ['FIFO', 'LRU', 'OPT'] as const satisfies readonly ReplaceAlgo[])
  const steps = pageReplacement(refs, frames, algo)
  return {
    kind: 'predict',
    id: uid(rng, 'mem-faults'),
    prompt: t.faultsPrompt(frames, algo),
    scenario: `${t.refString}: ${t.seq(refs.join(' '))}`,
    answer: steps.at(-1)!.faults,
    unit: t.faultsUnit,
    explanation: `${t.seq(refs.map((r, i) => `${r}:${steps[i].hit ? 'hit' : 'F'}`).join(' '))}\n${t.totalFaults(steps.at(-1)!.faults)}`,
  }
}

function addressBits(rng: Rng, locale: Locale): Question {
  const t = pick(memoryContent.memoryGenText, locale)
  const k = int(rng, 9, 14)
  const bitsTotal = choice(rng, [16, 32])
  const pageSize = 2 ** k
  if (rng() < 0.5) {
    return {
      kind: 'predict',
      id: uid(rng, 'mem-offset'),
      prompt: t.offsetPrompt(pageSize.toLocaleString('en-US')),
      answer: k,
      unit: t.bitsUnit,
      explanation: t.offsetExplain(pageSize, k),
    }
  }
  return {
    kind: 'predict',
    id: uid(rng, 'mem-pagebits'),
    prompt: t.pageBitsPrompt(bitsTotal, pageSize.toLocaleString('en-US')),
    answer: bitsTotal - k,
    unit: t.bitsUnit,
    explanation: t.pageBitsExplain(k, pageSize, bitsTotal),
  }
}

// ---------- Storage ----------

function headMovement(rng: Rng, locale: Locale): Question {
  const t = pick(storageContent.storageGenText, locale)
  const requests = Array.from({ length: int(rng, 4, 6) }, () => int(rng, 0, 199))
  const head = int(rng, 20, 180)
  const algo = choice(rng, ['FCFS', 'SSTF', 'SCAN', 'CSCAN'] as const satisfies readonly DiskAlgo[])
  const plan = diskSchedule(requests, head, algo)
  return {
    kind: 'predict',
    id: uid(rng, 'sto-disk'),
    prompt: t.diskPrompt(t.diskNames[algo]),
    scenario: t.diskScenario(head, requests),
    answer: plan.total,
    unit: t.diskUnit,
    explanation: t.diskExplain(plan.path, plan.path.slice(1).map((c, i) => Math.abs(c - plan.path[i])), plan.total),
  }
}

function blocksNeeded(rng: Rng, locale: Locale): Question {
  const t = pick(storageContent.storageGenText, locale)
  const blockSize = 4096
  const size = int(rng, 1, 40) * 1000 + int(rng, 0, 999)
  const data = Math.ceil(size / blockSize)
  const indexed = rng() < 0.5
  return {
    kind: 'predict',
    id: uid(rng, 'sto-blocks'),
    prompt: t.blocksPrompt(size.toLocaleString('en-US'), indexed),
    answer: data + (indexed ? 1 : 0),
    unit: t.blocksUnit,
    explanation: t.blocksExplain(size, data, indexed),
  }
}

// ---------- System calls ----------

function syscallOrNot(rng: Rng, locale: Locale): Question {
  const t = pick(syscallsContent.syscallsGenText, locale)
  if (rng() < 0.6) {
    const yes = choice(rng, t.needsSyscall)
    return mcq(rng, 'sys-needs', t.needsPrompt, yes, shuffled(rng, t.noSyscall).slice(0, 3), t.needsExplain(yes))
  }
  const no = choice(rng, t.noSyscall)
  return mcq(rng, 'sys-not', t.notPrompt, no, shuffled(rng, t.needsSyscall).slice(0, 3), t.notExplain(no))
}

// ---------- Synchronization ----------

function semaphoreTrace(rng: Rng, locale: Locale): Question {
  const t = pick(syncContent.syncGenText, locale)
  const initial = int(rng, 0, 3)
  const ops = Array.from({ length: int(rng, 4, 7) }, () => (rng() < 0.6 ? 'wait' : 'signal') as 'wait' | 'signal')
  const final = runSemaphore(initial, ops)
  const askBlocked = rng() < 0.5
  let value = initial
  let blocked = 0
  const trace = ops.map((op) => {
    if (op === 'wait') {
      if (value > 0) return t.waitDec(value, --value)
      blocked++
      return t.waitBlocks(blocked)
    }
    if (blocked > 0) return t.signalWakes(--blocked)
    return t.signalInc(value, ++value)
  })
  return {
    kind: 'predict',
    id: uid(rng, 'sync-sem'),
    prompt: t.prompt(initial, askBlocked),
    scenario: ops.join(', '),
    answer: askBlocked ? final.blocked : final.value,
    unit: askBlocked ? t.unit : undefined,
    explanation: `${trace.join('\n')}\n${t.summary(final.value, final.blocked)}`,
  }
}

// ---------- Deadlock ----------

function ragDeadlock(rng: Rng, locale: Locale): Question {
  const t = pick(deadlockContent.deadlockGenText, locale)
  let s = initialRag()
  const moves = int(rng, 4, 7)
  for (let i = 0; i < moves; i++) s = request(s, choice(rng, s.processes), choice(rng, s.resources))
  const cycle = findCycle(s)
  const holds = s.resources.map((r) => t.heldBy(r, s.holder[r]))
  const waits = s.processes.filter((p) => s.waiting[p]).map((p) => t.waitsFor(p, s.waiting[p]!))
  return mcq(
    rng,
    'dl-rag',
    t.ragPrompt,
    cycle ? t.yes : t.no,
    [cycle ? t.no : t.yes],
    cycle ? t.cycle([...cycle, cycle[0]].join(' -> ')) : t.noCycle,
    [...holds, ...(waits.length ? waits : [t.noneWaiting])].join('\n'),
  )
}

function bankerSafe(rng: Rng, locale: Locale): Question {
  const t = pick(deadlockContent.deadlockGenText, locale)
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
    t.bankerPrompt,
    res.safe ? t.safe : t.unsafe,
    [res.safe ? t.unsafe : t.safe],
    t.needs(needs.map((x, i) => `P${i} ${fmt(x)}`).join(', ')) +
      (res.safe
        ? t.safeSeq(res.sequence.map((i) => `P${i}`).join(', '))
        : t.unsafeSeq(fmt(input.available), res.sequence.length ? res.sequence.map((i) => `P${i}`).join(', ') : null)),
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
