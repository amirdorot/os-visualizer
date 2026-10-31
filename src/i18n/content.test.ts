import { describe, expect, it } from 'vitest'
import { challengeText, challenges } from '../data/challenges'
import { quizText, quizzes } from '../data/quizzes'

describe('translations', () => {
  for (const [topic, byLocale] of Object.entries(quizText)) {
    it(`${topic} quiz translations line up with the English questions`, () => {
      const english = new Map(quizzes[topic].map((q) => [q.id, q]))
      for (const [locale, texts] of Object.entries(byLocale)) {
        expect(Object.keys(texts ?? {}).sort(), locale).toEqual([...english.keys()].sort())
        for (const [id, t] of Object.entries(texts ?? {})) {
          const q = english.get(id)!
          if (q.kind === 'mcq' && t.options) expect(t.options, `${locale} ${id}`).toHaveLength(q.options.length)
          if (q.kind === 'order') {
            expect(t.items, `${locale} ${id}`).toHaveLength(q.items.length)
            expect(new Set(t.items).size).toBe(q.items.length)
          }
        }
      }
    })
  }

  for (const [topic, byLocale] of Object.entries(challengeText)) {
    it(`${topic} challenge translations cover every challenge`, () => {
      const ids = challenges[topic].map((c) => c.id).sort()
      for (const [locale, texts] of Object.entries(byLocale)) expect(Object.keys(texts ?? {}).sort(), locale).toEqual(ids)
    })
  }
})
