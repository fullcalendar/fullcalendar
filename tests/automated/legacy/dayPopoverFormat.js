describe('dayPopoverFormat', function() {

  pushOptions({
    defaultDate: '2014-08-01',
    eventLimit: 3,
    events: [
      { title: 'event1', start: '2014-07-28', end: '2014-07-30', className: 'event1' },
      { title: 'event2', start: '2014-07-29', end: '2014-07-31', className: 'event2' },
      { title: 'event3', start: '2014-07-29', className: 'event3' },
      { title: 'event4', start: '2014-07-29', className: 'event4' }
    ]
  })

  it('can be set to a custom value', function() {
    initCalendar({
      dayPopoverFormat: 'ddd, MMMM'
    })
    $('.fc-more').simulate('click')
    expect($('.fc-more-popover > .fc-header .fc-title')).toHaveText('Tue, July')
  })

  it('is affected by the current locale when the value is default', function() {
    initCalendar({
      locale: 'fr'
    })
    $('.fc-more').simulate('click')
    expect($('.fc-more-popover > .fc-header .fc-title')).toHaveText('29 juillet 2014')
  })

  it('still maintains the same format when explicitly set, and there is a locale', function() {
    initCalendar({
      locale: 'fr',
      dayPopoverFormat: 'YYYY'
    })
    $('.fc-more').simulate('click')
    expect($('.fc-more-popover > .fc-header .fc-title')).toHaveText('2014')
  })

})
