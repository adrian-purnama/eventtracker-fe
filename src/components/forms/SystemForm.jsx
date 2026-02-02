import React, { useState, useEffect } from 'react'

const SystemForm = ({ initialValues, onSubmit, onCancel }) => {
  const [appName, setAppName] = useState('')
  const [openRegistration, setOpenRegistration] = useState(false)

  useEffect(() => {
    if (initialValues) {
      setAppName(initialValues.appName ?? '')
      setOpenRegistration(initialValues.openRegistration ?? false)
    } else {
      setAppName('FC')
      setOpenRegistration(false)
    }
  }, [initialValues])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ appName, openRegistration })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="system-app-name" className="block text-sm font-medium text-gray-700 mb-1">
          Application name
        </label>
        <input
          id="system-app-name"
          type="text"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. FC"
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="system-open-registration"
          type="checkbox"
          checked={openRegistration}
          onChange={(e) => setOpenRegistration(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="system-open-registration" className="text-sm font-medium text-gray-700">
          Open registration (allow new users to register)
        </label>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Update
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

export default SystemForm
