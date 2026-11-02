# OS Visualizer

An interactive infographic that teaches how operating systems work. Every topic pairs live, rewindable simulations with challenges that are checked automatically, a quiz with instant feedback, and unlimited generated practice problems.

**Live site:** https://os.cellact.nl/

## Topics

- **Processes**: a state diagram you operate with `fork`, `exec`, `wait`, `exit` and I/O events, plus the PCB and process tree.
- **Threads**: shared vs. per-thread memory, and a race-condition lab where you interleave `counter++` by hand or toggle a mutex.
- **Synchronization**: a semaphore playground and a bounded-buffer (producer-consumer) lab, with a broken "no semaphores" version that overflows and underflows.
- **Deadlock**: a resource allocation graph with live cycle detection, and a step-by-step banker's safety algorithm with editable matrices.
- **CPU scheduling**: drag programs into a workload and run FCFS, SJF, SRTF, Round Robin or Priority. Includes a Gantt chart, statistics and an animated context switch.
- **Memory**: virtual-to-physical address translation, FIFO/LRU/OPT page replacement and first/best/worst-fit allocation.
- **Storage**: a file system explorer (inodes, directory tree, disk blocks, bitmap) with contiguous, linked and indexed allocation, plus FCFS/SSTF/SCAN/C-SCAN disk scheduling.
- **System calls**: a step-by-step trip from user mode into the kernel and back for `read`, `write` and `getpid`.

Every simulation's settings live in the page URL, so the **Share** button (or the address bar) gives a link that reopens the exact same setup. **Present** turns a topic into slides for teaching: one simulation per slide, larger text, arrow keys to move, and links that open on a specific slide.

The site is available in English, Hebrew, Arabic and Spanish (Hebrew and Arabic are laid out right to left). Pick a language from the header, or add `?lang=he`, `?lang=ar` or `?lang=es` to a link. Technical terms stay in English in every language. Interface text lives in `src/i18n`; any text without a translation falls back to English.

The **Quiz Hub** mixes topics, offers endless practice and a review of the questions you missed. There is also a **Glossary** and an **About** page. Progress is stored in `localStorage`.

## Development

```bash
npm install
npm run dev        # start the dev server
npm test           # engine and question-generator unit tests (vitest)
npm run test:e2e   # browser tests against the production build (Playwright)
npm run lint       # oxlint
npm run build      # typecheck and build to dist/
npm run og-image   # re-render public/og-image.png (the link preview image)
```

The first time you run the browser tests, install Chromium with `npx playwright install chromium`.

Every push to `main` runs lint, unit tests and browser tests, then deploys to GitHub Pages.

## Structure

- `src/engines/`: pure, deterministic simulation logic with unit tests. No React.
- `src/data/generators.ts`: practice question generators that use the engines to compute answers.
- `src/data/challenges.ts`: the challenges shown inside each simulation.
- `src/hooks/useSimulation.ts`: the time-travel driver behind play, pause, step forward/back and reset.
- `src/components/`: the shared layout, controls, quiz, practice, challenges and glossary tooltip.
- `src/topics/<topic>/`: each topic's page and quiz questions.
- `src/pages/`: Home, Quiz Hub, Glossary and About.
- `e2e/`: Playwright browser tests for desktop and phone.

## License

[MIT](LICENSE)
