import dayGridPlugin from '@fullcalendar/daygrid'
import rrulePlugin from '@fullcalendar/rrule'
import { parseUtcDate, parseLocalDate } from '../lib/date-parsing'

describe('rrule plugin', function() {
  pushOptions({
    plugins: [ rrulePlugin, dayGridPlugin ],
    initialView: 'dayGridMonth',
    now: '2018-09-07',
    timeZone: 'UTC'
  })

  it('expands events when given an rrule object', function() {
    initCalendar({
      events: [
        {
          rrule: {
            dtstart: '2018-09-04T13:00:00',
            freq: 'weekly'
          }
        }
      ]
    })
    let events = getSortedEvents()
    expect(events.length).toBe(5)
    expect(events[0].start).toEqualDate('2018-09-04T13:00:00Z')
    expect(events[0].end).toBe(null)
    expect(events[1].start).toEqualDate('2018-09-11T13:00:00Z')
    expect(events[2].start).toEqualDate('2018-09-18T13:00:00Z')
    expect(events[3].start).toEqualDate('2018-09-25T13:00:00Z')
    expect(events[4].start).toEqualDate('2018-10-02T13:00:00Z')
  })

  it('can expand monthly recurrence when given an rrule object', function() {
    initCalendar({
      initialView: 'dayGridMonth',
      now: '2018-12-25T12:00:00',
      events: [ {
        rrule: {
          dtstart: '2018-11-01',
          freq: 'monthly',
          count: 13,
          bymonthday: [ 13 ]
        }
      } ]
    })

    let events = currentCalendar.getEvents()
    expect(events.length).toBe(1)
    expect(events[0].start).toEqualDate('2018-12-13')
  })

  it('expands events until a date', function() {
    initCalendar({
      events: [
        {
          rrule: {
            dtstart: '2018-09-04T13:00:00',
            until: '2018-10-01',
            freq: 'weekly'
          }
        }
      ]
    })
    let events = getSortedEvents()
    expect(events.length).toBe(4)
    expect(events[0].start).toEqualDate('2018-09-04T13:00:00Z')
    expect(events[0].end).toBe(null)
    expect(events[1].start).toEqualDate('2018-09-11T13:00:00Z')
    expect(events[2].start).toEqualDate('2018-09-18T13:00:00Z')
    expect(events[3].start).toEqualDate('2018-09-25T13:00:00Z')
  })

  it('expands a range that starts exactly at the current view\'s start', function() {
    initCalendar({
      initialDate: '2019-04-02',
      initialView: 'dayGridDay',
      events: [
        {
          title: 'event with everyday with range',
          allDay: true,
          rrule: {
            freq: 'daily',
            dtstart: '2019-04-02',
            until: '2019-04-09'
          }
        }
      ]
    })
    let events = getSortedEvents()
    expect(events.length).toBeGreaterThanOrEqual(1)
    expect(events[0].start).toEqualDate('2019-04-02')
  })

  it('expands events with a duration', function() {
    initCalendar({
      events: [
        {
          rrule: {
            dtstart: '2018-09-04T13:00:00',
            freq: 'weekly'
          },
          duration: '03:00'
        }
      ]
    })
    let events = getSortedEvents()
    expect(events.length).toBe(5)
    expect(events[0].start).toEqualDate('2018-09-04T13:00:00Z')
    expect(events[0].end).toEqualDate('2018-09-04T16:00:00Z')
  })

  it('expands events with guessed allDay', function() {
    initCalendar({
      events: [
        {
          rrule: {
            dtstart: '2018-09-04',
            freq: 'weekly'
          }
        }
      ]
    })
    let events = getSortedEvents()
    expect(events.length).toBe(5)
    expect(events[0].start).toEqualDate('2018-09-04')
    expect(events[0].end).toBe(null)
    expect(events[0].allDay).toBe(true)
  })

  it('inherits defaultAllDay from source', function() {
    initCalendar({
      defaultAllDay: false,
      events: [
        {
          rrule: {
            dtstart: parseUtcDate('2018-09-04'), // no allDay info
            freq: 'weekly'
          }
        }
      ]
    })
    let events = getSortedEvents()
    expect(events.length).toBe(5)
    expect(events[0].start).toEqualDate('2018-09-04')
    expect(events[0].end).toBe(null)
    expect(events[0].allDay).toBe(false)
  })

  it('inherits defaultAllDay from source setting', function() {
    initCalendar({
      eventSources: [ {
        defaultAllDay: false,
        events: [
          {
            rrule: {
              dtstart: parseUtcDate('2018-09-04'), // no allDay info
              freq: 'weekly'
            }
          }
        ]
      } ]
    })
    let events = getSortedEvents()
    expect(events.length).toBe(5)
    expect(events[0].start).toEqualDate('2018-09-04')
    expect(events[0].end).toBe(null)
    expect(events[0].allDay).toBe(false)
  })

  it('can generate local dates when given an rrule object', function() {
    initCalendar({
      timeZone: 'local',
      events: [
        {
          rrule: {
            dtstart: parseLocalDate('2018-09-04T05:00:00').toISOString(),
            freq: 'weekly'
          }
        }
      ]
    })
    let events = getSortedEvents()
    expect(events.length).toBe(5)
    expect(events[0].start).toEqualLocalDate('2018-09-04T05:00:00')
    expect(events[0].end).toBe(null)
    expect(events[0].allDay).toBe(false)
  })


  describe('when given an rrule string', function() {

    it('expands', function() {
      initCalendar({
        events: [
          {
            rrule: 'DTSTART:20180904T130000\nRRULE:FREQ=WEEKLY'
          }
        ]
      })

      let events = getSortedEvents()
      expect(events.length).toBe(5)
      expect(events[0].start).toEqualDate('2018-09-04T13:00:00Z')
      expect(events[0].end).toBe(null)
      expect(events[1].start).toEqualDate('2018-09-11T13:00:00Z')
      expect(events[2].start).toEqualDate('2018-09-18T13:00:00Z')
      expect(events[3].start).toEqualDate('2018-09-25T13:00:00Z')
      expect(events[4].start).toEqualDate('2018-10-02T13:00:00Z')
    })

    it('respects allDay', function() {
      initCalendar({
        events: [
          {
            allDay: true,
            rrule: 'DTSTART:20180904T130000\nRRULE:FREQ=WEEKLY'
          }
        ]
      })

      let events = getSortedEvents()
      expect(events[0].start).toEqualDate('2018-09-04') // should round down
      expect(events[0].allDay).toBe(true)
      expect(events[0].extendedProps).toEqual({}) // didnt accumulate allDay or rrule props
    })

    it('can expand monthly recurrence', function() {
      initCalendar({
        initialView: 'dayGridMonth',
        now: '2018-12-25T12:00:00',
        events: [ {
          rrule: 'DTSTART:20181101\nRRULE:FREQ=MONTHLY;COUNT=13;BYMONTHDAY=13'
        } ]
      })

      let events = currentCalendar.getEvents()
      expect(events.length).toBe(1)
      expect(events[0].start).toEqualDate('2018-12-13')
    })

    it('can generate local dates', function() {
      let localStart = buildLocalRRuleDateStr('2018-09-04T05:00:00')

      initCalendar({
        timeZone: 'local',
        events: [
          {
            rrule: `DTSTART:${localStart}\nRRULE:FREQ=WEEKLY`,
          }
        ]
      })

      let events = getSortedEvents()
      expect(events.length).toBe(5)
      expect(events[0].start).toEqualLocalDate('2018-09-04T05:00:00')
      expect(events[0].end).toBe(null)
      expect(events[0].allDay).toBe(false)
    })

    it('can generate local dates, including EXDATE', function() {
      let localStart = buildLocalRRuleDateStr('2018-09-04T05:00:00')
      let localExdate = buildLocalRRuleDateStr('2018-09-05T05:00:00')

      initCalendar({
        timeZone: 'local',
        events: [
          {
            rrule: `DTSTART:${localStart}\nRRULE:FREQ=WEEKLY\nEXDATE:${localExdate}`,
          }
        ]
      })
      let events = getSortedEvents()
      expect(events.length).toBe(5)
      expect(events[0].start).toEqualLocalDate('2018-09-04T05:00:00')
      expect(events[0].end).toBe(null)
      expect(events[0].allDay).toBe(false)
    })

  })


  // utils

  function buildLocalRRuleDateStr(inputStr) { // produces strings like '20200101123030'
    return parseLocalDate(inputStr).toISOString().replace('.000', '').replace(/[\-\:]/g, '')
  }

  function getSortedEvents() {
    let events = currentCalendar.getEvents()

    events.sort(function(eventA, eventB) {
      return eventA.start.valueOf() - eventB.start.valueOf()
    })

    return events
  }

})
