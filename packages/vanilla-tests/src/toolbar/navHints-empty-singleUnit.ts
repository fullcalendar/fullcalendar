import esLocale from 'fullcalendar/locales/es'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('toolbar nav hints with empty singleUnit', () => {
  // duration value !== 1 means singleUnit stays '', which used to pass undefined
  // into locale todayHint/prevHint/nextHint and crash on .toLocaleLowerCase() (#8100)
  it('keeps today/prev/next aria-labels as strings for a multi-unit custom duration', () => {
    let calendar = initCalendar({
      locale: 'es',
      locales: [esLocale],
      views: {
        dayGridYearCustom: {
          type: 'dayGrid',
          duration: { months: 12 },
        },
      },
      initialView: 'dayGridYearCustom',
      headerToolbar: {
        left: 'prev,today,next',
        center: 'title',
        right: '',
      },
    })
    let toolbar = new CalendarWrapper(calendar).toolbar

    for (const name of ['today', 'prev', 'next']) {
      let el = toolbar.getButtonEl(name) as HTMLElement
      expect(el).toBeTruthy()
      let hint = el.getAttribute('aria-label')
      expect(typeof hint).toBe('string')
      expect(hint.length).toBeGreaterThan(0)
    }
  })
})
