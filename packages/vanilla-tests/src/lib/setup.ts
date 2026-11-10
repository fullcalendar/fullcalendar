import 'fullcalendar/skeleton.css'
import 'fullcalendar/themes/classic/theme.css'
import 'fullcalendar/themes/classic/palette.css'
import './global.css'
import { afterEach, beforeEach } from 'vitest'
import { config } from 'fullcalendar/protected-api'
import { cleanupCalendars } from './calendar'
import { releasePointer } from './pointer'

const defaultScrollEndWait = config.scrollEndWait

beforeEach(() => {
  // After a touch interaction, mouse events are ignored for a while. That window is global and could
  // span tests, so disable it.
  config.touchMouseIgnoreWait = 0

  // tests that need a scroll to end lower it. undo that
  config.scrollEndWait = defaultScrollEndWait
})

afterEach(async () => {
  await releasePointer()
  cleanupCalendars()
})
