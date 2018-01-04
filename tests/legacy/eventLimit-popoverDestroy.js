describe('eventLimit popover', function() {

  pushOptions({
    defaultView: 'month',
    defaultDate: '2014-08-01',
    eventLimit: 3,
    events: [
      { title: 'event1', start: '2014-07-28', end: '2014-07-30', className: 'event1' },
      { title: 'event2', start: '2014-07-29', end: '2014-07-31', className: 'event2' },
      { title: 'event3', start: '2014-07-29', className: 'event3' },
      { title: 'event4', start: '2014-07-29', className: 'event4' }
    ],
    popoverViewportConstrain: false, // because PhantomJS window is small, don't do smart repositioning
    handleWindowResize: false // because showing the popover causes scrollbars and fires resize
  })

  it('closes when user clicks the X and trigger eventDestroy for every render', function() {
    var eventsRendered = {}
    var renderCount = 0
    var activated = false
    initCalendar({
      eventRender: function(eventObject, element, view) {
        if (activated) {
          eventsRendered[eventObject.title] = eventObject
          ++renderCount
        }
      },
      eventDestroy: function(eventObject, element, view) {
        delete eventsRendered[eventObject.title]
        --renderCount
      }
    })
    // Activate flags and pop event limit popover
    activated = true
    $('.fc-more').simulate('click')

    expect($('.fc-more-popover')).toBeVisible()
    $('.fc-more-popover .fc-close')
      .simulate('click')
    expect($('.fc-more-popover')).not.toBeVisible()
    expect(Object.keys(eventsRendered).length).toEqual(0)
    expect(renderCount).toEqual(0)
  })

  it('closes when user clicks outside of the popover and trigger eventDestroy for every render', function() {
    var eventsRendered = {}
    var renderCount = 0
    var activated = false
    initCalendar({
      eventRender: function(eventObject, element, view) {
        if (activated) {
          eventsRendered[eventObject.title] = eventObject
          ++renderCount
        }
      },
      eventDestroy: function(eventObject, element, view) {
        delete eventsRendered[eventObject.title]
        --renderCount
      }
    })
    // Activate flags and pop event limit popover
    activated = true
    $('.fc-more').simulate('click')

    expect($('.fc-more-popover')).toBeVisible()
    $('body').simulate('mousedown').simulate('click')
    expect($('.fc-more-popover')).not.toBeVisible()
    expect(Object.keys(eventsRendered).length).toEqual(0)
    expect(renderCount).toEqual(0)
  })
})
