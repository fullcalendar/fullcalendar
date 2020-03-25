
it('daygrid view rerenders well', function(done) {
  let dayLabelMountCnt = 0
  let dayLabelRenderCnt = 0
  let dayCellRenderCnt = 0
  let eventRenderCnt = 0

  initCalendar({
    defaultView: 'dayGridMonth',
    defaultDate: '2017-10-04',
    windowResizeDelay: 0,
    dayLabelDidMount() {
      dayLabelMountCnt++
    },
    dayLabelContent() {
      dayLabelRenderCnt++
    },
    dayCellContent() {
      dayCellRenderCnt++
    },
    eventContent() {
      eventRenderCnt++
    },
    events: [
      { title: 'event 0', start: '2017-10-04' }
    ]
  })

  function resetCounts() {
    dayLabelMountCnt = 0
    dayLabelRenderCnt = 0
    dayCellRenderCnt = 0
    eventRenderCnt = 0
  }

  expect(dayLabelMountCnt).toBe(7)
  expect(dayLabelRenderCnt).toBe(7)
  expect(dayCellRenderCnt).toBe(42)
  expect(eventRenderCnt).toBe(1)

  resetCounts()
  currentCalendar.next()

  expect(dayLabelMountCnt).toBe(0) // same header across months...
  expect(dayLabelRenderCnt).toBe(7) // ...but still rerendered inner content
  expect(dayCellRenderCnt).toBe(42)
  expect(eventRenderCnt).toBe(0) // event will be out of view

  currentCalendar.changeView('listWeek') // switch away
  resetCounts()
  currentCalendar.changeView('dayGridMonth') // return to view
  expect(dayLabelMountCnt).toBe(7)
  expect(dayLabelRenderCnt).toBe(7)
  expect(dayCellRenderCnt).toBe(42)
  expect(eventRenderCnt).toBe(0) // event still out of view

  resetCounts()
  $(window).simulate('resize')
  setTimeout(function() {

    expect(dayLabelMountCnt).toBe(0)
    expect(dayLabelRenderCnt).toBe(0)
    expect(dayCellRenderCnt).toBe(0)
    expect(eventRenderCnt).toBe(0)

    done()
  }, 1) // more than windowResizeDelay
})
