import { getTimeTexts } from './TimeGridEventRenderUtils'
import { parseLocalDate } from '../lib/date-parsing'

describe('the time text on events', function() {

  describe('in week', function() {
    pushOptions({
      defaultView: 'timeGridWeek',
      defaultDate: '2017-07-03',
      scrollTime: '00:00'
    })

    it('renders segs with correct local timezone', function() {
      var FORMAT = { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }

      initCalendar({
        timeZone: 'local',
        eventTimeFormat: FORMAT,
        events: [
          { start: '2017-07-03T23:00:00', end: '2017-07-04T13:00:00' }
        ]
      })

      expect(
        getTimeTexts()
      ).toEqual([
        currentCalendar.formatRange(
          parseLocalDate('2017-07-03T23:00:00'),
          parseLocalDate('2017-07-04T00:00:00'),
          FORMAT
        ),
        currentCalendar.formatRange(
          parseLocalDate('2017-07-04T00:00:00'),
          parseLocalDate('2017-07-04T13:00:00'),
          FORMAT
        )
      ])
    })
  })

})
