
describe('rerendering a calendar', function() {

  it('keeps sizing', function() {
    initCalendar({
      defaultView: 'dayGridMonth',
      defaultDate: '2019-08-08',
      eventLimit: 3,
      events: [
        { date: '2019-08-08', title: 'event' },
        { date: '2019-08-08', title: 'event' },
        { date: '2019-08-08', title: 'event' },
        { date: '2019-08-08', title: 'event' }
      ]
    })

    expect(getMoreLinkCnt()).toBe(1)
    currentCalendar.render()
    expect(getMoreLinkCnt()).toBe(1) // good way to test that sizing is maintained
  })

  function getMoreLinkCnt() {
    return $('.fc-more').length
  }

})
