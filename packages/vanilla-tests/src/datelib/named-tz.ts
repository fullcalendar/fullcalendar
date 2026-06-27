import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { waitTimeout } from '../lib/misc'

describe('named time zones', () => {
  // https://github.com/fullcalendar/fullcalendar/issues/5753
  describe('now-date', () => {
    it('adapts to switching timeZone', async () => {
      const calendar = initCalendar({
        timeZone: 'America/Chicago',
        initialView: 'timeGridDay',
        now: '2025-03-20T01:00:00',
        nowIndicator: true,
      })
      const timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

      await waitTimeout()
      let nowIndicatorLineEl = timeGridWrapper.getNowIndicatorLineEl()
      let nowIndicatorY0 = nowIndicatorLineEl.getBoundingClientRect().top

      calendar.setOption('timeZone', 'Europe/London')

      await waitTimeout()
      nowIndicatorLineEl = timeGridWrapper.getNowIndicatorLineEl()
      let nowIndicatorY1 = nowIndicatorLineEl.getBoundingClientRect().top

      // must be different
      expect(Math.abs(nowIndicatorY1 - nowIndicatorY0)).toBeGreaterThan(100)
    })
  })

  it('computes correct offset for named timezone for View dates', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      now: '2018-09-01',
      timeZone: 'Europe/Moscow',
      events: [
        { start: '2018-09-05' },
      ],
    })

    let view = calendar.view
    expect(view.currentStart).toEqualDate('2018-09-01T00:00:00+03:00')

    // interprets the ambug iso date string correctly
    let event = calendar.getEvents()[0]
    expect(event.start).toEqualDate('2018-09-05T00:00:00+03:00')
  })
})
