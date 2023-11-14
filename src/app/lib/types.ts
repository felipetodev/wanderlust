import { type Run } from 'openai/resources/beta/threads/runs/runs.mjs'

export type Message = {
  id: string
  content: string
  role: 'user' | 'assistant'
}

export type RunAction = {
  run: Run | null
  error: string | null
}
