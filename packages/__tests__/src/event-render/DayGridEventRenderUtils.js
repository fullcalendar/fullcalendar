import { getDayGridRowDayElAtIndex } from '../view-render/DayGridRenderUtils'
import { getFirstEventEl } from './EventRenderUtils'

/*
opts:
  - el (optional)
  - row (optional)
  - firstCol
  - lastCol
  - isStart
  - isEnd
*/
export function directionallyTestSeg(opts, dir) {
  var el = opts.el ? $(opts.el) : getFirstEventEl()

  var row = opts.row || 0
  var rowTds = getDayGridRowDayElAtIndex(row)
  expect(rowTds.length).toBeGreaterThan(1)

  var leftCol
  var rightCol
  if (dir === 'rtl') {
    leftCol = rowTds.length - opts.lastCol - 1
    rightCol = rowTds.length - opts.firstCol - 1
  } else {
    leftCol = opts.firstCol
    rightCol = opts.lastCol
  }

  var col, td

  for (col = leftCol; col <= rightCol; col++) {
    td = rowTds.eq(col)
    expect(el).toIntersectWith(td)
  }

  for (col = 0; col < rowTds.length; col++) {
    if (col < leftCol || col > rightCol) {
      td = rowTds.eq(col)
      expect(el).not.toIntersectWith(td)
    }
  }

  if (opts.isStart) {
    expect(el).toHaveClass('fc-start')
  } else {
    expect(el).not.toHaveClass('fc-start')
  }

  if (opts.isEnd) {
    expect(el).toHaveClass('fc-end')
  } else {
    expect(el).not.toHaveClass('fc-end')
  }
}
