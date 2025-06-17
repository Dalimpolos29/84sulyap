'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ProfilePage from '@/app/profile/page'
import { createClient } from '@/utils/supabase/client'
import LoginPage from '@/app/(auth)/login/page'
import { getProfileBySlug } from '@/utils/profileQueries'
import { Profile } from '@/hooks/useProfile'

export default function MemberProfilePage() {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileNotFound, setProfileNotFound] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const initializeComponent = async () => {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      if (session && params.slug) {
        // Fetch profile by slug
        const profileData = await getProfileBySlug(params.slug as string)
        if (profileData) {
          setProfile(profileData)
        } else {
          setProfileNotFound(true)
        }
      }
      
      setIsLoading(false)
    }

    initializeComponent()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [params.slug])

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

  if (profileNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-4">
            The profile you're looking for doesn't exist or may have been removed.
          </p>
          <a 
            href="/members" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Members Directory
          </a>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Pass the profile ID to the ProfilePage component
  return <ProfilePage params={Promise.resolve({ id: profile.id })} />
} 