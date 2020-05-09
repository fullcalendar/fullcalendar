import { mergeProps } from '../util/object'
import { getGlobalRawLocales } from '../global-locales' // weird to be importing this
import { __assign } from 'tslib'
import { RawCalendarOptions, RefinedCalendarOptions } from '../options'

export type LocaleCodeArg = string | string[]
export type LocaleSingularArg = LocaleCodeArg | RawLocale

export interface Locale {
  codeArg: LocaleCodeArg
  codes: string[]
  week: { dow: number, doy: number }
  simpleNumberFormat: Intl.NumberFormat
  options: RefinedCalendarOptions
}

export interface RawLocale extends RawCalendarOptions {
  code: string
}

export type RawLocaleMap = { [code: string]: RawLocale }

export interface RawLocaleInfo {
  map: RawLocaleMap
  defaultCode: string
}

const RAW_EN_LOCALE = {
  code: 'en',
  week: {
    dow: 0, // Sunday is the first day of the week
    doy: 4 // 4 days need to be within the year to be considered the first week
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
    list: 'list'
  },
  weekText: 'W',
  allDayText: 'all-day',
  moreLinkText: 'more',
  noEventsText: 'No events to display'
}


export function organizeRawLocales(explicitRawLocales: RawLocale[]): RawLocaleInfo {
  let defaultCode = explicitRawLocales.length > 0 ? explicitRawLocales[0].code : 'en'
  let globalRawLocales = getGlobalRawLocales()
  let allRawLocales = globalRawLocales.concat(explicitRawLocales)
  let rawLocaleMap: RawLocaleMap = {
    en: RAW_EN_LOCALE // necessary?
  }

  for (let rawLocale of allRawLocales) {
    rawLocaleMap[rawLocale.code] = rawLocale
  }

  return {
    map: rawLocaleMap,
    defaultCode
  }
}


export function buildLocale(inputSingular: LocaleSingularArg, available: RawLocaleMap) {
  if (typeof inputSingular === 'object' && !Array.isArray(inputSingular)) {
    return parseLocale(
      inputSingular.code,
      [ inputSingular.code ],
      inputSingular
    )
  } else {
    return queryLocale(inputSingular, available)
  }
}


function queryLocale(codeArg: LocaleCodeArg, available: RawLocaleMap): Locale {
  let codes = [].concat(codeArg || []) // will convert to array
  let raw = queryRawLocale(codes, available) || RAW_EN_LOCALE

  return parseLocale(codeArg, codes, raw)
}


function queryRawLocale(codes: string[], available: RawLocaleMap): RawLocale {
  for (let i = 0; i < codes.length; i++) {
    let parts = codes[i].toLocaleLowerCase().split('-')

    for (let j = parts.length; j > 0; j--) {
      let simpleId = parts.slice(0, j).join('-')

      if (available[simpleId]) {
        return available[simpleId]
      }
    }
  }
  return null
}


function parseLocale(codeArg: LocaleCodeArg, codes: string[], raw: RawLocale): Locale {
  let merged = mergeProps([ RAW_EN_LOCALE, raw ], [ 'buttonText' ])

  delete merged.code // don't want this part of the options
  let week = merged.week
  delete merged.week

  return {
    codeArg,
    codes,
    week,
    simpleNumberFormat: new Intl.NumberFormat(codeArg),
    options: merged
  }
}
