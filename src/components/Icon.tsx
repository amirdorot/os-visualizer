const paths: Record<string, string> = {
  process: 'M4 6h16v12H4zM8 10h3M8 14h8M14 10h2',
  threads: 'M5 4c4 4 4 12 0 16M12 4v16M19 4c-4 4-4 12 0 16',
  cpu: 'M7 7h10v10H7zM10 10h4v4h-4zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4',
  memory: 'M3 8h18v8H3zM7 8v8M11 8v8M15 8v8M6 16v3M12 16v3M18 16v3',
  disk: 'M12 3c5 0 8 1.5 8 3.5v11c0 2-3 3.5-8 3.5s-8-1.5-8-3.5v-11C4 4.5 7 3 12 3zM4 6.5c0 2 3 3.5 8 3.5s8-1.5 8-3.5M4 12c0 2 3 3.5 8 3.5s8-1.5 8-3.5',
  syscall: 'M4 12h16M14 6l6 6-6 6M4 4v16',
  quiz: 'M9 9a3 3 0 1 1 4 2.8c-.7.4-1 1-1 1.7V15M12 18h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  play: 'M7 4l13 8-13 8z',
  pause: 'M7 4h4v16H7zM14 4h4v16h-4z',
  stepForward: 'M5 4l10 8-10 8zM18 4v16',
  stepBack: 'M19 4L9 12l10 8zM6 4v16',
  reset: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5',
  check: 'M5 12l5 5L20 7',
  x: 'M6 6l12 12M18 6L6 18',
  up: 'M12 19V5M5 12l7-7 7 7',
  down: 'M12 5v14M19 12l-7 7-7-7',
  grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4',
  cycle: 'M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7h.01',
  chat: 'M4 5h16v11H8l-4 4z',
  chevron: 'M6 9l6 6 6-6',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  present: 'M3 4h18v12H3zM12 16v4M8 20h8',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronRight: 'M9 6l6 6-6 6',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z',
}

/** Arrows that point "forward" or "back" in reading order, so they mirror in right-to-left languages. */
const directional = new Set(['arrowRight', 'chevronLeft', 'chevronRight'])

export function Icon({ name, className = 'size-5' }: { name: string; className?: string }) {
  return (
    <svg
      data-flip={directional.has(name) || undefined}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name] ?? paths.process} />
    </svg>
  )
}
