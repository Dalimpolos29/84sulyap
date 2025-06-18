'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { generateProfileSlug } from '@/utils/slugify'
import { generateInitialsAvatar } from '@/utils/avatarUtils'
import ProgressLoader from '@/components/ui/ProgressLoader'

interface Member {
  id: string
  first_name: string | null
  last_name: string | null
  profession: string | null
  company: string | null
  profile_picture_url: string | null
  created_at: string
}

interface MembersGridProps {
  searchQuery: string
  viewMode: 'grid' | 'list'
  sortBy: 'name' | 'registration'
}

export default function MembersGrid({ searchQuery, viewMode, sortBy }: MembersGridProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  // Fetch current user's ID
  useEffect(() => {
    async function getCurrentUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setCurrentUserId(session?.user?.id || null)
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    async function fetchMembers() {
      try {
        setIsLoading(true)
        setError(null)

        // Log the query being built
        console.log('Building query with search:', searchQuery)

        const { data, error: supabaseError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, profession, company, profile_picture_url, created_at')

        // Log the response
        console.log('Supabase response:', { data, error: supabaseError })

        if (supabaseError) {
          console.error('Supabase error:', supabaseError)
          throw new Error(supabaseError.message)
        }

        // Filter the data on the client side for now
        let filteredData = data || []
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase()
          filteredData = filteredData.filter(member => 
            member.first_name?.toLowerCase().includes(searchLower) ||
            member.last_name?.toLowerCase().includes(searchLower)
          )
        }

        // Sort the data based on sortBy prop
        if (sortBy === 'name') {
          filteredData.sort((a, b) => {
            const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim()
            const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim()
            return nameA.localeCompare(nameB)
          })
        } else if (sortBy === 'registration') {
          filteredData.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime()
            const dateB = new Date(b.created_at).getTime()
            return dateB - dateA // Latest first
          })
        }

        setMembers(filteredData)
      } catch (err) {
        console.error('Detailed error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch members')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [searchQuery, sortBy])

  const getProfileLink = (member: Member) => {
    if (member.id === currentUserId) {
      return '/profile' // Route to personal profile page
    } else {
      // Generate slug from member's name
      const slug = generateProfileSlug(
        member.first_name || '', 
        member.last_name || ''
      )
      return `/members/profile/${slug}` // Route to member's profile page
    }
  }

  if (isLoading) {
    return (
      <div className="relative">
        <ProgressLoader duration={1500} />
        <div className="flex justify-center items-center py-12">
          <div className="text-emerald-600 text-sm">Loading members...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-emerald-600 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No members found</p>
      </div>
    )
  }

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {members.map((member, index) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Link 
            href={getProfileLink(member)} 
            className="block cursor-pointer"
            prefetch={true}
          >
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="flex p-4 gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={member.profile_picture_url || generateInitialsAvatar(member.first_name, member.last_name)}
                    alt={`${member.first_name || ''} ${member.last_name || ''}`}
                    fill
                    className="rounded-lg object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {member.first_name || ''} {member.last_name || ''}
                    {member.id === currentUserId && (
                      <span className="ml-2 text-xs text-emerald-600">(You)</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{member.profession || 'No profession listed'}</p>
                  <p className="text-sm text-gray-500 truncate">{member.company || 'No company listed'}</p>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )

  // List View Component
  const ListView = () => (
    <div className="space-y-4">
      {members.map((member, index) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Link 
            href={getProfileLink(member)} 
            className="block cursor-pointer"
            prefetch={true}
          >
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="flex p-6 gap-6 items-center">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={member.profile_picture_url || generateInitialsAvatar(member.first_name, member.last_name)}
                    alt={`${member.first_name || ''} ${member.last_name || ''}`}
                    fill
                    className="rounded-full object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">
                      {member.first_name || ''} {member.last_name || ''}
                    </h3>
                    {member.id === currentUserId && (
                      <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-600 rounded-full">You</span>
                    )}
                  </div>
                  <p className="text-gray-600 truncate mb-1">{member.profession || 'No profession listed'}</p>
                  <p className="text-gray-500 truncate">{member.company || 'No company listed'}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )

  return viewMode === 'grid' ? <GridView /> : <ListView />
} 