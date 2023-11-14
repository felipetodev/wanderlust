import { motion } from 'framer-motion'

function WelcomeHeading () {
  return (
    <motion.div className='flex items-center' exit={{ opacity: 0 }}>
      <span className='h-6 w-6 mr-2' />
      <h1 className="text-3xl font-semibold">
        Where would you like to go?
      </h1>
    </motion.div>
  )
}

export default WelcomeHeading
