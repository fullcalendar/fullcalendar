import { globalLocales } from '../global-locales'; // weird to be importing this
import { CalendarOptions } from '../options'
import { mergeCalendarOptions } from '../options-manip'

import { LocaleCodeArg, Locale } from '@full-ui/headless-calendar'

export type LocaleSingularArg = LocaleCodeArg | LocaleInput

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
  todayText: 'Today',
  prevText: 'Prev',
  nextText: 'Next',
  prevYearText: 'Prev year',
  nextYearText: 'Next year',
  yearText: 'Year',
  monthText: 'Month',
  weekTextLong: 'Week',
  dayText: 'Day',
  listText: 'List',
  closeHint: 'Close',
  eventsHint: 'Events',
  allDayText: 'All-day',
  timedText: 'Timed',
  moreLinkText: 'more',
  noEventsText: 'No events to display',
}

/*
Includes things we don't want other locales to inherit,
things that derive from other translatable strings.
*/
const RAW_EN_LOCALE = {
  ...MINIMAL_RAW_EN_LOCALE,

  // if a locale doesn't define this, fall back to weekTextLong, don't use EN
  weekTextShort: 'W',

  todayHint: (unitText: string, unit: string) => {
    return (unit === 'day')
      ? 'Today'
      : `This ${unitText}`
  },
  prevHint: 'Previous $0',
  nextHint: 'Next $0',
  viewHint: '$0 view',
  viewChangeHint: 'Change view',
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
  let merged = mergeCalendarOptions(MINIMAL_RAW_EN_LOCALE, raw)

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
