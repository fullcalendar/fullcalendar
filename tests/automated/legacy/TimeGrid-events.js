import { getEventElAtIndex, getEventElTimeEl, getSingleEl } from '../event-render/EventRenderUtils'

describe('TimeGrid event rendering', function() {

  pushOptions({
    defaultDate: '2014-08-23',
    defaultView: 'timeGridWeek',
    scrollTime: '00:00:00'
  })

  it('renders the start and end time of an event that spans only 1 day', function() {
    initCalendar({
      events: [ {
        title: 'event1',
        start: '2014-08-18T02:00:00',
        end: '2014-08-18T22:00:00'
      } ]
    })
    expect(getEventElTimeEl(getSingleEl())).toHaveText('2:00 - 10:00')
  })

  it('renders time to/from midnight for an event that spans two days', function() {
    initCalendar({
      events: [ {
        title: 'event1',
        start: '2014-08-18T02:00:00',
        end: '2014-08-19T22:00:00'
      } ]
    })
    var seg1 = getEventElAtIndex(0)
    var seg2 = getEventElAtIndex(1)
    expect(getEventElTimeEl(seg1)).toHaveText('2:00 - 12:00')
    expect(getEventElTimeEl(seg2)).toHaveText('12:00 - 10:00')
  })

  it('renders no time on an event segment that spans through an entire day', function() {
    initCalendar({
      events: [ {
        title: 'event1',
        start: '2014-08-18T02:00:00',
        end: '2014-08-20T22:00:00'
      } ]
    })
    var seg2 = getEventElAtIndex(1)
    expect(seg2).toBeInDOM()
    expect(getEventElTimeEl(seg2)).not.toBeInDOM()
  })

  it('renders an event with no url with no <a> href', function() {
    initCalendar({
      events: [ {
        title: 'event1',
        start: '2014-08-18T02:00:00'
      } ]
    })
    var seg = getSingleEl()
    expect(seg).not.toHaveAttr('href')
  })

  it('renders an event with a url with an <a> href', function() {
    initCalendar({
      events: [ {
        title: 'event1',
        start: '2014-08-18T02:00:00',
        url: 'http://google.com/'
      } ]
    })
    var seg = getSingleEl()
    expect(seg).toHaveAttr('href')
  })

})
