export type PState = 'new' | 'ready' | 'running' | 'waiting' | 'terminated'

export interface PCB {
  pid: number
  /** 1 means the process is owned by init. */
  ppid: number
  state: PState
  program: string
  pc: number
  cpuTime: number
  waitingFor: 'io' | 'child' | null
  openFiles: string[]
}

export interface OSState {
  procs: PCB[]
  nextPid: number
  log: { text: string; tone: 'info' | 'good' | 'bad' }[]
  lastEvent: string | null
}

export type ProcAction =
  | { type: 'create'; program: string }
  | { type: 'admit'; pid: number }
  | { type: 'dispatch'; pid: number }
  | { type: 'tick' }
  | { type: 'timeout' }
  | { type: 'io' }
  | { type: 'ioDone'; pid: number }
  | { type: 'fork' }
  | { type: 'exec'; program: string }
  | { type: 'wait' }
  | { type: 'exit' }

export const INIT_PID = 1

export function initialOS(): OSState {
  return {
    procs: [
      { pid: 100, ppid: INIT_PID, state: 'ready', program: 'bash', pc: 0x1000, cpuTime: 0, waitingFor: null, openFiles: ['stdin', 'stdout', 'stderr'] },
    ],
    nextPid: 101,
    log: [{ text: 'System booted. init (PID 1) started bash (PID 100), which is ready to run.', tone: 'info' }],
    lastEvent: null,
  }
}

export function running(s: OSState): PCB | undefined {
  return s.procs.find((p) => p.state === 'running')
}

/** Returns why an action is not allowed right now, or null if it is. */
export function blockedReason(s: OSState, a: ProcAction): string | null {
  const r = running(s)
  const find = (pid: number) => s.procs.find((p) => p.pid === pid)
  switch (a.type) {
    case 'create':
      return s.procs.length >= 9 ? 'Process table is full in this demo.' : null
    case 'admit':
      return find(a.pid)?.state === 'new' ? null : 'Only a New process can be admitted.'
    case 'dispatch':
      if (r) return 'The CPU is busy. Preempt or block the running process first.'
      return find(a.pid)?.state === 'ready' ? null : 'Only a Ready process can be dispatched.'
    case 'ioDone':
      return find(a.pid)?.waitingFor === 'io' ? null : 'That process is not waiting for I/O.'
    case 'fork':
      if (s.procs.length >= 9) return 'Process table is full in this demo.'
      return r ? null : 'Only a running process can call fork().'
    case 'tick':
    case 'timeout':
    case 'io':
    case 'exec':
    case 'wait':
    case 'exit':
      return r ? null : 'No process is running.'
  }
}

function log(s: OSState, text: string, tone: 'info' | 'good' | 'bad' = 'info'): OSState {
  return { ...s, log: [{ text, tone }, ...s.log].slice(0, 40), lastEvent: text }
}

function update(s: OSState, pid: number, patch: Partial<PCB>): OSState {
  return { ...s, procs: s.procs.map((p) => (p.pid === pid ? { ...p, ...patch } : p)) }
}

function remove(s: OSState, pid: number): OSState {
  return { ...s, procs: s.procs.filter((p) => p.pid !== pid) }
}

export function reduceOS(s: OSState, a: ProcAction): OSState {
  const reason = blockedReason(s, a)
  if (reason) return log(s, reason, 'bad')
  const r = running(s)!

  switch (a.type) {
    case 'create': {
      const pcb: PCB = { pid: s.nextPid, ppid: INIT_PID, state: 'new', program: a.program, pc: 0x1000, cpuTime: 0, waitingFor: null, openFiles: ['stdin', 'stdout', 'stderr'] }
      return log({ ...s, procs: [...s.procs, pcb], nextPid: s.nextPid + 1 }, `Created PID ${pcb.pid} (${a.program}). The kernel allocated a PCB; the process is New.`)
    }
    case 'admit':
      return log(update(s, a.pid, { state: 'ready' }), `PID ${a.pid} admitted to the ready queue.`)
    case 'dispatch':
      return log(update(s, a.pid, { state: 'running' }), `Scheduler dispatched PID ${a.pid}: its saved registers are loaded and it is now Running.`, 'good')
    case 'tick':
      return log(update(s, r.pid, { pc: r.pc + 4, cpuTime: r.cpuTime + 1 }), `PID ${r.pid} executed an instruction (PC is now 0x${(r.pc + 4).toString(16)}).`)
    case 'timeout':
      return log(update(s, r.pid, { state: 'ready' }), `Timer interrupt: PID ${r.pid} is preempted and goes back to Ready.`)
    case 'io':
      return log(update(s, r.pid, { state: 'waiting', waitingFor: 'io' }), `PID ${r.pid} requested disk I/O and is now Waiting (blocked). The CPU is free.`)
    case 'ioDone':
      return log(update(s, a.pid, { state: 'ready', waitingFor: null }), `I/O completed: an interrupt moves PID ${a.pid} back to Ready.`, 'good')
    case 'fork': {
      const child: PCB = { ...r, pid: s.nextPid, ppid: r.pid, state: 'ready', cpuTime: 0, waitingFor: null }
      const next = { ...s, procs: [...s.procs, child], nextPid: s.nextPid + 1 }
      return log(
        next,
        `PID ${r.pid} called fork(). Child PID ${child.pid} is a copy (same program "${r.program}", same PC, same open files). fork() returned ${child.pid} to the parent and 0 to the child.`,
        'good',
      )
    }
    case 'exec':
      return log(
        update(s, r.pid, { program: a.program, pc: 0x1000 }),
        `PID ${r.pid} called exec("${a.program}"). Its code, data and stack were replaced; the PID and open files stay the same.`,
      )
    case 'wait': {
      const children = s.procs.filter((p) => p.ppid === r.pid)
      if (children.length === 0) return log(s, `PID ${r.pid} called wait() but has no children: it returns -1 immediately.`, 'bad')
      const zombie = children.find((c) => c.state === 'terminated')
      if (zombie) {
        return log(remove(s, zombie.pid), `PID ${r.pid} called wait() and reaped zombie child ${zombie.pid} immediately. Its PCB is freed.`, 'good')
      }
      return log(update(s, r.pid, { state: 'waiting', waitingFor: 'child' }), `PID ${r.pid} called wait() and blocks until one of its children exits.`)
    }
    case 'exit': {
      let next = s
      const orphans = s.procs.filter((p) => p.ppid === r.pid)
      for (const o of orphans) next = update(next, o.pid, { ppid: INIT_PID })
      for (const o of orphans.filter((o) => o.state === 'terminated')) next = remove(next, o.pid)
      const parent = s.procs.find((p) => p.pid === r.ppid)
      const orphanNote = orphans.length ? ` Its children ${orphans.map((o) => o.pid).join(', ')} are orphans and are re-parented to init.` : ''

      if (r.ppid === INIT_PID || !parent) {
        return log(remove(next, r.pid), `PID ${r.pid} exited. init reaps it right away.${orphanNote}`)
      }
      if (parent.state === 'waiting' && parent.waitingFor === 'child') {
        next = update(remove(next, r.pid), parent.pid, { state: 'ready', waitingFor: null })
        return log(next, `PID ${r.pid} exited. Its parent ${parent.pid} was waiting, so it collects the exit status and becomes Ready.${orphanNote}`, 'good')
      }
      next = update(next, r.pid, { state: 'terminated', openFiles: [] })
      return log(next, `PID ${r.pid} exited, but parent ${parent.pid} has not called wait(). It is now a zombie.${orphanNote}`, 'bad')
    }
  }
}
