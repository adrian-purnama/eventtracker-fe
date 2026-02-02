import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import apiHelper from '../helper/apiHelper'
import ActivityTypeForm from './forms/ActivityTypeForm'
import SystemForm from './forms/SystemForm'
import UserForm from './forms/UserForm'

const TABS = [
  { id: 'activity-type', label: 'Activity type' },
  { id: 'system', label: 'System' },
  { id: 'user', label: 'User' },
]

const DataEntry = () => {
  const [activeTab, setActiveTab] = useState('activity-type')

  // Activity type state
  const [activityTypes, setActivityTypes] = useState([])
  const [activityTypesLoading, setActivityTypesLoading] = useState(false)
  const [formMode, setFormMode] = useState(null) // null | 'new' | 'edit'
  const [editingActivityType, setEditingActivityType] = useState(null)

  // System state
  const [system, setSystem] = useState(null)
  const [systemLoading, setSystemLoading] = useState(false)
  const [systemFormOpen, setSystemFormOpen] = useState(false)

  // User state
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userFormOpen, setUserFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const fetchActivityTypes = async () => {
    setActivityTypesLoading(true)
    try {
      const { data } = await apiHelper.get('/api/activity-types')
      setActivityTypes(data?.data ?? [])
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load activity types'
      toast.error(msg)
      setActivityTypes([])
    } finally {
      setActivityTypesLoading(false)
    }
  }

  const fetchSystem = async () => {
    setSystemLoading(true)
    try {
      const { data } = await apiHelper.get('/api/system')
      setSystem(data?.data ?? null)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load system config'
      toast.error(msg)
      setSystem(null)
    } finally {
      setSystemLoading(false)
    }
  }

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const { data } = await apiHelper.get('/api/users')
      setUsers(data?.data ?? [])
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load users'
      toast.error(msg)
      setUsers([])
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'activity-type') {
      fetchActivityTypes()
    } else if (activeTab === 'system') {
      fetchSystem()
    } else if (activeTab === 'user') {
      fetchUsers()
    }
  }, [activeTab])

  const handleNewActivityType = () => {
    setEditingActivityType(null)
    setFormMode('new')
  }

  const handleEditActivityType = (item) => {
    setEditingActivityType(item)
    setFormMode('edit')
  }

  const handleDeleteActivityType = async (id) => {
    if (!window.confirm('Delete this activity type?')) return
    try {
      await apiHelper.delete(`/api/activity-types/${id}`)
      toast.success('Activity type deleted')
      fetchActivityTypes()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete'
      toast.error(msg)
    }
  }

  const handleActivityTypeSubmit = async (payload) => {
    try {
      if (formMode === 'edit' && editingActivityType?._id) {
        await apiHelper.put(`/api/activity-types/${editingActivityType._id}`, payload)
        toast.success('Activity type updated')
      } else {
        await apiHelper.post('/api/activity-types', payload)
        toast.success('Activity type created')
      }
      setFormMode(null)
      setEditingActivityType(null)
      fetchActivityTypes()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save'
      toast.error(msg)
    }
  }

  const handleActivityTypeCancel = () => {
    setFormMode(null)
    setEditingActivityType(null)
  }

  const handleSystemSubmit = async (payload) => {
    try {
      await apiHelper.put('/api/system', payload)
      toast.success('System config updated')
      setSystemFormOpen(false)
      fetchSystem()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update'
      toast.error(msg)
    }
  }

  const handleSystemCancel = () => {
    setSystemFormOpen(false)
  }

  const handleEditUser = (item) => {
    setEditingUser(item)
    setUserFormOpen(true)
  }

  const handleUserSubmit = async (payload) => {
    if (!editingUser?._id) return
    try {
      await apiHelper.put(`/api/users/${editingUser._id}`, payload)
      toast.success('User updated')
      setUserFormOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update user'
      toast.error(msg)
    }
  }

  const handleUserCancel = () => {
    setUserFormOpen(false)
    setEditingUser(null)
  }

  return (
    <div className="min-w-[320px]">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Activity type tab */}
      {activeTab === 'activity-type' && (
        <div>
          {formMode ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                {formMode === 'edit' ? 'Edit activity type' : 'New activity type'}
              </h3>
              <ActivityTypeForm
                initialValues={formMode === 'edit' ? editingActivityType : null}
                onSubmit={handleActivityTypeSubmit}
                onCancel={handleActivityTypeCancel}
              />
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-3">
                <button
                  type="button"
                  onClick={handleNewActivityType}
                  className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                  New
                </button>
              </div>
              {activityTypesLoading ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : activityTypes.length === 0 ? (
                <p className="text-gray-500 text-sm">No activity types yet. Create one with New.</p>
              ) : (
                <ul className="space-y-2">
                  {activityTypes.map((item) => (
                    <li
                      key={item._id}
                      className="flex items-center justify-between gap-2 p-3 border border-gray-200 rounded-lg bg-white"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-gray-500 truncate">{item.description}</p>
                        <span
                          className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                            item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditActivityType(item)}
                          className="px-2 py-1 rounded text-sm font-medium text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteActivityType(item._id)}
                          className="px-2 py-1 rounded text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {/* System tab */}
      {activeTab === 'system' && (
        <div>
          {systemFormOpen ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Edit system config</h3>
              <SystemForm
                initialValues={system}
                onSubmit={handleSystemSubmit}
                onCancel={handleSystemCancel}
              />
            </div>
          ) : (
            <>
              {systemLoading ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : system ? (
                <>
                  <div className="flex justify-end mb-3">
                    <button
                      type="button"
                      onClick={() => setSystemFormOpen(true)}
                      className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-2">
                    <p className="text-sm text-gray-500">Application name</p>
                    <p className="font-medium text-gray-900">{system.appName}</p>
                    <p className="text-sm text-gray-500 mt-3">Open registration</p>
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded ${
                        system.openRegistration ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {system.openRegistration ? 'Yes' : 'No'}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm">No system config found.</p>
              )}
            </>
          )}
        </div>
      )}

      {/* User tab */}
      {activeTab === 'user' && (
        <div>
          {userFormOpen && editingUser ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Edit user</h3>
              <UserForm
                initialValues={editingUser}
                onSubmit={handleUserSubmit}
                onCancel={handleUserCancel}
              />
            </div>
          ) : (
            <>
              {usersLoading ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : users.length === 0 ? (
                <p className="text-gray-500 text-sm">No users yet.</p>
              ) : (
                <ul className="space-y-2">
                  {users.map((item) => (
                    <li
                      key={item._id}
                      className="flex items-center justify-between gap-2 p-3 border border-gray-200 rounded-lg bg-white"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{item.email}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          <span
                            className={`inline-block text-xs px-2 py-0.5 rounded ${
                              item.approver ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {item.approver ? 'Approver' : 'User'}
                          </span>
                          <span
                            className={`inline-block text-xs px-2 py-0.5 rounded ${
                              item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEditUser(item)}
                        className="px-2 py-1 rounded text-sm font-medium text-blue-600 hover:bg-blue-50 shrink-0"
                      >
                        Edit
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default DataEntry
