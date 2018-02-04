import { getTimeTexts } from './TimeGridEventRenderUtils'

describe('the time text on events', function() {

  describe('in agendaWeek', function() {
    pushOptions({
      defaultView: 'agendaWeek',
      defaultDate: '2017-07-03',
      scrollTime: '00:00'
    })

    it('renders segs with correct local timezone', function() {
      initCalendar({
        timezone: 'local',
        timeFormat: 'h:mm Z',
        events: [
          { start: '2017-07-03T23:00:00', end: '2017-07-04T13:00:00' }
        ]
      })

      expect(
        getTimeTexts()
      ).toEqual([
        moment('2017-07-03T23:00:00').format('h:mm Z') + ' - ' +
        moment('2017-07-04T00:00:00').format('h:mm Z'),
        moment('2017-07-04T00:00:00').format('h:mm Z') + ' - ' +
        moment('2017-07-04T13:00:00').format('h:mm Z')
      ])
    })
  })

})
