import type { Simulation } from '../hooks/useSimulation'
import { Icon } from './Icon'
import { Button } from './ui'

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
  return (
    <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Simulation controls">
      <Button onClick={sim.back} disabled={!sim.canBack} aria-label="Step back" title="Step back">
        <Icon name="stepBack" className="size-4" />
      </Button>
      <Button
        variant="primary"
        onClick={sim.toggle}
        disabled={!sim.playing && !sim.canForward}
        aria-label={sim.playing ? 'Pause' : 'Play'}
        title={sim.playing ? 'Pause' : 'Play'}
      >
        <Icon name={sim.playing ? 'pause' : 'play'} className="size-4" />
        <span className="hidden sm:inline">{sim.playing ? 'Pause' : 'Play'}</span>
      </Button>
      <Button onClick={sim.forward} disabled={!sim.canForward} aria-label="Step forward" title="Step forward">
        <Icon name="stepForward" className="size-4" />
      </Button>
      <Button onClick={onReset ?? (() => sim.reset())} aria-label="Reset" title="Reset">
        <Icon name="reset" className="size-4" />
      </Button>
      <label className="ml-1 flex items-center gap-2 text-xs text-muted">
        Speed
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
      {label && <span className="ml-auto font-mono text-xs text-muted">{label}</span>}
    </div>
  )
}
