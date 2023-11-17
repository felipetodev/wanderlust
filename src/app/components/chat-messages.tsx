import { AnimatePresence, motion } from 'framer-motion'
import { CompassIcon, FileIcon, FileUpIcon, GlobeIcon, LoaderIcon, MapPinIcon, PlaneIcon, SearchIcon } from 'lucide-react'
import { MemoizedReactMarkdown } from './ui/markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { type Message } from '../lib/types'

type Props = {
  containerRef: React.RefObject<HTMLDivElement>
  messages: Message[]
}

function ChatMessages ({ messages, containerRef }: Props) {
  return (
    <div ref={containerRef} className='relative h-[calc(100%-40px)] overflow-y-auto'>
      <motion.div
        className='absolute bottom-0 w-full flex flex-col gap-y-8'
        animate={messages.length > 0 ? { top: 0 } : { bottom: 0 }}
      >
        <AnimatePresence>
          {messages.length === 0
            ? (
              <AnimatePresence>
                <motion.div className='flex items-center' exit={{ opacity: 0 }}>
                  <span className='hidden sm:flex h-6 w-6 mr-2' />
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
                        {message.role === 'update_map' && (
                          <GlobeIcon />
                        )}
                        {message.role === 'add_marker' && (
                          <MapPinIcon />
                        )}
                        {message.role === 'assistant' && (
                          <CompassIcon />
                        )}
                        {message.role === 'loader' && (
                          <LoaderIcon className='animate-spin' />
                        )}
                        {message.role === 'file-up' && (
                          <FileUpIcon />
                        )}
                        {message.role === 'file' && (
                          <FileIcon />
                        )}
                        {message.role === 'search' && (
                          <SearchIcon />
                        )}
                        {(message.role === 'plane-takeoff' || message.role === 'plane-landing') && (
                          <PlaneIcon />
                        )}
                      </span>
                      <div className="flex-1 space-y-2 overflow-hidden">
                        <MemoizedReactMarkdown
                          className="sm:text-2xl font-semibold prose break-words prose-p:leading-normal prose-pre:p-0 mx-auto"
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
                <div className='py-2 sm:py-10' />
              </>
              )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default ChatMessages
