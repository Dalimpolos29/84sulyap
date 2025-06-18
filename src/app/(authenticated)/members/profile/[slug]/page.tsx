'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ProfilePage from '@/app/profile/page'
import { getProfileBySlug } from '@/utils/profileQueries'
import { Profile } from '@/hooks/useProfile'
import Link from 'next/link'

export default function MemberProfilePage() {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileNotFound, setProfileNotFound] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (params.slug) {
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

    fetchProfile()
  }, [params.slug])

  if (isLoading) {
    return null // Let the route-level loading.tsx handle the loading state
  }

  if (profileNotFound) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-4">
            The profile you're looking for doesn't exist or may have been removed.
          </p>
          <Link 
            href="/members" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Members Directory
          </Link>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null // Let the route-level loading.tsx handle the loading state
  }

  // Pass the profile ID to the ProfilePage component
  return <ProfilePage params={Promise.resolve({ id: profile.id })} />
} 