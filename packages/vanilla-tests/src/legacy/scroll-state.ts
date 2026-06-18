import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { waitTimeout } from '../lib/misc'

describe('scroll state', () => {
  let calendarEl

  beforeEach(() => {
    calendarEl = createCalendarElement()
    $(calendarEl).width(800)
  })
  afterEach(() => {
    calendarEl.remove()
    calendarEl = null
  })

  pushOptions({
    initialDate: '2015-02-20',
    contentHeight: 200,
    scrollTime: '00:00', // for timeGrid
  })

  describeOptions('initialView', {
    'when in month view': 'dayGridMonth',
    'when in week view': 'timeGridWeek',
  }, (viewName) => {
    let ViewWrapper = viewName.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper

    it('should be maintained when after rerendering events', async () => {
      let calendar = initCalendar({
        events: [{
          start: '2015-02-20',
        }],
      }, calendarEl)
      await waitTimeout()

      let scrollEl = new ViewWrapper(calendar).getScrollerEl()
      let eventEl0 = new CalendarWrapper(calendar).getEventEls()
      expect(eventEl0.length).toBe(1)

      scrollEl.scrollTop = 9999 // all the way
      let scroll0 = scrollEl.scrollTop
      calendar.render() // I don't think this actually rerenders anything!
      await waitTimeout()

      let eventEl1 = new CalendarWrapper(calendar).getEventEls()
      expect(eventEl1.length).toBe(1)
      expect(scrollEl.scrollTop).toBe(scroll0)
    })
  })
})
