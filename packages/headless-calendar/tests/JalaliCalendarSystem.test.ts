/// <reference types="vitest/globals" />

import { createCalendarSystem } from '../src/calendar-system'
import { DateEnv } from '../src/env'
import '../src/jalali-calendar-system'

describe('JalaliCalendarSystem', () => {
  const jalali = createCalendarSystem('jalali')

  describe('Gregorian to Jalali conversion', () => {
    it('should convert January 1, 2000 to 11 Dey 1378', () => {
      const date = new Date(Date.UTC(2000, 0, 1)) // January 1, 2000
      const [year, month, day] = jalali.markerToArray(date)
      expect(year).toBe(1378)
      expect(month).toBe(9) // Dey (0-indexed)
      expect(day).toBe(11)
    })

    it('should convert March 20, 2024 to 1 Farvardin 1403', () => {
      const date = new Date(Date.UTC(2024, 2, 20)) // March 20, 2024
      const [year, month, day] = jalali.markerToArray(date)
      expect(year).toBe(1403)
      expect(month).toBe(0) // Farvardin (0-indexed)
      expect(day).toBe(1)
    })

    it('should convert March 21, 2026 to 1 Farvardin 1405', () => {
      const date = new Date(Date.UTC(2026, 2, 21)) // March 21, 2026
      const [year, month, day] = jalali.markerToArray(date)
      expect(year).toBe(1405)
      expect(month).toBe(0) // Farvardin (0-indexed)
      expect(day).toBe(1)
    })

    it('should convert August 23, 2026 to 1 Shahrivar 1405', () => {
      const date = new Date(Date.UTC(2026, 7, 23)) // August 23, 2026
      const [year, month, day] = jalali.markerToArray(date)
      expect(year).toBe(1405)
      expect(month).toBe(5) // Shahrivar (0-indexed)
      expect(day).toBe(1)
    })
  })

  describe('Jalali to Gregorian conversion', () => {
    it('should convert 11 Dey 1378 to January 1, 2000', () => {
      const marker = jalali.arrayToMarker([1378, 9, 11]) // 11 Dey 1378
      expect(marker.getUTCFullYear()).toBe(2000)
      expect(marker.getUTCMonth()).toBe(0) // January
      expect(marker.getUTCDate()).toBe(1)
    })

    it('should convert 1 Farvardin 1403 to March 20, 2024', () => {
      const marker = jalali.arrayToMarker([1403, 0, 1]) // 1 Farvardin 1403
      expect(marker.getUTCFullYear()).toBe(2024)
      expect(marker.getUTCMonth()).toBe(2) // March
      expect(marker.getUTCDate()).toBe(20)
    })

    it('should convert 1 Farvardin 1405 to March 21, 2026', () => {
      const marker = jalali.arrayToMarker([1405, 0, 1]) // 1 Farvardin 1405
      expect(marker.getUTCFullYear()).toBe(2026)
      expect(marker.getUTCMonth()).toBe(2) // March
      expect(marker.getUTCDate()).toBe(21)
    })

    it('should convert 1 Shahrivar 1405 to August 23, 2026', () => {
      const marker = jalali.arrayToMarker([1405, 5, 1]) // 1 Shahrivar 1405
      expect(marker.getUTCFullYear()).toBe(2026)
      expect(marker.getUTCMonth()).toBe(7) // August
      expect(marker.getUTCDate()).toBe(23)
    })
  })

  describe('Leap year detection', () => {
    it('should correctly identify non-leap year 1404 (remainder 18)', () => {
      // 1404 % 33 = 18, not in [1,5,9,13,17,22,26,30], so NOT a leap year
      // 1 Shahrivar 1404 = August 23, 2025
      const date1404 = new Date(Date.UTC(2025, 7, 23)) // August 23, 2025
      const [year1, month1, day1] = jalali.markerToArray(date1404)
      expect(year1).toBe(1404)
      expect(month1).toBe(5) // Shahrivar
      expect(day1).toBe(1)

      // 29 Esfand 1404 should be the last day (non-leap year)
      const lastDay1404 = jalali.arrayToMarker([1404, 11, 29])
      const nextDay1404 = jalali.arrayToMarker([1404, 11, 30]) // should be 1 Farvardin 1405
      expect(jalali.getMarkerYear(lastDay1404)).toBe(1404)
      expect(jalali.getMarkerMonth(lastDay1404)).toBe(11) // Esfand
      expect(jalali.getMarkerDay(lastDay1404)).toBe(29)
      expect(jalali.getMarkerYear(nextDay1404)).toBe(1405)
      expect(jalali.getMarkerMonth(nextDay1404)).toBe(0) // Farvardin
      expect(jalali.getMarkerDay(nextDay1404)).toBe(1)
    })

    it('should correctly identify leap year 1408 (remainder 22)', () => {
      // 1408 % 33 = 22, which IS in [1,5,9,13,17,22,26,30], so IS a leap year
      // 30 Esfand 1408 should exist (leap year has 30 days in Esfand)
      const lastDay1408 = jalali.arrayToMarker([1408, 11, 30])
      expect(jalali.getMarkerYear(lastDay1408)).toBe(1408)
      expect(jalali.getMarkerMonth(lastDay1408)).toBe(11) // Esfand
      expect(jalali.getMarkerDay(lastDay1408)).toBe(30)
    })
  })

  describe('Month lengths', () => {
    it('should have 31 days in the first 6 months', () => {
      // Test Farvardin (month 0) - should have 31 days
      const farvardin31 = jalali.arrayToMarker([1405, 0, 31])
      expect(jalali.getMarkerDay(farvardin31)).toBe(31)

      // 32 Farvardin should wrap to 1 Ordibehesht
      const nextDay = jalali.arrayToMarker([1405, 0, 32])
      expect(jalali.getMarkerYear(nextDay)).toBe(1405)
      expect(jalali.getMarkerMonth(nextDay)).toBe(1) // Ordibehesht
      expect(jalali.getMarkerDay(nextDay)).toBe(1)
    })

    it('should have 30 days in months 6-10', () => {
      // Test Mehr (month 6) - should have 30 days
      const mehr30 = jalali.arrayToMarker([1405, 6, 30])
      expect(jalali.getMarkerDay(mehr30)).toBe(30)

      // 31 Mehr should wrap to 1 Aban
      const nextDay = jalali.arrayToMarker([1405, 6, 31])
      expect(jalali.getMarkerYear(nextDay)).toBe(1405)
      expect(jalali.getMarkerMonth(nextDay)).toBe(7) // Aban
      expect(jalali.getMarkerDay(nextDay)).toBe(1)
    })

    it('should have 29 days in Esfand (non-leap) or 30 days (leap)', () => {
      // Non-leap year 1404: Esfand has 29 days
      const lastDayNonLeap = jalali.arrayToMarker([1404, 11, 29])
      expect(jalali.getMarkerDay(lastDayNonLeap)).toBe(29)

      // Leap year 1408: Esfand has 30 days
      const lastDayLeap = jalali.arrayToMarker([1408, 11, 30])
      expect(jalali.getMarkerDay(lastDayLeap)).toBe(30)
    })
  })

  describe('getMarkerYear, getMarkerMonth, getMarkerDay', () => {
    it('should return correct year, month, and day', () => {
      const date = new Date(Date.UTC(2026, 7, 23)) // August 23, 2026
      expect(jalali.getMarkerYear(date)).toBe(1405)
      expect(jalali.getMarkerMonth(date)).toBe(5) // Shahrivar
      expect(jalali.getMarkerDay(date)).toBe(1)
    })
  })

  describe('Week alignment with DateEnv.startOfWeek', () => {
    it('should correctly compute start of week for a Jalali month start', () => {
      // 1 Mehr 1405 = September 22, 2026 (Tuesday)
      // With dow=6 (Saturday), start of week should be September 19, 2026 (Saturday)
      // September 19 = 28 Shahrivar 1405
      const dateEnv = new DateEnv({
        calendarSystem: 'jalali',
        timeZone: 'UTC',
        locale: { codeArg: 'fa', codes: ['fa'], week: { dow: 6, doy: 12 }, simpleNumberFormat: new Intl.NumberFormat('fa'), options: {} },
      })

      const oneMehr = new Date(Date.UTC(2026, 8, 22)) // September 22, 2026
      const startOfWeek = dateEnv.startOfWeek(oneMehr)

      // Should be September 19, 2026 = 28 Shahrivar 1405
      expect(startOfWeek.getUTCFullYear()).toBe(2026)
      expect(startOfWeek.getUTCMonth()).toBe(8) // September
      expect(startOfWeek.getUTCDate()).toBe(19)
      expect(jalali.getMarkerYear(startOfWeek)).toBe(1405)
      expect(jalali.getMarkerMonth(startOfWeek)).toBe(5) // Shahrivar
      expect(jalali.getMarkerDay(startOfWeek)).toBe(28)
    })

    it('should correctly compute start of week when month starts on Sunday', () => {
      // 1 Shahrivar 1405 = August 23, 2026 (Sunday)
      // With dow=6 (Saturday), start of week should be August 22, 2026 (Saturday)
      // August 22 = 31 Mordad 1405
      const dateEnv = new DateEnv({
        calendarSystem: 'jalali',
        timeZone: 'UTC',
        locale: { codeArg: 'fa', codes: ['fa'], week: { dow: 6, doy: 12 }, simpleNumberFormat: new Intl.NumberFormat('fa'), options: {} },
      })

      const oneShahrivar = new Date(Date.UTC(2026, 7, 23)) // August 23, 2026
      const startOfWeek = dateEnv.startOfWeek(oneShahrivar)

      // Should be August 22, 2026 = 31 Mordad 1405
      expect(startOfWeek.getUTCFullYear()).toBe(2026)
      expect(startOfWeek.getUTCMonth()).toBe(7) // August
      expect(startOfWeek.getUTCDate()).toBe(22)
      expect(jalali.getMarkerYear(startOfWeek)).toBe(1405)
      expect(jalali.getMarkerMonth(startOfWeek)).toBe(4) // Mordad
      expect(jalali.getMarkerDay(startOfWeek)).toBe(31)
    })
  })

  describe('Week number calculation with Jalali calendar', () => {
    it('should compute correct Jalali week numbers', () => {
      const dateEnv = new DateEnv({
        calendarSystem: 'jalali',
        timeZone: 'UTC',
        locale: { codeArg: 'fa', codes: ['fa'], week: { dow: 6, doy: 12 }, simpleNumberFormat: new Intl.NumberFormat('fa'), options: {} },
      })

      // September 26, 2026 = 4 Mehr 1405 (Saturday)
      // Week 1 starts on the Saturday containing 1 Farvardin (March 21 = Saturday)
      // Let's verify week numbers for key dates
      const testCases = [
        // March 21, 2026 = 1 Farvardin 1405 (Saturday) - should be week 1
        { date: new Date(Date.UTC(2026, 2, 21)), expectedWeek: 1 },
        // March 28, 2026 = 8 Farvardin 1405 (Saturday) - should be week 2
        { date: new Date(Date.UTC(2026, 2, 28)), expectedWeek: 2 },
        // September 26, 2026 = 4 Mehr 1405 (Saturday)
        // From March 21 to Sept 26 = 189 days = 27 weeks exactly
        { date: new Date(Date.UTC(2026, 8, 26)), expectedWeek: 28 },
      ]

      for (const tc of testCases) {
        const weekNum = dateEnv.computeWeekNumber(tc.date)
        expect(weekNum).toBe(tc.expectedWeek)
      }
    })
  })

  describe('Month navigation across year boundaries', () => {
    it('should navigate from Farvardin 1405 back to Esfand 1404', () => {
      const dateEnv = new DateEnv({
        calendarSystem: 'jalali',
        timeZone: 'UTC',
        locale: { codeArg: 'fa', codes: ['fa'], week: { dow: 6, doy: 12 }, simpleNumberFormat: new Intl.NumberFormat('fa'), options: {} },
      })

      // 1 Farvardin 1405 = March 21, 2026
      const farvardin1405 = new Date(Date.UTC(2026, 2, 21))
      
      // Debug: check markerToArray
      const arr = dateEnv.calendarSystem.markerToArray(farvardin1405)
      expect(arr[0]).toBe(1405)
      expect(arr[1]).toBe(0) // Farvardin
      expect(arr[2]).toBe(1)
      
      // Debug: check arrayToMarker with negative month
      const result = dateEnv.calendarSystem.arrayToMarker([1405, -1, 1])
      expect(dateEnv.getYear(result)).toBe(1404)
      expect(dateEnv.getMonth(result)).toBe(11) // Esfand
      
      // Now test the full subtract flow
      const startOfFarvardin = dateEnv.startOf(farvardin1405, 'month')
      expect(dateEnv.getYear(startOfFarvardin)).toBe(1405)
      expect(dateEnv.getMonth(startOfFarvardin)).toBe(0) // Farvardin
      
      const prevMonth = dateEnv.subtract(startOfFarvardin, { months: 1 })
      expect(dateEnv.getYear(prevMonth)).toBe(1404)
      expect(dateEnv.getMonth(prevMonth)).toBe(11) // Esfand
      expect(dateEnv.getDay(prevMonth)).toBe(1)
    })
  })
})
