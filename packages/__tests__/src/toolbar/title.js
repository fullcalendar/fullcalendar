import CalendarWrapper from '../lib/wrappers/CalendarWrapper'

describe('calendar title', function() {
  pushOptions({
    now: '2017-03-29'
  })

  describe('when switching to and from a view', function() {
    it('updates the title at each switch', function() {
      let calendar = initCalendar({
        initialView: 'dayGridMonth'
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar

      expect(toolbarWrapper.getTitleText()).toBe('March 2017')
      currentCalendar.changeView('timeGridWeek')
      expect(toolbarWrapper.getTitleText()).toBe('Mar 26 – Apr 1, 2017')
      currentCalendar.changeView('dayGridMonth')
      expect(toolbarWrapper.getTitleText()).toBe('March 2017')
    })
  })
})
