import { useState } from 'react'
import { generate } from '../data/generators'
import { topicById } from '../data/topics'
import { useProgress } from '../store/progress'
import { Icon } from './Icon'
import { QuestionCard } from './Quiz'
import { Button } from './ui'

/** Endless stream of freshly generated questions; answers are computed by the same engines that drive the simulations. */
export function Practice({ topics, title = 'Unlimited practice', showTopic = false }: { topics: string[]; title?: string; showTopic?: boolean }) {
  const [current, setCurrent] = useState(() => generate(topics))
  const [result, setResult] = useState<boolean | undefined>(undefined)
  const [streak, setStreak] = useState(0)
  const [session, setSession] = useState({ answered: 0, correct: 0 })
  const recordPractice = useProgress((s) => s.recordPractice)
  const bestStreak = useProgress((s) => s.practice.bestStreak)

  const submit = (correct: boolean) => {
    const nextStreak = correct ? streak + 1 : 0
    setResult(correct)
    setStreak(nextStreak)
    setSession((s) => ({ answered: s.answered + 1, correct: s.correct + (correct ? 1 : 0) }))
    recordPractice(correct, nextStreak)
  }

  const next = () => {
    setCurrent(generate(topics))
    setResult(undefined)
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-6" aria-live="polite">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Icon name="cycle" className="size-5 text-indigo-500" />
            {title}
          </h2>
          <p className="text-sm text-muted">New numbers every time. Answers are computed by the same code that runs the simulations.</p>
        </div>
        <div className="flex gap-2 text-center text-xs">
          <PracticeStat label="This session" value={`${session.correct}/${session.answered}`} />
          <PracticeStat label="Streak" value={String(streak)} />
          <PracticeStat label="Best streak" value={String(bestStreak)} />
        </div>
      </header>
      <QuestionCard
        cardKey={current.question.id}
        q={current.question}
        label={showTopic ? topicById(current.topic).title : undefined}
        result={result}
        onSubmit={submit}
        onNext={next}
        nextLabel="Another one"
      />
      {result === undefined && (
        <div className="mt-4 text-right">
          <Button variant="ghost" size="sm" onClick={next}>
            Skip <Icon name="arrowRight" className="size-3.5" />
          </Button>
        </div>
      )}
    </section>
  )
}

function PracticeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 px-3 py-1.5">
      <div className="text-muted">{label}</div>
      <div className="font-mono text-base font-bold">{value}</div>
    </div>
  )
}
