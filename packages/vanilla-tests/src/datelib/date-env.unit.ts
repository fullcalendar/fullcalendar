import { describe, expect, it } from 'vitest'
import {
  DateEnv,
  type DateEnvSettings,
  type Locale,
  createDuration,
  diffDayAndTime,
  diffWholeDays,
  diffWholeWeeks,
  startOfDay,
} from '../../../headless-calendar/src/index'

/*
DateEnv date math and parsing. The Node project runs in America/New_York (see vitest.config.base.ts),
which the `local` time zone cases depend on.
*/

// What the calendar builds for the 'en' locale
const enLocale: Locale = {
  codeArg: 'en',
  codes: ['en'],
  week: { dow: 0, doy: 4 },
  simpleNumberFormat: new Intl.NumberFormat('en'),
  options: {},
}

function createEnv(settings: Partial<DateEnvSettings> = {}): DateEnv {
  return new DateEnv({
    timeZone: 'UTC',
    calendarSystem: 'gregory',
    locale: enLocale,
    ...settings,
  })
}

describe('DateEnv', () => {
  describe('computeWeekNumber', () => {
    it('uses the locale\'s week rules', () => {
      const env = createEnv()
      expect(env.computeWeekNumber(env.createMarker('2018-04-07'))).toBe(14) // saturday
      expect(env.computeWeekNumber(env.createMarker('2018-04-08'))).toBe(15) // sunday
    })

    it('uses ISO week rules', () => {
      const env = createEnv({ weekNumberCalculation: 'ISO' })
      expect(env.computeWeekNumber(env.createMarker('2018-04-01'))).toBe(13) // sunday
      expect(env.computeWeekNumber(env.createMarker('2018-04-02'))).toBe(14) // monday
    })

    it('calls a custom function with a Date', () => {
      const receivedDates: Date[] = []
      const env = createEnv({
        weekNumberCalculation(date) {
          receivedDates.push(date)
          return 99
        },
      })
      expect(env.computeWeekNumber(env.createMarker('2018-04-01'))).toBe(99)
      expect(receivedDates).toEqual([new Date(Date.UTC(2018, 3, 1))])
    })
  })

  it('startOfWeek respects firstDay', () => {
    const env = createEnv({ firstDay: 2 }) // tuesday
    const weekStart = env.startOfWeek(env.createMarker('2018-04-19'))
    expect(env.toDate(weekStart)).toEqual(new Date(Date.UTC(2018, 3, 17)))
  })

  describe('when UTC', () => {
    const env = createEnv()

    describe('createMarker', () => {
      it.each([
        ['a Date', new Date(2017, 5, 8), new Date(2017, 5, 8)],
        ['a timestamp', new Date(2017, 5, 8).valueOf(), new Date(2017, 5, 8)],
        ['an array, as UTC', [2017, 5, 8], new Date(Date.UTC(2017, 5, 8))],
      ])('accepts %s', (_desc, input, expected) => {
        expect(env.toDate(env.createMarker(input))).toEqual(expected)
      })
    })

    describe('ISO8601 parsing', () => {
      it.each([
        ['a date without a time zone, as UTC', '2018-06-08', new Date(Date.UTC(2018, 5, 8)), true],
        ['a date-time already in UTC', '2018-06-08T00:00:00Z', new Date(Date.UTC(2018, 5, 8)), false],
        ['a date-time with an offset, into UTC', '2018-06-08T00:00:00+12:00', new Date(Date.UTC(2018, 5, 7, 12)), false],
        ['a date-time without a time zone', '2018-06-08T00:00:00', new Date(Date.UTC(2018, 5, 8)), false],
        ['a date-time without a \'T\'', '2018-06-08 01:00:00', new Date(Date.UTC(2018, 5, 8, 1)), false],
        ['just a month', '2018-06', new Date(Date.UTC(2018, 5, 1)), true],
      ])('parses %s', (_desc, input, expectedDate, expectedTimeUnspecified) => {
        const meta = env.createMarkerMeta(input)
        expect(env.toDate(meta.marker)).toEqual(expectedDate)
        expect(meta.isTimeUnspecified).toBe(expectedTimeUnspecified)
      })
    })

    describe('add', () => {
      it('adds positive durations', () => {
        const dur = createDuration({ year: 1, month: 2, day: 3, hour: 4, minute: 5, second: 6, ms: 7 })
        const marker = env.createMarker(new Date(Date.UTC(2018, 5, 5, 12)))
        expect(env.toDate(env.add(marker, dur))).toEqual(new Date(Date.UTC(2019, 7, 8, 16, 5, 6, 7)))
      })

      it('adds negative durations', () => {
        const dur = createDuration({
          year: -1, month: -2, day: -3, hour: -4, minute: -5, second: -6, millisecond: -7,
        })
        const marker = env.createMarker(new Date(Date.UTC(2018, 5, 5, 12)))
        expect(env.toDate(env.add(marker, dur))).toEqual(new Date(Date.UTC(2017, 3, 2, 7, 54, 53, 993)))
      })
    })

    describe('start-of', () => {
      const marker = env.createMarker(new Date(Date.UTC(2018, 5, 5, 12, 30)))

      // https://github.com/fullcalendar/fullcalendar/issues/4363 (test in Safari!)
      it('startOfYear', () => {
        expect(env.toDate(env.startOfYear(marker))).toEqual(new Date(Date.UTC(2018, 0, 1)))
      })

      it('startOfMonth', () => {
        expect(env.toDate(env.startOfMonth(marker))).toEqual(new Date(Date.UTC(2018, 5, 1)))
      })

      it('startOfWeek', () => {
        expect(env.toDate(env.startOfWeek(marker))).toEqual(new Date(Date.UTC(2018, 5, 3)))
      })

      it('startOfDay', () => {
        expect(env.toDate(startOfDay(marker))).toEqual(new Date(Date.UTC(2018, 5, 5)))
      })
    })

    describe.each<[string, (m0: Date, m1: Date) => number | null, [string, number, number, number | null][]]>([
      ['diffWholeYears', (m0: Date, m1: Date) => env.diffWholeYears(m0, m1), [
        ['not whole', Date.UTC(2018, 5, 5, 12, 0), Date.UTC(2020, 5, 5, 12, 30), null],
        ['negative', Date.UTC(2020, 5, 5, 12, 0), Date.UTC(2018, 5, 5, 12, 0), -2],
        ['positive', Date.UTC(2018, 5, 5, 12, 0), Date.UTC(2020, 5, 5, 12, 0), 2],
      ]],
      ['diffWholeMonths', (m0: Date, m1: Date) => env.diffWholeMonths(m0, m1), [
        ['not whole', Date.UTC(2018, 5, 5), Date.UTC(2020, 5, 6), null],
        ['negative', Date.UTC(2020, 9, 5), Date.UTC(2018, 5, 5), -28],
        ['positive', Date.UTC(2018, 5, 5), Date.UTC(2020, 9, 5), 28],
      ]],
      ['diffWholeWeeks', diffWholeWeeks, [
        ['not whole', Date.UTC(2018, 5, 5), Date.UTC(2018, 5, 20), null],
        ['negative', Date.UTC(2018, 5, 19), Date.UTC(2018, 5, 5), -2],
        ['positive', Date.UTC(2018, 5, 5), Date.UTC(2018, 5, 19), 2],
      ]],
      ['diffWholeDays', diffWholeDays, [
        ['not whole', Date.UTC(2018, 5, 5), Date.UTC(2018, 5, 19, 12), null],
        ['negative', Date.UTC(2018, 5, 19), Date.UTC(2018, 5, 5), -14],
        ['positive', Date.UTC(2018, 5, 5), Date.UTC(2018, 5, 19), 14],
      ]],
    ])('%s', (_name, diff, rows) => {
      it.each(rows)('returns %s', (_desc, ms0, ms1, expected) => {
        expect(diff(env.createMarker(ms0), env.createMarker(ms1))).toBe(expected)
      })
    })

    describe('diffDayAndTime', () => {
      it.each([
        ['negative', Date.UTC(2018, 5, 19, 12), Date.UTC(2018, 5, 5), -14, -12 * 60 * 60 * 1000],
        ['positive', Date.UTC(2018, 5, 5), Date.UTC(2018, 5, 19, 12), 14, 12 * 60 * 60 * 1000],
      ])('returns %s', (_desc, ms0, ms1, days, milliseconds) => {
        expect(diffDayAndTime(env.createMarker(ms0), env.createMarker(ms1))).toEqual({
          years: 0,
          months: 0,
          days,
          milliseconds,
        })
      })
    })
  })

  describe('when local', () => {
    const env = createEnv({ timeZone: 'local' })

    describe('ISO8601 parsing', () => {
      it('parses a date without a time zone as local', () => {
        expect(env.toDate(env.createMarker('2018-06-08'))).toEqual(new Date(2018, 5, 8))
      })

      it('parses a date-time with an offset into local', () => {
        expect(env.toDate(env.createMarker('2018-06-08T00:00:00+12:00'))).toEqual(new Date(Date.UTC(2018, 5, 7, 12)))
      })

      it('keeps the wall-clock time of a date-time in the DST gap', () => {
        // 2018-03-11 02:00-03:00 doesn't exist in America/New_York
        const gapTime = '2018-03-11T02:30:00'
        expect(new Date(gapTime).getHours()).toBe(3) // proves it's in the gap

        const marker = env.createMarker(gapTime)
        expect(marker.toISOString()).toBe(gapTime + '.000Z') // markers hold wall-clock time as UTC
      })
    })

    // because `new Date(year)` is error-prone
    it('startOfYear', () => {
      const marker = env.createMarker(new Date(2018, 5, 5, 12))
      expect(env.toDate(env.startOfYear(marker))).toEqual(new Date(2018, 0, 1))
    })
  })

  describe('duration parsing', () => {
    it.each([
      ['a whole day', '2.00:00:00', 2, 0],
      ['hours, minutes, seconds and milliseconds', '01:02:03.500', 0, ((1 * 60 + 2) * 60 + 3) * 1000 + 500],
      ['just hours and minutes', '01:02', 0, (1 * 60 + 2) * 60 * 1000],
    ])('parses %s', (_desc, input, days, milliseconds) => {
      expect(createDuration(input)).toEqual({ years: 0, months: 0, days, milliseconds })
    })
  })
})
