import { getDayOfWeekHeaderElTopElText } from '../view-render/DayGridRenderUtils'

describe('dayNumbers', function() {
  pushOptions({
    defaultDate: '2018-01-01'
  })

  it('respects locale in month view', function() {
    initCalendar({
      defaultView: 'month',
      locale: 'ar'
    })
    expect(getDayOfWeekHeaderElTopElText('2018-01-01')).toMatch(/١٤?/) // an Arabic 1
  })

})
