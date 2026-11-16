import { describe, expect, it } from 'vitest'
import { Calendar } from 'fullcalendar'
import dayGridPlugin from 'fullcalendar/daygrid'
import luxonPlugin from '@fullcalendar/format-luxon3'
import { initCalendar } from '../lib/calendar'
import { getLeafTexts, enUsSep, normalizeIntlWhitespace } from '../lib/intl'
import { getEventEls } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

/*
The Luxon plugin's command-string formatting. Range formatting needs a calendar but no rendering.
*/
describe('luxon formatting plugin', () => {
  it('formats event time text', async () => {
    const calendar = initCalendar({
      plugins: [luxonPlugin],
      initialView: 'dayGridMonth',
      initialDate: '2018-09-06',
      displayEventEnd: false,
      eventTimeFormat: 'HH:mm:ss\'abc\'',
      events: [{ id: '1', title: 'my event', start: '2018-09-06T13:30:20' }],
    })
    await waitForSettle()

    expect(getLeafTexts(getEventEls(calendar.el, '1')[0])).toEqual(['13:30:20abc', 'my event'])
  })

  describe('range formatting', () => {
    function formatRange(start: string, end: string, format: string): string {
      const calendar = new Calendar(document.createElement('div'), {
        plugins: [luxonPlugin, dayGridPlugin],
      })
      return normalizeIntlWhitespace(calendar.formatRange(start, end, format))
    }

    it.each([
      ['the same month', '2018-09-05', 'MMMM {d}, yyyy \'asdf\'', `September 3${enUsSep}5, 2018 asdf`],
      ['the same month, day first', '2018-09-05', '{d} MMMM, yyyy \'asdf\'', `3${enUsSep}5 September, 2018 asdf`],
      ['different months', '2018-10-05', '{MMMM {d}}, yyyy \'asdf\'', `September 3${enUsSep}October 5, 2018 asdf`],
      ['different months, day first', '2018-10-05', '{{d} MMMM}, yyyy \'asdf\'', `3 September${enUsSep}5 October, 2018 asdf`],
      ['different years', '2019-10-05', '{MMMM {d}}, yyyy \'asdf\'', `September 3, 2018 asdf${enUsSep}October 5, 2019 asdf`],
      ['different years, day first', '2019-10-05', '{{d} MMMM}, yyyy \'asdf\'', `3 September, 2018 asdf${enUsSep}5 October, 2019 asdf`],
    ])('formats a range ending in %s', (_desc, end, format, expected) => {
      expect(formatRange('2018-09-03', end, format)).toBe(normalizeIntlWhitespace(expected))
    })

    it('formats a range within one day as a single date', () => {
      expect(formatRange('2018-09-03T00:00:00', '2018-09-03T23:59:59', 'MMMM d yyyy')).toBe('September 3 2018')
    })
  })
})
