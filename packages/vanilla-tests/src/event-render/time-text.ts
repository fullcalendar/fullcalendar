import { describe, expect, it } from 'vitest'
import { FormatterInput } from 'fullcalendar'
import enGbLocale from 'fullcalendar/locales/en-gb'
import { initCalendar } from '../lib/calendar'
import { getEventTimeTexts, getVisibleEventEls } from '../lib/models/event-content'
import { enUsSep } from '../lib/intl'
import { waitForSettle } from '../lib/settle'

// the separator Intl puts between the times of an en-GB range
const enGbSep = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
  .formatRangeToParts(new Date(2014, 5, 13, 1), new Date(2014, 5, 13, 2))
  .find((part) => part.source === 'shared' && part.type === 'literal')!
  .value

async function renderTimeTexts(options: object): Promise<string[]> {
  const calendar = initCalendar(options)
  await waitForSettle()
  return getEventTimeTexts(getVisibleEventEls(calendar.el))
}

describe('event time text', () => {
  describe('eventTimeFormat', () => {
    const options = {
      initialDate: '2014-06-04',
      scrollTime: '00:00',
      events: [{ title: 'my event', start: '2014-06-04T15:00:00', end: '2014-06-04T17:00:00' }],
    }
    const customFormat: FormatterInput = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }

    it.each([
      { desc: 'dayGridMonth defaults to a short start time', view: 'dayGridMonth', extraOptions: {}, text: '3p' },
      { desc: 'dayGridMonth defaults are localized', view: 'dayGridMonth', extraOptions: { locale: enGbLocale }, text: '15' },
      { desc: 'dayGridMonth uses a custom format', view: 'dayGridMonth', extraOptions: { eventTimeFormat: customFormat }, text: '15:00:00' },
      { desc: 'timeGridWeek defaults to a start-end range', view: 'timeGridWeek', extraOptions: {}, text: `3:00${enUsSep}5:00` },
      { desc: 'timeGridWeek defaults are localized', view: 'timeGridWeek', extraOptions: { locale: enGbLocale }, text: `15:00${enGbSep}17:00` },
      { desc: 'timeGridWeek uses a custom format', view: 'timeGridWeek', extraOptions: { eventTimeFormat: customFormat }, text: `15:00:00${enUsSep}17:00:00` },
      { desc: 'dayGridDay defaults to showing the end', view: 'dayGridDay', extraOptions: {}, text: `3${enUsSep}5p` },
    ])('$desc', async ({ view, extraOptions, text }) => {
      expect(await renderTimeTexts({ ...options, ...extraOptions, initialView: view })).toEqual([text])
    })

    it('defaults to no end in a multi-day custom dayGrid view', async () => {
      const texts = await renderTimeTexts({
        ...options,
        initialView: 'dayGridTwoDay',
        views: {
          dayGridTwoDay: { type: 'dayGrid', duration: { days: 2 } },
        },
      })
      expect(texts).toEqual(['3p'])
    })
  })

  describe('displayEventEnd', () => {
    const options = {
      initialDate: '2014-06-13',
      scrollTime: '00:00',
      eventTimeFormat: { hour: 'numeric', minute: '2-digit' } as FormatterInput,
    }

    it.each([
      { displayEventEnd: false, desc: 'an all-day event', event: { start: '2014-06-13', end: '2014-06-13', allDay: true }, text: '' },
      { displayEventEnd: false, desc: 'a timed event with no end', event: { start: '2014-06-13T01:00:00' }, text: '1:00AM' },
      { displayEventEnd: false, desc: 'a timed event with an end', event: { start: '2014-06-13T01:00:00', end: '2014-06-13T02:00:00' }, text: '1:00AM' },
      { displayEventEnd: true, desc: 'an all-day event', event: { start: '2014-06-13', end: '2014-06-13', allDay: true }, text: '' },
      { displayEventEnd: true, desc: 'a timed event with no end', event: { start: '2014-06-13T01:00:00' }, text: '1:00AM' },
      { displayEventEnd: true, desc: 'a timed event with an end equal to its start', event: { start: '2014-06-13T01:00:00', end: '2014-06-13T01:00:00' }, text: '1:00AM' },
      { displayEventEnd: true, desc: 'a timed event with an end', event: { start: '2014-06-13T01:00:00', end: '2014-06-13T02:00:00' }, text: `1:00${enUsSep}2:00AM` },
    ])('when $displayEventEnd, renders "$text" for $desc in dayGridMonth', async ({ displayEventEnd, event, text }) => {
      const texts = await renderTimeTexts({ ...options, initialView: 'dayGridMonth', displayEventEnd, events: [event] })
      expect(texts).toEqual([text])
    })

    // timeGrid shows the end by default
    it.each([
      { displayEventEnd: false, text: '1:00AM' },
      { displayEventEnd: true, text: `1:00${enUsSep}2:00AM` },
    ])('when $displayEventEnd, renders "$text" for a timed event in timeGridWeek', async ({ displayEventEnd, text }) => {
      const texts = await renderTimeTexts({
        ...options,
        initialView: 'timeGridWeek',
        displayEventEnd,
        events: [{ start: '2014-06-13T01:00:00', end: '2014-06-13T02:00:00' }],
      })
      expect(texts).toEqual([text])
    })
  })

  it('renders segments of a multi-day event in the local time zone', async () => {
    const format: FormatterInput = { hour: 'numeric', minute: '2-digit' }
    const calendar = initCalendar({
      initialView: 'timeGridWeek',
      initialDate: '2017-07-03',
      scrollTime: '00:00',
      timeZone: 'local',
      eventTimeFormat: format,
      events: [{ start: '2017-07-04T03:00:00Z', end: '2017-07-04T17:00:00Z' }], // 11pm-1pm in New York
    })
    await waitForSettle()

    // split at local midnight
    expect(getEventTimeTexts(getVisibleEventEls(calendar.el))).toEqual([
      `11:00PM${enUsSep}12:00AM`,
      `12:00AM${enUsSep}1:00PM`,
    ])
  })
})
