'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useProfileContext } from '@/contexts/ProfileContext'
import { Loader2, Calendar, MapPin, Users, DollarSign, Clock, Mail } from 'lucide-react'

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [featuredEvent, setFeaturedEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const { profile } = useProfileContext()

  const supabase = createClient()

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles!events_created_by_fkey(first_name, last_name),
          contact_person:profiles!events_contact_person_id_fkey(first_name, last_name, email)
        `)
        .gte('event_date', today)
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
      // Set first event as featured
      if (eventsWithData.length > 0 && !featuredEvent) {
        setFeaturedEvent(eventsWithData[0])
      }
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

    setRsvpLoading(true)

    try {
      const { error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: profile.id,
          response,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'event_id,user_id'
        })

      if (error) throw error

      await loadEvents()
    } catch (error: any) {
      console.error('RSVP error:', error)
      alert('Error: ' + error.message)
    } finally {
      setRsvpLoading(false)
    }
  }

  const handleSelectEvent = (event: any) => {
    setFeaturedEvent(event)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#7D1A1D]" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#F5F1E8] border-2 border-[#7D1A1D]/20 rounded-lg p-12 text-center">
            <Calendar className="h-16 w-16 text-[#7D1A1D]/30 mx-auto mb-4" />
            <p className="text-gray-700 font-serif text-lg">No upcoming events at the moment</p>
          </div>
        </div>
      </div>
    )
  }

  const eventDate = featuredEvent ? new Date(featuredEvent.event_date) : null
  const regDeadline = featuredEvent?.registration_deadline ? new Date(featuredEvent.registration_deadline) : null
  const regClosed = regDeadline && regDeadline < new Date()
  const otherEvents = events.filter(e => e.id !== featuredEvent?.id)

  return (
    <div className="min-h-screen py-6 md:py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Featured Event - Hero Section (70/30 Layout) */}
        {featuredEvent && (
          <div className="bg-[#F5F1E8] rounded-lg overflow-hidden shadow-lg border-2 border-[#0B5A28]/20">
            <div className="flex flex-col md:flex-row">
              {/* Image - 70% */}
              {featuredEvent.image_url && (
                <div className="md:w-[70%] relative">
                  <img
                    src={featuredEvent.image_url}
                    alt={featuredEvent.title}
                    className="w-full h-64 md:h-[500px] object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#7D1A1D] text-white px-4 py-2 rounded-md font-serif font-bold">
                    Featured Event
                  </div>
                </div>
              )}

              {/* Details - 30% */}
              <div className="md:w-[30%] p-6 md:p-8 flex flex-col">
                <h1 className="text-2xl md:text-3xl font-bold text-[#7D1A1D] font-serif mb-4">
                  {featuredEvent.title}
                </h1>

                <p className="text-gray-800 mb-6 text-sm md:text-base">
                  {featuredEvent.description}
                </p>

                {/* Event Details */}
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-[#0B5A28] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      {eventDate?.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {featuredEvent.event_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-[#0B5A28] flex-shrink-0" />
                      <span className="text-gray-700">{featuredEvent.event_time}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-[#0B5A28] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{featuredEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-[#0B5A28] flex-shrink-0" />
                    <span className="font-medium text-[#7D1A1D]">{featuredEvent.cost}</span>
                  </div>
                  {featuredEvent.contact_person && (
                    <div className="flex items-start gap-2 text-sm">
                      <Mail className="h-4 w-4 text-[#0B5A28] flex-shrink-0 mt-0.5" />
                      <div className="text-gray-700">
                        <div>{featuredEvent.contact_person.first_name} {featuredEvent.contact_person.last_name}</div>
                        {featuredEvent.contact_person.email && (
                          <div className="text-xs text-gray-600">{featuredEvent.contact_person.email}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* RSVP Count */}
                <div className="flex items-center gap-3 text-xs text-gray-700 mb-4 pb-4 border-b border-[#0B5A28]/20">
                  <Users className="h-4 w-4" />
                  <span className="font-medium text-[#7D1A1D]">
                    ✓ {featuredEvent.rsvp_counts?.going_count || 0} Going
                  </span>
                  <span className="font-medium text-[#0B5A28]">
                    ? {featuredEvent.rsvp_counts?.maybe_count || 0} Maybe
                  </span>
                </div>

                {/* RSVP Buttons */}
                {!regClosed && profile ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleRSVP(featuredEvent.id, 'going')}
                      disabled={rsvpLoading}
                      className={`w-full py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                        featuredEvent.user_rsvp === 'going'
                          ? 'bg-[#7D1A1D] text-white shadow-md'
                          : 'bg-[#f5e6e7] text-[#7D1A1D] hover:bg-[#ead5d6] border border-[#7D1A1D]'
                      }`}
                    >
                      {rsvpLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "I'm Going"}
                    </button>
                    <button
                      onClick={() => handleRSVP(featuredEvent.id, 'maybe')}
                      disabled={rsvpLoading}
                      className={`w-full py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                        featuredEvent.user_rsvp === 'maybe'
                          ? 'bg-[#0B5A28] text-white shadow-md'
                          : 'bg-[#e6f5ed] text-[#0B5A28] hover:bg-[#d5ede0] border border-[#0B5A28]'
                      }`}
                    >
                      Maybe
                    </button>
                    <button
                      onClick={() => handleRSVP(featuredEvent.id, 'not_going')}
                      disabled={rsvpLoading}
                      className={`w-full py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                        featuredEvent.user_rsvp === 'not_going'
                          ? 'bg-gray-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      Can't Go
                    </button>
                  </div>
                ) : regClosed ? (
                  <div className="text-center text-red-700 text-sm font-medium py-2 bg-red-50 rounded-md">
                    Registration Closed
                  </div>
                ) : (
                  <div className="text-center text-gray-700 text-sm py-2 bg-gray-100 rounded-md">
                    Login to RSVP
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Upcoming Events - Thumbnail Grid */}
        {otherEvents.length > 0 && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#7D1A1D] font-serif mb-4">
              Other Upcoming Events
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {otherEvents.map((event) => {
                const date = new Date(event.event_date)
                return (
                  <button
                    key={event.id}
                    onClick={() => handleSelectEvent(event)}
                    className="bg-[#F5F1E8] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-[#0B5A28]/20 hover:border-[#7D1A1D]/40 text-left"
                  >
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-[#7D1A1D] font-serif mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-700 mb-2">
                        <Calendar className="h-3 w-3 text-[#0B5A28]" />
                        <span>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700">
                        <Users className="h-3 w-3 text-[#0B5A28]" />
                        <span className="text-[#7D1A1D] font-medium">{event.rsvp_counts?.going_count || 0} going</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
