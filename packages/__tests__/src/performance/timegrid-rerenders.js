import { DayHeader } from '@fullcalendar/core'
import { Table } from '@fullcalendar/daygrid'
import { TimeCols } from '@fullcalendar/timegrid'
import ComponentSpy from '../lib/ComponentSpy'


it('timegrid view rerenders well', function(done) {
  let headerSpy = new ComponentSpy(DayHeader)
  let dayGridSpy = new ComponentSpy(Table)
  let timeGridSpy = new ComponentSpy(TimeCols)
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
    dayGridSpy.resetCounts()
    timeGridSpy.resetCounts()
    eventRenderCnt = 0
  }

  function expectSomeViewRendering() {
    expect(headerSpy.renderCount).toBeLessThanOrEqual(2)
    expect(dayGridSpy.renderCount).toBeLessThanOrEqual(2)
    expect(dayGridSpy.sizingCount).toBeLessThanOrEqual(2)
    expect(timeGridSpy.renderCount).toBeLessThanOrEqual(2)
    expect(timeGridSpy.sizingCount).toBeLessThanOrEqual(2)
  }

  function expectNoViewRendering() {
    expect(headerSpy.renderCount).toBe(0)
    expect(dayGridSpy.renderCount).toBe(0)
    expect(dayGridSpy.sizingCount).toBe(0)
    expect(timeGridSpy.renderCount).toBe(0)
    expect(timeGridSpy.sizingCount).toBe(0)
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
  currentCalendar.changeView('timeGridWeek') // return to view
  expectSomeViewRendering()
  expect(eventRenderCnt).toBe(0) // event still out of view

  resetCounts()
  $(window).simulate('resize')
  setTimeout(function() {

    // allow some rerendering as a result of handleSizing, but that's it
    expect(headerSpy.renderCount).toBeLessThanOrEqual(1)
    expect(dayGridSpy.renderCount).toBeLessThanOrEqual(1)
    expect(dayGridSpy.sizingCount).toBeLessThanOrEqual(2)
    expect(timeGridSpy.renderCount).toBeLessThanOrEqual(1)
    expect(timeGridSpy.sizingCount).toBeLessThanOrEqual(2)
    expect(eventRenderCnt).toBe(0)

    headerSpy.detach()
    dayGridSpy.detach()
    timeGridSpy.detach()

    done()
  }, 1) // more than windowResizeDelay
})
