import { describe, expect, it } from 'vitest'
import { initialSync, isBlocked, runSemaphore, stepActor, stepRandomSync, type SyncState } from './sync'

const run = (s: SyncState, id: number, times: number) => {
  for (let i = 0; i < times; i++) s = stepActor(s, id)
  return s
}

describe('producer-consumer', () => {
  it('blocks the consumer on an empty buffer', () => {
    const s = stepActor(initialSync({ safe: true }), 1)
    expect(s.stats.consumerBlocks).toBe(1)
    expect(s.steps).toBe(0)
  })

  it('blocks the producer once the buffer is full', () => {
    let s = initialSync({ safe: true, capacity: 2 })
    s = run(s, 0, 13)
    expect(s.buffer).toEqual([1, 2])
    expect(s.actors[0].item).toBe(3)
    expect(s.sems).toEqual({ empty: 0, full: 2, mutex: 1 })
    expect(isBlocked(s, s.actors[0])).toBe(true)
    s = stepActor(s, 0)
    expect(s.stats.producerBlocks).toBe(1)
  })

  it('never overflows, underflows or loses items in the safe version', () => {
    let s = initialSync({ safe: true, producers: 2, consumers: 2, seed: 3 })
    for (let i = 0; i < 2000; i++) s = stepRandomSync(s)
    expect(s.stats.overflows + s.stats.underflows).toBe(0)
    expect(s.buffer.length).toBeLessThanOrEqual(s.capacity)
    expect(s.sems.mutex).toBeLessThanOrEqual(1)
    expect(s.consumed).toBeGreaterThan(100)
  })

  it('overflows and underflows without semaphores', () => {
    let s = initialSync({ safe: false, capacity: 2 })
    s = run(s, 0, 6)
    expect(s.stats.overflows).toBe(1)
    let t = initialSync({ safe: false })
    t = stepActor(t, 1)
    expect(t.stats.underflows).toBe(1)
    expect(t.actors[1].item).toBe(-1)
  })
})

describe('runSemaphore', () => {
  it('wakes a blocked thread instead of incrementing', () => {
    expect(runSemaphore(1, ['wait', 'wait', 'signal'])).toEqual({ value: 0, blocked: 0 })
    expect(runSemaphore(0, ['wait', 'wait', 'signal', 'signal', 'signal'])).toEqual({ value: 1, blocked: 0 })
    expect(runSemaphore(2, ['wait', 'wait', 'wait', 'wait'])).toEqual({ value: 0, blocked: 2 })
  })
})
