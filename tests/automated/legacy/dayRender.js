
describe('dayRender', function() {

  it('is triggered upon initialization of a view, with correct parameters', function() {
    var options = {
      defaultView: 'month',
      fixedWeekCount: true,
      defaultDate: '2014-05-01',
      dayRender: function(date, cell) {
        expect(moment.isMoment(date)).toEqual(true)
        expect(date.hasTime()).toEqual(false)
        expect(date.format()).toEqual(cell.data('date'))
        expect(cell).toBeInDOM()
      }
    }

    spyOn(options, 'dayRender').and.callThrough()
    initCalendar(options)
    expect(options.dayRender.calls.count()).toEqual(42)
  })

  it('is called when view is changed', function() {
    var options = {
      defaultView: 'month',
      fixedWeekCount: true,
      defaultDate: '2014-05-01',
      dayRender: function(date, cell) { }
    }

    spyOn(options, 'dayRender').and.callThrough()
    initCalendar(options)
    options.dayRender.calls.reset()
    currentCalendar.changeView('basicWeek')
    expect(options.dayRender.calls.count()).toEqual(7)
  })

  // called if the date is navigated to a different visible range
  it('is called when view is changed', function() {
    var options = {
      defaultView: 'basicWeek',
      defaultDate: '2014-05-01',
      dayRender: function(date, cell) { }
    }

    spyOn(options, 'dayRender').and.callThrough()
    initCalendar(options)
    options.dayRender.calls.reset()
    currentCalendar.gotoDate('2014-05-04') // a day in the next week
    expect(options.dayRender.calls.count()).toEqual(7)
  })

  it('won\'t be called when date is navigated but remains in the current visible range', function() {
    var options = {
      defaultView: 'basicWeek',
      defaultDate: '2014-05-01',
      dayRender: function(date, cell) { }
    }

    spyOn(options, 'dayRender').and.callThrough()
    initCalendar(options)
    options.dayRender.calls.reset()
    currentCalendar.gotoDate('2014-05-02') // a day in the same week
    expect(options.dayRender.calls.count()).toEqual(0)
  })

  it('allows you to modify the element', function() {
    var options = {
      defaultView: 'month',
      fixedWeekCount: true,
      defaultDate: '2014-05-01',
      dayRender: function(date, cell) {
        if (date.format() === '2014-05-01') {
          cell.addClass('mycustomclass')
        }
      }
    }

    initCalendar(options)
    expect($(currentCalendar.el).find('td[data-date="2014-05-01"]')).toHaveClass('mycustomclass')
  })

})
