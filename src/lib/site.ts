export const REPO_URL = 'https://github.com/amirdorot/os-visualizer'
export const SITE_URL = 'https://os.cellact.nl/'

/** Prefilled GitHub issue for feedback about a specific page. */
export function feedbackUrl(pathname: string, kind: 'feedback' | 'bug' = 'feedback') {
  const page = SITE_URL.replace(/\/$/, '') + pathname
  const title = kind === 'bug' ? `Problem on ${pathname}` : `Feedback: ${pathname}`
  const body = `**Page:** ${page}\n\n**What happened, or what would you like to see?**\n\n`
  return `${REPO_URL}/issues/new?${new URLSearchParams({ title, body })}`
}
