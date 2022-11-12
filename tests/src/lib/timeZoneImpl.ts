import dayGridPlugin from '@fullcalendar/daygrid'

export function testTimeZoneImpl(timeZoneImplPlugin) {
  describe('named tz implementation', () => {
    pushOptions({
      plugins: [timeZoneImplPlugin, dayGridPlugin],
    })

    it('computes correct offset for named timezone for View dates', () => {
      initCalendar({
        initialView: 'dayGridMonth',
        now: '2018-09-01',
        timeZone: 'Europe/Moscow',
        events: [
          { start: '2018-09-05' },
        ],
      })

      let view = currentCalendar.view
      expect(view.currentStart).toEqualDate('2018-09-01T00:00:00+03:00')

      // interprets the ambug iso date string correctly
      let event = currentCalendar.getEvents()[0]
      expect(event.start).toEqualDate('2018-09-05T00:00:00+03:00')
    })
  })
}
