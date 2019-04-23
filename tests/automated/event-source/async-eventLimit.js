
// https://github.com/fullcalendar/fullcalendar/issues/4585
// more related to the 'more+' link than to async event sources
describe('async event source rendering with eventLimit', function() {

  it('works', function(done) {
    let cnt = 0

    initCalendar({
      defaultView: 'dayGridMonth',
      eventLimit: 2,
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridWeek,dayGridMonth'
      },
      eventSources: [
        getEvents,
        getEvents
      ],
      _eventsPositioned() { // why can't use spyOnCalendarCallback :(
        cnt++
        if (cnt === 1) {
          currentCalendar.next()
          setTimeout(done, 1) // after the async fetch
        }
      }
    })
  })

  function getEvents(fetchInfo, success) {
    let date = fetchInfo.start
    let events = []

    while (date.getTime() < fetchInfo.end.getTime()) {
      events.push({
        title: 'Event ' + date.getDate(),
        start: date,
        end: new Date(date.getTime() + 1000 * 60 * 60 * 60),
        allDay: false
      })

      date = new Date(date.getTime() + 1000 * 60 * 60 * 24)
    }

    setTimeout(function() {
      success(events)
    }, 0)
  }

})
