'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2, X, Users } from 'lucide-react'

interface ViewAttendeesModalProps {
  isOpen: boolean
  onClose: () => void
  event: any
}

export default function ViewAttendeesModal({ isOpen, onClose, event }: ViewAttendeesModalProps) {
  const [attendees, setAttendees] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'going' | 'maybe' | 'not_going'>('going')

  const supabase = createClient()

  useEffect(() => {
    if (isOpen && event) {
      loadAttendees()
    }
  }, [isOpen, event])

  const loadAttendees = async () => {
    if (!event) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('*, profiles!event_rsvps_user_id_fkey(first_name, last_name, email, username)')
        .eq('event_id', event.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setAttendees(data || [])
    } catch (error) {
      console.error('Error loading attendees:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const goingList = attendees.filter(a => a.response === 'going')
  const maybeList = attendees.filter(a => a.response === 'maybe')
  const notGoingList = attendees.filter(a => a.response === 'not_going')

  const currentList = activeTab === 'going' ? goingList : activeTab === 'maybe' ? maybeList : notGoingList

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#7D1A1D] text-white py-4 px-6 flex items-center justify-between sticky top-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-serif">Event Attendees</h2>
            <p className="text-sm font-serif opacity-90">{event?.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('going')}
              className={`pb-3 px-1 font-serif font-medium transition-colors ${
                activeTab === 'going'
                  ? 'text-[#7D1A1D] border-b-2 border-[#7D1A1D]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Going ({goingList.length})
            </button>
            <button
              onClick={() => setActiveTab('maybe')}
              className={`pb-3 px-1 font-serif font-medium transition-colors ${
                activeTab === 'maybe'
                  ? 'text-[#7D1A1D] border-b-2 border-[#7D1A1D]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Maybe ({maybeList.length})
            </button>
            <button
              onClick={() => setActiveTab('not_going')}
              className={`pb-3 px-1 font-serif font-medium transition-colors ${
                activeTab === 'not_going'
                  ? 'text-[#7D1A1D] border-b-2 border-[#7D1A1D]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Can't Go ({notGoingList.length})
            </button>
          </div>

          {/* Attendees List */}
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#7D1A1D]" />
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center p-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-serif">No responses yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentList.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {attendee.profiles?.first_name} {attendee.profiles?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      @{attendee.profiles?.username}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(attendee.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
