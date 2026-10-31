import type { ChallengeMeta } from '../types'

export const challenges: Record<string, ChallengeMeta[]> = {
  processes: [
    { id: 'ch-proc-zombie', title: 'Create a zombie process', hint: 'Dispatch bash, fork(), preempt bash with a timer interrupt, dispatch the child and call exit(). The parent never waited.' },
    { id: 'ch-proc-reap', title: 'Reap a zombie with wait()', hint: 'After creating a zombie, dispatch its parent and call wait().' },
    { id: 'ch-proc-orphan', title: 'Create an orphan', hint: 'Fork a child, then make the parent call exit() while the child is still alive.' },
    { id: 'ch-proc-tree', title: 'Build a family three generations deep', hint: 'Fork a child, run the child, and have the child fork too.' },
    { id: 'ch-proc-shell', title: 'Do what a shell does: fork, then exec in the child', hint: 'Fork from bash, run the child, then call exec() so it becomes another program.' },
  ],
  threads: [
    { id: 'ch-thr-lose2', title: 'Lose at least 2 updates (mutex off)', hint: 'Use more increments per thread, or play scheduler: LOAD in both threads before either STOREs, twice.' },
    { id: 'ch-thr-perfect', title: 'Get the correct total without a mutex by scheduling carefully', hint: 'Use the Run buttons and let each thread finish LOAD, ADD, STORE before switching. At least 2 threads and 2 increments each.' },
    { id: 'ch-thr-mutex', title: 'Finish with the mutex on using 3 or more threads', hint: 'Turn the mutex on, set 3 threads and press play. Watch threads block on lock().' },
  ],
  scheduling: [
    { id: 'ch-sched-rr-beats', title: 'Make Round Robin beat FCFS on average waiting time', hint: 'Put one long job first and several short jobs right behind it, then select Round Robin.' },
    { id: 'ch-sched-convoy', title: 'Create a convoy: FCFS average waiting time at least 3 times SJF', hint: 'A very long job arriving first, followed by many short ones, makes FCFS look terrible.' },
    { id: 'ch-sched-switches', title: 'Cause at least 8 context switches', hint: 'Use Round Robin with quantum 1 and a few jobs of medium length.' },
    { id: 'ch-sched-srtf', title: 'Find a workload where SRTF preempts a running job', hint: 'Start a long job at time 0 and let a short one arrive at time 1, then choose SRTF.' },
  ],
  memory: [
    { id: 'ch-mem-fault', title: 'Trigger and handle a page fault', hint: 'Type an address that falls in a page marked "i" (invalid), then press Handle page fault.' },
    { id: 'ch-mem-lru', title: 'Find a reference string where LRU has at least 4 fewer faults than FIFO', hint: 'The default string has a gap of 3. LRU wins when a few pages are reused constantly; FIFO evicts them anyway because they were loaded long ago.' },
    { id: 'ch-mem-belady', title: "Show Belady's anomaly: more frames, more FIFO faults", hint: 'Press "Belady example" and choose 3 frames with FIFO.' },
    { id: 'ch-mem-frag', title: 'Make an allocation fail even though enough memory is free in total', hint: 'Load the fragmented example and request 25 KB.' },
  ],
  storage: [
    { id: 'ch-sto-grow', title: 'Fail to grow a contiguous file', hint: 'With contiguous allocation, select a file that has another file right after it and append a block.' },
    { id: 'ch-sto-scatter', title: 'Create a linked file whose blocks are not consecutive', hint: 'Switch to linked allocation. The deleted notes.txt left a hole, so a 4-block file will be split.' },
    { id: 'ch-sto-sstf', title: 'Find requests where SSTF moves the head less than a third as far as FCFS', hint: 'Make the queue zig-zag across the disk, e.g. 10, 190, 20, 180, 30, 170. FCFS crosses the whole disk every time.' },
  ],
  syscalls: [
    { id: 'ch-sys-read', title: 'Follow read() all the way back to user mode', hint: 'Select read() and step to the last step.' },
    { id: 'ch-sys-block', title: 'Catch the process while it is blocked in the kernel', hint: 'Step through read() until the process state shows WAITING.' },
    { id: 'ch-sys-break', title: 'Try to break the rules with a privileged instruction', hint: 'Use the buttons in "Try to break the rules".' },
  ],
  sync: [
    { id: 'ch-sync-full', title: 'Fill the buffer so a producer blocks', hint: 'Run only the producer until wait(empty) cannot continue.' },
    { id: 'ch-sync-empty', title: 'Make a consumer block on an empty buffer', hint: 'Reset, then run the consumer first.' },
    { id: 'ch-sync-bug', title: 'Break the unsafe version: overflow or underflow the buffer', hint: 'Switch to "No semaphores" and keep running one side.' },
    { id: 'ch-sync-ten', title: 'Move 10 items through the safe buffer', hint: 'Use the safe version and press play.' },
  ],
  deadlock: [
    { id: 'ch-dl-deadlock', title: 'Create a deadlock', hint: 'P1 takes R1, P2 takes R2, then P1 requests R2 and P2 requests R1.' },
    { id: 'ch-dl-three', title: 'Create a deadlock cycle involving all 3 processes', hint: 'Give each process one resource, then have each request the next one around the circle.' },
    { id: 'ch-dl-safe', title: "Find a safe sequence with the banker's algorithm", hint: 'Load the textbook example and run the safety check.' },
    { id: 'ch-dl-unsafe', title: 'Make the system unsafe', hint: 'Reduce Available or raise a Max value until no safe sequence exists.' },
  ],
}

export function challengeIds(topic: string) {
  return (challenges[topic] ?? []).map((c) => c.id)
}
