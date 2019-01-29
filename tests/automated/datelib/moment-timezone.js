import MomentTimeZonePlugin from '@fullcalendar/moment-timezone'
import { testTimeZoneImpl } from './timeZoneImpl'

describe('moment-timezone', function() {
  testTimeZoneImpl(MomentTimeZonePlugin)
})
