describe('now', function() {

  pushOptions({
    defaultDate: '2014-05-01'
  })

  describe('when month view', function() {
    pushOptions({
      defaultView: 'month'
    })
    it('changes the highlighted day when customized', function() {
      initCalendar({
        now: '2014-05-06'
      })
      var todayCell = $('td.fc-today', currentCalendar.el)
      var todayDate = todayCell.data('date')
      expect(todayDate).toEqual('2014-05-06')
    })
  })

  describe('when week view', function() {
    pushOptions({
      defaultView: 'week'
    })
    it('changes the highlighted day when customized', function() {
      initCalendar({
        now: '2014-04-29T12:00:00'
      })
      var todayCell = $('td.fc-today', currentCalendar.el)
      expect(todayCell.data('date')).toBe('2014-04-29')
    })
  })

  it('accepts a function that returns a Date', function() {
    initCalendar({
      defaultView: 'month',
      now: function() {
        return new Date('2014-05-01')
      }
    })
    var todayCell = $('td.fc-today', currentCalendar.el)
    var todayDate = todayCell.data('date')
    expect(todayDate).toEqual('2014-05-01')
  })

  it('accepts a function that returns a date string', function() {
    initCalendar({
      defaultView: 'month',
      now: function() {
        return '2014-05-01'
      }
    })
    var todayCell = $('td.fc-today', currentCalendar.el)
    var todayDate = todayCell.data('date')
    expect(todayDate).toEqual('2014-05-01')
  })

})
