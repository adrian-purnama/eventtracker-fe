/**
 * Format time as the user types: digits become HH:mm (e.g. 1235 → 12:35).
 * Use in input onChange: setValue(formatTimeInput(e.target.value))
 *
 * @param {string} value - Current input value (may already contain ":")
 * @returns {string} Formatted like "15:25" or partial "15:2" or "15"
 */
export function formatTimeInput(value) {
  const digits = (value ?? '').replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return digits.slice(0, 2) + ':' + digits.slice(2)
}

/**
 * Format a number of minutes for display: "x minute" or "x minutes".
 *
 * @param {number} minutes
 * @returns {string} e.g. "30 minutes", "1 minute"
 */
export function formatMinutesDisplay(minutes) {
  const n = Math.max(0, Math.floor(Number(minutes)))
  return n === 1 ? '1 minute' : `${n} minutes`
}

/**
 * Parse "HH:mm" to total minutes from midnight. Returns NaN if invalid.
 *
 * @param {string} value
 * @returns {number}
 */
function parseTimeToMinutes(value) {
  const m = (value ?? '').trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return NaN
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
}

/**
 * Calculate duration in minutes from timeStart and timeEnd (HH:mm). Display-only.
 *
 * @param {string} timeStart
 * @param {string} timeEnd
 * @returns {number | null} minutes or null if invalid
 */
export function durationMinutesFromTimes(timeStart, timeEnd) {
  const start = parseTimeToMinutes(timeStart)
  const end = parseTimeToMinutes(timeEnd)
  if (Number.isNaN(start) || Number.isNaN(end)) return null
  const d = end - start
  return d < 0 ? null : d
}

/**
 * Format a number as Indonesian Rupiah for display: "Rp 1.000.000,00".
 * Backend sends/receives raw number (e.g. 1000000).
 *
 * @param {number} num
 * @returns {string} e.g. "Rp 1.000.000,00"
 */
export function formatCurrencyDisplay(num) {
  if (num === '' || num === null || num === undefined) return ''
  const n = Number(num)
  if (Number.isNaN(n) || n < 0) return 'Rp 0,00'
  const intPart = Math.floor(n)
  const decPart = Math.round((n - intPart) * 100)
  const intStr = intPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `Rp ${intStr},${String(decPart).padStart(2, '0')}`
}

/**
 * Parse "Rp 1.000.000,00" (or "1.000.000,00") to number for sending to backend.
 *
 * @param {string} value
 * @returns {number}
 */
export function parseCurrencyInput(value) {
  const s = (value ?? '').toString().trim().replace(/^Rp\s*/i, '').trim()
  if (!s) return 0
  const parts = s.split(',')
  const intStr = (parts[0] ?? '').replace(/\./g, '')
  const decStr = (parts[1] ?? '').slice(0, 2)
  const num = parseInt(intStr, 10) || 0
  const dec = parseInt(decStr, 10) || 0
  return num + dec / Math.pow(10, decStr.length || 2)
}

/**
 * YYYY-MM-DD for a date (no timezone shift).
 *
 * @param {Date} date
 * @returns {string}
 */
export function getDateKey(date) {
  if (!date || !(date instanceof Date)) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Monday–Friday only; Saturday/Sunday not workdays. Holidays not considered.
 *
 * @param {Date} date
 * @returns {boolean}
 */
export function isWorkday(date) {
  if (!date || !(date instanceof Date)) return false
  const day = date.getDay()
  return day >= 1 && day <= 5
}

/**
 * Date that is n workdays before fromDate (Mon–Fri only).
 *
 * @param {Date} fromDate
 * @param {number} n
 * @returns {Date}
 */
export function addWorkdaysBack(fromDate, n) {
  if (!fromDate || !(fromDate instanceof Date) || n < 1) return new Date(fromDate)
  const d = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
  let count = 0
  while (count < n) {
    d.setDate(d.getDate() - 1)
    if (isWorkday(d)) count += 1
  }
  return d
}

/**
 * Date that is n workdays after fromDate (Mon–Fri only).
 *
 * @param {Date} fromDate
 * @param {number} n
 * @returns {Date}
 */
export function addWorkdaysForward(fromDate, n) {
  if (!fromDate || !(fromDate instanceof Date) || n < 1) return new Date(fromDate)
  const d = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
  let count = 0
  while (count < n) {
    d.setDate(d.getDate() + 1)
    if (isWorkday(d)) count += 1
  }
  return d
}

/**
 * The Monday on or before the given date (same day if it is Monday).
 * Sunday (0) → previous Monday; Monday (1) → same; Tue–Sat → that week's Monday.
 *
 * @param {Date} date
 * @returns {Date}
 */
export function getPreviousMonday(date) {
  if (!date || !(date instanceof Date)) return new Date()
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay()
  // 0 = Sun -> go back 6; 1 = Mon -> 0; 2 = Tue -> 1; ... 6 = Sat -> 5
  const back = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - back)
  return d
}

/**
 * The next Monday on or after the given date (same day if it is Monday).
 *
 * @param {Date} date
 * @returns {Date}
 */
export function getNextMonday(date) {
  if (!date || !(date instanceof Date)) return new Date()
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay()
  if (day === 0) d.setDate(d.getDate() + 1)
  else if (day !== 1) d.setDate(d.getDate() + (8 - day))
  return d
}
