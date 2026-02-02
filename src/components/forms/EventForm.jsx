import React, { useState, useEffect } from 'react'
import apiHelper from '../../helper/apiHelper'
import SearchableDropdown from '../SearchableDropdown'

const EventForm = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('')
  const [activityTypeId, setActivityTypeId] = useState('')
  const [collaboratorIds, setCollaboratorIds] = useState([])
  const [activityTypes, setActivityTypes] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true)
      try {
        const [typesRes, usersRes] = await Promise.all([
          apiHelper.get('/api/activity-types'),
          apiHelper.get('/api/users'),
        ])
        setActivityTypes(typesRes.data?.data ?? [])
        setUsers(usersRes.data?.data ?? [])
      } catch {
        setActivityTypes([])
        setUsers([])
      } finally {
        setLoading(false)
      }
    }
    fetchOptions()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !activityTypeId) {
      return
    }
    setSubmitting(true)
    onSubmit({
      name: name.trim(),
      activityType: activityTypeId,
      collaborators: collaboratorIds,
    })
    setSubmitting(false)
  }

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading options...</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="event-name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          id="event-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Event name"
          required
        />
      </div>

      <div>
        <label htmlFor="event-activity-type" className="block text-sm font-medium text-gray-700 mb-1">
          Activity type
        </label>
        <SearchableDropdown
          options={activityTypes}
          valueKey="_id"
          labelKey="name"
          value={activityTypeId}
          onChange={setActivityTypeId}
          placeholder="Select activity type"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Collaborators</label>
        <SearchableDropdown
          options={users}
          valueKey="_id"
          labelKey="email"
          selectedValues={collaboratorIds}
          onChange={setCollaboratorIds}
          multiple
          placeholder="Select collaborators"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting || !name.trim() || !activityTypeId}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating...' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default EventForm
