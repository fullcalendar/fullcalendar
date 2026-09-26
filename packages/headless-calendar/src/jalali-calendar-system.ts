import { DateMarker, arrayToUtcDate, dateToUtcArray } from './marker'
import { registerCalendarSystem, CalendarSystem } from './calendar-system'

/**
 * Jalali (Persian) Calendar System for FullCalendar
 *
 * Implements the standard Jalali calendar conversion algorithms.
 * Based on the algorithm from: https://en.wikipedia.org/wiki/Jalali_calendar
 *
 * The Jalali calendar is a solar calendar used in Iran and Afghanistan.
 * It has 6 months of 31 days, 5 months of 30 days, and 1 month of 29 days
 * (30 days in leap years).
 *
 * Month names (0-indexed):
 * 0: Farvardin (31 days)
 * 1: Ordibehesht (31 days)
 * 2: Khordad (31 days)
 * 3: Tir (31 days)
 * 4: Mordad (31 days)
 * 5: Shahrivar (31 days)
 * 6: Mehr (30 days)
 * 7: Aban (30 days)
 * 8: Azar (30 days)
 * 9: Dey (30 days)
 * 10: Bahman (30 days)
 * 11: Esfand (29 days, 30 in leap years)
 */

// Days in each month for non-leap years
const JALALI_MONTH_DAYS = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
// Days in each month for leap years
const JALALI_MONTH_DAYS_LEAP = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30]

/**
 * Check if a Jalali year is a leap year
 */
function isJalaliLeapYear(jalaliYear: number): boolean {
  // The leap year cycle in Jalali calendar is 2820 years
  // But for practical purposes, we use a simpler algorithm
  // based on the remainder of the year divided by 33
  const remainder = jalaliYear % 33
  // Leap years in a 33-year cycle: 1, 5, 9, 13, 17, 22, 26, 30
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(remainder)
}

/**
 * Get the number of days in a Jalali month
 */
function jalaliMonthDays(jalaliYear: number, jalaliMonth: number): number {
  return isJalaliLeapYear(jalaliYear)
    ? JALALI_MONTH_DAYS_LEAP[jalaliMonth]
    : JALALI_MONTH_DAYS[jalaliMonth]
}

/**
 * Get the day of year for a Jalali date (0-indexed)
 */
function jalaliDayOfYear(jalaliYear: number, jalaliMonth: number, jalaliDay: number): number {
  let dayOfYear = jalaliDay - 1
  for (let m = 0; m < jalaliMonth; m++) {
    dayOfYear += jalaliMonthDays(jalaliYear, m)
  }
  return dayOfYear
}

/**
 * Convert Gregorian date to Jalali date
 * Returns [jalaliYear, jalaliMonth (0-11), jalaliDay (1-31)]
 */
function gregorianToJalali(gregYear: number, gregMonth: number, gregDay: number): [number, number, number] {
  // Algorithm based on: https://en.wikipedia.org/wiki/Jalali_calendar#Gregorian_date_conversion
  // Reference: 1 Farvardin 1403 = March 20, 2024

  const gregorianEpochDay = toGregorianEpochDay(gregYear, gregMonth + 1, gregDay)

  // Reference: 1 Farvardin 1403 = March 20, 2024
  const REFERENCE_GREG_DAY = toGregorianEpochDay(2024, 3, 20) // March 20, 2024
  const REFERENCE_JALALI_YEAR = 1403
  const REFERENCE_JALALI_MONTH = 0 // Farvardin
  const REFERENCE_JALALI_DAY = 1

  let daysDiff = gregorianEpochDay - REFERENCE_GREG_DAY

  // Start from reference
  let jalYear = REFERENCE_JALALI_YEAR
  let jalMonth = REFERENCE_JALALI_MONTH
  let jalDay = REFERENCE_JALALI_DAY + daysDiff

  // Adjust for negative days (going backwards in time)
  if (jalDay < 1) {
    // Go backwards
    while (jalDay < 1) {
      jalMonth--
      if (jalMonth < 0) {
        jalMonth = 11
        jalYear--
      }
      jalDay += jalaliMonthDays(jalYear, jalMonth)
    }
  } else {
    // Go forwards
    let daysInCurrentMonth = jalaliMonthDays(jalYear, jalMonth)
    while (jalDay > daysInCurrentMonth) {
      jalDay -= daysInCurrentMonth
      jalMonth++
      if (jalMonth > 11) {
        jalMonth = 0
        jalYear++
      }
      daysInCurrentMonth = jalaliMonthDays(jalYear, jalMonth)
    }
  }

  return [jalYear, jalMonth, jalDay]
}

/**
 * Convert Jalali date to Gregorian date
 * Returns [gregYear, gregMonth (0-11), gregDay (1-31)]
 */
function jalaliToGregorian(jalYear: number, jalMonth: number, jalDay: number): [number, number, number] {
  // Reference: 1 Farvardin 1403 = March 20, 2024
  const REFERENCE_GREG_DAY = toGregorianEpochDay(2024, 3, 20) // March 20, 2024
  const REFERENCE_JALALI_YEAR = 1403
  const REFERENCE_JALALI_MONTH = 0 // Farvardin
  const REFERENCE_JALALI_DAY = 1

  // Normalize month: handle negative months and months > 11
  while (jalMonth < 0) {
    jalMonth += 12
    jalYear--
  }
  while (jalMonth > 11) {
    jalMonth -= 12
    jalYear++
  }

  // Calculate days from reference
  let daysFromRef = 0

  // Add days from years between reference and target
  if (jalYear > REFERENCE_JALALI_YEAR) {
    for (let y = REFERENCE_JALALI_YEAR; y < jalYear; y++) {
      daysFromRef += isJalaliLeapYear(y) ? 366 : 365
    }
  } else if (jalYear < REFERENCE_JALALI_YEAR) {
    for (let y = jalYear; y < REFERENCE_JALALI_YEAR; y++) {
      daysFromRef -= isJalaliLeapYear(y) ? 366 : 365
    }
  }

  // Add days from months
  if (jalMonth > REFERENCE_JALALI_MONTH) {
    for (let m = REFERENCE_JALALI_MONTH; m < jalMonth; m++) {
      daysFromRef += jalaliMonthDays(jalYear, m)
    }
  } else if (jalMonth < REFERENCE_JALALI_MONTH) {
    for (let m = jalMonth; m < REFERENCE_JALALI_MONTH; m++) {
      daysFromRef -= jalaliMonthDays(jalYear, m)
    }
  }

  // Add days
  daysFromRef += jalDay - REFERENCE_JALALI_DAY

  // Calculate Gregorian date from epoch day
  const gregEpochDay = REFERENCE_GREG_DAY + daysFromRef
  return fromGregorianEpochDay(gregEpochDay)
}

/**
 * Convert Gregorian date to epoch day (days since January 1, 1 AD)
 * Algorithm from: https://en.wikipedia.org/wiki/Julian_day#Julian_day_number_calculation
 */
function toGregorianEpochDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3

  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
}

/**
 * Convert epoch day to Gregorian date
 */
function fromGregorianEpochDay(epochDay: number): [number, number, number] {
  const a = epochDay + 32044
  const b = Math.floor((4 * a + 3) / 146097)
  const c = a - Math.floor(146097 * b / 4)
  const d = Math.floor((4 * c + 3) / 1461)
  const e = c - Math.floor(1461 * d / 4)
  const m = Math.floor((5 * e + 2) / 153)

  const day = e - Math.floor((153 * m + 2) / 5) + 1
  const month = m + 3 - 12 * Math.floor(m / 10)
  const year = 100 * b + d - 4800 + Math.floor(m / 10)

  return [year, month - 1, day] // month is 0-indexed
}

/**
 * Jalali Calendar System implementation for FullCalendar
 */
class JalaliCalendarSystem implements CalendarSystem {
  getMarkerYear(d: DateMarker): number {
    const [year] = gregorianToJalali(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    return year
  }

  getMarkerMonth(d: DateMarker): number {
    const [, month] = gregorianToJalali(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    return month
  }

  getMarkerDay(d: DateMarker): number {
    const [, , day] = gregorianToJalali(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    return day
  }

  arrayToMarker(arr: number[]): DateMarker {
    // arr is [jalaliYear, jalaliMonth (0-11), jalaliDay (1-31), hours, minutes, seconds, ms]
    const [gregYear, gregMonth, gregDay] = jalaliToGregorian(arr[0], arr[1], arr[2] != null ? arr[2] : 1)
    return arrayToUtcDate([gregYear, gregMonth, gregDay, arr[3] || 0, arr[4] || 0, arr[5] || 0, arr[6] || 0])
  }

  markerToArray(marker: DateMarker): number[] {
    const [year, month, day] = gregorianToJalali(
      marker.getUTCFullYear(),
      marker.getUTCMonth(),
      marker.getUTCDate(),
    )
    return [year, month, day, marker.getUTCHours(), marker.getUTCMinutes(), marker.getUTCSeconds(), marker.getUTCMilliseconds()]
  }
}

// Register the Jalali calendar system
registerCalendarSystem('jalali', JalaliCalendarSystem)
