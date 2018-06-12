import UnzonedRange from '../models/UnzonedRange'
import { DateInput, DateEnv } from '../datelib/env'
import { refineProps } from '../reducers/utils'

export interface SelectionInput {
  start: DateInput
  end: DateInput
  isAllDay?: boolean
  [otherProp: string]: any
}

export interface Selection {
  range: UnzonedRange
  isAllDay: boolean
  [otherProp: string]: any
}

const STANDARD_PROPS = {
  start: null, // dont auto-refine
  end: null, // dont auto-refine
  isAllDay: Boolean
}

export function parseSelection(raw: SelectionInput, dateEnv: DateEnv): Selection {
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
