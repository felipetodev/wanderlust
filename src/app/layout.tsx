import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import MainNav from './components/main-nav'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wanderlust | Assistants',
  description: 'AI-powered travel app'
}

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <MainNav />
        <main className='h-[calc(100vh-57px)]'>
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  )
}
