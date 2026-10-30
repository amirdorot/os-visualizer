import type { Question } from '../../types'

export const syscallsQuiz: Question[] = [
  {
    kind: 'mcq',
    id: 'sys-why-trap',
    prompt: 'Why can\'t a user program simply call a kernel function directly like a normal function?',
    options: [
      'Kernel functions are written in a different language',
      'Kernel memory is protected and privileged operations require the CPU to be in kernel mode, which only a trap can enter safely',
      'It would be too slow',
      'The kernel has no functions',
    ],
    answer: 1,
    explanation: 'The CPU enforces privilege levels. A trap instruction like syscall is the only controlled door: it switches mode and jumps to a fixed kernel entry point chosen by the OS, so user code cannot run arbitrary kernel code.',
  },
  {
    kind: 'order',
    id: 'sys-order',
    prompt: 'Order the steps of a system call.',
    items: [
      'Program calls the libc wrapper, e.g. read()',
      'Wrapper puts the syscall number and arguments in registers',
      'syscall instruction traps into kernel mode',
      'Kernel looks up the handler in the system call table and runs it',
      'Result is placed in a register and the CPU returns to user mode',
    ],
    explanation: 'Wrapper, registers, trap, dispatch, return. The kernel never trusts the arguments: it validates the file descriptor and buffer pointers before using them.',
  },
  {
    kind: 'mcq',
    id: 'sys-privileged',
    prompt: 'A user-mode program executes a privileged instruction (for example, disabling interrupts). What happens?',
    options: [
      'Interrupts are disabled',
      'The instruction is silently ignored',
      'The CPU raises an exception; the kernel typically kills the process',
      'The computer reboots',
    ],
    answer: 2,
    explanation: 'The hardware refuses and raises a protection fault. The kernel handles it, usually by sending a signal (e.g. SIGSEGV or SIGILL) that terminates the program.',
  },
  {
    kind: 'mcq',
    id: 'sys-blocking',
    prompt: 'During a read() from disk that misses the cache, what does the calling process do while the disk works?',
    options: ['Busy-waits in user mode', 'Sleeps in the Waiting state while other processes run', 'Keeps the CPU in kernel mode spinning', 'Terminates and restarts'],
    answer: 1,
    explanation: 'Disks are millions of times slower than the CPU. The kernel blocks the process and schedules others; the disk interrupt later wakes it up.',
  },
  {
    kind: 'predict',
    id: 'sys-mode-switches',
    prompt: 'How many user/kernel mode switches does one simple getpid() system call involve?',
    answer: 2,
    unit: 'switches',
    explanation: 'One into the kernel (the trap) and one back out (the return to user mode). This round trip is why system calls cost more than plain function calls.',
  },
]
