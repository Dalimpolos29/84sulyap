'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ProfileProvider } from '@/contexts/ProfileContext'
import AuthenticatedLayout from './AuthenticatedLayout'
import UnauthenticatedLayout from './UnauthenticatedLayout'
import LoadingProvider from '@/components/providers/LoadingProvider'
import ProgressLoader from '@/components/ui/ProgressLoader'

interface LayoutProviderProps {
  children: React.ReactNode
}

export default function LayoutProvider({ children }: LayoutProviderProps) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const supabase = createClient()

  // Define public routes that don't need authentication
  const publicRoutes = ['/login', '/privacy-policy', '/terms-of-use', '/verify-email']
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
      } catch (error) {
        console.error('Error checking session:', error)
        setSession(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        backgroundColor: '#E5DFD0',
        zIndex: 9999,
        // Anti-flicker optimization
        opacity: 1,
        transition: 'opacity 0.2s ease-in-out'
      }}>
        <ProgressLoader duration={800} />
      </div>
    )
  }

  // For authenticated routes, use AuthenticatedLayout with ProfileProvider
  if (session && !isPublicRoute) {
    return (
      <LoadingProvider>
        <ProfileProvider user={session.user}>
          <AuthenticatedLayout>
            {children}
          </AuthenticatedLayout>
        </ProfileProvider>
      </LoadingProvider>
    )
  }

  // For public routes or unauthenticated users, use UnauthenticatedLayout
  return (
    <LoadingProvider>
      <UnauthenticatedLayout>
        {children}
      </UnauthenticatedLayout>
    </LoadingProvider>
  )
}