import { AnimatePresence, motion } from 'framer-motion'
import { CompassIcon } from 'lucide-react'
import { MemoizedReactMarkdown } from './ui/markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { type Message } from '../lib/types'

type Props = {
  messages: Message[]
}

function ChatMessages ({ messages }: Props) {
  return (
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
  )
}

export default ChatMessages
