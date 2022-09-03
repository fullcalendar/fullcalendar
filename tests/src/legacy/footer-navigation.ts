import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('footerToolbar navigation', () => { // TODO: rename file
  pushOptions({
    now: '2010-02-01',
    headerToolbar: false,
    footerToolbar: {
      left: 'next,prev,prevYear,nextYear today',
      center: '',
      right: 'title',
    },
  })

  describe('and click next', () => {
    it('should change view to next month', (done) => {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).footerToolbar

      $(toolbarWrapper.getButtonEl('next')).simulate('click')
      setTimeout(() => {
        let newDate = currentCalendar.getDate()
        expect(newDate).toEqualDate('2010-03-01')
        done()
      })
    })
  })

  describe('and click prev', () => {
    it('should change view to prev month', (done) => {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).footerToolbar

      $(toolbarWrapper.getButtonEl('prev')).simulate('click')
      setTimeout(() => {
        let newDate = currentCalendar.getDate()
        expect(newDate).toEqualDate('2010-01-01')
        done()
      })
    })
  })

  describe('and click prevYear', () => {
    it('should change view to prev month', (done) => {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).footerToolbar

      $(toolbarWrapper.getButtonEl('prevYear')).simulate('click')
      setTimeout(() => {
        let newDate = currentCalendar.getDate()
        expect(newDate).toEqualDate('2009-02-01')
        done()
      })
    })
  })

  describe('and click nextYear', () => {
    it('should change view to prev month', (done) => {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).footerToolbar

      $(toolbarWrapper.getButtonEl('nextYear')).simulate('click')
      setTimeout(() => {
        let newDate = currentCalendar.getDate()
        expect(newDate).toEqualDate('2011-02-01')
        done()
      })
    })
  })

  describe('and click today', () => {
    it('should change view to prev month', (done) => {
      let calendar = initCalendar({
        initialDate: '2010-03-15', // something other than the `now` date
      })
      let toolbarWrapper = new CalendarWrapper(calendar).footerToolbar

      $(toolbarWrapper.getButtonEl('today')).simulate('click')
      setTimeout(() => {
        let newDate = currentCalendar.getDate() // will be ambig zone
        expect(newDate).toEqualDate('2010-02-01')
        done()
      })
    })
  })
})
