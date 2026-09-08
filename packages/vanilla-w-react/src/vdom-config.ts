import { Fragment as ReactFragment, StrictMode as ReactStrictMode } from 'react'

// Manually change this const to 2 to enable StrictMode
export const strictModeFactor = 1
export const StrictMode = strictModeFactor > 1 ? ReactStrictMode : ReactFragment

console.log(
  'You are using the FORCE_REACT=1 version of fullcalendar with StrictMode ' +
  (strictModeFactor > 1 ? 'ON' : 'OFF'),
)
