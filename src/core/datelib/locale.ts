import { mergeProps } from '../util/object'
import { __assign } from 'tslib'

export type LocaleCodeArg = string | string[]
export type LocaleSingularArg = LocaleCodeArg | RawLocale
export type LocalePluralArg = (string | RawLocale)[]

export interface Locale {
  codeArg: LocaleCodeArg
  codes: string[]
  week: { dow: number, doy: number }
  simpleNumberFormat: Intl.NumberFormat
  options: any
}

export interface RawLocale {
  code: string
  [otherProp: string]: any
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
  dir: 'ltr',
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
  weekLabel: 'W',
  allDayText: 'all-day',
  eventLimitText: 'more',
  noEventsMessage: 'No events to display'
}

export function parseRawLocales(inputPlural: LocalePluralArg): RawLocaleInfo {
  let globalArray = window['FullCalendarLocalesAll'] || []
  let globalMap = window['FullCalendarLocales'] || {}
  let rawLocaleArray: RawLocale[] = []

  for (let inputItem of inputPlural) {
    if (typeof inputItem === 'string') {
      if (globalMap[inputItem]) {
        rawLocaleArray.push(globalMap[inputItem])
      } else {
        console.warn('You must have ' + inputItem + '.js locale file loaded.')
      }
    } else {
      rawLocaleArray.push(inputItem)
    }
  }

  let defaultCode = rawLocaleArray.length ? rawLocaleArray[0].code : 'en'
  let rawLocaleMap = {
    en: RAW_EN_LOCALE
  }

  for (let rawLocale of rawLocaleArray.concat(globalArray)) {
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
