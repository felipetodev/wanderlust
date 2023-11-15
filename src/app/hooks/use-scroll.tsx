import { useEffect, useRef } from 'react'
import { devMark } from '../lib/utils'

export default function useScroll () {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
    devMark()
  }, [])

  const scrollToBottom = () => {
    const interval = setTimeout(() => {
      containerRef.current?.scrollTo({
        top: containerRef.current?.scrollHeight,
        behavior: 'smooth'
      })
    }, 300)

    return () => clearInterval(interval)
  }

  return {
    containerRef,
    scrollToBottom
  }
}
