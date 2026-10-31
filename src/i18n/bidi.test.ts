import { describe, expect, it } from 'vitest'
import { bidi, forDirection } from '.'

const LRM = '\u200E'

describe('bidi', () => {
  it('pins brackets around English to the English text', () => {
    expect(bidi('קרא ל-fork() עכשיו')).toBe(`קרא ל-fork${LRM}()${LRM} עכשיו`)
    expect(bidi('init (PID 1) הפעיל')).toBe(`init ${LRM}(PID 1)${LRM} הפעיל`)
  })

  it('leaves brackets around Hebrew or Arabic text alone', () => {
    expect(bidi('Ready (שוב)')).toBe('Ready (שוב)')
    expect(bidi('Ready (مجددًا)')).toBe('Ready (مجددًا)')
  })

  it('only changes right-to-left languages and never touches code scenarios', () => {
    const q = { prompt: 'fork()', scenario: 'fork();\nwait(NULL);' }
    expect(forDirection(q, 'en')).toBe(q)
    expect(forDirection(q, 'es')).toBe(q)
    expect(forDirection(q, 'he')).toEqual({ prompt: `fork${LRM}()${LRM}`, scenario: q.scenario })
    expect(forDirection(q, 'he')).toBe(forDirection(q, 'he'))
  })
})
