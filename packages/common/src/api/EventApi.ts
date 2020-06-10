import { EventDef } from '../structs/event-def'
import { EVENT_NON_DATE_REFINERS, EVENT_DATE_REFINERS } from '../structs/event-parse'
import { EventInstance } from '../structs/event-instance'
import { EVENT_UI_REFINERS, EventUiHash } from '../component/event-ui'
import { EventMutation, applyMutationToEventStore } from '../structs/event-mutation'
import { diffDates, computeAlignedDayRange } from '../util/date'
import { createDuration, durationsEqual } from '../datelib/duration'
import { createFormatter } from '../datelib/formatting'
import { CalendarContext } from '../CalendarContext'
import { eventWillUpdate, eventWillRemove } from '../events-will-update'
import { getRelevantEvents } from '../structs/event-store'
import { __assign } from 'tslib'
import { Dictionary } from '../options'

// public
import {
  DateInput,
  DurationInput,
  FormatterInput,
  EventSourceApi
} from '../api-type-deps'


export class EventApi {

  _context: CalendarContext
  _def: EventDef
  _instance: EventInstance | null

  constructor(context: CalendarContext, def: EventDef, instance?: EventInstance) {
    this._context = context
    this._def = def
    this._instance = instance || null
  }

  /*
  TODO: make event struct more responsible for this
  */
  setProp(name: string, val: string) {

    if (name in EVENT_DATE_REFINERS) {
      console.warn(`Could not set date-related prop 'name'. Use one of the date-related methods instead.`)

    } else if (name in EVENT_NON_DATE_REFINERS) {
      val = EVENT_NON_DATE_REFINERS[name](val)

      this.mutate({
        standardProps: { [name]: val }
      })

    } else if (name in EVENT_UI_REFINERS) {
      let ui = EVENT_UI_REFINERS[name](val)

      if (name === 'color') {
        ui = { backgroundColor: val, borderColor: val }
      } else if (name === 'editable') {
        ui = { startEditable: val, durationEditable: val }
      } else {
        ui = { [name]: val }
      }

      this.mutate({
        standardProps: { ui }
      })

    } else {
      console.warn(`Could not set prop '${name}'. Use setExtendedProp instead.`)
    }
  }

  setExtendedProp(name: string, val: any) {
    this.mutate({
      extendedProps: { [name]: val }
    })
  }

  setStart(startInput: DateInput, options: { granularity?: string, maintainDuration?: boolean } = {}) {
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

  setEnd(endInput: DateInput | null, options: { granularity?: string } = {}) {
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

  setDates(startInput: DateInput, endInput: DateInput | null, options: { allDay?: boolean, granularity?: string } = {}) {
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

  moveStart(deltaInput: DurationInput) {
    let delta = createDuration(deltaInput)

    if (delta) { // TODO: warning if parsed bad
      this.mutate({ startDelta: delta })
    }
  }

  moveEnd(deltaInput: DurationInput) {
    let delta = createDuration(deltaInput)

    if (delta) { // TODO: warning if parsed bad
      this.mutate({ endDelta: delta })
    }
  }

  moveDates(deltaInput: DurationInput) {
    let delta = createDuration(deltaInput)

    if (delta) { // TODO: warning if parsed bad
      this.mutate({ datesDelta: delta })
    }
  }

  setAllDay(allDay: boolean, options: { maintainDuration?: boolean } = {}) {
    let standardProps = { allDay } as any
    let maintainDuration = options.maintainDuration

    if (maintainDuration == null) {
      maintainDuration = this._context.options.allDayMaintainDuration
    }

    if (this._def.allDay !== allDay) {
      standardProps.hasEnd = maintainDuration
    }

    this.mutate({ standardProps })
  }

  formatRange(formatInput: FormatterInput) {
    let { dateEnv } = this._context
    let instance = this._instance
    let formatter = createFormatter(formatInput, this._context.options.defaultRangeSeparator)

    if (this._def.hasEnd) {
      return dateEnv.formatRange(instance.range.start, instance.range.end, formatter, {
        forcedStartTzo: instance.forcedStartTzo,
        forcedEndTzo: instance.forcedEndTzo
      })
    } else {
      return dateEnv.format(instance.range.start, formatter, {
        forcedTzo: instance.forcedStartTzo
      })
    }
  }

  mutate(mutation: EventMutation) { // meant to be private. but plugins need access
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
          backgroundColor: '',
          borderColor: '',
          textColor: '',
          classNames: []
        }
      } as EventUiHash

      relevantEvents = applyMutationToEventStore(relevantEvents, eventConfigBase, mutation, context)
      let updatedDef = relevantEvents.defs[def.defId]
      let updatedInstance = relevantEvents.instances[instance.instanceId]
      let updatedEventApi = new EventApi(context, updatedDef, updatedInstance)

      if (eventWillUpdate(updatedEventApi, relevantEvents, context)) {
        context.dispatch({
          type: 'MERGE_EVENTS',
          eventStore: relevantEvents
        })

        this._def = updatedDef
        this._instance = updatedInstance
      }
    }
  }

  remove() {
    if (eventWillRemove(this, this._context)) {
      this._context.dispatch({
        type: 'REMOVE_EVENT_DEF',
        defId: this._def.defId
      })
    }
  }

  get source(): EventSourceApi | null {
    let sourceId = this._def.sourceId

    if (sourceId) {
      return new EventSourceApi(
        this._context,
        this._context.getCurrentData().eventSources[sourceId]
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
  get backgroundColor() { return this._def.ui.backgroundColor }
  get borderColor() { return this._def.ui.borderColor }
  get textColor() { return this._def.ui.textColor }

  // NOTE: user can't modify these because Object.freeze was called in event-def parsing
  get classNames() { return this._def.ui.classNames }
  get extendedProps() { return this._def.extendedProps }


  toPlainObject(settings: { collapseExtendedProps?: boolean, collapseColor?: boolean } = {}): Dictionary {
    let { dateEnv } = this._context
    let def = this._def
    let instance = this._instance
    let { ui } = def
    let res: Dictionary = {
      title: def.title,
      allDay: def.allDay
    }

    if (instance) {
      res.start = dateEnv.formatIso(instance.range.start, { omitTime: def.allDay })

      if (def.hasEnd) {
        res.end = dateEnv.formatIso(instance.range.end, { omitTime: def.allDay })
      }
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

    // TODO: include startEditable/durationEditable/constraint/overlap/allow

    if (settings.collapseColor && ui.backgroundColor && ui.backgroundColor === ui.borderColor) {
      res.color = ui.backgroundColor

    } else {
      if (ui.backgroundColor) {
        res.backgroundColor = ui.backgroundColor
      }
      if (ui.borderColor) {
        res.borderColor = ui.borderColor
      }
    }

    if (ui.textColor) {
      res.textColor = ui.textColor
    }

    if (ui.classNames.length) {
      res.classNames = ui.classNames
    }

    if (Object.keys(def.extendedProps).length) {
      if (settings.collapseExtendedProps) {
        __assign(res, def.extendedProps)
      } else {
        res.extendedProps = def.extendedProps
      }
    }

    return res
  }


  toJSON() {
    return this.toPlainObject()
  }

}
