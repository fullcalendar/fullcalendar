import { intersectRanges, DateRange, Slicer } from '@fullcalendar/core/internal'
import { TimeColsSeg } from './TimeColsSeg.js'

export class DayTimeColsSlicer extends Slicer<TimeColsSeg, [DateRange[]]> {
  sliceRange(range: DateRange, dayRanges: DateRange[]): TimeColsSeg[] {
    let segs: TimeColsSeg[] = []

    for (let col = 0; col < dayRanges.length; col += 1) {
      let segRange = intersectRanges(range, dayRanges[col])

      if (segRange) {
        segs.push({
          start: segRange.start,
          end: segRange.end,
          isStart: segRange.start.valueOf() === range.start.valueOf(),
          isEnd: segRange.end.valueOf() === range.end.valueOf(),
          col,
        })
      }
    }

    return segs
  }
}
