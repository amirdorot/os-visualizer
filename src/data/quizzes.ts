import { deadlockQuiz } from '../topics/deadlock/quiz'
import { memoryQuiz } from '../topics/memory/quiz'
import { processesQuiz } from '../topics/processes/quiz'
import { schedulingQuiz } from '../topics/scheduling/quiz'
import { storageQuiz } from '../topics/storage/quiz'
import { syncQuiz } from '../topics/sync/quiz'
import { syscallsQuiz } from '../topics/syscalls/quiz'
import { threadsQuiz } from '../topics/threads/quiz'
import { useMemo } from 'react'
import { useLocale } from '../i18n'
import { localizeQuestions, type QuestionText, type Translations } from '../i18n/content'
import { processesQuizText } from '../topics/processes/content'
import { threadsQuizText } from '../topics/threads/content'
import { syncQuizText } from '../topics/sync/content'
import { deadlockQuizText } from '../topics/deadlock/content'
import { schedulingQuizText } from '../topics/scheduling/content'
import { memoryQuizText } from '../topics/memory/content'
import { storageQuizText } from '../topics/storage/content'
import { syscallsQuizText } from '../topics/syscalls/content'
import type { Question } from '../types'

export const quizzes: Record<string, Question[]> = {
  processes: processesQuiz,
  threads: threadsQuiz,
  sync: syncQuiz,
  deadlock: deadlockQuiz,
  scheduling: schedulingQuiz,
  memory: memoryQuiz,
  storage: storageQuiz,
  syscalls: syscallsQuiz,
}

export const questionTopic: Record<string, string> = Object.fromEntries(
  Object.entries(quizzes).flatMap(([topic, qs]) => qs.map((q) => [q.id, topic])),
)

export const quizText: Record<string, Translations<Record<string, QuestionText>>> = {
  processes: processesQuizText,
  threads: threadsQuizText,
  sync: syncQuizText,
  deadlock: deadlockQuizText,
  scheduling: schedulingQuizText,
  memory: memoryQuizText,
  storage: storageQuizText,
  syscalls: syscallsQuizText,
}

/** Every topic's quiz in the current language; ids are the same in every language. */
export function useQuizzes(): Record<string, Question[]> {
  const locale = useLocale()
  return useMemo(() => Object.fromEntries(Object.entries(quizzes).map(([topic, qs]) => [topic, localizeQuestions(qs, locale, quizText[topic])])), [locale])
}

export const useQuiz = (topic: string) => useQuizzes()[topic]
