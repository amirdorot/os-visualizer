import { deadlockQuiz } from '../topics/deadlock/quiz'
import { memoryQuiz } from '../topics/memory/quiz'
import { processesQuiz } from '../topics/processes/quiz'
import { schedulingQuiz } from '../topics/scheduling/quiz'
import { storageQuiz } from '../topics/storage/quiz'
import { syncQuiz } from '../topics/sync/quiz'
import { syscallsQuiz } from '../topics/syscalls/quiz'
import { threadsQuiz } from '../topics/threads/quiz'
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
