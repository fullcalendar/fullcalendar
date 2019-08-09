import {
  DateComponent, Seg,
  PointerDragEvent, Hit,
  EventMutation, applyMutationToEventStore,
  startOfDay,
  elementClosest,
  EventStore, getRelevantEvents, createEmptyEventStore,
  Calendar,
  EventInteractionState,
  diffDates, enableCursor, disableCursor,
  EventRenderRange, getElSeg,
  EventApi,
  View,
  eventDragMutationMassager,
  Interaction, InteractionSettings, interactionSettingsStore,
  EventDropTransformers
} from '@fullcalendar/core'
import HitDragging, { isHitsEqual } from './HitDragging'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import { __assign } from 'tslib'


export default class EventDragging extends Interaction { // TODO: rename to EventSelectingAndDragging

  static SELECTOR = '.fc-draggable, .fc-resizable' // TODO: test this in IE11

  dragging: FeaturefulElementDragging
  hitDragging: HitDragging

  // internal state
  subjectSeg: Seg | null = null // the seg being selected/dragged
  isDragging: boolean = false
  eventRange: EventRenderRange | null = null
  relevantEvents: EventStore | null = null // the events being dragged
  receivingCalendar: Calendar | null = null
  validMutation: EventMutation | null = null
  mutatedRelevantEvents: EventStore | null = null

  constructor(settings: InteractionSettings) {
    super(settings)
    let { component } = this

    let dragging = this.dragging = new FeaturefulElementDragging(component.el)
    dragging.pointer.selector = EventDragging.SELECTOR
    dragging.touchScrollAllowed = false
    dragging.autoScroller.isEnabled = component.opt('dragScroll')

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
    let initialCalendar = component.calendar
    let subjectSeg = this.subjectSeg = getElSeg(ev.subjectEl as HTMLElement)!
    let eventRange = this.eventRange = subjectSeg.eventRange!
    let eventInstanceId = eventRange.instance!.instanceId

    this.relevantEvents = getRelevantEvents(
      initialCalendar.state.eventStore,
      eventInstanceId
    )

    dragging.minDistance = ev.isTouch ? 0 : component.opt('eventDragMinDistance')
    dragging.delay =
      // only do a touch delay if touch and this event hasn't been selected yet
      (ev.isTouch && eventInstanceId !== component.props.eventSelection) ?
        getComponentTouchDelay(component) :
        null

    mirror.parentNode = initialCalendar.el
    mirror.revertDuration = component.opt('dragRevertDuration')

    let isValid =
      component.isValidSegDownEl(origTarget) &&
      !elementClosest(origTarget, '.fc-resizer') // NOT on a resizer

    dragging.setIgnoreMove(!isValid)

    // disable dragging for elements that are resizable (ie, selectable)
    // but are not draggable
    this.isDragging = isValid &&
      (ev.subjectEl as HTMLElement).classList.contains('fc-draggable')
  }

  handleDragStart = (ev: PointerDragEvent) => {
    let initialCalendar = this.component.calendar
    let eventRange = this.eventRange!
    let eventInstanceId = eventRange.instance.instanceId

    if (ev.isTouch) {
      // need to select a different event?
      if (eventInstanceId !== this.component.props.eventSelection) {
        initialCalendar.dispatch({ type: 'SELECT_EVENT', eventInstanceId })
      }
    } else {
      // if now using mouse, but was previous touch interaction, clear selected event
      initialCalendar.dispatch({ type: 'UNSELECT_EVENT' })
    }

    if (this.isDragging) {
      initialCalendar.unselect(ev) // unselect *date* selection
      initialCalendar.publiclyTrigger('eventDragStart', [
        {
          el: this.subjectSeg.el,
          event: new EventApi(initialCalendar, eventRange.def, eventRange.instance),
          jsEvent: ev.origEvent as MouseEvent, // Is this always a mouse event? See #4655
          view: this.component.view
        }
      ])
    }
  }

  handleHitUpdate = (hit: Hit | null, isFinal: boolean) => {

    if (!this.isDragging) {
      return
    }

    let relevantEvents = this.relevantEvents!
    let initialHit = this.hitDragging.initialHit!
    let initialCalendar = this.component.calendar

    // states based on new hit
    let receivingCalendar: Calendar | null = null
    let mutation: EventMutation | null = null
    let mutatedRelevantEvents: EventStore | null = null
    let isInvalid = false
    let interaction: EventInteractionState = {
      affectedEvents: relevantEvents,
      mutatedEvents: createEmptyEventStore(),
      isEvent: true,
      origSeg: this.subjectSeg
    }

    if (hit) {
      let receivingComponent = hit.component
      receivingCalendar = receivingComponent.calendar

      if (
        initialCalendar === receivingCalendar ||
        receivingComponent.opt('editable') && receivingComponent.opt('droppable')
      ) {
        mutation = computeEventMutation(initialHit, hit, receivingCalendar.pluginSystem.hooks.eventDragMutationMassagers)

        if (mutation) {
          mutatedRelevantEvents = applyMutationToEventStore(relevantEvents, receivingCalendar.eventUiBases, mutation, receivingCalendar)
          interaction.mutatedEvents = mutatedRelevantEvents

          if (!receivingComponent.isInteractionValid(interaction)) {
            isInvalid = true
            mutation = null

            mutatedRelevantEvents = null
            interaction.mutatedEvents = createEmptyEventStore()
          }
        }
      } else {
        receivingCalendar = null
      }
    }

    this.displayDrag(receivingCalendar, interaction)

    if (!isInvalid) {
      enableCursor()
    } else {
      disableCursor()
    }

    if (!isFinal) {

      if (
        initialCalendar === receivingCalendar && // TODO: write test for this
        isHitsEqual(initialHit, hit)
      ) {
        mutation = null
      }

      this.dragging.setMirrorNeedsRevert(!mutation)

      // render the mirror if no already-rendered mirror
      // TODO: wish we could somehow wait for dispatch to guarantee render
      this.dragging.setMirrorIsVisible(
        !hit || !document.querySelector('.fc-mirror')
      )

      // assign states based on new hit
      this.receivingCalendar = receivingCalendar
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
      let initialCalendar = this.component.calendar
      let initialView = this.component.view
      let { receivingCalendar, validMutation } = this
      let eventDef = this.eventRange!.def
      let eventInstance = this.eventRange!.instance
      let eventApi = new EventApi(initialCalendar, eventDef, eventInstance)
      let relevantEvents = this.relevantEvents!
      let mutatedRelevantEvents = this.mutatedRelevantEvents!
      let { finalHit } = this.hitDragging

      this.clearDrag() // must happen after revert animation

      initialCalendar.publiclyTrigger('eventDragStop', [
        {
          el: this.subjectSeg.el,
          event: eventApi,
          jsEvent: ev.origEvent as MouseEvent, // Is this always a mouse event? See #4655
          view: initialView
        }
      ])

      if (validMutation) {

        // dropped within same calendar
        if (receivingCalendar === initialCalendar) {

          initialCalendar.dispatch({
            type: 'MERGE_EVENTS',
            eventStore: mutatedRelevantEvents
          })

          let transformed: ReturnType<EventDropTransformers> = {}

          for (let transformer of initialCalendar.pluginSystem.hooks.eventDropTransformers) {
            __assign(transformed, transformer(validMutation, initialCalendar))
          }

          const eventDropArg = {
            ...transformed, // don't use __assign here because it's not type-safe
            el: ev.subjectEl as HTMLElement,
            delta: validMutation.datesDelta!,
            oldEvent: eventApi,
            event: new EventApi( // the data AFTER the mutation
              initialCalendar,
              mutatedRelevantEvents.defs[eventDef.defId],
              eventInstance ? mutatedRelevantEvents.instances[eventInstance.instanceId] : null
            ),
            revert: function() {
              initialCalendar.dispatch({
                type: 'MERGE_EVENTS',
                eventStore: relevantEvents
              })
            },
            jsEvent: ev.origEvent,
            view: initialView
          }

          initialCalendar.publiclyTrigger('eventDrop', [ eventDropArg ])

        // dropped in different calendar
        } else if (receivingCalendar) {

          initialCalendar.publiclyTrigger('eventLeave', [
            {
              draggedEl: ev.subjectEl as HTMLElement,
              event: eventApi,
              view: initialView
            }
          ])

          initialCalendar.dispatch({
            type: 'REMOVE_EVENT_INSTANCES',
            instances: this.mutatedRelevantEvents!.instances
          })

          receivingCalendar.dispatch({
            type: 'MERGE_EVENTS',
            eventStore: this.mutatedRelevantEvents!
          })

          if (ev.isTouch) {
            receivingCalendar.dispatch({
              type: 'SELECT_EVENT',
              eventInstanceId: eventInstance.instanceId
            })
          }

          let dropArg = {
            ...receivingCalendar.buildDatePointApi(finalHit.dateSpan),
            draggedEl: ev.subjectEl as HTMLElement,
            jsEvent: ev.origEvent as MouseEvent, // Is this always a mouse event? See #4655
            view: finalHit.component as View // should this be finalHit.component.view? See #4644
          }
          receivingCalendar.publiclyTrigger('drop', [ dropArg ])

          receivingCalendar.publiclyTrigger('eventReceive', [
            {
              draggedEl: ev.subjectEl as HTMLElement,
              event: new EventApi( // the data AFTER the mutation
                receivingCalendar,
                mutatedRelevantEvents.defs[eventDef.defId],
                mutatedRelevantEvents.instances[eventInstance.instanceId]
              ),
              view: finalHit.component as View // should this be finalHit.component.view? See #4644
            }
          ])
        }

      } else {
        initialCalendar.publiclyTrigger('_noEventDrop')
      }
    }

    this.cleanup()
  }

  // render a drag state on the next receivingCalendar
  displayDrag(nextCalendar: Calendar | null, state: EventInteractionState) {
    let initialCalendar = this.component.calendar
    let prevCalendar = this.receivingCalendar

    // does the previous calendar need to be cleared?
    if (prevCalendar && prevCalendar !== nextCalendar) {

      // does the initial calendar need to be cleared?
      // if so, don't clear all the way. we still need to to hide the affectedEvents
      if (prevCalendar === initialCalendar) {
        prevCalendar.dispatch({
          type: 'SET_EVENT_DRAG',
          state: {
            affectedEvents: state.affectedEvents,
            mutatedEvents: createEmptyEventStore(),
            isEvent: true,
            origSeg: state.origSeg
          }
        })

      // completely clear the old calendar if it wasn't the initial
      } else {
        prevCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' })
      }
    }

    if (nextCalendar) {
      nextCalendar.dispatch({ type: 'SET_EVENT_DRAG', state })
    }
  }

  clearDrag() {
    let initialCalendar = this.component.calendar
    let { receivingCalendar } = this

    if (receivingCalendar) {
      receivingCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' })
    }

    // the initial calendar might have an dummy drag state from displayDrag
    if (initialCalendar !== receivingCalendar) {
      initialCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' })
    }
  }

  cleanup() { // reset all internal state
    this.subjectSeg = null
    this.isDragging = false
    this.eventRange = null
    this.relevantEvents = null
    this.receivingCalendar = null
    this.validMutation = null
    this.mutatedRelevantEvents = null
  }

}

function computeEventMutation(hit0: Hit, hit1: Hit, massagers: eventDragMutationMassager[]): EventMutation {
  let dateSpan0 = hit0.dateSpan
  let dateSpan1 = hit1.dateSpan
  let date0 = dateSpan0.range.start
  let date1 = dateSpan1.range.start
  let standardProps = {} as any

  if (dateSpan0.allDay !== dateSpan1.allDay) {
    standardProps.allDay = dateSpan1.allDay
    standardProps.hasEnd = hit1.component.opt('allDayMaintainDuration')

    if (dateSpan1.allDay) {
      // means date1 is already start-of-day,
      // but date0 needs to be converted
      date0 = startOfDay(date0)
    }
  }

  let delta = diffDates(
    date0, date1,
    hit0.component.dateEnv,
    hit0.component === hit1.component ?
      hit0.component.largeUnit :
      null
  )

  if (delta.milliseconds) { // has hours/minutes/seconds
    standardProps.allDay = false
  }

  let mutation: EventMutation = {
    datesDelta: delta,
    standardProps
  }

  for (let massager of massagers) {
    massager(mutation, hit0, hit1)
  }

  return mutation
}

function getComponentTouchDelay(component: DateComponent<any>): number | null {
  let delay = component.opt('eventLongPressDelay')

  if (delay == null) {
    delay = component.opt('longPressDelay')
  }

  return delay
}
