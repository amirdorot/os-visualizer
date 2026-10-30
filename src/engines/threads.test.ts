import { describe, expect, it } from 'vitest'
import { expected, initialRace, raceDone, stepRandom, stepThread, type RaceState } from './threads'

function runToEnd(s: RaceState) {
  let guard = 0
  while (!raceDone(s) && guard++ < 10_000) s = stepRandom(s)
  return s
}

describe('threads race demo', () => {
  it('loses an update with an unlucky interleaving', () => {
    let s = initialRace(2, 1, false)
    for (const tid of [0, 1, 0, 0, 1, 1]) s = stepThread(s, tid)
    expect(raceDone(s)).toBe(true)
    expect(s.counter).toBe(1)
    expect(expected(s)).toBe(2)
  })

  it('a mutex blocks the second thread', () => {
    let s = initialRace(2, 1, true)
    s = stepThread(s, 0)
    s = stepThread(s, 1)
    expect(s.lockHolder).toBe(0)
    expect(s.threads[1].blocked).toBe(true)
    expect(s.threads[1].pc).toBe(0)
  })

  it('always reaches the expected total with a mutex', () => {
    for (const seed of [1, 7, 42, 1234, 99999]) {
      const s = runToEnd(initialRace(3, 4, true, seed))
      expect(s.counter).toBe(12)
    }
  })

  it('is deterministic for a given seed', () => {
    const a = runToEnd(initialRace(3, 3, false, 5))
    const b = runToEnd(initialRace(3, 3, false, 5))
    expect(a.counter).toBe(b.counter)
    expect(a.steps).toBe(b.steps)
  })
})
