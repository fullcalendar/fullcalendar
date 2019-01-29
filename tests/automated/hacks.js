import { globalHooks } from '@fullcalendar/core'

beforeEach(function() {

  // On real devices, when a click-like touch interaction happens, there is a preiod of time where mouse events
  // are ignores. Since ignore peroid is global, and might span across tests, disable it.
  // The simulates touch events do not fire these mouse events anyway.
  globalHooks.touchMouseIgnoreWait = 0

  globalHooks.disableGlobalPlugins = true

  // increase the default timeout
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000

})
