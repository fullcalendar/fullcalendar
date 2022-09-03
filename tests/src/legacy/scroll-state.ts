import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('scroll state', () => {
  let calendarEl

  beforeEach(() => {
    calendarEl = $('<div id="calendar">').width(800).appendTo('body')
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

    it('should be maintained when resizing window', (done) => {
      let scrollEl
      let scroll0
      let calendar = initCalendar({
        windowResize() {
          setTimeout(() => { // wait until all other tasks are finished
            expect(scrollEl.scrollTop).toBe(scroll0)
            done()
          }, 0)
        },
      }, calendarEl)

      scrollEl = new ViewWrapper(calendar).getScrollerEl()

      setTimeout(() => { // wait until after browser's scroll state is applied
        scrollEl.scrollTop = 9999 // all the way
        scroll0 = scrollEl.scrollTop
        $(window).simulate('resize')
      }, 0)
    })

    it('should be maintained when after rerendering events', () => {
      let calendar = initCalendar({
        events: [{
          start: '2015-02-20',
        }],
      }, calendarEl)

      let scrollEl = new ViewWrapper(calendar).getScrollerEl()
      let eventEl0 = new CalendarWrapper(calendar).getEventEls()
      expect(eventEl0.length).toBe(1)

      scrollEl.scrollTop = 9999 // all the way
      let scroll0 = scrollEl.scrollTop
      currentCalendar.render()

      let eventEl1 = new CalendarWrapper(calendar).getEventEls()
      expect(eventEl1.length).toBe(1)
      expect(scrollEl.scrollTop).toBe(scroll0)
    })
  })
})
