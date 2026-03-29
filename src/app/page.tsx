'use client'

import { useRouter } from 'next/navigation'
import { useProfileContext } from '@/contexts/ProfileContext'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Users, BookOpen, GraduationCap, Pin, ExternalLink } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  cover_image: string | null
  cta_text: string | null
  cta_link: string | null
  is_pinned: boolean
  created_at: string
}

interface Event {
  id: string
  title: string
  date: string
  location: string | null
}

export default function DashboardPage() {
  const { profile, loading: profileLoading, fullName } = useProfileContext()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [memberCount, setMemberCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch announcements (pinned first, then by date)
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch upcoming events (next 5)
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, date, location')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(5)

      // Fetch member count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      setAnnouncements(announcementsData || [])
      setUpcomingEvents(eventsData || [])
      setMemberCount(count || 0)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-[1400px] mx-auto">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">

            {/* Main Feed - Left Column */}
            <div className="space-y-4">
              {/* Welcome Header */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h1 className="text-2xl font-bold text-[#7D1A1D] mb-2">
                  Welcome back, {profile?.first_name}!
                </h1>
                <p className="text-gray-600">
                  Stay connected with your UPIS Batch '84 community
                </p>
              </div>

              {/* Announcements Feed */}
              {loading ? (
                <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
                  <p className="text-gray-500">Loading announcements...</p>
                </div>
              ) : announcements.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
                  <p className="text-gray-500">No announcements yet</p>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Pinned Badge */}
                    {announcement.is_pinned && (
                      <div className="bg-[#C9A335] px-4 py-2 flex items-center gap-2">
                        <Pin className="w-4 h-4 text-white" />
                        <span className="text-sm font-semibold text-white">Pinned Announcement</span>
                      </div>
                    )}

                    {/* Cover Image */}
                    {announcement.cover_image && (
                      <div className="relative w-full h-64">
                        <Image
                          src={announcement.cover_image}
                          alt={announcement.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">
                        {announcement.title}
                      </h2>
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">
                        {announcement.content}
                      </p>

                      {/* CTA Button */}
                      {announcement.cta_text && announcement.cta_link && (
                        <a
                          href={announcement.cta_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#7D1A1D] hover:bg-[#661518] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                          {announcement.cta_text}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      {/* Timestamp */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          Posted on {formatDate(announcement.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar - Right Column */}
            <div className="space-y-4">

              {/* Stats Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#7D1A1D]" />
                  Community Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Members</span>
                    <span className="text-2xl font-bold text-[#7D1A1D]">{memberCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Years Strong</span>
                    <span className="text-2xl font-bold text-[#0B5A28]">41+</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#7D1A1D]" />
                  Upcoming Events
                </h3>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-gray-500">No upcoming events</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <p className="font-semibold text-gray-900 text-sm mb-1">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDate(event.date)}
                        </p>
                        {event.location && (
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {event.location}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
                <Link
                  href="/events"
                  className="block mt-4 text-sm text-[#7D1A1D] hover:underline font-semibold text-center"
                >
                  View All Events →
                </Link>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#7D1A1D]" />
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/members"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Users className="w-5 h-5 text-[#0B5A28]" />
                    <span className="text-sm font-medium text-gray-700">Member Directory</span>
                  </Link>
                  <button
                    onClick={() => router.push('/profile')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <GraduationCap className="w-5 h-5 text-[#C9A335]" />
                    <span className="text-sm font-medium text-gray-700">My Profile</span>
                  </button>
                  <a
                    href="https://upis1984.notion.site/SULYAP-Then-Now-UP-Integrated-School-Batch-84-0118830204ba4c669d849ee03ee025af"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 text-[#7D1A1D]" />
                    <span className="text-sm font-medium text-gray-700">Digital Sulyap</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
    </div>
  )
}
