import { formatPrettyTimeZoneOffset, formatIsoTimeZoneOffset, formatIsoWithoutTz } from './utils'
import { getDSTDeadZone } from './dst-dead-zone'
import { DateEnv, createFormatter, createDuration, startOfDay, diffWholeWeeks, diffWholeDays, diffDayAndTime, Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'

describe('datelib', function() {
  let enLocale

  beforeEach(function() {
    enLocale = new Calendar(document.createElement('div'), { // HACK
      plugins: [ dayGridPlugin ]
    }).dateEnv.locale
  })

  describe('computeWeekNumber', function() {

    it('works with local', function() {
      var env = new DateEnv({
        timeZone: 'UTC',
        calendarSystem: 'gregory',
        locale: enLocale
      })
      var m1 = env.createMarker('2018-04-07')
      var m2 = env.createMarker('2018-04-08')
      expect(env.computeWeekNumber(m1)).toBe(14)
      expect(env.computeWeekNumber(m2)).toBe(15)
    })

    it('works with ISO', function() {
      var env = new DateEnv({
        timeZone: 'UTC',
        calendarSystem: 'gregory',
        locale: enLocale,
        weekNumberCalculation: 'ISO'
      })
      var m1 = env.createMarker('2018-04-01')
      var m2 = env.createMarker('2018-04-02')
      expect(env.computeWeekNumber(m1)).toBe(13)
      expect(env.computeWeekNumber(m2)).toBe(14)
    })

    it('works with custom function', function() {
      var env = new DateEnv({
        timeZone: 'UTC',
        calendarSystem: 'gregory',
        locale: enLocale,
        weekNumberCalculation: function(date) {
          expect(date instanceof Date).toBe(true)
          expect(date.valueOf()).toBe(Date.UTC(2018, 3, 1))
          return 99
        }
      })
      var m1 = env.createMarker('2018-04-01')
      expect(env.computeWeekNumber(m1)).toBe(99)
    })

  })

  it('startOfWeek with different firstDay', function() {
    var env = new DateEnv({
      timeZone: 'UTC',
      calendarSystem: 'gregory',
      locale: enLocale,
      firstDay: 2 // tues
    })
    var m = env.createMarker('2018-04-19')
    var w = env.startOfWeek(m)

    expect(env.toDate(w)).toEqual(
      new Date(Date.UTC(2018, 3, 17))
    )
  })


  describe('when UTC', function() {
    var env

    beforeEach(function() {
      env = new DateEnv({
        timeZone: 'UTC',
        calendarSystem: 'gregory',
        locale: enLocale
      })
    })

    describe('createMarker', function() {

      it('with date', function() {
        expect(
          env.toDate(
            env.createMarker(
              new Date(2017, 5, 8)
            )
          )
        ).toEqual(
          new Date(2017, 5, 8)
        )
      })

      it('with timestamp', function() {
        expect(
          env.toDate(
            env.createMarker(
              new Date(2017, 5, 8).valueOf()
            )
          )
        ).toEqual(
          new Date(2017, 5, 8)
        )
      })

      it('with array', function() {
        expect(
          env.toDate(
            env.createMarker(
              [ 2017, 5, 8 ]
            )
          )
        ).toEqual(
          new Date(Date.UTC(2017, 5, 8))
        )
      })

    })

    describe('ISO8601 parsing', function() {

      it('parses non-tz as UTC', function() {
        var res = env.createMarkerMeta('2018-06-08')
        var date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 8)))
        expect(res.forcedTzo).toBeNull()
      })

      it('parses a date already in UTC', function() {
        var res = env.createMarkerMeta('2018-06-08T00:00:00Z')
        var date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 8)))
        expect(res.forcedTzo).toBeNull()
      })

      it('parses timezones into UTC', function() {
        var res = env.createMarkerMeta('2018-06-08T00:00:00+12:00')
        var date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 7, 12)))
        expect(res.forcedTzo).toBeNull()
      })

      it('detects lack of time', function() {
        var res = env.createMarkerMeta('2018-06-08')
        expect(res.isTimeUnspecified).toBe(true)
      })

      it('detects presence of time', function() {
        var res = env.createMarkerMeta('2018-06-08T00:00:00')
        expect(res.isTimeUnspecified).toBe(false)
      })

      it('parses a time with no \'T\'', function() {
        var res = env.createMarkerMeta('2018-06-08 01:00:00')
        var date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 8, 1, 0)))
      })

      it('parses just a month', function() {
        var res = env.createMarkerMeta('2018-06')
        var date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 1)))
      })

      it('detects presence of time even if timezone', function() {
        var res = env.createMarkerMeta('2018-06-08T00:00:00+12:00')
        expect(res.isTimeUnspecified).toBe(false)
      })

    })

    it('outputs ISO8601 formatting', function() {
      var marker = env.createMarker('2018-06-08T00:00:00')
      var s = env.formatIso(marker)
      expect(s).toBe('2018-06-08T00:00:00Z')
    })

    it('outputs pretty format with UTC timezone', function() {
      var marker = env.createMarker('2018-06-08')
      var formatter = createFormatter({
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        year: 'numeric',
        timeZoneName: 'short',
        omitCommas: true // for cross-browser
      })
      var s = env.format(marker, formatter)
      expect(s).toBe('Friday June 8 2018 12:00 AM UTC')
    })


    describe('week number formatting', function() {

      it('can output only number', function() {
        var marker = env.createMarker('2018-06-08')
        var formatter = createFormatter({ week: 'numeric' })
        var s = env.format(marker, formatter)
        expect(s).toBe('23')
      })

      it('can output narrow', function() {
        var marker = env.createMarker('2018-06-08')
        var formatter = createFormatter({ week: 'narrow' })
        var s = env.format(marker, formatter)
        expect(s).toBe('W23')
      })

      it('can output short', function() {
        var marker = env.createMarker('2018-06-08')
        var formatter = createFormatter({ week: 'short' })
        var s = env.format(marker, formatter)
        expect(s).toBe('W 23')
      })
    })


    describe('range formatting', function() {
      var formatter = createFormatter({
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        separator: ' - '
      })

      it('works with different days of same month', function() {
        var m0 = env.createMarker('2018-06-08')
        var m1 = env.createMarker('2018-06-09')
        var s = env.formatRange(m0, m1, formatter)
        expect(s).toBe('June 8 - 9, 2018')
      })

      it('works with different days of same month, with inprecise formatter', function() {
        var formatter = createFormatter({
          month: 'long',
          year: 'numeric'
        })
        var m0 = env.createMarker('2018-06-08')
        var m1 = env.createMarker('2018-06-09')
        var s = env.formatRange(m0, m1, formatter)
        expect(s).toBe('June 2018')
      })

      it('works with different day/month of same year', function() {
        var m0 = env.createMarker('2018-06-08')
        var m1 = env.createMarker('2018-07-09')
        var s = env.formatRange(m0, m1, formatter)
        expect(s).toBe('June 8 - July 9, 2018')
      })

      it('works with completely different dates', function() {
        var m0 = env.createMarker('2018-06-08')
        var m1 = env.createMarker('2020-07-09')
        var s = env.formatRange(m0, m1, formatter)
        expect(s).toBe('June 8, 2018 - July 9, 2020')
      })

    })


    // date math

    describe('add', function() {

      it('works with positives', function() {
        var dur = createDuration({
          year: 1,
          month: 2,
          day: 3,
          hour: 4,
          minute: 5,
          second: 6,
          ms: 7
        })
        var d0 = env.createMarker(new Date(Date.UTC(2018, 5, 5, 12)))
        var d1 = env.toDate(env.add(d0, dur))
        expect(d1).toEqual(
          new Date(Date.UTC(2019, 7, 8, 16, 5, 6, 7))
        )
      })

      it('works with negatives', function() {
        var dur = createDuration({
          year: -1,
          month: -2,
          day: -3,
          hour: -4,
          minute: -5,
          second: -6,
          millisecond: -7
        })
        var d0 = env.createMarker(new Date(Date.UTC(2018, 5, 5, 12)))
        var d1 = env.toDate(env.add(d0, dur))
        expect(d1).toEqual(
          new Date(Date.UTC(2017, 3, 2, 7, 54, 53, 993))
        )
      })

    })

    // test in Safari!
    // https://github.com/fullcalendar/fullcalendar/issues/4363
    it('startOfYear', function() {
      var d0 = env.createMarker(new Date(Date.UTC(2018, 5, 5, 12)))
      var d1 = env.toDate(env.startOfYear(d0))
      expect(d1).toEqual(
        new Date(Date.UTC(2018, 0, 1))
      )
    })

    it('startOfMonth', function() {
      var d0 = env.createMarker(new Date(Date.UTC(2018, 5, 5, 12)))
      var d1 = env.toDate(env.startOfMonth(d0))
      expect(d1).toEqual(
        new Date(Date.UTC(2018, 5, 1))
      )
    })

    it('startOfWeek', function() {
      var d0 = env.createMarker(new Date(Date.UTC(2018, 5, 5, 12)))
      var d1 = env.toDate(env.startOfWeek(d0))
      expect(d1).toEqual(
        new Date(Date.UTC(2018, 5, 3))
      )
    })

    it('startOfDay', function() {
      var d0 = env.createMarker(new Date(Date.UTC(2018, 5, 5, 12, 30)))
      var d1 = env.toDate(startOfDay(d0))
      expect(d1).toEqual(
        new Date(Date.UTC(2018, 5, 5))
      )
    })

    describe('diffWholeYears', function() {

      it('returns null if not whole', function() {
        var d0 = new Date(Date.UTC(2018, 5, 5, 12, 0))
        var d1 = new Date(Date.UTC(2020, 5, 5, 12, 30))
        var diff = env.diffWholeYears(
          env.createMarker(d0),
          env.createMarker(d1)
        )
        expect(diff).toBe(null)
      })

      it('returns negative', function() {
        var d0 = new Date(Date.UTC(2020, 5, 5, 12, 0))
        var d1 = new Date(Date.UTC(2018, 5, 5, 12, 0))
        var diff = env.diffWholeYears(
          env.createMarker(d0),
          env.createMarker(d1)
        )
        expect(diff).toBe(-2)
      })

      it('returns positive', function() {
        var d0 = new Date(Date.UTC(2018, 5, 5, 12, 0))
        var d1 = new Date(Date.UTC(2020, 5, 5, 12, 0))
        var diff = env.diffWholeYears(
          env.createMarker(d0),
          env.createMarker(d1)
        )
        expect(diff).toBe(2)
      })

    })

    describe('diffWholeMonths', function() {

      it('returns null if not whole', function() {
        var d0 = new Date(Date.UTC(2018, 5, 5))
        var d1 = new Date(Date.UTC(2020, 5, 6))
        var diff = env.diffWholeMonths(
          env.createMarker(d0),
          env.createMarker(d1)
        )
        expect(diff).toBe(null)
      })

      it('returns negative', function() {
        var d0 = new Date(Date.UTC(2020, 9, 5))
        var d1 = new Date(Date.UTC(2018, 5, 5))
        var diff = env.diffWholeMonths(
          env.createMarker(d0),
          env.createMarker(d1)
        )
        expect(diff).toBe(-12 * 2 - 4)
      })

      it('returns positive', function() {
        var d0 = new Date(Date.UTC(2018, 5, 5))
        var d1 = new Date(Date.UTC(2020, 9, 5))
        var diff = env.diffWholeMonths(
          env.createMarker(d0),
          env.createMarker(d1)
        )
        expect(diff).toBe(12 * 2 + 4)
      })

    })

    describe('diffWholeWeeks', function() {

      it('returns null if not whole', function() {
        var d0 = new Date(Date.UTC(2018, 5, 5))
        var d1 = new Date(Date.UTC(2018, 5, 20))
        var diff = diffWholeWeeks(
          env.createMarker(d0),
          env.createMarker(d1)
        )
        expect(diff).toBe(null)
      })

      it('returns negative', function() {
        var d0 = new Date(Date.UTC(2018, 5, 19))
        var d1 = new Date(Date.UTC(2018, 5, 5))
        var diff = diffWholeWeeks(
          env.createMarker(d0),
          env.createMarker(d1)
        )
        expect(diff).toBe(-2)
      })

      it('returns positive', function() {
        var d0 = new Date(Date.UTC(2018, 5, 5))
        var d1 = new Date(Date.UTC(2018, 5, 19))
        var diff = diffWholeWeeks(
          env.createMarker(d0),
          env.createMarker(d1)
        )
        expect(diff).toBe(2)
      })

    })

    describe('diffWholeDays', function() {

      it('returns null if not whole', function() {
        var d0 = new Date(Date.UTC(2018, 5, 5))
        var d1 = new Date(Date.UTC(2018, 5, 19, 12))
        var diff = diffWholeDays(
          env.createMarker(d0),
          env.createMarker(d1)
        )
        expect(diff).toBe(null)
      })

      it('returns negative', function() {
        var d0 = new Date(Date.UTC(2018, 5, 19))
        var d1 = new Date(Date.UTC(2018, 5, 5))
        var diff = diffWholeDays(
          env.createMarker(d0),
          env.createMarker(d1)
        )
        expect(diff).toBe(-14)
      })

      it('returns positive', function() {
        var d0 = new Date(Date.UTC(2018, 5, 5))
        var d1 = new Date(Date.UTC(2018, 5, 19))
        var diff = diffWholeDays(
          env.createMarker(d0),
          env.createMarker(d1)
        )
        expect(diff).toBe(14)
      })

    })

    describe('diffDayAndTime', function() {

      it('returns negative', function() {
        var d0 = new Date(Date.UTC(2018, 5, 19, 12))
        var d1 = new Date(Date.UTC(2018, 5, 5))
        var diff = diffDayAndTime(
          env.createMarker(d0),
          env.createMarker(d1)
        )
        expect(diff).toEqual({
          years: 0,
          months: 0,
          days: -14,
          milliseconds: -12 * 60 * 60 * 1000
        })
      })

      it('returns positive', function() {
        var d0 = new Date(Date.UTC(2018, 5, 5))
        var d1 = new Date(Date.UTC(2018, 5, 19, 12))
        var diff = diffDayAndTime(
          env.createMarker(d0),
          env.createMarker(d1)
        )
        expect(diff).toEqual({
          years: 0,
          months: 0,
          days: 14,
          milliseconds: 12 * 60 * 60 * 1000
        })
      })

    })

  })

  describe('when local', function() {
    var env

    beforeEach(function() {
      env = new DateEnv({
        timeZone: 'local',
        calendarSystem: 'gregory',
        locale: enLocale
      })
    })

    describe('ISO8601 parsing', function() {

      it('parses non-tz as local', function() {
        var res = env.createMarkerMeta('2018-06-08')
        var date = env.toDate(res.marker)
        expect(date).toEqual(new Date(2018, 5, 8))
        expect(res.forcedTzo).toBeNull()
      })

      it('parses timezones into local', function() {
        var res = env.createMarkerMeta('2018-06-08T00:00:00+12:00')
        var date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 7, 12)))
        expect(res.forcedTzo).toBeNull()
      })

      it('does not lose info when parsing a dst-dead-zone date', function() {
        let deadZone = getDSTDeadZone()

        if (!deadZone) {
          console.log('could not determine DST dead zone')
        } else {

          // use a utc date to get a ISO8601 string representation of the start of the dead zone
          let utcDate = new Date(Date.UTC(
            deadZone[1].getFullYear(),
            deadZone[1].getMonth(),
            deadZone[1].getDate(),
            deadZone[1].getHours() - 1, // back one hour. shouldn't exist in local time
            deadZone[1].getMinutes(),
            deadZone[1].getSeconds(),
            deadZone[1].getMilliseconds()
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

    it('outputs ISO8601 formatting', function() {
      var marker = env.createMarker('2018-06-08T00:00:00')
      var s = env.formatIso(marker)
      var realTzo = formatIsoTimeZoneOffset(new Date(2018, 5, 8))
      expect(s).toBe('2018-06-08T00:00:00' + realTzo)
    })

    it('outputs pretty format with local timezone', function() {
      var marker = env.createMarker('2018-06-08')
      var formatter = createFormatter({
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
        omitCommas: true // for cross-browser
      })
      var s = env.format(marker, formatter)
      expect(s).toBe('Friday June 8 2018 12:00 AM ' + formatPrettyTimeZoneOffset(new Date(2018, 5, 8)))
    })

    it('can output a timezone only', function() {
      var marker = env.createMarker('2018-06-08')
      var formatter = createFormatter({ timeZoneName: 'short' })
      var s = env.format(marker, formatter)
      expect(s).toBe(formatPrettyTimeZoneOffset(new Date(2018, 5, 8)))
    })


    // because `new Date(year)` is error-prone
    it('startOfYear', function() {
      var d0 = env.createMarker(new Date(2018, 5, 5, 12))
      var d1 = env.toDate(env.startOfYear(d0))
      expect(d1).toEqual(
        new Date(2018, 0, 1)
      )
    })

  })

  describe('when named timezone with coercion', function() {
    var env

    beforeEach(function() {
      env = new DateEnv({
        timeZone: 'America/Chicago',
        calendarSystem: 'gregory',
        locale: enLocale
      })
    })

    describe('ISO8601 parsing', function() {

      it('parses non-tz as UTC with no forcedTzo', function() {
        var res = env.createMarkerMeta('2018-06-08')
        var date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 8)))
        expect(res.forcedTzo).toBeNull()
      })

      it('parses as UTC after stripping and with a forcedTzo', function() {
        var res = env.createMarkerMeta('2018-06-08T00:00:00+12:00')
        var date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 8)))
        expect(res.forcedTzo).toBe(12 * 60)
      })

      it('parses as UTC after stripping and with a forcedTzo, alt format', function() {
        var res = env.createMarkerMeta('2018-06-08T01:01:01.100+1200')
        var date = env.toDate(res.marker)
        expect(date).toEqual(new Date(Date.UTC(2018, 5, 8, 1, 1, 1, 100)))
        expect(res.forcedTzo).toBe(12 * 60)
      })

    })

    it('outputs UTC timezone when no timezone specified', function() {
      var marker = env.createMarker('2018-06-08')
      var formatter = createFormatter({
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZoneName: 'short',
        omitCommas: true // for cross-browser
      })
      var s = env.format(marker, formatter)
      expect(s).toBe('Friday June 8 2018 12:00 AM UTC')
    })

    it('outputs UTC short timezone when no timezone specified, when requested as long', function() {
      var marker = env.createMarker('2018-06-08')
      var formatter = createFormatter({
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZoneName: 'long',
        omitCommas: true // for cross-browser
      })
      var s = env.format(marker, formatter)
      expect(s).toBe('Friday June 8 2018 12:00 AM UTC')
    })

    it('computes current date as local values', function() {
      var marker = env.createNowMarker()
      var localDate = new Date()
      expect(marker.getUTCFullYear()).toBe(localDate.getFullYear())
      expect(marker.getUTCMonth()).toBe(localDate.getMonth())
      expect(marker.getUTCDate()).toBe(localDate.getDate())
      expect(marker.getUTCHours()).toBe(localDate.getHours())
      expect(marker.getUTCMinutes()).toBe(localDate.getMinutes())
      expect(marker.getUTCSeconds()).toBe(localDate.getSeconds())
    })

  })

  describe('duration parsing', function() {

    it('accepts whole day in string', function() {
      var dur = createDuration('2.00:00:00')
      expect(dur).toEqual({
        years: 0,
        months: 0,
        days: 2,
        milliseconds: 0
      })
    })

    it('accepts hours, minutes, seconds, and milliseconds', function() {
      var dur = createDuration('01:02:03.500')
      expect(dur).toEqual({
        years: 0,
        months: 0,
        days: 0,
        milliseconds:
          1 * 60 * 60 * 1000 +
          2 * 60 * 1000 +
          3 * 1000 +
          500
      })
    })

    it('accepts just hours and minutes', function() {
      var dur = createDuration('01:02')
      expect(dur).toEqual({
        years: 0,
        months: 0,
        days: 0,
        milliseconds:
          1 * 60 * 60 * 1000 +
          2 * 60 * 1000
      })
    })

  })

})
