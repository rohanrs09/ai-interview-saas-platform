'use client'

import { useUser, SignOutButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Brain, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()

  if (!isLoaded) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">AI Interview</span>
          </Link>
          <div className="flex space-x-4">
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  if (!user) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">AI Interview</span>
          </Link>
          <div className="flex space-x-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">AI Interview</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/dashboard" 
            className={`text-sm font-medium transition-colors ${
              pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            href="/interviews" 
            className={`text-sm font-medium transition-colors ${
              pathname.startsWith('/interviews') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Interviews
          </Link>
          <Link 
            href="/pricing" 
            className={`text-sm font-medium transition-colors ${
              pathname === '/pricing' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{user.firstName || user.emailAddresses[0].emailAddress}</span>
          </div>
          <SignOutButton>
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      </div>
    </header>
  )
}
