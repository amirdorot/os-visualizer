export const jobColors = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#0ea5e9', '#ef4444', '#8b5cf6', '#14b8a6']

export function colorFor(ids: string[], id: string | null) {
  if (id === null) return 'transparent'
  const i = ids.indexOf(id)
  return jobColors[(i < 0 ? 0 : i) % jobColors.length]
}
