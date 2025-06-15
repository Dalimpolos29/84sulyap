'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ProfilePage from '@/app/profile/page'
import { createClient } from '@/utils/supabase/client'
import LoginPage from '@/app/(auth)/login/page'

export default function MemberProfilePage() {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setIsLoading(false)
    }
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return <ProfilePage params={Promise.resolve({ id: params.id as string })} />
} 