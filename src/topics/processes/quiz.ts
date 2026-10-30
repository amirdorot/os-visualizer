import type { Question } from '../../types'

export const processesQuiz: Question[] = [
  {
    kind: 'mcq',
    id: 'proc-io-state',
    prompt: 'A running process issues a disk read. Which state does it move to?',
    options: ['Ready', 'Waiting (Blocked)', 'Terminated', 'New'],
    answer: 1,
    explanation: 'It cannot continue until the data arrives, so it blocks in the Waiting state and the CPU is given to another Ready process. When the I/O interrupt arrives it moves back to Ready (not straight to Running).',
  },
  {
    kind: 'mcq',
    id: 'proc-fork-return',
    prompt: 'What does fork() return?',
    options: [
      'The child PID in both processes',
      '0 in the parent, the child PID in the child',
      'The child PID in the parent, 0 in the child',
      'Always 0 on success',
    ],
    answer: 2,
    explanation: 'One call, two returns: the parent gets the new child\'s PID so it can wait() for it; the child gets 0 so it knows it is the child. A negative value means fork failed.',
  },
  {
    kind: 'predict',
    id: 'proc-fork-count',
    prompt: 'How many processes exist (including the original) after this code runs?',
    scenario: 'int main() {\n  fork();\n  fork();\n  fork();\n}',
    answer: 8,
    unit: 'processes',
    explanation: 'Each fork() doubles the number of processes executing the following code: 1 -> 2 -> 4 -> 8.',
  },
  {
    kind: 'mcq',
    id: 'proc-zombie',
    prompt: 'A child process exits, but its parent never calls wait(). What is the child now?',
    options: ['An orphan', 'A zombie', 'A daemon', 'Ready'],
    answer: 1,
    explanation: 'The process is dead but its PCB entry (with the exit status) remains so the parent can collect it. That leftover entry is a zombie. An orphan is the reverse: a live child whose parent died.',
  },
  {
    kind: 'mcq',
    id: 'proc-exec',
    prompt: 'After a successful exec("ls"), which of these stays the same?',
    options: ['The program code', 'The stack contents', 'The PID', 'The heap'],
    answer: 2,
    explanation: 'exec replaces the memory image (code, data, heap, stack) with the new program but keeps the same process: same PID, parent and (by default) open file descriptors. This is how a shell runs commands: fork, then exec in the child.',
  },
  {
    kind: 'order',
    id: 'proc-lifecycle',
    prompt: 'Order the states a typical process passes through when it reads a file once and then exits.',
    items: ['New', 'Ready', 'Running', 'Waiting', 'Ready (again)', 'Running (again)', 'Terminated'],
    explanation: 'Created (New), admitted (Ready), dispatched (Running), blocks on I/O (Waiting), I/O completes (Ready again), dispatched (Running again), exits (Terminated).',
  },
]
