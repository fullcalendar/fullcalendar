import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('calendar title', () => {
  pushOptions({
    now: '2017-03-29',
  })

  describe('when switching to and from a view', () => {
    it('updates the title at each switch', () => {
      let calendar = initCalendar({
        initialView: 'dayGridMonth',
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
