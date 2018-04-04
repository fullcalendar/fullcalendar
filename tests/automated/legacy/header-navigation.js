
describe('header navigation', function() {

  pushOptions({
    now: '2010-02-01',
    header: {
      left: 'next,prev,prevYear,nextYear today',
      center: '',
      right: 'title'
    }
  })

  describe('and click next', function() {
    it('should change view to next day', function() {
      initCalendar()
      $('.fc-next-button').simulate('click')
      var newDate = currentCalendar.getDate()
      expect(newDate).toEqualMoment('2010-03-01')
    })
  })

  describe('and click prev', function() {
    it('should change view to prev day', function() {
      initCalendar()
      $('.fc-prev-button').simulate('click')
      var newDate = currentCalendar.getDate()
      expect(newDate).toEqualMoment('2010-01-01')
    })
  })

  describe('and click prevYear', function() {
    it('should change view to prev year', function() {
      initCalendar()
      $('.fc-prevYear-button').simulate('click')
      var newDate = currentCalendar.getDate()
      expect(newDate).toEqualMoment('2009-01-01')
    })
  })

  describe('and click nextYear', function() {
    it('should change view to next year', function() {
      initCalendar()
      $('.fc-nextYear-button').simulate('click')
      var newDate = currentCalendar.getDate()
      expect(newDate).toEqualMoment('2011-02-01')
    })
  })

  describe('and click today', function() {
    it('should change view to today', function() {
      var options = {}
      options.defaultDate = '2010-03-15' // something other than the `now` date

      initCalendar(options)

      $('.fc-today-button').simulate('click')
      var newDate = currentCalendar.getDate() // will be ambig zone
      expect(newDate).toEqualMoment('2010-02-01')
    })
  })
})
