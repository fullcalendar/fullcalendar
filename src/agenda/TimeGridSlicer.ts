import DateProfileGenerator, { DateProfile } from '../DateProfileGenerator'
import { DateRange, intersectRanges } from '../datelib/date-range'
import DaySeries from '../common/DaySeries'
import { Seg } from '../component/DateComponent'
import { DateEnv } from '../datelib/env'

export default class TimeGridSlicer {

  dateProfile: DateProfile
  daySeries: DaySeries
  dateRanges: DateRange[]
  isRtl: boolean
  colCnt: number


  constructor(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator, isRtl: boolean, dateEnv: DateEnv) {
    this.dateProfile = dateProfile
    this.daySeries = new DaySeries(dateProfile, dateProfileGenerator)
    this.dateRanges = this.daySeries.dates.map(function(dayDate) {
      return {
        start: dateEnv.add(dayDate, dateProfile.minTime),
        end: dateEnv.add(dayDate, dateProfile.maxTime)
      }
    })
    this.isRtl = isRtl
    this.colCnt = this.daySeries.dates.length
  }


  // Slices up the given span (unzoned start/end with other misc data) into an array of segments
  rangeToSegs(range: DateRange): Seg[] {

    range = intersectRanges(range, this.dateProfile.validRange)

    if (range) {
      let segs = this.sliceRangeByTimes(range)
      let i

      for (i = 0; i < segs.length; i++) {
        if (this.isRtl) {
          segs[i].col = this.daySeries.dates.length - 1 - segs[i].dayIndex
        } else {
          segs[i].col = segs[i].dayIndex
        }

        segs[i].component = this
      }

      return segs
    } else {
      return []
    }
  }


  sliceRangeByTimes(range) {
    let { dateRanges } = this
    let segs = []
    let segRange
    let dayIndex

    for (dayIndex = 0; dayIndex < dateRanges.length; dayIndex++) {

      segRange = intersectRanges(range, dateRanges[dayIndex])

      if (segRange) {
        segs.push({
          start: segRange.start,
          end: segRange.end,
          isStart: segRange.start.valueOf() === range.start.valueOf(),
          isEnd: segRange.end.valueOf() === range.end.valueOf(),
          dayIndex: dayIndex
        })
      }
    }

    return segs
  }


  getColDate(col: number) {
    if (this.isRtl) {
      col = this.colCnt - 1 - col
    }

    return this.daySeries.dates[col]
  }

}
