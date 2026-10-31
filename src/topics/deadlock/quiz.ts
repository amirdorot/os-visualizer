import type { Question } from '../../types'

export const deadlockQuiz: Question[] = [
  {
    kind: 'mcq',
    id: 'dl-coffman',
    prompt: 'Which of these is NOT one of the four necessary conditions for deadlock?',
    options: ['Mutual exclusion', 'Hold and wait', 'Preemption', 'Circular wait'],
    answer: 2,
    explanation: 'The conditions are mutual exclusion, hold and wait, NO preemption, and circular wait. If resources can be taken away (preempted), a deadlock can be broken.',
  },
  {
    kind: 'mcq',
    id: 'dl-ordering',
    prompt: 'Every thread acquires locks in increasing order of lock number. Which deadlock condition does this break?',
    options: ['Mutual exclusion', 'Hold and wait', 'No preemption', 'Circular wait'],
    answer: 3,
    explanation: 'A cycle would need some thread to hold a higher-numbered lock while waiting for a lower one, which the ordering forbids. Lock ordering is the most common deadlock prevention technique in practice.',
  },
  {
    kind: 'mcq',
    id: 'dl-cycle-multi',
    prompt: 'A resource type has 2 instances and the resource allocation graph contains a cycle. Is the system deadlocked?',
    options: ['Yes, always', 'Not necessarily: with multiple instances a cycle is necessary but not sufficient', 'No, never', 'Only if there are more than 2 processes'],
    answer: 1,
    explanation: 'With single-instance resources, a cycle means deadlock. With several instances, a process outside the cycle may release an instance and break it, so you need a detection algorithm.',
  },
  {
    kind: 'predict',
    id: 'dl-need',
    prompt: "In the banker's algorithm, a process has Max = (7, 5, 3) and Allocation = (0, 1, 0). What is its total Need across all three resource types?",
    answer: 14,
    unit: 'units',
    explanation: 'Need = Max - Allocation = (7, 4, 3), and 7 + 4 + 3 = 14.',
  },
  {
    kind: 'mcq',
    id: 'dl-unsafe',
    prompt: 'The banker\'s safety check finds no safe sequence. What does that mean?',
    options: [
      'The system is already deadlocked',
      'The state is unsafe: deadlock is possible if processes request their maximum, so the request that led here should be refused',
      'A process has crashed',
      'There is a bug in the algorithm',
    ],
    answer: 1,
    explanation: 'Unsafe is not the same as deadlocked: processes might release resources early. But the OS can no longer guarantee that everyone will finish, so the banker refuses requests that would lead to an unsafe state.',
  },
]
