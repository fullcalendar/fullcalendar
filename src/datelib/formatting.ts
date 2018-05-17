import { DateMarker } from './util'
import { CalendarSystem } from './calendar-system'
import { assignTo } from '../util/object'
import { DateEnv } from './env'


export interface ZonedMarker {
  marker: DateMarker,
  timeZoneOffset: number
}

export interface ExpandedZonedMarker extends ZonedMarker {
  arr: number[]
}

export interface DateFormatter {
  format(start: ZonedMarker, end: ZonedMarker, env: DateEnv)
}


// TODO: optimize by only using DateTimeFormat?





const DEFAULT_SEPARATOR = ' - '

const SEVERITIES_FOR_PARTS = {
  year: 4,
  month: 3,
  day: 2,
  weekday: 2,
  hour: 1,
  minute: 1,
  second: 1
}

class NativeFormatter implements DateFormatter {

  formatSettings: any
  separator: string // for ranges

  constructor(formatSettings) {
    formatSettings = assignTo({}, formatSettings, { timeZone: 'UTC' })

    if (formatSettings.separator) {
      this.separator = formatSettings.separator
      delete formatSettings.separator
    }

    this.formatSettings = formatSettings
  }

  format(start: ZonedMarker, end: ZonedMarker, env: DateEnv) {
    let { formatSettings } = this

    // need to format the timeZone name in a zone other than UTC?
    if (formatSettings.timeZoneName && env.timeZone !== 'UTC') {
      formatSettings = assignTo({}, formatSettings) // copy

      if (start.timeZoneOffset == null || end && end.timeZoneOffset == null) {
        delete formatSettings.timeZoneName // don't have necessary tzo into. don't even try
      } else {
        formatSettings.timeZoneName = 'short' // only know how to display offset info for short (+00:00)
      }
    }

    if (end) {
      return formatRange(start, end, env, formatSettings, this.separator || DEFAULT_SEPARATOR)
    } else {
      return formatZonedMarker(start, env.locale, env.timeZone, formatSettings)
    }
  }

}




function formatRange(start: ZonedMarker, end: ZonedMarker, env: DateEnv, formatSettings: any, separator: string) {

  let diffSeverity = computeMarkerDiffSeverity(start.marker, end.marker, env.calendarSystem)
  if (!diffSeverity) {
    return formatZonedMarker(start, env.locale, env.timeZone, formatSettings)
  }

  let biggestUnitForPartial = diffSeverity
  if (
    biggestUnitForPartial > 1 && // hour/min/sec/ms
    (formatSettings.year === 'numeric' || formatSettings.year === '2-digit') &&
    (formatSettings.month === 'numeric' || formatSettings.month === '2-digit') &&
    (formatSettings.day === 'numeric' || formatSettings.day === '2-digit')
  ) {
    biggestUnitForPartial = 1
  }

  let full0 = formatZonedMarker(start, env.locale, env.timeZone, formatSettings)
  let full1 = formatZonedMarker(end, env.locale, env.timeZone, formatSettings)
  let partialFormatSettings = computePartialFormattingOptions(formatSettings, biggestUnitForPartial)
  let partial0 = formatZonedMarker(start, env.locale, env.timeZone, partialFormatSettings)
  let partial1 = formatZonedMarker(end, env.locale, env.timeZone, partialFormatSettings)
  let insertion = findCommonInsertion(full0, partial0, full1, partial1)

  if (insertion) {
    return insertion.before + partial0 + separator + partial1 + insertion.after;
  }

  return full0 + separator + full1;
}

// 0 = exactly the same
// 1 = different by time
// 2 = different by day
// 3 = different by month
// 4 = different by year
function computeMarkerDiffSeverity(d0: DateMarker, d1: DateMarker, ca: CalendarSystem) {
  if (ca.getMarkerYear(d0) !== ca.getMarkerYear(d1)) {
    return 4;
  }
  if (ca.getMarkerMonth(d0) !== ca.getMarkerMonth(d1)) {
    return 3;
  }
  if (ca.getMarkerDay(d0) !== ca.getMarkerDay(d1)) {
    return 2;
  }
  if (
    d0.getUTCHours() !== d1.getUTCHours() ||
    d0.getUTCMinutes() !== d1.getUTCMinutes() ||
    d0.getUTCSeconds() !== d1.getUTCSeconds() ||
    d0.getUTCMilliseconds() !== d1.getUTCMilliseconds()
  ) {
    return 1;
  }
  return 0;
}

function computePartialFormattingOptions(options, biggestUnit) {
  var partialOptions = {};
  var name;

  for (name in options) {
    if (
      name === 'timeZone' ||
      SEVERITIES_FOR_PARTS[name] <= biggestUnit // if undefined, will always be false
    ) {
      partialOptions[name] = options[name];
    }
  }

  return partialOptions;
}

function findCommonInsertion(full0, partial0, full1, partial1) {
  var i0, i1;
  var found0, found1;
  var before0, after0;
  var before1, after1;

  i0 = 0;
  while (i0 < full0.length) {
    found0 = full0.indexOf(partial0, i0);
    if (found0 === -1) {
      break;
    }

    before0 = full0.substr(0, found0);
    i0 = found0 + partial0.length;
    after0 = full0.substr(i0);

    i1 = 0;
    while (i1 < full1.length) {
      found1 = full1.indexOf(partial1, i1);
      if (found1 === -1) {
        break;
      }

      before1 = full1.substr(0, found1);
      i1 = found1 + partial1.length;
      after1 = full1.substr(i1);

      if (before0 === before1 && after0 === after1) {
        return {
          before: before0,
          after: after0
        }
      }
    }
  }

  return null;
}









export interface FuncFormatterDate extends ExpandedZonedMarker {
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number
}

export interface FuncFormatterArg {
  date: FuncFormatterDate
  start: FuncFormatterDate
  end?: FuncFormatterDate
  timeZone: string
  locale: string
}

export type funcFormatterFunc = (arg: FuncFormatterArg) => string

class FuncFormatter implements DateFormatter {

  func: funcFormatterFunc

  constructor(func: funcFormatterFunc) {
    this.func = func
  }

  format(start: ZonedMarker, end: ZonedMarker, env: DateEnv) {
    let startInfo = dateForFuncFormatter(start, env)
    let endInfo = end ? dateForFuncFormatter(end, env) : null

    return this.func({
      date: startInfo,
      start: startInfo,
      end: endInfo,
      timeZone: env.timeZone,
      locale: env.locale
    })
  }

}

function dateForFuncFormatter(dateInfo: ZonedMarker, env: DateEnv): FuncFormatterDate {
  let arr = env.calendarSystem.markerToArray(dateInfo.marker)
  return {
    marker: dateInfo.marker,
    timeZoneOffset: dateInfo.timeZoneOffset,
    arr: arr,
    year: arr[0],
    month: arr[1],
    day: arr[2],
    hour: arr[3],
    minute: arr[4],
    second: arr[5],
    millisecond: arr[6],
  }
}







export interface CmdStrFormatterArg {
  date: ExpandedZonedMarker
  start: ExpandedZonedMarker
  end?: ExpandedZonedMarker
  timeZone: string
  locale: string
}

export type cmdStrFormatterFunc = (cmd: string, arg: CmdStrFormatterArg) => string

let soleCmdStrProcessor: cmdStrFormatterFunc = null

export function registerCmdStrProcessor(name, input: cmdStrFormatterFunc) {
  if (!soleCmdStrProcessor) {
    soleCmdStrProcessor = input
  }
}

class CmdStrFormatter implements DateFormatter {

  cmdStr: string

  constructor(cmdStr: string) {
    this.cmdStr = cmdStr
  }

  format(start: ZonedMarker, end: ZonedMarker, env: DateEnv) {
    let startInfo = dateInfoForCmdStrFormatter(start, env)
    let endInfo = end ? dateInfoForCmdStrFormatter(end, env) : null

    return soleCmdStrProcessor(this.cmdStr, {
      date: startInfo,
      start: startInfo,
      end: endInfo,
      timeZone: env.timeZone,
      locale: env.locale
    })
  }

}

function dateInfoForCmdStrFormatter(dateInfo: ZonedMarker, env: DateEnv): ExpandedZonedMarker {
  return {
    marker: dateInfo.marker,
    timeZoneOffset: dateInfo.timeZoneOffset,
    arr: env.calendarSystem.markerToArray(dateInfo.marker)
  }
}









export function createFormatter(input): DateFormatter {
  if (typeof input === 'string') {
    return new CmdStrFormatter(input)
  }
  else if (typeof input === 'function') {
    return new FuncFormatter(input)
  }
  else if (typeof input === 'object') {
    return new NativeFormatter(input)
  }
}





function formatPrettyTimeZoneOffset(minutes: number) { // combine these two???
  let sign = minutes < 0 ? '+' : '-' // whaaa
  let abs = Math.abs(minutes)
  let hours = Math.floor(abs / 60)
  let mins = Math.round(abs % 60)

  return 'GMT' + sign + hours + (mins ? ':' + pad(mins) : '')
}

function formatIsoTimeZoneOffset(minutes: number) {
  let sign = minutes < 0 ? '+' : '-' // whaaa
  let abs = Math.abs(minutes)
  let hours = Math.floor(abs / 60)
  let mins = Math.round(abs % 60)

  return sign + pad(hours) + ':' + pad(mins)
}


function pad(n) {
  return n < 10 ? '0' + n : '' + n
}


export function buildIsoString(marker: DateMarker, timeZoneOffset?: number, stripZeroTime: boolean = false) {
  let s = marker.toISOString()

  s = s.replace('.000', '')
  s = s.replace('Z', '')

  if (timeZoneOffset != null) { // provided?
    s += formatIsoTimeZoneOffset(timeZoneOffset)
  } else if (stripZeroTime) {
    s = s.replace('T00:00:00', '')
  }

  return s
}


function formatZonedMarker(d: ZonedMarker, locale: string, desiredTimeZone: string, formatSettings: any) {
  let s = d.marker.toLocaleString(locale, formatSettings)

  if (formatSettings.timeZoneName && d.timeZoneOffset != null && desiredTimeZone !== 'UTC') {
    s = s.replace(/UTC|GMT/, formatPrettyTimeZoneOffset(d.timeZoneOffset))
  }

  return s
}
