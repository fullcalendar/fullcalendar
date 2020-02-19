import { DAY_CLASSES } from '../lib/constants'
import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'

const [
  SUNDAY_CLASS, MONDAY_CLASS, TUESDAY_CLASS,
  WEDNESDAY_CLASS, THURSDAY_CLASS,
  FRIDAY_CLASS, SATURDY_CLASS
] = DAY_CLASSES

const AXIS_CLASS = 'fc-axis'

describe('timeGrid view rendering', function() {
  pushOptions({
    defaultView: 'timeGridWeek'
  })

  it('should have have days ordered sun to sat', function() {
    let calendar = initCalendar()
    let headerWrapper = new TimeGridViewWrapper(calendar).header
    let thEls = headerWrapper.getCellEls()

    expect(headerWrapper.getAxisEl()).toHaveClass(AXIS_CLASS)
    expect(thEls[0]).toHaveClass(SUNDAY_CLASS)
    expect(thEls[1]).toHaveClass(MONDAY_CLASS)
    expect(thEls[2]).toHaveClass(TUESDAY_CLASS)
    expect(thEls[3]).toHaveClass(WEDNESDAY_CLASS)
    expect(thEls[4]).toHaveClass(THURSDAY_CLASS)
    expect(thEls[5]).toHaveClass(FRIDAY_CLASS)
    expect(thEls[6]).toHaveClass(SATURDY_CLASS)
  })
})
