import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('footerToolbar rendering', () => { // TODO: rename file
  pushOptions({
    initialDate: '2014-06-04',
    initialView: 'timeGridWeek',
  })

  describe('when supplying footerToolbar options', () => {
    it('should append a footerToolbar element to the DOM', () => {
      let calendar = initCalendar({
        footerToolbar: {
          left: 'next,prev',
          center: 'prevYear today nextYear timeGridDay,timeGridWeek',
          right: 'title',
        },
      })
      let calendarWrapper = new CalendarWrapper(calendar)
      expect(calendarWrapper.footerToolbar).toBeTruthy()
    })
  })

  describe('when setting footerToolbar to false', () => {
    it('should not have footerToolbar table', () => {
      let calendar = initCalendar({
        footerToolbar: false,
      })
      let calendarWrapper = new CalendarWrapper(calendar)
      expect(calendarWrapper.footerToolbar).toBeFalsy()
    })
  })

  it('allow for dynamically changing', () => {
    let calendar = initCalendar({
      footerToolbar: {
        left: 'next,prev',
        center: 'prevYear today nextYear timeGridDay,timeGridWeek',
        right: 'title',
      },
    })
    let calendarWrapper = new CalendarWrapper(calendar)
    expect(calendarWrapper.footerToolbar).toBeTruthy()
    currentCalendar.setOption('footerToolbar', false)
    expect(calendarWrapper.footerToolbar).toBeFalsy()
  })
})
