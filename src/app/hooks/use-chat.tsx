import { useRef, useState } from 'react'
import { nanoid } from '../lib/utils'
import addMessage from '../actions/add-message'
import runAssistant from '../actions/run-assistant'
import getRun from '../actions/get-run'
import submitToolOutputs from '../actions/tool-outputs'
import { type Map, type Marker, type Message } from '../lib/types'

type Props = {
  initialMessages?: Message[]
  scrollToBottom: () => void
}

export default function useChat ({ initialMessages, scrollToBottom }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? [])
  const [mapCenter, setMapCenter] = useState<Map>({ lat: -33.4372, lng: -70.6506, zoom: 10 })
  const [markerPlaces, setMarkerPlaces] = useState<Marker[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if ((inputRef.current?.value) == null) return

    try {
      setLoading(true)
      setMessages([...messages, {
        id: nanoid(),
        content: inputRef.current?.value,
        role: 'user'
      }])

      const currentMessages = inputRef.current?.value
      inputRef.current.value = ''

      // add message to thread and run assistant
      const { error: msgError } = await addMessage({ content: currentMessages })

      if (msgError) throw new Error(msgError)

      const { run, error: runErr } = await runAssistant()
      if (runErr ?? !run) throw new Error('Run not found')

      let runRes = run
      let isFirst = true

      const initialLoadId = nanoid()

      if (isFirst) {
        setMessages(prev => [...prev, {
          id: initialLoadId,
          content: 'Loading...',
          role: 'loader'
        }])
        scrollToBottom()
      }

      while (runRes.status === 'queued' || runRes.status === 'in_progress') {
        // poll for run status
        await new Promise((resolve) => setTimeout(resolve, 300))

        const { run: runRetrieve } = await getRun({ runId: run?.id })

        if (runRetrieve == null) throw new Error('Run not found')

        isFirst = false
        runRes = runRetrieve
      }

      // load functions triggers for the run (if exists)
      if (runRes.status === 'requires_action') {
        // remove loader message in first run
        isFirst = true
        setMessages(prev => prev.filter((msg) => msg.id !== initialLoadId))
        const toolCalls = runRes.required_action?.submit_tool_outputs.tool_calls

        if (!toolCalls) throw new Error('Tool calls not found')

        const updateMapToolCall = toolCalls.find((tc: any) => tc.function.name === 'update_map')
        if (updateMapToolCall) {
          const updateMap = JSON.parse(updateMapToolCall.function.arguments)

          const id = nanoid()
          setMessages(prev => [...prev, {
            id,
            content: 'Updating map...',
            role: 'update_map'
          }])
          scrollToBottom()

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
          scrollToBottom()
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

      // remove loader if doesn't enter in requires_action
      if (!isFirst) {
        setMessages(prev => prev.filter((msg) => msg.id !== initialLoadId))
      }

      // load assistant message for the run
      const id = nanoid()
      setMessages(prev => [...prev, {
        id,
        content: 'Loading...',
        role: 'loader'
      }])
      scrollToBottom()

      while (runRes.status !== 'completed') {
        // poll for run status
        await new Promise((resolve) => setTimeout(resolve, 300))

        const { run: runRetrieve } = await getRun({ runId: run?.id })

        if (runRetrieve == null) throw new Error('Run not found')

        runRes = runRetrieve
      }

      const response = await fetch('/api/chat', {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // handle streaming text response
      const reader = response.body?.getReader()
      if (reader == null) throw new Error('Response body not found')

      let result = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        result += new TextDecoder('utf-8').decode(value)
      }

      // remove loader message
      setMessages(prev => prev.filter((msg) => msg.id !== id))

      const message: Message = {
        id: nanoid(),
        content: result,
        role: 'assistant'
      }

      setMessages((prev): Message[] => [...prev, message])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      scrollToBottom()
    }
  }

  return {
    messages,
    inputRef,
    mapCenter,
    markerPlaces,
    loading,
    handleSend
  }
}
