import type { Simulation } from '../hooks/useSimulation'
import { Icon } from './Icon'
import { Button } from './ui'
import { useUi } from '../i18n/ui'

const speeds = [0.5, 1, 2, 4]

export function SimControls<S>({
  sim,
  label,
  onReset,
}: {
  sim: Simulation<S>
  label?: string
  onReset?: () => void
}) {
  const t = useUi().sim
  return (
    // Playback controls keep their left-to-right timeline order in every language.

    <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label={t.controls} dir="ltr">
      <Button onClick={sim.back} disabled={!sim.canBack} aria-label={t.back} title={t.back}>
        <Icon name="stepBack" className="size-4" />
      </Button>
      <Button
        variant="primary"
        onClick={sim.toggle}
        disabled={!sim.playing && !sim.canForward}
        aria-label={sim.playing ? t.pause : t.play}
        title={sim.playing ? t.pause : t.play}
      >
        <Icon name={sim.playing ? 'pause' : 'play'} className="size-4" />
        <span className="hidden sm:inline">{sim.playing ? t.pause : t.play}</span>
      </Button>
      <Button onClick={sim.forward} disabled={!sim.canForward} aria-label={t.forward} title={t.forward}>
        <Icon name="stepForward" className="size-4" />
      </Button>
      <Button onClick={onReset ?? (() => sim.reset())} aria-label={t.reset} title={t.reset}>
        <Icon name="reset" className="size-4" />
      </Button>
      <label className="ms-1 flex items-center gap-2 text-xs text-muted">
        {t.speed}
        <select
          value={sim.speed}
          onChange={(e) => sim.setSpeed(Number(e.target.value))}
          className="rounded-md border border-line bg-surface-2 px-1.5 py-1 text-ink"
        >
          {speeds.map((s) => (
            <option key={s} value={s}>
              {s}x
            </option>
          ))}
        </select>
      </label>
      {label && <span className="ms-auto font-mono text-xs text-muted">{label}</span>}
    </div>
  )
}
