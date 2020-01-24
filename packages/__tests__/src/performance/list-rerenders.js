import { ListView } from '@fullcalendar/list'
import ComponentSpy from '../lib/ComponentSpy'


it('list view rerenders well', function(done) {
  let listSpy = new ComponentSpy(ListView)
  let eventRenderCnt = 0

  initCalendar({
    defaultView: 'listWeek',
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
    listSpy.resetCounts()
    eventRenderCnt = 0
  }

  function expectSomeViewRendering() {
    expect(listSpy.renderCount).toBeLessThanOrEqual(2)
    expect(listSpy.sizingCount).toBeLessThanOrEqual(2)
  }

  function expectNoViewRendering() {
    expect(listSpy.renderCount).toBe(0)
    expect(listSpy.sizingCount).toBe(0)
  }

  expectSomeViewRendering()
  expect(eventRenderCnt).toBe(1)

  resetCounts()
  currentCalendar.next()
  expectSomeViewRendering()
  expect(eventRenderCnt).toBe(0) // event will be out of view

  resetCounts()
  currentCalendar.changeView('dayGridWeek') // switch away
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
    expect(listSpy.renderCount).toBeLessThanOrEqual(1)
    expect(listSpy.sizingCount).toBeLessThanOrEqual(2)
    expect(eventRenderCnt).toBe(0)

    listSpy.detach()

    done()
  }, 1) // more than windowResizeDelay
})
