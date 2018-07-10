import * as moment from 'moment'
import * as $ from 'jquery'
import { isNativeDate } from './util'

/*
GENERAL NOTE on moments throughout the *entire rest* of the codebase:
All moments are assumed to be ambiguously-zoned unless otherwise noted,
with the NOTABLE EXCEOPTION of start/end dates that live on *Event Objects*.
Ambiguously-TIMED moments are assumed to be ambiguously-zoned by nature.
*/

type MomentExtDuration = moment.Duration
declare module 'moment' {
  interface Moment {
    hasTime(): boolean
    time(): MomentExtDuration
    stripZone()
    stripTime()
  }
}

let ambigDateOfMonthRegex = /^\s*\d{4}-\d\d$/
let ambigTimeOrZoneRegex =
  /^\s*\d{4}-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?)?$/
let newMomentProto: any = moment.fn // where we will attach our new methods
let oldMomentProto = $.extend({}, newMomentProto) // copy of original moment methods

// tell momentjs to transfer these properties upon clone
let momentProperties = (moment as any).momentProperties
momentProperties.push('_fullCalendar')
momentProperties.push('_ambigTime')
momentProperties.push('_ambigZone')

/*
Call this if you want Moment's original format method to be used
*/
function oldMomentFormat(mom, formatStr?) {
  return oldMomentProto.format.call(mom, formatStr) // oldMomentProto defined in moment-ext.js
}

export { newMomentProto, oldMomentProto, oldMomentFormat }


// Creating
// -------------------------------------------------------------------------------------------------

// Creates a new moment, similar to the vanilla moment(...) constructor, but with
// extra features (ambiguous time, enhanced formatting). When given an existing moment,
// it will function as a clone (and retain the zone of the moment). Anything else will
// result in a moment in the local zone.
const momentExt: any = function() {
  return makeMoment(arguments)
}

export default momentExt

// Sames as momentExt, but forces the resulting moment to be in the UTC timezone.
momentExt.utc = function() {
  let mom = makeMoment(arguments, true)

  // Force it into UTC because makeMoment doesn't guarantee it
  // (if given a pre-existing moment for example)
  if (mom.hasTime()) { // don't give ambiguously-timed moments a UTC zone
    mom.utc()
  }

  return mom
}

// Same as momentExt, but when given an ISO8601 string, the timezone offset is preserved.
// ISO8601 strings with no timezone offset will become ambiguously zoned.
momentExt.parseZone = function() {
  return makeMoment(arguments, true, true)
}

// Builds an enhanced moment from args. When given an existing moment, it clones. When given a
// native Date, or called with no arguments (the current time), the resulting moment will be local.
// Anything else needs to be "parsed" (a string or an array), and will be affected by:
//    parseAsUTC - if there is no zone information, should we parse the input in UTC?
//    parseZone - if there is zone information, should we force the zone of the moment?
function makeMoment(args, parseAsUTC= false, parseZone= false) {
  let input = args[0]
  let isSingleString = args.length === 1 && typeof input === 'string'
  let isAmbigTime
  let isAmbigZone
  let ambigMatch
  let mom

  if (moment.isMoment(input) || isNativeDate(input) || input === undefined) {
    mom = moment.apply(null, args)
  } else { // "parsing" is required
    isAmbigTime = false
    isAmbigZone = false

    if (isSingleString) {
      if (ambigDateOfMonthRegex.test(input)) {
        // accept strings like '2014-05', but convert to the first of the month
        input += '-01'
        args = [ input ] // for when we pass it on to moment's constructor
        isAmbigTime = true
        isAmbigZone = true
      } else if ((ambigMatch = ambigTimeOrZoneRegex.exec(input))) {
        isAmbigTime = !ambigMatch[5] // no time part?
        isAmbigZone = true
      }
    } else if ($.isArray(input)) {
      // arrays have no timezone information, so assume ambiguous zone
      isAmbigZone = true
    }
    // otherwise, probably a string with a format

    if (parseAsUTC || isAmbigTime) {
      mom = moment.utc.apply(moment, args)
    } else {
      mom = moment.apply(null, args)
    }

    if (isAmbigTime) {
      mom._ambigTime = true
      mom._ambigZone = true // ambiguous time always means ambiguous zone
    } else if (parseZone) { // let's record the inputted zone somehow
      if (isAmbigZone) {
        mom._ambigZone = true
      } else if (isSingleString) {
        mom.utcOffset(input) // if not a valid zone, will assign UTC
      }
    }
  }

  mom._fullCalendar = true // flag for extended functionality

  return mom
}


// Week Number
// -------------------------------------------------------------------------------------------------


// Returns the week number, considering the locale's custom week number calcuation
// `weeks` is an alias for `week`
newMomentProto.week = newMomentProto.weeks = function(input) {
  let weekCalc = this._locale._fullCalendar_weekCalc

  if (input == null && typeof weekCalc === 'function') { // custom function only works for getter
    return weekCalc(this)
  } else if (weekCalc === 'ISO') {
    return oldMomentProto.isoWeek.apply(this, arguments) // ISO getter/setter
  }

  return oldMomentProto.week.apply(this, arguments) // local getter/setter
}


// Time-of-day
// -------------------------------------------------------------------------------------------------

// GETTER
// Returns a Duration with the hours/minutes/seconds/ms values of the moment.
// If the moment has an ambiguous time, a duration of 00:00 will be returned.
//
// SETTER
// You can supply a Duration, a Moment, or a Duration-like argument.
// When setting the time, and the moment has an ambiguous time, it then becomes unambiguous.
newMomentProto.time = function(time) {

  // Fallback to the original method (if there is one) if this moment wasn't created via FullCalendar.
  // `time` is a generic enough method name where this precaution is necessary to avoid collisions w/ other plugins.
  if (!this._fullCalendar) {
    return oldMomentProto.time.apply(this, arguments)
  }

  if (time == null) { // getter
    return moment.duration({
      hours: this.hours(),
      minutes: this.minutes(),
      seconds: this.seconds(),
      milliseconds: this.milliseconds()
    })
  } else { // setter

    this._ambigTime = false // mark that the moment now has a time

    if (!moment.isDuration(time) && !moment.isMoment(time)) {
      time = moment.duration(time)
    }

    // The day value should cause overflow (so 24 hours becomes 00:00:00 of next day).
    // Only for Duration times, not Moment times.
    let dayHours = 0
    if (moment.isDuration(time)) {
      dayHours = Math.floor(time.asDays()) * 24
    }

    // We need to set the individual fields.
    // Can't use startOf('day') then add duration. In case of DST at start of day.
    return this.hours(dayHours + time.hours())
      .minutes(time.minutes())
      .seconds(time.seconds())
      .milliseconds(time.milliseconds())
  }
}

// Converts the moment to UTC, stripping out its time-of-day and timezone offset,
// but preserving its YMD. A moment with a stripped time will display no time
// nor timezone offset when .format() is called.
newMomentProto.stripTime = function() {

  if (!this._ambigTime) {

    this.utc(true) // keepLocalTime=true (for keeping *date* value)

    // set time to zero
    this.set({
      hours: 0,
      minutes: 0,
      seconds: 0,
      ms: 0
    })

    // Mark the time as ambiguous. This needs to happen after the .utc() call, which might call .utcOffset(),
    // which clears all ambig flags.
    this._ambigTime = true
    this._ambigZone = true // if ambiguous time, also ambiguous timezone offset
  }

  return this // for chaining
}

// Returns if the moment has a non-ambiguous time (boolean)
newMomentProto.hasTime = function() {
  return !this._ambigTime
}


// Timezone
// -------------------------------------------------------------------------------------------------

// Converts the moment to UTC, stripping out its timezone offset, but preserving its
// YMD and time-of-day. A moment with a stripped timezone offset will display no
// timezone offset when .format() is called.
newMomentProto.stripZone = function() {
  let wasAmbigTime

  if (!this._ambigZone) {

    wasAmbigTime = this._ambigTime

    this.utc(true) // keepLocalTime=true (for keeping date and time values)

    // the above call to .utc()/.utcOffset() unfortunately might clear the ambig flags, so restore
    this._ambigTime = wasAmbigTime || false

    // Mark the zone as ambiguous. This needs to happen after the .utc() call, which might call .utcOffset(),
    // which clears the ambig flags.
    this._ambigZone = true
  }

  return this // for chaining
}

// Returns of the moment has a non-ambiguous timezone offset (boolean)
newMomentProto.hasZone = function() {
  return !this._ambigZone
}


// implicitly marks a zone
newMomentProto.local = function(keepLocalTime) {

  // for when converting from ambiguously-zoned to local,
  // keep the time values when converting from UTC -> local
  oldMomentProto.local.call(this, this._ambigZone || keepLocalTime)

  // ensure non-ambiguous
  // this probably already happened via local() -> utcOffset(), but don't rely on Moment's internals
  this._ambigTime = false
  this._ambigZone = false

  return this // for chaining
}


// implicitly marks a zone
newMomentProto.utc = function(keepLocalTime) {

  oldMomentProto.utc.call(this, keepLocalTime)

  // ensure non-ambiguous
  // this probably already happened via utc() -> utcOffset(), but don't rely on Moment's internals
  this._ambigTime = false
  this._ambigZone = false

  return this
}


// implicitly marks a zone (will probably get called upon .utc() and .local())
newMomentProto.utcOffset = function(tzo) {

  if (tzo != null) { // setter
    // these assignments needs to happen before the original zone method is called.
    // I forget why, something to do with a browser crash.
    this._ambigTime = false
    this._ambigZone = false
  }

  return oldMomentProto.utcOffset.apply(this, arguments)
}
