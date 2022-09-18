import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('header navigation', () => {
  pushOptions({
    headerToolbar: {
      left: 'next,prev,prevYear,nextYear today',
      center: '',
      right: 'title',
    },
  })

  describe('and click next', () => {
    it('should change view to next month', (done) => {
      let calendar = initCalendar()
      calendar.gotoDate('2010-02-01')

      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      $(toolbarWrapper.getButtonEl('next')).simulate('click')
      setTimeout(() => {
        let newDate = calendar.getDate()
        expect(newDate).toEqualDate('2010-03-01')
        done()
      })
    })
  })

  describe('and click prev', () => {
    it('should change view to prev month', (done) => {
      let calendar = initCalendar()
      calendar.gotoDate('2010-02-01')

      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      $(toolbarWrapper.getButtonEl('prev')).simulate('click')
      setTimeout(() => {
        let newDate = calendar.getDate()
        expect(newDate).toEqualDate('2010-01-01')
        done()
      })
    })
  })

  describe('and click prevYear', () => {
    it('should change view to prev month', (done) => {
      let calendar = initCalendar()
      calendar.gotoDate('2010-02-01')

      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      $(toolbarWrapper.getButtonEl('prevYear')).simulate('click')
      setTimeout(() => {
        let newDate = calendar.getDate()
        expect(newDate).toEqualDate('2009-02-01')
        done()
      })
    })
  })

  describe('and click nextYear', () => {
    it('should change view to prev month', (done) => {
      let calendar = initCalendar()
      calendar.gotoDate('2010-02-01')

      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      $(toolbarWrapper.getButtonEl('nextYear')).simulate('click')
      setTimeout(() => {
        let newDate = calendar.getDate()
        expect(newDate).toEqualDate('2011-02-01')
        done()
      })
    })
  })

  describe('and click today', () => {
    it('should change view to prev month', (done) => {
      let calendar = initCalendar()
      calendar.gotoDate('2010-02-01')

      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      $(toolbarWrapper.getButtonEl('today')).simulate('click')
      setTimeout(() => {
        let newDate = calendar.getDate() // will be ambig zone
        expect(newDate).toEqualNow()
        done()
      })
    })
  })
})
