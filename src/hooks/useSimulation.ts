import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createStore, useStore } from 'zustand'

interface SimStore<S> {
  history: S[]
  index: number
  playing: boolean
  speed: number
}

export interface SimulationOptions<S> {
  initial: () => S
  step: (state: S) => S
  isDone: (state: S) => boolean
}

export interface Simulation<S> {
  state: S
  index: number
  playing: boolean
  speed: number
  canBack: boolean
  canForward: boolean
  done: boolean
  forward: () => void
  back: () => void
  play: () => void
  pause: () => void
  toggle: () => void
  reset: (initial?: S) => void
  /** Replace the future with a new state, e.g. after a user action. */
  push: (next: S) => void
  setSpeed: (speed: number) => void
}

/**
 * A time-travelling simulation driver. Every state is kept in a history so the
 * user can step backward; stepping forward replays history before computing new states.
 */
export function useSimulation<S>(options: SimulationOptions<S>): Simulation<S> {
  const opts = useRef(options)
  useLayoutEffect(() => {
    opts.current = options
  })

  const [store] = useState(() =>
    createStore<SimStore<S>>(() => ({
      history: [options.initial()],
      index: 0,
      playing: false,
      speed: 1,
    })),
  )

  const history = useStore(store, (s) => s.history)
  const index = useStore(store, (s) => s.index)
  const playing = useStore(store, (s) => s.playing)
  const speed = useStore(store, (s) => s.speed)
  const state = history[index]
  const done = options.isDone(state)

  const forward = useCallback(() => {
    const { history, index } = store.getState()
    if (index < history.length - 1) {
      store.setState({ index: index + 1 })
      return
    }
    const current = history[index]
    if (opts.current.isDone(current)) {
      store.setState({ playing: false })
      return
    }
    store.setState({ history: [...history, opts.current.step(current)], index: index + 1 })
  }, [store])

  const back = useCallback(() => {
    const { index } = store.getState()
    if (index > 0) store.setState({ index: index - 1, playing: false })
  }, [store])

  const reset = useCallback(
    (initial?: S) => {
      store.setState({ history: [initial ?? opts.current.initial()], index: 0, playing: false })
    },
    [store],
  )

  const push = useCallback(
    (next: S) => {
      const { history, index } = store.getState()
      store.setState({ history: [...history.slice(0, index + 1), next], index: index + 1 })
    },
    [store],
  )

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(forward, 900 / speed)
    return () => window.clearInterval(id)
  }, [playing, speed, forward])

  useEffect(() => {
    if (playing && done && index === history.length - 1) store.setState({ playing: false })
  }, [playing, done, index, history.length, store])

  return {
    state,
    index,
    playing,
    speed,
    done,
    canBack: index > 0,
    canForward: index < history.length - 1 || !done,
    forward,
    back,
    play: () => store.setState({ playing: true }),
    pause: () => store.setState({ playing: false }),
    toggle: () => store.setState((s) => ({ playing: !s.playing })),
    reset,
    push,
    setSpeed: (s) => store.setState({ speed: s }),
  }
}
