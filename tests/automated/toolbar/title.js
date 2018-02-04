import { getTitleText } from './ToolbarUtils'

describe('calendar title', function() {
  pushOptions({
    now: '2017-03-29'
  })

  describe('when switching to and from a view', function() {
    it('updates the title at each switch', function() {
      initCalendar({
        defaultView: 'month'
      })
      expect(getTitleText()).toBe('March 2017')
      currentCalendar.changeView('agendaWeek')
      expect(getTitleText()).toBe('Mar 26 – Apr 1, 2017')
      currentCalendar.changeView('month')
      expect(getTitleText()).toBe('March 2017')
    })
  })
})
