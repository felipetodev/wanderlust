'use client'

import Maps from './maps'
import ChatInput from './chat-input'
import ChatMessages from './chat-messages'
import FlightInfo from './flight-info'
import useChat from '../hooks/use-chat'
import useScroll from '../hooks/use-scroll'
import { type Message } from '../lib/types'

function Chat ({ initialMessages }: { initialMessages?: Message[] }) {
  const { containerRef, scrollToBottom } = useScroll()
  const { messages, inputRef, mapCenter, markerPlaces, flightInfo, loading, handleSend, handleFile } = useChat({
    initialMessages,
    scrollToBottom
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 h-full px-8 py-6 sm:py-12 gap-y-4 sm:gap-y-0">
      <form className='relative' onSubmit={handleSend}>
        <div
          onDrop={handleFile}
          onDragOver={(e) => {
            e.preventDefault()
            inputRef.current?.setAttribute('placeholder', 'Upload File')
          }}
          onDragLeave={() => {
            inputRef.current?.setAttribute('placeholder', 'Start typing or upload a file...')
          }}
          className="absolute flex flex-col w-full h-full"
        >
          <ChatMessages
            messages={messages}
            containerRef={containerRef}
          />
          <ChatInput
            loading={loading}
            hasMessages={Boolean(messages.length > 0)}
            inputRef={inputRef}
          />
        </div>
      </form>
      <Maps
        mapCenter={mapCenter}
        markerPlaces={markerPlaces}
      >
        {flightInfo && <FlightInfo flightInfo={flightInfo} />}
      </Maps>
    </div>
  )
}

export default Chat
