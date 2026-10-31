import type { ChallengeMeta, Question } from '../types'
import { forDirection, type Locale } from '.'

/** Translations for languages other than English, which lives in the original data. */
export type Translations<T> = Partial<Record<Exclude<Locale, 'en'>, T>>

/** The text of a question. Options and order items must keep the same order as the English ones. */
export interface QuestionText {
  prompt: string
  explanation: string
  options?: string[]
  items?: string[]
  unit?: string
  scenario?: string
}

export function localizeQuestions(questions: Question[], locale: Locale, text: Translations<Record<string, QuestionText>> | undefined): Question[] {
  const byId = locale === 'en' ? undefined : text?.[locale]
  return questions.map((q) => forDirection(byId?.[q.id] ? ({ ...q, ...byId[q.id] } as Question) : q, locale))
}

export function localizeChallenges(items: ChallengeMeta[], locale: Locale, text: Translations<Record<string, [title: string, hint: string]>> | undefined): ChallengeMeta[] {
  const byId = locale === 'en' ? undefined : text?.[locale]
  return items.map((c) => forDirection(byId?.[c.id] ? { ...c, title: byId[c.id][0], hint: byId[c.id][1] } : c, locale))
}
