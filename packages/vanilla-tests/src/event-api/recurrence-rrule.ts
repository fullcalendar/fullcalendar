import { describe, expect, it } from 'vitest'
import { Calendar, CalendarOptions } from 'fullcalendar'
import rrulePlugin from '@fullcalendar/rrule'
import { initCalendar } from '../lib/calendar'
import { getLeafTexts } from '../lib/intl'
import { getEventEls } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

/*
The rrule plugin's expansion of recurring events into the visible range.
The browser runs in America/New_York, which the `local` cases depend on.
*/
describe('rrule plugin', () => {
  async function initRRuleCalendar(options: CalendarOptions): Promise<Calendar> {
    const calendar = initCalendar({
      plugins: [rrulePlugin],
      initialView: 'dayGridMonth',
      now: '2018-09-07', // the September 2018 view shows 2018-08-26 to 2018-10-07
      timeZone: 'UTC',
      ...options,
    })
    await waitForSettle()
    return calendar
  }

  function getSortedStarts(calendar: Calendar): string[] {
    return calendar.getEvents().map((event) => event.start!.toISOString()).sort()
  }

  // a date-time string in the browser's time zone, as an ISO string in UTC
  function localIso(str: string): string {
    return new Date(str).toISOString()
  }

  // a date-time string in the browser's time zone, in rrule's basic format (ex: '20180904T090000Z')
  function localRRuleDateStr(str: string): string {
    return localIso(str).replace('.000', '').replace(/[-:]/g, '')
  }

  describe('when given an rrule object', () => {
    it('expands timed events', async () => {
      const calendar = await initRRuleCalendar({
        events: [{ rrule: { dtstart: '2018-09-04T13:00:00', freq: 'weekly' } }],
      })

      expect(getSortedStarts(calendar)).toEqual([
        '2018-09-04T13:00:00.000Z',
        '2018-09-11T13:00:00.000Z',
        '2018-09-18T13:00:00.000Z',
        '2018-09-25T13:00:00.000Z',
        '2018-10-02T13:00:00.000Z',
      ])
      expect(calendar.getEvents()[0].end).toBe(null)
    })

    it('expands monthly recurrence', async () => {
      const calendar = await initRRuleCalendar({
        now: '2018-12-25T12:00:00',
        events: [{ rrule: { dtstart: '2018-11-01', freq: 'monthly', count: 13, bymonthday: [13] } }],
      })

      expect(getSortedStarts(calendar)).toEqual(['2018-12-13T00:00:00.000Z'])
    })

    // https://github.com/fullcalendar/fullcalendar/issues/6059
    it('accepts strings in byweekday', async () => {
      const calendar = await initRRuleCalendar({
        initialDate: '2021-01-01',
        events: [{ allDay: true, rrule: { freq: 'weekly', byweekday: ['mo', 'tu'], dtstart: '2021-01-01' } }],
      })

      const starts = getSortedStarts(calendar)
      expect(starts.length).toBe(10)
      expect(starts[0]).toBe('2021-01-04T00:00:00.000Z') // monday
      expect(starts[1]).toBe('2021-01-05T00:00:00.000Z') // tuesday
    })

    it.each([
      ['an exdate', { exdate: '2020-12-08' }, [
        '2020-12-01', '2020-12-15', '2020-12-22', '2020-12-29', '2021-01-05',
      ]],
      ['multiple exdates', { exdate: ['2020-12-08', '2020-12-15'] }, [
        '2020-12-01', '2020-12-22', '2020-12-29', '2021-01-05',
      ]],
      ['an exrule', { exrule: { dtstart: '2020-12-08', until: '2020-12-15', freq: 'weekly' } }, [
        '2020-12-01', '2020-12-22', '2020-12-29', '2021-01-05',
      ]],
      ['multiple exrules', {
        exrule: [
          { dtstart: '2020-12-08', until: '2020-12-15', freq: 'weekly' },
          { dtstart: '2020-12-22', until: '2020-12-29', freq: 'weekly' },
        ],
      }, [
        '2020-12-01', '2021-01-05',
      ]],
    ])('excludes recurrences with %s', async (_desc, exclusion, expectedDates) => {
      const calendar = await initRRuleCalendar({
        now: '2020-12-01',
        events: [{ rrule: { dtstart: '2020-12-01', freq: 'weekly' }, ...exclusion }],
      })

      expect(getSortedStarts(calendar)).toEqual(expectedDates.map((date) => `${date}T00:00:00.000Z`))
    })

    it('expands events until a date', async () => {
      const calendar = await initRRuleCalendar({
        events: [{ rrule: { dtstart: '2018-09-04T13:00:00', until: '2018-10-01', freq: 'weekly' } }],
      })

      expect(getSortedStarts(calendar)).toEqual([
        '2018-09-04T13:00:00.000Z',
        '2018-09-11T13:00:00.000Z',
        '2018-09-18T13:00:00.000Z',
        '2018-09-25T13:00:00.000Z',
      ])
    })

    it('expands a recurrence that starts exactly at the view\'s start', async () => {
      const calendar = await initRRuleCalendar({
        initialDate: '2019-04-02',
        initialView: 'dayGridDay',
        events: [{ allDay: true, rrule: { freq: 'daily', dtstart: '2019-04-02', until: '2019-04-09' } }],
      })

      // the expanded range extends past the view's end, so only check the first
      expect(getSortedStarts(calendar)[0]).toBe('2019-04-02T00:00:00.000Z')
    })

    it('applies a duration', async () => {
      const calendar = await initRRuleCalendar({
        events: [{ rrule: { dtstart: '2018-09-04T13:00:00', freq: 'weekly' }, duration: '03:00' }],
      })

      const events = calendar.getEvents()
      expect(events.length).toBe(5)
      expect(events[0].start!.toISOString()).toBe('2018-09-04T13:00:00.000Z')
      expect(events[0].end!.toISOString()).toBe('2018-09-04T16:00:00.000Z')
    })

    it('guesses allDay from a dtstart without a time', async () => {
      const calendar = await initRRuleCalendar({
        events: [{ rrule: { dtstart: '2018-09-04', freq: 'weekly' } }],
      })

      const events = calendar.getEvents()
      expect(events.length).toBe(5)
      expect(events[0].start!.toISOString()).toBe('2018-09-04T00:00:00.000Z')
      expect(events[0].end).toBe(null)
      expect(events[0].allDay).toBe(true)
    })

    it.each([
      ['the calendar', { defaultAllDay: false, events: [{ rrule: { dtstart: new Date(Date.UTC(2018, 8, 4)), freq: 'weekly' } }] }],
      ['the event source', {
        eventSources: [{
          defaultAllDay: false,
          events: [{ rrule: { dtstart: new Date(Date.UTC(2018, 8, 4)), freq: 'weekly' } }],
        }],
      }],
    ])('inherits defaultAllDay from %s when dtstart is a Date', async (_desc, options) => {
      const calendar = await initRRuleCalendar(options)

      const events = calendar.getEvents()
      expect(events.length).toBe(5)
      expect(events[0].start!.toISOString()).toBe('2018-09-04T00:00:00.000Z')
      expect(events[0].end).toBe(null)
      expect(events[0].allDay).toBe(false)
    })

    it('generates local dates', async () => {
      const calendar = await initRRuleCalendar({
        timeZone: 'local',
        events: [{ rrule: { dtstart: localIso('2018-09-04T05:00:00'), freq: 'weekly' } }],
      })

      const events = calendar.getEvents()
      expect(events.length).toBe(5)
      expect(events[0].start!.toISOString()).toBe(localIso('2018-09-04T05:00:00'))
      expect(events[0].end).toBe(null)
      expect(events[0].allDay).toBe(false)
    })

    // https://github.com/fullcalendar/fullcalendar/issues/5993
    it('doesn\'t clip the first recurrence when the calendar has a non-UTC time zone', async () => {
      const calendar = await initRRuleCalendar({
        initialDate: '2020-11-01',
        timeZone: 'Asia/Manila',
        events: [{
          duration: '01:00',
          rrule: { freq: 'daily', dtstart: '2020-10-24T16:00:00Z' }, // 00:00 in Manila
        }],
      })

      expect(getSortedStarts(calendar)[0]).toBe(calendar.view.activeStart.toISOString())
    })
  })

  describe('when given an rrule string', () => {
    it('expands', async () => {
      const calendar = await initRRuleCalendar({
        events: [{ rrule: 'DTSTART:20180904T130000\nRRULE:FREQ=WEEKLY' }],
      })

      expect(getSortedStarts(calendar)).toEqual([
        '2018-09-04T13:00:00.000Z',
        '2018-09-11T13:00:00.000Z',
        '2018-09-18T13:00:00.000Z',
        '2018-09-25T13:00:00.000Z',
        '2018-10-02T13:00:00.000Z',
      ])
      expect(calendar.getEvents()[0].end).toBe(null)
    })

    // https://github.com/fullcalendar/fullcalendar/issues/6126
    it('expands correctly with UNTIL followed by a newline', async () => {
      const calendar = await initRRuleCalendar({
        events: [{
          rrule: 'DTSTART:20180904T130000\nRRULE:FREQ=WEEKLY;UNTIL=20180925T130000\nRDATE:20180904T130000',
        }],
      })

      expect(getSortedStarts(calendar)).toEqual([
        '2018-09-04T13:00:00.000Z',
        '2018-09-11T13:00:00.000Z',
        '2018-09-18T13:00:00.000Z',
        '2018-09-25T13:00:00.000Z',
      ])
    })

    it('respects allDay', async () => {
      const calendar = await initRRuleCalendar({
        events: [{ allDay: true, rrule: 'DTSTART:20180904T130000\nRRULE:FREQ=WEEKLY' }],
      })

      const event = calendar.getEvents()[0]
      expect(event.start!.toISOString()).toBe('2018-09-04T00:00:00.000Z') // rounded down
      expect(event.allDay).toBe(true)
      expect(event.extendedProps).toEqual({}) // didn't accumulate the allDay or rrule props
    })

    it.each([
      ['UTC', '2018-12-13T00:00:00.000Z'],
      ['local', localIso('2018-12-13T00:00:00')],
    ])('expands monthly recurrence in the %s time zone', async (timeZone, expectedStart) => {
      const calendar = await initRRuleCalendar({
        now: '2018-12-25T12:00:00',
        timeZone,
        events: [{ rrule: 'DTSTART:20181101\nRRULE:FREQ=MONTHLY;COUNT=13;BYMONTHDAY=13' }],
      })

      expect(getSortedStarts(calendar)).toEqual([expectedStart])
    })

    it.each([
      ['a zoneless', 'DTSTART:20181201T000000\nRRULE:FREQ=WEEKLY', 6, localIso('2018-12-01T00:00:00')],
      ['a UTC', 'DTSTART:20181201T000000Z\nRRULE:FREQ=WEEKLY', 6, '2018-12-01T00:00:00.000Z'],
      ['a UTC, with exclusion,', 'DTSTART:20181201T000000Z\nRRULE:FREQ=WEEKLY\nEXDATE:20181208T000000Z', 5, '2018-12-01T00:00:00.000Z'],
    ])('expands weekly recurrence from %s DTSTART in the local time zone', async (_desc, rrule, count, firstStart) => {
      const calendar = await initRRuleCalendar({
        now: '2018-12-25T12:00:00',
        timeZone: 'local',
        events: [{ rrule }],
      })

      const starts = getSortedStarts(calendar)
      expect(starts.length).toBe(count)
      expect(starts[0]).toBe(firstStart)
    })

    it('generates local dates, including EXDATE', async () => {
      const localStart = localRRuleDateStr('2018-09-04T05:00:00')
      const localExdate = localRRuleDateStr('2018-09-11T05:00:00')
      const calendar = await initRRuleCalendar({
        timeZone: 'local',
        events: [{ rrule: `DTSTART:${localStart}\nRRULE:FREQ=WEEKLY\nEXDATE:${localExdate}` }],
      })

      expect(getSortedStarts(calendar)).toEqual([
        localIso('2018-09-04T05:00:00'),
        localIso('2018-09-18T05:00:00'),
        localIso('2018-09-25T05:00:00'),
        localIso('2018-10-02T05:00:00'),
      ])
      expect(calendar.getEvents()[0].allDay).toBe(false)
    })

    // https://github.com/fullcalendar/fullcalendar/issues/5726
    it('generates local dates, including EXDATE, when BYDAY and the time zone shifts the day', async () => {
      const calendar = await initRRuleCalendar({
        timeZone: 'local',
        initialDate: '2020-09-10',
        events: [{ rrule: 'DTSTART:20200915T030000Z\nRRULE:FREQ=WEEKLY;BYDAY=SA\nEXDATE:20201003T030000Z' }],
      })

      expect(getSortedStarts(calendar)).toEqual([
        '2020-09-19T03:00:00.000Z',
        '2020-09-26T03:00:00.000Z',
        '2020-10-10T03:00:00.000Z',
      ])
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/7230
  it('renders the right number of events after the rrule event is replaced', async () => {
    const recurringEvent = {
      id: '4',
      groupId: '4',
      allDay: true,
      rrule: { freq: 'weekly', dtstart: '2023-03-10' },
    }
    const calendar = await initRRuleCalendar({
      initialDate: '2023-03-10',
      events: [recurringEvent],
    })
    expect(getEventEls(calendar.el).length).toBe(5) // fridays 03-10 to 04-07

    calendar.next()
    await waitForSettle()
    expect(getEventEls(calendar.el).length).toBe(6) // fridays 03-31 to 05-05

    calendar.resetOptions({
      events: [{ ...recurringEvent, duration: { days: 2 } }],
    }, ['events'])
    await waitForSettle()
    expect(getEventEls(calendar.el).length).toBe(6) // friday-saturday, so no segment wraps a week
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5273
  it('re-renders timed recurrences when timeZone changes, including after refetching', async () => {
    const calendar = await initRRuleCalendar({
      timeZone: 'America/New_York',
      initialDate: '2023-02-10',
      events: [{
        id: '4',
        title: 'event',
        allDay: false,
        rrule: {
          freq: 'weekly',
          dtstart: '2023-02-10T12:00:00', // in the calendar's time zone
          until: '2023-02-11', // only one instance
        },
      }],
    })
    const expectInstance = (timeText: string) => {
      const events = calendar.getEvents()
      expect(events.length).toBe(1)
      expect(events[0].allDay).toBe(false)
      expect(events[0].start!.toISOString()).toBe('2023-02-10T17:00:00.000Z')
      expect(getLeafTexts(getEventEls(calendar.el, '4')[0])).toEqual([timeText, 'event'])
    }

    expectInstance('12p')

    calendar.setOption('timeZone', 'America/Chicago')
    await waitForSettle()
    expectInstance('11a')

    calendar.next()
    await waitForSettle()
    calendar.prev()
    await waitForSettle()
    expectInstance('11a')
  })
})
