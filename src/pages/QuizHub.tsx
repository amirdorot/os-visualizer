import { useState, type ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { Practice } from '../components/Practice'
import { Quiz } from '../components/Quiz'
import { Button, Card, Segmented } from '../components/ui'
import { cx, shuffle } from '../lib/utils'
import { generators } from '../data/generators'
import { questionTopic, quizzes } from '../data/quizzes'
import { topicById, topics } from '../data/topics'
import { countCorrect, mistakes, useProgress } from '../store/progress'
import type { Question } from '../types'

const questionById = new Map(Object.values(quizzes).flatMap((qs) => qs.map((q) => [q.id, q] as const)))

type Session = { key: number; mode: 'quiz' | 'review'; questions: Question[] } | { key: number; mode: 'practice'; topics: string[] }

export default function QuizHub() {
  const [selected, setSelected] = useState<string[]>(topics.map((t) => t.id))
  const [count, setCount] = useState<'5' | '10' | 'all'>('10')
  const [session, setSession] = useState<Session | null>(null)
  const answers = useProgress((s) => s.answers)
  const practice = useProgress((s) => s.practice)
  const resetTopic = useProgress((s) => s.resetTopic)

  const pool = selected.flatMap((id) => quizzes[id] ?? [])
  const practiceTopics = selected.filter((id) => generators[id])
  const missed = mistakes(answers)
    .map((id) => questionById.get(id))
    .filter((q): q is Question => q !== undefined)

  const start = () => {
    const qs = shuffle(pool)
    setSession({ key: Date.now(), mode: 'quiz', questions: count === 'all' ? qs : qs.slice(0, Number(count)) })
  }
  const label = (q: Question) => topicById(questionTopic[q.id]).title

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Quiz Hub</h1>
      <p className="mt-2 text-muted">Mix questions from any topics, practice with endless generated problems, or retry the ones you got wrong. Progress is saved in this browser.</p>

      <div className="mt-6 grid gap-6">
        <Card title="Choose topics">
          <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Topics to include">
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
          <div className="grid gap-4 sm:grid-cols-3">
            <ModeBox icon="quiz" title="Quiz" text="A fixed set of hand-written questions. Counts toward mastery.">
              <Segmented
                label="Number of questions"
                value={count}
                onChange={setCount}
                options={[
                  { value: '5', label: '5' },
                  { value: '10', label: '10' },
                  { value: 'all', label: `All ${pool.length}` },
                ]}
              />
              <Button variant="primary" onClick={start} disabled={pool.length === 0}>
                Start quiz <Icon name="arrowRight" className="size-4" />
              </Button>
            </ModeBox>
            <ModeBox icon="cycle" title="Endless practice" text={`Generated problems with new numbers each time. ${practice.correct}/${practice.answered} correct so far, best streak ${practice.bestStreak}.`}>
              <Button
                variant="primary"
                disabled={practiceTopics.length === 0}
                onClick={() => setSession({ key: Date.now(), mode: 'practice', topics: practiceTopics })}
              >
                Practice <Icon name="arrowRight" className="size-4" />
              </Button>
            </ModeBox>
            <ModeBox icon="flag" title="Review my mistakes" text={missed.length ? `${missed.length} question${missed.length === 1 ? '' : 's'} you have not answered correctly yet, from every topic.` : 'Nothing to review. Questions you get wrong will show up here.'}>
              <Button
                variant="primary"
                disabled={missed.length === 0}
                onClick={() => setSession({ key: Date.now(), mode: 'review', questions: shuffle(missed) })}
              >
                Review {missed.length > 0 && `(${missed.length})`} <Icon name="arrowRight" className="size-4" />
              </Button>
            </ModeBox>
          </div>
        </Card>

        {session?.mode === 'quiz' && <Quiz key={session.key} questions={session.questions} title="Mixed quiz" showTopic={label} />}
        {session?.mode === 'review' && <Quiz key={session.key} questions={session.questions} title="Reviewing your mistakes" showTopic={label} />}
        {session?.mode === 'practice' && <Practice key={session.key} topics={session.topics} showTopic />}

        <Card title="Your mastery by topic" subtitle="A question counts as mastered once you have answered it correctly.">
          <div className="grid gap-3">
            {topics.map((t) => {
              const ids = (quizzes[t.id] ?? []).map((q) => q.id)
              const done = countCorrect(answers, ids)
              const attempts = ids.reduce((a, id) => a + (answers[id]?.attempts ?? 0), 0)
              return (
                <div key={t.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 sm:grid-cols-[180px_1fr_auto_auto]">
                  <span className={cx('text-sm font-semibold', t.accent.text)}>{t.title}</span>
                  <div className="order-last col-span-2 h-2 overflow-hidden rounded-full bg-surface-2 sm:order-none sm:col-span-1">
                    <div className={cx('h-full rounded-full transition-all', t.accent.bg)} style={{ width: `${ids.length ? (done / ids.length) * 100 : 0}%` }} />
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

function ModeBox({ icon, title, text, children }: { icon: string; title: string; text: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface-2 p-4">
      <div className="flex items-center gap-2 font-semibold">
        <Icon name={icon} className="size-4 text-indigo-500" />
        {title}
      </div>
      <p className="flex-1 text-sm text-muted">{text}</p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}
