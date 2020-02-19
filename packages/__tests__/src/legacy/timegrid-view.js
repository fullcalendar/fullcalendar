import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'
import DayHeaderWrapper from '../lib/wrappers/DayHeaderWrapper'

describe('timeGrid view rendering', function() {
  pushOptions({
    defaultView: 'timeGridWeek'
  })

  it('should have have days ordered sun to sat', function() {
    let calendar = initCalendar()
    let headerWrapper = new TimeGridViewWrapper(calendar).header
    let axisEl = headerWrapper.getAxisEl()
    let thEls = headerWrapper.getCellEls()

    expect(axisEl).toBeTruthy()

    let dowClassNames = DayHeaderWrapper.DOW_CLASSNAMES

    for (let i = 0; i < dowClassNames.length; i++) {
      expect(thEls[i]).toHaveClass(dowClassNames[i])
    }
  })
})
