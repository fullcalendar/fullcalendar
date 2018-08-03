import UnzonedRange from '../models/UnzonedRange'
import { DateInput, DateEnv } from '../datelib/env'
import { refineProps } from '../util/misc'

/*
A data-structure for a date-range that will be visually displayed.
Contains other metadata like isAllDay, and anything else Components might like to store.
*/

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
  start: null,
  end: null,
  isAllDay: Boolean
}

export function parseDateSpan(raw: DateSpanInput, dateEnv: DateEnv): DateSpan | null {
  let leftovers = {} as DateSpan
  let standardProps = refineProps(raw, STANDARD_PROPS, {}, leftovers)
  let startMeta = standardProps.start ? dateEnv.createMarkerMeta(standardProps.start) : null
  let endMeta = standardProps.end ? dateEnv.createMarkerMeta(standardProps.end) : null
  let isAllDay = standardProps.isAllDay

  if (startMeta && endMeta) {

    if (isAllDay == null) {
      isAllDay = startMeta.isTimeUnspecified && endMeta.isTimeUnspecified
    }

    // use this leftover object as the selection object
    leftovers.range = new UnzonedRange(startMeta.marker, endMeta.marker)
    leftovers.isAllDay = isAllDay

    return leftovers
  }

  return null
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
