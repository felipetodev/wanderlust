'use client'

import { useRef, useState } from 'react'
import Maps from './maps'
import ChatInput from './chat-input'
import ChatMessages from './chat-messages'
import { nanoid } from '../lib/utils'
import addMessage from '../actions/add-message'
import runAssistant from '../actions/run-assistant'
import getRun from '../actions/get-run'
import submitToolOutputs from '../actions/tool-outputs'
import { type Marker, type Map, type Message } from '../lib/types'

function Chat ({ initialMessages }: { initialMessages?: Message[] }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? [])
  const [mapCenter, setMapCenter] = useState<Map>({ lat: -33.4372, lng: -70.6506, zoom: 10 })
  const [markerPlaces, setMarkerPlaces] = useState<Marker[]>([])

  const handleSend = async (e: any) => {
    e.preventDefault()
    if ((inputRef.current?.value) == null) return

    setMessages([...messages, {
      id: nanoid(),
      content: inputRef.current?.value,
      role: 'user'
    }])

    const currentMessages = inputRef.current?.value
    inputRef.current.value = ''

    const { error: msgError } = await addMessage({ content: currentMessages })

    if (msgError) return alert(msgError)

    const { run, error: runErr } = await runAssistant()
    if (runErr ?? !run) return alert(runErr)

    let runRes = run
    while (runRes.status === 'queued' || runRes.status === 'in_progress') {
      // poll for run status
      await new Promise((resolve) => setTimeout(resolve, 300))

      const { run: runRetrieve } = await getRun({ runId: run?.id })

      if (runRetrieve == null) return alert('Run not found')

      runRes = runRetrieve
    }

    if (runRes.status === 'requires_action') {
      const toolCalls = runRes.required_action?.submit_tool_outputs.tool_calls

      if (!toolCalls) return alert('Tool calls not found')

      const updateMapToolCall = toolCalls.find((tc: any) => tc.function.name === 'update_map')
      if (updateMapToolCall) {
        const updateMap = JSON.parse(updateMapToolCall.function.arguments)

        const id = nanoid()
        setMessages(prev => [...prev, {
          id,
          content: 'Updating map...',
          role: 'update_map'
        }])

        setTimeout(() => {
          setMessages(prev => prev.map((msg) => msg.id === id ? { ...msg, content: 'Updated map' } : msg))
          setMapCenter(updateMap)
        }, 1000)
      }

      const markerToolCalls = toolCalls.filter((tc: any) => tc.function.name === 'add_marker')

      const id = nanoid()
      if (markerToolCalls.length > 0) {
        setMessages(prev => [...prev, {
          id,
          content: 'Annotating map...',
          role: 'add_marker'
        }])
      }

      const markers = markerToolCalls.map((tc: any) => JSON.parse(tc.function.arguments))

      if (markers.length > 0) {
        setTimeout(() => {
          setMessages(prev => prev.map((msg) => msg.id === id ? { ...msg, content: 'Annotated map' } : msg))
          setMarkerPlaces(markers)
          setMapCenter(prev => ({ ...prev, zoom: 11 }))
        }, 1000)
      }

      if (toolCalls.length > 0) {
        await submitToolOutputs({ runId: runRes.id, toolCalls })
      } else {
        throw new Error(`Error processing thread: ${runRes.status}, Run ID: ${runRes.id}. submit_tool_outputs.tool_calls are empty`)
      }
    }

    while (runRes.status !== 'completed') {
      // poll for run status
      await new Promise((resolve) => setTimeout(resolve, 300))

      const { run: runRetrieve } = await getRun({ runId: run?.id })

      if (runRetrieve == null) return alert('Run not found')

      runRes = runRetrieve
    }

    const response = await fetch('/api/chat', {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // handle streaming text response
    const reader = response.body?.getReader()
    if (reader == null) return alert('Response body not found')

    let result = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      result += new TextDecoder('utf-8').decode(value)
    }

    const message: Message = {
      id: nanoid(),
      content: result,
      role: 'assistant'
    }

    setMessages((prev): Message[] => [...prev, message])
  }

  return (
    <div className="grid grid-cols-2 h-full px-8 py-12">
      <form className='relative' onSubmit={handleSend}>
        <div className="absolute flex flex-col w-full h-full">
          <ChatMessages messages={messages} />
          <ChatInput
            messages={messages}
            inputRef={inputRef}
          />
        </div>
      </form>
      <Maps
        mapCenter={mapCenter}
        markerPlaces={markerPlaces}
      />
    </div>
  )
}

export default Chat
