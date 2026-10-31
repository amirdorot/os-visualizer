import { describe, expect, it } from 'vitest'
import { INIT_PID, initialOS, reduceOS, running, treeDepth, type ProcAction } from './processes'

const run = (...actions: ProcAction[]) => actions.reduce(reduceOS, initialOS())

describe('process state machine', () => {
  it('moves through new, ready, running', () => {
    let s = run({ type: 'create', program: 'vim' })
    expect(s.procs.find((p) => p.pid === 101)?.state).toBe('new')
    s = reduceOS(s, { type: 'admit', pid: 101 })
    s = reduceOS(s, { type: 'dispatch', pid: 101 })
    expect(running(s)?.pid).toBe(101)
  })

  it('allows only one running process', () => {
    const s = run({ type: 'create', program: 'vim' }, { type: 'admit', pid: 101 }, { type: 'dispatch', pid: 100 }, { type: 'dispatch', pid: 101 })
    expect(s.procs.filter((p) => p.state === 'running')).toHaveLength(1)
    expect(s.log[0].tone).toBe('bad')
  })

  it('fork copies the parent and links the child', () => {
    const s = run({ type: 'dispatch', pid: 100 }, { type: 'fork' })
    const child = s.procs.find((p) => p.pid === 101)!
    expect(child.ppid).toBe(100)
    expect(child.program).toBe('bash')
    expect(child.state).toBe('ready')
  })

  it('exit without wait leaves a zombie that wait then reaps', () => {
    let s = run({ type: 'dispatch', pid: 100 }, { type: 'fork' }, { type: 'timeout' }, { type: 'dispatch', pid: 101 }, { type: 'exit' })
    expect(s.procs.find((p) => p.pid === 101)?.state).toBe('terminated')
    s = reduceOS(s, { type: 'dispatch', pid: 100 })
    s = reduceOS(s, { type: 'wait' })
    expect(s.procs.find((p) => p.pid === 101)).toBeUndefined()
  })

  it('a waiting parent wakes when its child exits', () => {
    const s = run({ type: 'dispatch', pid: 100 }, { type: 'fork' }, { type: 'wait' }, { type: 'dispatch', pid: 101 }, { type: 'exit' })
    expect(s.procs.find((p) => p.pid === 100)?.state).toBe('ready')
    expect(s.procs.find((p) => p.pid === 101)).toBeUndefined()
  })

  it('orphans are re-parented to init', () => {
    const s = run({ type: 'dispatch', pid: 100 }, { type: 'fork' }, { type: 'exit' })
    expect(s.procs.find((p) => p.pid === 101)?.ppid).toBe(INIT_PID)
    expect(s.stats.orphans).toBe(1)
  })

  it('counts zombies, reaps and tree depth', () => {
    let s = run({ type: 'dispatch', pid: 100 }, { type: 'fork' }, { type: 'timeout' }, { type: 'dispatch', pid: 101 }, { type: 'fork' })
    expect(treeDepth(s)).toBe(3)
    s = reduceOS(s, { type: 'exit' })
    expect(s.stats.zombies).toBe(1)
    s = reduceOS(reduceOS(s, { type: 'dispatch', pid: 100 }), { type: 'wait' })
    expect(s.stats.reaped).toBe(1)
  })

  it('exec keeps the pid but replaces the program', () => {
    const s = run({ type: 'dispatch', pid: 100 }, { type: 'exec', program: 'ls' })
    expect(running(s)).toMatchObject({ pid: 100, program: 'ls' })
  })
})
