import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cx, inputClass } from '../lib/utils'
import { glossary } from '../data/glossary'
import { topicById, topics } from '../data/topics'

export default function GlossaryPage() {
  const [q, setQ] = useState('')
  const entries = Object.values(glossary).filter(
    (e) => !q || e.term.toLowerCase().includes(q.toLowerCase()) || e.definition.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Glossary</h1>
      <p className="mt-2 text-muted">Key operating systems terms, grouped by topic.</p>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search terms..."
        aria-label="Search glossary"
        className={cx(inputClass, 'mt-5 w-full font-sans')}
      />
      <div className="mt-6 grid gap-8">
        {topics.map((t) => {
          const list = entries.filter((e) => e.topic === t.id)
          if (list.length === 0) return null
          return (
            <section key={t.id}>
              <h2 className={cx('mb-3 text-sm font-bold uppercase tracking-wider', topicById(t.id).accent.text)}>
                <Link to={t.path} className="hover:underline">
                  {t.title}
                </Link>
              </h2>
              <dl className="grid gap-3 sm:grid-cols-2">
                {list.map((e) => (
                  <div key={e.term} className="rounded-xl border border-line bg-surface p-4">
                    <dt className="font-semibold">{e.term}</dt>
                    <dd className="mt-1 text-sm text-muted">{e.definition}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )
        })}
        {entries.length === 0 && <p className="text-muted">No terms match "{q}".</p>}
      </div>
    </div>
  )
}
