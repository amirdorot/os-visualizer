import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { topicById, topics } from '../data/topics'
import { countCorrect, useProgress } from '../store/progress'
import type { Question } from '../types'
import { Icon } from './Icon'
import { Quiz } from './Quiz'
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

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mt-6 overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8"
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
          <div className="rounded-2xl border border-line bg-surface-2 px-4 py-3 text-center">
            <div className="text-xs uppercase tracking-wide text-muted">Quiz mastery</div>
            <div className="font-mono text-2xl font-bold">
              {correct}/{questions.length}
            </div>
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

      <div className="mt-6 grid gap-6">{children}</div>

      <div className="mt-8">
        <Quiz questions={questions} title={`${topic.title} quiz`} />
      </div>

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
    </div>
  )
}
