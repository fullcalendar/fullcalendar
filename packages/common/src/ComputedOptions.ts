import { Duration, createDuration } from './datelib/duration'
import { parseFieldSpecs } from './util/misc'

export interface ComputedOptions {
  eventOrderSpecs: any
  nextDayThreshold: Duration
  defaultAllDayEventDuration: Duration
  defaultTimedEventDuration: Duration
  slotDuration: Duration | null
  snapDuration: Duration | null
  slotMinTime: Duration
  slotMaxTime: Duration
}

export function buildComputedOptions(options: any): ComputedOptions {
  return {
    eventOrderSpecs: parseFieldSpecs(options.eventOrder),
    nextDayThreshold: createDuration(options.nextDayThreshold),
    defaultAllDayEventDuration: createDuration(options.defaultAllDayEventDuration),
    defaultTimedEventDuration: createDuration(options.defaultTimedEventDuration),
    slotDuration: options.slotDuration ? createDuration(options.slotDuration) : null,
    snapDuration: options.snapDuration ? createDuration(options.snapDuration) : null,
    slotMinTime: createDuration(options.slotMinTime),
    slotMaxTime: createDuration(options.slotMaxTime)
  }
}
