import { DateRange, rangesEqual, OpenDateRange } from '../datelib/date-range'
import { DateInput, DateEnv } from '../datelib/env'
import { Duration } from '../datelib/duration'
import { createEventInstance } from './event-instance'
import { parseEventDef, refineEventDef } from './event-parse'
import { EventRenderRange, compileEventUi } from '../component/event-rendering'
import { EventUiHash } from '../component/event-ui'
import { CalendarContext } from '../CalendarContext'
import { refineProps, identity, Identity } from '../options'

/*
A data-structure for a date-range that will be visually displayed.
Contains other metadata like allDay, and anything else Components might like to store.

TODO: in future, put otherProps in own object.
*/

export interface OpenDateSpanInput {
  start?: DateInput
  end?: DateInput
  allDay?: boolean
  [otherProp: string]: any
}

export interface DateSpanInput extends OpenDateSpanInput {
  start: DateInput
  end: DateInput
}

export interface OpenDateSpan {
  range: OpenDateRange
  allDay: boolean
  [otherProp: string]: any
}

export interface DateSpan extends OpenDateSpan {
  range: DateRange
}

export interface DateSpanApi {
  start: Date
  end: Date
  startStr: string
  endStr: string
  allDay: boolean
}

export interface DatePointApi {
  date: Date
  dateStr: string
  allDay: boolean
}

const STANDARD_PROPS = {
  start: identity as Identity<DateInput>,
  end: identity as Identity<DateInput>,
  allDay: Boolean
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
Will return null if the start/end props were present but parsed invalidly.
*/
export function parseOpenDateSpan(raw: OpenDateSpanInput, dateEnv: DateEnv): OpenDateSpan | null {
  let { refined: standardProps, extra } = refineProps(raw, STANDARD_PROPS)
  let startMeta = standardProps.start ? dateEnv.createMarkerMeta(standardProps.start) : null
  let endMeta = standardProps.end ? dateEnv.createMarkerMeta(standardProps.end) : null
  let allDay = standardProps.allDay

  if (allDay == null) {
    allDay = (startMeta && startMeta.isTimeUnspecified) &&
      (!endMeta || endMeta.isTimeUnspecified)
  }

  return {
    range: {
      start: startMeta ? startMeta.marker : null,
      end: endMeta ? endMeta.marker : null,
    },
    allDay,
    ...extra
  }
}

export function isDateSpansEqual(span0: DateSpan, span1: DateSpan): boolean {
  return rangesEqual(span0.range, span1.range) &&
    span0.allDay === span1.allDay &&
    isSpanPropsEqual(span0, span1)
}

// the NON-DATE-RELATED props
function isSpanPropsEqual(span0: DateSpan, span1: DateSpan): boolean {

  for (let propName in span1) {
    if (propName !== 'range' && propName !== 'allDay') {
      if (span0[propName] !== span1[propName]) {
        return false
      }
    }
  }

  // are there any props that span0 has that span1 DOESN'T have?
  // both have range/allDay, so no need to special-case.
  for (let propName in span0) {
    if (!(propName in span1)) {
      return false
    }
  }

  return true
}

export function buildDateSpanApi(span: DateSpan, dateEnv: DateEnv): DateSpanApi {
  return {
    start: dateEnv.toDate(span.range.start),
    end: dateEnv.toDate(span.range.end),
    startStr: dateEnv.formatIso(span.range.start, { omitTime: span.allDay }),
    endStr: dateEnv.formatIso(span.range.end, { omitTime: span.allDay }),
    allDay: span.allDay
  }
}

export function fabricateEventRange(dateSpan: DateSpan, eventUiBases: EventUiHash, context: CalendarContext): EventRenderRange {
  let res = refineEventDef({ editable: false }, context)
  let def = parseEventDef(
    res.refined,
    res.extra,
    '', // sourceId
    dateSpan.allDay,
    true, // hasEnd
    context
  )

  return {
    def,
    ui: compileEventUi(def, eventUiBases),
    instance: createEventInstance(def.defId, dateSpan.range),
    range: dateSpan.range,
    isStart: true,
    isEnd: true
  }
}
