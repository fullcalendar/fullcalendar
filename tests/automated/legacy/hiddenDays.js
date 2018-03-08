
describe('hiddenDays', function() {

  describe('when using default', function() {
    it('should show 7 days of the week', function() {
      initCalendar()

      var daysCount = $('.fc-day-header').length
      expect(daysCount).toEqual(7)
    })
  })

  describe('when setting an empty hiddenDays', function() {
    pushOptions({
      hiddenDays: []
    })
    
    it('should return 7 days of the week', function() {
      var daysCount = $('.fc-day-header').length
      expect(daysCount).toEqual(7)
    })
  })

  describe('when setting hiddenDays with 1', function() {
    pushOptions({
        hiddenDays: [ 1 ]
    })

    it('should return 6 days', function() {
      var daysCount = $('.fc-day-header').length
      expect(daysCount).toEqual(6)
    })
    it('should return sun,tue,wed..sat days', function() {
      var daysOfWeek = $('.fc-day-header')
      expect(daysOfWeek[0]).toHaveClass('fc-sun')
      expect(daysOfWeek[1]).toHaveClass('fc-tue')
      expect(daysOfWeek[5]).toHaveClass('fc-sat')
    })
    it('should expect 7th day to be undefined', function() {
      var daysOfWeek = $('.fc-day-header')
      expect(daysOfWeek[6]).toBeUndefined()
    })
  })

  describe('when setting hiddenDays with 3,5', function() {
    pushOptions({
      hiddenDays: [ 3, 5 ]
    })

    it('should return 6 days', function() {
      var daysCount = $('.fc-day-header').length
      expect(daysCount).toEqual(5)
    })
    it('should return s,m,t,t,s ', function() {
      var daysOfWeek = $('.fc-day-header')
      expect(daysOfWeek[0]).toHaveClass('fc-sun')
      expect(daysOfWeek[1]).toHaveClass('fc-mon')
      expect(daysOfWeek[2]).toHaveClass('fc-tue')
      expect(daysOfWeek[3]).toHaveClass('fc-thu')
      expect(daysOfWeek[4]).toHaveClass('fc-sat')
    })
    it('should expect wed and fri be undefined', function() {
      var fri = $('.fc-day-header.fc-fri')[0]
      var wed = $('.fc-day-header.fc-wed')[0]
      expect(fri).toBeUndefined()
      expect(wed).toBeUndefined()
    })
  })

  describe('when setting all hiddenDays', function() {
    it('should expect to throw an exception', function() {
      var options = {
        hiddenDays: [ 0, 1, 2, 3, 4, 5, 6 ]
      }
      expect(function() {
        initCalendar(options)
      }).toThrow(new Error('invalid hiddenDays'))
    })
  })
})
