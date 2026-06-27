import { FormatterInput } from 'fullcalendar'
import { parseLocalDate } from '../lib/date-parsing'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { enUsSep } from '../lib/misc'

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

      /*
      This also tests how cross-day event gets segmented, thus the messy formatting technique
      (should probably move that to a separate file)
      */
      expect(timeText).toEqual([
        calendar.formatDate(parseLocalDate('2017-07-03T23:00:00'), FORMAT) + enUsSep +
        calendar.formatDate(parseLocalDate('2017-07-04T00:00:00'), FORMAT),

        calendar.formatDate(parseLocalDate('2017-07-04T00:00:00'), FORMAT) + enUsSep +
        calendar.formatDate(parseLocalDate('2017-07-04T13:00:00'), FORMAT),
      ])
    })
  })
})
