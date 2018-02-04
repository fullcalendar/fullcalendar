
describe('eventOrder', function() {
  pushOptions({
    defaultDate: '2018-01-01',
    defaultView: 'month',
    events: [ // all the same datetime!
      { id: 'z', title: 'a', start: '2018-01-01T09:00:00', myOrder: 3 },
      { id: 'y', title: 'b', start: '2018-01-01T09:00:00', myOrder: 1 },
      { id: 'x', title: 'c', start: '2018-01-01T09:00:00', myOrder: 2 }
    ],
    eventRender: function(eventObj, el) {
      el.data('event-id', eventObj.id)
    }
  })

  it('sorts by title by default', function() {
    initCalendar()
    expect(getEventOrder()).toEqual([ 'z', 'y', 'x' ])
  })

  it('can sort by a standard prop', function() {
    initCalendar({
      eventOrder: 'id'
    })
    expect(getEventOrder()).toEqual([ 'x', 'y', 'z' ])
  })

  it('can sort by a non-standard prop', function() {
    initCalendar({
      eventOrder: 'myOrder'
    })
    expect(getEventOrder()).toEqual([ 'y', 'x', 'z' ])
  })

  function getEventOrder() {
    return $('.fc-event').map(function(i, node) {
      return $(node).data('event-id')
    }).get()
  }
})
