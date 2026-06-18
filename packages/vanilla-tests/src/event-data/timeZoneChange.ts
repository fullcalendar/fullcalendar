import { strictModeFactor, vdomExtraRenders } from 'fullcalendar/protected-api'
import timeGridPlugin from 'fullcalendar/timegrid'
import classicThemePlugin from 'fullcalendar/themes/classic' // need both
import themeForTestsPlugin from '../lib/theme-for-tests' // "
import { waitTimeout } from '../lib/misc'

describe('timeZone change', () => {
  describe('with non-recurring timed events', () => {
    it('adjusts timed event', async () => {
      const timeTexts = []
      const calendar = initCalendar({
        plugins: [timeGridPlugin, classicThemePlugin, themeForTestsPlugin],
        timeZone: 'America/New_York',
        initialView: 'timeGridWeek',
        initialDate: '2023-02-07',
        events: [
          { start: '2023-02-07T12:00:00' },
        ],
        eventContent(info) {
          timeTexts.push(info.timeText)
          return true
        },
      })
      await waitTimeout()

      let events = calendar.getEvents()
      expect(events[0 * strictModeFactor].start).toEqualDate('2023-02-07T17:00:00Z')
      expect(timeTexts.length).toBe(1 * strictModeFactor)
      expect(timeTexts[0 * strictModeFactor]).toBe('12:00')

      calendar.setOption('timeZone', 'America/Chicago')
      await waitTimeout()
      expect(events[0 * strictModeFactor].start).toEqualDate('2023-02-07T17:00:00Z')
      expect(timeTexts.length).toBe(2 * strictModeFactor + vdomExtraRenders)
      expect(timeTexts[1 * strictModeFactor + vdomExtraRenders]).toBe('11:00')
    })
  })
})
