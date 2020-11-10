it('timegrid view rerenders well', (done) => {
  let dayHeaderRenderCnt = 0
  let dayCellRenderCnt = 0
  let slotLabelRenderCnt = 0
  let slotLaneRenderCnt = 0
  let eventRenderCnt = 0

  let calendar = initCalendar({
    initialView: 'timeGridWeek',
    initialDate: '2017-10-04',
    windowResizeDelay: 0,
    events: [
      { title: 'event 0', start: '2017-10-04T00:00:00' },
    ],
    dayHeaderContent() {
      dayHeaderRenderCnt += 1
    },
    dayCellContent() {
      dayCellRenderCnt += 1
    },
    slotLabelContent() {
      slotLabelRenderCnt += 1
    },
    slotLaneContent() {
      slotLaneRenderCnt += 1
    },
    eventContent() {
      eventRenderCnt += 1
    },
  })

  function resetCounts() {
    dayHeaderRenderCnt = 0
    dayCellRenderCnt = 0
    slotLabelRenderCnt = 0
    slotLaneRenderCnt = 0
    eventRenderCnt = 0
  }

  expect(dayHeaderRenderCnt).toBe(7)
  expect(dayCellRenderCnt).toBe(14) // all-day row AND time cols
  expect(slotLabelRenderCnt).toBe(24) // one slot per every 2 lanes
  expect(slotLaneRenderCnt).toBe(48)
  expect(eventRenderCnt).toBe(1)

  resetCounts()
  calendar.next()
  expect(dayHeaderRenderCnt).toBe(7)
  expect(dayCellRenderCnt).toBe(14)
  expect(slotLabelRenderCnt).toBe(0)
  expect(slotLaneRenderCnt).toBe(0)
  expect(eventRenderCnt).toBe(0) // event will be out of view

  calendar.changeView('listWeek') // switch away
  resetCounts()
  calendar.changeView('timeGridWeek') // return to view
  expect(dayHeaderRenderCnt).toBe(7)
  expect(dayCellRenderCnt).toBe(14)
  expect(slotLabelRenderCnt).toBe(24)
  expect(slotLaneRenderCnt).toBe(48)
  expect(eventRenderCnt).toBe(0) // event still out of view

  resetCounts()
  $(window).simulate('resize')
  setTimeout(() => {
    expect(dayHeaderRenderCnt).toBe(0)
    expect(dayCellRenderCnt).toBe(0)
    expect(slotLabelRenderCnt).toBe(0)
    expect(slotLaneRenderCnt).toBe(0)
    expect(eventRenderCnt).toBe(0)

    done()
  }, 1) // more than windowResizeDelay
})
