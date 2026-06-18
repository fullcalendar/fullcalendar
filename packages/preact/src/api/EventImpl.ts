import { EventDef } from '../structs/event-def'
import { EVENT_NON_DATE_REFINERS, EVENT_DATE_REFINERS } from '../structs/event-parse'
import { EventInstance } from '../structs/event-instance'
import { EVENT_UI_REFINERS, EventUiHash } from '../component-util/event-ui'
import { EventMutation, applyMutationToEventStore } from '../structs/event-mutation'
import { diffDates, computeAlignedDayRange } from '../util/date'
import { createDuration, durationsEqual } from '@full-ui/headless-calendar'
import { joinDateTimeFormatParts } from '@full-ui/headless-calendar'
import { createFormatter } from '../datelib/formatting'
import { CalendarContext } from '../CalendarContext'
import { getRelevantEvents, EventStore } from '../structs/event-store'
import { Dictionary } from '../options'
import { warn } from '../util/warn'
import { EventApi } from './EventApi'
import { EventSourceImpl } from './EventSourceImpl'
import {
  DateInput,
  DurationInput,
  FormatterInput,
} from './structs'

export class EventImpl implements EventApi {
  _context: CalendarContext
  _def: EventDef
  _instance: EventInstance | null
  // instance will be null if expressing a recurring event that has no current instances,
  // OR if trying to validate an incoming external event that has no dates assigned

  constructor(context: CalendarContext, def: EventDef, instance?: EventInstance) {
    this._context = context
    this._def = def
    this._instance = instance || null
  }

  /*
  TODO: make event struct more responsible for this
  */
  setProp(name: string, val: any): void {
    if (name in EVENT_DATE_REFINERS) {
      warn(`Cannot set date-related event property \`${name}\`. Use a method instead.`)
    // TODO: make proper aliasing system?
    } else if (name === 'id') {
      val = EVENT_NON_DATE_REFINERS[name](val)

      this.mutate({
        standardProps: { publicId: val }, // hardcoded internal name
      })
    } else if (name in EVENT_NON_DATE_REFINERS) {
      val = EVENT_NON_DATE_REFINERS[name](val)

      this.mutate({
        standardProps: { [name]: val },
      })
    } else if (name in EVENT_UI_REFINERS) {
      let ui = EVENT_UI_REFINERS[name](val)

      if (name === 'editable') {
        ui = { startEditable: val, durationEditable: val }
      } else {
        ui = { [name]: val }
      }

      this.mutate({
        standardProps: { ui },
      })
    } else {
      warn(`Cannot set event property \`${name}\`. Use setExtendedProp instead.`)
    }
  }

  setExtendedProp(name: string, val: any): void {
    this.mutate({
      extendedProps: { [name]: val },
    })
  }

  setStart(startInput: DateInput, options: { granularity?: string, maintainDuration?: boolean } = {}): void {
    let { dateEnv } = this._context
    let start = dateEnv.createMarker(startInput)

    if (start && this._instance) { // TODO: warning if parsed bad
      let instanceRange = this._instance.range
      let startDelta = diffDates(instanceRange.start, start, dateEnv, options.granularity) // what if parsed bad!?

      if (options.maintainDuration) {
        this.mutate({ datesDelta: startDelta })
      } else {
        this.mutate({ startDelta })
      }
    }
  }

  setEnd(endInput: DateInput | null, options: { granularity?: string } = {}): void {
    let { dateEnv } = this._context
    let end

    if (endInput != null) {
      end = dateEnv.createMarker(endInput)

      if (!end) {
        return // TODO: warning if parsed bad
      }
    }

    if (this._instance) {
      if (end) {
        let endDelta = diffDates(this._instance.range.end, end, dateEnv, options.granularity)
        this.mutate({ endDelta })
      } else {
        this.mutate({ standardProps: { hasEnd: false } })
      }
    }
  }

  setDates(startInput: DateInput, endInput: DateInput | null, options: { allDay?: boolean, granularity?: string } = {}): void {
    let { dateEnv } = this._context
    let standardProps = { allDay: options.allDay } as any
    let start = dateEnv.createMarker(startInput)
    let end

    if (!start) {
      return // TODO: warning if parsed bad
    }

    if (endInput != null) {
      end = dateEnv.createMarker(endInput)

      if (!end) { // TODO: warning if parsed bad
        return
      }
    }

    if (this._instance) {
      let instanceRange = this._instance.range

      // when computing the diff for an event being converted to all-day,
      // compute diff off of the all-day values the way event-mutation does.
      if (options.allDay === true) {
        instanceRange = computeAlignedDayRange(instanceRange)
      }

      let startDelta = diffDates(instanceRange.start, start, dateEnv, options.granularity)

      if (end) {
        let endDelta = diffDates(instanceRange.end, end, dateEnv, options.granularity)

        if (durationsEqual(startDelta, endDelta)) {
          this.mutate({ datesDelta: startDelta, standardProps })
        } else {
          this.mutate({ startDelta, endDelta, standardProps })
        }
      } else { // means "clear the end"
        standardProps.hasEnd = false
        this.mutate({ datesDelta: startDelta, standardProps })
      }
    }
  }

  moveStart(deltaInput: DurationInput): void {
    let delta = createDuration(deltaInput)

    if (delta) { // TODO: warning if parsed bad
      this.mutate({ startDelta: delta })
    }
  }

  moveEnd(deltaInput: DurationInput): void {
    let delta = createDuration(deltaInput)

    if (delta) { // TODO: warning if parsed bad
      this.mutate({ endDelta: delta })
    }
  }

  moveDates(deltaInput: DurationInput): void {
    let delta = createDuration(deltaInput)

    if (delta) { // TODO: warning if parsed bad
      this.mutate({ datesDelta: delta })
    }
  }

  setAllDay(allDay: boolean, options: { maintainDuration?: boolean } = {}): void {
    let standardProps = { allDay } as any
    let { maintainDuration } = options

    if (maintainDuration == null) {
      maintainDuration = this._context.options.allDayMaintainDuration
    }

    if (this._def.allDay !== allDay) {
      standardProps.hasEnd = maintainDuration
    }

    this.mutate({ standardProps })
  }

  formatRange(formatInput: FormatterInput): string {
    let { dateEnv } = this._context
    let instance = this._instance
    let formatter = createFormatter(formatInput)

    if (this._def.hasEnd) {
      return joinDateTimeFormatParts(
        dateEnv.formatRangeToParts(instance.range.start, instance.range.end, formatter),
      )
    }
    return joinDateTimeFormatParts(dateEnv.formatToParts(instance.range.start, formatter))
  }

  mutate(mutation: EventMutation): void { // meant to be private. but plugins need access
    let instance = this._instance

    if (instance) {
      let def = this._def
      let context = this._context
      let { eventStore } = context.getCurrentData()
      let relevantEvents = getRelevantEvents(eventStore, instance.instanceId)
      let eventConfigBase = {
        '': { // HACK. always allow API to mutate events
          display: '',
          startEditable: true,
          durationEditable: true,
          constraints: [],
          overlap: null,
          allows: [],
          color: '',
          contrastColor: '',
          className: '',
        },
      } as EventUiHash

      relevantEvents = applyMutationToEventStore(relevantEvents, eventConfigBase, mutation, context)

      let oldEvent = new EventImpl(context, def, instance) // snapshot
      this._def = relevantEvents.defs[def.defId]
      this._instance = relevantEvents.instances[instance.instanceId]

      context.dispatch({
        type: 'MERGE_EVENTS',
        eventStore: relevantEvents,
      })

      context.emitter.trigger('eventChange', {
        oldEvent,
        event: this,
        relatedEvents: buildEventApis(relevantEvents, context, instance),
        revert() {
          context.dispatch({
            type: 'RESET_EVENTS',
            eventStore, // the ORIGINAL store
          })
        },
      })
    }
  }

  remove(): void {
    let context = this._context
    let asStore = eventApiToStore(this)

    context.dispatch({
      type: 'REMOVE_EVENTS',
      eventStore: asStore,
    })

    context.emitter.trigger('eventRemove', {
      event: this,
      relatedEvents: [],
      revert() {
        context.dispatch({
          type: 'MERGE_EVENTS',
          eventStore: asStore,
        })
      },
    })
  }

  get source(): EventSourceImpl | null {
    let { sourceId } = this._def

    if (sourceId) {
      return new EventSourceImpl(
        this._context,
        this._context.getCurrentData().eventSources[sourceId],
      )
    }
    return null
  }

  get start(): Date | null {
    return this._instance ?
      this._context.dateEnv.toDate(this._instance.range.start) :
      null
  }

  get end(): Date | null {
    return (this._instance && this._def.hasEnd) ?
      this._context.dateEnv.toDate(this._instance.range.end) :
      null
  }

  get startStr(): string {
    let instance = this._instance
    if (instance) {
      return this._context.dateEnv.formatIso(instance.range.start, {
        omitTime: this._def.allDay,
      })
    }
    return ''
  }

  get endStr(): string {
    let instance = this._instance
    if (instance && this._def.hasEnd) {
      return this._context.dateEnv.formatIso(instance.range.end, {
        omitTime: this._def.allDay,
      })
    }
    return ''
  }

  // computable props that all access the def
  // TODO: find a TypeScript-compatible way to do this at scale
  get id() { return this._def.publicId }
  get groupId() { return this._def.groupId }
  get allDay() { return this._def.allDay }
  get title() { return this._def.title }
  get url() { return this._def.url }
  get display() { return this._def.ui.display || 'auto' } // bad. just normalize the type earlier
  get startEditable() { return this._def.ui.startEditable }
  get durationEditable() { return this._def.ui.durationEditable }
  get constraint() { return this._def.ui.constraints[0] || null }
  get overlap() { return this._def.ui.overlap }
  get allow() { return this._def.ui.allows[0] || null }
  get color() { return this._def.ui.color }
  get contrastColor() { return this._def.ui.contrastColor }

  // NOTE: user can't modify these because Object.freeze was called in event-def parsing
  get className() { return this._def.ui.className }
  get extendedProps() { return this._def.extendedProps }

  toPlainObject(settings: { collapseExtendedProps?: boolean } = {}): Dictionary {
    let def = this._def
    let { ui } = def
    let { startStr, endStr } = this
    let res: Dictionary = {
      allDay: def.allDay,
    }

    if (def.title) {
      res.title = def.title
    }

    if (startStr) {
      res.start = startStr
    }

    if (endStr) {
      res.end = endStr
    }

    if (def.publicId) {
      res.id = def.publicId
    }

    if (def.groupId) {
      res.groupId = def.groupId
    }

    if (def.url) {
      res.url = def.url
    }

    if (ui.display && ui.display !== 'auto') {
      res.display = ui.display
    }

    // TODO: what about recurring-event properties???
    // TODO: include startEditable/durationEditable/constraint/overlap/allow

    if (ui.color) {
      res.color = ui.color
    }

    if (ui.contrastColor) {
      res.contrastColor = ui.contrastColor
    }

    if (ui.className) {
      res.className = ui.className
    }

    if (Object.keys(def.extendedProps).length) {
      if (settings.collapseExtendedProps) {
        Object.assign(res, def.extendedProps)
      } else {
        res.extendedProps = def.extendedProps
      }
    }

    return res
  }

  toJSON(): Dictionary {
    return this.toPlainObject()
  }
}

export function eventApiToStore(eventApi: EventImpl): EventStore {
  let def = eventApi._def
  let instance = eventApi._instance

  return {
    defs: { [def.defId]: def },
    instances: instance
      ? { [instance.instanceId]: instance }
      : {},
  }
}

export function buildEventApis(eventStore: EventStore, context: CalendarContext, excludeInstance?: EventInstance): EventImpl[] {
  let { defs, instances } = eventStore
  let eventApis: EventImpl[] = []
  let excludeInstanceId = excludeInstance ? excludeInstance.instanceId : ''

  for (let id in instances) {
    let instance = instances[id]
    let def = defs[instance.defId]

    if (instance.instanceId !== excludeInstanceId) {
      eventApis.push(new EventImpl(context, def, instance))
    }
  }

  return eventApis
}
