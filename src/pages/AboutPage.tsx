import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Card } from '../components/ui'
import { topics } from '../data/topics'
import { REPO_URL, feedbackUrl } from '../lib/site'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">About OS Visualizer</h1>
      <p className="mt-3 text-lg leading-relaxed text-muted">
        OS Visualizer is a free, interactive companion for an operating systems course. Instead of reading about a page
        fault or a deadlock, you cause one, step through it, rewind it, and then check your understanding.
      </p>

      <div className="mt-8 grid gap-6">
        <Card title="Who it is for">
          <p className="text-sm leading-relaxed text-muted">
            Computer science students taking a first operating systems course, and anyone preparing for exams or interviews
            on the topic. The material follows the standard curriculum found in textbooks such as{' '}
            <em>Operating System Concepts</em> (Silberschatz, Galvin and Gagne) and{' '}
            <em>Operating Systems: Three Easy Pieces</em> (Arpaci-Dusseau).
          </p>
        </Card>

        <Card title="What is inside">
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {topics.map((t) => (
              <li key={t.id}>
                <Link to={t.path} className="flex items-start gap-2 hover:underline">
                  <Icon name={t.icon} className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <strong>{t.title}</strong>
                    <span className="block text-muted">{t.tagline}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            Every topic has simulations with challenges, a quiz, and unlimited generated practice. The{' '}
            <Link to="/quiz" className="underline">
              Quiz Hub
            </Link>{' '}
            mixes topics and lets you review the questions you missed.
          </p>
        </Card>

        <Card title="How the simulations work">
          <p className="text-sm leading-relaxed text-muted">
            Each simulation runs on a small, deterministic engine (the scheduler, page replacement, disk scheduling, the
            banker's algorithm and so on) that is covered by automated tests. The generated practice questions use the same
            engines to compute their answers, so the numbers you see in a simulation and in a quiz always agree.
          </p>
        </Card>

        <Card title="Your data">
          <p className="text-sm leading-relaxed text-muted">
            There are no accounts and no tracking. Quiz results, challenges and your theme are stored only in this browser's
            local storage. Clearing site data, or the "Reset all progress" link on the home page, removes them.
          </p>
        </Card>

        <Card title="Feedback and contributions">
          <p className="text-sm leading-relaxed text-muted">
            Found a mistake, a confusing explanation, or have an idea for a new simulation? Every page has a "Feedback on
            this page" link in the footer that opens a prefilled GitHub issue.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={feedbackUrl('/about')} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
              <Icon name="chat" className="size-4" /> Send feedback
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:border-indigo-400">
              View the source on GitHub
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
