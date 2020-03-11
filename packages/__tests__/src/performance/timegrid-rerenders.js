import { DayHeader } from '@fullcalendar/core'
// import { TimeColsSlatsBody, TimeColsContentBody } from '@fullcalendar/timegrid'
import ComponentSpy from '../lib/ComponentSpy'


it('timegrid view rerenders well', function(done) {
  let headerSpy = new ComponentSpy(DayHeader)
  let slatsSpy = new ComponentSpy(null) // TimeColsSlatsBody)
  let colContentSpy = new ComponentSpy(null) // TimeColsContentBody)
  let eventRenderCnt = 0

  initCalendar({
    defaultView: 'timeGridWeek',
    defaultDate: '2017-10-04',
    windowResizeDelay: 0,
    eventRender() {
      eventRenderCnt++
    },
    events: [
      { title: 'event 0', start: '2017-10-04T00:00:00' }
    ]
  })

  function resetCounts() {
    headerSpy.resetCounts()
    slatsSpy.resetCounts()
    colContentSpy.resetCounts()
    eventRenderCnt = 0
  }

  function expectHeaderRendered(bool) {
    expect(headerSpy.renderCount).toBe(bool ? 1 : 0)
  }

  function expectSlatsRendered(bool) {
    expect(slatsSpy.renderCount).toBe(bool ? 1 : 0)
  }

  function expectColContentRendered(bool) {
    // 2nd rerender is when receives slat coords
    expect(colContentSpy.renderCount).toBeLessThanOrEqual(bool ? 2 : 0)
  }

  expectHeaderRendered(true)
  expectSlatsRendered(true)
  expectColContentRendered(true)
  expect(eventRenderCnt).toBe(1)

  resetCounts()
  currentCalendar.next()
  expectHeaderRendered(true)
  expectSlatsRendered(true)
  expectColContentRendered(true)
  expect(eventRenderCnt).toBe(0) // event will be out of view

  resetCounts()
  currentCalendar.changeView('listWeek') // switch away
  expectHeaderRendered(false)
  expectSlatsRendered(false)
  expectColContentRendered(false)
  expect(eventRenderCnt).toBe(0)

  resetCounts()
  currentCalendar.changeView('timeGridWeek') // return to view
  expectHeaderRendered(true)
  expectSlatsRendered(true)
  expectColContentRendered(true)
  expect(eventRenderCnt).toBe(0) // event still out of view

  resetCounts()
  $(window).simulate('resize')
  setTimeout(function() {

    expectHeaderRendered(false)
    expectSlatsRendered(false)
    expectColContentRendered(true) // should have adjust based of new slat coords
    expect(eventRenderCnt).toBe(0)

    headerSpy.detach()
    slatsSpy.detach()
    colContentSpy.detach()

    done()
  }, 1) // more than windowResizeDelay
})
