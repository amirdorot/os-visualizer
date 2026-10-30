import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { cx } from '../lib/utils'
import { quizzes } from '../data/quizzes'
import { topicById, topics } from '../data/topics'
import { countCorrect, useProgress } from '../store/progress'

function LayerBlock({ to, title, sub, className }: { to: string; title: string; sub: string; className?: string }) {
  const t = topicById(to)
  return (
    <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} className={cx('flex-1', className)}>
      <Link
        to={t.path}
        className={cx('group flex h-full flex-col justify-center rounded-xl border bg-surface px-3 py-2.5 shadow-sm transition-colors hover:shadow-md', t.accent.border)}
      >
        <span className={cx('flex items-center gap-1.5 text-sm font-semibold', t.accent.text)}>
          <Icon name={t.icon} className="size-4" />
          {title}
        </span>
        <span className="mt-0.5 text-xs text-muted">{sub}</span>
      </Link>
    </motion.div>
  )
}

function Layer({ label, tone, children, delay }: { label: string; tone: string; children: ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cx('rounded-2xl border-2 p-3', tone)}
    >
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </motion.div>
  )
}

export function Home() {
  const answers = useProgress((s) => s.answers)
  const resetAll = useProgress((s) => s.resetAll)
  const total = Object.values(quizzes).flat().length
  const mastered = countCorrect(answers, Object.values(quizzes).flat().map((q) => q.id))

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <section className="grid items-center gap-8 py-10 lg:grid-cols-[1fr_1.15fr] lg:py-14">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted">
            Interactive operating systems course
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            See how an{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">operating system</span>{' '}
            really works.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Drag processes into the scheduler, trigger page faults, race threads against each other and watch a system call
            cross into the kernel. Every concept is a simulation you can play, pause and rewind, followed by a quiz with
            instant feedback.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/processes" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500">
              Start learning <Icon name="arrowRight" className="size-4" />
            </Link>
            <Link to="/quiz" className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 font-semibold hover:border-indigo-400">
              <Icon name="quiz" className="size-4" /> Test yourself
            </Link>
          </div>
          <div className="mt-6 max-w-sm">
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>Overall mastery</span>
              <span className="font-mono">
                {mastered}/{total} questions
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" initial={{ width: 0 }} animate={{ width: `${(mastered / total) * 100}%` }} />
            </div>
          </div>
        </motion.div>

        <div className="grid gap-2" aria-label="Layers of an operating system. Each block links to its topic.">
          <Layer label="User applications" tone="border-sky-500/30 bg-sky-500/5" delay={0.05}>
            <LayerBlock to="processes" title="Processes" sub="browser, shell, editor" />
            <LayerBlock to="threads" title="Threads" sub="many per process" />
          </Layer>
          <div className="relative py-1">
            <LayerBlock to="syscalls" title="System call interface" sub="read, write, fork, exec, mmap... the only door into the kernel" />
          </div>
          <Layer label="Kernel" tone="border-rose-500/30 bg-rose-500/5" delay={0.15}>
            <LayerBlock to="scheduling" title="CPU scheduler" sub="who runs next" />
            <LayerBlock to="memory" title="Memory manager" sub="paging, virtual memory" />
            <LayerBlock to="storage" title="File system" sub="inodes, directories" />
            <LayerBlock to="processes" title="Process manager" sub="PCBs, fork, exit" />
            <LayerBlock to="storage" title="Device drivers" sub="disk I/O scheduling" />
          </Layer>
          <Layer label="Hardware" tone="border-slate-500/30 bg-slate-500/5" delay={0.25}>
            <LayerBlock to="scheduling" title="CPU" sub="registers, timer" />
            <LayerBlock to="memory" title="RAM + MMU" sub="frames, page tables" />
            <LayerBlock to="storage" title="Disk" sub="blocks, cylinders" />
          </Layer>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Topics</h2>
          {mastered > 0 && (
            <button type="button" onClick={resetAll} className="text-xs text-muted underline hover:text-ink">
              Reset all progress
            </button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t, i) => {
            const qs = quizzes[t.id]
            const done = countCorrect(answers, qs.map((q) => q.id))
            const complete = done === qs.length
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} whileHover={{ y: -4 }}>
                <Link to={t.path} className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-sm hover:shadow-lg">
                  <div className={cx('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', t.accent.gradient)} />
                  <div className="flex items-start justify-between">
                    <div className={cx('grid size-11 place-items-center rounded-xl text-white bg-gradient-to-br', t.accent.gradient)}>
                      <Icon name={t.icon} className="size-6" />
                    </div>
                    {complete ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <Icon name="check" className="size-3.5" /> Mastered
                      </span>
                    ) : done > 0 ? (
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">In progress</span>
                    ) : (
                      <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">New</span>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    {i + 1}. {t.title}
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-muted">{t.tagline}</p>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs text-muted">
                      <span>Quiz</span>
                      <span className="font-mono">
                        {done}/{qs.length}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div className={cx('h-full rounded-full', t.accent.bg)} style={{ width: `${(done / qs.length) * 100}%` }} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          ['Play', 'Each topic has live simulations. Change the inputs, press play, step forward and backward in time.'],
          ['Explain', 'Hover underlined terms for definitions, and read the event log to see what the kernel is doing and why.'],
          ['Check', 'Finish each topic with a quiz: multiple choice, predict-the-result and drag-to-order, with instant feedback.'],
        ].map(([title, text], i) => (
          <div key={title} className="rounded-2xl border border-line bg-surface p-5">
            <div className="mb-2 font-mono text-sm text-indigo-500">0{i + 1}</div>
            <div className="font-semibold">{title}</div>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
