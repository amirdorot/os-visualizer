import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cx, inputClass } from '../lib/utils'
import { useGlossary } from '../data/glossaryText'
import { useTopics } from '../data/topics'
import { useUi } from '../i18n/ui'

export default function GlossaryPage() {
  const t = useUi().glossary
  const topics = useTopics()
  const [q, setQ] = useState('')
  const entries = Object.values(useGlossary()).filter(
    (e) => !q || e.term.toLowerCase().includes(q.toLowerCase()) || e.definition.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-2 text-muted">{t.intro}</p>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.search}
        aria-label={t.searchLabel}
        className={cx(inputClass, 'mt-5 w-full font-sans')}
      />
      <div className="mt-6 grid gap-8">
        {topics.map((x) => {
          const list = entries.filter((e) => e.topic === x.id)
          if (list.length === 0) return null
          return (
            <section key={x.id}>
              <h2 className={cx('mb-3 text-sm font-bold uppercase tracking-wider', x.accent.text)}>
                <Link to={x.path} className="hover:underline">
                  {x.title}
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
        {entries.length === 0 && <p className="text-muted">{t.noMatch(q)}</p>}
      </div>
    </div>
  )
}
