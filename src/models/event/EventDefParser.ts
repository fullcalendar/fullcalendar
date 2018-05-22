import SingleEventDef from './SingleEventDef'
import RecurringEventDef from './RecurringEventDef'
import { createDuration } from '../../datelib/duration'


export default {

  parse: function(eventInput, source) {
    let startTime, endTime // for testing if given object is a duration

    if (typeof eventInput.start !== 'number') { // because numbers should be parsed as dates
      startTime = createDuration(eventInput.start)
    }
    if (typeof eventInput.end !== 'number') {
      endTime = createDuration(eventInput.end)
    }

    if (startTime && endTime) { // inefficient to compute and then throw away
      return RecurringEventDef.parse(eventInput, source)
    } else {
      return SingleEventDef.parse(eventInput, source)
    }
  }

}
