import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Navigation } from '@/components/navigation'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Mock Interview Platform',
  description: 'AI-powered mock interviews with real-time feedback and analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Navigation />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
