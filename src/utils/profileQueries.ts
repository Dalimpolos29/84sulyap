/**
 * Database query utilities for profile operations with slug support
 */

import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/hooks/useProfile'
import { generateProfileSlug, parseProfileSlug } from './slugify'

/**
 * Fetches a profile by ID
 * @param id - The profile ID
 * @returns Profile data or null if not found
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching profile by ID:', error)
      return null
    }

    return data as Profile
  } catch (error) {
    console.error('Error in getProfileById:', error)
    return null
  }
}

/**
 * Fetches a profile by slug (first_name_last_name format)
 * @param slug - The profile slug (e.g., "john_doe")
 * @returns Profile data or null if not found
 */
export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  const supabase = createClient()
  
  // Parse the slug to get first and last name
  const { firstName, lastName } = parseProfileSlug(slug)
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('first_name', firstName)
      .ilike('last_name', lastName)
      .single()

    if (error) {
      console.error('Error fetching profile by slug:', error)
      return null
    }

    return data as Profile
  } catch (error) {
    console.error('Error in getProfileBySlug:', error)
    return null
  }
}

/**
 * Generates a slug for a given profile
 * @param profile - The profile object
 * @returns URL-friendly slug
 */
export function getProfileSlug(profile: Profile): string {
  const firstName = profile.first_name || ''
  const lastName = profile.last_name || ''
  return generateProfileSlug(firstName, lastName)
}

/**
 * Fetches all profiles and returns them with their slugs
 * @returns Array of profiles with slug property added
 */
export async function getAllProfilesWithSlugs(): Promise<(Profile & { slug: string })[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('first_name', 'is', null)
      .not('last_name', 'is', null)

    if (error) {
      console.error('Error fetching profiles:', error)
      return []
    }

    // Add slug to each profile
    return data.map(profile => ({
      ...profile,
      slug: getProfileSlug(profile as Profile)
    }))
  } catch (error) {
    console.error('Error in getAllProfilesWithSlugs:', error)
    return []
  }
}

/**
 * Checks if a slug is unique (no duplicate names)
 * @param slug - The slug to check
 * @returns Object with isUnique boolean and conflicting profiles if any
 */
export async function checkSlugUniqueness(slug: string): Promise<{
  isUnique: boolean
  conflicts: Profile[]
}> {
  const supabase = createClient()
  const { firstName, lastName } = parseProfileSlug(slug)
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('first_name', firstName)
      .ilike('last_name', lastName)

    if (error) {
      console.error('Error checking slug uniqueness:', error)
      return { isUnique: true, conflicts: [] }
    }

    return {
      isUnique: data.length <= 1,
      conflicts: data as Profile[]
    }
  } catch (error) {
    console.error('Error in checkSlugUniqueness:', error)
    return { isUnique: true, conflicts: [] }
  }
}