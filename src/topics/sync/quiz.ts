import type { Question } from '../../types'

export const syncQuiz: Question[] = [
  {
    kind: 'mcq',
    id: 'sync-empty-init',
    prompt: 'In the bounded-buffer solution with a buffer of N slots, what are the initial values of the semaphores empty, full and mutex?',
    options: ['empty = 0, full = N, mutex = 0', 'empty = N, full = 0, mutex = 1', 'empty = N, full = N, mutex = 1', 'empty = 1, full = 1, mutex = N'],
    answer: 1,
    explanation: 'empty counts free slots (all N at the start), full counts filled slots (none yet), and mutex is a binary semaphore that starts unlocked at 1.',
  },
  {
    kind: 'predict',
    id: 'sync-sem-value',
    prompt: 'A semaphore starts at 2. Threads call wait(), wait(), wait(), signal(). Afterwards, how many threads are still blocked?',
    answer: 0,
    unit: 'threads',
    explanation: 'The first two wait() calls take the value from 2 to 0. The third wait() blocks. The signal() wakes that blocked thread instead of incrementing, so no thread is left blocked and the value is 0.',
  },
  {
    kind: 'mcq',
    id: 'sync-swap-order',
    prompt: 'A producer calls wait(mutex) BEFORE wait(empty). What can happen when the buffer is full?',
    options: [
      'Nothing: the order of wait() calls never matters',
      'The buffer overflows',
      'Deadlock: the producer holds mutex while blocked on empty, so no consumer can get mutex to free a slot',
      'The consumer reads garbage',
    ],
    answer: 2,
    explanation: 'The producer sleeps on empty while holding mutex. Every consumer then blocks on wait(mutex), so no one ever signals empty. Always wait on the counting semaphore first, then take the lock.',
  },
  {
    kind: 'order',
    id: 'sync-consumer-order',
    prompt: 'Put the consumer\'s loop in the correct order.',
    items: ['wait(full)', 'wait(mutex)', 'item = buffer.take()', 'signal(mutex)', 'signal(empty)', 'consume(item)'],
    explanation: 'Wait until there is an item (full), lock the buffer, take the item, unlock, announce a free slot (empty), then do the slow work of consuming outside the critical section.',
  },
  {
    kind: 'mcq',
    id: 'sync-busy',
    prompt: 'Why does a semaphore block the waiting thread instead of looping until the value becomes positive?',
    options: [
      'Looping is not allowed in C',
      'Blocking frees the CPU for other threads, while busy waiting burns CPU time doing nothing useful',
      'Blocking is faster for very short waits',
      'Looping would cause a race condition on the buffer',
    ],
    answer: 1,
    explanation: 'A blocked thread is moved to the semaphore\'s wait queue and the scheduler runs something else. Spinning (busy waiting) only makes sense when the wait is shorter than a context switch.',
  },
]
