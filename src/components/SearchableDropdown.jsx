import React, { useState, useRef, useEffect } from 'react'

const SearchableDropdown = ({
  options = [],
  valueKey = '_id',
  labelKey = 'name',
  value = '',
  selectedValues = [],
  onChange,
  multiple = false,
  placeholder = 'Select...',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

  const getLabel = (item) => (item && item[labelKey] != null ? String(item[labelKey]) : '')
  const getValue = (item) => (item && item[valueKey] != null ? item[valueKey] : '')

  const filteredOptions = options.filter((item) =>
    getLabel(item).toLowerCase().includes(search.trim().toLowerCase())
  )

  const selectedOption = options.find((o) => getValue(o) === value)
  const selectedOptions = options.filter((o) => selectedValues.includes(getValue(o)))

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleSelect = (item) => {
    const id = getValue(item)
    if (multiple) {
      const next = selectedValues.includes(id)
        ? selectedValues.filter((v) => v !== id)
        : [...selectedValues, id]
      onChange(next)
    } else {
      onChange(id)
      setOpen(false)
      setSearch('')
    }
  }

  const handleTriggerClick = () => {
    if (!disabled) {
      setOpen((prev) => !prev)
      if (!open) setSearch('')
    }
  }

  const displayText = multiple
    ? selectedOptions.length > 0
      ? `${selectedOptions.length} selected`
      : placeholder
    : selectedOption
      ? getLabel(selectedOption)
      : placeholder

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={handleTriggerClick}
        disabled={disabled}
        className="w-full flex items-center justify-between gap-2 border border-gray-300 rounded px-3 py-2 text-left text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selectedOption || (multiple && selectedOptions.length > 0) ? 'text-gray-900' : 'text-gray-500'}>
          {displayText}
        </span>
        <span className="text-gray-400 shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full rounded border border-gray-200 bg-white shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
            ) : (
              filteredOptions.map((item) => {
                const id = getValue(item)
                const label = getLabel(item)
                const isSelected = multiple ? selectedValues.includes(id) : value === id
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 ${
                        isSelected ? 'bg-blue-50 text-blue-800' : 'text-gray-800'
                      }`}
                    >
                      {multiple && (
                        <span className="shrink-0 w-4 h-4 rounded border flex items-center justify-center">
                          {isSelected ? '✓' : ''}
                        </span>
                      )}
                      {label}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SearchableDropdown
