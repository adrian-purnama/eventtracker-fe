import React, { useState, useEffect } from 'react'

const UserForm = ({ initialValues, onSubmit, onCancel }) => {
  const [email, setEmail] = useState('')
  const [approver, setApprover] = useState(false)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (initialValues) {
      setEmail(initialValues.email ?? '')
      setApprover(initialValues.approver ?? false)
      setIsActive(initialValues.isActive ?? true)
    } else {
      setEmail('')
      setApprover(false)
      setIsActive(true)
    }
  }, [initialValues])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ email, approver, isActive })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="user-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="user@example.com"
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="user-approver"
          type="checkbox"
          checked={approver}
          onChange={(e) => setApprover(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="user-approver" className="text-sm font-medium text-gray-700">
          Approver
        </label>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="user-is-active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="user-is-active" className="text-sm font-medium text-gray-700">
          Active
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

export default UserForm
