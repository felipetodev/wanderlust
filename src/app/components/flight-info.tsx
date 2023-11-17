import { Fragment, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDownIcon, PlaneLandingIcon, PlaneTakeoffIcon } from 'lucide-react'
import { cn } from '../lib/utils'
import { type FlightData } from '../lib/types'

type Props = {
  flightInfo: FlightData
}

function FlightInfo ({ flightInfo }: Props) {
  const isFlightInfo = Boolean(flightInfo?.outbound?.airline)
  const [isOpen, setIsOpen] = useState(isFlightInfo)

  const hasOutboundInfo = flightInfo?.outbound?.flights?.length > 0
  const hasInboundInfo = flightInfo?.inbound?.flights?.length > 0

  // TODO: show inbound info (if available) with tabs

  return (
    <div className='absolute pointer-events-none inset-0 grid sm:grid-rows-2'>
      <div className='hidden sm:flex' />
      {(isOpen || isFlightInfo) && (
        <motion.div
          initial={{ y: '100%' }}
          animate={(isFlightInfo && isOpen) ? { y: 0 } : { y: 'calc(100% - 30px)' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', bounce: 0 }}
          className="pointer-events-auto rounded-t-2xl sm:top-auto sm:right-auto sm:left-auto sm:bottom-0 bg-cyan-500/40 backdrop-blur-md"
        >
          <div className="flex flex-col justify-between h-full p-6 lg:p-10">
            <div className='font-semibold space-x-4'>
              {flightInfo?.outbound && (
                <button
                  disabled={!hasOutboundInfo}
                  className={cn({ 'cursor-not-allowed': !hasOutboundInfo })}
                >
                  Outbound
                </button>
              )}
              {flightInfo?.inbound && (
                <button
                  disabled={!hasInboundInfo}
                  className={cn('disabled:opacity-50', { 'cursor-not-allowed': !hasInboundInfo })}
                >
                  Inbound
                </button>
              )}
            </div>
            <div className='grid grid-cols-2 gap-10'>
              {flightInfo?.outbound?.flights?.map((flight: any, i: number) => (
                <Fragment key={i}>
                  <div className='flex flex-col gap-y-2 justify-between'>
                    <PlaneTakeoffIcon />
                    <h2 className='text-md sm:text-2xl xl:text-3xl font-bold text-neutral-100 mb-auto'>
                      {flight?.departure_airport}
                    </h2>
                    <span className='text-xs sm:text-sm font-semibold'>
                      {new Date(flight?.departure)
                        .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      }
                    </span>
                  </div>

                  <div className='flex flex-col gap-y-2 justify-between'>
                    <PlaneLandingIcon />
                    <h2 className='text-md sm:text-2xl xl:text-3xl font-bold text-neutral-100 mb-auto'>
                      {flight?.arrival_airport}
                    </h2>
                    <span className='text-xs sm:text-sm font-semibold'>
                      {new Date(flight?.arrival)
                        .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      }
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>

            <div className='grid grid-cols-2 gap-10 text-md sm:text-2xl xl:text-3xl font-semibold'>
              <h3>
                {flightInfo?.outbound?.airline}
              </h3>
              <h3 className='opacity-60'>
                {flightInfo?.outbound?.cost}
              </h3>
            </div>

            <div className='ml-auto space-x-4 text-xs md:text-base font-semibold'>
              <button className='h-10 px-3 sm:h-12 sm:px-4 bg-cyan-700 text-neutral-100 rounded-full'>
                Check In
              </button>
              <button className='h-10 px-3 sm:h-12 sm:px-4 bg-cyan-700 text-neutral-100 rounded-full'>
                Share Itinerary
              </button>
            </div>

            <button
              className='flex items-center space-x-2 absolute top-1 right-4'
              onClick={() => setIsOpen(!isOpen)}
            >
              {!isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.4 }}
                  className='text-xs font-semibold'>
                  Show flight information
                </motion.span>
              )}
              <ChevronDownIcon className={cn({
                'rotate-180': !isOpen
              })} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default FlightInfo
