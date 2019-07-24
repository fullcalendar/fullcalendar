
describe('event mutations on non-instances', function() {
  pushOptions({
    defaultView: 'dayGridWeek',
    now: '2018-09-03',
    events: [
      { id: '1', start: '2018-09-04', rendering: 'inverse-background' }
    ]
  })

  describe('with date mutating', function() {
    it('doesn\'t do anything', function() {
      let renderCnt = 0

      initCalendar({
        eventRender(arg) {
          renderCnt++
          if (renderCnt === 1) {
            arg.event.moveStart('-01:00')
            arg.event.moveEnd('01:00')
            arg.event.moveDates({ days: 1 })
            arg.event.setAllDay(false)
          } else if (renderCnt === 2) {
            arg.event.setStart('2018-08-04')
            arg.event.setEnd('2018-10-04')
            arg.event.setDates('2018-08-04', '2018-10-04')
          }
        }
      })

      expect(renderCnt).toBe(2)

      let event = currentCalendar.getEventById('1')
      expect(event.start).toEqualDate('2018-09-04')
      expect(event.end).toBe(null)
      expect(event.allDay).toBe(true)
    })
  })

  // TODO: test for non-instances to have other props and extended props modified

})
