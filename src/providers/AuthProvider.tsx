'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import LoginPage from '@/app/(auth)/login/page'
import ProgressLoader from '@/components/ui/ProgressLoader'

// Auth context type definition
type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {}
})

// Provider props definition
type AuthProviderProps = {
  children: ReactNode
}

// Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setSession(null)
          setUser(null)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Unexpected auth error:', error)
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle auth events
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        } else if (event === 'SIGNED_IN') {
          router.push('/')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // The auth state change listener will handle the redirect
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) throw error
      
      setSession(session)
      setUser(session?.user ?? null)
    } catch (error) {
      console.error('Session refresh error:', error)
    }
  }

  const contextValue = {
    user,
    session,
    loading,
    signOut,
    refreshSession
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()

    if (loading) {
      return <ProgressLoader duration={2000} />
    }

    if (!user) {
      return <LoginPage />
    }

    return <Component {...props} />
  }
}

// Component for handling authentication requirement
export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <ProgressLoader duration={2000} />
  }

  if (!user) {
    return <LoginPage />
  }

  return <>{children}</>
}