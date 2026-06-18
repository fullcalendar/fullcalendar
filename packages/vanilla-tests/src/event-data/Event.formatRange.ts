import { FormatterInput } from 'fullcalendar'
import { enUsSep } from '../lib/misc'

describe('Event::formatRange', () => {
  pushOptions({
    timeZone: 'America/New_York', // for forced timezone offsets
    locale: 'en',
  })

  const FORMAT_SETTINGS: FormatterInput = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZoneName: 'short',
    omitCommas: true, // for cross-browser
  }

  describe('when event has an end', () => {
    pushOptions({
      events: [
        { start: '2018-09-04T12:00:00-05:00', end: '2018-09-05T12:00:00-05:00' },
      ],
    })

    it('formats start and end', () => {
      let calendar = initCalendar()
      let event = calendar.getEvents()[0]
      let str = event.formatRange(FORMAT_SETTINGS)
      expect(str.replaceAll(' at ', ' '))
        .toBe(`September 4 2018 1:00PM GMT-4${enUsSep}September 5 2018 1:00PM GMT-4`)
    })
  })

  describe('when event has NO end', () => {
    pushOptions({
      events: [
        { start: '2018-09-04T12:00:00-05:00' },
      ],
    })

    it('formats start', () => {
      let calendar = initCalendar()
      let event = calendar.getEvents()[0]
      let str = event.formatRange(FORMAT_SETTINGS)
      expect(str.replace(' at ', ' '))
        .toBe('September 4 2018 01:00PM GMT-4')
    })
  })
})
