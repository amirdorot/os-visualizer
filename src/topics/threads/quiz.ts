import type { Question } from '../../types'

export const threadsQuiz: Question[] = [
  {
    kind: 'mcq',
    id: 'thr-shared',
    prompt: 'Which of these is NOT shared between threads of the same process?',
    options: ['Global variables', 'Heap memory', 'Open file descriptors', 'The stack'],
    answer: 3,
    explanation: 'Each thread has its own stack (local variables, return addresses) and its own registers and program counter. Code, globals, heap and open files belong to the process and are shared.',
  },
  {
    kind: 'predict',
    id: 'thr-race-min',
    prompt: 'Two threads each run counter++ exactly once with no lock. counter++ compiles to LOAD, ADD, STORE. Starting from 0, what is the smallest possible final value?',
    answer: 1,
    explanation: 'If both threads LOAD 0 before either STOREs, both compute 1 and both write 1. One update is lost, so the result can be 1 instead of 2.',
  },
  {
    kind: 'mcq',
    id: 'thr-why-cheaper',
    prompt: 'Why is creating a thread usually cheaper than creating a process?',
    options: [
      'Threads do not need a stack',
      'Threads share the address space, so no new page tables or memory copies are needed',
      'Threads run in kernel mode',
      'Threads cannot be preempted',
    ],
    answer: 1,
    explanation: 'A new thread just needs a stack and a small control block. A new process needs its own address space, page tables and file table. Switching between threads of the same process is also cheaper because the address space (and TLB contents) stays the same.',
  },
  {
    kind: 'order',
    id: 'thr-mutex-order',
    prompt: 'Put a correctly synchronized increment of a shared counter in order.',
    items: ['lock(&m)', 'reg = counter', 'reg = reg + 1', 'counter = reg', 'unlock(&m)'],
    explanation: 'The whole read-modify-write sequence is the critical section. It must sit between lock and unlock so no other thread can interleave in the middle.',
  },
  {
    kind: 'mcq',
    id: 'thr-deadlock',
    prompt: 'Thread A holds lock X and waits for lock Y. Thread B holds Y and waits for X. What is this?',
    options: ['A race condition', 'A deadlock', 'Starvation', 'A context switch'],
    answer: 1,
    explanation: 'Each thread waits forever for a resource the other holds: a circular wait, which is a deadlock. A common fix is to always acquire locks in the same global order.',
  },
]
