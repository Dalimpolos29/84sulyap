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
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles!events_created_by_fkey(first_name, last_name),
          contact_person:profiles!events_contact_person_id_fkey(first_name, last_name, email)
        `)
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
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-[#7D1A1D] font-serif mb-2">
          Upcoming Events
        </h1>
        <p className="text-gray-600 font-serif">
          Join us for alumni gatherings, reunions, and special occasions
        </p>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="bg-white rounded shadow-sm p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-serif">No upcoming events at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => {
            const eventDate = new Date(event.event_date)
            const isPast = eventDate < new Date()
            const regDeadline = event.registration_deadline ? new Date(event.registration_deadline) : null
            const regClosed = regDeadline && regDeadline < new Date()

            return (
              <div
                key={event.id}
                className={`bg-white rounded shadow-sm overflow-hidden ${isPast ? 'opacity-60' : ''}`}
              >
                {/* Cover Image */}
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-4">
                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 font-serif mb-2">
                    {event.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-700 text-sm mb-4">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#7D1A1D]" />
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
                        <Clock className="h-4 w-4 text-[#7D1A1D]" />
                        <span>{event.event_time}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#7D1A1D]" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-[#7D1A1D]" />
                      <span className="font-medium">{event.cost}</span>
                    </div>
                  </div>

                  {/* RSVP Counts */}
                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-4 pb-4 border-b">
                    <Users className="h-4 w-4" />
                    <span className="text-green-600 font-medium">✓ {event.rsvp_counts?.going_count || 0} Going</span>
                    <span className="text-yellow-600 font-medium">? {event.rsvp_counts?.maybe_count || 0} Maybe</span>
                    {event.max_attendees && (
                      <span className="text-gray-500">
                        / {event.max_attendees} max
                      </span>
                    )}
                  </div>

                  {/* RSVP Buttons */}
                  {!isPast && !regClosed && profile && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRSVP(event.id, 'going')}
                        disabled={rsvpLoading === event.id}
                        className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                          event.user_rsvp === 'going'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
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
                        className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                          event.user_rsvp === 'maybe'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                      >
                        Maybe
                      </button>
                      <button
                        onClick={() => handleRSVP(event.id, 'not_going')}
                        disabled={rsvpLoading === event.id}
                        className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                          event.user_rsvp === 'not_going'
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Can't Go
                      </button>
                    </div>
                  )}

                  {regClosed && !isPast && (
                    <div className="text-center text-red-600 text-sm font-medium py-2">
                      Registration Closed
                    </div>
                  )}

                  {isPast && (
                    <div className="text-center text-gray-500 text-sm font-medium py-2">
                      Event Ended
                    </div>
                  )}

                  {/* Contact Person */}
                  {event.contact_person && (
                    <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
                      For questions, contact: {event.contact_person.first_name} {event.contact_person.last_name}
                      {event.contact_person.email && ` (${event.contact_person.email})`}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
