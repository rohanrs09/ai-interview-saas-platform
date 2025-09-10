'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Brain, Menu, X, LogOut, Sparkles } from 'lucide-react'
import { useUser, UserButton, SignInButton, SignOutButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      className={`relative text-sm font-medium transition-all duration-300 group ${
        active 
          ? 'text-indigo-600' 
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
      <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ${
        active ? 'w-full' : 'w-0 group-hover:w-full'
      }`} />
    </Link>
  )
}

export function Navigation() {
  const { isSignedIn, user } = useUser()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/95 backdrop-blur-xl shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <Brain className="h-5 w-5 text-white" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">AI Interview</span>
            <span className="text-xs text-slate-500 font-medium">Powered by AI</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/interviews">Interviews</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </div>

        {/* Desktop auth / profile */}
        <div className="hidden items-center gap-4 md:flex">
          {isSignedIn ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-slate-600">
                    <span className="font-medium text-slate-900">{user?.firstName ?? user?.username ?? 'User'}</span>
                  </span>
                </div>
                <UserButton 
                  appearance={{ 
                    elements: { 
                      userButtonPopoverCard: 'shadow-2xl border-0',
                      userButtonAvatarBox: 'w-8 h-8'
                    } 
                  }} 
                />
              </div>
              <SignOutButton>
                <Button size="sm" variant="outline" className="gap-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </SignOutButton>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-50 transition-all duration-200">Sign In</Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </SignInButton>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle Menu"
          className="inline-flex items-center justify-center rounded-xl p-2 text-slate-700 hover:bg-slate-100 transition-colors duration-200 md:hidden"
          onClick={() => setOpen(v => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur-xl md:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6">
            <div className="flex flex-col gap-4">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/about">About</NavLink>
              <NavLink href="/pricing">Pricing</NavLink>
              <NavLink href="/interviews">Interviews</NavLink>
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/contact">Contact</NavLink>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              {isSignedIn ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <UserButton />
                    <span className="text-sm text-slate-700">
                      <span className="font-medium">{user?.firstName ?? user?.username ?? 'User'}</span>
                    </span>
                  </div>
                  <SignOutButton>
                    <Button size="sm" variant="outline" className="w-full gap-2">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </SignOutButton>
                </div>
              ) : (
                <div className="space-y-3">
                  <SignInButton mode="modal">
                    <Button className="w-full" variant="outline">Sign In</Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get Started
                    </Button>
                  </SignInButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}