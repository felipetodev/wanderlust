import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

type Props = {
  inputRef: React.RefObject<HTMLInputElement>
  hasMessages: boolean
  loading: boolean
}

function ChatInput ({ hasMessages, inputRef, loading }: Props) {
  return (
    <motion.div
      animate={hasMessages ? { height: 'auto' } : {}}
      className='relative h-full'
    >
      <motion.div
        className={cn('absolute flex items-end w-full', {
          'border-t': hasMessages
        })}
        animate={hasMessages ? {} : { top: 0 }}
      >
        <span className='hidden sm:flex w-6 mr-2' />
        <input
          ref={inputRef}
          disabled={loading}
          type="text"
          name="initial"
          autoCapitalize="off"
          autoComplete="off"
          placeholder="Start typing or upload a file..."
          className="mt-auto w-full text-lg sm:text-2xl pt-2 outline-none font-semibold disabled:opacity-50 disabled:bg-transparent"
        />
      </motion.div>
    </motion.div>
  )
}

export default ChatInput
