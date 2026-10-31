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

export interface OSStats {
  forks: number
  execs: number
  zombies: number
  reaped: number
  orphans: number
  ioCompleted: number
}

/** What happened, as data; the page turns it into a sentence in the reader's language. */
export type ProcMsg =
  | { k: 'boot' }
  | { k: 'tableFull' }
  | { k: 'onlyNewAdmit' }
  | { k: 'cpuBusy' }
  | { k: 'onlyReadyDispatch' }
  | { k: 'notWaitingIo' }
  | { k: 'onlyRunningFork' }
  | { k: 'noneRunning' }
  | { k: 'created'; pid: number; program: string }
  | { k: 'admitted'; pid: number }
  | { k: 'dispatched'; pid: number }
  | { k: 'tick'; pid: number; pc: number }
  | { k: 'timeout'; pid: number }
  | { k: 'io'; pid: number }
  | { k: 'ioDone'; pid: number }
  | { k: 'fork'; pid: number; child: number; program: string }
  | { k: 'exec'; pid: number; program: string }
  | { k: 'waitNoChildren'; pid: number }
  | { k: 'reaped'; pid: number; child: number }
  | { k: 'waitBlocks'; pid: number }
  | { k: 'exitInit'; pid: number; orphans: number[] }
  | { k: 'exitWoken'; pid: number; parent: number; orphans: number[] }
  | { k: 'exitZombie'; pid: number; parent: number; orphans: number[] }

export interface OSState {
  procs: PCB[]
  nextPid: number
  log: { msg: ProcMsg; tone: 'info' | 'good' | 'bad' }[]
  stats: OSStats
}

export function treeDepth(s: OSState): number {
  const depth = (pid: number): number => {
    const p = s.procs.find((x) => x.pid === pid)
    return !p || p.ppid === INIT_PID ? 1 : 1 + depth(p.ppid)
  }
  return Math.max(0, ...s.procs.map((p) => depth(p.pid)))
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
    log: [{ msg: { k: 'boot' }, tone: 'info' }],
    stats: { forks: 0, execs: 0, zombies: 0, reaped: 0, orphans: 0, ioCompleted: 0 },
  }
}

function bump(s: OSState, key: keyof OSStats, by = 1): OSState {
  return by === 0 ? s : { ...s, stats: { ...s.stats, [key]: s.stats[key] + by } }
}

export function running(s: OSState): PCB | undefined {
  return s.procs.find((p) => p.state === 'running')
}

/** Returns why an action is not allowed right now, or null if it is. */
export function blockedReason(s: OSState, a: ProcAction): ProcMsg | null {
  const r = running(s)
  const find = (pid: number) => s.procs.find((p) => p.pid === pid)
  switch (a.type) {
    case 'create':
      return s.procs.length >= 9 ? { k: 'tableFull' } : null
    case 'admit':
      return find(a.pid)?.state === 'new' ? null : { k: 'onlyNewAdmit' }
    case 'dispatch':
      if (r) return { k: 'cpuBusy' }
      return find(a.pid)?.state === 'ready' ? null : { k: 'onlyReadyDispatch' }
    case 'ioDone':
      return find(a.pid)?.waitingFor === 'io' ? null : { k: 'notWaitingIo' }
    case 'fork':
      if (s.procs.length >= 9) return { k: 'tableFull' }
      return r ? null : { k: 'onlyRunningFork' }
    case 'tick':
    case 'timeout':
    case 'io':
    case 'exec':
    case 'wait':
    case 'exit':
      return r ? null : { k: 'noneRunning' }
  }
}

function log(s: OSState, msg: ProcMsg, tone: 'info' | 'good' | 'bad' = 'info'): OSState {
  return { ...s, log: [{ msg, tone }, ...s.log].slice(0, 40) }
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
      return log({ ...s, procs: [...s.procs, pcb], nextPid: s.nextPid + 1 }, { k: 'created', pid: pcb.pid, program: a.program })
    }
    case 'admit':
      return log(update(s, a.pid, { state: 'ready' }), { k: 'admitted', pid: a.pid })
    case 'dispatch':
      return log(update(s, a.pid, { state: 'running' }), { k: 'dispatched', pid: a.pid }, 'good')
    case 'tick':
      return log(update(s, r.pid, { pc: r.pc + 4, cpuTime: r.cpuTime + 1 }), { k: 'tick', pid: r.pid, pc: r.pc + 4 })
    case 'timeout':
      return log(update(s, r.pid, { state: 'ready' }), { k: 'timeout', pid: r.pid })
    case 'io':
      return log(update(s, r.pid, { state: 'waiting', waitingFor: 'io' }), { k: 'io', pid: r.pid })
    case 'ioDone':
      return log(bump(update(s, a.pid, { state: 'ready', waitingFor: null }), 'ioCompleted'), { k: 'ioDone', pid: a.pid }, 'good')
    case 'fork': {
      const child: PCB = { ...r, pid: s.nextPid, ppid: r.pid, state: 'ready', cpuTime: 0, waitingFor: null }
      const next = bump({ ...s, procs: [...s.procs, child], nextPid: s.nextPid + 1 }, 'forks')
      return log(
        next,
        { k: 'fork', pid: r.pid, child: child.pid, program: r.program },
        'good',
      )
    }
    case 'exec':
      return log(
        bump(update(s, r.pid, { program: a.program, pc: 0x1000 }), 'execs'),
        { k: 'exec', pid: r.pid, program: a.program },
      )
    case 'wait': {
      const children = s.procs.filter((p) => p.ppid === r.pid)
      if (children.length === 0) return log(s, { k: 'waitNoChildren', pid: r.pid }, 'bad')
      const zombie = children.find((c) => c.state === 'terminated')
      if (zombie) {
        return log(bump(remove(s, zombie.pid), 'reaped'), { k: 'reaped', pid: r.pid, child: zombie.pid }, 'good')
      }
      return log(update(s, r.pid, { state: 'waiting', waitingFor: 'child' }), { k: 'waitBlocks', pid: r.pid })
    }
    case 'exit': {
      const orphans = s.procs.filter((p) => p.ppid === r.pid)
      let next = bump(s, 'orphans', orphans.filter((o) => o.state !== 'terminated').length)
      for (const o of orphans) next = update(next, o.pid, { ppid: INIT_PID })
      for (const o of orphans.filter((o) => o.state === 'terminated')) next = remove(next, o.pid)
      const parent = s.procs.find((p) => p.pid === r.ppid)
      const orphanPids = orphans.map((o) => o.pid)

      if (r.ppid === INIT_PID || !parent) {
        return log(remove(next, r.pid), { k: 'exitInit', pid: r.pid, orphans: orphanPids })
      }
      if (parent.state === 'waiting' && parent.waitingFor === 'child') {
        next = update(remove(next, r.pid), parent.pid, { state: 'ready', waitingFor: null })
        return log(next, { k: 'exitWoken', pid: r.pid, parent: parent.pid, orphans: orphanPids }, 'good')
      }
      next = bump(update(next, r.pid, { state: 'terminated', openFiles: [] }), 'zombies')
      return log(next, { k: 'exitZombie', pid: r.pid, parent: parent.pid, orphans: orphanPids }, 'bad')
    }
  }
}
