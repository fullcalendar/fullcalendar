import momentTimeZonePlugin from '@fullcalendar/moment-timezone'
import { testTimeZoneImpl } from '../lib/timeZoneImpl.js'

describe('moment-timezone', () => {
  testTimeZoneImpl(momentTimeZonePlugin)
})
