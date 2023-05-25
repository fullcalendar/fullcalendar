import timeGridPlugin from '@fullcalendar/timegrid'
import luxonPlugin from '@fullcalendar/luxon3'

describe('timeZone change', () => {
  describe('with non-recurring timed events and luxon plugin', () => {
    it('adjusts timed event', () => {
      const timeTexts = []
      const calendar = initCalendar({
        plugins: [timeGridPlugin, luxonPlugin],
        timeZone: 'America/New_York',
        initialView: 'timeGridWeek',
        initialDate: '2023-02-07',
        events: [
          { start: '2023-02-07T12:00:00' },
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
})
