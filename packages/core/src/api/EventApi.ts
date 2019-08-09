import Calendar from '../Calendar'
import { EventDef, EventInstance, NON_DATE_PROPS, DATE_PROPS } from '../structs/event'
import { UNSCOPED_EVENT_UI_PROPS } from '../component/event-ui'
import { EventMutation } from '../structs/event-mutation'
import { DateInput } from '../datelib/env'
import { diffDates, computeAlignedDayRange } from '../util/misc'
import { DurationInput, createDuration, durationsEqual } from '../datelib/duration'
import { createFormatter, FormatterInput } from '../datelib/formatting'
import EventSourceApi from './EventSourceApi'

export default class EventApi {

  _calendar: Calendar
  _def: EventDef
  _instance: EventInstance | null

  constructor(calendar: Calendar, def: EventDef, instance?: EventInstance) {
    this._calendar = calendar
    this._def = def
    this._instance = instance || null
  }

  /*
  TODO: make event struct more responsible for this
  */
  setProp(name: string, val: string) {
    if (name in DATE_PROPS) {
      // error. date-related props need other methods

    } else if (name in NON_DATE_PROPS) {

      if (typeof NON_DATE_PROPS[name] === 'function') {
        val = NON_DATE_PROPS[name](val)
      }

      this.mutate({
        standardProps: { [name]: val }
      })

    } else if (name in UNSCOPED_EVENT_UI_PROPS) {
      let ui

      if (typeof UNSCOPED_EVENT_UI_PROPS[name] === 'function') {
        val = UNSCOPED_EVENT_UI_PROPS[name](val)
      }

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
      // error
    }
  }

  setExtendedProp(name: string, val: any) {
    this.mutate({
      extendedProps: { [name]: val }
    })
  }

  setStart(startInput: DateInput, options: { granularity?: string, maintainDuration?: boolean } = {}) {
    let { dateEnv } = this._calendar
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
    let { dateEnv } = this._calendar
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
    let { dateEnv } = this._calendar
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
      maintainDuration = this._calendar.opt('allDayMaintainDuration')
    }

    if (this._def.allDay !== allDay) {
      standardProps.hasEnd = maintainDuration
    }

    this.mutate({ standardProps })
  }

  formatRange(formatInput: FormatterInput) {
    let { dateEnv } = this._calendar
    let instance = this._instance
    let formatter = createFormatter(formatInput, this._calendar.opt('defaultRangeSeparator'))

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
    let def = this._def
    let instance = this._instance

    if (instance) {
      this._calendar.dispatch({
        type: 'MUTATE_EVENTS',
        instanceId: instance.instanceId,
        mutation,
        fromApi: true
      })

      let eventStore = this._calendar.state.eventStore
      this._def = eventStore.defs[def.defId]
      this._instance = eventStore.instances[instance.instanceId]
    }
  }

  remove() {
    this._calendar.dispatch({
      type: 'REMOVE_EVENT_DEF',
      defId: this._def.defId
    })
  }

  get source(): EventSourceApi | null {
    let sourceId = this._def.sourceId

    if (sourceId) {
      return new EventSourceApi(
        this._calendar,
        this._calendar.state.eventSources[sourceId]
      )
    }
    return null
  }

  get start(): Date | null {
    return this._instance ?
      this._calendar.dateEnv.toDate(this._instance.range.start) :
      null
  }

  get end(): Date | null {
    return (this._instance && this._def.hasEnd) ?
      this._calendar.dateEnv.toDate(this._instance.range.end) :
      null
  }

  // computable props that all access the def
  // TODO: find a TypeScript-compatible way to do this at scale
  get id(): string { return this._def.publicId }
  get groupId(): string { return this._def.groupId }
  get allDay(): boolean { return this._def.allDay }
  get title(): string { return this._def.title }
  get url(): string { return this._def.url }
  get rendering(): string { return this._def.rendering }
  get startEditable(): boolean { return this._def.ui.startEditable }
  get durationEditable(): boolean { return this._def.ui.durationEditable }
  get constraint(): any { return this._def.ui.constraints[0] || null }
  get overlap(): any { return this._def.ui.overlap }
  get allow(): any { return this._def.ui.allows[0] || null }
  get backgroundColor(): string { return this._def.ui.backgroundColor }
  get borderColor(): string { return this._def.ui.borderColor }
  get textColor(): string { return this._def.ui.textColor }

  // NOTE: user can't modify these because Object.freeze was called in event-def parsing
  get classNames(): string[] { return this._def.ui.classNames }
  get extendedProps(): any { return this._def.extendedProps }

}
