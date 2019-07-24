
describe('dayGrid view rendering', function() {

  pushOptions({
    defaultView: 'dayGridMonth'
  })

  describe('when dir is ltr', function() {

    pushOptions({
      dir: 'ltr'
    })

    it('should have days ordered sun to sat', function() {
      initCalendar()
      var fc = $(currentCalendar.el).find('.fc-day-header')
      expect(fc[0]).toHaveClass('fc-sun')
      expect(fc[1]).toHaveClass('fc-mon')
      expect(fc[2]).toHaveClass('fc-tue')
      expect(fc[3]).toHaveClass('fc-wed')
      expect(fc[4]).toHaveClass('fc-thu')
      expect(fc[5]).toHaveClass('fc-fri')
      expect(fc[6]).toHaveClass('fc-sat')
    })
  })

  describe('when dir is rtl', function() {

    pushOptions({
      dir: 'rtl'
    })

    it('should have days ordered sat to sun', function() {
      initCalendar()
      var fc = $(currentCalendar.el).find('.fc-day-header')
      expect(fc[0]).toHaveClass('fc-sat')
      expect(fc[1]).toHaveClass('fc-fri')
      expect(fc[2]).toHaveClass('fc-thu')
      expect(fc[3]).toHaveClass('fc-wed')
      expect(fc[4]).toHaveClass('fc-tue')
      expect(fc[5]).toHaveClass('fc-mon')
      expect(fc[6]).toHaveClass('fc-sun')
    })
  })

})
