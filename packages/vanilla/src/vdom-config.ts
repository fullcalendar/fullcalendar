
// StrictMode always OFF
export const strictModeFactor = 1
export { Fragment as StrictMode } from 'preact'

// Sometime between Preact 10.23.1 -> 10.29.0, updating an option that affects events (like timeZone)
// results in unnecessary component render() calls. Seems like the options (context) is committed
// to the VDOM at a different phase than the events (props)
export const vdomExtraRenders = 2
