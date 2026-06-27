import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('timeGrid view rendering', () => {
  pushOptions({
    initialView: 'timeGridWeek',
  })

  it('should have have days ordered sun to sat', () => {
    let calendar = initCalendar()
    let viewWrapper = new TimeGridViewWrapper(calendar)
    let axisEl = viewWrapper.getHeaderAxisEl()
    let thEls = viewWrapper.header.getCellEls()

    expect(axisEl).toBeTruthy()

    let dowClassNames = CalendarWrapper.DOW_CLASSNAMES

    for (let i = 0; i < dowClassNames.length; i += 1) {
      expect(thEls[i]).toHaveClass(dowClassNames[i])
    }
  })
})
