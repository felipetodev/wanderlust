import { motion } from 'framer-motion'

type Props = {
  messages: any
  inputRef: any
}

function ChatInput ({ messages, inputRef }: Props) {
  return (
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
  )
}

export default ChatInput
