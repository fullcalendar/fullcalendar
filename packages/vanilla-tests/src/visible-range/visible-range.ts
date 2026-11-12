import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { waitForSettle } from '../lib/settle'
import { getActiveRange } from '../lib/view-dates'

const DAY_MS = 86400000

describe('visibleRange', () => {
  describe('in a view with no fixed duration', () => {
    const options = { initialView: 'timeGrid' }

    it.each([
      ['Date objects', { start: new Date('2017-06-26T00:00:00Z'), end: new Date('2017-06-29T00:00:00Z') }],
      ['strings', { start: '2017-06-26', end: '2017-06-29' }],
      ['a function returning Date objects', () => ({ start: new Date('2017-06-26T00:00:00Z'), end: new Date('2017-06-29T00:00:00Z') })],
      ['a function returning strings', () => ({ start: '2017-06-26', end: '2017-06-29' })],
    ])('sets the range given %s', async (_desc, visibleRange) => {
      const calendar = initCalendar({ ...options, visibleRange })
      await waitForSettle()

      expect(getActiveRange(calendar)).toEqual(['2017-06-26', '2017-06-29'])
    })

    it.each([
      ['a custom view\'s option', { initialView: 'custom', views: { custom: { type: 'timeGrid', visibleRange: { start: '2017-06-26', end: '2017-06-29' } } } }],
      ['given with dateAlignment, which is ignored', { dateAlignment: 'week', visibleRange: { start: '2017-06-26', end: '2017-06-29' } }],
      ['a list view\'s option', { initialView: 'list', visibleRange: { start: '2017-06-26', end: '2017-06-29' } }],
    ])('sets the range as %s', async (_desc, extraOptions) => {
      const calendar = initCalendar({ ...options, ...extraOptions })
      await waitForSettle()

      expect(getActiveRange(calendar)).toEqual(['2017-06-26', '2017-06-29'])
    })

    it('can be set after init', async () => {
      const calendar = initCalendar({ initialView: 'dayGrid', initialDate: '2017-06-08' })
      await waitForSettle()
      expect(getActiveRange(calendar)).toEqual(['2017-06-08', '2017-06-09'])

      calendar.setOption('visibleRange', { start: '2017-06-26', end: '2017-06-29' })
      await waitForSettle()

      expect(getActiveRange(calendar)).toEqual(['2017-06-26', '2017-06-29'])
    })

    describe('as a function', () => {
      it.each([
        ['local', ['2017-06-08T12:30:00.000-04:00', '2017-06-07', '2017-06-10']],
        ['UTC', ['2017-06-08T12:30:00.000Z', '2017-06-07', '2017-06-10']],
      ] as const)('receives the initialDate and returns a range in the %s time zone', async (timeZone, [expectedDateIso, ...expectedRange]) => {
        const receivedDates: Date[] = []
        const calendar = initCalendar({
          ...options,
          timeZone: timeZone === 'local' ? 'local' : 'UTC',
          initialDate: '2017-06-08T12:30:00',
          visibleRange(date) {
            receivedDates.push(date)
            const dayStart = new Date(date)
            if (timeZone === 'local') {
              dayStart.setHours(0, 0, 0, 0)
            } else {
              dayStart.setUTCHours(0, 0, 0, 0)
            }
            // a day before and two days after. no DST change around these dates
            return {
              start: new Date(dayStart.valueOf() - DAY_MS),
              end: new Date(dayStart.valueOf() + DAY_MS * 2),
            }
          },
        })
        await waitForSettle()

        // it's also called for the prev/next ranges, so only one call needs the initialDate
        expect(receivedDates.map((date) => date.valueOf())).toContain(new Date(expectedDateIso).valueOf())
        expect(getActiveRange(calendar)).toEqual(expectedRange)
      })

      // https://github.com/fullcalendar/fullcalendar/issues/4517
      it('can return a timed range, which is rounded out to whole days', async () => {
        const calendar = initCalendar({
          ...options,
          dateIncrement: { days: 3 },
          initialDate: '2017-06-08T12:30:00',
          visibleRange: (date) => ({
            start: new Date(date.valueOf() - DAY_MS), // 2017-06-07T12:30:00 -> 2017-06-07
            end: new Date(date.valueOf() + DAY_MS * 2), // 2017-06-10T12:30:00 -> 2017-06-11
          }),
        })
        await waitForSettle()
        expect(getActiveRange(calendar)).toEqual(['2017-06-07', '2017-06-11'])

        calendar.prev()
        await waitForSettle()
        // from the new date, 2017-06-05T00:00, so the end is midnight and isn't rounded up
        expect(getActiveRange(calendar)).toEqual(['2017-06-04', '2017-06-07'])
      })
    })

    it.each([
      ['an end before the start', { start: '2017-06-18', end: '2017-06-15' }],
      ['no end', { start: '2017-06-18' }],
      ['no start', { end: '2017-06-15' }],
    ])('falls back to a day at initialDate given %s', async (_desc, visibleRange) => {
      const calendar = initCalendar({ ...options, initialDate: '2017-08-01', visibleRange })
      await waitForSettle()

      expect(getActiveRange(calendar)).toEqual(['2017-08-01', '2017-08-02'])
    })

    it.each([
      ['an earlier', '2017-06-25'],
      ['a later', '2017-07-01'],
    ])('moves %s date to the start of the range when switching to a one-day view', async (_desc, initialDate) => {
      const calendar = initCalendar({
        ...options,
        initialDate,
        visibleRange: { start: '2017-06-26', end: '2017-06-29' },
      })
      await waitForSettle()
      expect(getActiveRange(calendar)).toEqual(['2017-06-26', '2017-06-29']) // the date doesn't decide the range

      calendar.changeView('timeGridDay')
      await waitForSettle()

      expect(getActiveRange(calendar)).toEqual(['2017-06-26', '2017-06-27'])
    })
  })

  it.each([
    ['a custom view with a fixed duration', { initialView: 'timeGrid', duration: { days: 3 } }, ['2015-06-08', '2015-06-11']],
    ['a standard view', { initialView: 'timeGridWeek' }, ['2015-06-07', '2015-06-14']],
  ])('is ignored by %s', async (_desc, extraOptions, expectedRange) => {
    const calendar = initCalendar({
      ...extraOptions,
      initialDate: '2015-06-08',
      visibleRange: { start: '2017-06-29', end: '2017-07-04' },
    })
    await waitForSettle()

    expect(getActiveRange(calendar)).toEqual(expectedRange)
  })
})
