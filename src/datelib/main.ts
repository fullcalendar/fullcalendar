import { DateEnv } from './env'
import { createFormatter } from './formatting'
import { DateMarker, nowMarker } from './util'
//import './moment'
//import './moment-timezone'

let env = new DateEnv({
  timeZone: 'Asia/Hong_Kong',
  timeZoneImpl: 'UTC-coercion', //'moment-timezone',
  calendarSystem: 'gregorian',
  locale: 'es' // TODO: what about 'auto'?
})

let start: DateMarker = nowMarker()
let end: DateMarker = env.startOfMonth(start)

let formatter = createFormatter({
  year: 'numeric',
  month: 'long',
  //weekday: 'long',
  day: 'numeric',
  //hour: '2-digit',
  //minute: '2-digit',
  //hour12: true,
  //timeZoneName: 'long'
})

// let formatter = createFormatter(function() {
//   debugger
//   return '!!!'
// })

// let formatter = createFormatter('dddd, MMMM Do YYYY, h:mm:ss a Z')

console.log(
  env.toRangeFormat(end, start, formatter, {
    forcedStartTimeZoneOffset: 60,
    forcedEndTimeZoneOffset: 60
  })
)
