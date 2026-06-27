import { strictModeFactor, vdomExtraRenders } from 'fullcalendar/protected-api'
import classicThemePlugin from 'fullcalendar/themes/classic' // need both
import themeForTestsPlugin from '../lib/theme-for-tests' // "
import timeGridPlugin from 'fullcalendar/timegrid'
import { waitTimeout } from '../lib/misc'

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
      let calendar = initCalendar()

      let events = calendar.getEvents()

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
      let calendar = initCalendar()

      let events = calendar.getEvents()
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
        let calendar = initCalendar()
        let events = calendar.getEvents()
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
      let calendar = initCalendar()
      let events = calendar.getEvents()
      expect(events[0].start).toEqualDate('2019-06-01')
      expect(events[0].end).toEqualDate('2019-06-03')
      expect(events[1].start).toEqualDate('2019-06-08')
      expect(events[1].end).toEqualDate('2019-06-10')
      expect(events.length).toBe(2)
    })
  })

  it('when timeZone changes, events with unspecified timezone offsets move', async () => {
    const timeTexts = []
    const calendar = initCalendar({
      plugins: [classicThemePlugin, themeForTestsPlugin, timeGridPlugin],
      timeZone: 'America/New_York',
      initialView: 'timeGridWeek',
      initialDate: '2023-02-07',
      events: [
        { startTime: '12:00', daysOfWeek: [2] },
      ],
      eventContent(info) {
        timeTexts.push(info.timeText)
        return true
      },
    })
    await waitTimeout()

    let events = calendar.getEvents()
    expect(events[0].start).toEqualDate('2023-02-07T17:00:00Z')
    expect(timeTexts.length).toBe(1 * strictModeFactor)
    expect(timeTexts[0 * strictModeFactor]).toBe('12:00')

    calendar.setOption('timeZone', 'America/Chicago')
    await waitTimeout()
    expect(events[0].start).toEqualDate('2023-02-07T17:00:00Z')
    expect(timeTexts.length).toBe(2 * strictModeFactor + vdomExtraRenders)
    expect(timeTexts[1 * strictModeFactor + vdomExtraRenders]).toBe('11:00')

    calendar.next() // renders next week's event
    await waitTimeout()
    calendar.prev() // renders prev week's event
    await waitTimeout()
    calendar.setOption('timeZone', 'America/Chicago')
    await waitTimeout()
    expect(events[0].start).toEqualDate('2023-02-07T17:00:00Z')
    expect(timeTexts.length).toBe(4 * strictModeFactor + vdomExtraRenders)
    expect(timeTexts[1 * strictModeFactor + vdomExtraRenders]).toBe('11:00')
  })
})
