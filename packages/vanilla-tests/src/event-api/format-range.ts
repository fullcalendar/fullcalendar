import { describe, expect, it } from 'vitest'
import { FormatterInput } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { enUsSep, normalizeIntlWhitespace } from '../lib/intl'

/*
EventApi.formatRange, in the calendar's time zone.
*/
describe('EventApi.formatRange', () => {
  const options = {
    timeZone: 'America/New_York', // the events' -05:00 offsets are converted to -04:00
    locale: 'en',
  }
  const formatSettings: FormatterInput = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZoneName: 'short',
    omitCommas: true, // for cross-browser
  }

  function formatFirstEvent(eventInput: { start: string, end?: string }): string {
    const calendar = initCalendar({ ...options, events: [eventInput] })
    const str = calendar.getEvents()[0].formatRange(formatSettings)
    return normalizeIntlWhitespace(str).replaceAll(' at ', ' ')
  }

  it('formats the start and end', () => {
    expect(formatFirstEvent({ start: '2018-09-04T12:00:00-05:00', end: '2018-09-05T12:00:00-05:00' }))
      .toBe(normalizeIntlWhitespace(`September 4 2018 1:00PM GMT-4${enUsSep}September 5 2018 1:00PM GMT-4`))
  })

  it('formats only the start when the event has no end', () => {
    expect(formatFirstEvent({ start: '2018-09-04T12:00:00-05:00' }))
      .toBe('September 4 2018 01:00PM GMT-4')
  })
})
