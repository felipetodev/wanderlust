'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import { containerStyle, nanoid } from '../lib/utils'
import { CompassIcon } from 'lucide-react'
import addMessage from '../actions/add-message'
import runAssistant from '../actions/run-assistant'
import getRun from '../actions/get-run'
import { type Message } from '../lib/types'
import submitToolOutputs from '../actions/tool-outputs'
import { MemoizedReactMarkdown } from './ui/markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

function Chat ({ initialMessages }: { initialMessages?: Message[] }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? [])
  const [mapCenter, setMapCenter] = useState({ lat: -33.4372, lng: -70.6506, zoom: 10 })
  const [markerPlaces, setMarkerPlaces] = useState<Array<{ lat: number, lng: number, label: string }>>([])

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
          role: 'assistant'
        }])

        setTimeout(() => {
          setMessages(prev => prev.map((msg) => msg.id === id ? { ...msg, content: 'Updated map' } : msg))
          setMapCenter(updateMap)
        }, 1000)
      }

      const markerToolCalls = toolCalls.filter((tc: any) => tc.function.name === 'add_marker')
      const markers = markerToolCalls.map((tc: any) => JSON.parse(tc.function.arguments))

      const id = nanoid()
      setMessages(prev => [...prev, {
        id,
        content: 'Annotating map...',
        role: 'assistant'
      }])

      setTimeout(() => {
        setMessages(prev => prev.map((msg) => msg.id === id ? { ...msg, content: 'Annotated map' } : msg))
        setMarkerPlaces(markers)
      }, 1000)

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

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyBm6z49otVXeHModcvUA6AoAYKErVCXPCI'
  })

  return (
    <section className="h-full px-8 py-12">
      <div className="grid grid-cols-2 h-full">
        <form className="relative" onSubmit={handleSend}>
          <div className="absolute flex flex-col w-full h-full">
            <div className='relative h-[calc(100%-40px)] overflow-y-auto'>
              <motion.div
                className='absolute bottom-0 w-full flex flex-col gap-y-8'
                animate={messages.length > 0 ? { top: 0 } : { bottom: 0 }}
              >
                <AnimatePresence>
                  {messages.length === 0
                    ? (
                      <AnimatePresence>
                        <motion.div className='flex items-center' exit={{ opacity: 0 }}>
                          <span className='h-6 w-6 mr-2'>
                          </span>
                          <h1 className="text-3xl font-semibold">
                            Where would you like to go?
                          </h1>
                        </motion.div>
                      </AnimatePresence>
                      )
                    : (
                      <>
                        <AnimatePresence>
                          {messages?.map((message, i) => (
                            <motion.div
                              key={message.id}
                              className='flex'
                              initial={{ opacity: 0 }}
                              animate={i < messages.length - 1 ? { opacity: 0.5 } : { opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <span className='h-6 w-6 mr-2 mt-1.5'>
                                {message.role === 'assistant' && (
                                  <CompassIcon />
                                )}
                              </span>
                              <div className="flex-1 space-y-2 overflow-hidden">
                                <MemoizedReactMarkdown
                                  className="text-2xl font-semibold prose break-words prose-p:leading-normal prose-pre:p-0 mx-auto"
                                  components={{
                                    p ({ children }) {
                                      return <p className="mb-2 last:mb-0">{children}</p>
                                    }
                                  }}
                                  remarkPlugins={[remarkGfm, remarkMath]}
                                >
                                  {message.content}
                                </MemoizedReactMarkdown>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <div className='py-10' />
                      </>
                      )}
                </AnimatePresence>
              </motion.div>
            </div>
            <motion.div
              animate={messages.length > 0 ? { height: 'auto' } : {}}
              className='relative h-full'
            >
              <motion.div
                className='absolute flex items-end w-full'
                animate={messages.length > 0 ? {} : { top: 0 }}
              >
                <span className='w-6 mr-2' />
                <input
                  ref={inputRef}
                  type="text"
                  name="initial"
                  autoCapitalize="off"
                  autoComplete="off"
                  placeholder="Start typing or upload a file..."
                  className="mt-auto w-full text-2xl pt-2 outline-none font-semibold"
                />
              </motion.div>
            </motion.div>
          </div>
        </form>
        <div className="rounded-2xl overflow-hidden">
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={{ lng: mapCenter.lng, lat: mapCenter.lat }}
              zoom={mapCenter.zoom}
            >
              {markerPlaces?.map((place, i) => (
                <MarkerF
                  key={i}
                  // label={place?.label ?? undefined}
                  position={{ lng: place.lng, lat: place.lat }}
                />
              ))}
            </GoogleMap>
          )}
        </div>
      </div >
    </section >
  )
}

export default Chat
