import { strictModeFactor, vdomExtraRenders } from 'fullcalendar/protected-api'
import classicThemePlugin from 'fullcalendar/themes/classic' // need both
import themeForTestsPlugin from '../lib/theme-for-tests' // "
import dayGridPlugin from 'fullcalendar/daygrid'
import rrulePlugin from '@fullcalendar/rrule'
import { parseUtcDate, parseLocalDate } from '../lib/date-parsing'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { waitTimeout } from '../lib/misc'

describe('rrule plugin', () => {
  pushOptions({
    plugins: [classicThemePlugin, themeForTestsPlugin, rrulePlugin, dayGridPlugin],
    initialView: 'dayGridMonth',
    now: '2018-09-07',
    timeZone: 'UTC',
  })

  it('expands events when given an rrule object', () => {
    let calendar = initCalendar({
      events: [
        {
          rrule: {
            dtstart: '2018-09-04T13:00:00',
            freq: 'weekly',
          },
        },
      ],
    })
    let events = getSortedEvents(calendar)
    expect(events.length).toBe(5)
    expect(events[0].start).toEqualDate('2018-09-04T13:00:00Z')
    expect(events[0].end).toBe(null)
    expect(events[1].start).toEqualDate('2018-09-11T13:00:00Z')
    expect(events[2].start).toEqualDate('2018-09-18T13:00:00Z')
    expect(events[3].start).toEqualDate('2018-09-25T13:00:00Z')
    expect(events[4].start).toEqualDate('2018-10-02T13:00:00Z')
  })

  it('can expand monthly recurrence when given an rrule object', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      now: '2018-12-25T12:00:00',
      events: [{
        rrule: {
          dtstart: '2018-11-01',
          freq: 'monthly',
          count: 13,
          bymonthday: [13],
        },
      }],
    })

    let events = calendar.getEvents()
    expect(events.length).toBe(1)
    expect(events[0].start).toEqualDate('2018-12-13')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6059
  it('can specify strings in byweekday', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2021-01-01',
      events: [{
        allDay: true,
        rrule: {
          freq: 'weekly',
          byweekday: ['mo', 'tu'],
          dtstart: '2021-01-01',
        },
      }],
    })

    let events = calendar.getEvents()
    expect(events.length).toBe(10)
    expect(events[0].start).toEqualDate('2021-01-04')
  })

  it('can exclude a recurrence with exdate', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      now: '2020-12-01',
      events: [{
        rrule: {
          dtstart: '2020-12-01',
          freq: 'weekly',
        },
        exdate: '2020-12-08',
      }],
    })

    let events = calendar.getEvents()
    expect(events.length).toBe(5)
    expect(events[0].start).toEqualDate('2020-12-01')
    expect(events[1].start).toEqualDate('2020-12-15')
    expect(events[2].start).toEqualDate('2020-12-22')
    expect(events[3].start).toEqualDate('2020-12-29')
    expect(events[4].start).toEqualDate('2021-01-05')
  })

  it('can exclude multiple recurrences with exdate', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      now: '2020-12-01',
      events: [{
        rrule: {
          dtstart: '2020-12-01',
          freq: 'weekly',
        },
        exdate: ['2020-12-08', '2020-12-15'],
      }],
    })

    let events = calendar.getEvents()
    expect(events.length).toBe(4)
    expect(events[0].start).toEqualDate('2020-12-01')
    expect(events[1].start).toEqualDate('2020-12-22')
    expect(events[2].start).toEqualDate('2020-12-29')
    expect(events[3].start).toEqualDate('2021-01-05')
  })

  it('can exclude recurrences with an exrule', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      now: '2020-12-01',
      events: [{
        rrule: {
          dtstart: '2020-12-01',
          freq: 'weekly',
        },
        exrule: {
          dtstart: '2020-12-08',
          until: '2020-12-15', // will include this date for exclusion
          freq: 'weekly',
        },
      }],
    })

    let events = calendar.getEvents()
    expect(events.length).toBe(4)
    expect(events[0].start).toEqualDate('2020-12-01')
    expect(events[1].start).toEqualDate('2020-12-22')
    expect(events[2].start).toEqualDate('2020-12-29')
    expect(events[3].start).toEqualDate('2021-01-05')
  })

  it('can exclude recurrences with multiple exrules', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      now: '2020-12-01',
      events: [{
        rrule: {
          dtstart: '2020-12-01',
          freq: 'weekly',
        },
        exrule: [
          {
            dtstart: '2020-12-08',
            until: '2020-12-15', // will include this date for exclusion
            freq: 'weekly',
          },
          {
            dtstart: '2020-12-22',
            until: '2020-12-29', // will include this date for exclusion
            freq: 'weekly',
          },
        ],
      }],
    })

    let events = calendar.getEvents()
    expect(events.length).toBe(2)
    expect(events[0].start).toEqualDate('2020-12-01')
    expect(events[1].start).toEqualDate('2021-01-05')
  })

  it('expands events until a date', () => {
    let calendar = initCalendar({
      events: [
        {
          rrule: {
            dtstart: '2018-09-04T13:00:00',
            until: '2018-10-01',
            freq: 'weekly',
          },
        },
      ],
    })
    let events = getSortedEvents(calendar)
    expect(events.length).toBe(4)
    expect(events[0].start).toEqualDate('2018-09-04T13:00:00Z')
    expect(events[0].end).toBe(null)
    expect(events[1].start).toEqualDate('2018-09-11T13:00:00Z')
    expect(events[2].start).toEqualDate('2018-09-18T13:00:00Z')
    expect(events[3].start).toEqualDate('2018-09-25T13:00:00Z')
  })

  it('expands a range that starts exactly at the current view\'s start', () => {
    let calendar = initCalendar({
      initialDate: '2019-04-02',
      initialView: 'dayGridDay',
      events: [
        {
          title: 'event with everyday with range',
          allDay: true,
          rrule: {
            freq: 'daily',
            dtstart: '2019-04-02',
            until: '2019-04-09',
          },
        },
      ],
    })
    let events = getSortedEvents(calendar)
    expect(events.length).toBeGreaterThanOrEqual(1)
    expect(events[0].start).toEqualDate('2019-04-02')
  })

  it('expands events with a duration', () => {
    let calendar = initCalendar({
      events: [
        {
          rrule: {
            dtstart: '2018-09-04T13:00:00',
            freq: 'weekly',
          },
          duration: '03:00',
        },
      ],
    })
    let events = getSortedEvents(calendar)
    expect(events.length).toBe(5)
    expect(events[0].start).toEqualDate('2018-09-04T13:00:00Z')
    expect(events[0].end).toEqualDate('2018-09-04T16:00:00Z')
  })

  it('expands events with guessed allDay', () => {
    let calendar = initCalendar({
      events: [
        {
          rrule: {
            dtstart: '2018-09-04',
            freq: 'weekly',
          },
        },
      ],
    })
    let events = getSortedEvents(calendar)
    expect(events.length).toBe(5)
    expect(events[0].start).toEqualDate('2018-09-04')
    expect(events[0].end).toBe(null)
    expect(events[0].allDay).toBe(true)
  })

  it('inherits defaultAllDay from source', () => {
    let calendar = initCalendar({
      defaultAllDay: false,
      events: [
        {
          rrule: {
            dtstart: parseUtcDate('2018-09-04'), // no allDay info
            freq: 'weekly',
          },
        },
      ],
    })
    let events = getSortedEvents(calendar)
    expect(events.length).toBe(5)
    expect(events[0].start).toEqualDate('2018-09-04')
    expect(events[0].end).toBe(null)
    expect(events[0].allDay).toBe(false)
  })

  it('inherits defaultAllDay from source setting', () => {
    let calendar = initCalendar({
      eventSources: [{
        defaultAllDay: false,
        events: [
          {
            rrule: {
              dtstart: parseUtcDate('2018-09-04'), // no allDay info
              freq: 'weekly',
            },
          },
        ],
      }],
    })
    let events = getSortedEvents(calendar)
    expect(events.length).toBe(5)
    expect(events[0].start).toEqualDate('2018-09-04')
    expect(events[0].end).toBe(null)
    expect(events[0].allDay).toBe(false)
  })

  it('can generate local dates when given an rrule object', () => {
    let calendar = initCalendar({
      timeZone: 'local',
      events: [
        {
          rrule: {
            dtstart: parseLocalDate('2018-09-04T05:00:00').toISOString(),
            freq: 'weekly',
          },
        },
      ],
    })
    let events = getSortedEvents(calendar)
    expect(events.length).toBe(5)
    expect(events[0].start).toEqualLocalDate('2018-09-04T05:00:00')
    expect(events[0].end).toBe(null)
    expect(events[0].allDay).toBe(false)
  })

  describe('when given an rrule string', () => {
    it('expands', () => {
      let calendar = initCalendar({
        events: [
          {
            rrule:
              'DTSTART:20180904T130000\n' +
              'RRULE:FREQ=WEEKLY',
          },
        ],
      })

      let events = getSortedEvents(calendar)
      expect(events.length).toBe(5)
      expect(events[0].start).toEqualDate('2018-09-04T13:00:00Z')
      expect(events[0].end).toBe(null)
      expect(events[1].start).toEqualDate('2018-09-11T13:00:00Z')
      expect(events[2].start).toEqualDate('2018-09-18T13:00:00Z')
      expect(events[3].start).toEqualDate('2018-09-25T13:00:00Z')
      expect(events[4].start).toEqualDate('2018-10-02T13:00:00Z')
    })

    // https://github.com/fullcalendar/fullcalendar/issues/6126
    it('expands correctly with UNTIL followed by newline', () => {
      let calendar = initCalendar({
        events: [
          {
            rrule:
              'DTSTART:20180904T130000\n' +
              'RRULE:FREQ=WEEKLY;UNTIL=20180925T130000\n' +
              'RDATE:20180904T130000',
          },
        ],
      })

      let events = getSortedEvents(calendar)
      expect(events.length).toBe(4)
    })

    it('respects allDay', () => {
      let calendar = initCalendar({
        events: [
          {
            allDay: true,
            rrule: 'DTSTART:20180904T130000\nRRULE:FREQ=WEEKLY',
          },
        ],
      })

      let events = getSortedEvents(calendar)
      expect(events[0].start).toEqualDate('2018-09-04') // should round down
      expect(events[0].allDay).toBe(true)
      expect(events[0].extendedProps).toEqual({}) // didnt accumulate allDay or rrule props
    })

    it('can expand monthly recurrence in UTC', () => {
      let calendar = initCalendar({
        initialView: 'dayGridMonth',
        now: '2018-12-25T12:00:00',
        timeZone: 'UTC',
        events: [{
          rrule: 'DTSTART:20181101\nRRULE:FREQ=MONTHLY;COUNT=13;BYMONTHDAY=13',
        }],
      })

      let events = calendar.getEvents()
      expect(events.length).toBe(1)
      expect(events[0].start).toEqualDate('2018-12-13')
    })

    it('can expand monthly recurrence in local timeZone', () => {
      let calendar = initCalendar({
        initialView: 'dayGridMonth',
        now: '2018-12-25T12:00:00',
        timeZone: 'local',
        events: [{
          rrule: 'DTSTART:20181101\nRRULE:FREQ=MONTHLY;COUNT=13;BYMONTHDAY=13',
        }],
      })

      let events = calendar.getEvents()
      expect(events.length).toBe(1)
      expect(events[0].start).toEqualLocalDate('2018-12-13')
    })

    it('can expand weekly timed recurrence in local timeZone', () => {
      let calendar = initCalendar({
        initialView: 'dayGridMonth',
        now: '2018-12-25T12:00:00',
        timeZone: 'local',
        events: [{
          rrule: 'DTSTART:20181201T000000\nRRULE:FREQ=WEEKLY',
        }],
      })

      let events = calendar.getEvents()
      expect(events.length).toBe(6)
      expect(events[0].start).toEqualLocalDate('2018-12-01')
    })

    it('can expand weekly UTC-timed recurrence in local timeZone', () => {
      let calendar = initCalendar({
        initialView: 'dayGridMonth',
        now: '2018-12-25T12:00:00',
        timeZone: 'local',
        events: [{
          rrule: 'DTSTART:20181201T000000Z\nRRULE:FREQ=WEEKLY',
        }],
      })

      let events = calendar.getEvents()
      expect(events.length).toBe(6)
      expect(events[0].start).toEqualDate('2018-12-01')
    })

    it('can expand weekly UTC-timed recurrence in local timeZone, with exclusion', () => {
      let calendar = initCalendar({
        initialView: 'dayGridMonth',
        now: '2018-12-25T12:00:00',
        timeZone: 'local',
        events: [{
          rrule: 'DTSTART:20181201T000000Z\nRRULE:FREQ=WEEKLY\nEXDATE:20181208T000000Z',
        }],
      })

      let events = calendar.getEvents()
      expect(events.length).toBe(5)
      expect(events[0].start).toEqualDate('2018-12-01')
    })

    it('can generate local dates', () => {
      let localStart = buildLocalRRuleDateStr('2018-09-04T05:00:00')

      let calendar = initCalendar({
        timeZone: 'local',
        events: [
          {
            rrule: `DTSTART:${localStart}\nRRULE:FREQ=WEEKLY`,
          },
        ],
      })

      let events = getSortedEvents(calendar)
      expect(events.length).toBe(5)
      expect(events[0].start).toEqualLocalDate('2018-09-04T05:00:00')
      expect(events[0].end).toBe(null)
      expect(events[0].allDay).toBe(false)
    })

    it('can generate local dates, including EXDATE', () => {
      let localStart = buildLocalRRuleDateStr('2018-09-04T05:00:00')
      let localExdate = buildLocalRRuleDateStr('2018-09-05T05:00:00')

      let calendar = initCalendar({
        timeZone: 'local',
        events: [
          {
            rrule: `DTSTART:${localStart}\nRRULE:FREQ=WEEKLY\nEXDATE:${localExdate}`,
          },
        ],
      })
      let events = getSortedEvents(calendar)
      expect(events.length).toBe(5)
      expect(events[0].start).toEqualLocalDate('2018-09-04T05:00:00')
      expect(events[0].end).toBe(null)
      expect(events[0].allDay).toBe(false)
    })

    // https://github.com/fullcalendar/fullcalendar/issues/5726
    it('can generate local dates, including EXDATE, when BYDAY and TZ shifting', () => {
      let calendar = initCalendar({
        timeZone: 'local',
        initialDate: '2020-09-10',
        events: [
          {
            rrule: 'DTSTART:20200915T030000Z\nRRULE:FREQ=WEEKLY;BYDAY=SA\nEXDATE:20201003T030000Z',
          },
        ],
      })
      let events = getSortedEvents(calendar)
      expect(events.length).toBe(3)
      expect(events[0].start).toEqualDate('2020-09-19T03:00:00')
      expect(events[1].start).toEqualDate('2020-09-26T03:00:00')
      expect(events[2].start).toEqualDate('2020-10-10T03:00:00')
    })

    // https://github.com/fullcalendar/fullcalendar/issues/5993
    it('won\'t accidentally clip dates when calendar has non-UTC timezone', () => {
      let calendar = initCalendar({
        plugins: [classicThemePlugin, themeForTestsPlugin, rrulePlugin, dayGridPlugin],
        initialDate: '2020-11-01',
        timeZone: 'Asia/Manila',
        events: [
          {
            duration: '01:00',
            rrule: {
              freq: 'daily',
              dtstart: '2020-10-24T16:00:00Z', // will be 00:00 in Manila
            },
          },
        ],
      })

      let events = calendar.getEvents()
      expect(events[0].start).toEqualDate(calendar.view.activeStart)
    })

    // https://github.com/fullcalendar/fullcalendar/issues/7230
    it('updating the rrule dynamically renders correct number of events', () => {
      const recurringEventDef = {
        id: '4',
        groupId: '4',
        allDay: true,
        rrule: {
          freq: 'weekly',
          dtstart: '2023-03-10',
        },
      }

      let calendar = initCalendar({
        plugins: [classicThemePlugin, themeForTestsPlugin, rrulePlugin, dayGridPlugin],
        initialDate: '2023-03-10',
        initialView: 'dayGridMonth',
        events: [recurringEventDef],
      })

      const dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
      expect(dayGridWrapper.getEventEls().length).toBe(5)

      calendar.next()
      expect(dayGridWrapper.getEventEls().length).toBe(6)

      calendar.resetOptions({
        events: [{
          ...recurringEventDef,
          duration: { days: 2 },
        }],
      }, ['events'])
      expect(dayGridWrapper.getEventEls().length).toBe(6)
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5273
  it('updates rrule timed events when timeZone changes', async () => {
    const timeTexts = []

    const calendar = initCalendar({
      plugins: [classicThemePlugin, themeForTestsPlugin, rrulePlugin, dayGridPlugin],
      timeZone: 'America/New_York',
      initialDate: '2023-02-10',
      initialView: 'dayGridMonth',
      events: [{
        id: '4',
        groupId: '4',
        allDay: false,
        rrule: {
          freq: 'weekly',
          dtstart: '2023-02-10T12:00:00', // assumed to be America/New_York
          until: '2023-02-11', // only one instance
        },
      }],
      eventContent(info) {
        timeTexts.push(info.timeText)
        return true
      },
    })
    await waitTimeout()

    let events = calendar.getEvents()
    expect(events[0].allDay).toBe(false)
    expect(events[0].start).toEqualDate('2023-02-10T17:00:00Z')
    expect(timeTexts.length).toBe(1 * strictModeFactor)
    expect(timeTexts[0 * strictModeFactor]).toBe('12p')

    calendar.setOption('timeZone', 'America/Chicago')
    await waitTimeout()
    events = calendar.getEvents()
    expect(events[0].allDay).toBe(false)
    expect(events[0].start).toEqualDate('2023-02-10T17:00:00Z')
    expect(timeTexts.length).toBe(2 * strictModeFactor + vdomExtraRenders)
    expect(timeTexts[1 * strictModeFactor + vdomExtraRenders]).toBe('11a')

    // ensure bug doesn't occur when refetching (this happened)
    calendar.next()
    await waitTimeout()
    calendar.prev()
    await waitTimeout()
    events = calendar.getEvents()
    expect(events[0].allDay).toBe(false)
    expect(events[0].start).toEqualDate('2023-02-10T17:00:00Z')
    expect(timeTexts.length).toBe(3 * strictModeFactor + vdomExtraRenders)
    expect(timeTexts[1 * strictModeFactor + vdomExtraRenders]).toBe('11a')
  })

  // utils

  function buildLocalRRuleDateStr(inputStr) { // produces strings like '20200101123030'
    return parseLocalDate(inputStr).toISOString().replace('.000', '').replace(/[-:]/g, '')
  }

  function getSortedEvents(calendar) {
    let events = calendar.getEvents()

    events.sort((eventA, eventB) => eventA.start.valueOf() - eventB.start.valueOf())

    return events
  }
})
