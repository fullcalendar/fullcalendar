import { findFcEvent, findScroller, createCalElement } from '../lib/events'

describe('refetchEvents', function() {

  it('retains scroll when in month view', function() {
    var el = createCalElement({style:"width:300px"}).appendTo('body')
    var scrollEl
    var scrollTop

    initCalendar({
      defaultView: 'month',
      defaultDate: '2017-04-25',
      events: [
        { start: '2017-04-04', title: 'event' },
        { start: '2017-04-04', title: 'event' },
        { start: '2017-04-04', title: 'event' },
        { start: '2017-04-04', title: 'event' },
        { start: '2017-04-04', title: 'event' },
        { start: '2017-04-04', title: 'event' },
        { start: '2017-04-04', title: 'event' },
        { start: '2017-04-04', title: 'event' }
      ]
    }, el)

    expect(findFcEvent().length).toBe(8)

    scrollEl = findScroller(el)
    scrollEl.scrollTop(1000)
    scrollTop = scrollEl.scrollTop()

    // verify that we queried the correct scroller el
    expect(scrollTop).toBeGreaterThan(10)

    currentCalendar.refetchEvents()
    expect(findFcEvent().length).toBe(8)
    expect(scrollEl.scrollTop()).toBe(scrollTop)
  })
})
