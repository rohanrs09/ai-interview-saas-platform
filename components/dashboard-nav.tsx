'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  Brain,
  Target,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  roles?: ('candidate' | 'recruiter')[]
}

const candidateNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and quick actions'
  },
  {
    name: 'Resume Analysis',
    href: '/dashboard/resume',
    icon: FileText,
    description: 'Upload and analyze your resume'
  },
  {
    name: 'Mock Interviews',
    href: '/interviews',
    icon: Brain,
    description: 'Practice with AI interviews'
  },
  {
    name: 'Progress',
    href: '/dashboard/progress',
    icon: TrendingUp,
    description: 'Track your improvement'
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Performance insights'
  }
]

const recruiterNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and quick actions'
  },
  {
    name: 'Recruiter Hub',
    href: '/dashboard/recruiter',
    icon: Target,
    description: 'Recruitment management'
  },
  {
    name: 'Job Postings',
    href: '/dashboard/jobs',
    icon: Briefcase,
    description: 'Manage job descriptions'
  },
  {
    name: 'Candidates',
    href: '/dashboard/candidates',
    icon: Users,
    description: 'View candidate profiles'
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Recruitment analytics'
  }
]

interface DashboardNavProps {
  userRole: 'candidate' | 'recruiter'
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname()
  const { user } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const navigation = userRole === 'candidate' ? candidateNavigation : recruiterNavigation

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/80 backdrop-blur-sm border-r border-gray-200 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                InterviewAI
              </span>
            </Link>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            isActive
                              ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-r-2 border-indigo-600'
                              : 'text-gray-700 hover:text-indigo-700 hover:bg-gray-50',
                            'group flex gap-x-3 rounded-l-md p-3 text-sm leading-6 font-medium transition-all duration-200'
                          )}
                        >
                          <item.icon
                            className={cn(
                              isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                              'h-5 w-5 shrink-0'
                            )}
                            aria-hidden="true"
                          />
                          <div className="flex flex-col">
                            <span>{item.name}</span>
                            {item.description && (
                              <span className="text-xs text-gray-500 group-hover:text-gray-600">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
              
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-3 py-3 text-sm font-semibold leading-6 text-gray-900">
                  <div className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="sr-only">Your profile</span>
                    <div className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {userRole}
                    </div>
                  </div>
                  <SignOutButton>
                    <Button variant="ghost" size="sm" className="p-1">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </SignOutButton>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              InterviewAI
            </span>
          </Link>
        </div>
        
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-x-2 text-sm font-semibold leading-6 text-gray-900"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <div className="h-6 w-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {user?.firstName?.[0]}
              </span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {isProfileMenuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-gray-500 capitalize">{userRole}</div>
              </div>
              <SignOutButton>
                <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign out
                </button>
              </SignOutButton>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <Link href="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      InterviewAI
                    </span>
                  </Link>
                </div>
                
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const isActive = pathname === item.href
                          return (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                  isActive
                                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700'
                                    : 'text-gray-700 hover:text-indigo-700 hover:bg-gray-50',
                                  'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium'
                                )}
                              >
                                <item.icon
                                  className={cn(
                                    isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                                    'h-5 w-5 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                <div className="flex flex-col">
                                  <span>{item.name}</span>
                                  {item.description && (
                                    <span className="text-xs text-gray-500">
                                      {item.description}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
