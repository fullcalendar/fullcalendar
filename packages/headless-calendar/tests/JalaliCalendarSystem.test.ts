/// <reference types="vitest/globals" />

import { DateEnv } from '../src/env'
import { NativeDateFormatter } from '../src/formatting-native'
import { joinDateTimeFormatParts } from '../src/formatting-utils'
import { addDays, diffDays } from '../src/marker'
import type { Locale } from '../src/locale'

/*
The Jalali (Persian) calendar system.

The expected dates were taken from the browser's own `persian` Intl calendar, which is
what the arithmetic in src/jalali.ts is meant to agree with. The year used throughout is
1405, a regular year, with 1403 and 1404 standing in for the leap cases.
*/

function makeLocale(code: string, dow: number): Locale {
  return {
    codeArg: code,
    codes: [code],
    week: { dow, doy: 12 },
    simpleNumberFormat: new Intl.NumberFormat(code),
    options: {},
  }
}

// Saturday begins the week in Iran, as the shipped 'fa' locale says
const faLocale = makeLocale('fa', 6)

function makeEnv(calendarSystem: string, locale: Locale = faLocale): DateEnv {
  return new DateEnv({
    timeZone: 'UTC',
    calendarSystem,
    locale,
  })
}

function utcDay(isoDay: string): Date {
  return new Date(isoDay + 'T00:00:00Z')
}

// the twelve months of 1405, as the Gregorian days they begin on
const MONTH_STARTS_1405 = [
  '2026-03-21', '2026-04-21', '2026-05-22', '2026-06-22',
  '2026-07-23', '2026-08-23', '2026-09-23', '2026-10-23',
  '2026-11-22', '2026-12-22', '2027-01-21', '2027-02-20',
]

describe('jalali calendar system', () => {
  const env = makeEnv('jalali')

  // the year, the one-based month, and the day of the given Gregorian day
  function jalaliDate(isoDay: string): number[] {
    const marker = utcDay(isoDay)

    return [
      env.getYear(marker),
      env.getMonth(marker) + 1,
      env.getDay(marker),
    ]
  }

  it('reads the jalali date of a marker', () => {
    expect(jalaliDate('1970-01-01')).toEqual([1348, 10, 11])
    expect(jalaliDate('2022-01-28')).toEqual([1400, 11, 8])
    expect(jalaliDate('2026-11-14')).toEqual([1405, 8, 23])
  })

  it('turns the year over on nowruz', () => {
    expect(jalaliDate('2026-03-20')).toEqual([1404, 12, 29])
    expect(jalaliDate('2026-03-21')).toEqual([1405, 1, 1])
    expect(jalaliDate('2026-03-22')).toEqual([1405, 1, 2])
  })

  it('gives a leap year a 30th of esfand', () => {
    expect(jalaliDate('2025-03-19')).toEqual([1403, 12, 29])
    expect(jalaliDate('2025-03-20')).toEqual([1403, 12, 30])
    expect(jalaliDate('2025-03-21')).toEqual([1404, 1, 1])
  })

  it('agrees with the persian intl calendar', () => {
    const intlFormat = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC',
    })

    // twenty years, a day at a time
    let marker = utcDay('2015-01-01')
    const lastMarker = utcDay('2035-01-01')

    while (marker.valueOf() < lastMarker.valueOf()) {
      const parts = intlFormat.formatToParts(marker)
      const partValue = (type: string) => Number(
        parts.find((part) => part.type === type)!.value,
      )

      expect([
        env.getYear(marker),
        env.getMonth(marker) + 1,
        env.getDay(marker),
      ]).toEqual([
        partValue('year'),
        partValue('month'),
        partValue('day'),
      ])

      marker = addDays(marker, 1)
    }
  })

  it('starts a month on the first of the jalali month', () => {
    for (const isoDay of MONTH_STARTS_1405) {
      const monthStart = utcDay(isoDay)

      expect(env.startOfMonth(monthStart)).toEqual(monthStart)
      expect(env.startOfMonth(addDays(monthStart, 10))).toEqual(monthStart)
      expect(env.startOfMonth(addDays(monthStart, -1))).not.toEqual(monthStart)
    }
  })

  it('starts a year on nowruz', () => {
    expect(env.startOfYear(utcDay('2026-11-14'))).toEqual(utcDay('2026-03-21'))
    expect(env.startOfYear(utcDay('2026-03-20'))).toEqual(utcDay('2025-03-21'))
  })

  it('adds and subtracts whole jalali months', () => {
    const yearStart = utcDay('2026-03-21') // 1405/01/01

    expect(env.addMonths(yearStart, 1)).toEqual(utcDay('2026-04-21'))
    expect(env.addMonths(yearStart, 7)).toEqual(utcDay('2026-10-23'))
    expect(env.addMonths(yearStart, 12)).toEqual(utcDay('2027-03-21'))
    expect(env.addMonths(yearStart, -1)).toEqual(utcDay('2026-02-20'))
    expect(env.addMonths(yearStart, -12)).toEqual(utcDay('2025-03-21'))
  })

  it('keeps the time of day when adding months', () => {
    const marker = new Date('2026-11-14T13:45:30.250Z') // 1405/08/23

    expect(env.addMonths(marker, 1)).toEqual(new Date('2026-12-14T13:45:30.250Z'))
  })

  it('gives the jalali months their own lengths', () => {
    function monthLengths(yearStart: Date): number[] {
      const lengths: number[] = []
      let monthStart = yearStart

      for (let i = 0; i < 12; i += 1) {
        const nextMonthStart = env.addMonths(monthStart, 1)
        lengths.push(Math.round(diffDays(monthStart, nextMonthStart)))
        monthStart = nextMonthStart
      }

      return lengths
    }

    // a regular year ends with a 29-day esfand, a leap year with a 30-day one
    expect(monthLengths(utcDay('2026-03-21'))).toEqual(
      [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29],
    )
    expect(monthLengths(utcDay('2024-03-20'))).toEqual(
      [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30],
    )
  })

  it('formats in the calendar system instead of the locale default', () => {
    const formatter = new NativeDateFormatter({
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
    const marker = utcDay('2026-11-14')
    const enLocale = makeLocale('en', 0)

    function format(calendarSystem: string, locale: Locale): string {
      return joinDateTimeFormatParts(
        makeEnv(calendarSystem, locale).formatToParts(marker, formatter),
      )
    }

    expect(format('jalali', enLocale)).toContain('1405')

    // 'fa' asks intl for persian dates on its own. a gregorian grid must not get them,
    // or its cells would be labelled with days the grid was never built from
    expect(format('gregory', faLocale)).toContain('۲۰۲۶')
    expect(format('jalali', faLocale)).toContain('۱۴۰۵')
  })
})
