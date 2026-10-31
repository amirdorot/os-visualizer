import { useEffect, useState } from 'react'

export interface Codec<T> {
  parse: (raw: string) => T | undefined
  format: (value: T) => string
}

export function readParam(key: string) {
  return new URLSearchParams(window.location.search).get(key)
}

/**
 * Several labs update the URL in the same render, so this edits window.location directly
 * (react-router's functional setSearchParams would see a stale query and drop updates).
 */
export function writeParam(key: string, value: string | null) {
  const params = new URLSearchParams(window.location.search)
  if (params.get(key) === value) return
  if (value === null) params.delete(key)
  else params.set(key, value)
  const query = params.toString()
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
}

/**
 * State mirrored into a URL search parameter so the current setup can be shared as a link.
 * The parameter is omitted while the value equals its default, keeping plain URLs clean.
 */
export function useUrlState<T>(key: string, initial: T, codec: Codec<T>) {
  const [value, setValue] = useState<T>(() => {
    const raw = readParam(key)
    return (raw === null ? undefined : codec.parse(raw)) ?? initial
  })
  const encoded = codec.format(value)
  const fallback = codec.format(initial)

  useEffect(() => {
    writeParam(key, encoded === fallback ? null : encoded)
  }, [key, encoded, fallback])

  return [value, setValue] as const
}

export const codecs = {
  oneOf<T extends string>(values: readonly T[]): Codec<T> {
    return { parse: (s) => (values.includes(s as T) ? (s as T) : undefined), format: (v) => v }
  },
  int(min: number, max: number): Codec<number> {
    return {
      parse: (s) => {
        const n = Number(s)
        return Number.isInteger(n) && n >= min && n <= max ? n : undefined
      },
      format: String,
    }
  },
  intOneOf(values: readonly number[]): Codec<number> {
    return { parse: (s) => (values.includes(Number(s)) ? Number(s) : undefined), format: String }
  },
  text(maxLength = 200): Codec<string> {
    return { parse: (s) => (s.length <= maxLength ? s : undefined), format: (v) => v }
  },
  /** Fixed-shape grid of small non-negative integers, e.g. "0.1.0_2.0.0" for [[0,1,0],[2,0,0]]. */
  grid(rows: number, cols: number, max: number): Codec<number[][]> {
    return {
      parse: (s) => {
        const g = s.split('_').map((r) => r.split('.').map(Number))
        const ok = g.length === rows && g.every((r) => r.length === cols && r.every((n) => Number.isInteger(n) && n >= 0 && n <= max))
        return ok ? g : undefined
      },
      format: (g) => g.map((r) => r.join('.')).join('_'),
    }
  },
}
