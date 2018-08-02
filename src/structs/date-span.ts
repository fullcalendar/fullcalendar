import UnzonedRange from '../models/UnzonedRange'
import { DateInput, DateEnv } from '../datelib/env'
import { refineProps } from '../util/misc'

export interface DateSpanInput {
  start: DateInput
  end: DateInput
  isAllDay?: boolean
  [otherProp: string]: any
}

export interface DateSpan {
  range: UnzonedRange
  isAllDay: boolean
  [otherProp: string]: any
}

const STANDARD_PROPS = {
  start: null, // dont auto-refine
  end: null, // dont auto-refine
  isAllDay: Boolean
}

export function parseDateSpan(raw: DateSpanInput, dateEnv: DateEnv): DateSpan {
  let otherProps = {} as any
  let standardProps = refineProps(raw, STANDARD_PROPS, otherProps)
  let startMeta = standardProps.start ? dateEnv.createMarkerMeta(standardProps.start) : null
  let endMeta = standardProps.end ? dateEnv.createMarkerMeta(standardProps.end) : null
  let isAllDay = standardProps.isAllDay

  if (startMeta && endMeta) {

    if (isAllDay == null) {
      isAllDay = startMeta.isTimeUnspecified && endMeta.isTimeUnspecified
    }

    // use this leftover object as the selection object
    otherProps.range = new UnzonedRange(startMeta.marker, endMeta.marker)
    otherProps.isAllDay = isAllDay

    return otherProps
  }
}

export function isDateSpansEqual(span0: DateSpan, span1: DateSpan): boolean {

  if (!span0.range.equals(span1.range)) {
    return false
  }

  for (let propName in span1) {
    if (propName !== 'range') {
      if (span0[propName] !== span1[propName]) {
        return false
      }
    }
  }

  for (let propName in span0) {
    if (!(propName in span1)) {
      return false
    }
  }

  return true
}
