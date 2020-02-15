import MomentTimeZonePlugin from '@fullcalendar/moment-timezone'
import { testTimeZoneImpl } from '../lib/timeZoneImpl'

describe('moment-timezone', function() {
  testTimeZoneImpl(MomentTimeZonePlugin)
})
