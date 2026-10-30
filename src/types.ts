export interface McqQuestion {
  kind: 'mcq'
  id: string
  prompt: string
  scenario?: string
  options: string[]
  answer: number
  explanation: string
}

/** Predict the next state of a simulation as a number (e.g. page faults, waiting time). */
export interface PredictQuestion {
  kind: 'predict'
  id: string
  prompt: string
  scenario?: string
  answer: number
  tolerance?: number
  unit?: string
  explanation: string
}

export interface OrderQuestion {
  kind: 'order'
  id: string
  prompt: string
  scenario?: string
  /** Items in the correct order; they are shuffled before being shown. */
  items: string[]
  explanation: string
}

export type Question = McqQuestion | PredictQuestion | OrderQuestion

export interface Accent {
  text: string
  bg: string
  soft: string
  border: string
  gradient: string
  hex: string
}

export interface TopicMeta {
  id: string
  path: string
  title: string
  tagline: string
  icon: string
  accent: Accent
}
