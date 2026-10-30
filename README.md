# OS Visualizer

An interactive infographic that teaches how operating systems work. Every topic pairs live, rewindable simulations with a quiz that gives instant feedback.

## Topics

- **Processes**: a state diagram you operate with `fork`, `exec`, `wait`, `exit` and I/O events, plus the PCB and process tree.
- **Threads**: shared vs. per-thread memory, and a race-condition lab where you interleave `counter++` by hand or toggle a mutex.
- **CPU scheduling**: drag programs into a workload and run FCFS, SJF, SRTF, Round Robin or Priority. Includes a Gantt chart, statistics and an animated context switch.
- **Memory**: virtual-to-physical address translation, FIFO/LRU/OPT page replacement and first/best/worst-fit allocation.
- **Storage**: a file system explorer (inodes, directory tree, disk blocks, bitmap) with contiguous, linked and indexed allocation, plus FCFS/SSTF/SCAN/C-SCAN disk scheduling.
- **System calls**: a step-by-step trip from user mode into the kernel and back for `read`, `write` and `getpid`.

There is also a mixed **Quiz Hub** and a **Glossary**. Quiz progress is stored in `localStorage`.

## Development

```bash
npm install
npm run dev      # start the dev server
npm test         # run engine unit tests (vitest)
npm run lint     # oxlint
npm run build    # typecheck and build to dist/
```

## Structure

- `src/engines/`: pure, deterministic simulation logic with unit tests. No React.
- `src/hooks/useSimulation.ts`: the time-travel driver behind play, pause, step forward/back and reset.
- `src/components/`: the shared layout, controls, quiz and glossary tooltip.
- `src/topics/<topic>/`: each topic's page and quiz questions.
- `src/pages/`: Home, Quiz Hub and Glossary.
