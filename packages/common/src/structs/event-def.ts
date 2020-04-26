import { Duration } from '../datelib/duration'
import { EventUi } from '../component/event-ui'

export interface EventDef {
  defId: string
  sourceId: string
  publicId: string
  groupId: string
  allDay: boolean
  hasEnd: boolean
  recurringDef: { typeId: number, typeData: any, duration: Duration | null } | null
  title: string
  url: string
  ui: EventUi
  extendedProps: any
}

export type EventDefHash = { [defId: string]: EventDef }

export const NON_DATE_PROPS = { // ...that are NOT in the EventUi object
  id: String,
  groupId: String,
  title: String,
  url: String,
  extendedProps: null
}

export const DATE_PROPS = {
  start: null,
  date: null, // alias for start
  end: null,
  allDay: null
}
