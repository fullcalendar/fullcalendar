import { createDuration, Duration } from '../datelib/duration'
import { refineProps, RawOptionsFromRefiners, Dictionary } from '../options'

/*
Information about what will happen when an external element is dragged-and-dropped
onto a calendar. Contains information for creating an event.
*/

const DRAG_META_REFINERS = {
  startTime: createDuration,
  duration: createDuration,
  create: Boolean,
  sourceId: String,
}

export type DragMetaInput =
  RawOptionsFromRefiners<typeof DRAG_META_REFINERS> &
  { [otherProp: string]: any } // for leftoverProps

export interface DragMeta {
  startTime: Duration | null
  duration: Duration | null
  create: boolean // create an event when dropped?
  sourceId: string // similar to addEvent's parameter
  leftoverProps: Dictionary
}

export function parseDragMeta(raw: DragMetaInput): DragMeta {
  let { refined, extra } = refineProps(raw, DRAG_META_REFINERS)

  return {
    startTime: refined.startTime || null,
    duration: refined.duration || null,
    create: refined.create != null ? refined.create : true,
    sourceId: refined.sourceId,
    leftoverProps: extra,
  }
}
