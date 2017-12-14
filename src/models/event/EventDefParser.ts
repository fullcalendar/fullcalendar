import * as moment from 'moment'
import { isTimeString } from '../../util'
import SingleEventDef from './SingleEventDef'
import RecurringEventDef from './RecurringEventDef'


export default {

  parse: function(eventInput, source) {
    if (
      isTimeString(eventInput.start) || moment.isDuration(eventInput.start) ||
      isTimeString(eventInput.end) || moment.isDuration(eventInput.end)
    ) {
      return RecurringEventDef.parse(eventInput, source)
    } else {
      return SingleEventDef.parse(eventInput, source)
    }
  }

}
