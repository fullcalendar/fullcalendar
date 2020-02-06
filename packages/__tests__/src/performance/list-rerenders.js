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

  function expectViewRendered(bool) {
    expect(listSpy.renderCount).toBe(bool ? 1 : 0)
  }

  expectViewRendered(true)
  expect(eventRenderCnt).toBe(1)

  resetCounts()
  currentCalendar.next()
  expectViewRendered(true)
  expect(eventRenderCnt).toBe(0) // event will be out of view

  resetCounts()
  currentCalendar.changeView('dayGridWeek') // switch away
  expectViewRendered(false)
  expect(eventRenderCnt).toBe(0)

  resetCounts()
  currentCalendar.changeView('listWeek') // return to view
  expectViewRendered(true)
  expect(eventRenderCnt).toBe(0) // event still out of view

  resetCounts()
  $(window).simulate('resize')
  setTimeout(function() {

    expect(listSpy.renderCount).toBe(0)
    expect(eventRenderCnt).toBe(0)

    listSpy.detach()

    done()
  }, 1) // more than windowResizeDelay
})
