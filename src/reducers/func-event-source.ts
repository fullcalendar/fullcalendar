import { unpromisify } from '../util/promise'
import { registerSourceType } from './event-sources'
import { EventInput } from './event-store'

registerSourceType('function', {

  parse(raw: any): EventInput[] {
    if (typeof raw === 'function') { // short form
      return raw
    } else if (typeof raw.events === 'function') {
      return raw.events
    }
  },

  fetch(arg, success, failure) {
    const dateEnv = arg.calendar.dateEnv

    unpromisify(
      arg.eventSource.sourceTypeMeta({ // the function
        start: dateEnv.toDate(arg.range.start),
        end: dateEnv.toDate(arg.range.end),
        timeZone: dateEnv.timeZone
      }),
      success,
      failure
    )
  }

})
