import { type Run } from 'openai/resources/beta/threads/runs/runs.mjs'

type Role = 'user' | 'assistant' | 'update_map' | 'add_marker'

export type Message = {
  id: string
  content: string
  role: Role
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
