import { EventDef } from './event-def.js'
import { EventInstance, createEventInstance } from './event-instance.js'
import { DateRange } from '../datelib/date-range.js'
import { DateEnv } from '../datelib/env.js'
import { Duration } from '../datelib/duration.js'
import { DateMarker, startOfDay } from '../datelib/marker.js'
import { EventStore } from './event-store.js'
import { CalendarContext } from '../CalendarContext.js'
import { filterHash } from '../util/object.js'
import { EventRefined } from './event-parse.js'

/*
The plugin system for defining how a recurring event is expanded into individual instances.
*/

export interface ParsedRecurring<RecurringData> {
  typeData: RecurringData
  allDayGuess: boolean | null
  duration: Duration | null // signals hasEnd
}

export interface RecurringType<RecurringData> {
  parse: (refined: EventRefined, dateEnv: DateEnv) => ParsedRecurring<RecurringData> | null // TODO: rename to post-process or something
  expand: (typeData: any, framingRange: DateRange, dateEnv: DateEnv) => DateMarker[]
}

export function parseRecurring(
  refined: EventRefined,
  defaultAllDay: boolean | null,
  dateEnv: DateEnv,
  recurringTypes: RecurringType<any>[],
) {
  for (let i = 0; i < recurringTypes.length; i += 1) {
    let parsed = recurringTypes[i].parse(refined, dateEnv)

    if (parsed) {
      let { allDay } = refined
      if (allDay == null) {
        allDay = defaultAllDay
        if (allDay == null) {
          allDay = parsed.allDayGuess
          if (allDay == null) {
            allDay = false
          }
        }
      }

      return {
        allDay,
        duration: parsed.duration,
        typeData: parsed.typeData,
        typeId: i,
      }
    }
  }

  return null
}

export function expandRecurring(eventStore: EventStore, framingRange: DateRange, context: CalendarContext): EventStore {
  let { dateEnv, pluginHooks, options } = context
  let { defs, instances } = eventStore

  // remove existing recurring instances
  // TODO: bad. always expand events as a second step
  instances = filterHash(instances, (instance: EventInstance) => !defs[instance.defId].recurringDef)

  for (let defId in defs) {
    let def = defs[defId]

    if (def.recurringDef) {
      let { duration } = def.recurringDef

      if (!duration) {
        duration = def.allDay ?
          options.defaultAllDayEventDuration :
          options.defaultTimedEventDuration
      }

      let starts = expandRecurringRanges(def, duration, framingRange, dateEnv, pluginHooks.recurringTypes)

      for (let start of starts) {
        let instance = createEventInstance(defId, {
          start,
          end: dateEnv.add(start, duration),
        })
        instances[instance.instanceId] = instance
      }
    }
  }

  return { defs, instances }
}

/*
Event MUST have a recurringDef
*/
function expandRecurringRanges(
  eventDef: EventDef,
  duration: Duration,
  framingRange: DateRange,
  dateEnv: DateEnv,
  recurringTypes: RecurringType<any>[],
): DateMarker[] {
  let typeDef = recurringTypes[eventDef.recurringDef.typeId]
  let markers = typeDef.expand(
    eventDef.recurringDef.typeData,
    {
      start: dateEnv.subtract(framingRange.start, duration), // for when event starts before framing range and goes into
      end: framingRange.end,
    },
    dateEnv,
  )

  // the recurrence plugins don't guarantee that all-day events are start-of-day, so we have to
  if (eventDef.allDay) {
    markers = markers.map(startOfDay)
  }

  return markers
}
