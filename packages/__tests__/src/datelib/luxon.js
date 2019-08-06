import { Calendar } from '@fullcalendar/core'
import esLocale from '@fullcalendar/core/locales/es'
import LuxonPlugin, { toDateTime, toDuration } from '@fullcalendar/luxon'
import DayGridPlugin from '@fullcalendar/daygrid'
import { getSingleEl, getEventElTimeText } from '../event-render/EventRenderUtils'
import { testTimeZoneImpl } from './timeZoneImpl'


describe('luxon plugin', function() {

  const PLUGINS = [ LuxonPlugin, DayGridPlugin ] // for `new Calendar`

  pushOptions({ // for initCalendar
    plugins: PLUGINS
  })

  testTimeZoneImpl(LuxonPlugin)

  describe('toDateTime', function() {

    describe('timezone transfering', function() {

      it('transfers UTC', function() {
        let calendar = new Calendar(document.createElement('div'), {
          plugins: PLUGINS,
          events: [ { start: '2018-09-05T12:00:00', end: '2018-09-05T18:00:00' } ],
          timeZone: 'UTC'
        })
        let event = calendar.getEvents()[0]
        var start = toDateTime(event.start, calendar)
        var end = toDateTime(event.end, calendar)
        expect(start.toISO()).toBe('2018-09-05T12:00:00.000Z')
        expect(start.zoneName).toBe('UTC')
        expect(end.toISO()).toBe('2018-09-05T18:00:00.000Z')
        expect(end.zoneName).toBe('UTC')
      })

      it('transfers local timezone', function() {
        let calendar = new Calendar(document.createElement('div'), {
          plugins: PLUGINS,
          events: [ { start: '2018-09-05T12:00:00', end: '2018-09-05T18:00:00' } ],
          timeZone: 'local'
        })
        let event = calendar.getEvents()[0]
        var start = toDateTime(event.start, calendar)
        var end = toDateTime(event.end, calendar)
        expect(start.toJSDate()).toEqualLocalDate('2018-09-05T12:00:00')
        expect(start.zoneName).toMatch('/') // has a named timezone
        expect(end.toJSDate()).toEqualLocalDate('2018-09-05T18:00:00')
        expect(end.zoneName).toMatch('/') // has a named timezone
      })

      it('transfers named timezone', function() {
        let calendar = new Calendar(document.createElement('div'), {
          plugins: PLUGINS,
          events: [ { start: '2018-09-05T12:00:00', end: '2018-09-05T18:00:00' } ],
          timeZone: 'Europe/Moscow'
        })
        let event = calendar.getEvents()[0]
        var start = toDateTime(event.start, calendar)
        var end = toDateTime(event.end, calendar)
        expect(start.toJSDate()).toEqualDate('2018-09-05T12:00:00+03:00')
        expect(start.zoneName).toMatch('Europe/Moscow')
        expect(end.toJSDate()).toEqualDate('2018-09-05T18:00:00+03:00')
        expect(end.zoneName).toMatch('Europe/Moscow')
      })

    })

    it('transfers locale', function() {
      let calendar = new Calendar(document.createElement('div'), {
        plugins: PLUGINS,
        events: [ { start: '2018-09-05T12:00:00', end: '2018-09-05T18:00:00' } ],
        locale: esLocale
      })
      let event = calendar.getEvents()[0]
      var datetime = toDateTime(event.start, calendar)
      expect(datetime.locale).toEqual('es')
    })

  })

  describe('toDuration', function() {

    it('converts numeric values correctly', function() {
      let calendar = new Calendar(document.createElement('div'), {
        plugins: PLUGINS,
        defaultTimedEventDuration: '05:00',
        defaultAllDayEventDuration: { days: 3 }
      })

      // hacky way to have a duration parsed
      let timedDuration = toDuration(calendar.defaultTimedEventDuration, calendar)
      let allDayDuration = toDuration(calendar.defaultAllDayEventDuration, calendar)

      expect(timedDuration.as('hours')).toBe(5)
      expect(allDayDuration.as('days')).toBe(3)
    })

    it('transfers locale correctly', function() {
      let calendar = new Calendar(document.createElement('div'), {
        plugins: PLUGINS,
        defaultTimedEventDuration: '05:00',
        locale: esLocale
      })

      // hacky way to have a duration parsed
      let timedDuration = toDuration(calendar.defaultTimedEventDuration, calendar)

      expect(timedDuration.locale).toBe('es')
    })

  })

  describe('date formatting', function() {

    it('produces event time text', function() {
      initCalendar({
        defaultView: 'dayGridMonth',
        now: '2018-09-06',
        displayEventEnd: false,
        eventTimeFormat: 'HH:mm:ss\'abc\'',
        events: [
          { title: 'my event', start: '2018-09-06T13:30:20' }
        ]
      })
      expect(getEventElTimeText(getSingleEl())).toBe('13:30:20abc')
    })

  })

  describe('range formatting', function() {

    it('renders with same month', function() {
      let calendar = new Calendar(document.createElement('div'), {
        plugins: PLUGINS
      })
      let s

      s = calendar.formatRange('2018-09-03', '2018-09-05', 'MMMM {d}, yyyy \'asdf\'')
      expect(s).toEqual('September 3 - 5, 2018 asdf')

      s = calendar.formatRange('2018-09-03', '2018-09-05', '{d} MMMM, yyyy \'asdf\'')
      expect(s).toEqual('3 - 5 September, 2018 asdf')
    })

    it('renders with same year but different month', function() {
      let calendar = new Calendar(document.createElement('div'), {
        plugins: PLUGINS
      })
      let s

      s = calendar.formatRange('2018-09-03', '2018-10-05', '{MMMM {d}}, yyyy \'asdf\'')
      expect(s).toEqual('September 3 - October 5, 2018 asdf')

      s = calendar.formatRange('2018-09-03', '2018-10-05', '{{d} MMMM}, yyyy \'asdf\'')
      expect(s).toEqual('3 September - 5 October, 2018 asdf')
    })

    it('renders with different years', function() {
      let calendar = new Calendar(document.createElement('div'), {
        plugins: PLUGINS
      })
      let s

      s = calendar.formatRange('2018-09-03', '2019-10-05', '{MMMM {d}}, yyyy \'asdf\'')
      expect(s).toEqual('September 3, 2018 asdf - October 5, 2019 asdf')

      s = calendar.formatRange('2018-09-03', '2019-10-05', '{{d} MMMM}, yyyy \'asdf\'')
      expect(s).toEqual('3 September, 2018 asdf - 5 October, 2019 asdf')
    })

    it('renders the same if same day', function() {
      let calendar = new Calendar(document.createElement('div'), {
        plugins: PLUGINS
      })
      let s

      s = calendar.formatRange('2018-09-03T00:00:00', '2018-09-03T23:59:59', 'MMMM d yyyy')
      expect(s).toEqual('September 3 2018')
    })

    it('inherits defaultRangeSeparator', function() {
      let calendar = new Calendar(document.createElement('div'), {
        plugins: PLUGINS,
        defaultRangeSeparator: ' to '
      })
      let s = calendar.formatRange('2018-09-03', '2018-09-05', 'MMMM d, yyyy \'asdf\'')
      expect(s).toEqual('September 3, 2018 asdf to September 5, 2018 asdf')
    })

    it('produces title with titleRangeSeparator', function() {
      initCalendar({ // need to render the calendar to get view.title :(
        plugins: PLUGINS,
        defaultView: 'dayGridWeek',
        now: '2018-09-06',
        titleFormat: 'MMMM {d} yy \'yup\'',
        titleRangeSeparator: ' to '
      })
      expect(currentCalendar.view.title).toBe('September 2 to 8 18 yup')
    })

  })

})
