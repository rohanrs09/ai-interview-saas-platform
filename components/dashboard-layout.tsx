'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { DashboardNav } from '@/components/dashboard-nav'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useUser()
  const [userRole, setUserRole] = useState<'candidate' | 'recruiter'>('candidate')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Determine user role based on metadata or email
      const fetchUserRole = async () => {
        try {
          const role = user.publicMetadata?.role as 'candidate' | 'recruiter'
          if (role) {
            setUserRole(role)
          } else {
            // Default logic: check email domain or other criteria
            const email = user.emailAddresses[0]?.emailAddress || ''
            const isRecruiter = email.includes('@company.com') || email.includes('@hr.') || 
                              user.firstName?.toLowerCase().includes('recruiter') ||
                              user.lastName?.toLowerCase().includes('recruiter')
            setUserRole(isRecruiter ? 'recruiter' : 'candidate')
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
          setUserRole('candidate') // Default to candidate
        } finally {
          setLoading(false)
        }
      }

      fetchUserRole()
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <DashboardNav userRole={userRole} />
      
      {/* Main content */}
      <div className="lg:pl-72">
        <main className="py-4 lg:py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
