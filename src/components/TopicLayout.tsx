import { motion } from 'framer-motion'
import { Children, useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { topicById, topics } from '../data/topics'
import { codecs, useUrlState } from '../hooks/useUrlState'
import { countCorrect, useProgress } from '../store/progress'
import type { Question } from '../types'
import { Icon } from './Icon'
import { Practice } from './Practice'
import { Quiz } from './Quiz'
import { ShareButton } from './ShareButton'
import { Button } from './ui'
import { generators } from '../data/generators'
import { cx } from '../lib/utils'


export function TopicLayout({
  topicId,
  intro,
  keyIdeas,
  questions,
  children,
}: {
  topicId: string
  intro: ReactNode
  keyIdeas: ReactNode[]
  questions: Question[]
  children: ReactNode
}) {
  const topic = topicById(topicId)
  const answers = useProgress((s) => s.answers)
  const correct = countCorrect(
    answers,
    questions.map((q) => q.id),
  )
  const i = topics.findIndex((t) => t.id === topicId)
  const prev = topics[i - 1]
  const next = topics[i + 1]

  const sections = Children.toArray(children)
  const slideCount = sections.length + 2
  const sectionsRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLSpanElement>(null)
  const [present, setPresent] = useUrlState<'0' | '1'>('present', '0', codecs.oneOf(['0', '1']))
  const [slide, setSlide] = useUrlState('slide', 0, codecs.int(0, slideCount - 1))
  const presenting = present === '1'
  const shows = (n: number) => !presenting || slide === n

  const start = () => {
    setPresent('1')
    setSlide(0)
    document.documentElement.requestFullscreen?.().catch(() => {})
  }
  const stop = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    setPresent('0')
    setSlide(0)
  }

  useEffect(() => {
    document.documentElement.classList.toggle('presenting', presenting)
    if (!presenting) return
    const stopPresenting = () => {
      setPresent('0')
      setSlide(0)
    }
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, select, textarea, [contenteditable="true"]')) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') setSlide((s) => Math.min(slideCount - 1, s + 1))
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') setSlide((s) => Math.max(0, s - 1))
      else if (e.key === 'Escape') stopPresenting()
      else return
      e.preventDefault()
    }
    // Esc in fullscreen is swallowed by the browser, which only reports leaving fullscreen.
    const onFullscreen = () => !document.fullscreenElement && stopPresenting()
    window.addEventListener('keydown', onKey)
    document.addEventListener('fullscreenchange', onFullscreen)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('fullscreenchange', onFullscreen)
      document.documentElement.classList.remove('presenting')
    }
  }, [presenting, slideCount, setSlide, setPresent])


  useEffect(() => {
    if (!presenting) return
    window.scrollTo({ top: 0 })
    // Slide titles come from each section's own heading, whatever component renders it.
    const heading = slide === 0 ? 'Introduction' : slide === slideCount - 1 ? 'Quiz' : sectionsRef.current?.children[slide - 1]?.querySelector('h2, h3')?.textContent
    if (titleRef.current) titleRef.current.textContent = heading ?? `Part ${slide}`
  }, [presenting, slide, slideCount])

  return (
    <div className={cx('mx-auto max-w-6xl px-4 sm:px-6', presenting ? 'pb-28' : 'pb-16')}>
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cx('relative mt-6 overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8', !shows(0) && 'hidden')}
      >
        <div className={cx('absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r', topic.accent.gradient)} />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className={cx('mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider', topic.accent.text)}>
              <Icon name={topic.icon} className="size-5" />
              Topic {i + 1} of {topics.length}
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{topic.title}</h1>
            <div className="mt-3 leading-relaxed text-muted">{intro}</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-2xl border border-line bg-surface-2 px-4 py-3 text-center">
              <div className="text-xs uppercase tracking-wide text-muted">Quiz mastery</div>
              <div className="font-mono text-2xl font-bold">
                {correct}/{questions.length}
              </div>
            </div>
            {!presenting && (
              <div className="flex flex-wrap justify-end gap-1">
                <Button size="sm" variant="ghost" onClick={start} title="Show this topic as slides, one simulation at a time">
                  <Icon name="present" className="size-3.5" /> Present
                </Button>
                <ShareButton label="Share" />
              </div>
            )}
          </div>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {keyIdeas.map((idea, k) => (
            <li key={k} className={cx('rounded-xl border p-3 text-sm', topic.accent.border, topic.accent.soft)}>
              {idea}
            </li>
          ))}
        </ul>
      </motion.header>

      <div ref={sectionsRef} className="mt-6 grid gap-6">
        {sections.map((section, k) => (
          <div key={k} className={cx(!shows(k + 1) && 'hidden')}>
            {section}
          </div>
        ))}
      </div>

      <div className={cx('mt-8', !shows(slideCount - 1) && 'hidden', presenting && 'mt-6')}>
        <Quiz questions={questions} title={`${topic.title} quiz`} />
      </div>

      {!presenting && generators[topicId] && (
        <div className="mt-6">
          <Practice key={topicId} topics={[topicId]} title={`Unlimited ${topic.title.toLowerCase()} practice`} />
        </div>
      )}

      {!presenting && (
        <nav className="mt-8 flex flex-wrap justify-between gap-3" aria-label="Topic navigation">
          {prev ? (
            <Link to={prev.path} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm hover:border-indigo-400">
              <span className="block text-xs text-muted">Previous</span>
              {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={next.path} className="rounded-xl border border-line bg-surface px-4 py-3 text-right text-sm hover:border-indigo-400">
              <span className="block text-xs text-muted">Next</span>
              {next.title}
            </Link>
          ) : (
            <Link to="/quiz" className="rounded-xl border border-line bg-surface px-4 py-3 text-right text-sm hover:border-indigo-400">
              <span className="block text-xs text-muted">Finish with</span>
              The mixed Quiz Hub
            </Link>
          )}
        </nav>
      )}

      {presenting && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-page/95 backdrop-blur" role="toolbar" aria-label="Presentation controls">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 sm:px-6">
            <Button onClick={() => setSlide(Math.max(0, slide - 1))} disabled={slide === 0} aria-label="Previous slide">
              <Icon name="chevronLeft" className="size-4" />
            </Button>
            <div className="min-w-0 flex-1 text-center">
              <div className="truncate text-sm font-semibold" aria-live="polite">
                {topic.title}: <span ref={titleRef} />
              </div>
              <div className="mt-1 flex justify-center gap-1.5">
                {Array.from({ length: slideCount }, (_, n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSlide(n)}
                    aria-label={`Slide ${n + 1}`}
                    aria-current={n === slide}
                    className={cx('h-1.5 rounded-full transition-all', n === slide ? cx('w-6', topic.accent.bg) : 'w-1.5 bg-line hover:bg-muted')}
                  />
                ))}
              </div>
            </div>
            <Button onClick={() => setSlide(Math.min(slideCount - 1, slide + 1))} disabled={slide === slideCount - 1} aria-label="Next slide">
              <Icon name="chevronRight" className="size-4" />
            </Button>
            <ShareButton label="Share slide" />
            <Button variant="ghost" onClick={stop} title="Exit presentation (Esc)">
              <Icon name="x" className="size-4" /> Exit
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
