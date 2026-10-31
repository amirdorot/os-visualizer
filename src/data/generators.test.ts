import { describe, expect, it } from 'vitest'
import { nextRandom } from '../engines/threads'
import { locales } from '../i18n'
import { generate, generators, type Rng } from './generators'

function seeded(seed: number): Rng {
  let s = seed
  return () => {
    const [r, next] = nextRandom(s)
    s = next
    return r
  }
}

describe('question generators', () => {
  for (const [topic, gens] of Object.entries(generators)) {
    it(`${topic}: every generator produces valid questions in every language`, () => {
      const rng = seeded(topic.length * 997)
      for (const gen of gens) {
        for (let i = 0; i < 200; i++) {
          const q = gen(rng, locales[i % locales.length].id)
          expect(q.id).toMatch(/^gen-/)
          expect(q.prompt.length).toBeGreaterThan(10)
          expect(q.explanation.length).toBeGreaterThan(10)
          if (q.kind === 'mcq') {
            expect(q.answer).toBeGreaterThanOrEqual(0)
            expect(q.answer).toBeLessThan(q.options.length)
            expect(new Set(q.options).size).toBe(q.options.length)
          }
          if (q.kind === 'predict') expect(Number.isFinite(q.answer)).toBe(true)
        }
      }
    })
  }

  it('is reproducible with the same seed', () => {
    const a = generate(Object.keys(generators), seeded(5))
    const b = generate(Object.keys(generators), seeded(5))
    expect(a).toEqual(b)
  })
})
