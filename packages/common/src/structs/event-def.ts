import { Duration } from '../datelib/duration'
import { EventUi } from '../component/event-ui'
import { GenericObject } from '../options'

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
  extendedProps: GenericObject
}

export type EventDefHash = { [defId: string]: EventDef }
