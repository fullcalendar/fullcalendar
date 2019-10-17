describe('header navigation', function() {

  pushOptions({
    header: {
      left: 'next,prev,prevYear,nextYear today',
      center: '',
      right: 'title'
    }
  })

  beforeEach(function() {
    initCalendar()
  })

  describe('and click next', function() {
    it('should change view to next month', function() {
      currentCalendar.gotoDate('2010-02-01')
      $('.fc-next-button').simulate('click')
      var newDate = currentCalendar.getDate()
      expect(newDate).toEqualDate('2010-03-01')
    })
  })

  describe('and click prev', function() {
    it('should change view to prev month', function() {
      currentCalendar.gotoDate('2010-02-01')
      $('.fc-prev-button').simulate('click')
      var newDate = currentCalendar.getDate()
      expect(newDate).toEqualDate('2010-01-01')
    })
  })

  describe('and click prevYear', function() {
    it('should change view to prev month', function() {
      currentCalendar.gotoDate('2010-02-01')
      $('.fc-prevYear-button').simulate('click')
      var newDate = currentCalendar.getDate()
      expect(newDate).toEqualDate('2009-02-01')
    })
  })

  describe('and click nextYear', function() {
    it('should change view to prev month', function() {
      currentCalendar.gotoDate('2010-02-01')
      $('.fc-nextYear-button').simulate('click')
      var newDate = currentCalendar.getDate()
      expect(newDate).toEqualDate('2011-02-01')
    })
  })

  describe('and click today', function() {
    it('should change view to prev month', function() {
      currentCalendar.gotoDate('2010-02-01')
      $('.fc-today-button').simulate('click')
      var newDate = currentCalendar.getDate() // will be ambig zone
      expect(newDate).toEqualNow()
    })
  })
})
