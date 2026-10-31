import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { topics } from '../data/topics'
import { REPO_URL, feedbackUrl } from '../lib/site'
import { useTheme } from '../store/theme'
import { Icon } from './Icon'
import { cx } from '../lib/utils'

const navClass = ({ isActive }: { isActive: boolean }) =>
  cx(
    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink',
  )

const pageMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'OS Visualizer - How Operating Systems Work',
    description: 'Interactive simulations of processes, threads, synchronization, deadlock, CPU scheduling, memory, file systems and system calls, with quizzes and instant feedback.',
  },
  '/quiz': { title: 'Quiz Hub', description: 'Mixed quizzes, endless generated practice problems and a review of your mistakes across every operating systems topic.' },
  '/glossary': { title: 'Glossary', description: 'Definitions of the key operating systems terms used across OS Visualizer.' },
  '/about': { title: 'About', description: 'What OS Visualizer is, who it is for, and how to give feedback.' },
}

function usePageMeta(pathname: string) {
  useEffect(() => {
    const topic = topics.find((t) => t.path === pathname)
    const meta = topic ? { title: topic.title, description: topic.tagline } : pageMeta[pathname] ?? { title: 'Page not found', description: pageMeta['/'].description }
    document.title = pathname === '/' ? meta.title : `${meta.title} | OS Visualizer`
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
  }, [pathname])
}

function TopicsMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const active = topics.some((t) => t.path === pathname)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="topics-menu"
        onClick={() => setOpen((o) => !o)}
        className={cx(navClass({ isActive: active }), 'cursor-pointer')}
      >
        Topics
        <Icon name="chevron" className={cx('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          id="topics-menu"
          className="absolute left-0 top-full z-50 mt-2 grid w-[560px] grid-cols-2 gap-1 rounded-2xl border border-line bg-surface p-2 shadow-xl"
          onClick={() => setOpen(false)}
        >
          {topics.map((t, i) => (
            <NavLink
              key={t.id}
              to={t.path}
              className={({ isActive }) => cx('flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-2', isActive && 'bg-surface-2')}
            >
              <span className={cx('grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white', t.accent.gradient)}>
                <Icon name={t.icon} className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  {i + 1}. {t.title}
                </span>
                <span className="block text-xs leading-snug text-muted">{t.tagline}</span>
              </span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export function Layout() {
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  usePageMeta(location.pathname)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-page/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:px-6">
          <NavLink to="/" className="mr-2 flex items-center gap-2 font-bold tracking-tight">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-7" />
            OS Visualizer
          </NavLink>
          <nav className="hidden flex-1 items-center gap-0.5 md:flex" aria-label="Main">
            <TopicsMenu />
            <NavLink to="/quiz" className={navClass}>
              Quiz Hub
            </NavLink>
            <NavLink to="/glossary" className={navClass}>
              Glossary
            </NavLink>
            <NavLink to="/about" className={navClass}>
              About
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink"
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-ink md:hidden"
            >
              Menu
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-nav" className="grid max-h-[80vh] gap-1 overflow-y-auto border-t border-line px-4 py-3 md:hidden" aria-label="Main" onClick={() => setMenuOpen(false)}>
            <NavLink to="/" end className={navClass}>
              <Icon name="home" className="size-4" /> Overview
            </NavLink>
            {topics.map((t) => (
              <NavLink key={t.id} to={t.path} className={navClass}>
                <Icon name={t.icon} className="size-4" /> {t.title}
              </NavLink>
            ))}
            <NavLink to="/quiz" className={navClass}>
              <Icon name="quiz" className="size-4" /> Quiz Hub
            </NavLink>
            <NavLink to="/glossary" className={navClass}>
              <Icon name="book" className="size-4" /> Glossary
            </NavLink>
            <NavLink to="/about" className={navClass}>
              <Icon name="info" className="size-4" /> About
            </NavLink>
          </nav>
        )}
      </header>
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line py-6 text-sm text-muted">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          <span>OS Visualizer: learn operating systems by playing with them.</span>
          <span className="flex flex-wrap gap-4">
            <a href={feedbackUrl(location.pathname)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-ink">
              <Icon name="chat" className="size-4" /> Feedback on this page
            </a>
            <Link to="/about" className="hover:text-ink">
              About
            </Link>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-ink">
              Source code
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}
