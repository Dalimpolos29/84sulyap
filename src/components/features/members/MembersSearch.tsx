'use client'

import { useState } from 'react'
import { Search, Grid, List, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface MembersSearchProps {
  onSearch: (query: string) => void
  onViewChange: (view: 'grid' | 'list') => void
}

export default function MembersSearch({ onSearch, onViewChange }: MembersSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid')

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleViewToggle = (view: 'grid' | 'list') => {
    setCurrentView(view)
    onViewChange(view)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto px-4 mt-4"
    >
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-10 pr-10 py-2 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-gray-200"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* View Toggle Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => handleViewToggle('grid')}
            className={`p-2 rounded-lg transition-all ${
              currentView === 'grid'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleViewToggle('list')}
            className={`p-2 rounded-lg transition-all ${
              currentView === 'list'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
} 