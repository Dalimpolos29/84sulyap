'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useProfileContext } from '@/contexts/ProfileContext'
import { Loader2, Calendar, MapPin, Users, DollarSign, Clock } from 'lucide-react'

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null)
  const { profile } = useProfileContext()

  const supabase = createClient()

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      // Get today's date for filtering
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles!events_created_by_fkey(first_name, last_name),
          contact_person:profiles!events_contact_person_id_fkey(first_name, last_name, email)
        `)
        .gte('event_date', today) // Only future/today events
        .order('event_date', { ascending: true })

      if (error) throw error

      // Get RSVP counts and user's RSVP status for each event
      const eventsWithData = await Promise.all(
        (data || []).map(async (event) => {
          const { data: rsvpData } = await supabase
            .rpc('get_event_rsvp_counts', { event_id_input: event.id })

          let userRsvp = null
          if (profile?.id) {
            const { data: userRsvpData } = await supabase
              .from('event_rsvps')
              .select('response')
              .eq('event_id', event.id)
              .eq('user_id', profile.id)
              .single()

            userRsvp = userRsvpData?.response || null
          }

          return {
            ...event,
            rsvp_counts: rsvpData?.[0] || { going_count: 0, maybe_count: 0, not_going_count: 0, total_count: 0 },
            user_rsvp: userRsvp
          }
        })
      )

      setEvents(eventsWithData)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRSVP = async (eventId: string, response: 'going' | 'maybe' | 'not_going') => {
    if (!profile?.id) {
      alert('Please log in to RSVP')
      return
    }

    setRsvpLoading(eventId)

    try {
      const { error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: profile.id,
          response,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Reload events to update counts
      await loadEvents()
    } catch (error: any) {
      console.error('RSVP error:', error)
      alert('Error: ' + error.message)
    } finally {
      setRsvpLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#7D1A1D]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-stone-50 border-b border-stone-200 py-4 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#7D1A1D] font-serif">
            Upcoming Events
          </h1>
          <p className="text-gray-600 font-serif text-sm mt-1">
            Join us for alumni gatherings, reunions, and special occasions
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {events.length === 0 ? (
          <div className="bg-stone-50 rounded-lg shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-serif">No upcoming events at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const eventDate = new Date(event.event_date)
              const regDeadline = event.registration_deadline ? new Date(event.registration_deadline) : null
              const regClosed = regDeadline && regDeadline < new Date()

              return (
                <div
                  key={event.id}
                  className="bg-stone-50 rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image - Left */}
                    {event.image_url && (
                      <div className="md:w-64 md:flex-shrink-0">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content - Right */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Main Content */}
                        <div className="flex-1">
                          {/* Title */}
                          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif mb-2">
                            {event.title}
                          </h2>

                          {/* Description */}
                          <p className="text-gray-700 mb-4">
                            {event.description}
                          </p>

                          {/* Event Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-[#7D1A1D] flex-shrink-0" />
                              <span>
                                {eventDate.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            {event.event_time && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[#7D1A1D] flex-shrink-0" />
                                <span>{event.event_time}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[#7D1A1D] flex-shrink-0" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-[#7D1A1D] flex-shrink-0" />
                              <span className="font-medium text-[#7D1A1D]">{event.cost}</span>
                            </div>
                          </div>

                          {/* RSVP Counts */}
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <Users className="h-4 w-4" />
                            <span className="font-medium text-[#7D1A1D]">
                              ✓ {event.rsvp_counts?.going_count || 0} Going
                            </span>
                            <span className="font-medium text-[#9d5a5c]">
                              ? {event.rsvp_counts?.maybe_count || 0} Maybe
                            </span>
                            {event.max_attendees && (
                              <span className="text-gray-500">
                                / {event.max_attendees} max
                              </span>
                            )}
                          </div>
                        </div>

                        {/* RSVP Buttons - Right */}
                        <div className="md:w-48 flex md:flex-col gap-2">
                          {!regClosed && profile ? (
                            <>
                              <button
                                onClick={() => handleRSVP(event.id, 'going')}
                                disabled={rsvpLoading === event.id}
                                className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                                  event.user_rsvp === 'going'
                                    ? 'bg-[#7D1A1D] text-white'
                                    : 'bg-[#f5e6e7] text-[#7D1A1D] hover:bg-[#ead5d6] border border-[#7D1A1D]'
                                }`}
                              >
                                {rsvpLoading === event.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                ) : (
                                  'Going'
                                )}
                              </button>
                              <button
                                onClick={() => handleRSVP(event.id, 'maybe')}
                                disabled={rsvpLoading === event.id}
                                className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                                  event.user_rsvp === 'maybe'
                                    ? 'bg-[#9d5a5c] text-white'
                                    : 'bg-[#f5eded] text-[#9d5a5c] hover:bg-[#ede0e0] border border-[#9d5a5c]'
                                }`}
                              >
                                Maybe
                              </button>
                              <button
                                onClick={() => handleRSVP(event.id, 'not_going')}
                                disabled={rsvpLoading === event.id}
                                className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                                  event.user_rsvp === 'not_going'
                                    ? 'bg-gray-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                }`}
                              >
                                Can't Go
                              </button>
                            </>
                          ) : regClosed && !profile ? (
                            <div className="text-center text-sm py-2">
                              <div className="text-red-600 font-medium mb-1">Registration Closed</div>
                              <div className="text-gray-500 text-xs">Login to see details</div>
                            </div>
                          ) : regClosed ? (
                            <div className="text-center text-red-600 text-sm font-medium py-2">
                              Registration Closed
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 text-sm py-2">
                              Login to RSVP
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact Person */}
                      {event.contact_person && (
                        <div className="text-xs text-gray-500 mt-4 pt-4 border-t">
                          For questions, contact: {event.contact_person.first_name} {event.contact_person.last_name}
                          {event.contact_person.email && ` (${event.contact_person.email})`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
