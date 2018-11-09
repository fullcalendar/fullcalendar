import DateProfileGenerator, { DateProfile } from '../DateProfileGenerator'
import { DateRange, intersectRanges } from '../datelib/date-range'
import DaySeries from '../common/DaySeries'
import { Seg } from '../component/DateComponent'
import { DateEnv } from '../datelib/env'
import { EventRenderRange } from '../component/event-rendering';
import { DateSpan } from '../structs/date-span'

export default class TimeGridSlicer {

  dateEnv: DateEnv
  dateProfile: DateProfile
  daySeries: DaySeries // TODO: make private!
  colCnt: number


  constructor(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator, dateEnv: DateEnv) {
    this.dateEnv = dateEnv
    this.dateProfile = dateProfile
    this.daySeries = new DaySeries(dateProfile.renderRange, dateProfileGenerator) // should pass this in
    this.colCnt = this.daySeries.dates.length
  }


  eventRangeToSegs(eventRange: EventRenderRange, component) {
    let range = intersectRanges(eventRange.range, component.props.dateProfile.validRange)

    if (range) {
      return this.rangeToSegs(range).map(function(seg) {
        seg.component = component
        return seg
      })
    }

    return []
  }


  dateSpanToSegs(dateSpan: DateSpan, component) {
    let range = intersectRanges(dateSpan.range, component.props.dateProfile.validRange)

    if (range) {
      return this.rangeToSegs(range).map(function(seg) {
        seg.component = component
        return seg
      })
    }

    return []
  }


  // Slices up the given span (unzoned start/end with other misc data) into an array of segments
  private rangeToSegs(range: DateRange): Seg[] {
    let segs = []

    // important to do ALL cols (tho can be optimized)
    // because of extended minTime/maxTime
    for (let col = 0; col < this.colCnt; col++) {
      let segRange = intersectRanges(range, this.getColRange(col))

      if (segRange) {
        segs.push({
          start: segRange.start,
          end: segRange.end,
          isStart: segRange.start.valueOf() === range.start.valueOf(),
          isEnd: segRange.end.valueOf() === range.end.valueOf(),
          col
        })
      }
    }

    return segs
  }


  getColDate(col: number) {
    return this.daySeries.dates[col]
  }


  getColRange(col: number): DateRange { // TODO: cache these
    let { dateEnv, dateProfile } = this
    let date = this.getColDate(col)

    return {
      start: dateEnv.add(date, dateProfile.minTime),
      end: dateEnv.add(date, dateProfile.maxTime)
    }
  }

}
