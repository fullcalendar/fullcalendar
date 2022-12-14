import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('event fetching while date-navigating', () => {
  // https://github.com/fullcalendar/fullcalendar/issues/4975
  it('renders events when doing next() and then prev()', (done) => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-02-11',
      events(arg, callback) {
        if (arg.startStr.indexOf('2020-01-26') === 0) { // for Feb
          setTimeout(() => {
            callback([
              { start: '2020-02-15' }, // middle of month
            ])
          }, 100)
        } else if (arg.startStr.indexOf('2020-03-01') === 0) { // for March
          setTimeout(() => {
            callback([
              { start: '2020-03-15' }, // middle of month
            ])
          }, 100)
        } else {
          throw new Error('bad range')
        }
      },
    })
    let calendarWrapper = new CalendarWrapper(calendar)

    setTimeout(() => {
      currentCalendar.next()
      setTimeout(() => {
        currentCalendar.prev()
        setTimeout(() => {
          expect(calendarWrapper.getEventEls().length).toBe(1)
          done()
        }, 1000) // after everything
      }, 50) // before second fetch finishes
    }, 200) // let first fetch finish
  })
})
