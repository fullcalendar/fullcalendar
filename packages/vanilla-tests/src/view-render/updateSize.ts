import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { waitFrame } from '../lib/misc'

describe('updateSize method', () => {
  it('updates size of a previously hidden element', async () => {
    let $el = $('<div style="display:none" />').appendTo('body')
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      contentHeight: 600,
    }, $el[0])
    let calendarWrapper = new CalendarWrapper(calendar)

    $el.show()
    await waitFrame()
    expect(calendarWrapper.getViewOuterEl().offsetHeight).toBeCloseTo(600, 0)

    $el.remove()
  })
})
