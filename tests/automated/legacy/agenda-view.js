
describe('agenda view rendering', function() {

  describe('when isRTL is false', function() {
    pushOptions({
      defaultView: 'agendaWeek',
      isRTL: false
    })

    it('should have have days ordered sun to sat', function() {
      initCalendar()
      var headers = $('.fc-view > table > thead th')
      expect(headers[0]).toHaveClass('fc-axis')
      expect(headers[1]).toHaveClass('fc-sun')
      expect(headers[2]).toHaveClass('fc-mon')
      expect(headers[3]).toHaveClass('fc-tue')
      expect(headers[4]).toHaveClass('fc-wed')
      expect(headers[5]).toHaveClass('fc-thu')
      expect(headers[6]).toHaveClass('fc-fri')
      expect(headers[7]).toHaveClass('fc-sat')
    })
  })

  describe('when isRTL is true', function() {
    pushOptions({
      defaultView: 'agendaWeek',
      isRTL: true
    })

    it('should have have days ordered sat to sun', function() {
      initCalendar()
      var headers = $('.fc-view > table > thead th')
      expect(headers[0]).toHaveClass('fc-sat')
      expect(headers[1]).toHaveClass('fc-fri')
      expect(headers[2]).toHaveClass('fc-thu')
      expect(headers[3]).toHaveClass('fc-wed')
      expect(headers[4]).toHaveClass('fc-tue')
      expect(headers[5]).toHaveClass('fc-mon')
      expect(headers[6]).toHaveClass('fc-sun')
      expect(headers[7]).toHaveClass('fc-axis')
    })
  })

})
