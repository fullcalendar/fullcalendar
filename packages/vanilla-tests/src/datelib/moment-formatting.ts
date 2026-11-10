import { describe, expect, it } from 'vitest'
import { Calendar } from 'fullcalendar'
import dayGridPlugin from 'fullcalendar/daygrid'
import momentPlugin from '@fullcalendar/format-moment'
import 'moment/locale/es' // makes Spanish moment's global locale. Output must still follow the calendar's 'en'
import { initCalendar } from '../lib/calendar'
import { getLeafTexts, enUsSep, normalizeIntlWhitespace } from '../lib/intl'
import { getEventEls } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

/*
The Moment plugin's command-string formatting. Range formatting needs a calendar but no rendering.
*/
describe('moment formatting plugin', () => {
  it('formats event time text', async () => {
    const calendar = initCalendar({
      plugins: [momentPlugin],
      initialView: 'dayGridMonth',
      initialDate: '2018-09-06',
      displayEventEnd: false,
      eventTimeFormat: 'HH:mm:ss[!]',
      events: [{ id: '1', title: 'my event', start: '2018-09-06T13:30:20' }],
    })
    await waitForSettle()

    expect(getLeafTexts(getEventEls(calendar.el, '1')[0])).toEqual(['13:30:20!', 'my event'])
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5493
  it('separates the start and end of an event\'s time text', async () => {
    const calendar = initCalendar({
      plugins: [momentPlugin],
      initialView: 'timeGridDay',
      initialDate: '2020-06-26',
      scrollTime: '00:00',
      eventTimeFormat: 'HH:mm:ss',
      events: [{ id: '1', title: 'event', start: '2020-06-26T01:00:00', end: '2020-06-26T02:00:00' }],
    })
    await waitForSettle()

    const texts = getLeafTexts(getEventEls(calendar.el, '1')[0]).map(normalizeIntlWhitespace)
    expect(texts).toEqual([normalizeIntlWhitespace(`01:00:00${enUsSep}02:00:00`), 'event'])
  })

  describe('range formatting', () => {
    function formatRange(start: string, end: string, format: string): string {
      const calendar = new Calendar(document.createElement('div'), {
        plugins: [momentPlugin, dayGridPlugin],
      })
      return normalizeIntlWhitespace(calendar.formatRange(start, end, format))
    }

    it.each([
      ['the same month', '2018-09-05', 'MMMM {D}, YYYY [nice]', `September 3${enUsSep}5, 2018 nice`],
      ['the same month, day first', '2018-09-05', '{D} MMMM, YYYY [nice]', `3${enUsSep}5 September, 2018 nice`],
      ['different months', '2018-10-05', '{MMMM {D}}, YYYY [nice]', `September 3${enUsSep}October 5, 2018 nice`],
      ['different months, day first', '2018-10-05', '{{D} MMMM}, YYYY [nice]', `3 September${enUsSep}5 October, 2018 nice`],
      ['different years', '2019-10-05', '{MMMM {D}}, YYYY [nice]', `September 3, 2018 nice${enUsSep}October 5, 2019 nice`],
      ['different years, day first', '2019-10-05', '{{D} MMMM}, YYYY [nice]', `3 September, 2018 nice${enUsSep}5 October, 2019 nice`],
    ])('formats a range ending in %s', (_desc, end, format, expected) => {
      expect(formatRange('2018-09-03', end, format)).toBe(normalizeIntlWhitespace(expected))
    })

    it('formats a range within one day as a single date', () => {
      expect(formatRange('2018-09-03T00:00:00', '2018-09-03T23:59:59', 'MMM Do YY')).toBe('Sep 3rd 18')
    })
  })
})
