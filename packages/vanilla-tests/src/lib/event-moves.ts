import { Calendar } from 'fullcalendar'
import { DayGridModel } from './models/day-grid'
import { TimeGridModel } from './models/time-grid'

/*
Drags an event so its start lands at `to`: a date-time (timeGrid slots) or a date (dayGrid cells).
Works in timeGrid and dayGrid views. Grabs the event at its start.
*/
export async function dragEventStartTo(calendar: Calendar, eventId: string, to: string): Promise<void> {
  const event = calendar.getEventById(eventId)!
  const startStr = toWallClock(event.startStr)

  if (to.includes('T')) {
    await new TimeGridModel(calendar.el).dragEvent(eventId, startStr, to)
  } else {
    await new DayGridModel(calendar.el).dragEvent(eventId, startStr.slice(0, 10), to)
  }
}

/*
Resizes a timed event's end to `to`, a date-time, in a timeGrid view.
*/
export async function resizeEventEndTo(calendar: Calendar, eventId: string, to: string): Promise<void> {
  const event = calendar.getEventById(eventId)!
  await new TimeGridModel(calendar.el).resizeEvent(eventId, 'end', toWallClock(event.endStr), to)
}

// '2014-11-10T01:00:00Z' -> '2014-11-10T01:00'. Dates stay as they are
function toWallClock(isoStr: string): string {
  return isoStr.length > 10 ? isoStr.slice(0, 16) : isoStr
}
