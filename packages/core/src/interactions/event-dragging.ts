import Calendar from '../Calendar'
import { EventMutation } from '../structs/event-mutation'
import { Hit } from './hit'
import { EventDef } from '../structs/event'
import { EventUi } from '../component/event-ui'
import { View } from '@fullcalendar/core'

export type eventDragMutationMassager = (mutation: EventMutation, hit0: Hit, hit1: Hit) => void
export type EventDropTransformers = (mutation: EventMutation, calendar: Calendar) => any
export type eventIsDraggableTransformer = (val: boolean, eventDef: EventDef, eventUi: EventUi, view: View) => boolean
