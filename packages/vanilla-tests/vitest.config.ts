import { createTestConfig, resolvePath } from './vitest.config.base'

export default createTestConfig({
  setupFile: resolvePath('./src/lib/setup.ts', import.meta.url),
  // prebundled up front, so a cold cache doesn't reload a test file mid-run
  optimizeDepsInclude: [
    'luxon',
    'moment',
    'moment/locale/es',
    'moment-timezone',
    'fetch-mock',
    'sortablejs',
    '@fullcalendar/rrule > rrule',
    '@fullcalendar/icalendar > ical.js',
  ],
})
