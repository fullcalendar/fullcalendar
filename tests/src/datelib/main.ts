import { Calendar } from '@fullcalendar/core'
import {
  DateEnv,
  createFormatter,
  createDuration,
  startOfDay,
  diffWholeWeeks,
  diffWholeDays,
  diffDayAndTime,
} from '@fullcalendar/core/internal'
import dayGridPlugin from '@fullcalendar/daygrid'
import { getDSTDeadZone } from '../lib/dst-dead-zone.js'
import { formatPrettyTimeZoneOffset, formatIsoTimeZoneOffset, formatIsoWithoutTz } from '../lib/datelib-utils.js'

describe('datelib', () => {
  let enLocale

  beforeEach(() => {
    enLocale = new Calendar(document.createElement('div'), { // HACK
      plugins: [dayGridPlugin],
    }).getCurrentData().dateEnv.locale
  })

  describe('computeWeekNumber', () => {
    it('works with local', () => {
      let env = new DateEnv({
        timeZone: 'UTC',
        calendarSystem: 'gregory',
        locale: enLocale,
      })
      let m1 = env.createMarker('2018-04-07')
      let m2 = env.createMarker('2018-04-08')
      expect(env.computeWeekNumber(m1)).toBe(14)
      expect(env.computeWeekNumber(m2)).toBe(15)
    })

    it('works with ISO', () => {
      let env = new DateEnv({
        timeZone: 'UTC',
        calendarSystem: 'gregory',
        locale: enLocale,
        weekNumberCalculation: 'ISO',
      })
      let m1 = env.createMarker('2018-04-01')
      let m2 = env.createMarker('2018-04-02')
      expect(env.computeWeekNumber(m1)).toBe(13)
      expect(env.computeWeekNumber(m2)).toBe(14)
    })

    it('works with custom function', () => {
      let env = new DateEnv({
        timeZone: 'UTC',
        calendarSystem: 'gregory',
        locale: enLocale,
        weekNumberCalculation(date) {
          expect(date instanceof Date).toBe(true)
          expect(date.valueOf()).toBe(Date.UTC(2018, 3, 1))
          return 99
        },
      })
      let m1 = env.createMarker('2018-04-01')
      expect(env.computeWeekNumber(m1)).toBe(99)
    })
  })

  it('startOfWeek with different firstDay', () => {
    let env = new DateEnv({
      timeZone: 'UTC',
      calendarSystem: 'gregory',
      locale: enLocale,
      firstDay: 2, // tues
    })
    let m = env.createMarker('2018-04-19')
    let w = env.startOfWeek(m)

    expect(env.toDate(w)).toEqual(
      new Date(Date.UTC(2018, 3, 17)),
    )
  })

  describe('when UTC', () => {
    let env

    beforeEach(() => {
      env = new DateEnv({
        timeZone: 'UTC',
        calendarSystem: 'gregory',
        locale: enLocale,
      })
    })

    describe('createMarker', () => {
      it('with date', () => {
        expect(
          env.toDate(
            env.createMarker(
              new Date(2017, 5, 8),
            ),
          ),
        ).toEqual(
          new Date(2017, 5, 8),
        )
      })

      it('with timestamp', () => {
        expect(
          env.toDate(
            env.createMarker(
              new Date(2017, 5, 8).valueOf(),
            ),
          ),
        ).toEqual(
          new Date(2017, 5, 8),
        )
      })

      it('with array', () => {
        expect(
          env.toDate(
            env.createMarker(
              [2017, 5, 8],
            ),
          ),
        ).toEqual(
          new Date(Date.UTC(2017, 5, 8)),
        )
      })
    })

    describe('ISO8601 parsing', () => {
      it('parses non-tz as UTC', () => {
        let res = env.createMarkerMeta('2018-06-08')
        let date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 8)))
        expect(res.forcedTzo).toBeNull()
      })

      it('parses a date already in UTC', () => {
        let res = env.createMarkerMeta('2018-06-08T00:00:00Z')
        let date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 8)))
        expect(res.forcedTzo).toBeNull()
      })

      it('parses timezones into UTC', () => {
        let res = env.createMarkerMeta('2018-06-08T00:00:00+12:00')
        let date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 7, 12)))
        expect(res.forcedTzo).toBeNull()
      })

      it('detects lack of time', () => {
        let res = env.createMarkerMeta('2018-06-08')
        expect(res.isTimeUnspecified).toBe(true)
      })

      it('detects presence of time', () => {
        let res = env.createMarkerMeta('2018-06-08T00:00:00')
        expect(res.isTimeUnspecified).toBe(false)
      })

      it('parses a time with no \'T\'', () => {
        let res = env.createMarkerMeta('2018-06-08 01:00:00')
        let date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 8, 1, 0)))
      })

      it('parses just a month', () => {
        let res = env.createMarkerMeta('2018-06')
        let date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 1)))
      })

      it('detects presence of time even if timezone', () => {
        let res = env.createMarkerMeta('2018-06-08T00:00:00+12:00')
        expect(res.isTimeUnspecified).toBe(false)
      })
    })

    it('outputs ISO8601 formatting', () => {
      let marker = env.createMarker('2018-06-08T00:00:00')
      let s = env.formatIso(marker)
      expect(s).toBe('2018-06-08T00:00:00Z')
    })

    it('outputs pretty format with UTC timezone', () => {
      let marker = env.createMarker('2018-06-08')
      let formatter = createFormatter({
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        year: 'numeric',
        timeZoneName: 'short',
        omitCommas: true, // for cross-browser
      })
      let s = env.format(marker, formatter)
      expect(s.replace(' at ', ' '))
        .toBe('Friday June 8 2018 12:00 AM UTC')
    })

    describe('week number formatting', () => {
      it('can output only number', () => {
        let marker = env.createMarker('2018-06-08')
        let formatter = createFormatter({ week: 'numeric' })
        let s = env.format(marker, formatter)
        expect(s).toBe('23')
      })

      it('can output narrow', () => {
        let marker = env.createMarker('2018-06-08')
        let formatter = createFormatter({ week: 'narrow' })
        let s = env.format(marker, formatter)
        expect(s).toBe('W23')
      })

      it('can output short', () => {
        let marker = env.createMarker('2018-06-08')
        let formatter = createFormatter({ week: 'short' })
        let s = env.format(marker, formatter)
        expect(s).toBe('W 23')
      })
    })

    describe('range formatting', () => {
      let formatter = createFormatter({
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        separator: ' - ',
      })

      it('works with different days of same month', () => {
        let m0 = env.createMarker('2018-06-08')
        let m1 = env.createMarker('2018-06-09')
        let s = env.formatRange(m0, m1, formatter)
        expect(s).toBe('June 8 - 9, 2018')
      })

      it('works with different days of same month, with inprecise formatter', () => {
        let otherFormatter = createFormatter({
          month: 'long',
          year: 'numeric',
        })
        let m0 = env.createMarker('2018-06-08')
        let m1 = env.createMarker('2018-06-09')
        let s = env.formatRange(m0, m1, otherFormatter)
        expect(s).toBe('June 2018')
      })

      it('works with different day/month of same year', () => {
        let m0 = env.createMarker('2018-06-08')
        let m1 = env.createMarker('2018-07-09')
        let s = env.formatRange(m0, m1, formatter)
        expect(s).toBe('June 8 - July 9, 2018')
      })

      it('works with completely different dates', () => {
        let m0 = env.createMarker('2018-06-08')
        let m1 = env.createMarker('2020-07-09')
        let s = env.formatRange(m0, m1, formatter)
        expect(s).toBe('June 8, 2018 - July 9, 2020')
      })
    })

    // date math

    describe('add', () => {
      it('works with positives', () => {
        let dur = createDuration({
          year: 1,
          month: 2,
          day: 3,
          hour: 4,
          minute: 5,
          second: 6,
          ms: 7,
        })
        let d0 = env.createMarker(new Date(Date.UTC(2018, 5, 5, 12)))
        let d1 = env.toDate(env.add(d0, dur))
        expect(d1).toEqual(
          new Date(Date.UTC(2019, 7, 8, 16, 5, 6, 7)),
        )
      })

      it('works with negatives', () => {
        let dur = createDuration({
          year: -1,
          month: -2,
          day: -3,
          hour: -4,
          minute: -5,
          second: -6,
          millisecond: -7,
        })
        let d0 = env.createMarker(new Date(Date.UTC(2018, 5, 5, 12)))
        let d1 = env.toDate(env.add(d0, dur))
        expect(d1).toEqual(
          new Date(Date.UTC(2017, 3, 2, 7, 54, 53, 993)),
        )
      })
    })

    // test in Safari!
    // https://github.com/fullcalendar/fullcalendar/issues/4363
    it('startOfYear', () => {
      let d0 = env.createMarker(new Date(Date.UTC(2018, 5, 5, 12)))
      let d1 = env.toDate(env.startOfYear(d0))
      expect(d1).toEqual(
        new Date(Date.UTC(2018, 0, 1)),
      )
    })

    it('startOfMonth', () => {
      let d0 = env.createMarker(new Date(Date.UTC(2018, 5, 5, 12)))
      let d1 = env.toDate(env.startOfMonth(d0))
      expect(d1).toEqual(
        new Date(Date.UTC(2018, 5, 1)),
      )
    })

    it('startOfWeek', () => {
      let d0 = env.createMarker(new Date(Date.UTC(2018, 5, 5, 12)))
      let d1 = env.toDate(env.startOfWeek(d0))
      expect(d1).toEqual(
        new Date(Date.UTC(2018, 5, 3)),
      )
    })

    it('startOfDay', () => {
      let d0 = env.createMarker(new Date(Date.UTC(2018, 5, 5, 12, 30)))
      let d1 = env.toDate(startOfDay(d0))
      expect(d1).toEqual(
        new Date(Date.UTC(2018, 5, 5)),
      )
    })

    describe('diffWholeYears', () => {
      it('returns null if not whole', () => {
        let d0 = new Date(Date.UTC(2018, 5, 5, 12, 0))
        let d1 = new Date(Date.UTC(2020, 5, 5, 12, 30))
        let diff = env.diffWholeYears(
          env.createMarker(d0),
          env.createMarker(d1),
        )
        expect(diff).toBe(null)
      })

      it('returns negative', () => {
        let d0 = new Date(Date.UTC(2020, 5, 5, 12, 0))
        let d1 = new Date(Date.UTC(2018, 5, 5, 12, 0))
        let diff = env.diffWholeYears(
          env.createMarker(d0),
          env.createMarker(d1),
        )
        expect(diff).toBe(-2)
      })

      it('returns positive', () => {
        let d0 = new Date(Date.UTC(2018, 5, 5, 12, 0))
        let d1 = new Date(Date.UTC(2020, 5, 5, 12, 0))
        let diff = env.diffWholeYears(
          env.createMarker(d0),
          env.createMarker(d1),
        )
        expect(diff).toBe(2)
      })
    })

    describe('diffWholeMonths', () => {
      it('returns null if not whole', () => {
        let d0 = new Date(Date.UTC(2018, 5, 5))
        let d1 = new Date(Date.UTC(2020, 5, 6))
        let diff = env.diffWholeMonths(
          env.createMarker(d0),
          env.createMarker(d1),
        )
        expect(diff).toBe(null)
      })

      it('returns negative', () => {
        let d0 = new Date(Date.UTC(2020, 9, 5))
        let d1 = new Date(Date.UTC(2018, 5, 5))
        let diff = env.diffWholeMonths(
          env.createMarker(d0),
          env.createMarker(d1),
        )
        expect(diff).toBe(-12 * 2 - 4)
      })

      it('returns positive', () => {
        let d0 = new Date(Date.UTC(2018, 5, 5))
        let d1 = new Date(Date.UTC(2020, 9, 5))
        let diff = env.diffWholeMonths(
          env.createMarker(d0),
          env.createMarker(d1),
        )
        expect(diff).toBe(12 * 2 + 4)
      })
    })

    describe('diffWholeWeeks', () => {
      it('returns null if not whole', () => {
        let d0 = new Date(Date.UTC(2018, 5, 5))
        let d1 = new Date(Date.UTC(2018, 5, 20))
        let diff = diffWholeWeeks(
          env.createMarker(d0),
          env.createMarker(d1),
        )
        expect(diff).toBe(null)
      })

      it('returns negative', () => {
        let d0 = new Date(Date.UTC(2018, 5, 19))
        let d1 = new Date(Date.UTC(2018, 5, 5))
        let diff = diffWholeWeeks(
          env.createMarker(d0),
          env.createMarker(d1),
        )
        expect(diff).toBe(-2)
      })

      it('returns positive', () => {
        let d0 = new Date(Date.UTC(2018, 5, 5))
        let d1 = new Date(Date.UTC(2018, 5, 19))
        let diff = diffWholeWeeks(
          env.createMarker(d0),
          env.createMarker(d1),
        )
        expect(diff).toBe(2)
      })
    })

    describe('diffWholeDays', () => {
      it('returns null if not whole', () => {
        let d0 = new Date(Date.UTC(2018, 5, 5))
        let d1 = new Date(Date.UTC(2018, 5, 19, 12))
        let diff = diffWholeDays(
          env.createMarker(d0),
          env.createMarker(d1),
        )
        expect(diff).toBe(null)
      })

      it('returns negative', () => {
        let d0 = new Date(Date.UTC(2018, 5, 19))
        let d1 = new Date(Date.UTC(2018, 5, 5))
        let diff = diffWholeDays(
          env.createMarker(d0),
          env.createMarker(d1),
        )
        expect(diff).toBe(-14)
      })

      it('returns positive', () => {
        let d0 = new Date(Date.UTC(2018, 5, 5))
        let d1 = new Date(Date.UTC(2018, 5, 19))
        let diff = diffWholeDays(
          env.createMarker(d0),
          env.createMarker(d1),
        )
        expect(diff).toBe(14)
      })
    })

    describe('diffDayAndTime', () => {
      it('returns negative', () => {
        let d0 = new Date(Date.UTC(2018, 5, 19, 12))
        let d1 = new Date(Date.UTC(2018, 5, 5))
        let diff = diffDayAndTime(
          env.createMarker(d0),
          env.createMarker(d1),
        )
        expect(diff).toEqual({
          years: 0,
          months: 0,
          days: -14,
          milliseconds: -12 * 60 * 60 * 1000,
        })
      })

      it('returns positive', () => {
        let d0 = new Date(Date.UTC(2018, 5, 5))
        let d1 = new Date(Date.UTC(2018, 5, 19, 12))
        let diff = diffDayAndTime(
          env.createMarker(d0),
          env.createMarker(d1),
        )
        expect(diff).toEqual({
          years: 0,
          months: 0,
          days: 14,
          milliseconds: 12 * 60 * 60 * 1000,
        })
      })
    })
  })

  describe('when local', () => {
    let env

    beforeEach(() => {
      env = new DateEnv({
        timeZone: 'local',
        calendarSystem: 'gregory',
        locale: enLocale,
      })
    })

    describe('ISO8601 parsing', () => {
      it('parses non-tz as local', () => {
        let res = env.createMarkerMeta('2018-06-08')
        let date = env.toDate(res.marker)
        expect(date).toEqual(new Date(2018, 5, 8))
        expect(res.forcedTzo).toBeNull()
      })

      it('parses timezones into local', () => {
        let res = env.createMarkerMeta('2018-06-08T00:00:00+12:00')
        let date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 7, 12)))
        expect(res.forcedTzo).toBeNull()
      })

      it('does not lose info when parsing a dst-dead-zone date', () => {
        let deadZone = getDSTDeadZone()

        if (!deadZone) {
          console.log('could not determine DST dead zone') // eslint-disable-line no-console
        } else {
          // use a utc date to get a ISO8601 string representation of the start of the dead zone
          let utcDate = new Date(Date.UTC(
            deadZone[1].getFullYear(),
            deadZone[1].getMonth(),
            deadZone[1].getDate(),
            deadZone[1].getHours() - 1, // back one hour. shouldn't exist in local time
            deadZone[1].getMinutes(),
            deadZone[1].getSeconds(),
            deadZone[1].getMilliseconds(),
          ))
          let s = formatIsoWithoutTz(utcDate)

          // check that the local date falls out of the dead zone
          let localDate = new Date(s)
          expect(localDate.getHours()).not.toBe(deadZone[1].getHours() - 1)

          // check that is parsed and retained the original hour,
          // even tho it falls into the dead zone for local time
          let marker = env.createMarker(s)
          expect(formatIsoWithoutTz(marker)).toBe(s)

          // TODO
          // // when it uses the env to format to local time,
          // // it should have jumped out of the dead zone.
          // expect(env.formatIso(marker)).not.toMatch(s)
        }
      })
    })

    it('outputs ISO8601 formatting', () => {
      let marker = env.createMarker('2018-06-08T00:00:00')
      let s = env.formatIso(marker)
      let realTzo = formatIsoTimeZoneOffset(new Date(2018, 5, 8))
      expect(s).toBe('2018-06-08T00:00:00' + realTzo)
    })

    it('outputs pretty format with local timezone', () => {
      let marker = env.createMarker('2018-06-08')
      let formatter = createFormatter({
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
        omitCommas: true, // for cross-browser
      })
      let s = env.format(marker, formatter)
      expect(s.replace(' at ', ' '))
        .toBe('Friday June 8 2018 12:00 AM ' + formatPrettyTimeZoneOffset(new Date(2018, 5, 8)))
    })

    it('can output a timezone only', () => {
      let marker = env.createMarker('2018-06-08')
      let formatter = createFormatter({ timeZoneName: 'short' })
      let s = env.format(marker, formatter)
      expect(s).toBe(formatPrettyTimeZoneOffset(new Date(2018, 5, 8)))
    })

    // because `new Date(year)` is error-prone
    it('startOfYear', () => {
      let d0 = env.createMarker(new Date(2018, 5, 5, 12))
      let d1 = env.toDate(env.startOfYear(d0))
      expect(d1).toEqual(
        new Date(2018, 0, 1),
      )
    })
  })

  describe('when named timezone with coercion', () => {
    let env

    beforeEach(() => {
      env = new DateEnv({
        timeZone: 'America/Chicago',
        calendarSystem: 'gregory',
        locale: enLocale,
      })
    })

    describe('ISO8601 parsing', () => {
      it('parses non-tz as UTC with no forcedTzo', () => {
        let res = env.createMarkerMeta('2018-06-08')
        let date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 8)))
        expect(res.forcedTzo).toBeNull()
      })

      it('parses as UTC after stripping and with a forcedTzo', () => {
        let res = env.createMarkerMeta('2018-06-08T00:00:00+12:00')
        let date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 8)))
        expect(res.forcedTzo).toBe(12 * 60)
      })

      it('parses as UTC after stripping and with a forcedTzo, alt format', () => {
        let res = env.createMarkerMeta('2018-06-08T01:01:01.100+1200')
        let date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 8, 1, 1, 1, 100)))
        expect(res.forcedTzo).toBe(12 * 60)
      })
    })

    it('outputs UTC timezone when no timezone specified', () => {
      let marker = env.createMarker('2018-06-08')
      let formatter = createFormatter({
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZoneName: 'short',
        omitCommas: true, // for cross-browser
      })
      let s = env.format(marker, formatter)
      expect(s.replace(' at ', ' '))
        .toBe('Friday June 8 2018 12:00 AM UTC')
    })

    it('outputs UTC short timezone when no timezone specified, when requested as long', () => {
      let marker = env.createMarker('2018-06-08')
      let formatter = createFormatter({
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZoneName: 'long',
        omitCommas: true, // for cross-browser
      })
      let s = env.format(marker, formatter)
      expect(s.replace(' at ', ' '))
        .toBe('Friday June 8 2018 12:00 AM UTC')
    })

    it('computes current date as local values', () => {
      let marker = env.createNowMarker()
      let localDate = new Date()
      expect(marker.getUTCFullYear()).toBe(localDate.getFullYear())
      expect(marker.getUTCMonth()).toBe(localDate.getMonth())
      expect(marker.getUTCDate()).toBe(localDate.getDate())
      expect(marker.getUTCHours()).toBe(localDate.getHours())
      expect(marker.getUTCMinutes()).toBe(localDate.getMinutes())
      expect(marker.getUTCSeconds()).toBe(localDate.getSeconds())
    })
  })

  describe('duration parsing', () => {
    it('accepts whole day in string', () => {
      let dur = createDuration('2.00:00:00')
      expect(dur).toEqual({
        years: 0,
        months: 0,
        days: 2,
        milliseconds: 0,
      })
    })

    it('accepts hours, minutes, seconds, and milliseconds', () => {
      let dur = createDuration('01:02:03.500')
      expect(dur).toEqual({
        years: 0,
        months: 0,
        days: 0,
        milliseconds:
          1 * 60 * 60 * 1000 +
          2 * 60 * 1000 +
          3 * 1000 +
          500,
      })
    })

    it('accepts just hours and minutes', () => {
      let dur = createDuration('01:02')
      expect(dur).toEqual({
        years: 0,
        months: 0,
        days: 0,
        milliseconds:
          1 * 60 * 60 * 1000 +
          2 * 60 * 1000,
      })
    })
  })
})
