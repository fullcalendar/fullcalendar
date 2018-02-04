
describe('footer navigation', function() {
  var options

  beforeEach(function() {
    affix('#calendar')
    options = {
      now: '2010-02-01',
      footer: {
        left: 'next,prev,prevYear,nextYear today',
        center: '',
        right: 'title'
      }
    }
  })

  describe('and click next', function() {
    it('should change view to next month', function() {
      $('#calendar').fullCalendar(options)
      $('.fc-footer-toolbar .fc-next-button').simulate('click')
      var newDate = $('#calendar').fullCalendar('getDate')
      expect(newDate).toEqualMoment('2010-03-01')
    })
  })

  describe('and click prev', function() {
    it('should change view to prev month', function() {
      $('#calendar').fullCalendar(options)
      $('.fc-footer-toolbar .fc-prev-button').simulate('click')
      var newDate = $('#calendar').fullCalendar('getDate')
      expect(newDate).toEqualMoment('2010-01-01')
    })
  })

  describe('and click prevYear', function() {
    it('should change view to prev month', function() {
      $('#calendar').fullCalendar(options)
      $('.fc-footer-toolbar .fc-prevYear-button').simulate('click')
      var newDate = $('#calendar').fullCalendar('getDate')
      expect(newDate).toEqualMoment('2009-02-01')
    })
  })

  describe('and click nextYear', function() {
    it('should change view to prev month', function() {
      $('#calendar').fullCalendar(options)
      $('.fc-footer-toolbar .fc-nextYear-button').simulate('click')
      var newDate = $('#calendar').fullCalendar('getDate')
      expect(newDate).toEqualMoment('2011-02-01')
    })
  })

  describe('and click today', function() {
    it('should change view to prev month', function() {
      options.defaultDate = '2010-03-15' // something other than the `now` date
      $('#calendar').fullCalendar(options)
      $('.fc-footer-toolbar .fc-today-button').simulate('click')
      var newDate = $('#calendar').fullCalendar('getDate') // will be ambig zone
      expect(newDate).toEqualMoment('2010-02-01')
    })
  })
})
