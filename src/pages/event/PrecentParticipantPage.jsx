import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import apiHelper from '../../helper/apiHelper'

const PrecentParticipantPage = () => {
  const { id: eventId } = useParams()
  const [hasParticipants, setHasParticipants] = useState(null)
  const [meta, setMeta] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [markingId, setMarkingId] = useState(null)

  useEffect(() => {
    if (!eventId) return
    const check = async () => {
      try {
        const { data } = await apiHelper.get(`/api/events/participants-check/${eventId}`)
        const has = data?.data?.hasParticipants === true
        setHasParticipants(has)
        if (has) {
          setLoading(true)
          try {
            const res = await apiHelper.get(`/api/events/participants/${eventId}`)
            const payload = res.data?.data ?? null
            setMeta(payload?.meta ?? null)
            setParticipants(payload?.participants ?? [])
          } catch {
            toast.error('Failed to load participants')
            setParticipants([])
          } finally {
            setLoading(false)
          }
        }
      } catch {
        setHasParticipants(false)
      }
    }
    check()
  }, [eventId])

  const searchableFields = meta?.searchableFields ?? []
  const columnNames = meta?.columnNames ?? []

  const runSearch = () => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) {
      setSearchResults([])
      return
    }
    const filtered = participants.filter((p) => {
      const data = p.data || {}
      return searchableFields.some((field) => {
        const val = data[field]
        return val != null && String(val).toLowerCase().includes(q)
      })
    })
    setSearchResults(filtered)
    setSearchQuery('')
  }

  const handleMarkPresent = async (participantId, currentPresent) => {
    if (!eventId || !participantId) return
    setMarkingId(participantId)
    try {
      await apiHelper.patch(
        `/api/events/participants/${eventId}/${participantId}`,
        { present: !currentPresent }
      )
      setParticipants((prev) =>
        prev.map((p) =>
          p._id === participantId ? { ...p, present: !currentPresent } : p
        )
      )
      setSearchResults((prev) =>
        prev.map((p) =>
          p._id === participantId ? { ...p, present: !currentPresent } : p
        )
      )
      toast.success(currentPresent ? 'Marked absent' : 'Marked present')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update'
      toast.error(msg)
    } finally {
      setMarkingId(null)
    }
  }

  if (hasParticipants === null || loading) {
    return (
      <div className="mt-16 mx-20">
        {eventId && (
          <Link to={`/event/${eventId}`} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4">
            ← Back to event
          </Link>
        )}
        <p className="text-gray-500">Loading…</p>
      </div>
    )
  }

  if (!hasParticipants) {
    return (
      <div className="mt-16 mx-auto max-w-md">
        <Link to={`/event/${eventId}`} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4">
          ← Back to event
        </Link>
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Mark presence</h1>
        <p className="text-gray-600 mb-4">There are no participants for this event yet.</p>
        <Link
          to={`/event/guest-list/${eventId}`}
          className="inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm"
        >
          Go to upload participants
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-16 mx-auto max-w-4xl">
      <Link to={`/event/${eventId}`} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4">
        ← Back to event
      </Link>
      <h1 className="text-xl font-semibold text-gray-800 mb-4">Mark presence</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search {searchableFields.length > 0 ? `by ${searchableFields.join(', ')}` : ''}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder="Type and press Enter to search"
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <button
            type="button"
            onClick={runSearch}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-medium text-sm"
          >
            Search
          </button>
        </div>
      </div>

      {searchResults.length === 0 && searchQuery.trim() ? (
        <p className="text-gray-500 text-sm">No participants match your search.</p>
      ) : searchResults.length > 0 ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {columnNames.map((col) => (
                    <th key={col} className="px-3 py-2 text-left font-medium text-gray-700">
                      {col}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left font-medium text-gray-700 w-32">
                    Present
                  </th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((p) => (
                  <tr key={p._id} className="border-b border-gray-100">
                    {columnNames.map((col) => (
                      <td key={col} className="px-3 py-2 text-gray-600">
                        {p.data?.[col] ?? '—'}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => handleMarkPresent(p._id, p.present)}
                        disabled={markingId === p._id}
                        className={`px-2 py-1 rounded text-xs font-medium disabled:opacity-50 ${
                          p.present
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {markingId === p._id ? '…' : p.present ? 'Present' : 'Mark present'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Type in the search box and press Enter to find participants.</p>
      )}
    </div>
  )
}

export default PrecentParticipantPage
