import CalendarWrapper from "../lib/wrappers/CalendarWrapper"

describe('footer rendering', function() {
  pushOptions({
    defaultDate: '2014-06-04',
    defaultView: 'timeGridWeek'
  })

  describe('when supplying footer options', function() {
    it('should append a footer element to the DOM', function() {
      let calendar = initCalendar({
        footer: {
          left: 'next,prev',
          center: 'prevYear today nextYear timeGridDay,timeGridWeek',
          right: 'title'
        }
      })
      let calendarWrapper = new CalendarWrapper(calendar)
      expect(calendarWrapper.footer).toBeTruthy()
    })
  })

  describe('when setting footer to false', function() {
    it('should not have footer table', function() {
      let calendar = initCalendar({
        footer: false
      })
      let calendarWrapper = new CalendarWrapper(calendar)
      expect(calendarWrapper.footer).toBeFalsy()
    })
  })

  it('allow for dynamically changing', function() {
    let calendar = initCalendar({
      footer: {
        left: 'next,prev',
        center: 'prevYear today nextYear timeGridDay,timeGridWeek',
        right: 'title'
      }
    })
    let calendarWrapper = new CalendarWrapper(calendar)
    expect(calendarWrapper.footer).toBeTruthy()
    currentCalendar.setOption('footer', false)
    expect(calendarWrapper.footer).toBeFalsy()
  })
})
