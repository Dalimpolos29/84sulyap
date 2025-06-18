'use client'

import { useState } from 'react'
import StatsCard from '@/components/features/members/StatsCard'
import MembersSearch from '@/components/features/members/MembersSearch'
import MembersGrid from '@/components/features/members/MembersGrid'

export default function MembersDirectory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleViewChange = (view: 'grid' | 'list') => {
    setViewMode(view)
  }

  return (
    <>
      <StatsCard />
      <MembersSearch onSearch={handleSearch} onViewChange={handleViewChange} />
      <div className="container mx-auto px-4 py-8 max-w-[1400px]">
        <MembersGrid searchQuery={searchQuery} viewMode={viewMode} />
      </div>
    </>
  )
} 