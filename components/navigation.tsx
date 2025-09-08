'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Brain, Menu, X, LogOut } from 'lucide-react'
import { useUser, UserButton, SignInButton, SignOutButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        active ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  )
}

export function Navigation() {
  const { isSignedIn, user } = useUser()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
            <Brain className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-lg font-semibold text-gray-900">AI Interview</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/contact">Contact</NavLink>
          <NavLink href="/interviews">Interviews</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
        </div>

        {/* Desktop auth / profile */}
        <div className="hidden items-center gap-3 md:flex">
          {isSignedIn ? (
            <>
              <span className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.firstName ?? user?.username ?? 'User'}</span>
              </span>
              <SignOutButton>
                <Button size="sm" variant="outline" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </SignOutButton>
              <UserButton appearance={{ elements: { userButtonPopoverCard: 'shadow-lg' } }} />
            </>
          ) : (
            <SignInButton mode="modal">
              <Button size="sm" variant="outline">Sign In</Button>
            </SignInButton>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle Menu"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          onClick={() => setOpen(v => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <div className="border-t bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
            <NavLink href="/contact">Contact</NavLink>
            <NavLink href="/interviews">Interviews</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>

            <div className="mt-2 flex items-center justify-between">
              {isSignedIn ? (
                <>
                  <span className="text-sm text-gray-700">
                    {user?.firstName ?? user?.username ?? 'User'}
                  </span>
                  <div className="flex items-center gap-2">
                    <SignOutButton>
                      <Button size="sm" variant="outline" className="gap-2">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </SignOutButton>
                    <UserButton />
                  </div>
                </>
              ) : (
                <SignInButton mode="modal">
                  <Button className="w-full" variant="outline">Sign In</Button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}