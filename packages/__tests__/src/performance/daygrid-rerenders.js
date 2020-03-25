
it('daygrid view rerenders well', function(done) {
  let dayLabelRenderCnt = 0
  let dayCellRenderCnt = 0
  let eventRenderCnt = 0

  initCalendar({
    defaultView: 'dayGridMonth',
    defaultDate: '2017-10-04',
    windowResizeDelay: 0,
    events: [
      { title: 'event 0', start: '2017-10-04' }
    ],
    dayLabelContent() {
      dayLabelRenderCnt++
    },
    dayCellContent() {
      dayCellRenderCnt++
    },
    eventContent() {
      eventRenderCnt++
    }
  })

  function resetCounts() {
    dayLabelRenderCnt = 0
    dayCellRenderCnt = 0
    eventRenderCnt = 0
  }

  expect(dayLabelRenderCnt).toBe(7)
  expect(dayCellRenderCnt).toBe(42)
  expect(eventRenderCnt).toBe(1)

  resetCounts()
  currentCalendar.next()

  expect(dayLabelRenderCnt).toBe(0) // same day-of-week headers
  expect(dayCellRenderCnt).toBe(42)
  expect(eventRenderCnt).toBe(0) // event will be out of view

  currentCalendar.changeView('listWeek') // switch away
  resetCounts()
  currentCalendar.changeView('dayGridMonth') // return to view
  expect(dayLabelRenderCnt).toBe(7)
  expect(dayCellRenderCnt).toBe(42)
  expect(eventRenderCnt).toBe(0) // event still out of view

  resetCounts()
  $(window).simulate('resize')
  setTimeout(function() {

    expect(dayLabelRenderCnt).toBe(0)
    expect(dayCellRenderCnt).toBe(0)
    expect(eventRenderCnt).toBe(0)

    done()
  }, 1) // more than windowResizeDelay
})
