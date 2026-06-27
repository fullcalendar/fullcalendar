import { strictModeFactor } from 'fullcalendar/protected-api'

it('timegrid view rerenders well', (done) => {
  let dayHeaderRenderCnt = 0
  let dayCellRenderCnt = 0
  let dayLaneRenderCnt = 0
  let slotHeaderRenderCnt = 0
  let slotLaneRenderCnt = 0
  let eventRenderCnt = 0

  let calendar = initCalendar({
    initialView: 'timeGridWeek',
    initialDate: '2017-10-04',
    events: [
      { title: 'event 0', start: '2017-10-04T00:00:00' },
    ],
    dayHeaderContent() {
      dayHeaderRenderCnt += 1
      return true
    },
    dayCellDidMount() {
      dayCellRenderCnt += 1
    },
    dayLaneDidMount() {
      dayLaneRenderCnt += 1
    },
    slotHeaderContent() {
      slotHeaderRenderCnt += 1
      return true
    },
    slotLaneDidMount() {
      slotLaneRenderCnt += 1
    },
    eventContent() {
      eventRenderCnt += 1
      return true
    },
  })

  function resetCounts() {
    dayHeaderRenderCnt = 0
    dayCellRenderCnt = 0
    dayLaneRenderCnt = 0
    slotHeaderRenderCnt = 0
    slotLaneRenderCnt = 0
    eventRenderCnt = 0
  }

  expect(dayHeaderRenderCnt).toBe(7 * strictModeFactor)
  expect(dayCellRenderCnt).toBe(7 * strictModeFactor)
  expect(dayLaneRenderCnt).toBe(7 * strictModeFactor)
  expect(slotHeaderRenderCnt).toBe(24 * strictModeFactor) // one slot per every 2 lanes
  expect(slotLaneRenderCnt).toBe(48 * strictModeFactor)
  expect(eventRenderCnt).toBe(1 * strictModeFactor)

  resetCounts()
  calendar.next()
  expect(dayHeaderRenderCnt).toBe(7 * strictModeFactor)
  expect(dayCellRenderCnt).toBe(7 * strictModeFactor)
  expect(dayLaneRenderCnt).toBe(7 * strictModeFactor)
  expect(slotHeaderRenderCnt).toBe(0 * strictModeFactor)
  expect(slotLaneRenderCnt).toBe(0 * strictModeFactor)
  expect(eventRenderCnt).toBe(0 * strictModeFactor) // event will be out of view

  calendar.changeView('listWeek') // switch away
  resetCounts()
  calendar.changeView('timeGridWeek') // return to view
  expect(dayHeaderRenderCnt).toBe(7 * strictModeFactor)
  expect(dayCellRenderCnt).toBe(7 * strictModeFactor)
  expect(dayLaneRenderCnt).toBe(7 * strictModeFactor)
  expect(slotHeaderRenderCnt).toBe(24 * strictModeFactor)
  expect(slotLaneRenderCnt).toBe(48 * strictModeFactor)
  expect(eventRenderCnt).toBe(0 * strictModeFactor) // event still out of view

  resetCounts()
  $(window).simulate('resize')
  setTimeout(() => {
    expect(dayHeaderRenderCnt).toBe(0 * strictModeFactor)
    expect(dayCellRenderCnt).toBe(0 * strictModeFactor)
    expect(dayLaneRenderCnt).toBe(0 * strictModeFactor)
    expect(slotHeaderRenderCnt).toBe(0 * strictModeFactor)
    expect(slotLaneRenderCnt).toBe(0 * strictModeFactor)
    expect(eventRenderCnt).toBe(0 * strictModeFactor)

    done()
  }, 1)
})
