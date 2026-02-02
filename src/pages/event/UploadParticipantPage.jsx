import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import apiHelper from '../../helper/apiHelper'
import Modal from '../../components/Modal'

const UploadParticipantPage = () => {
  const { id: eventId } = useParams()
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [guideOpen, setGuideOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [instanceId, setInstanceId] = useState(null)
  const [instanceData, setInstanceData] = useState(null)
  const [instanceLoading, setInstanceLoading] = useState(false)
  const [columnsToInclude, setColumnsToInclude] = useState([])
  const [searchableColumns, setSearchableColumns] = useState([])
  const [saving, setSaving] = useState(false)
  const [hasParticipants, setHasParticipants] = useState(null)
  const [existingData, setExistingData] = useState(null)
  const [existingLoading, setExistingLoading] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!eventId) return
    const check = async () => {
      try {
        const { data } = await apiHelper.get(`/api/events/participants-check/${eventId}`)
        const has = data?.data?.hasParticipants === true
        setHasParticipants(has)
        if (has) {
          setExistingLoading(true)
          try {
            const res = await apiHelper.get(`/api/events/participants/${eventId}`)
            setExistingData(res.data?.data ?? null)
          } catch {
            toast.error('Failed to load participants')
            setExistingData(null)
          } finally {
            setExistingLoading(false)
          }
        }
      } catch {
        setHasParticipants(false)
      }
    }
    check()
  }, [eventId])

  const fetchInstanceData = async (id) => {
    if (!id) return
    setInstanceLoading(true)
    try {
      const { data } = await apiHelper.get('/api/events/get-instance', {
        params: { instanceId: id },
      })
      const payload = data?.data ?? null
      setInstanceData(payload)
      setColumnsToInclude(payload?.columnNames ?? [])
      setSearchableColumns([])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load instance data')
      setInstanceData(null)
    } finally {
      setInstanceLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const chosen = e.target.files?.[0]
    if (chosen) {
      setFile(chosen)
      setFileName(chosen.name)
    } else {
      setFile(null)
      setFileName('')
    }
  }

  const handleUpload = async () => {
    if (!file || !eventId) {
      toast.error('Choose a CSV file first.')
      return
    }
    setUploading(true)
    setInstanceData(null)
    try {
      const csvText = await file.text()
      const res = await apiHelper.post(
        `/api/events/upload-participants/${eventId}`,
        { csv: csvText }
      )
      const id = res.data?.data?.instanceId
      toast.success(res.data?.message || 'CSV uploaded successfully')
      setFile(null)
      setFileName('')
      if (document.querySelector('input[type="file"]')) {
        document.querySelector('input[type="file"]').value = ''
      }
      if (id) {
        setInstanceId(id)
        await fetchInstanceData(id)
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload failed'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const toggleInclude = (col) => {
    setColumnsToInclude((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    )
    setSearchableColumns((prev) => prev.filter((c) => c !== col))
  }

  const toggleSearchable = (col) => {
    setSearchableColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    )
  }

  const handleSaveStaging = async () => {
    if (!instanceId || !eventId) return
    if (columnsToInclude.length === 0) {
      toast.error('Select at least one column to include.')
      return
    }
    setSaving(true)
    try {
      const res = await apiHelper.post('/api/events/save-staging', {
        instanceId,
        columnsToInclude,
        searchableColumns: searchableColumns.filter((c) => columnsToInclude.includes(c)),
      })
      toast.success(res.data?.message || 'Saved to participants.')
      setInstanceId(null)
      setInstanceData(null)
      setColumnsToInclude([])
      setSearchableColumns([])
      setHasParticipants(true)
      setExistingLoading(true)
      try {
        const res2 = await apiHelper.get(`/api/events/participants/${eventId}`)
        setExistingData(res2.data?.data ?? null)
      } catch {
        setExistingData(null)
      } finally {
        setExistingLoading(false)
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Save failed'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAllParticipants = async () => {
    if (!eventId) return
    setDeleting(true)
    try {
      await apiHelper.delete(`/api/events/participants/${eventId}`)
      toast.success('All participants deleted. You can re-upload.')
      setDeleteConfirmOpen(false)
      setHasParticipants(false)
      setExistingData(null)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Delete failed'
      toast.error(msg)
    } finally {
      setDeleting(false)
    }
  }

  const columnNames = existingData?.meta?.columnNames ?? []

  return (
    <div className="mt-16 mx-auto max-w-2xl">
      <Link to={`/event/${eventId}`} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4">
        ← Back to event
      </Link>
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-xl font-semibold text-gray-800">
          {hasParticipants ? 'Participants' : 'Upload participants (CSV)'}
        </h1>
        {!hasParticipants && (
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="w-7 h-7 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700 flex items-center justify-center text-sm font-medium"
            aria-label="How to prepare CSV"
          >
            ?
          </button>
        )}
      </div>

      {hasParticipants === null || (hasParticipants && existingLoading) ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : hasParticipants && existingData ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {columnNames.length > 0 && (
            <div className="p-3 bg-gray-100 border-b border-gray-200 text-sm text-gray-600">
              Columns: {columnNames.join(', ')}
              {existingData.meta?.searchableFields?.length > 0 && (
                <span className="ml-2"> · Searchable: {existingData.meta.searchableFields.join(', ')}</span>
              )}
            </div>
          )}
          <div className="p-3 border-b border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={deleting}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete all participants
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {columnNames.map((col) => (
                    <th key={col} className="px-3 py-2 text-left font-medium text-gray-700">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(existingData.participants || []).map((p, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    {columnNames.map((col) => (
                      <td key={col} className="px-3 py-2 text-gray-600">
                        {p.data?.[col] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <label className="cursor-pointer">
          <span className="inline-block px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-medium text-gray-800 text-sm">
            Choose CSV file
          </span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        {fileName && (
          <>
            <span className="text-sm text-gray-600">{fileName}</span>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </>
        )}
      </div>

      {instanceId && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700">Instance ID</p>
          <p className="text-sm text-gray-600 font-mono break-all">{instanceId}</p>
        </div>
      )}

      {instanceLoading && (
        <p className="text-sm text-gray-500">Loading instance data…</p>
      )}

      {instanceData && !instanceLoading && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-100 border-b border-gray-200 grid grid-cols-2 gap-2 text-sm">
            <span className="font-medium text-gray-700">Column names</span>
            <span className="text-gray-600">{instanceData.columnNames?.join(', ') || '—'}</span>
            <span className="font-medium text-gray-700">Total rows (sample)</span>
            <span className="text-gray-600">{instanceData.totalRows ?? '—'}</span>
            <span className="font-medium text-gray-700">Duplicates</span>
            <span className="text-gray-600">{instanceData.duplicateValue ?? '—'}</span>
            <span className="font-medium text-gray-700">Missing values</span>
            <span className="text-gray-600">{instanceData.missingValue ?? '—'}</span>
            <span className="font-medium text-gray-700">Rows after clean</span>
            <span className="text-gray-600">{instanceData.totalRowsAfterClean ?? '—'}</span>
          </div>

          <div className="p-3 border-b border-gray-200 bg-white">
            <p className="text-sm font-medium text-gray-700 mb-2">Columns to save</p>
            <p className="text-xs text-gray-500 mb-3">Include: columns to keep. Searchable: columns used for search (only included columns).</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="pb-2 pr-4">Column</th>
                  <th className="pb-2 pr-4">Include</th>
                  <th className="pb-2">Searchable</th>
                </tr>
              </thead>
              <tbody>
                {(instanceData.columnNames || []).map((col) => (
                  <tr key={col} className="border-t border-gray-100">
                    <td className="py-1.5 pr-4 font-medium text-gray-700">{col}</td>
                    <td className="py-1.5 pr-4">
                      <input
                        type="checkbox"
                        checked={columnsToInclude.includes(col)}
                        onChange={() => toggleInclude(col)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-1.5">
                      <input
                        type="checkbox"
                        checked={searchableColumns.includes(col)}
                        onChange={() => toggleSearchable(col)}
                        disabled={!columnsToInclude.includes(col)}
                        className="rounded border-gray-300 disabled:opacity-50"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={handleSaveStaging}
              disabled={saving || columnsToInclude.length === 0}
              className="mt-3 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Save to participants'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {(instanceData.columnNames || []).map((col) => (
                    <th key={col} className="px-3 py-2 text-left font-medium text-gray-700">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(instanceData.rows || []).map((rowDoc, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    {(instanceData.columnNames || []).map((col) => (
                      <td key={col} className="px-3 py-2 text-gray-600">
                        {rowDoc.data?.[col] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}

      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="How to prepare your CSV">
        <div className="text-sm text-gray-600 space-y-3">
          <ul className="space-y-1 list-disc list-inside">
            <li><strong>First row</strong> must be column headers (e.g. name, email, phone).</li>
            <li><strong>One participant per row</strong> — each row after the header is one participant.</li>
            <li>Use a <strong>comma</strong> to separate values. Do not use commas inside a single value (e.g. avoid <code className="bg-gray-200 px-1 rounded">John, Jr.</code> in one cell unless your app supports it).</li>
            <li>Save the file as <strong>.csv</strong> (e.g. from Excel: “Save as” → “CSV (Comma delimited)”).</li>
          </ul>
          <p className="text-gray-500">Example:</p>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
{`name,email,phone
Alice,alice@example.com,08123456789
Bob,bob@example.com,08987654321`}
          </pre>
        </div>
      </Modal>

      <Modal open={deleteConfirmOpen} onClose={() => !deleting && setDeleteConfirmOpen(false)} title="Delete all participants?">
        <div className="text-sm text-gray-600 space-y-4">
          <p>This will delete all participants and column settings for this event. You will be able to re-upload a new CSV afterward.</p>
          <p className="font-medium">This cannot be undone.</p>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAllParticipants}
              disabled={deleting}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting…' : 'Delete all'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default UploadParticipantPage
