import {
  EventApi,
  ViewApi,
  EventChangeArg,
  EventAddArg,
  EventRemoveArg,
  EventRenderRange,
} from '@fullcalendar/core'
import {
  DateComponent, Seg,
  PointerDragEvent, Hit,
  EventMutation, applyMutationToEventStore,
  startOfDay,
  elementClosest,
  EventStore, getRelevantEvents, createEmptyEventStore,
  EventInteractionState,
  diffDates, enableCursor, disableCursor,
  getElSeg,
  eventDragMutationMassager,
  Interaction, InteractionSettings, interactionSettingsStore,
  EventDropTransformers,
  CalendarContext,
  buildEventApis,
  isInteractionValid,
  EventImpl,
} from '@fullcalendar/core/internal'
import { HitDragging, isHitsEqual } from './HitDragging.js'
import { FeaturefulElementDragging } from '../dnd/FeaturefulElementDragging.js'
import { buildDatePointApiWithContext } from '../utils.js'

export type EventDragStopArg = EventDragArg
export type EventDragStartArg = EventDragArg

export interface EventDragArg {
  el: HTMLElement
  event: EventApi
  jsEvent: MouseEvent
  view: ViewApi
}

export class EventDragging extends Interaction { // TODO: rename to EventSelectingAndDragging
  // TODO: test this in IE11
  // QUESTION: why do we need it on the resizable???
  static SELECTOR = '.fc-event-draggable, .fc-event-resizable'

  dragging: FeaturefulElementDragging
  hitDragging: HitDragging

  // internal state
  subjectEl: HTMLElement | null = null
  subjectSeg: Seg | null = null // the seg being selected/dragged
  isDragging: boolean = false
  eventRange: EventRenderRange | null = null
  relevantEvents: EventStore | null = null // the events being dragged
  receivingContext: CalendarContext | null = null
  validMutation: EventMutation | null = null
  mutatedRelevantEvents: EventStore | null = null

  constructor(settings: InteractionSettings) {
    super(settings)
    let { component } = this
    let { options } = component.context

    let dragging = this.dragging = new FeaturefulElementDragging(settings.el)
    dragging.pointer.selector = EventDragging.SELECTOR
    dragging.touchScrollAllowed = false
    dragging.autoScroller.isEnabled = options.dragScroll

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, interactionSettingsStore)
    hitDragging.useSubjectCenter = settings.useEventCenter
    hitDragging.emitter.on('pointerdown', this.handlePointerDown)
    hitDragging.emitter.on('dragstart', this.handleDragStart)
    hitDragging.emitter.on('hitupdate', this.handleHitUpdate)
    hitDragging.emitter.on('pointerup', this.handlePointerUp)
    hitDragging.emitter.on('dragend', this.handleDragEnd)
  }

  destroy() {
    this.dragging.destroy()
  }

  handlePointerDown = (ev: PointerDragEvent) => {
    let origTarget = ev.origEvent.target as HTMLElement
    let { component, dragging } = this
    let { mirror } = dragging
    let { options } = component.context
    let initialContext = component.context
    this.subjectEl = ev.subjectEl as HTMLElement
    let subjectSeg = this.subjectSeg = getElSeg(ev.subjectEl as HTMLElement)!
    let eventRange = this.eventRange = subjectSeg.eventRange!
    let eventInstanceId = eventRange.instance!.instanceId

    this.relevantEvents = getRelevantEvents(
      initialContext.getCurrentData().eventStore,
      eventInstanceId,
    )

    dragging.minDistance = ev.isTouch ? 0 : options.eventDragMinDistance
    dragging.delay =
      // only do a touch delay if touch and this event hasn't been selected yet
      (ev.isTouch && eventInstanceId !== component.props.eventSelection) ?
        getComponentTouchDelay(component) :
        null

    if (options.fixedMirrorParent) {
      mirror.parentNode = options.fixedMirrorParent
    } else {
      mirror.parentNode = elementClosest(origTarget, '.fc')
    }

    mirror.revertDuration = options.dragRevertDuration

    let isValid =
      component.isValidSegDownEl(origTarget) &&
      !elementClosest(origTarget, '.fc-event-resizer') // NOT on a resizer

    dragging.setIgnoreMove(!isValid)

    // disable dragging for elements that are resizable (ie, selectable)
    // but are not draggable
    this.isDragging = isValid &&
      (ev.subjectEl as HTMLElement).classList.contains('fc-event-draggable')
  }

  handleDragStart = (ev: PointerDragEvent) => {
    let initialContext = this.component.context
    let eventRange = this.eventRange!
    let eventInstanceId = eventRange.instance.instanceId

    if (ev.isTouch) {
      // need to select a different event?
      if (eventInstanceId !== this.component.props.eventSelection) {
        initialContext.dispatch({ type: 'SELECT_EVENT', eventInstanceId })
      }
    } else {
      // if now using mouse, but was previous touch interaction, clear selected event
      initialContext.dispatch({ type: 'UNSELECT_EVENT' })
    }

    if (this.isDragging) {
      initialContext.calendarApi.unselect(ev) // unselect *date* selection
      initialContext.emitter.trigger('eventDragStart', {
        el: this.subjectEl,
        event: new EventImpl(initialContext, eventRange.def, eventRange.instance),
        jsEvent: ev.origEvent as MouseEvent, // Is this always a mouse event? See #4655
        view: initialContext.viewApi,
      } as EventDragStartArg)
    }
  }

  handleHitUpdate = (hit: Hit | null, isFinal: boolean) => {
    if (!this.isDragging) {
      return
    }

    let relevantEvents = this.relevantEvents!
    let initialHit = this.hitDragging.initialHit!
    let initialContext = this.component.context

    // states based on new hit
    let receivingContext: CalendarContext | null = null
    let mutation: EventMutation | null = null
    let mutatedRelevantEvents: EventStore | null = null
    let isInvalid = false
    let interaction: EventInteractionState = {
      affectedEvents: relevantEvents,
      mutatedEvents: createEmptyEventStore(),
      isEvent: true,
    }

    if (hit) {
      receivingContext = hit.context
      let receivingOptions = receivingContext.options

      if (
        initialContext === receivingContext ||
        (receivingOptions.editable && receivingOptions.droppable)
      ) {
        mutation = computeEventMutation(
          initialHit,
          hit,
          receivingContext.getCurrentData().pluginHooks.eventDragMutationMassagers,
        )

        if (mutation) {
          mutatedRelevantEvents = applyMutationToEventStore(
            relevantEvents,
            receivingContext.getCurrentData().eventUiBases,
            mutation,
            receivingContext,
          )
          interaction.mutatedEvents = mutatedRelevantEvents

          if (!isInteractionValid(interaction, hit.dateProfile, receivingContext)) {
            isInvalid = true
            mutation = null
            mutatedRelevantEvents = null
            interaction.mutatedEvents = createEmptyEventStore()
          }
        }
      } else {
        receivingContext = null
      }
    }

    this.displayDrag(receivingContext, interaction)

    if (!isInvalid) {
      enableCursor()
    } else {
      disableCursor()
    }

    if (!isFinal) {
      if (
        initialContext === receivingContext && // TODO: write test for this
        isHitsEqual(initialHit, hit)
      ) {
        mutation = null
      }

      this.dragging.setMirrorNeedsRevert(!mutation)

      // render the mirror if no already-rendered mirror
      // TODO: wish we could somehow wait for dispatch to guarantee render
      this.dragging.setMirrorIsVisible(
        !hit || !(this.subjectEl.getRootNode() as ParentNode).querySelector('.fc-event-mirror'), // TODO: turn className into constant
      )

      // assign states based on new hit
      this.receivingContext = receivingContext
      this.validMutation = mutation
      this.mutatedRelevantEvents = mutatedRelevantEvents
    }
  }

  handlePointerUp = () => {
    if (!this.isDragging) {
      this.cleanup() // because handleDragEnd won't fire
    }
  }

  handleDragEnd = (ev: PointerDragEvent) => {
    if (this.isDragging) {
      let initialContext = this.component.context
      let initialView = initialContext.viewApi
      let { receivingContext, validMutation } = this
      let eventDef = this.eventRange!.def
      let eventInstance = this.eventRange!.instance
      let eventApi = new EventImpl(initialContext, eventDef, eventInstance)
      let relevantEvents = this.relevantEvents!
      let mutatedRelevantEvents = this.mutatedRelevantEvents!
      let { finalHit } = this.hitDragging

      this.clearDrag() // must happen after revert animation

      initialContext.emitter.trigger('eventDragStop', {
        el: this.subjectEl,
        event: eventApi,
        jsEvent: ev.origEvent as MouseEvent, // Is this always a mouse event? See #4655
        view: initialView,
      } as EventDragStopArg)

      if (validMutation) {
        // dropped within same calendar
        if (receivingContext === initialContext) {
          let updatedEventApi = new EventImpl(
            initialContext,
            mutatedRelevantEvents.defs[eventDef.defId],
            eventInstance ? mutatedRelevantEvents.instances[eventInstance.instanceId] : null,
          )

          initialContext.dispatch({
            type: 'MERGE_EVENTS',
            eventStore: mutatedRelevantEvents,
          })

          let eventChangeArg: EventChangeArg = {
            oldEvent: eventApi,
            event: updatedEventApi,
            relatedEvents: buildEventApis(mutatedRelevantEvents, initialContext, eventInstance),
            revert() {
              initialContext.dispatch({
                type: 'MERGE_EVENTS',
                eventStore: relevantEvents, // the pre-change data
              })
            },
          }

          let transformed: ReturnType<EventDropTransformers> = {}
          for (let transformer of initialContext.getCurrentData().pluginHooks.eventDropTransformers) {
            Object.assign(transformed, transformer(validMutation, initialContext))
          }

          initialContext.emitter.trigger('eventDrop', {
            ...eventChangeArg,
            ...transformed,
            el: ev.subjectEl as HTMLElement,
            delta: validMutation.datesDelta!,
            jsEvent: ev.origEvent as MouseEvent, // bad
            view: initialView,
          })

          initialContext.emitter.trigger('eventChange', eventChangeArg)

        // dropped in different calendar
        } else if (receivingContext) {
          let eventRemoveArg: EventRemoveArg = {
            event: eventApi,
            relatedEvents: buildEventApis(relevantEvents, initialContext, eventInstance),
            revert() {
              initialContext.dispatch({
                type: 'MERGE_EVENTS',
                eventStore: relevantEvents,
              })
            },
          }

          initialContext.emitter.trigger('eventLeave', {
            ...eventRemoveArg,
            draggedEl: ev.subjectEl as HTMLElement,
            view: initialView,
          })

          initialContext.dispatch({
            type: 'REMOVE_EVENTS',
            eventStore: relevantEvents,
          })

          initialContext.emitter.trigger('eventRemove', eventRemoveArg)

          let addedEventDef = mutatedRelevantEvents.defs[eventDef.defId]
          let addedEventInstance = mutatedRelevantEvents.instances[eventInstance.instanceId]
          let addedEventApi = new EventImpl(receivingContext, addedEventDef, addedEventInstance)

          receivingContext.dispatch({
            type: 'MERGE_EVENTS',
            eventStore: mutatedRelevantEvents,
          })

          let eventAddArg: EventAddArg = {
            event: addedEventApi,
            relatedEvents: buildEventApis(mutatedRelevantEvents, receivingContext, addedEventInstance),
            revert() {
              receivingContext.dispatch({
                type: 'REMOVE_EVENTS',
                eventStore: mutatedRelevantEvents,
              })
            },
          }

          receivingContext.emitter.trigger('eventAdd', eventAddArg)

          if (ev.isTouch) {
            receivingContext.dispatch({
              type: 'SELECT_EVENT',
              eventInstanceId: eventInstance.instanceId,
            })
          }

          receivingContext.emitter.trigger('drop', {
            ...buildDatePointApiWithContext(finalHit.dateSpan, receivingContext),
            draggedEl: ev.subjectEl as HTMLElement,
            jsEvent: ev.origEvent as MouseEvent, // Is this always a mouse event? See #4655
            view: finalHit.context.viewApi,
          })

          receivingContext.emitter.trigger('eventReceive', {
            ...eventAddArg,
            draggedEl: ev.subjectEl as HTMLElement,
            view: finalHit.context.viewApi,
          })
        }
      } else {
        initialContext.emitter.trigger('_noEventDrop')
      }
    }

    this.cleanup()
  }

  // render a drag state on the next receivingCalendar
  displayDrag(nextContext: CalendarContext | null, state: EventInteractionState) {
    let initialContext = this.component.context
    let prevContext = this.receivingContext

    // does the previous calendar need to be cleared?
    if (prevContext && prevContext !== nextContext) {
      // does the initial calendar need to be cleared?
      // if so, don't clear all the way. we still need to to hide the affectedEvents
      if (prevContext === initialContext) {
        prevContext.dispatch({
          type: 'SET_EVENT_DRAG',
          state: {
            affectedEvents: state.affectedEvents,
            mutatedEvents: createEmptyEventStore(),
            isEvent: true,
          },
        })

      // completely clear the old calendar if it wasn't the initial
      } else {
        prevContext.dispatch({ type: 'UNSET_EVENT_DRAG' })
      }
    }

    if (nextContext) {
      nextContext.dispatch({ type: 'SET_EVENT_DRAG', state })
    }
  }

  clearDrag() {
    let initialCalendar = this.component.context
    let { receivingContext } = this

    if (receivingContext) {
      receivingContext.dispatch({ type: 'UNSET_EVENT_DRAG' })
    }

    // the initial calendar might have an dummy drag state from displayDrag
    if (initialCalendar !== receivingContext) {
      initialCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' })
    }
  }

  cleanup() { // reset all internal state
    this.subjectSeg = null
    this.isDragging = false
    this.eventRange = null
    this.relevantEvents = null
    this.receivingContext = null
    this.validMutation = null
    this.mutatedRelevantEvents = null
  }
}

function computeEventMutation(
  hit0: Hit,
  hit1: Hit,
  massagers: eventDragMutationMassager[],
): EventMutation {
  let dateSpan0 = hit0.dateSpan
  let dateSpan1 = hit1.dateSpan
  let date0 = dateSpan0.range.start
  let date1 = dateSpan1.range.start
  let standardProps = {} as any

  if (dateSpan0.allDay !== dateSpan1.allDay) {
    standardProps.allDay = dateSpan1.allDay
    standardProps.hasEnd = hit1.context.options.allDayMaintainDuration

    if (dateSpan1.allDay) {
      // means date1 is already start-of-day,
      // but date0 needs to be converted
      date0 = startOfDay(date0)
    }
  }

  let delta = diffDates(
    date0, date1,
    hit0.context.dateEnv,
    hit0.componentId === hit1.componentId ?
      hit0.largeUnit :
      null,
  )

  if (delta.milliseconds) { // has hours/minutes/seconds
    standardProps.allDay = false
  }

  let mutation: EventMutation = {
    datesDelta: delta,
    standardProps,
  }

  for (let massager of massagers) {
    massager(mutation, hit0, hit1)
  }

  return mutation
}

function getComponentTouchDelay(component: DateComponent<any>): number | null {
  let { options } = component.context
  let delay = options.eventLongPressDelay

  if (delay == null) {
    delay = options.longPressDelay
  }

  return delay
}
