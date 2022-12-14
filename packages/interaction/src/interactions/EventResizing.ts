import {
  ViewApi,
  EventApi,
  EventChangeArg,
  EventRenderRange,
  Duration,
} from '@fullcalendar/core'
import {
  Seg, Hit,
  EventMutation, applyMutationToEventStore,
  elementClosest,
  PointerDragEvent,
  EventStore, getRelevantEvents, createEmptyEventStore,
  diffDates, enableCursor, disableCursor,
  DateRange,
  getElSeg,
  createDuration,
  EventInteractionState,
  Interaction, InteractionSettings, interactionSettingsToStore, buildEventApis, isInteractionValid,
  EventImpl,
} from '@fullcalendar/core/internal'
import { HitDragging, isHitsEqual } from './HitDragging.js'
import { FeaturefulElementDragging } from '../dnd/FeaturefulElementDragging.js'

export type EventResizeStartArg = EventResizeStartStopArg
export type EventResizeStopArg = EventResizeStartStopArg

export interface EventResizeStartStopArg {
  el: HTMLElement
  event: EventApi
  jsEvent: MouseEvent
  view: ViewApi
}

export interface EventResizeDoneArg extends EventChangeArg {
  el: HTMLElement
  startDelta: Duration
  endDelta: Duration
  jsEvent: MouseEvent
  view: ViewApi
}

export class EventResizing extends Interaction {
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging

  // internal state
  draggingSegEl: HTMLElement | null = null
  draggingSeg: Seg | null = null // TODO: rename to resizingSeg? subjectSeg?
  eventRange: EventRenderRange | null = null
  relevantEvents: EventStore | null = null
  validMutation: EventMutation | null = null
  mutatedRelevantEvents: EventStore | null = null

  constructor(settings: InteractionSettings) {
    super(settings)
    let { component } = settings

    let dragging = this.dragging = new FeaturefulElementDragging(settings.el)
    dragging.pointer.selector = '.fc-event-resizer'
    dragging.touchScrollAllowed = false
    dragging.autoScroller.isEnabled = component.context.options.dragScroll

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, interactionSettingsToStore(settings))
    hitDragging.emitter.on('pointerdown', this.handlePointerDown)
    hitDragging.emitter.on('dragstart', this.handleDragStart)
    hitDragging.emitter.on('hitupdate', this.handleHitUpdate)
    hitDragging.emitter.on('dragend', this.handleDragEnd)
  }

  destroy() {
    this.dragging.destroy()
  }

  handlePointerDown = (ev: PointerDragEvent) => {
    let { component } = this
    let segEl = this.querySegEl(ev)
    let seg = getElSeg(segEl)
    let eventRange = this.eventRange = seg.eventRange!

    this.dragging.minDistance = component.context.options.eventDragMinDistance

    // if touch, need to be working with a selected event
    this.dragging.setIgnoreMove(
      !this.component.isValidSegDownEl(ev.origEvent.target as HTMLElement) ||
      (ev.isTouch && this.component.props.eventSelection !== eventRange.instance!.instanceId),
    )
  }

  handleDragStart = (ev: PointerDragEvent) => {
    let { context } = this.component
    let eventRange = this.eventRange!

    this.relevantEvents = getRelevantEvents(
      context.getCurrentData().eventStore,
      this.eventRange.instance!.instanceId,
    )

    let segEl = this.querySegEl(ev)
    this.draggingSegEl = segEl
    this.draggingSeg = getElSeg(segEl)

    context.calendarApi.unselect()
    context.emitter.trigger('eventResizeStart', {
      el: segEl,
      event: new EventImpl(context, eventRange.def, eventRange.instance),
      jsEvent: ev.origEvent as MouseEvent, // Is this always a mouse event? See #4655
      view: context.viewApi,
    } as EventResizeStartArg)
  }

  handleHitUpdate = (hit: Hit | null, isFinal: boolean, ev: PointerDragEvent) => {
    let { context } = this.component
    let relevantEvents = this.relevantEvents!
    let initialHit = this.hitDragging.initialHit!
    let eventInstance = this.eventRange.instance!
    let mutation: EventMutation | null = null
    let mutatedRelevantEvents: EventStore | null = null
    let isInvalid = false
    let interaction: EventInteractionState = {
      affectedEvents: relevantEvents,
      mutatedEvents: createEmptyEventStore(),
      isEvent: true,
    }

    if (hit) {
      let disallowed = hit.componentId === initialHit.componentId
        && this.isHitComboAllowed
        && !this.isHitComboAllowed(initialHit, hit)

      if (!disallowed) {
        mutation = computeMutation(
          initialHit,
          hit,
          (ev.subjectEl as HTMLElement).classList.contains('fc-event-resizer-start'),
          eventInstance.range,
        )
      }
    }

    if (mutation) {
      mutatedRelevantEvents = applyMutationToEventStore(relevantEvents, context.getCurrentData().eventUiBases, mutation, context)
      interaction.mutatedEvents = mutatedRelevantEvents

      if (!isInteractionValid(interaction, hit.dateProfile, context)) {
        isInvalid = true
        mutation = null
        mutatedRelevantEvents = null
        interaction.mutatedEvents = null
      }
    }

    if (mutatedRelevantEvents) {
      context.dispatch({
        type: 'SET_EVENT_RESIZE',
        state: interaction,
      })
    } else {
      context.dispatch({ type: 'UNSET_EVENT_RESIZE' })
    }

    if (!isInvalid) {
      enableCursor()
    } else {
      disableCursor()
    }

    if (!isFinal) {
      if (mutation && isHitsEqual(initialHit, hit)) {
        mutation = null
      }

      this.validMutation = mutation
      this.mutatedRelevantEvents = mutatedRelevantEvents
    }
  }

  handleDragEnd = (ev: PointerDragEvent) => {
    let { context } = this.component
    let eventDef = this.eventRange!.def
    let eventInstance = this.eventRange!.instance
    let eventApi = new EventImpl(context, eventDef, eventInstance)
    let relevantEvents = this.relevantEvents!
    let mutatedRelevantEvents = this.mutatedRelevantEvents!

    context.emitter.trigger('eventResizeStop', {
      el: this.draggingSegEl,
      event: eventApi,
      jsEvent: ev.origEvent as MouseEvent, // Is this always a mouse event? See #4655
      view: context.viewApi,
    } as EventResizeStopArg)

    if (this.validMutation) {
      let updatedEventApi = new EventImpl(
        context,
        mutatedRelevantEvents.defs[eventDef.defId],
        eventInstance ? mutatedRelevantEvents.instances[eventInstance.instanceId] : null,
      )

      context.dispatch({
        type: 'MERGE_EVENTS',
        eventStore: mutatedRelevantEvents,
      })

      let eventChangeArg: EventChangeArg = {
        oldEvent: eventApi,
        event: updatedEventApi,
        relatedEvents: buildEventApis(mutatedRelevantEvents, context, eventInstance),
        revert() {
          context.dispatch({
            type: 'MERGE_EVENTS',
            eventStore: relevantEvents, // the pre-change events
          })
        },
      }

      context.emitter.trigger('eventResize', {
        ...eventChangeArg,
        el: this.draggingSegEl,
        startDelta: this.validMutation.startDelta || createDuration(0),
        endDelta: this.validMutation.endDelta || createDuration(0),
        jsEvent: ev.origEvent as MouseEvent,
        view: context.viewApi,
      })

      context.emitter.trigger('eventChange', eventChangeArg)
    } else {
      context.emitter.trigger('_noEventResize')
    }

    // reset all internal state
    this.draggingSeg = null
    this.relevantEvents = null
    this.validMutation = null

    // okay to keep eventInstance around. useful to set it in handlePointerDown
  }

  querySegEl(ev: PointerDragEvent) {
    return elementClosest(ev.subjectEl as HTMLElement, '.fc-event')
  }
}

function computeMutation(
  hit0: Hit,
  hit1: Hit,
  isFromStart: boolean,
  instanceRange: DateRange,
): EventMutation | null {
  let dateEnv = hit0.context.dateEnv
  let date0 = hit0.dateSpan.range.start
  let date1 = hit1.dateSpan.range.start

  let delta = diffDates(
    date0, date1,
    dateEnv,
    hit0.largeUnit,
  )

  if (isFromStart) {
    if (dateEnv.add(instanceRange.start, delta) < instanceRange.end) {
      return { startDelta: delta }
    }
  } else if (dateEnv.add(instanceRange.end, delta) > instanceRange.start) {
    return { endDelta: delta }
  }

  return null
}
