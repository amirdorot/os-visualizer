import { describe, expect, it } from 'vitest'
import { appendBlock, createFile, createFs, diskSchedule, mkdir, remove, ROOT } from './storage'

const queue = [98, 183, 37, 122, 14, 124, 65, 67]

describe('disk scheduling', () => {
  it('FCFS', () => expect(diskSchedule(queue, 53, 'FCFS').total).toBe(640))
  it('SSTF', () => {
    const p = diskSchedule(queue, 53, 'SSTF')
    expect(p.path).toEqual([53, 65, 67, 37, 14, 98, 122, 124, 183])
    expect(p.total).toBe(236)
  })
  it('SCAN towards 0', () => expect(diskSchedule(queue, 53, 'SCAN', 199, 'down').total).toBe(236))
  it('SCAN towards the end', () => expect(diskSchedule(queue, 53, 'SCAN', 199, 'up').total).toBe(331))
  it('C-SCAN counts the wrap-around', () => {
    const p = diskSchedule(queue, 53, 'CSCAN')
    expect(p.path).toEqual([53, 65, 67, 98, 122, 124, 183, 199, 0, 14, 37])
    expect(p.total).toBe(382)
    expect(p.extra).toEqual([7, 8])
  })
})

describe('file system', () => {
  it('contiguous allocation uses consecutive blocks', () => {
    const r = createFile(createFs('contiguous'), ROOT, 'a.txt', 4)
    expect(r.ok).toBe(true)
    expect(r.fs.inodes[1].blocks).toEqual([2, 3, 4, 5])
  })

  it('contiguous files cannot grow into a used block', () => {
    let fs = createFile(createFs('contiguous'), ROOT, 'a', 2).fs
    fs = createFile(fs, ROOT, 'b', 2).fs
    expect(appendBlock(fs, 1).ok).toBe(false)
  })

  it('linked allocation chains blocks with next pointers', () => {
    let fs = createFile(createFs('linked'), ROOT, 'a', 2).fs
    fs = createFile(fs, ROOT, 'b', 2).fs
    fs = appendBlock(fs, 1).fs
    expect(fs.inodes[1].blocks).toEqual([2, 3, 6])
    expect(fs.next[3]).toBe(6)
    expect(fs.next[6]).toBe(-1)
  })

  it('indexed allocation uses an index block', () => {
    const fs = createFile(createFs('indexed'), ROOT, 'a', 3).fs
    expect(fs.inodes[1].indexBlock).toBe(2)
    expect(fs.inodes[1].blocks).toEqual([3, 4, 5])
  })

  it('deleting a directory frees everything inside it', () => {
    let fs = mkdir(createFs('linked'), ROOT, 'docs').fs
    fs = createFile(fs, 1, 'a', 3).fs
    const r = remove(fs, 1)
    expect(r.fs.disk.filter((b) => b !== null && b >= 0)).toHaveLength(0)
    expect(r.fs.inodes[ROOT].children).toEqual([])
  })

  it('reports external fragmentation for contiguous allocation', () => {
    let fs = createFs('contiguous', 10)
    fs = createFile(fs, ROOT, 'a', 2).fs
    fs = createFile(fs, ROOT, 'b', 2).fs
    fs = createFile(fs, ROOT, 'c', 2).fs
    fs = remove(fs, 2).fs
    const r = createFile(fs, ROOT, 'd', 4)
    expect(r.ok).toBe(false)
    expect(r.msg).toEqual({ k: 'fragmented', size: 4, free: 4 })
  })
})
