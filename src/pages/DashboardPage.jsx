import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import apiHelper from '../helper/apiHelper'
import Modal from '../components/Modal'
import DataEntry from '../components/DataEntry'
import EventForm from '../components/forms/EventForm'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function getCountdownLabel(activityDate) {
  if (activityDate == null) return '—'
  const d = new Date(activityDate)
  if (Number.isNaN(d.getTime())) return '—'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffMs = eventDay - today
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays === 0) return 'Event is running today'
  if (diffDays > 0) return `D-${diffDays}`
  return 'Event ended'
}

const DashboardPage = () => {
  const { email } = useAuth()
  const [canShowDataEntry, setCanShowDataEntry] = useState(false)
  const [dataEntryModalOpen, setDataEntryModalOpen] = useState(false)
  const [newEventModalOpen, setNewEventModalOpen] = useState(false)
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    const checkAdrian = async () => {
      try {
        const { data } = await apiHelper.get('/auth/adrian')
        setCanShowDataEntry(data?.success === true)
      } catch {
        setCanShowDataEntry(false)
      }
    }
    checkAdrian()
  }, [])

  const fetchEvents = async () => {
    setEventsLoading(true)
    try {
      const { data } = await apiHelper.get('/api/events/get-events')
      console.log(data)
      setEvents(data?.data ?? [])
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load events'
      toast.error(msg)
      setEvents([])
    } finally {
      setEventsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleCreateEvent = async (payload) => {
    try {
      await apiHelper.post('/api/events/create-event', payload)
      toast.success('Event created successfully')
      setNewEventModalOpen(false)
      fetchEvents()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create event'
      toast.error(msg)
    }
  }

  const handleEventClick = (event) => {
    navigate(`/event/${event._id}`)
  }

  const isCreator = (event) => event.eventCreator?.email === email
  const creatorList = events.filter((e) => isCreator(e))
  const collaboratorList = events.filter(
    (e) => !isCreator(e) && e.collaborators?.some((c) => c?.email === email)
  )

  return (
    <div className="mt-16 mx-10">
      <button
        onClick={() => setNewEventModalOpen(true)}
        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-medium"
      >
        New Event
      </button>

      {canShowDataEntry && (
        <button
          onClick={() => setDataEntryModalOpen(true)}
          className="ml-3 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
        >
          Data entry
        </button>
      )}

      <Modal open={newEventModalOpen} onClose={() => setNewEventModalOpen(false)} title="New Event">
        <EventForm onSubmit={handleCreateEvent} onCancel={() => setNewEventModalOpen(false)} />
      </Modal>

      <Modal open={dataEntryModalOpen} onClose={() => setDataEntryModalOpen(false)} title="Data entry">
        <DataEntry />
      </Modal>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Events you created</h2>
        {eventsLoading ? (
          <p className="text-gray-500 text-sm">Loading events...</p>
        ) : creatorList.length === 0 ? (
          <p className="text-gray-500 text-sm">No events you created.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creatorList.map((event) => (
              <div
                key={event._id}
                onClick={() => handleEventClick(event)}
                className="p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
              >
                <p className="font-medium text-gray-900">{event.name}</p>
                <p className="text-sm text-gray-500">
                  {event.activityType?.name ?? '—'} · {event.eventCreator?.email ?? '—'}
                </p>
                <p className="text-sm mt-1 font-medium text-amber-600">
                  {getCountdownLabel(event.activityDate)}
                </p>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-2">Events you collaborate on</h2>
        {eventsLoading ? (
          <p className="text-gray-500 text-sm">Loading events...</p>
        ) : collaboratorList.length === 0 ? (
          <p className="text-gray-500 text-sm">No events you collaborate on.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collaboratorList.map((event) => (
              <div
                key={event._id}
                onClick={() => handleEventClick(event)}
                className="p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
              >
                <p className="font-medium text-gray-900">{event.name}</p>
                <p className="text-sm text-gray-500">
                  {event.activityType?.name ?? '—'} · by {event.eventCreator?.email ?? '—'}
                </p>
                <p className="text-sm mt-1 font-medium text-amber-600">
                  {getCountdownLabel(event.activityDate)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage