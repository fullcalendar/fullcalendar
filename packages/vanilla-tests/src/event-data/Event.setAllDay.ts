describe('Event::setAllDay', () => {
  describe('when setting from all-day to all-day', () => {
    it('causes no change', () => {
      let calendar = initCalendar({
        events: [
          { id: '1', start: '2018-09-03', end: '2018-09-05', allDay: true },
        ],
      })
      let event = calendar.getEventById('1')
      event.setAllDay(true)
      expect(event.start).toEqualDate('2018-09-03')
      expect(event.end).toEqualDate('2018-09-05')
      expect(event.allDay).toBe(true)
    })
  })

  describe('when setting from timed to timed', () => {
    it('causes no change', () => {
      let calendar = initCalendar({
        events: [
          { id: '1', start: '2018-09-03T09:00:00', end: '2018-09-05T09:00:00', allDay: false },
        ],
      })
      let event = calendar.getEventById('1')
      event.setAllDay(false)
      expect(event.start).toEqualDate('2018-09-03T09:00:00Z')
      expect(event.end).toEqualDate('2018-09-05T09:00:00Z')
      expect(event.allDay).toBe(false)
    })
  })

  describe('when setting from all-day to timed', () => {
    describe('when not maintaining duration', () => {
      it('removes the end', () => {
        let calendar = initCalendar({
          events: [
            { id: '1', start: '2018-09-03', end: '2018-09-05', allDay: true },
          ],
        })
        let event = calendar.getEventById('1')
        event.setAllDay(false)
        expect(event.start).toEqualDate('2018-09-03')
        expect(event.end).toBe(null)
        expect(event.allDay).toBe(false)
      })
    })

    describe('when maintaining duration', () => {
      it('keeps exact duration', () => {
        let calendar = initCalendar({
          events: [
            { id: '1', start: '2018-09-03', end: '2018-09-05', allDay: true },
          ],
        })
        let event = calendar.getEventById('1')
        event.setAllDay(false, { maintainDuration: true })
        expect(event.start).toEqualDate('2018-09-03')
        expect(event.end).toEqualDate('2018-09-05')
        expect(event.allDay).toBe(false)
      })
    })
  })

  describe('when setting from timed to all-day', () => {
    describe('when not maintaining duration', () => {
      it('removes the end', () => {
        let calendar = initCalendar({
          events: [
            { id: '1', start: '2018-09-03T09:00:00', end: '2018-09-05T09:00:00', allDay: false },
          ],
        })
        let event = calendar.getEventById('1')
        event.setAllDay(true)
        expect(event.start).toEqualDate('2018-09-03')
        expect(event.end).toBe(null)
        expect(event.allDay).toBe(true)
      })
    })

    describe('when maintaining duration', () => {
      it('rounds the end down to the prev whole day', () => {
        let calendar = initCalendar({
          events: [
            { id: '1', start: '2018-09-03T09:00:00', end: '2018-09-05T10:00:00', allDay: false },
          ],
        })
        let event = calendar.getEventById('1')
        event.setAllDay(true, { maintainDuration: true })
        expect(event.start).toEqualDate('2018-09-03')
        expect(event.end).toEqualDate('2018-09-05')
        expect(event.allDay).toBe(true)
      })
    })

    describe('when maintaining duration (from calendar setting)', () => {
      it('rounds the end to the next whole day', () => {
        let calendar = initCalendar({
          allDayMaintainDuration: true,
          events: [
            { id: '1', start: '2018-09-03T09:00:00', end: '2018-09-05T10:00:00', allDay: false },
          ],
        })
        let event = calendar.getEventById('1')
        event.setAllDay(true)
        expect(event.start).toEqualDate('2018-09-03')
        expect(event.end).toEqualDate('2018-09-05')
        expect(event.allDay).toBe(true)
      })
    })
  })
})
