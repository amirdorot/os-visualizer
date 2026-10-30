import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AnswerRecord {
  correct: boolean
  attempts: number
}

interface ProgressStore {
  answers: Record<string, AnswerRecord>
  record: (questionId: string, correct: boolean) => void
  resetTopic: (questionIds: string[]) => void
  resetAll: () => void
}

export const useProgress = create<ProgressStore>()(
  persist(
    (set) => ({
      answers: {},
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
      resetTopic: (ids) =>
        set((s) => {
          const answers = { ...s.answers }
          for (const id of ids) delete answers[id]
          return { answers }
        }),
      resetAll: () => set({ answers: {} }),
    }),
    { name: 'osviz-progress' },
  ),
)

export function countCorrect(answers: Record<string, AnswerRecord>, ids: string[]) {
  return ids.filter((id) => answers[id]?.correct).length
}
