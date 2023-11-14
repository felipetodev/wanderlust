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

export type Map = {
  lat: number
  lng: number
  zoom: number
}

export type Marker = {
  lat: number
  lng: number
  label: string
}
