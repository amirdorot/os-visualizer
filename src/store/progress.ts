import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AnswerRecord {
  correct: boolean
  attempts: number
}

interface ProgressStore {
  answers: Record<string, AnswerRecord>
  challenges: Record<string, true>
  lastChallenge: string | null
  practice: { answered: number; correct: number; bestStreak: number }
  record: (questionId: string, correct: boolean) => void
  completeChallenge: (id: string) => void
  clearLastChallenge: () => void
  recordPractice: (correct: boolean, streak: number) => void
  resetTopic: (questionIds: string[], challengeIds?: string[]) => void
  resetAll: () => void
}

const emptyPractice = { answered: 0, correct: 0, bestStreak: 0 }

export const useProgress = create<ProgressStore>()(
  persist(
    (set) => ({
      answers: {},
      challenges: {},
      practice: emptyPractice,
      record: (questionId, correct) =>
        set((s) => {
          const prev = s.answers[questionId]
          return {
            answers: {
              ...s.answers,
              // Once a question has been answered correctly it stays mastered.
              [questionId]: {
                correct: correct || (prev?.correct ?? false),
                attempts: (prev?.attempts ?? 0) + 1,
              },
            },
          }
        }),
      lastChallenge: null,
      completeChallenge: (id) =>
        set((s) => (s.challenges[id] ? s : { challenges: { ...s.challenges, [id]: true }, lastChallenge: id })),
      clearLastChallenge: () => set({ lastChallenge: null }),
      recordPractice: (correct, streak) =>
        set((s) => ({
          practice: {
            answered: s.practice.answered + 1,
            correct: s.practice.correct + (correct ? 1 : 0),
            bestStreak: Math.max(s.practice.bestStreak, streak),
          },
        })),
      resetTopic: (ids, challengeIds = []) =>
        set((s) => {
          const answers = { ...s.answers }
          for (const id of ids) delete answers[id]
          const challenges = { ...s.challenges }
          for (const id of challengeIds) delete challenges[id]
          return { answers, challenges }
        }),
      resetAll: () => set({ answers: {}, challenges: {}, practice: emptyPractice }),
    }),
    {
      name: 'osviz-progress',
      version: 1,
      partialize: ({ answers, challenges, practice }) => ({ answers, challenges, practice }),
      migrate: (persisted) => ({ challenges: {}, practice: emptyPractice, ...(persisted as object) }) as ProgressStore,
    },
  ),
)

export function countCorrect(answers: Record<string, AnswerRecord>, ids: string[]) {
  return ids.filter((id) => answers[id]?.correct).length
}

export function mistakes(answers: Record<string, AnswerRecord>) {
  return Object.entries(answers)
    .filter(([, a]) => !a.correct)
    .map(([id]) => id)
}
