import { FormatterInput } from '@fullcalendar/core'
import { parseLocalDate } from '../lib/date-parsing'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('the time text on events', () => {
  describe('in week', () => {
    pushOptions({
      initialView: 'timeGridWeek',
      initialDate: '2017-07-03',
      scrollTime: '00:00',
    })

    it('renders segs with correct local timezone', () => {
      const FORMAT: FormatterInput = {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      }

      let calendar = initCalendar({
        timeZone: 'local',
        eventTimeFormat: FORMAT,
        events: [
          { start: '2017-07-03T23:00:00', end: '2017-07-04T13:00:00' },
        ],
      })

      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      let timeText = timeGridWrapper.getEventTimeTexts()

      expect(timeText).toEqual([
        currentCalendar.formatRange(
          parseLocalDate('2017-07-03T23:00:00'),
          parseLocalDate('2017-07-04T00:00:00'),
          FORMAT,
        ),
        currentCalendar.formatRange(
          parseLocalDate('2017-07-04T00:00:00'),
          parseLocalDate('2017-07-04T13:00:00'),
          FORMAT,
        ),
      ])
    })
  })
})
