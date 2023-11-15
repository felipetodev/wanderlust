import { customAlphabet } from 'nanoid'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
) // 7-character random string

export const containerStyle = {
  width: '100%',
  height: '100%'
}

export function devMark () {
  if (process.env.NODE_ENV === 'development') return
  const stampStyles = 'color: #fff; font-size: 11px; font-weight: bold; background-color: #1f1f1f; padding: 2px 6px; border-radius: 5px; border: 1px solid #000'
  console.log('%c✨ Developed by: https://www.felipetodev.com', stampStyles)
}
