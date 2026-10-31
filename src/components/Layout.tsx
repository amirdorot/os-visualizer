import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTopics } from '../data/topics'
import { writeParam } from '../hooks/useUrlState'
import { applyDocumentLocale, locales, useLocaleStore, type Locale } from '../i18n'
import { useUi } from '../i18n/ui'
import { REPO_URL, feedbackUrl } from '../lib/site'
import { useTheme } from '../store/theme'
import { Icon } from './Icon'
import { cx } from '../lib/utils'

const navClass = ({ isActive }: { isActive: boolean }) =>
  cx(
    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink',
  )

function usePageMeta(pathname: string) {
  const t = useUi()
  const topics = useTopics()
  useEffect(() => {
    const topic = topics.find((x) => x.path === pathname)
    const pages: Record<string, readonly [string, string]> = {
      '/': [t.meta.homeTitle, t.meta.homeDescription],
      '/quiz': t.meta.quiz,
      '/glossary': t.meta.glossary,
      '/about': t.meta.about,
    }
    const [title, description] = topic ? [topic.title, topic.tagline] : pages[pathname] ?? [t.meta.notFound, t.meta.homeDescription]
    document.title = pathname === '/' ? title : `${title} | OS Visualizer`
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [pathname, t, topics])
}

function LanguagePicker({ className }: { className?: string }) {
  const { locale, setLocale } = useLocaleStore()
  const t = useUi()
  return (
    <label className={cx('flex items-center gap-1 rounded-lg px-2 py-1.5 text-muted hover:bg-surface-2 hover:text-ink', className)}>
      <Icon name="globe" className="size-4" />
      <span className="sr-only">{t.layout.language}</span>
      <select
        value={locale}
        onChange={(e) => {
          setLocale(e.target.value as Locale)
          writeParam('lang', null)
        }}
        className="cursor-pointer bg-transparent text-sm font-medium outline-none"
      >
        {locales.map((l) => (
          <option key={l.id} value={l.id} lang={l.id}>
            {l.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function TopicsMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const topics = useTopics()
  const t = useUi()
  const active = topics.some((x) => x.path === pathname)

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
        {t.layout.topics}
        <Icon name="chevron" className={cx('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          id="topics-menu"
          className="absolute start-0 top-full z-50 mt-2 grid w-[560px] grid-cols-2 gap-1 rounded-2xl border border-line bg-surface p-2 shadow-xl"
          onClick={() => setOpen(false)}
        >
          {topics.map((x, i) => (
            <NavLink
              key={x.id}
              to={x.path}
              className={({ isActive }) => cx('flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-2', isActive && 'bg-surface-2')}
            >
              <span className={cx('grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white', x.accent.gradient)}>
                <Icon name={x.icon} className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  {i + 1}. {x.title}
                </span>
                <span className="block text-xs leading-snug text-muted">{x.tagline}</span>
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
  const locale = useLocaleStore((s) => s.locale)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const topics = useTopics()
  const t = useUi()
  usePageMeta(location.pathname)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => applyDocumentLocale(locale), [locale])

  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) {
      window.scrollTo({ top: 0 })
      return
    }
    // Topic pages load lazily, so wait for the target section to appear.
    let tries = 0
    const timer = window.setInterval(() => {
      const el = document.getElementById(id)
      if (el || ++tries > 40) {
        window.clearInterval(timer)
        el?.scrollIntoView({ block: 'start' })
      }
    }, 50)
    return () => window.clearInterval(timer)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" data-chrome className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-2">
        {t.layout.skip}
      </a>
      <header data-chrome className="sticky top-0 z-40 border-b border-line bg-page/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:px-6">
          <NavLink to="/" className="me-2 flex items-center gap-2 font-bold tracking-tight" dir="ltr">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-7" />
            OS Visualizer
          </NavLink>
          <nav className="hidden flex-1 items-center gap-0.5 md:flex" aria-label={t.layout.main}>
            <TopicsMenu />
            <NavLink to="/quiz" className={navClass}>
              {t.layout.quizHub}
            </NavLink>
            <NavLink to="/glossary" className={navClass}>
              {t.layout.glossary}
            </NavLink>
            <NavLink to="/about" className={navClass}>
              {t.layout.about}
            </NavLink>
          </nav>
          <div className="ms-auto flex items-center gap-1">
            <LanguagePicker />
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === 'dark' ? t.layout.toLight : t.layout.toDark}
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
              {t.layout.menu}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-nav" className="grid max-h-[80vh] gap-1 overflow-y-auto border-t border-line px-4 py-3 md:hidden" aria-label={t.layout.main} onClick={() => setMenuOpen(false)}>
            <NavLink to="/" end className={navClass}>
              <Icon name="home" className="size-4" /> {t.layout.overview}
            </NavLink>
            {topics.map((x) => (
              <NavLink key={x.id} to={x.path} className={navClass}>
                <Icon name={x.icon} className="size-4" /> {x.title}
              </NavLink>
            ))}
            <NavLink to="/quiz" className={navClass}>
              <Icon name="quiz" className="size-4" /> {t.layout.quizHub}
            </NavLink>
            <NavLink to="/glossary" className={navClass}>
              <Icon name="book" className="size-4" /> {t.layout.glossary}
            </NavLink>
            <NavLink to="/about" className={navClass}>
              <Icon name="info" className="size-4" /> {t.layout.about}
            </NavLink>
          </nav>
        )}
      </header>
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <footer data-chrome className="border-t border-line py-6 text-sm text-muted">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          <span>{t.layout.footer}</span>
          <span className="flex flex-wrap gap-4">
            <a href={feedbackUrl(location.pathname)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-ink">
              <Icon name="chat" className="size-4" /> {t.layout.feedback}
            </a>
            <Link to="/about" className="hover:text-ink">
              {t.layout.about}
            </Link>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-ink">
              {t.layout.source}
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}
