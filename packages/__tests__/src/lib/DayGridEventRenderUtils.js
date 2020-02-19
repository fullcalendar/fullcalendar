import DayGridViewWrapper from './wrappers/DayGridViewWrapper'
import DayGridWrapper from './wrappers/DayGridWrapper'

/*
opts:
  - el (optional)
  - row (optional)
  - firstCol
  - lastCol
  - isStart
  - isEnd
*/
export function directionallyTestSeg(opts) {
  var dayGridWrapper = new DayGridViewWrapper(currentCalendar).dayGrid
  var el = opts.el ? $(opts.el) : dayGridWrapper.getEventEls()[0]

  var row = opts.row || 0
  var rowTds = dayGridWrapper.getDayElsInRow(row)

  expect(rowTds.length).toBeGreaterThan(1)

  var leftCol = opts.firstCol
  var rightCol = opts.lastCol
  var col, td

  for (col = leftCol; col <= rightCol; col++) {
    td = rowTds[col]
    expect(el).toIntersectWith(td)
  }

  for (col = 0; col < rowTds.length; col++) {
    if (col < leftCol || col > rightCol) {
      td = rowTds[col]
      expect(el).not.toIntersectWith(td)
    }
  }

  if (opts.isStart) {
    expect(el).toHaveClass(DayGridWrapper.eventIsStartClassName)
  } else {
    expect(el).not.toHaveClass(DayGridWrapper.eventIsStartClassName)
  }

  if (opts.isEnd) {
    expect(el).toHaveClass(DayGridWrapper.eventIsEndClassName)
  } else {
    expect(el).not.toHaveClass(DayGridWrapper.eventIsEndClassName)
  }
}
