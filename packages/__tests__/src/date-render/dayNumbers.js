import arLocale from '@fullcalendar/core/locales/ar'
import { getDayOfWeekHeaderElTopElText } from '../view-render/DayGridRenderUtils'

describe('dayNumbers', function() {
  pushOptions({
    defaultDate: '2018-01-01'
  })

  it('respects locale in month view', function() {
    initCalendar({
      defaultView: 'dayGridMonth',
      locale: arLocale
    })
    expect(getDayOfWeekHeaderElTopElText('2018-01-01')).toMatch(/1|١٤?/) // normal 1, or an Arabic 1
  })

})
