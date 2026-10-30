import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Quiz } from '../components/Quiz'
import { Button, Card, Segmented } from '../components/ui'
import { cx, shuffle } from '../lib/utils'
import { questionTopic, quizzes } from '../data/quizzes'
import { topicById, topics } from '../data/topics'
import { countCorrect, useProgress } from '../store/progress'
import type { Question } from '../types'

export default function QuizHub() {
  const [selected, setSelected] = useState<string[]>(topics.map((t) => t.id))
  const [count, setCount] = useState<'5' | '10' | 'all'>('10')
  const [session, setSession] = useState<{ key: number; questions: Question[] } | null>(null)
  const answers = useProgress((s) => s.answers)
  const resetTopic = useProgress((s) => s.resetTopic)

  const pool = selected.flatMap((id) => quizzes[id])
  const start = () => {
    const qs = shuffle(pool)
    setSession({ key: Date.now(), questions: count === 'all' ? qs : qs.slice(0, Number(count)) })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Quiz Hub</h1>
      <p className="mt-2 text-muted">Mix questions from any topics. Your best results are saved in this browser.</p>

      <div className="mt-6 grid gap-6">
        <Card title="Build a quiz">
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Topics to include">
            {topics.map((t) => {
              const on = selected.includes(t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelected(on ? selected.filter((x) => x !== t.id) : [...selected, t.id])}
                  className={cx(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                    on ? cx(t.accent.border, t.accent.soft, t.accent.text) : 'border-line text-muted',
                  )}
                >
                  <Icon name={on ? 'check' : t.icon} className="size-3.5" />
                  {t.title}
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              label="Number of questions"
              value={count}
              onChange={setCount}
              options={[
                { value: '5', label: '5 questions' },
                { value: '10', label: '10 questions' },
                { value: 'all', label: `All (${pool.length})` },
              ]}
            />
            <Button variant="primary" onClick={start} disabled={pool.length === 0}>
              {session ? 'New quiz' : 'Start quiz'} <Icon name="arrowRight" className="size-4" />
            </Button>
          </div>
        </Card>

        {session && <Quiz key={session.key} questions={session.questions} title="Mixed quiz" showTopic={(q) => topicById(questionTopic[q.id]).title} />}

        <Card title="Your mastery by topic" subtitle="A question counts as mastered once you have answered it correctly.">
          <div className="grid gap-3">
            {topics.map((t) => {
              const ids = quizzes[t.id].map((q) => q.id)
              const done = countCorrect(answers, ids)
              const attempts = ids.reduce((a, id) => a + (answers[id]?.attempts ?? 0), 0)
              return (
                <div key={t.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 sm:grid-cols-[180px_1fr_auto_auto]">
                  <span className={cx('text-sm font-semibold', t.accent.text)}>{t.title}</span>
                  <div className="order-last col-span-2 h-2 overflow-hidden rounded-full bg-surface-2 sm:order-none sm:col-span-1">
                    <div className={cx('h-full rounded-full transition-all', t.accent.bg)} style={{ width: `${(done / ids.length) * 100}%` }} />
                  </div>
                  <span className="font-mono text-sm">
                    {done}/{ids.length}
                    <span className="ml-2 text-xs text-muted">({attempts} tries)</span>
                  </span>
                  <button type="button" onClick={() => resetTopic(ids)} disabled={attempts === 0} className="hidden text-xs text-muted underline hover:text-ink disabled:opacity-30 sm:block">
                    reset
                  </button>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
