'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'

interface StatsCardProps {
  totalBatchMembers?: number
}

interface LatestMember {
  first_name: string
  last_name: string
}

export default function StatsCard({ totalBatchMembers = 320 }: StatsCardProps) {
  const [registeredCount, setRegisteredCount] = useState<number>(0)
  const [latestMember, setLatestMember] = useState<LatestMember | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      // Fetch count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
      
      if (count !== null) {
        setRegisteredCount(count)
      }

      // Fetch latest member
      const { data: latest } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (latest) {
        setLatestMember(latest)
      }
    }

    fetchData()
  }, [])

  const percentage = Math.round((registeredCount / totalBatchMembers) * 100)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto px-4 mt-1 mb-3"
    >
      <div className="relative bg-gradient-to-br from-[#004225] to-[#1a8f70] backdrop-blur-lg rounded-xl border border-white/20 shadow-xl overflow-hidden">
        <div className="relative py-2 px-3 flex flex-row items-start justify-between gap-2">
          {/* Pie Chart Section */}
          <div className="w-28 h-28 md:w-32 md:h-32 relative flex-shrink-0 pt-1">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-white"
                strokeWidth="15"
                stroke="currentColor"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
              />
              <circle
                className="text-[#7D1A1D] transition-all duration-1000 ease-in-out"
                strokeWidth="15"
                strokeDasharray={`${percentage * 2.64} ${264 - percentage * 2.64}`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl md:text-3xl font-bold text-white">{percentage}%</span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex-1 relative pl-2 pt-1 flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative text-center"
              >
                <p className="text-xl md:text-2xl font-bold text-white tracking-tight mb-0">{registeredCount}</p>
                <h3 className="text-[10px] uppercase tracking-wider text-emerald-300">Profiles</h3>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative text-center"
              >
                <p className="text-xl md:text-2xl font-bold text-white tracking-tight mb-0">{totalBatchMembers}</p>
                <h3 className="text-[10px] uppercase tracking-wider text-emerald-300">Alumni</h3>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative text-center"
              >
                <p className="text-xl md:text-2xl font-bold text-white tracking-tight mb-0">{percentage}%</p>
                <h3 className="text-[10px] uppercase tracking-wider text-emerald-300">Rate</h3>
              </motion.div>
            </div>

            {/* Latest Member Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-left col-span-3 mt-2"
            >
              <span className="text-[10px] uppercase tracking-wider text-emerald-300 block">Latest Registered Alumni</span>
              <p className="text-sm md:text-base font-medium text-white tracking-tight">
                {latestMember ? (
                  <>
                    <span className="font-semibold">{latestMember.first_name}</span>
                    {' '}
                    <span>{latestMember.last_name}</span>
                  </>
                ) : '—'}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 