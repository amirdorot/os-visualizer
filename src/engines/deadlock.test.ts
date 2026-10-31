import { describe, expect, it } from 'vitest'
import { findCycle, initialRag, release, request, safety, textbookExample } from './deadlock'

describe('resource allocation graph', () => {
  it('detects the classic two-process deadlock', () => {
    let s = initialRag()
    s = request(s, 'P1', 'R1')
    s = request(s, 'P2', 'R2')
    expect(findCycle(s)).toBeNull()
    s = request(s, 'P1', 'R2')
    s = request(s, 'P2', 'R1')
    expect(findCycle(s)?.sort()).toEqual(['P1', 'P2'])
  })

  it('detects a three-process cycle', () => {
    let s = initialRag()
    for (const [p, r] of [['P1', 'R1'], ['P2', 'R2'], ['P3', 'R3'], ['P1', 'R2'], ['P2', 'R3'], ['P3', 'R1']]) s = request(s, p, r)
    expect(findCycle(s)).toHaveLength(3)
  })

  it('hands a released resource to the waiting process', () => {
    let s = initialRag()
    s = request(s, 'P1', 'R1')
    s = request(s, 'P2', 'R1')
    expect(s.waiting.P2).toBe('R1')
    s = release(s, 'P1', 'R1')
    expect(s.holder.R1).toBe('P2')
    expect(s.waiting.P2).toBeNull()
  })

  it('ignores requests from a waiting process', () => {
    let s = request(request(initialRag(), 'P1', 'R1'), 'P2', 'R1')
    s = request(s, 'P2', 'R2')
    expect(s.holder.R2).toBeNull()
  })
})

describe("banker's safety algorithm", () => {
  it('finds the textbook safe sequence', () => {
    const r = safety(textbookExample)
    expect(r.safe).toBe(true)
    expect(r.sequence).toEqual([1, 3, 4, 0, 2])
  })

  it('reports an unsafe state', () => {
    const r = safety({ ...textbookExample, available: [0, 0, 0] })
    expect(r.safe).toBe(false)
    expect(r.sequence).toEqual([])
  })
})
