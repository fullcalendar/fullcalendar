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

  function expectSomeViewRendering() {
    expect(headerSpy.renderCount).toBeLessThanOrEqual(2)
    expect(gridSpy.renderCount).toBeLessThanOrEqual(2)
    expect(gridSpy.sizingCount).toBeLessThanOrEqual(2)
  }

  function expectNoViewRendering() {
    expect(headerSpy.renderCount).toBe(0)
    expect(gridSpy.renderCount).toBe(0)
    expect(gridSpy.sizingCount).toBe(0)
  }

  expectSomeViewRendering()
  expect(eventRenderCnt).toBe(1)

  resetCounts()
  currentCalendar.next()
  expectSomeViewRendering()
  expect(eventRenderCnt).toBe(0) // event will be out of view

  resetCounts()
  currentCalendar.changeView('listWeek') // switch away
  expectNoViewRendering()
  expect(eventRenderCnt).toBe(0)

  resetCounts()
  currentCalendar.changeView('dayGridMonth') // return to view
  expectSomeViewRendering()
  expect(eventRenderCnt).toBe(0) // event still out of view

  resetCounts()
  $(window).simulate('resize')
  setTimeout(function() {

    // allow some rerendering as a result of handleSizing, but that's it
    expect(headerSpy.renderCount).toBeLessThanOrEqual(1)
    expect(gridSpy.renderCount).toBeLessThanOrEqual(1)
    expect(gridSpy.sizingCount).toBeLessThanOrEqual(2)
    expect(eventRenderCnt).toBe(0)

    headerSpy.detach()
    gridSpy.detach()

    done()
  }, 1) // more than windowResizeDelay
})
