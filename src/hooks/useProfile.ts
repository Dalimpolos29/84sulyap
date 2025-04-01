'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

// Define types for profile data
export type Profile = {
  id: string
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  suffix: string | null
  email: string | null
  birthday: string | null
  phone_number: string | null
  address: string | null
  section_3rd_year: string | null
  section_4th_year: string | null
  section_1st_year: string | null
  section_2nd_year: string | null
  profession: string | null
  company: string | null
  hobbies_interests: string | null
  spouse_name: string | null
  children: string | null
  profile_picture_url: string | null
  then_picture_url: string | null
  privacy_settings: {
    phone: boolean
    email: boolean
    address: boolean
    spouse: boolean
    children: boolean
  } | null
  // Add other profile fields as needed
}

// Hook return type
type UseProfileReturn = {
  profile: Profile | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>
}

export function useProfile(user: User | null): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  
  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        throw error
      }
      
      setProfile(data as Profile)
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchProfile()
  }, [user?.id])
  
  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    setProfile
  }
}

// Utility function to format full name
export function formatFullName(profile: Profile | null): string {
  if (!profile) return 'Unknown User'
  
  const parts = []
  if (profile.first_name) parts.push(profile.first_name)
  if (profile.middle_name) parts.push(profile.middle_name)
  if (profile.last_name) parts.push(profile.last_name)
  if (profile.suffix) parts.push(profile.suffix)
  
  return parts.join(' ') || 'Unknown User'
}

// Utility function to format display name (first name only)
export function formatDisplayName(profile: Profile | null): string {
  if (!profile) return 'Unknown User'
  
  return profile.first_name || 'Unknown User'
}

// Utility function to format name with middle initial
export function formatNameWithMiddleInitial(profile: Profile | null): string {
  if (!profile) return 'Unknown User'
  
  const parts = []
  if (profile.first_name) parts.push(profile.first_name)
  
  // Add middle initial if available
  if (profile.middle_name) {
    const middleInitial = profile.middle_name.charAt(0).toUpperCase() + '.'
    parts.push(middleInitial)
  }
  
  if (profile.last_name) parts.push(profile.last_name)
  if (profile.suffix) parts.push(profile.suffix)
  
  return parts.join(' ') || 'Unknown User'
}

// Utility function to get initials
export function getInitials(profile: Profile | null): string {
  if (!profile) return 'U'
  
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase()
  }
  
  if (profile.first_name) {
    return profile.first_name.charAt(0).toUpperCase()
  }
  
  if (profile.email) {
    return profile.email.charAt(0).toUpperCase()
  }
  
  return 'U'
} 