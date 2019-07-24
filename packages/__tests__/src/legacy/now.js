import { parseUtcDate } from '../lib/date-parsing'

describe('now', function() {

  pushOptions({
    defaultDate: '2014-05-01'
  })

  describe('when month view', function() {
    pushOptions({
      defaultView: 'dayGridMonth'
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
      defaultView: 'timeGridWeek'
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
      defaultView: 'dayGridMonth',
      now: function() {
        return parseUtcDate('2014-05-01')
      }
    })
    var todayCell = $('td.fc-today', currentCalendar.el)
    var todayDate = todayCell.data('date')
    expect(todayDate).toEqual('2014-05-01')
  })

  it('accepts a function that returns a date string', function() {
    initCalendar({
      defaultView: 'dayGridMonth',
      now: function() {
        return '2014-05-01'
      }
    })
    var todayCell = $('td.fc-today', currentCalendar.el)
    var todayDate = todayCell.data('date')
    expect(todayDate).toEqual('2014-05-01')
  })

})
