import { createDuration, Duration, DurationInput } from '../datelib/duration'
import { refineProps } from '../util/misc'
import { EventNonDateInput } from '../structs/event'

/*
Information about what will happen when an external element is dragged-and-dropped
onto a calendar. Contains information for creating an event.
*/

export interface DragMetaInput extends EventNonDateInput {
  startTime?: DurationInput
  duration?: DurationInput
  create?: boolean
  sourceId?: string
}

export interface DragMeta {
  startTime: Duration | null
  duration: Duration | null
  create: boolean // create an event when dropped?
  sourceId: string // similar to addEvent's parameter
  leftoverProps: object
}

const DRAG_META_PROPS = {
  startTime: createDuration,
  duration: createDuration,
  create: Boolean,
  sourceId: String
}

const DRAG_META_DEFAULTS = {
  create: true
}

export function parseDragMeta(raw: DragMetaInput): DragMeta {
  let leftoverProps = {}
  let refined = refineProps(raw, DRAG_META_PROPS, DRAG_META_DEFAULTS, leftoverProps) as DragMeta

  refined.leftoverProps = leftoverProps

  return refined
}
