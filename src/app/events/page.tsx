'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useProfileContext } from '@/contexts/ProfileContext'
import { Loader2, Calendar, MapPin, Users, DollarSign, Clock, Mail, Download, Image as ImageIcon } from 'lucide-react'

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [pastEvents, setPastEvents] = useState<any[]>([])
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

      // Separate into upcoming and past events
      const upcoming = eventsWithData.filter(e => e.event_date >= today)
      const past = eventsWithData.filter(e => e.event_date < today).reverse()

      setUpcomingEvents(upcoming)
      setPastEvents(past)

      // Set first upcoming event as featured
      if (upcoming.length > 0 && !featuredEvent) {
        setFeaturedEvent(upcoming[0])
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

    const previousRsvp = featuredEvent?.user_rsvp

    // Update UI immediately for instant feedback
    const updateEventRsvp = (event: any) => {
      if (event.id !== eventId) return event

      const newCounts = { ...event.rsvp_counts }

      // Decrement old response count
      if (previousRsvp === 'going') newCounts.going_count--
      if (previousRsvp === 'maybe') newCounts.maybe_count--
      if (previousRsvp === 'not_going') newCounts.not_going_count--

      // Increment new response count
      if (response === 'going') newCounts.going_count++
      if (response === 'maybe') newCounts.maybe_count++
      if (response === 'not_going') newCounts.not_going_count++

      return { ...event, user_rsvp: response, rsvp_counts: newCounts }
    }

    // Update state immediately
    setUpcomingEvents(prev => prev.map(updateEventRsvp))
    setPastEvents(prev => prev.map(updateEventRsvp))
    if (featuredEvent?.id === eventId) {
      setFeaturedEvent(updateEventRsvp(featuredEvent))
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
    } catch (error: any) {
      console.error('RSVP error:', error)
      alert('Error: ' + error.message)
      // Revert on error
      await loadEvents()
    } finally {
      setRsvpLoading(false)
    }
  }

  const handleSelectEvent = (event: any) => {
    setFeaturedEvent(event)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const generateICS = (event: any) => {
    const formatDate = (dateString: string, timeString?: string) => {
      const date = new Date(dateString)
      if (timeString) {
        const [hours, minutes] = timeString.split(':')
        date.setHours(parseInt(hours), parseInt(minutes))
      }
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const startDate = formatDate(event.event_date, event.event_time)
    const endDate = formatDate(event.event_date, event.event_time || '23:59')

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UPIS 84//Events//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@upis84.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || ''}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${event.title.replace(/\s+/g, '-')}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#7D1A1D]" />
      </div>
    )
  }

  if (upcomingEvents.length === 0 && pastEvents.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#F5F1E8] border-2 border-[#7D1A1D]/20 rounded-lg p-12 text-center">
            <Calendar className="h-16 w-16 text-[#7D1A1D]/30 mx-auto mb-4" />
            <p className="text-gray-700 font-serif text-lg">No events at the moment</p>
          </div>
        </div>
      </div>
    )
  }

  const eventDate = featuredEvent ? new Date(featuredEvent.event_date) : null
  const today = new Date().toISOString().split('T')[0]
  const isPastEvent = featuredEvent?.event_date < today
  const regDeadline = featuredEvent?.registration_deadline ? new Date(featuredEvent.registration_deadline) : null
  const regClosed = regDeadline && regDeadline < new Date()
  const otherUpcomingEvents = upcomingEvents.filter(e => e.id !== featuredEvent?.id)

  return (
    <div className="min-h-screen py-4 md:py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

        {/* Featured Event - Hero Section (70/30 Layout) */}
        {featuredEvent && (
          <div className="bg-[#F5F1E8] rounded-lg overflow-hidden shadow-lg border-2 border-[#0B5A28]/20">
            {/* Featured Badge at Top */}
            <div className="bg-gradient-to-r from-[#7D1A1D] to-[#5d1316] text-white px-4 md:px-6 py-2 font-serif font-bold text-sm md:text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Featured Event
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Image - 70% */}
              {featuredEvent.image_url && (
                <div className="md:w-[70%]">
                  <img
                    src={featuredEvent.image_url}
                    alt={featuredEvent.title}
                    className="w-full h-56 sm:h-64 md:h-[500px] object-cover"
                  />
                </div>
              )}

              {/* Details - 30% */}
              <div className="md:w-[30%] p-4 sm:p-6 md:p-8 flex flex-col">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#7D1A1D] font-serif mb-3 md:mb-4">
                  {featuredEvent.title}
                </h1>

                <p className="text-gray-800 mb-4 md:mb-6 text-sm md:text-base leading-relaxed">
                  {featuredEvent.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 flex-1">
                  <div className="flex items-start gap-2 text-xs md:text-sm">
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
                    <div className="flex items-center gap-2 text-xs md:text-sm">
                      <Clock className="h-4 w-4 text-[#0B5A28] flex-shrink-0" />
                      <span className="text-gray-700">{featuredEvent.event_time}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-xs md:text-sm">
                    <MapPin className="h-4 w-4 text-[#0B5A28] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{featuredEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <DollarSign className="h-4 w-4 text-[#0B5A28] flex-shrink-0" />
                    <span className="font-medium text-[#7D1A1D]">{featuredEvent.cost}</span>
                  </div>
                  {featuredEvent.contact_person && (
                    <div className="flex items-start gap-2 text-xs md:text-sm">
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

                {/* Add to Calendar Button */}
                <button
                  onClick={() => generateICS(featuredEvent)}
                  className="w-full py-2 px-4 mb-3 rounded-md text-xs md:text-sm font-medium bg-white text-[#0B5A28] border-2 border-[#0B5A28] hover:bg-[#0B5A28] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Add to Calendar
                </button>

                {/* RSVP Count */}
                <div className="flex items-center gap-3 text-xs mb-3 md:mb-4 pb-3 md:pb-4 border-b border-[#0B5A28]/20">
                  <Users className="h-4 w-4 text-gray-700" />
                  <span className="font-semibold text-[#7D1A1D]">
                    {featuredEvent.rsvp_counts?.going_count || 0} Going
                  </span>
                  <span className="font-semibold text-[#0B5A28]">
                    {featuredEvent.rsvp_counts?.maybe_count || 0} Maybe
                  </span>
                </div>

                {/* RSVP Buttons or Past Event Info */}
                {isPastEvent ? (
                  <div className="space-y-3">
                    <div className="text-center py-3 bg-gray-50 rounded-md border border-gray-300">
                      <Users className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                      <p className="text-sm font-semibold text-gray-700">
                        {featuredEvent.rsvp_counts?.going_count || 0} people attended
                      </p>
                    </div>
                    <button
                      onClick={() => alert('Photo gallery feature coming soon!')}
                      className="w-full py-2.5 px-4 rounded-md text-sm font-medium bg-[#0B5A28] text-white hover:bg-[#094620] transition-all flex items-center justify-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      View Photos
                    </button>
                  </div>
                ) : !regClosed && profile ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleRSVP(featuredEvent.id, 'going')}
                      disabled={rsvpLoading}
                      className={`w-full py-2.5 px-4 rounded-md text-sm font-bold transition-all ${
                        featuredEvent.user_rsvp === 'going'
                          ? 'bg-[#7D1A1D] text-white shadow-lg scale-105 ring-2 ring-[#7D1A1D] ring-offset-2'
                          : 'bg-white text-[#7D1A1D] border-2 border-[#7D1A1D]/30 hover:border-[#7D1A1D] hover:bg-[#fff5f5]'
                      }`}
                    >
                      {rsvpLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "✓ I'm Going"}
                    </button>
                    <button
                      onClick={() => handleRSVP(featuredEvent.id, 'maybe')}
                      disabled={rsvpLoading}
                      className={`w-full py-2.5 px-4 rounded-md text-sm font-bold transition-all ${
                        featuredEvent.user_rsvp === 'maybe'
                          ? 'bg-[#0B5A28] text-white shadow-lg scale-105 ring-2 ring-[#0B5A28] ring-offset-2'
                          : 'bg-white text-[#0B5A28] border-2 border-[#0B5A28]/30 hover:border-[#0B5A28] hover:bg-[#f0f9f4]'
                      }`}
                    >
                      ? Maybe
                    </button>
                    <button
                      onClick={() => handleRSVP(featuredEvent.id, 'not_going')}
                      disabled={rsvpLoading}
                      className={`w-full py-2.5 px-4 rounded-md text-sm font-bold transition-all ${
                        featuredEvent.user_rsvp === 'not_going'
                          ? 'bg-gray-700 text-white shadow-lg scale-105 ring-2 ring-gray-700 ring-offset-2'
                          : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      ✗ Can't Go
                    </button>
                  </div>
                ) : regClosed ? (
                  <div className="text-center text-red-700 text-sm font-medium py-2 bg-red-50 rounded-md border border-red-200">
                    Registration Closed
                  </div>
                ) : (
                  <div className="text-center text-gray-700 text-sm py-2 bg-gray-100 rounded-md border border-gray-300">
                    Login to RSVP
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Upcoming Events - Thumbnail Grid */}
        {otherUpcomingEvents.length > 0 && (
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[#7D1A1D] font-serif mb-3 md:mb-4">
              Other Upcoming Events
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {otherUpcomingEvents.map((event) => {
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
                        className="w-full h-32 sm:h-40 object-cover"
                      />
                    )}
                    <div className="p-3 md:p-4">
                      <h3 className="font-bold text-[#7D1A1D] font-serif mb-2 line-clamp-2 text-sm md:text-base">
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

        {/* Past Events Section */}
        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-600 font-serif mb-3 md:mb-4">
              Past Events
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {pastEvents.map((event) => {
                const date = new Date(event.event_date)
                return (
                  <button
                    key={event.id}
                    onClick={() => handleSelectEvent(event)}
                    className="bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all border-2 border-gray-300/50 hover:border-gray-400 text-left opacity-80 hover:opacity-100"
                  >
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-32 sm:h-40 object-cover grayscale-[30%]"
                      />
                    )}
                    <div className="p-3 md:p-4">
                      <h3 className="font-bold text-gray-700 font-serif mb-2 line-clamp-2 text-sm md:text-base">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-700 font-medium">{event.rsvp_counts?.going_count || 0} attended</span>
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
