import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  FileDown,
  FolderPlus,
  Plus,
  Save,
  Trash2,
  UserCheck,
  Users,
  Check,
} from 'lucide-react'
import apiHelper from '../../helper/apiHelper'
import SearchableDropdown from '../../components/SearchableDropdown'
import { formatTimeInput, formatMinutesDisplay, durationMinutesFromTimes, formatCurrencyDisplay, parseCurrencyInput, getDateKey, addWorkdaysBack, addWorkdaysForward, getPreviousMonday } from '../../helper/formatHelper'

const rundownDescriptionModules = {
  toolbar: [
    ['bold'],
    [{ list: 'ordered' }, { list: 'bullet' }],
  ],
}

const EventPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activityTypes, setActivityTypes] = useState([])
  const [users, setUsers] = useState([])

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [activityTypeId, setActivityTypeId] = useState('')
  const [activityItems, setActivityItems] = useState([''])
  const [purposeItems, setPurposeItems] = useState([''])
  const [activityDate, setActivityDate] = useState('')
  const [activityTime, setActivityTime] = useState({ startTime: '', endTime: '', untilFinish: true })
  const [activityLocation, setActivityLocation] = useState('')
  const [targetAudience, setTargetAudience] = useState(0)
  const [committeeIds, setCommitteeIds] = useState([])
  const [collaboratorIds, setCollaboratorIds] = useState([])
  const [eventApproverId, setEventApproverId] = useState('')
  const [eventManagerId, setEventManagerId] = useState('')
  const [eventCreatorObj, setEventCreatorObj] = useState(null)
  const [eventCollaboratorsObjs, setEventCollaboratorsObjs] = useState([])
  const [runDown, setRunDown] = useState([])
  const [budget, setBudget] = useState([])
  const [focusedBudgetPriceIndex, setFocusedBudgetPriceIndex] = useState(null)
  const [draggedBudgetIndex, setDraggedBudgetIndex] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const SECTION_STORAGE_KEY = 'floorcoordinator-event-sections'
  const loadSectionOpen = () => {
    try {
      const raw = localStorage.getItem(SECTION_STORAGE_KEY)
      if (!raw) return { eventInfo: true, rundown: true, budget: true }
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        return {
          eventInfo: parsed.eventInfo !== false,
          rundown: parsed.rundown !== false,
          budget: parsed.budget !== false,
        }
      }
    } catch (_) {}
    return { eventInfo: true, rundown: true, budget: true }
  }
  const [sectionOpen, setSectionOpen] = useState(loadSectionOpen)
  useEffect(() => {
    try {
      localStorage.setItem(SECTION_STORAGE_KEY, JSON.stringify(sectionOpen))
    } catch (_) {}
  }, [sectionOpen])

  useEffect(() => {
    const fetchOptions = async () => {
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
      }
    }
    fetchOptions()
  }, [])

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return
      setLoading(true)
      try {
        const { data } = await apiHelper.get(`/api/events/get-event/${id}`)
        const e = data?.data
        if (!e) return
        setName(e.name ?? '')
        setDescription(e.description ?? '')
        setActivityTypeId(e.activityType?._id ?? e.activityType ?? '')
        const actArr = Array.isArray(e.activity) && e.activity.length > 0 ? e.activity : ['']
        setActivityItems(actArr)
        const purArr = Array.isArray(e.purpose) && e.purpose.length > 0 ? e.purpose : ['']
        setPurposeItems(purArr)
        setActivityDate(e.activityDate ? new Date(e.activityDate).toISOString().slice(0, 10) : '')
        const at = e.activityTime
        if (at && typeof at === 'object') {
          setActivityTime({
            startTime: at.startTime ?? '',
            endTime: at.endTime ?? '',
            untilFinish: Boolean(at.untilFinish),
          })
        } else {
          setActivityTime({ startTime: typeof at === 'string' ? at : '', endTime: '', untilFinish: true })
        }
        setActivityLocation(e.activityLocation ?? '')
        setTargetAudience(Number(e.targetAudience) ?? 0)
        setCommitteeIds(
          (e.committee ?? []).map((c) => (typeof c === 'object' ? c._id : c)).filter(Boolean)
        )
        setCollaboratorIds(
          (e.collaborators ?? []).map((c) => (typeof c === 'object' ? c._id : c)).filter(Boolean)
        )
        setEventApproverId(e.eventApprover?._id ?? e.eventApprover ?? '')
        setEventManagerId(e.eventManager?._id ?? e.eventManager ?? '')
        setEventCreatorObj(e.eventCreator ?? null)
        setEventCollaboratorsObjs(Array.isArray(e.collaborators) ? e.collaborators : [])
        setRunDown(Array.isArray(e.runDown) && e.runDown.length > 0 ? e.runDown : [{ timeStart: '', timeEnd: '', durationMinutes: 0, name: '', description: '' }])
        setBudget(Array.isArray(e.budget) && e.budget.length > 0
          ? e.budget.map((b) => ({ ...b, category: (b.category != null && String(b.category).trim() !== '') ? String(b.category).trim() : 'other' }))
          : [])
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to load event'
        toast.error(msg)
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id, navigate])

  const addActivityRow = () => setActivityItems((prev) => [...prev, ''])
  const removeActivityRow = (index) => setActivityItems((prev) => prev.filter((_, i) => i !== index))
  const handleActivityChange = (index, value) => {
    setActivityItems((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }
  const addPurposeRow = () => setPurposeItems((prev) => [...prev, ''])
  const removePurposeRow = (index) => setPurposeItems((prev) => prev.filter((_, i) => i !== index))
  const handlePurposeChange = (index, value) => {
    setPurposeItems((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }
  const handleRunDownChange = (index, field, value) => {
    const next = [...runDown]
    next[index] = { ...next[index], [field]: field === 'durationMinutes' ? Number(value) || 0 : value }
    setRunDown(next)
  }
  const addRunDownRow = () => setRunDown([...runDown, { timeStart: '', timeEnd: '', durationMinutes: 0, name: '', description: '' }])
  const removeRunDownRow = (index) => setRunDown(runDown.filter((_, i) => i !== index))

  const handleBudgetChange = (index, field, value) => {
    const next = [...budget]
    next[index] = { ...next[index], [field]: field === 'qty' || field === 'pricePerQty' ? Number(value) || 0 : value }
    setBudget(next)
  }

  const getCategoriesFromBudget = () => {
    const seen = new Set()
    return budget.filter((b) => {
      const cat = (b.category != null && String(b.category).trim() !== '') ? String(b.category).trim() : 'other'
      if (seen.has(cat)) return false
      seen.add(cat)
      return true
    }).map((b) => (b.category != null && String(b.category).trim() !== '') ? String(b.category).trim() : 'other')
  }

  const addCategory = () => {
    const name = (newCategoryName || '').trim() || 'New category'
    setBudget((prev) => [...prev, { item: '', type: 'outcome', qty: 1, pricePerQty: 0, description: '', category: name }])
    setNewCategoryName('')
    setShowNewCategoryInput(false)
  }

  const addBudgetRowInCategory = (category) => {
    setBudget((prev) => [...prev, { item: '', type: 'outcome', qty: 1, pricePerQty: 0, description: '', category }])
  }

  const updateCategoryName = (oldName, newName) => {
    const n = (newName || '').trim()
    if (!n || n === oldName) return
    setBudget((prev) => prev.map((b) => (b.category === oldName ? { ...b, category: n } : b)))
  }

  const removeCategory = (category) => {
    if (!window.confirm(`Remove category "${category}" and all its items?`)) return
    setBudget((prev) => prev.filter((b) => b.category !== category))
  }

  const removeBudgetRow = (index) => setBudget(budget.filter((_, i) => i !== index))

  const moveBudgetItemToCategory = (globalIndex, targetCategory) => {
    if (globalIndex < 0 || globalIndex >= budget.length) return
    setBudget((prev) => {
      const next = [...prev]
      next[globalIndex] = { ...next[globalIndex], category: targetCategory }
      return next
    })
    setDraggedBudgetIndex(null)
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !activityTypeId) {
      toast.error('Name and activity type are required')
      return
    }
    setSubmitting(true)
    try {
      await apiHelper.put(`/api/events/update-event/${id}`, {
        name: name.trim(),
        description: description.trim(),
        activityType: activityTypeId,
        activity: activityItems.map((s) => s.trim()).filter(Boolean),
        purpose: purposeItems.map((s) => s.trim()).filter(Boolean),
        activityDate: activityDate || undefined,
        activityTime: activityTime.startTime?.trim()
          ? {
              startTime: activityTime.startTime.trim(),
              endTime: activityTime.untilFinish ? undefined : (activityTime.endTime?.trim() || undefined),
              untilFinish: activityTime.untilFinish,
            }
          : undefined,
        activityLocation: activityLocation.trim() || undefined,
        targetAudience: Number(targetAudience) || 0,
        committee: committeeIds,
        collaborators: collaboratorIds,
        eventApprover: eventApproverId || undefined,
        eventManager: eventManagerId || undefined,
        runDown: runDown.filter((r) => r.timeStart || r.timeEnd || r.name).map((r) => ({
          timeStart: r.timeStart || '00:00',
          timeEnd: r.timeEnd || '00:00',
          durationMinutes: Number(r.durationMinutes) || 0,
          name: r.name || '',
          description: r.description || '',
        })),
        budget: budget.filter((b) => b.item || b.description || b.pricePerQty).map((b) => ({
          item: (b.item ?? '').trim() || '—',
          type: b.type || 'income',
          qty: Number(b.qty) || 1,
          pricePerQty: Number(b.pricePerQty) || 0,
          description: b.description || '',
          category: (b.category != null && String(b.category).trim() !== '') ? String(b.category).trim() : 'other',
        })),
      })
      toast.success('Event updated')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update event'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadProposal = async () => {
    if (!id) return
    setSubmitting(true)
    try {
      const response = await apiHelper.get(`/api/events/download-proposal/${id}`, {
        responseType: 'blob',
      })
      const contentType = response.headers['content-type'] || ''
      if (response.status !== 200 || contentType.includes('application/json')) {
        const text = await response.data.text()
        let msg = 'Failed to download proposal'
        try {
          const json = JSON.parse(text)
          if (json.message) msg = json.message
        } catch (_) {}
        toast.error(msg)
        return
      }
      const blob = response.data
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(name || 'proposal').replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 80)}_pengajuan.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Proposal downloaded')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to download proposal'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-16 mx-20">
        <p className="text-gray-500">Loading event...</p>
      </div>
    )
  }

  const hasEventDate = !!activityDate?.trim()
  const hasFullBudget =
    budget.length > 0 &&
    budget.some((b) => (b.item && b.item.trim()) || (b.pricePerQty != null && Number(b.pricePerQty) > 0))
  const hasAudience = targetAudience != null && Number(targetAudience) > 0
  const hasActivity = activityItems.some((s) => (s ?? '').trim().length > 0)
  const hasPurpose = purposeItems.some((s) => (s ?? '').trim().length > 0)
  const hasRundown =
    runDown.length > 0 &&
    runDown.some((r) => (r.timeStart && r.timeEnd) || (r.name && r.name.trim()))
  const todos = [
    { label: 'Determine event date', done: hasEventDate },
    { label: 'Enter budgeting', done: hasFullBudget },
    { label: 'Determine amount of audience', done: hasAudience },
    { label: 'Fill activity', done: hasActivity },
    { label: 'Fill purpose', done: hasPurpose },
    { label: 'Make rundown', done: hasRundown },
  ]
  const eventDateObj = activityDate ? new Date(activityDate + 'T12:00:00') : null
  const calendarYear = eventDateObj ? eventDateObj.getFullYear() : new Date().getFullYear()
  const calendarMonth = eventDateObj ? eventDateObj.getMonth() : new Date().getMonth()
  const eventDay = eventDateObj ? eventDateObj.getDate() : null

  // Proposal timeline: approver (3) → manager (2) → budget (6, starts Monday only) → event → review+recap (3 after) (Mon–Fri only)
  const APPROVER_WORKDAYS = 3
  const MANAGER_WORKDAYS = 2
  const BUDGET_WORKDAYS = 6
  const REVIEW_RECAP_WORKDAYS = 3
  // Budget runs 6 workdays and must START on a Monday. So budget_end = last day of budget (6th workday = a Monday).
  // budget_end = the Monday on or before (event - 1 workday); budget_start = 5 workdays before budget_end (the Monday that starts the block).
  const budgetEnd = eventDateObj ? getPreviousMonday(addWorkdaysBack(eventDateObj, 1)) : null
  const budgetStart = budgetEnd ? addWorkdaysBack(budgetEnd, 5) : null
  const submitByDate = budgetStart ? addWorkdaysBack(budgetStart, 6) : null
  const eventDateKey = eventDateObj ? getDateKey(eventDateObj) : null
  const budgetDateKeys = budgetStart
    ? [0, 1, 2, 3, 4, 5].map((n) => getDateKey(addWorkdaysForward(budgetStart, n)))
    : []
  const managerDateKeys = budgetStart
    ? [2, 1].map((n) => getDateKey(addWorkdaysBack(budgetStart, n)))
    : []
  const approverDateKeys = budgetStart
    ? [5, 4, 3].map((n) => getDateKey(addWorkdaysBack(budgetStart, n)))
    : []
  const reviewRecapDateKeys = eventDateObj
    ? [1, 2, 3].map((n) => getDateKey(addWorkdaysForward(eventDateObj, n)))
    : []

  const getDayType = (year, month, dayNum) => {
    if (dayNum === null) return null
    const d = new Date(year, month, dayNum)
    const key = getDateKey(d)
    if (key === eventDateKey) return 'event'
    if (budgetDateKeys.includes(key)) return 'budget'
    if (managerDateKeys.includes(key)) return 'manager'
    if (approverDateKeys.includes(key)) return 'approver'
    if (reviewRecapDateKeys.includes(key)) return 'review'
    return null
  }

  const calendarMonths = (() => {
    if (!eventDateObj || !submitByDate) {
      return [{ year: calendarYear, month: calendarMonth }]
    }
    const start = new Date(submitByDate.getFullYear(), submitByDate.getMonth(), 1)
    const end = new Date(eventDateObj.getFullYear(), eventDateObj.getMonth() + 2, 0)
    const list = []
    const cur = new Date(start.getFullYear(), start.getMonth(), 1)
    while (cur <= end) {
      list.push({ year: cur.getFullYear(), month: cur.getMonth() })
      cur.setMonth(cur.getMonth() + 1)
    }
    return list
  })()

  const buildCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: firstDay }, () => null).concat(
      Array.from({ length: daysInMonth }, (_, i) => i + 1)
    )
  }

  return (
    <div className="mt-16 mx-4 lg:mx-8 xl:mx-12">
        <div className="flex flex-wrap gap-2 mb-4">
            <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                Back to dashboard
            </button>
            <button
                type="button"
                onClick={() => navigate(`/event/guest-list/${id}`)}
                className="inline-flex items-center gap-2 text-sm text-white bg-amber-400 hover:bg-amber-700 rounded-md px-4 py-2 font-bold"
            >
                <Users className="w-4 h-4 shrink-0" />
                Enter Guest List
            </button>
            <button
                type="button"
                onClick={() => navigate(`/event/guest-precent/${id}`)}
                className="inline-flex items-center gap-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md px-4 py-2 font-bold"
            >
                <UserCheck className="w-4 h-4 shrink-0" />
                Coming Guest
            </button>
            <button
                type="button"
                onClick={handleDownloadProposal}
                disabled={submitting}
                className="inline-flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md px-4 py-2 font-bold disabled:opacity-50"
            >
                <FileDown className="w-4 h-4 shrink-0" />
                Download proposal (Word)
            </button>
        </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Edit event</h1>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 xl:gap-10 xl:max-h-[calc(100vh-8rem)] xl:min-h-0">
        {/* Left: Form – own scroll */}
        <div className="min-w-0 xl:min-h-0 xl:overflow-y-auto xl:pr-2">
          <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section: Event information */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setSectionOpen((prev) => ({ ...prev, eventInfo: !prev.eventInfo }))}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left font-medium text-gray-800 border-b border-gray-200"
          >
            <span>Event information</span>
            {sectionOpen.eventInfo ? <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />}
          </button>
          {sectionOpen.eventInfo && (
            <div className="p-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Activity type *</label>
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
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Activity</label>
            <button type="button" onClick={addActivityRow} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
              <Plus className="w-3.5 h-3.5 shrink-0" />
              Add activity
            </button>
          </div>
          <div className="space-y-2">
            {activityItems.map((value, index) => (
              <div key={index} className="flex gap-2 items-start">
                <textarea
                  value={value}
                  onChange={(e) => handleActivityChange(index, e.target.value)}
                  placeholder={`Activity ${index + 1}`}
                  rows={2}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 resize-y min-h-[60px]"
                />
                {activityItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeActivityRow(index)}
                    className="inline-flex items-center gap-1.5 text-red-600 text-sm shrink-0 py-2"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Purpose</label>
            <button type="button" onClick={addPurposeRow} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
              <Plus className="w-3.5 h-3.5 shrink-0" />
              Add purpose
            </button>
          </div>
          <div className="space-y-2">
            {purposeItems.map((value, index) => (
              <div key={index} className="flex gap-2 items-start">
                <textarea
                  value={value}
                  onChange={(e) => handlePurposeChange(index, e.target.value)}
                  placeholder={`Purpose ${index + 1}`}
                  rows={2}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 resize-y min-h-[60px]"
                />
                {purposeItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePurposeRow(index)}
                    className="inline-flex items-center gap-1.5 text-red-600 text-sm shrink-0 py-2"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity date</label>
            <input
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity time</label>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Start time</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={activityTime.startTime}
                  onChange={(e) => setActivityTime((prev) => ({ ...prev, startTime: formatTimeInput(e.target.value) }))}
                  placeholder="e.g. 09:00"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="endTimeType"
                    checked={activityTime.untilFinish}
                    onChange={() => setActivityTime((prev) => ({ ...prev, untilFinish: true, endTime: '' }))}
                    className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Until finish</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="endTimeType"
                    checked={!activityTime.untilFinish}
                    onChange={() => setActivityTime((prev) => ({ ...prev, untilFinish: false }))}
                    className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Set end time</span>
                </label>
                {!activityTime.untilFinish && (
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={activityTime.endTime}
                    onChange={(e) => setActivityTime((prev) => ({ ...prev, endTime: formatTimeInput(e.target.value) }))}
                    placeholder="End e.g. 17:00"
                    className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 w-32 font-mono"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Activity location</label>
          <input
            type="text"
            value={activityLocation}
            onChange={(e) => setActivityLocation(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target audience (number)</label>
          <input
            type="number"
            min={0}
            value={targetAudience}
            onChange={(e) => setTargetAudience(Number(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Committee</label>
          <SearchableDropdown
            options={users}
            valueKey="_id"
            labelKey="email"
            selectedValues={committeeIds}
            onChange={setCommitteeIds}
            multiple
            placeholder="Select committee"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event approver</label>
          <SearchableDropdown
            options={users.filter((u) => u.approver === true)}
            valueKey="_id"
            labelKey="email"
            value={eventApproverId}
            onChange={setEventApproverId}
            placeholder="Select approver (users with approver role)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event manager</label>
          <SearchableDropdown
            options={(() => {
              const base = [eventCreatorObj, ...eventCollaboratorsObjs].filter(Boolean)
              const baseIds = new Set(base.map((b) => b._id))
              const extra = users.filter((u) => collaboratorIds.includes(u._id) && !baseIds.has(u._id))
              return [...base, ...extra]
            })()}
            valueKey="_id"
            labelKey="email"
            value={eventManagerId}
            onChange={setEventManagerId}
            placeholder="Select manager (creator or collaborator)"
          />
        </div>
            </div>
          )}
        </div>

        {/* Section: Event rundown */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setSectionOpen((prev) => ({ ...prev, rundown: !prev.rundown }))}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left font-medium text-gray-800 border-b border-gray-200"
          >
            <span>Event rundown</span>
            {sectionOpen.rundown ? <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />}
          </button>
          {sectionOpen.rundown && (
            <div className="p-4">
        <div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Run-down</label>
          </div>
          <div className="overflow-x-auto rounded border border-gray-300">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="text-left font-medium text-gray-700 px-2 py-2 w-24">Time start</th>
                  <th className="text-left font-medium text-gray-700 px-2 py-2 w-24">Time end</th>
                  <th className="text-left font-medium text-gray-700 px-2 py-2 w-28">Duration</th>
                  <th className="text-left font-medium text-gray-700 px-2 py-2 min-w-[120px]">Kegiatan</th>
                  <th className="text-left font-medium text-gray-700 px-2 py-2 min-w-[200px]">Description</th>
                  <th className="text-left font-medium text-gray-700 px-2 py-2 w-20">Action</th>
                </tr>
              </thead>
              <tbody>
                {runDown.map((row, index) => (
                  <tr key={index} className="border-b border-gray-200 align-top">
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={5}
                        placeholder="09:00"
                        value={row.timeStart}
                        onChange={(e) => handleRunDownChange(index, 'timeStart', formatTimeInput(e.target.value))}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={5}
                        placeholder="09:30"
                        value={row.timeEnd}
                        onChange={(e) => handleRunDownChange(index, 'timeEnd', formatTimeInput(e.target.value))}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono"
                      />
                    </td>
                    <td className="px-2 py-2 text-gray-600">
                      {(() => {
                        const calculated = durationMinutesFromTimes(row.timeStart, row.timeEnd)
                        return calculated !== null ? formatMinutesDisplay(calculated) : '—'
                      })()}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        placeholder="Kegiatan"
                        value={row.name}
                        onChange={(e) => handleRunDownChange(index, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="px-2 py-2 min-w-[200px]">
                      <div className="rounded border border-gray-300 overflow-hidden [&_.ql-editor]:min-h-[72px] [&_.ql-toolbar]:rounded-t [&_.ql-container]:rounded-b [&_.ql-container]:border-0">
                        <ReactQuill
                          theme="snow"
                          value={row.description ?? ''}
                          onChange={(value) => handleRunDownChange(index, 'description', value)}
                          modules={rundownDescriptionModules}
                          placeholder="Description (bold, numbering)"
                          className="rundown-quill text-sm"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => removeRunDownRow(index)}
                        className="inline-flex items-center gap-1.5 text-red-600 text-sm hover:underline font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex justify-end">
            <button type="button" onClick={addRunDownRow} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
              <Plus className="w-3.5 h-3.5 shrink-0" />
              Add row
            </button>
          </div>
        </div>
            </div>
          )}
        </div>

        {/* Section: Event budget */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setSectionOpen((prev) => ({ ...prev, budget: !prev.budget }))}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left font-medium text-gray-800 border-b border-gray-200"
          >
            <span>Event budget</span>
            {sectionOpen.budget ? <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />}
          </button>
          {sectionOpen.budget && (
            <div className="p-4">
        <div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Budget</label>
          </div>
          {getCategoriesFromBudget().map((category) => {
            const norm = (b) => (b.category != null && String(b.category).trim() !== '') ? String(b.category).trim() : 'other'
            const itemsWithIndex = budget.map((b, i) => ({ b, globalIndex: i })).filter(({ b }) => norm(b) === category)
            const categoryTotal = itemsWithIndex.reduce((sum, { b }) => sum + (Number(b.qty) || 0) * (Number(b.pricePerQty) || 0), 0)
            return (
              <div
                key={category}
                className="mb-6 rounded border border-gray-200 overflow-hidden"
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-blue-300'); }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('ring-2', 'ring-blue-300'); }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove('ring-2', 'ring-blue-300')
                  const idx = e.dataTransfer.getData('application/budget-index')
                  if (idx !== '') moveBudgetItemToCategory(parseInt(idx, 10), category)
                }}
              >
                <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-100 border-b border-gray-200">
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => updateCategoryName(category, e.target.value)}
                    className="text-sm font-medium text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 min-w-[120px]"
                    placeholder="Category name"
                  />
                  <button type="button" onClick={() => removeCategory(category)} className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline">
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    Remove category
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-left text-gray-600 font-medium">
                      <th className="w-8 py-2 px-2" />
                      <th className="py-2 px-2 min-w-[120px]">Item name</th>
                      <th className="py-2 px-2 w-24">Type</th>
                      <th className="py-2 px-2 w-16">Qty</th>
                      <th className="py-2 px-2 w-28">Price per qty</th>
                      <th className="py-2 px-2 min-w-[100px]">Description</th>
                      <th className="py-2 px-2 w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsWithIndex.map(({ b: row, globalIndex }) => (
                      <tr
                        key={globalIndex}
                        draggable
                        className={`border-b border-gray-100 hover:bg-gray-50 ${draggedBudgetIndex === globalIndex ? 'opacity-50' : ''}`}
                        onDragStart={(e) => {
                          setDraggedBudgetIndex(globalIndex)
                          e.dataTransfer.setData('application/budget-index', String(globalIndex))
                          e.dataTransfer.effectAllowed = 'move'
                        }}
                        onDragEnd={() => setDraggedBudgetIndex(null)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const idx = e.dataTransfer.getData('application/budget-index')
                          if (idx !== '') moveBudgetItemToCategory(parseInt(idx, 10), category)
                        }}
                      >
                        <td className="py-2 px-2 text-gray-400 cursor-grab active:cursor-grabbing" title="Drag to another category">⋮⋮</td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            placeholder="Item name"
                            value={row.item ?? ''}
                            onChange={(e) => handleBudgetChange(globalIndex, 'item', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full min-w-0"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={row.type}
                            onChange={(e) => handleBudgetChange(globalIndex, 'type', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                          >
                            <option value="income">Income</option>
                            <option value="outcome">Outcome</option>
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={1}
                            placeholder="Qty"
                            value={row.qty ?? ''}
                            onChange={(e) => handleBudgetChange(globalIndex, 'qty', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            placeholder="Rp 1.000.000,00"
                            value={
                              focusedBudgetPriceIndex === globalIndex
                                ? (row.pricePerQty === 0 ? '' : String(row.pricePerQty))
                                : formatCurrencyDisplay(row.pricePerQty)
                            }
                            onFocus={() => setFocusedBudgetPriceIndex(globalIndex)}
                            onBlur={() => setFocusedBudgetPriceIndex(null)}
                            onChange={(e) => handleBudgetChange(globalIndex, 'pricePerQty', parseCurrencyInput(e.target.value))}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full font-mono"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            placeholder="Description"
                            value={row.description ?? ''}
                            onChange={(e) => handleBudgetChange(globalIndex, 'description', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full min-w-0"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <button type="button" onClick={() => removeBudgetRow(globalIndex)} className="inline-flex items-center gap-1.5 text-red-600 text-sm hover:underline">
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 flex justify-between items-center px-3 py-2 bg-gray-50 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-700">
                    Total: {formatCurrencyDisplay(categoryTotal)}
                  </span>
                  <button type="button" onClick={() => addBudgetRowInCategory(category)} className="text-sm text-blue-600 hover:underline">
                    + Add row
                  </button>
                </div>
              </div>
            )
          })}
          {showNewCategoryInput ? (
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                placeholder="Category name (e.g. Income, Food, Decoration)"
                className="border border-gray-300 rounded px-2 py-1.5 text-sm flex-1 min-w-0"
                autoFocus
              />
              <button type="button" onClick={addCategory} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
                <FolderPlus className="w-3.5 h-3.5 shrink-0" />
                Add category
              </button>
              <button type="button" onClick={() => { setShowNewCategoryInput(false); setNewCategoryName(''); }} className="text-gray-600 text-sm hover:underline">
                Cancel
              </button>
            </div>
          ) : (
            <div className="mt-2">
              <button type="button" onClick={() => setShowNewCategoryInput(true)} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                <Plus className="w-3.5 h-3.5 shrink-0" />
                Add category
              </button>
            </div>
          )}
        </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4 shrink-0" />
            {submitting ? 'Saving...' : 'Save event'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
        </div>

        {/* Right: Info sidebar – own scroll */}
        <aside className="space-y-6 xl:min-h-0 xl:overflow-y-auto xl:pl-2">
          {/* To do */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-800 mb-2">To do</p>
            <ul className="space-y-1.5 text-sm text-amber-900">
              {todos.map((item) => (
                <li
                  key={item.label}
                  className={`flex items-center gap-2 ${item.done ? 'text-gray-500 line-through' : ''}`}
                >
                  <span
                    className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center ${
                      item.done ? 'bg-green-100 border-green-400 text-green-700' : 'border-amber-300'
                    }`}
                  >
                    {item.done ? <Check className="w-3 h-3" strokeWidth={3} /> : null}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>


          {/* Calendar – scrollable months (submit-by through event + 1 month) */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            {submitByDate && (
              <p className="text-xs font-medium text-gray-700 mb-2">
                Submit proposal by: {getDateKey(submitByDate)}
              </p>
            )}
            <div className="max-h-[280px] overflow-y-auto overflow-x-hidden pr-1 space-y-4">
              {calendarMonths.map(({ year, month }) => {
                const monthDays = buildCalendarDays(year, month)
                return (
                  <div key={`${year}-${month}`}>
                    <p className="text-sm font-medium text-gray-800 mb-1 sticky top-0 bg-gray-50 py-0.5 z-10">
                      {new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </p>
                    <div className="grid grid-cols-7 gap-0.5 text-center text-xs text-gray-500 mb-1">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 text-sm">
                      {monthDays.map((day, i) => {
                        const type = getDayType(year, month, day)
                        const bg =
                          type === 'event'
                            ? 'bg-blue-600 text-white font-medium'
                            : type === 'approver'
                              ? 'bg-amber-300 text-amber-900'
                              : type === 'manager'
                                ? 'bg-orange-300 text-orange-900'
                                : type === 'budget'
                                  ? 'bg-green-400 text-green-900'
                                  : type === 'review'
                                    ? 'bg-violet-400 text-violet-900'
                                    : 'text-gray-700 hover:bg-gray-200'
                        return (
                          <span
                            key={i}
                            className={`aspect-square flex items-center justify-center rounded ${day === null ? 'invisible' : bg}`}
                            title={
                              type === 'event'
                                ? 'Event date'
                                : type === 'approver'
                                  ? 'Approver (3 workdays)'
                                  : type === 'manager'
                                    ? 'Manager approval (2 workdays)'
                                    : type === 'budget'
                                      ? 'Budget processing (6 workdays, starts Monday)'
                                      : type === 'review'
                                        ? 'Event review + recap (3 workdays after)'
                                        : ''
                            }
                          >
                            {day ?? ''}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            {eventDay && activityDate && (
              <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                Event date: {activityDate}
              </p>
            )}
            {eventDateObj && (
              <div className="mt-2 pt-2 border-t border-gray-200 space-y-1 text-xs text-gray-600">
                <p className="font-medium text-gray-700">Legend (workdays Mon–Fri)</p>
                <p className="text-gray-500">Flow: Approver → Manager → Budget → Event → Review + recap</p>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-amber-300 shrink-0" />
                  <span>Approver (3 days)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-orange-300 shrink-0" />
                  <span>Manager approval (2 days)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-green-400 shrink-0" />
                  <span>Budget processing (6 days, starts Monday)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-blue-600 shrink-0" />
                  <span>Event date</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-violet-400 shrink-0" />
                  <span>Event review + recap (3 days after)</span>
                </div>
                <p className="font-medium text-gray-700">Note : This is just an estimation, the actual timeline may vary, and  this estimation does not consider holidays.</p>
              </div>
            )}
          </div>

                    {/* Budget summary – category nets and total */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-800 mb-2">Budget summary</p>
            {(() => {
              const norm = (b) => (b.category != null && String(b.category).trim() !== '') ? String(b.category).trim() : 'other'
              const categories = getCategoriesFromBudget()
              const categoryNets = categories.map((category) => {
                const items = budget.filter((b) => norm(b) === category)
                const incomeSum = items.filter((b) => b.type === 'income').reduce((s, b) => s + (Number(b.qty) || 0) * (Number(b.pricePerQty) || 0), 0)
                const outcomeSum = items.filter((b) => b.type === 'outcome').reduce((s, b) => s + (Number(b.qty) || 0) * (Number(b.pricePerQty) || 0), 0)
                return { category, net: incomeSum - outcomeSum }
              })
              const grandTotal = categoryNets.reduce((s, { net }) => s + net, 0)
              if (categoryNets.length === 0) {
                return <p className="text-sm text-gray-500">No budget categories yet.</p>
              }
              return (
                <ul className="space-y-1.5 text-sm">
                  {categoryNets.map(({ category, net }) => (
                    <li key={category} className="flex justify-between gap-2">
                      <span className="text-gray-700 truncate">{category}</span>
                      <span className={net >= 0 ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                        {net >= 0 ? '+' : '-'}{formatCurrencyDisplay(Math.abs(net))}
                      </span>
                    </li>
                  ))}
                  <li className="flex justify-between gap-2 pt-2 mt-2 border-t border-gray-200 font-medium text-gray-800">
                    <span>Total</span>
                    <span className={grandTotal >= 0 ? 'text-green-700' : 'text-red-700'}>
                      {grandTotal >= 0 ? '+' : '-'}{formatCurrencyDisplay(Math.abs(grandTotal))}
                    </span>
                  </li>
                </ul>
              )
            })()}
          </div>

          {/* Event summary */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-800 mb-2">Event summary</p>
            <dl className="space-y-1.5 text-sm text-gray-700">
              <div>
                <dt className="text-gray-500">Name</dt>
                <dd className="font-medium">{name || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Date</dt>
                <dd>{activityDate ? new Date(activityDate).toLocaleDateString() : '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Time</dt>
                <dd>
                  {activityTime.startTime
                    ? activityTime.untilFinish
                      ? `${activityTime.startTime} – until finish`
                      : `${activityTime.startTime} – ${activityTime.endTime || '—'}`
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Location</dt>
                <dd>{activityLocation?.trim() || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Audience</dt>
                <dd>{targetAudience > 0 ? targetAudience : '—'}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default EventPage
