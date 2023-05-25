import timeGridPlugin from '@fullcalendar/timegrid'
import luxonPlugin from '@fullcalendar/luxon3'

describe('recurring events', () => {
  describe('when timed events in local timezone', () => {
    pushOptions({
      initialView: 'timeGridWeek',
      initialDate: '2017-07-03',
      timeZone: 'local',
      events: [
        { startTime: '09:00', endTime: '11:00', daysOfWeek: [2, 4] },
      ],
    })

    it('expands events with local time', () => {
      initCalendar()

      let events = currentCalendar.getEvents()

      expect(events[0].start).toEqualLocalDate('2017-07-04T09:00:00')
      expect(events[0].end).toEqualLocalDate('2017-07-04T11:00:00')

      expect(events[1].start).toEqualLocalDate('2017-07-06T09:00:00')
      expect(events[1].end).toEqualLocalDate('2017-07-06T11:00:00')
    })
  })

  describe('when given recur range', () => {
    pushOptions({
      initialView: 'dayGridMonth',
      initialDate: '2017-07-03',
      events: [
        { startTime: '09:00', endTime: '11:00', startRecur: '2017-07-05', endRecur: '2017-07-08' },
      ],
    })

    it('expands within given range', () => {
      initCalendar()

      let events = currentCalendar.getEvents()
      expect(events.length).toBe(3)

      expect(events[0].start).toEqualDate('2017-07-05T09:00:00Z')
      expect(events[1].start).toEqualDate('2017-07-06T09:00:00Z')
      expect(events[2].start).toEqualDate('2017-07-07T09:00:00Z')
    })

    describe('when current range is completely outside of recur-range', () => {
      pushOptions({
        initialDate: '2017-02-02',
      })

      it('won\'t render any events', () => {
        initCalendar()
        let events = currentCalendar.getEvents()
        expect(events.length).toBe(0)
      })
    })
  })

  describe('when event has a duration', () => {
    pushOptions({
      initialView: 'dayGridWeek',
      initialDate: '2019-06-02',
      events: [
        { daysOfWeek: [6], duration: { days: 2 } },
      ],
    })

    it('will render from week before', () => {
      initCalendar()
      let events = currentCalendar.getEvents()
      expect(events[0].start).toEqualDate('2019-06-01')
      expect(events[0].end).toEqualDate('2019-06-03')
      expect(events[1].start).toEqualDate('2019-06-08')
      expect(events[1].end).toEqualDate('2019-06-10')
      expect(events.length).toBe(2)
    })
  })

  it('when timeZone changes, events with unspecified timezone offsets move', () => {
    const timeTexts = []
    const calendar = initCalendar({
      plugins: [timeGridPlugin, luxonPlugin],
      timeZone: 'America/New_York',
      initialView: 'timeGridWeek',
      initialDate: '2023-02-07',
      events: [
        { startTime: '12:00', daysOfWeek: [2] },
      ],
      eventContent(arg) {
        timeTexts.push(arg.timeText)
        return true
      },
    })

    let events = calendar.getEvents()
    expect(events[0].start).toEqualDate('2023-02-07T17:00:00Z')
    expect(timeTexts.length).toBe(1)
    expect(timeTexts[0]).toBe('12:00')

    calendar.setOption('timeZone', 'America/Chicago')
    expect(events[0].start).toEqualDate('2023-02-07T17:00:00Z')
    expect(timeTexts.length).toBe(2)
    expect(timeTexts[1]).toBe('11:00')
  })
})
