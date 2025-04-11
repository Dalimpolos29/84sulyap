'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Member {
  id: string
  first_name: string | null
  last_name: string | null
  profession: string | null
  company: string | null
  profile_picture_url: string | null
}

interface MembersGridProps {
  searchQuery: string
  viewMode: 'grid' | 'list'
}

export default function MembersGrid({ searchQuery, viewMode }: MembersGridProps) {
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
          .select('id, first_name, last_name, profession, company, profile_picture_url')

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

        // Sort the data
        filteredData.sort((a, b) => ((a.last_name || '') + (a.first_name || '')).localeCompare((b.last_name || '') + (b.first_name || '')))

        setMembers(filteredData)
      } catch (err) {
        console.error('Detailed error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch members')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [searchQuery])

  const handleCardClick = (memberId: string) => {
    if (memberId === currentUserId) {
      router.push('/profile') // Route to personal profile page
    } else {
      router.push(`/members/profile/${memberId}`) // Route to member's profile page
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {members.map((member, index) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          onClick={() => handleCardClick(member.id)}
          className="cursor-pointer"
        >
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="flex p-4 gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={member.profile_picture_url || '/default-avatar.png'}
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
        </motion.div>
      ))}
    </div>
  )
} 