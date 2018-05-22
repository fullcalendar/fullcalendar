import { mergeProps } from '../util/object'

export type LocaleQuery = string | string[] | null

export interface Locale {
  query: LocaleQuery
  ids: string[]
  week: { dow: number, doy: number }
  simpleNumberFormat: Intl.NumberFormat
  options: any
}

const RAW_EN_LOCALE = {
  week: {
    dow: 0, // Sunday is the first day of the week
    doy: 4 // 4 days need to be within the year to be considered the first week
  },
  isRTL: false,
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
  weekHeader: 'Wk',
  allDayText: 'all-day',
  eventLimitText: 'more',
  noEventsMessage: 'No events to display'
}

let rawMap = {}

export function getLocale(query: LocaleQuery): Locale {
  if (query === 'auto') {
    query = null
  }

  let ids
  if (Array.isArray(query)) {
    ids = query
  } else if (typeof query === 'string') {
    ids = [ query ]
  } else {
    ids = []
  }

  let raw = getRawLocale(ids) || {}
  let merged = mergeProps([ RAW_EN_LOCALE, raw ], [ 'buttonText' ])

  let week = merged.week
  delete merged.week

  return {
    query,
    ids,
    week,
    simpleNumberFormat: new Intl.NumberFormat(query),
    options: merged
  }
}

function getRawLocale(ids: string[]) {
  for (let i = 0; i < ids.length; i++) {
    let parts = ids[i].toLocaleLowerCase().split('-')

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

defineLocale('en', RAW_EN_LOCALE)
