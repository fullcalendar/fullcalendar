import { describe, expect, it, vi } from 'vitest'
import { Calendar, CalendarOptions } from 'fullcalendar'
import { strictModeFactor } from 'fullcalendar/protected-api'
import classicThemePlugin from 'fullcalendar/themes/classic'
import dayGridPlugin from 'fullcalendar/daygrid'
import { createCalendarElement, initCalendar } from '../lib/calendar'
import { waitForSettle } from '../lib/settle'
import testPlugin from '../lib/test-plugin'

describe('datesSet', () => {
  it('fires on init and on navigation, with the new range', async () => {
    const datesSet = vi.fn()
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2020-06-21', datesSet })
    await waitForSettle()

    expect(datesSet).toHaveBeenCalledTimes(1 * strictModeFactor)
    expect(datesSet.mock.calls[0][0].startStr).toBe('2020-05-31T00:00:00Z')
    expect(datesSet.mock.calls[0][0].endStr).toBe('2020-07-12T00:00:00Z')
    expect(datesSet.mock.calls[0][0].view.type).toBe('dayGridMonth')

    datesSet.mockClear()
    calendar.next()
    await waitForSettle()

    expect(datesSet).toHaveBeenCalledTimes(1)
    expect(datesSet.mock.calls[0][0].startStr).toBe('2020-06-28T00:00:00Z')
    expect(datesSet.mock.calls[0][0].endStr).toBe('2020-08-09T00:00:00Z')
  })

  /*
  resetOptions replaces every option, so these calendars are built with all of their options,
  not through initCalendar's defaults.
  */
  describe('when resetting options', () => {
    const baseOptions: CalendarOptions = {
      plugins: [dayGridPlugin, classicThemePlugin, testPlugin],
      timeZone: 'UTC',
      initialView: 'dayGridMonth',
      now: '2020-06-21',
    }

    async function countDatesSetAfterReset(
      buildOptions: () => CalendarOptions,
      buildNewOptions = buildOptions,
    ): Promise<number> {
      const datesSet = vi.fn()
      const calendar = new Calendar(createCalendarElement(), { ...baseOptions, ...buildOptions(), datesSet })
      calendar.render()
      await waitForSettle()
      expect(datesSet).toHaveBeenCalledTimes(1 * strictModeFactor)

      datesSet.mockClear()
      calendar.resetOptions({ ...baseOptions, ...buildNewOptions(), datesSet })
      await waitForSettle()
      return datesSet.mock.calls.length
    }

    it.each<[string, () => CalendarOptions, (() => CalendarOptions)?, number?]>([
      ['a non-date option changes', () => ({ weekNumbers: false }), () => ({ weekNumbers: true })],
      ['an object option is rebuilt equal', () => ({ headerToolbar: { left: 'today' } })],
      ['the plugins are rebuilt equal', () => ({ plugins: [dayGridPlugin, classicThemePlugin, testPlugin] })],
      // https://github.com/fullcalendar/fullcalendar/issues/7069
      ['validRange is rebuilt equal, with strings', () => ({ validRange: { start: '2020-06-10' } })],
      ['validRange is rebuilt equal, with Dates', () => ({ validRange: { start: new Date('2020-06-10T00:00:00Z') } })],
      ['visibleRange is rebuilt equal', () => ({ initialView: 'dayGrid', visibleRange: { start: '2020-06-10', end: '2020-06-20' } })],
      ['hiddenDays is rebuilt equal', () => ({ hiddenDays: [0, 6] })],
      ['hiddenDays is rebuilt equal, with weekends: false', () => ({ hiddenDays: [1], weekends: false })],
      // the anchor: the same mechanics, but the range changes. updates aren't doubled by StrictMode
      ['validRange changes', () => ({ validRange: { start: '2020-06-10' } }), () => ({ validRange: { start: '2020-06-12' } }), 1],
    ])('when %s', async (_desc, buildOptions, buildNewOptions, expectedCount = 0) => {
      expect(await countDatesSetAfterReset(buildOptions, buildNewOptions)).toBe(expectedCount)
    })
  })
})
