import type { Question } from '../../types'

export const memoryQuiz: Question[] = [
  {
    kind: 'predict',
    id: 'mem-offset-bits',
    prompt: 'Pages are 4 KiB (4096 bytes). How many bits of a virtual address are used for the page offset?',
    answer: 12,
    unit: 'bits',
    explanation: '4096 = 2^12, so the low 12 bits select the byte within the page. The remaining high bits are the page number.',
  },
  {
    kind: 'predict',
    id: 'mem-translate',
    prompt: 'Page size is 256 bytes and page 3 is mapped to frame 7. What physical address does virtual address 800 translate to?',
    answer: 1824,
    explanation: '800 / 256 = page 3, offset 800 - 768 = 32. Frame 7 starts at 7 x 256 = 1792, so the physical address is 1792 + 32 = 1824.',
  },
  {
    kind: 'predict',
    id: 'mem-fifo-faults',
    prompt: 'With 3 frames (initially empty) and FIFO replacement, how many page faults occur?',
    scenario: 'Reference string: 1 2 3 4 1 2 5 1 2 3 4 5',
    answer: 9,
    unit: 'faults',
    explanation: 'FIFO faults on 1,2,3,4,1,2,5, hits on 1,2, then faults on 3,4 (5 is still resident): 9 faults. Strangely, with 4 frames FIFO gets 10 faults: Belady\'s anomaly.',
  },
  {
    kind: 'mcq',
    id: 'mem-opt',
    prompt: 'Why is the Optimal (OPT) page replacement algorithm not used in real operating systems?',
    options: [
      'It is too slow to compute',
      'It needs to know future memory references',
      'It causes Belady\'s anomaly',
      'It only works with one frame',
    ],
    answer: 1,
    explanation: 'OPT evicts the page that will not be used for the longest time, which requires knowing the future. It is used as a benchmark; LRU and clock approximations are used in practice.',
  },
  {
    kind: 'mcq',
    id: 'mem-external-frag',
    prompt: 'There is 50 KB free in total, but a 20 KB request fails. What is the most likely cause?',
    options: ['Internal fragmentation', 'External fragmentation', 'A page fault', 'Thrashing'],
    answer: 1,
    explanation: 'The free space is split into many small holes, none of which is 20 KB. Compaction or paging (which does not need contiguous physical memory) solves it.',
  },
  {
    kind: 'order',
    id: 'mem-fault-steps',
    prompt: 'Order the steps of handling a page fault.',
    items: [
      'CPU accesses a page marked invalid in the page table',
      'MMU raises a page-fault trap to the kernel',
      'Kernel finds a free frame (evicting a victim if needed)',
      'Page is read from disk into the frame',
      'Page table entry is updated and marked valid',
      'The faulting instruction is restarted',
    ],
    explanation: 'The hardware detects the missing page, the kernel brings it in from backing store, fixes the mapping, and re-executes the instruction as if nothing happened.',
  },
]
