import { describe, expect, it } from 'vitest'
import { simulate, type Job } from './scheduler'

const classic: Job[] = [
  { id: 'P1', arrival: 0, burst: 24, priority: 3 },
  { id: 'P2', arrival: 0, burst: 3, priority: 1 },
  { id: 'P3', arrival: 0, burst: 3, priority: 2 },
]

describe('scheduler', () => {
  it('FCFS runs jobs in arrival order', () => {
    const s = simulate(classic, 'FCFS')
    expect(s.segments.map((x) => x.id)).toEqual(['P1', 'P2', 'P3'])
    expect(s.avgWaiting).toBe(17)
    expect(s.avgTurnaround).toBe(27)
    expect(s.contextSwitches).toBe(2)
  })

  it('SJF picks the shortest job first', () => {
    const s = simulate(classic, 'SJF')
    expect(s.segments.map((x) => x.id)).toEqual(['P2', 'P3', 'P1'])
    expect(s.avgWaiting).toBe(3)
  })

  it('Round Robin with quantum 4 matches the textbook result', () => {
    const s = simulate(classic, 'RR', 4)
    const waits = Object.fromEntries(s.stats.map((x) => [x.id, x.waiting]))
    expect(waits).toEqual({ P1: 6, P2: 4, P3: 7 })
    expect(s.avgWaiting).toBeCloseTo(17 / 3)
    expect(s.segments[0]).toEqual({ id: 'P1', start: 0, end: 4 })
  })

  it('Priority runs the lowest priority number first', () => {
    const s = simulate(classic, 'PRIORITY')
    expect(s.segments.map((x) => x.id)).toEqual(['P2', 'P3', 'P1'])
  })

  it('SRTF preempts when a shorter job arrives', () => {
    const jobs: Job[] = [
      { id: 'P1', arrival: 0, burst: 8, priority: 1 },
      { id: 'P2', arrival: 1, burst: 4, priority: 1 },
      { id: 'P3', arrival: 2, burst: 9, priority: 1 },
      { id: 'P4', arrival: 3, burst: 5, priority: 1 },
    ]
    const s = simulate(jobs, 'SRTF')
    expect(s.segments.map((x) => x.id)).toEqual(['P1', 'P2', 'P4', 'P1', 'P3'])
    expect(s.avgWaiting).toBe(6.5)
  })

  it('records idle time when no job is ready', () => {
    const s = simulate(
      [
        { id: 'A', arrival: 2, burst: 2, priority: 1 },
        { id: 'B', arrival: 6, burst: 1, priority: 1 },
      ],
      'FCFS',
    )
    expect(s.segments).toEqual([
      { id: null, start: 0, end: 2 },
      { id: 'A', start: 2, end: 4 },
      { id: null, start: 4, end: 6 },
      { id: 'B', start: 6, end: 7 },
    ])
    expect(s.contextSwitches).toBe(0)
  })
})
