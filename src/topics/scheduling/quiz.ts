import type { Question } from '../../types'

export const schedulingQuiz: Question[] = [
  {
    kind: 'predict',
    id: 'sched-fcfs-wait',
    prompt: 'Using FCFS, what is the average waiting time?',
    scenario: 'P1 burst 24, P2 burst 3, P3 burst 3\nAll arrive at time 0 in the order P1, P2, P3.',
    answer: 17,
    unit: 'time units',
    explanation: 'P1 waits 0, P2 waits 24, P3 waits 27. (0 + 24 + 27) / 3 = 17. A long job at the front makes everyone wait: the convoy effect.',
  },
  {
    kind: 'predict',
    id: 'sched-sjf-wait',
    prompt: 'Same jobs, but now using SJF. What is the average waiting time?',
    scenario: 'P1 burst 24, P2 burst 3, P3 burst 3\nAll arrive at time 0.',
    answer: 3,
    unit: 'time units',
    explanation: 'Order is P2, P3, P1. Waits are 0, 3 and 6, so the average is 3. SJF minimizes average waiting time but needs to know burst lengths in advance.',
  },
  {
    kind: 'mcq',
    id: 'sched-rr-quantum',
    prompt: 'What happens in Round Robin when the time quantum is made extremely large?',
    options: [
      'It behaves like FCFS',
      'It behaves like SJF',
      'Every process starves',
      'Context switches become more frequent',
    ],
    answer: 0,
    explanation: 'If no process ever uses up its quantum, nobody is preempted and jobs run in arrival order, exactly like FCFS. A tiny quantum has the opposite problem: too much time is spent context switching.',
  },
  {
    kind: 'order',
    id: 'sched-ctx-order',
    prompt: 'Put the steps of a context switch from process A to process B in order.',
    items: [
      'Timer interrupt fires while A is running',
      'CPU enters kernel mode and saves A\'s registers into A\'s PCB',
      'Scheduler picks B from the ready queue',
      'Kernel loads B\'s registers from B\'s PCB',
      'Return to user mode; B resumes where it left off',
    ],
    explanation: 'The interrupt hands control to the kernel, which saves the outgoing state, makes a scheduling decision, restores the incoming state and returns to user mode.',
  },
  {
    kind: 'mcq',
    id: 'sched-starvation',
    prompt: 'Which algorithm can cause starvation of long or low-priority jobs if new work keeps arriving?',
    options: ['Round Robin', 'FCFS', 'Priority / SJF', 'None of them'],
    answer: 2,
    explanation: 'Priority and shortest-job scheduling always prefer newcomers that are more important or shorter, so a long or low-priority job may never run. Aging (gradually raising priority while waiting) fixes this.',
  },
  {
    kind: 'mcq',
    id: 'sched-ctx-cost',
    prompt: 'Why is a context switch considered pure overhead?',
    options: [
      'It erases the process memory',
      'No user work is done while state is being saved and restored, and caches/TLB become cold',
      'It requires writing the process to disk',
      'It always triggers a page fault',
    ],
    answer: 1,
    explanation: 'During the switch the CPU is doing bookkeeping, not running programs. Afterwards the new process also suffers cache and TLB misses until they warm up again.',
  },
]
