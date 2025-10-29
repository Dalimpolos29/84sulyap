'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Plus, Pencil, Trash2, Calendar, MapPin } from 'lucide-react'
import CreateEventModal from './CreateEventModal'
import EditEventModal from './EditEventModal'

export default function EventsTab() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, profiles!events_created_by_fkey(first_name, last_name)')
        .order('event_date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (event: any) => {
    if (!confirm(`Delete event "${event.title}"?`)) {
      return
    }

    setDeleting(event.id)

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id)

      if (error) throw error

      loadEvents()
    } catch (error: any) {
      console.error('Delete error:', error)
      alert('Error: ' + error.message)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#7D1A1D]" />
      </div>
    )
  }

  return (
    <>
      {/* Add Event Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#7D1A1D] text-white px-4 py-2 rounded hover:bg-[#6a1518] transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Create Event</span>
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.length === 0 ? (
          <div className="col-span-full bg-white rounded shadow-sm p-12 text-center">
            <p className="text-gray-500 font-serif">No events yet</p>
          </div>
        ) : (
          events.map((event) => {
            const eventDate = new Date(event.event_date)
            const isPast = eventDate < new Date()

            return (
              <div
                key={event.id}
                className={`bg-white rounded shadow-sm p-4 ${isPast ? 'opacity-60' : ''}`}
              >
                <div className="flex gap-4">
                  {/* Date Badge */}
                  <div className="flex-shrink-0 bg-[#7D1A1D] text-white rounded p-3 text-center w-16 h-16 flex flex-col items-center justify-center">
                    <div className="text-xs font-medium">
                      {eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </div>
                    <div className="text-2xl font-bold">
                      {eventDate.getDate()}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 font-serif mb-1">
                      {event.title}
                    </h3>
                    <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {eventDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          {event.event_time && ` at ${event.event_time}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setSelectedEvent(event)
                        setShowEditModal(true)
                      }}
                      className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event)}
                      disabled={deleting === event.id}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      {deleting === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modals */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadEvents()
        }}
      />

      <EditEventModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedEvent(null)
        }}
        onSuccess={() => {
          loadEvents()
        }}
        event={selectedEvent}
      />
    </>
  )
}
