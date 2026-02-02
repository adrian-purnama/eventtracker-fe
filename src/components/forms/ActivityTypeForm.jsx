import React, { useState, useEffect } from 'react'

const ActivityTypeForm = ({ initialValues, onSubmit, onCancel }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)

  const isEdit = !!initialValues?._id

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name ?? '')
      setDescription(initialValues.description ?? '')
      setActive(initialValues.active ?? true)
    } else {
      setName('')
      setDescription('')
      setActive(true)
    }
  }, [initialValues])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ name, description, active })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="activity-type-name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          id="activity-type-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Activity type name"
          required
        />
      </div>
      <div>
        <label htmlFor="activity-type-description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="activity-type-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Description"
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="activity-type-active"
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="activity-type-active" className="text-sm font-medium text-gray-700">
          Active
        </label>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isEdit ? 'Update' : 'Create'}
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

export default ActivityTypeForm
