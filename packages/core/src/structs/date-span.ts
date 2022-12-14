import { DateRange, rangesEqual, OpenDateRange } from '../datelib/date-range.js'
import { DateInput, DateEnv } from '../datelib/env.js'
import { Duration } from '../datelib/duration.js'
import { createEventInstance } from './event-instance.js'
import { parseEventDef, refineEventDef } from './event-parse.js'
import { EventRenderRange, compileEventUi } from '../component/event-rendering.js'
import { EventUiHash } from '../component/event-ui.js'
import { CalendarContext } from '../CalendarContext.js'
import { refineProps, identity, Identity } from '../options.js'

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

export interface RangeApi {
  start: Date
  end: Date
  startStr: string
  endStr: string
}

export interface DateSpanApi extends RangeApi {
  allDay: boolean
}

export interface RangeApiWithTimeZone extends RangeApi {
  timeZone: string
}

export interface DatePointApi {
  date: Date
  dateStr: string
  allDay: boolean
}

const STANDARD_PROPS = {
  start: identity as Identity<DateInput>,
  end: identity as Identity<DateInput>,
  allDay: Boolean,
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
    }
    range.end = dateEnv.add(range.start, defaultDuration)
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
  let { allDay } = standardProps

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
    ...extra,
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
    ...buildRangeApi(span.range, dateEnv, span.allDay),
    allDay: span.allDay,
  }
}

export function buildRangeApiWithTimeZone(range: DateRange, dateEnv: DateEnv, omitTime?: boolean): RangeApiWithTimeZone {
  return {
    ...buildRangeApi(range, dateEnv, omitTime),
    timeZone: dateEnv.timeZone,
  }
}

export function buildRangeApi(range: DateRange, dateEnv: DateEnv, omitTime?: boolean): RangeApi {
  return {
    start: dateEnv.toDate(range.start),
    end: dateEnv.toDate(range.end),
    startStr: dateEnv.formatIso(range.start, { omitTime }),
    endStr: dateEnv.formatIso(range.end, { omitTime }),
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
    context,
  )

  return {
    def,
    ui: compileEventUi(def, eventUiBases),
    instance: createEventInstance(def.defId, dateSpan.range),
    range: dateSpan.range,
    isStart: true,
    isEnd: true,
  }
}
