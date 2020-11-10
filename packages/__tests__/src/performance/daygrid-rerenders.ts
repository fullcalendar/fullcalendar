it('daygrid view rerenders well', (done) => {
  let dayHeaderRenderCnt = 0
  let dayCellRenderCnt = 0
  let eventRenderCnt = 0

  let calendar = initCalendar({
    initialView: 'dayGridMonth',
    initialDate: '2017-10-04',
    windowResizeDelay: 0,
    events: [
      { title: 'event 0', start: '2017-10-04' },
    ],
    dayHeaderContent() {
      dayHeaderRenderCnt += 1
    },
    dayCellContent() {
      dayCellRenderCnt += 1
    },
    eventContent() {
      eventRenderCnt += 1
    },
  })

  function resetCounts() {
    dayHeaderRenderCnt = 0
    dayCellRenderCnt = 0
    eventRenderCnt = 0
  }

  expect(dayHeaderRenderCnt).toBe(7)
  expect(dayCellRenderCnt).toBe(42)
  expect(eventRenderCnt).toBe(1)

  resetCounts()
  calendar.next()

  expect(dayHeaderRenderCnt).toBe(0) // same day-of-week headers
  expect(dayCellRenderCnt).toBe(42)
  expect(eventRenderCnt).toBe(0) // event will be out of view

  calendar.changeView('listWeek') // switch away
  resetCounts()
  calendar.changeView('dayGridMonth') // return to view
  expect(dayHeaderRenderCnt).toBe(7)
  expect(dayCellRenderCnt).toBe(42)
  expect(eventRenderCnt).toBe(0) // event still out of view

  resetCounts()
  $(window).simulate('resize')
  setTimeout(() => {
    expect(dayHeaderRenderCnt).toBe(0)
    expect(dayCellRenderCnt).toBe(0)
    expect(eventRenderCnt).toBe(0)

    done()
  }, 1) // more than windowResizeDelay
})
