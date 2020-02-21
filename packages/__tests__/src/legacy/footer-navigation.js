import CalendarWrapper from "../lib/wrappers/CalendarWrapper"

describe('footer navigation', function() {
  pushOptions({
    now: '2010-02-01',
    header: false,
    footer: {
      left: 'next,prev,prevYear,nextYear today',
      center: '',
      right: 'title'
    }
  })

  describe('and click next', function() {
    it('should change view to next month', function(done) {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).footer

      $(toolbarWrapper.getButtonEl('next')).simulate('click')
      setTimeout(function() {
        var newDate = currentCalendar.getDate()
        expect(newDate).toEqualDate('2010-03-01')
        done()
      })
    })
  })

  describe('and click prev', function() {
    it('should change view to prev month', function(done) {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).footer

      $(toolbarWrapper.getButtonEl('prev')).simulate('click')
      setTimeout(function() {
        var newDate = currentCalendar.getDate()
        expect(newDate).toEqualDate('2010-01-01')
        done()
      })
    })
  })

  describe('and click prevYear', function() {
    it('should change view to prev month', function(done) {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).footer

      $(toolbarWrapper.getButtonEl('prevYear')).simulate('click')
      setTimeout(function() {
        var newDate = currentCalendar.getDate()
        expect(newDate).toEqualDate('2009-02-01')
        done()
      })
    })
  })

  describe('and click nextYear', function() {
    it('should change view to prev month', function(done) {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).footer

      $(toolbarWrapper.getButtonEl('nextYear')).simulate('click')
      setTimeout(function() {
        var newDate = currentCalendar.getDate()
        expect(newDate).toEqualDate('2011-02-01')
        done()
      })
    })
  })

  describe('and click today', function() {
    it('should change view to prev month', function(done) {
      let calendar = initCalendar({
        defaultDate: '2010-03-15' // something other than the `now` date
      })
      let toolbarWrapper = new CalendarWrapper(calendar).footer

      $(toolbarWrapper.getButtonEl('today')).simulate('click')
      setTimeout(function() {
        var newDate = currentCalendar.getDate() // will be ambig zone
        expect(newDate).toEqualDate('2010-02-01')
        done()
      })
    })
  })
})
