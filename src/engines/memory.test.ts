import { describe, expect, it } from 'vitest'
import { allocate, fragmentation, free, pageReplacement, translate, type MemBlock } from './memory'

const refs = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1]

describe('page replacement', () => {
  it('matches the textbook fault counts with 3 frames', () => {
    expect(pageReplacement(refs, 3, 'FIFO').at(-1)!.faults).toBe(15)
    expect(pageReplacement(refs, 3, 'LRU').at(-1)!.faults).toBe(12)
    expect(pageReplacement(refs, 3, 'OPT').at(-1)!.faults).toBe(9)
  })

  it('shows Belady\'s anomaly for FIFO', () => {
    const r = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]
    expect(pageReplacement(r, 3, 'FIFO').at(-1)!.faults).toBe(9)
    expect(pageReplacement(r, 4, 'FIFO').at(-1)!.faults).toBe(10)
  })
})

describe('address translation', () => {
  const table = [
    { frame: 5, valid: true },
    { frame: null, valid: false },
    { frame: 2, valid: true },
  ]

  it('splits the address and maps the page to a frame', () => {
    const t = translate(2 * 256 + 17, 256, table)
    expect(t).toMatchObject({ page: 2, offset: 17, frame: 2, physical: 2 * 256 + 17, fault: false })
  })

  it('reports a page fault for an invalid page', () => {
    expect(translate(300, 256, table).fault).toBe(true)
  })

  it('reports out of range addresses', () => {
    expect(translate(10_000, 256, table).outOfRange).toBe(true)
  })
})

describe('contiguous allocation', () => {
  const mem: MemBlock[] = [
    { start: 0, size: 10, owner: 'A' },
    { start: 10, size: 30, owner: null },
    { start: 40, size: 10, owner: 'B' },
    { start: 50, size: 15, owner: null },
    { start: 65, size: 35, owner: null },
  ]

  it('first fit takes the first big enough hole', () => {
    expect(allocate(mem, 'C', 12, 'first').chosen).toBe(1)
  })
  it('best fit takes the smallest big enough hole', () => {
    expect(allocate(mem, 'C', 12, 'best').chosen).toBe(3)
  })
  it('worst fit takes the largest hole', () => {
    expect(allocate(mem, 'C', 12, 'worst').chosen).toBe(4)
  })
  it('fails when no hole is large enough', () => {
    expect(allocate(mem, 'C', 40, 'first').ok).toBe(false)
  })
  it('free coalesces neighbouring holes', () => {
    const merged = free(mem, 'B')
    expect(merged).toHaveLength(2)
    expect(merged[1]).toEqual({ start: 10, size: 90, owner: null })
    expect(fragmentation(merged).largest).toBe(90)
  })
})
