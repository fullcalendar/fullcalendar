import { createDuration, Duration } from '../datelib/duration'
import { refineProps } from '../reducers/utils'

export interface DragMeta {
  time: Duration | null
  duration: Duration | null
  create: boolean // create an event when dropped?
  stick: boolean // like addEvent's stick parameter
  leftoverProps: object
}

const DRAG_META_PROPS = {
  time: createDuration,
  duration: createDuration,
  create: Boolean,
  stick: Boolean
}

export function parseDragMeta(raw: object): DragMeta {
  let leftoverProps = {}
  let refined = refineProps(raw, DRAG_META_PROPS, leftoverProps)

  return {
    time: refined.time,
    duration: refined.duration,
    create: refined.create === false ? false : true,
    stick: refined.stick || false, // TODO: make the default a setting?
    leftoverProps
  }
}
