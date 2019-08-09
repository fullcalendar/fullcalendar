import {
  Seg, Hit,
  EventMutation, applyMutationToEventStore,
  elementClosest,
  PointerDragEvent,
  EventStore, getRelevantEvents, createEmptyEventStore,
  diffDates, enableCursor, disableCursor,
  DateRange,
  EventApi,
  EventRenderRange, getElSeg,
  createDuration,
  EventInteractionState,
  EventResizeJoinTransforms,
  Interaction, InteractionSettings, interactionSettingsToStore
} from '@fullcalendar/core'
import HitDragging, { isHitsEqual } from './HitDragging'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import { __assign } from 'tslib'


export default class EventDragging extends Interaction {

  dragging: FeaturefulElementDragging
  hitDragging: HitDragging

  // internal state
  draggingSeg: Seg | null = null // TODO: rename to resizingSeg? subjectSeg?
  eventRange: EventRenderRange | null = null
  relevantEvents: EventStore | null = null
  validMutation: EventMutation | null = null
  mutatedRelevantEvents: EventStore | null = null

  constructor(settings: InteractionSettings) {
    super(settings)
    let { component } = settings

    let dragging = this.dragging = new FeaturefulElementDragging(component.el)
    dragging.pointer.selector = '.fc-resizer'
    dragging.touchScrollAllowed = false
    dragging.autoScroller.isEnabled = component.opt('dragScroll')

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
    let seg = this.querySeg(ev)!
    let eventRange = this.eventRange = seg.eventRange!

    this.dragging.minDistance = component.opt('eventDragMinDistance')

    // if touch, need to be working with a selected event
    this.dragging.setIgnoreMove(
      !this.component.isValidSegDownEl(ev.origEvent.target as HTMLElement) ||
      (ev.isTouch && this.component.props.eventSelection !== eventRange.instance!.instanceId)
    )
  }

  handleDragStart = (ev: PointerDragEvent) => {
    let calendar = this.component.calendar
    let eventRange = this.eventRange!

    this.relevantEvents = getRelevantEvents(
      calendar.state.eventStore,
      this.eventRange.instance!.instanceId
    )

    this.draggingSeg = this.querySeg(ev)

    calendar.unselect()
    calendar.publiclyTrigger('eventResizeStart', [
      {
        el: this.draggingSeg.el,
        event: new EventApi(calendar, eventRange.def, eventRange.instance),
        jsEvent: ev.origEvent as MouseEvent, // Is this always a mouse event? See #4655
        view: this.component.view
      }
    ])
  }

  handleHitUpdate = (hit: Hit | null, isFinal: boolean, ev: PointerDragEvent) => {
    let calendar = this.component.calendar
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
      origSeg: this.draggingSeg
    }

    if (hit) {
      mutation = computeMutation(
        initialHit,
        hit,
        (ev.subjectEl as HTMLElement).classList.contains('fc-start-resizer'),
        eventInstance.range,
        calendar.pluginSystem.hooks.eventResizeJoinTransforms
      )
    }

    if (mutation) {
      mutatedRelevantEvents = applyMutationToEventStore(relevantEvents, calendar.eventUiBases, mutation, calendar)
      interaction.mutatedEvents = mutatedRelevantEvents

      if (!this.component.isInteractionValid(interaction)) {
        isInvalid = true
        mutation = null

        mutatedRelevantEvents = null
        interaction.mutatedEvents = null
      }
    }

    if (mutatedRelevantEvents) {
      calendar.dispatch({
        type: 'SET_EVENT_RESIZE',
        state: interaction
      })
    } else {
      calendar.dispatch({ type: 'UNSET_EVENT_RESIZE' })
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
    let calendar = this.component.calendar
    let view = this.component.view
    let eventDef = this.eventRange!.def
    let eventInstance = this.eventRange!.instance
    let eventApi = new EventApi(calendar, eventDef, eventInstance)
    let relevantEvents = this.relevantEvents!
    let mutatedRelevantEvents = this.mutatedRelevantEvents!

    calendar.publiclyTrigger('eventResizeStop', [
      {
        el: this.draggingSeg.el,
        event: eventApi,
        jsEvent: ev.origEvent as MouseEvent, // Is this always a mouse event? See #4655
        view
      }
    ])

    if (this.validMutation) {
      calendar.dispatch({
        type: 'MERGE_EVENTS',
        eventStore: mutatedRelevantEvents
      })

      calendar.publiclyTrigger('eventResize', [
        {
          el: this.draggingSeg.el,
          startDelta: this.validMutation.startDelta || createDuration(0),
          endDelta: this.validMutation.endDelta || createDuration(0),
          prevEvent: eventApi,
          event: new EventApi( // the data AFTER the mutation
            calendar,
            mutatedRelevantEvents.defs[eventDef.defId],
            eventInstance ? mutatedRelevantEvents.instances[eventInstance.instanceId] : null
          ),
          revert: function() {
            calendar.dispatch({
              type: 'MERGE_EVENTS',
              eventStore: relevantEvents
            })
          },
          jsEvent: ev.origEvent,
          view
        }
      ])

    } else {
      calendar.publiclyTrigger('_noEventResize')
    }

    // reset all internal state
    this.draggingSeg = null
    this.relevantEvents = null
    this.validMutation = null

    // okay to keep eventInstance around. useful to set it in handlePointerDown
  }

  querySeg(ev: PointerDragEvent): Seg | null {
    return getElSeg(elementClosest(ev.subjectEl as HTMLElement, this.component.fgSegSelector))
  }

}

function computeMutation(hit0: Hit, hit1: Hit, isFromStart: boolean, instanceRange: DateRange, transforms: EventResizeJoinTransforms[]): EventMutation | null {
  let dateEnv = hit0.component.dateEnv
  let date0 = hit0.dateSpan.range.start
  let date1 = hit1.dateSpan.range.start

  let delta = diffDates(
    date0, date1,
    dateEnv,
    hit0.component.largeUnit
  )

  let props = {} as EventMutation

  for (let transform of transforms) {
    let res = transform(hit0, hit1)

    if (res === false) {
      return null
    } else if (res) {
      __assign(props, res)
    }
  }

  if (isFromStart) {
    if (dateEnv.add(instanceRange.start, delta) < instanceRange.end) {
      props.startDelta = delta
      return props
    }
  } else {
    if (dateEnv.add(instanceRange.end, delta) > instanceRange.start) {
      props.endDelta = delta
      return props
    }
  }

  return null
}
