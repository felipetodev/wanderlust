import { type Run } from 'openai/resources/beta/threads/runs/runs.mjs'

type Role = 'user' | 'assistant' | 'update_map' | 'add_marker' | 'loader' | 'file-up' | 'file' | 'search' | 'plane-takeoff' | 'plane-landing'

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

type Flight = {
  arrival: string
  arrival_airport: string
  departure: string
  departure_airport: string
  destination: string
  flight_number: string
}

export type FlightData = {
  inbound: {
    airline: string
    cost: string
    flights: Flight[] | []
  }
  outbound: {
    airline: string
    cost: string
    flights: Flight[] | []
  }
}
