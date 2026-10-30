import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { topics } from '../data/topics'
import { useTheme } from '../store/theme'
import { Icon } from './Icon'
import { cx } from '../lib/utils'

const navClass = ({ isActive }: { isActive: boolean }) =>
  cx(
    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink',
  )

export function Layout() {
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-page/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:px-6">
          <NavLink to="/" className="mr-2 flex items-center gap-2 font-bold tracking-tight">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-7" />
            OS Visualizer
          </NavLink>
          <nav className="hidden flex-1 items-center gap-0.5 lg:flex" aria-label="Topics">
            {topics.map((t) => (
              <NavLink key={t.id} to={t.path} className={navClass}>
                {t.title.replace('Management', '').replace('& File Systems', '').trim()}
              </NavLink>
            ))}
            <NavLink to="/quiz" className={navClass}>
              Quiz Hub
            </NavLink>
            <NavLink to="/glossary" className={navClass}>
              Glossary
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
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-ink lg:hidden"
            >
              Menu
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-nav" className="grid gap-1 border-t border-line px-4 py-3 lg:hidden" aria-label="Topics" onClick={() => setMenuOpen(false)}>
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
          </nav>
        )}
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        OS Visualizer: learn operating systems by playing with them.
      </footer>
    </div>
  )
}
