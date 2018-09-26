import Calendar from '../Calendar'
import { EventDef, EventInstance, EventTuple } from '../structs/event'
import { EventMutation } from '../structs/event-mutation'
import { DateInput } from '../datelib/env'
import { diffDates, computeAlignedDayRange } from '../util/misc'
import { subtractDurations, DurationInput, createDuration } from '../datelib/duration'
import { createFormatter, FormatterInput } from '../datelib/formatting'
import EventSourceApi from './EventSourceApi'

export default class EventApi implements EventTuple {

  calendar: Calendar
  def: EventDef
  instance: EventInstance | null

  constructor(calendar: Calendar, def: EventDef, instance?: EventInstance) {
    this.calendar = calendar
    this.def = def
    this.instance = instance || null
  }

  getSource(): EventSourceApi | null {
    if (this.def.sourceId) {
      return new EventSourceApi(
        this.calendar,
        this.calendar.state.eventSources[this.def.sourceId]
      )
    }
    return null
  }

  setProp(name: string, val: string) {
    if (name.match(/^(start|end|date|allDay)$/)) {
      // error. date-related props need other methods
    } else {
      let props

      // TODO: consolidate this logic with event struct?
      if (name === 'editable') {
        props = { startEditable: val, durationEditable: val }
      } else if (name === 'color') {
        props = { backgroundColor: val, borderColor: val }
      } else {
        props = { [name]: val }
      }

      this.mutate({
        standardProps: props
      })
    }
  }

  setExtendedProp(name: string, val: string) {
    this.mutate({
      extendedProps: { [name]: val }
    })
  }

  setStart(startInput: DateInput, options: { granularity?: string, maintainDuration?: boolean } = {}) {
    let dateEnv = this.calendar.dateEnv
    let start = dateEnv.createMarker(startInput)

    if (start && this.instance) { // TODO: warning if parsed bad
      let instanceRange = this.instance.range
      let startDelta = diffDates(instanceRange.start, start, dateEnv, options.granularity) // what if parsed bad!?
      let endDelta = null

      if (options.maintainDuration) {
        let origDuration = diffDates(instanceRange.start, instanceRange.end, dateEnv, options.granularity)
        let newDuration = diffDates(start, instanceRange.end, dateEnv, options.granularity)
        endDelta = subtractDurations(origDuration, newDuration)
      }

      this.mutate({ startDelta, endDelta })
    }
  }

  setEnd(endInput: DateInput | null, options: { granularity?: string } = {}) {
    let dateEnv = this.calendar.dateEnv
    let end

    if (endInput != null) {
      end = dateEnv.createMarker(endInput)

      if (!end) {
        return // TODO: warning if parsed bad
      }
    }

    if (this.instance) {
      if (end) {
        let endDelta = diffDates(this.instance.range.end, end, dateEnv, options.granularity)
        this.mutate({ endDelta })
      } else {
        this.mutate({ standardProps: { hasEnd: false } })
      }
    }
  }

  setDates(startInput: DateInput, endInput: DateInput | null, options: { allDay?: boolean, granularity?: string } = {}) {
    let dateEnv = this.calendar.dateEnv
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

    if (this.instance) {
      let instanceRange = this.instance.range

      // when computing the diff for an event being converted to all-day,
      // compute diff off of the all-day values the way event-mutation does.
      if (options.allDay === true) {
        instanceRange = computeAlignedDayRange(instanceRange)
      }

      let startDelta = diffDates(instanceRange.start, start, dateEnv, options.granularity)

      if (end) {
        let endDelta = diffDates(instanceRange.end, end, dateEnv, options.granularity)
        this.mutate({ startDelta, endDelta, standardProps })
      } else {
        standardProps.hasEnd = false
        this.mutate({ startDelta, standardProps })
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
      this.mutate({ startDelta: delta, endDelta: delta })
    }
  }

  setAllDay(allDay: boolean, options: { maintainDuration?: boolean } = {}) {
    let standardProps = { allDay } as any
    let maintainDuration = options.maintainDuration

    if (maintainDuration == null) {
      maintainDuration = this.calendar.opt('allDayMaintainDuration')
    }

    if (this.def.allDay !== allDay) {
      standardProps.hasEnd = maintainDuration
    }

    this.mutate({ standardProps })
  }

  formatRange(formatInput: FormatterInput) {
    let dateEnv = this.calendar.dateEnv
    let { instance } = this
    let formatter = createFormatter(formatInput, this.calendar.opt('defaultRangeSeparator'))

    if (this.def.hasEnd) {
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

  private mutate(mutation: EventMutation) {
    let { instance } = this

    if (instance) {
      this.calendar.dispatch({
        type: 'MUTATE_EVENTS',
        instanceId: instance.instanceId,
        mutation
      })

      let eventStore = this.calendar.state.eventStore
      this.def = eventStore.defs[this.def.defId]
      this.instance = eventStore.instances[this.instance.instanceId]
    }
  }

  remove() {
    this.calendar.dispatch({
      type: 'REMOVE_EVENT_DEF',
      defId: this.def.defId
    })
  }

  get start(): Date | null {
    return this.instance ?
      this.calendar.dateEnv.toDate(this.instance.range.start) :
      null
  }

  get end(): Date | null {
    return (this.instance && this.def.hasEnd) ?
      this.calendar.dateEnv.toDate(this.instance.range.end) :
      null
  }

  // computable props that all access the def
  // TODO: find a TypeScript-compatible way to do this at scale
  get id(): string { return this.def.publicId }
  get groupId(): string { return this.def.groupId }
  get allDay(): boolean { return this.def.allDay }
  get title(): string { return this.def.title }
  get url(): string { return this.def.url }
  get startEditable(): boolean { return this.def.startEditable }
  get durationEditable(): boolean { return this.def.durationEditable }
  get constraint(): any { return this.def.constraint }
  get overlap(): any { return this.def.overlap }
  get rendering(): string { return this.def.rendering }
  get classNames(): string[] { return this.def.classNames }
  get backgroundColor(): string { return this.def.backgroundColor }
  get borderColor(): string { return this.def.borderColor }
  get textColor(): string { return this.def.textColor }

  // NOTE: user can't modify extendedProps because Object.freeze was called in event-def parsing
  get extendedProps(): any { return this.def.extendedProps }

}
