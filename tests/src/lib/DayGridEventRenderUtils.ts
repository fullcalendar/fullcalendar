import { DayGridViewWrapper } from './wrappers/DayGridViewWrapper'
import { DayGridWrapper } from './wrappers/DayGridWrapper'

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
  let dayGridWrapper = new DayGridViewWrapper(currentCalendar).dayGrid
  let el = opts.el ? $(opts.el) : dayGridWrapper.getEventEls()[0]

  let row = opts.row || 0
  let rowTds = dayGridWrapper.getDayElsInRow(row)

  expect(rowTds.length).toBeGreaterThan(1)

  let leftCol = opts.firstCol
  let rightCol = opts.lastCol
  let col
  let td

  for (col = leftCol; col <= rightCol; col += 1) {
    td = rowTds[col]
    expect(el).toIntersectWith(td)
  }

  for (col = 0; col < rowTds.length; col += 1) {
    if (col < leftCol || col > rightCol) {
      td = rowTds[col]
      expect(el).not.toIntersectWith(td)
    }
  }

  if (opts.isStart) {
    expect(el).toHaveClass(DayGridWrapper.EVENT_IS_START_CLASSNAME)
  } else {
    expect(el).not.toHaveClass(DayGridWrapper.EVENT_IS_START_CLASSNAME)
  }

  if (opts.isEnd) {
    expect(el).toHaveClass(DayGridWrapper.EVENT_IS_END_CLASSNAME)
  } else {
    expect(el).not.toHaveClass(DayGridWrapper.EVENT_IS_END_CLASSNAME)
  }
}
