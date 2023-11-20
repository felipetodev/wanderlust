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
  const [flightInfo, setFlightInfo] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const addMessageToChat = (content: string, role: Message['role'], id?: string) => {
    const newMessage: Message = { id: id ?? nanoid(), content, role }
    setMessages((prevMessages) => [...prevMessages, newMessage])
    scrollToBottom()
  }

  const handleSubmit = async (currentMessage?: string, file?: File) => {
    try {
      setLoading(true)

      if (currentMessage) {
        if (inputRef.current) inputRef.current.value = ''
        addMessageToChat(currentMessage, 'user')
        await addMessage({ content: currentMessage })
      }

      if (file instanceof File) {
        setFlightInfo(null)
        const uploadId = nanoid()
        addMessageToChat(`Uploading ${file.name}`, 'file-up', uploadId)

        const formData = new FormData()
        formData.append('file', file)

        await fetch('/api/files', {
          method: 'POST',
          body: formData
        })
          .then((res) => {
            if (!res.ok) throw new Error('Error uploading file')
            setMessages(prev => prev.map((msg) => msg.id === uploadId ? { ...msg, role: 'file', content: file.name } : msg))
          })
          .catch((err) => {
            console.error(err)
          })
      }

      const initialLoadId = nanoid()

      if (file instanceof File) {
        addMessageToChat('Reading files...', 'search', initialLoadId)
      }

      const { run, error: runErr } = await runAssistant()
      if (runErr ?? !run) throw new Error('Run not found')

      let runRes = run
      let isFirst = true

      if (isFirst && !file) {
        addMessageToChat('Loading...', 'loader', initialLoadId)
      }

      while (runRes.status === 'queued' || runRes.status === 'in_progress') {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const { run: runRetrieve } = await getRun({ runId: run?.id })

        if (!runRetrieve) throw new Error('Run not found')

        isFirst = false
        runRes = runRetrieve
      }

      if (runRes.status === 'requires_action') {
        isFirst = true
        if (file) {
          setMessages(prev => prev.map((msg) => msg.id === initialLoadId ? { ...msg, content: 'Read files' } : msg))
        } else {
          setMessages((prev) => prev.filter((msg) => msg.id !== initialLoadId))
        }

        const toolCalls = runRes.required_action?.submit_tool_outputs.tool_calls

        if (!toolCalls) throw new Error('Tool calls not found')

        const updateMapToolCall = toolCalls.find((tc: any) => tc.function.name === 'update_map')

        if (updateMapToolCall) {
          const updateMap = JSON.parse(updateMapToolCall.function.arguments)
          const id = nanoid()

          addMessageToChat('Updating map...', 'update_map', id)

          setTimeout(() => {
            setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, content: 'Updated map' } : msg)))
            setMapCenter(updateMap)
          }, 1000)
        }

        const markerToolCalls = toolCalls.filter((tc: any) => tc.function.name === 'add_marker')
        const id = nanoid()

        if (markerToolCalls.length > 0) {
          addMessageToChat('Annotating map...', 'add_marker', id)
        }

        const markers = markerToolCalls.map((tc: any) => JSON.parse(tc.function.arguments))

        if (markers.length > 0) {
          setTimeout(() => {
            setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, content: 'Annotated map' } : msg)))
            setMarkerPlaces(markers)
            setMapCenter((prev) => ({ ...prev, zoom: 11 }))
          }, 1000)
        }

        const displayId = nanoid()

        if (file) {
          addMessageToChat('Displaying flight information...', 'plane-takeoff', displayId)
        }

        // handle if 'multi_tool_use.parallel' exists
        const multiFunctions = toolCalls.find((tc: any) => tc.function.name === 'multi_tool_use.parallel')

        if (multiFunctions) {
          const toolUses: any[] = JSON.parse(multiFunctions.function.arguments).tool_uses

          const updateMap = toolUses.find((tc: any) => tc.recipient_name === 'functions.update_map')
          if (updateMap) {
            setMapCenter(updateMap.parameters)
          }

          const flightInfo = toolUses.find((tc: any) => tc.recipient_name === 'functions.flight_info')
          if (flightInfo) {
            setFlightInfo(flightInfo.parameters)
            setMessages(prev => prev.map((msg) => msg.id === displayId ? { ...msg, content: 'Displayed flight information' } : msg))
          }

          const addMarker = toolUses.filter((tc: any) => tc.recipient_name === 'functions.add_marker')

          if (addMarker.length > 0) {
            const markers = addMarker.map((tc: any) => tc.parameters)
            setMarkerPlaces(markers)
          }
        }

        const flightIndoToolCall = toolCalls.find((tc: any) => tc.function.name === 'flight_info')

        if (flightIndoToolCall) {
          const flightInfo = JSON.parse(flightIndoToolCall.function.arguments)
          setFlightInfo(flightInfo)
          setMessages(prev => prev.map((msg) => msg.id === displayId ? { ...msg, content: 'Displayed flight information' } : msg))
        }

        if (toolCalls.length > 0) {
          await submitToolOutputs({ runId: runRes.id, toolCalls })
        } else {
          throw new Error(`Error processing thread: ${runRes.status}, Run ID: ${runRes.id}. submit_tool_outputs.tool_calls are empty`)
        }
      }

      // remove loader if doesn't enter in requires_action
      if (!isFirst) {
        setMessages((prev) => prev.filter((msg) => msg.id !== initialLoadId))
      }

      // load assistant message for the run
      const id = nanoid()
      addMessageToChat('Loading...', 'loader', id)

      while (runRes.status !== 'completed') {
        await new Promise((resolve) => setTimeout(resolve, 300))

        const { run: runRetrieve } = await getRun({ runId: run?.id })

        if (!runRetrieve) throw new Error('Run not found')

        runRes = runRetrieve
      }

      const response = await fetch('/api/chat', {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const reader = response.body?.getReader()

      if (!reader) throw new Error('Response body not found')

      let result = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        result += new TextDecoder('utf-8').decode(value)
      }

      // remove loader message
      setMessages((prev) => prev.filter((msg) => msg.id !== id))

      const message: Message = {
        id: nanoid(),
        content: result,
        role: 'assistant'
      }

      setMessages((prev) => [...prev, message])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      scrollToBottom()
    }
  }

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputRef.current?.value) return
    const currentMessages = inputRef.current.value
    await handleSubmit(currentMessages)
  }

  const handleFile = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer) {
      const file = e.dataTransfer.files[0]
      if (file.type !== 'application/pdf') return alert('Only PDF files are allowed')

      if (file) {
        inputRef.current?.setAttribute('placeholder', 'Start typing or upload a file...')
        await handleSubmit(undefined, file)
      }
    }
  }

  return {
    messages,
    inputRef,
    mapCenter,
    markerPlaces,
    flightInfo,
    loading,
    handleSend,
    handleFile
  }
}
