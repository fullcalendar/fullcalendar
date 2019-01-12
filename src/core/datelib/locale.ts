import { mergeProps } from '../util/object'

export type LocaleCodeArg = string | string[] | null

export interface Locale {
  codeArg: LocaleCodeArg
  codes: string[]
  week: { dow: number, doy: number }
  simpleNumberFormat: Intl.NumberFormat
  options: any
}

const RAW_EN_LOCALE = {
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

let rawMap = {}

export function getLocale(codeArg: LocaleCodeArg): Locale {
  if (codeArg === 'auto') {
    codeArg = null
  }

  let codes
  if (Array.isArray(codeArg)) {
    codes = codeArg
  } else if (typeof codeArg === 'string') {
    codes = [ codeArg ]
  } else {
    codes = []
  }

  let raw = getRawLocale(codes) || {}
  let merged = mergeProps([ RAW_EN_LOCALE, raw ], [ 'buttonText' ])

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

function getRawLocale(codes: string[]) {
  for (let i = 0; i < codes.length; i++) {
    let parts = codes[i].toLocaleLowerCase().split('-')

    for (let j = parts.length; j > 0; j--) {
      let simpleId = parts.slice(0, j).join('-')

      if (rawMap[simpleId]) {
        return rawMap[simpleId]
      }
    }
  }
  return null
}

export function defineLocale(simpleId: string, rawData) {
  rawMap[simpleId] = rawData
}

export function getLocaleCodes() {
  return Object.keys(rawMap)
}

defineLocale('en', RAW_EN_LOCALE)
