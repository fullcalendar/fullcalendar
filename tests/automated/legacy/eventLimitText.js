describe('eventLimitText', function() {

  pushOptions({
    defaultDate: '2014-08-01', // important that it is the first week, so works w/ month + week views
    defaultView: 'month',
    eventLimit: 3,
    events: [
      { title: 'event1', start: '2014-07-29' },
      { title: 'event2', start: '2014-07-29' },
      { title: 'event2', start: '2014-07-29' },
      { title: 'event2', start: '2014-07-29' }
    ]
  })

  it('allows a string', function() {
    initCalendar({
      eventLimitText: 'extra'
    })
    expect($('.fc-more')).toHaveText('+2 extra')
  })

  it('allows a function', function() {
    initCalendar({
      eventLimitText: function(n) {
        expect(typeof n).toBe('number')
        return 'there are ' + n + ' more events!'
      }
    })
    expect($('.fc-more')).toHaveText('there are 2 more events!')
  })

  it('has a default value that is affected by the custom locale', function() {
    initCalendar({
      locale: 'fr'
    })
    expect($('.fc-more')).toHaveText('+2 en plus')
  })

  it('is not affected by a custom locale when the value is explicitly specified', function() {
    initCalendar({
      locale: 'fr',
      eventLimitText: 'extra'
    })
    expect($('.fc-more')).toHaveText('+2 extra')
  })
})
