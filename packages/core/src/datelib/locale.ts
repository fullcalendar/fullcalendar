import { mergeProps } from '../util/object.js'
import { globalLocales } from '../global-locales.js' // weird to be importing this
import { CalendarOptions, CalendarOptionsRefined } from '../options.js'

export type LocaleCodeArg = string | string[]
export type LocaleSingularArg = LocaleCodeArg | LocaleInput

export interface Locale {
  codeArg: LocaleCodeArg
  codes: string[]
  week: { dow: number, doy: number }
  simpleNumberFormat: Intl.NumberFormat
  options: CalendarOptionsRefined
}

export interface LocaleInput extends CalendarOptions {
  code: string
}

export type LocaleInputMap = { [code: string]: LocaleInput }

export interface RawLocaleInfo {
  map: LocaleInputMap
  defaultCode: string
}

const MINIMAL_RAW_EN_LOCALE = {
  code: 'en',
  week: {
    dow: 0, // Sunday is the first day of the week
    doy: 4, // 4 days need to be within the year to be considered the first week
  },
  direction: 'ltr' as ('ltr' | 'rtl'), // TODO: make a real type for this
  buttonText: {
    prev: 'prev',
    next: 'next',
    prevYear: 'prev year',
    nextYear: 'next year',
    year: 'year',
    today: 'today',
    month: 'month',
    week: 'week',
    day: 'day',
    list: 'list',
  },
  weekText: 'W',
  weekTextLong: 'Week',
  closeHint: 'Close',
  timeHint: 'Time',
  eventHint: 'Event',
  allDayText: 'all-day',
  moreLinkText: 'more',
  noEventsText: 'No events to display',
}

const RAW_EN_LOCALE = {
  ...MINIMAL_RAW_EN_LOCALE,
  // Includes things we don't want other locales to inherit,
  // things that derive from other translatable strings.
  buttonHints: {
    prev: 'Previous $0',
    next: 'Next $0',
    today(buttonText, unit) {
      return (unit === 'day')
        ? 'Today'
        : `This ${buttonText}`
    },
  },
  viewHint: '$0 view',
  navLinkHint: 'Go to $0',
  moreLinkHint(eventCnt: number) {
    return `Show ${eventCnt} more event${eventCnt === 1 ? '' : 's'}`
  },
}

export function organizeRawLocales(explicitRawLocales: LocaleInput[]): RawLocaleInfo {
  let defaultCode = explicitRawLocales.length > 0 ? explicitRawLocales[0].code : 'en'
  let allRawLocales = globalLocales.concat(explicitRawLocales)
  let rawLocaleMap: LocaleInputMap = {
    en: RAW_EN_LOCALE,
  }

  for (let rawLocale of allRawLocales) {
    rawLocaleMap[rawLocale.code] = rawLocale
  }

  return {
    map: rawLocaleMap,
    defaultCode,
  }
}

export function buildLocale(inputSingular: LocaleSingularArg, available: LocaleInputMap) {
  if (typeof inputSingular === 'object' && !Array.isArray(inputSingular)) {
    return parseLocale(
      inputSingular.code,
      [inputSingular.code],
      inputSingular,
    )
  }
  return queryLocale(inputSingular, available)
}

function queryLocale(codeArg: LocaleCodeArg, available: LocaleInputMap): Locale {
  let codes = [].concat(codeArg || []) // will convert to array
  let raw = queryRawLocale(codes, available) || RAW_EN_LOCALE

  return parseLocale(codeArg, codes, raw)
}

function queryRawLocale(codes: string[], available: LocaleInputMap): LocaleInput {
  for (let i = 0; i < codes.length; i += 1) {
    let parts = codes[i].toLocaleLowerCase().split('-')

    for (let j = parts.length; j > 0; j -= 1) {
      let simpleId = parts.slice(0, j).join('-')

      if (available[simpleId]) {
        return available[simpleId]
      }
    }
  }
  return null
}

function parseLocale(codeArg: LocaleCodeArg, codes: string[], raw: LocaleInput): Locale {
  let merged = mergeProps([MINIMAL_RAW_EN_LOCALE, raw], ['buttonText'])

  delete merged.code // don't want this part of the options
  let { week } = merged
  delete merged.week

  return {
    codeArg,
    codes,
    week,
    simpleNumberFormat: new Intl.NumberFormat(codeArg),
    options: merged,
  }
}
