import { DateRange, rangesEqual, OpenDateRange } from '../datelib/date-range'
import { DateInput, DateEnv } from '../datelib/env'
import { refineProps } from '../util/misc'
import { Duration } from '../datelib/duration'

/*
A data-structure for a date-range that will be visually displayed.
Contains other metadata like isAllDay, and anything else Components might like to store.
*/

export interface OpenDateSpanInput {
  start?: DateInput
  end?: DateInput
  isAllDay?: boolean
  [otherProp: string]: any
}

export interface DateSpanInput extends OpenDateSpanInput {
  start: DateInput
  end: DateInput
}

export interface OpenDateSpan {
  range: OpenDateRange
  isAllDay: boolean
  [otherProp: string]: any
}

export interface DateSpan extends OpenDateSpan {
  range: DateRange
}

const STANDARD_PROPS = {
  start: null,
  end: null,
  isAllDay: Boolean
}

export function parseDateSpan(raw: DateSpanInput, dateEnv: DateEnv, defaultDuration?: Duration): DateSpan | null {
  let span = parseOpenDateSpan(raw, dateEnv)
  let { range } = span

  if (!range.start) {
    return null
  }

  if (!range.end) {
    if (defaultDuration == null) {
      return null
    } else {
      range.end = dateEnv.add(range.start, defaultDuration)
    }
  }

  return span as DateSpan
}

/*
TODO: somehow combine with parseRange?
*/
export function parseOpenDateSpan(raw: OpenDateSpanInput, dateEnv: DateEnv): OpenDateSpan | null {
  let leftovers = {} as DateSpan
  let standardProps = refineProps(raw, STANDARD_PROPS, {}, leftovers)
  let startMeta = standardProps.start ? dateEnv.createMarkerMeta(standardProps.start) : null
  let endMeta = standardProps.end ? dateEnv.createMarkerMeta(standardProps.end) : null
  let isAllDay = standardProps.isAllDay

  if (startMeta) {

    if (isAllDay == null) {
      isAllDay = (startMeta && startMeta.isTimeUnspecified) &&
        (!endMeta || endMeta.isTimeUnspecified)
    }

    // use this leftover object as the selection object
    leftovers.range = {
      start: startMeta ? startMeta.marker : null,
      end: endMeta ? endMeta.marker : null
    }
    leftovers.isAllDay = isAllDay

    return leftovers
  }

  return null
}

export function isDateSpansEqual(span0: DateSpan, span1: DateSpan): boolean {
  return rangesEqual(span0.range, span1.range) && isDateSpanPropsEqual(span0, span1)
}

// besides range
export function isDateSpanPropsEqual(span0: DateSpan, span1: DateSpan): boolean {

  if (!isDateSpanPropsWithin(span0, span1)) {
    return false
  }

  // are there any props that span0 has that span1 DOESN'T have?
  for (let propName in span0) {
    if (!(propName in span1)) {
      return false
    }
  }

  return true
}

// does subjectSpan have all the props that validationSpan has? (subjectSpan can be a superset)
export function isDateSpanPropsWithin(subjectSpan: DateSpan, validationSpan: DateSpan): boolean {

  for (let propName in validationSpan) {
    if (propName !== 'range') {
      if (subjectSpan[propName] !== validationSpan[propName]) {
        return false
      }
    }
  }

  return true
}
