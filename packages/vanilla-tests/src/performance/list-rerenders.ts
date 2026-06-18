import { strictModeFactor } from 'fullcalendar/protected-api'

it('list view rerenders well', (done) => {
  let dayRenderCnt = 0
  let eventRenderCnt = 0
  let noEventsRenderCnt = 0

  let calendar = initCalendar({
    initialView: 'listWeek',
    initialDate: '2017-10-04',
    events: [
      { title: 'event 0', start: '2017-10-04' },
    ],
    listDayHeaderContent() {
      dayRenderCnt += 1
    },
    eventContent() {
      eventRenderCnt += 1
      return true
    },
    noEventsContent() {
      noEventsRenderCnt += 1
    },
  })

  function resetCounts() {
    dayRenderCnt = 0
    eventRenderCnt = 0
    noEventsRenderCnt = 0
  }

  expect(dayRenderCnt).toBe(2 * strictModeFactor) // there are two "inner" contents
  expect(eventRenderCnt).toBe(1 * strictModeFactor)
  expect(noEventsRenderCnt).toBe(0 * strictModeFactor)

  resetCounts()
  calendar.next()
  expect(dayRenderCnt).toBe(0 * strictModeFactor) // no days
  expect(eventRenderCnt).toBe(0 * strictModeFactor) // event will be out of view
  expect(noEventsRenderCnt).toBe(1 * strictModeFactor)

  calendar.changeView('dayGridWeek') // switch away
  resetCounts()
  calendar.changeView('listWeek') // return to view
  expect(dayRenderCnt).toBe(0 * strictModeFactor)
  expect(eventRenderCnt).toBe(0 * strictModeFactor)
  expect(noEventsRenderCnt).toBe(1 * strictModeFactor)

  resetCounts()
  $(window).simulate('resize')
  setTimeout(() => {
    expect(dayRenderCnt).toBe(0 * strictModeFactor)
    expect(eventRenderCnt).toBe(0 * strictModeFactor)
    expect(noEventsRenderCnt).toBe(0 * strictModeFactor)

    done()
  }, 1)
})
