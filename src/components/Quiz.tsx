import { AnimatePresence, Reorder, motion } from 'framer-motion'
import { useState } from 'react'
import { useProgress } from '../store/progress'
import type { OrderQuestion, PredictQuestion, Question } from '../types'
import { Icon } from './Icon'
import { cx, inputClass, shuffle } from '../lib/utils'
import { Button } from './ui'

function shuffledOrder(items: string[]) {
  if (items.length < 2) return items
  let s = shuffle(items)
  while (s.every((x, i) => x === items[i])) s = shuffle(items)
  return s
}

interface Feedback {
  correct: boolean
}

export function Quiz({
  questions,
  title = 'Check your understanding',
  showTopic,
}: {
  questions: Question[]
  title?: string
  /** Optional label rendered above each question, e.g. its topic in the mixed quiz. */
  showTopic?: (q: Question) => string
}) {
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [round, setRound] = useState(0)
  const record = useProgress((s) => s.record)
  const finished = index >= questions.length
  const q = questions[index]
  const score = Object.values(results).filter(Boolean).length

  const submit = (correct: boolean) => {
    setResults((r) => ({ ...r, [q.id]: correct }))
    record(q.id, correct)
  }

  const restart = () => {
    setIndex(0)
    setResults({})
    setRound((r) => r + 1)
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-6" aria-live="polite">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Icon name="quiz" className="size-5 text-indigo-500" />
          {title}
        </h2>
        <div className="flex items-center gap-1.5" aria-label={`Question ${Math.min(index + 1, questions.length)} of ${questions.length}`}>
          {questions.map((qq, i) => (
            <span
              key={qq.id}
              className={cx(
                'size-2.5 rounded-full',
                results[qq.id] === true && 'bg-emerald-500',
                results[qq.id] === false && 'bg-rose-500',
                results[qq.id] === undefined && (i === index ? 'bg-indigo-500' : 'bg-line'),
              )}
            />
          ))}
        </div>
      </header>

      {finished ? (
        <div className="py-6 text-center">
          <div className="text-4xl font-bold">
            {score} / {questions.length}
          </div>
          <p className="mt-2 text-muted">
            {score === questions.length
              ? 'Perfect score. You have mastered this material.'
              : score >= questions.length / 2
                ? 'Good work. Revisit the simulations for the ones you missed.'
                : 'Keep going: play with the simulations above, then try again.'}
          </p>
          <Button variant="primary" className="mt-4" onClick={restart}>
            <Icon name="reset" className="size-4" /> Try again
          </Button>
        </div>
      ) : (
        <QuestionCard
          cardKey={`${round}-${q.id}`}
          q={q}
          label={showTopic?.(q)}
          result={results[q.id]}
          onSubmit={submit}
          onNext={() => setIndex((i) => i + 1)}
          nextLabel={index === questions.length - 1 ? 'See results' : 'Next question'}
        />
      )}
    </section>
  )
}

/** One question with its answer controls and the feedback panel shown after answering. */
export function QuestionCard({
  cardKey,
  q,
  label,
  result,
  onSubmit,
  onNext,
  nextLabel,
}: {
  cardKey: string
  q: Question
  label?: string
  result: boolean | undefined
  onSubmit: (correct: boolean) => void
  onNext: () => void
  nextLabel: string
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={cardKey}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {label && <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-500">{label}</div>}
        <p className="font-medium">{q.prompt}</p>
        {q.scenario && (
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-surface-2 p-3 font-mono text-sm">{q.scenario}</pre>
        )}
        <div className="mt-4">
          <QuestionBody key={cardKey} q={q} answered={result !== undefined ? { correct: result } : null} onSubmit={onSubmit} />
        </div>
        {result !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cx(
              'mt-4 rounded-xl border p-3 text-sm',
              result ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-rose-500/40 bg-rose-500/10',
            )}
          >
            <div className="mb-1 flex items-center gap-1.5 font-semibold">
              <Icon name={result ? 'check' : 'x'} className="size-4" />
              {result ? 'Correct!' : 'Not quite.'}
            </div>
            <p className="whitespace-pre-line text-muted">{q.explanation}</p>
            <div className="mt-3 text-right">
              <Button variant="primary" onClick={onNext}>
                {nextLabel}
                <Icon name="arrowRight" className="size-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

function QuestionBody({
  q,
  answered,
  onSubmit,
}: {
  q: Question
  answered: Feedback | null
  onSubmit: (correct: boolean) => void
}) {
  if (q.kind === 'mcq') return <McqBody q={q} answered={answered} onSubmit={onSubmit} />
  if (q.kind === 'predict') return <PredictBody q={q} answered={answered} onSubmit={onSubmit} />
  return <OrderBody q={q} answered={answered} onSubmit={onSubmit} />
}

function McqBody({
  q,
  answered,
  onSubmit,
}: {
  q: Extract<Question, { kind: 'mcq' }>
  answered: Feedback | null
  onSubmit: (correct: boolean) => void
}) {
  const [picked, setPicked] = useState<number | null>(null)
  return (
    <div className="grid gap-2">
      {q.options.map((opt, i) => {
        const isAnswer = i === q.answer
        const isPicked = picked === i
        return (
          <button
            key={opt}
            type="button"
            disabled={answered !== null}
            onClick={() => {
              setPicked(i)
              onSubmit(isAnswer)
            }}
            className={cx(
              'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors',
              answered === null && 'border-line bg-surface-2 hover:border-indigo-400',
              answered !== null && isAnswer && 'border-emerald-500 bg-emerald-500/15',
              answered !== null && isPicked && !isAnswer && 'border-rose-500 bg-rose-500/15',
              answered !== null && !isAnswer && !isPicked && 'border-line opacity-60',
            )}
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line font-mono text-xs">
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function PredictBody({
  q,
  answered,
  onSubmit,
}: {
  q: PredictQuestion
  answered: Feedback | null
  onSubmit: (correct: boolean) => void
}) {
  const [value, setValue] = useState('')
  const check = () => {
    const n = Number(value)
    if (value.trim() === '' || Number.isNaN(n)) return
    onSubmit(Math.abs(n - q.answer) <= (q.tolerance ?? 0.01))
  }
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        check()
      }}
    >
      <input
        type="number"
        step="any"
        inputMode="decimal"
        aria-label="Your answer"
        value={value}
        disabled={answered !== null}
        onChange={(e) => setValue(e.target.value)}
        className={cx(inputClass, 'w-36')}
        placeholder="Your answer"
      />
      {q.unit && <span className="text-sm text-muted">{q.unit}</span>}
      {answered === null ? (
        <Button type="submit" variant="primary" disabled={value.trim() === ''}>
          Check
        </Button>
      ) : (
        <span className="text-sm">
          Correct answer: <strong className="font-mono">{q.answer}</strong> {q.unit}
        </span>
      )}
    </form>
  )
}

function OrderBody({
  q,
  answered,
  onSubmit,
}: {
  q: OrderQuestion
  answered: Feedback | null
  onSubmit: (correct: boolean) => void
}) {
  const [items, setItems] = useState(() => shuffledOrder(q.items))
  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
  }
  return (
    <div>
      <p className="mb-2 text-xs text-muted">Drag the cards (or use the arrow buttons) into the right order, top to bottom.</p>
      <Reorder.Group axis="y" values={items} onReorder={answered ? () => {} : setItems} className="grid gap-2">
        {items.map((item, i) => {
          const correctHere = q.items[i] === item
          return (
            <Reorder.Item
              key={item}
              value={item}
              dragListener={answered === null}
              className={cx(
                'flex items-center gap-2 rounded-xl border bg-surface-2 px-3 py-2 text-sm',
                answered === null && 'cursor-grab border-line active:cursor-grabbing',
                answered !== null && (correctHere ? 'border-emerald-500' : 'border-rose-500'),
              )}
            >
              <Icon name="grip" className="size-4 text-muted" />
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface font-mono text-xs">{i + 1}</span>
              <span className="flex-1">{item}</span>
              {answered === null && (
                <span className="flex gap-1">
                  <button type="button" aria-label={`Move "${item}" up`} onClick={() => move(i, -1)} className="rounded p-1 hover:bg-surface">
                    <Icon name="up" className="size-3.5" />
                  </button>
                  <button type="button" aria-label={`Move "${item}" down`} onClick={() => move(i, 1)} className="rounded p-1 hover:bg-surface">
                    <Icon name="down" className="size-3.5" />
                  </button>
                </span>
              )}
            </Reorder.Item>
          )
        })}
      </Reorder.Group>
      {answered === null ? (
        <Button variant="primary" className="mt-3" onClick={() => onSubmit(items.every((x, i) => x === q.items[i]))}>
          Check order
        </Button>
      ) : (
        !answered.correct && (
          <ol className="mt-3 list-decimal pl-5 text-sm text-muted">
            {q.items.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        )
      )}
    </div>
  )
}
