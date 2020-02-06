import { DayHeader } from '@fullcalendar/core'
import { Table } from '@fullcalendar/daygrid'
import ComponentSpy from '../lib/ComponentSpy'


it('daygrid view rerenders well', function(done) {
  let headerSpy = new ComponentSpy(DayHeader)
  let gridSpy = new ComponentSpy(Table)
  let eventRenderCnt = 0

  initCalendar({
    defaultView: 'dayGridMonth',
    defaultDate: '2017-10-04',
    windowResizeDelay: 0,
    eventRender() {
      eventRenderCnt++
    },
    events: [
      { title: 'event 0', start: '2017-10-04' }
    ]
  })

  function resetCounts() {
    headerSpy.resetCounts()
    gridSpy.resetCounts()
    eventRenderCnt = 0
  }

  function expectHeaderRendered(bool) {
    expect(headerSpy.renderCount).toBe(bool ? 1 : 0)
  }

  function expectGridRendered(bool) {
    // 2nd render is for shrinkWidth
    expect(gridSpy.renderCount).toBeLessThanOrEqual(bool ? 2 : 0)
  }

  expectHeaderRendered(true)
  expectGridRendered(true)
  expect(eventRenderCnt).toBe(1)

  resetCounts()
  currentCalendar.next()
  expectHeaderRendered(true)
  expectGridRendered(true)
  expect(eventRenderCnt).toBe(0) // event will be out of view

  resetCounts()
  currentCalendar.changeView('listWeek') // switch away
  expectHeaderRendered(false)
  expectGridRendered(false)
  expect(eventRenderCnt).toBe(0)

  resetCounts()
  currentCalendar.changeView('dayGridMonth') // return to view
  expectHeaderRendered(true)
  expectGridRendered(true)
  expect(eventRenderCnt).toBe(0) // event still out of view

  resetCounts()
  $(window).simulate('resize')
  setTimeout(function() {

    expectHeaderRendered(false)
    expectGridRendered(true) // receives new coords
    expect(eventRenderCnt).toBe(0)

    headerSpy.detach()
    gridSpy.detach()

    done()
  }, 1) // more than windowResizeDelay
})
