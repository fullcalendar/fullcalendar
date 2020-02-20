import CalendarWrapper from "../lib/wrappers/CalendarWrapper"

describe('header navigation', function() {
  pushOptions({
    header: {
      left: 'next,prev,prevYear,nextYear today',
      center: '',
      right: 'title'
    }
  })

  describe('and click next', function() {
    it('should change view to next month', function(done) {
      let calendar = initCalendar()
      calendar.gotoDate('2010-02-01')

      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      $(toolbarWrapper.getButtonEl('next')).simulate('click')
      setTimeout(function() {

        var newDate = calendar.getDate()
        expect(newDate).toEqualDate('2010-03-01')
        done()
      })
    })
  })

  describe('and click prev', function() {
    it('should change view to prev month', function(done) {
      let calendar = initCalendar()
      calendar.gotoDate('2010-02-01')

      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      $(toolbarWrapper.getButtonEl('prev')).simulate('click')
      setTimeout(function() {

        var newDate = calendar.getDate()
        expect(newDate).toEqualDate('2010-01-01')
        done()
      })
    })
  })

  describe('and click prevYear', function() {
    it('should change view to prev month', function(done) {
      let calendar = initCalendar()
      calendar.gotoDate('2010-02-01')

      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      $(toolbarWrapper.getButtonEl('prevYear')).simulate('click')
      setTimeout(function() {

        var newDate = calendar.getDate()
        expect(newDate).toEqualDate('2009-02-01')
        done()
      })
    })
  })

  describe('and click nextYear', function() {
    it('should change view to prev month', function(done) {
      let calendar = initCalendar()
      calendar.gotoDate('2010-02-01')

      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      $(toolbarWrapper.getButtonEl('nextYear')).simulate('click')
      setTimeout(function() {

        var newDate = calendar.getDate()
        expect(newDate).toEqualDate('2011-02-01')
        done()
      })
    })
  })

  describe('and click today', function() {
    it('should change view to prev month', function(done) {
      let calendar = initCalendar()
      calendar.gotoDate('2010-02-01')

      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      $(toolbarWrapper.getButtonEl('today')).simulate('click')
      setTimeout(function() {

        var newDate = calendar.getDate() // will be ambig zone
        expect(newDate).toEqualNow()
        done()
      })
    })
  })
})
