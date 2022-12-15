import { Duration } from '../datelib/duration.js'
import { EventUi } from '../component/event-ui.js'
import { Dictionary } from '../options.js'

export interface EventDef { // TODO: add recurring type here?
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
  interactive?: boolean
  extendedProps: Dictionary
}

export type EventDefHash = { [defId: string]: EventDef }
