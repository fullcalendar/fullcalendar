describe('event mutations on non-instances', () => {
  pushOptions({
    initialView: 'dayGridWeek',
    now: '2018-09-03',
    events: [
      { id: '1', start: '2018-09-04', display: 'inverse-background' }, // will make two segs
    ],
  })

  describe('with date mutating', () => {
    it('doesn\'t do anything', () => {
      let renderCnt = 0
      let calendar = initCalendar({
        eventContent(arg) {
          renderCnt += 1
          if (renderCnt === 2) {
            arg.event.setStart('2018-08-04')
            arg.event.setEnd('2018-10-04')
            arg.event.setDates('2018-08-04', '2018-10-04')
          }
        },
      })

      expect(renderCnt).toBe(2)

      let event = calendar.getEventById('1')
      expect(event.start).toEqualDate('2018-09-04')
      expect(event.end).toBe(null)
      expect(event.allDay).toBe(true)
    })
  })

  // TODO: test for non-instances to have other props and extended props modified
})
