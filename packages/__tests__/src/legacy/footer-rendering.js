import CalendarWrapper from "../lib/wrappers/CalendarWrapper"

describe('footerToolbar rendering', function() { // TODO: rename file
  pushOptions({
    defaultDate: '2014-06-04',
    defaultView: 'timeGridWeek'
  })

  describe('when supplying footerToolbar options', function() {
    it('should append a footerToolbar element to the DOM', function() {
      let calendar = initCalendar({
        footerToolbar: {
          left: 'next,prev',
          center: 'prevYear today nextYear timeGridDay,timeGridWeek',
          right: 'title'
        }
      })
      let calendarWrapper = new CalendarWrapper(calendar)
      expect(calendarWrapper.footerToolbar).toBeTruthy()
    })
  })

  describe('when setting footerToolbar to false', function() {
    it('should not have footerToolbar table', function() {
      let calendar = initCalendar({
        footerToolbar: false
      })
      let calendarWrapper = new CalendarWrapper(calendar)
      expect(calendarWrapper.footerToolbar).toBeFalsy()
    })
  })

  it('allow for dynamically changing', function() {
    let calendar = initCalendar({
      footerToolbar: {
        left: 'next,prev',
        center: 'prevYear today nextYear timeGridDay,timeGridWeek',
        right: 'title'
      }
    })
    let calendarWrapper = new CalendarWrapper(calendar)
    expect(calendarWrapper.footerToolbar).toBeTruthy()
    currentCalendar.setOption('footerToolbar', false)
    expect(calendarWrapper.footerToolbar).toBeFalsy()
  })
})
