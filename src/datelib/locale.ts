
export interface LocaleData {
  week: { dow: number, doy: number }
}

let localeMap: { [name: string]: LocaleData } = {}

const EN_LOCALE = {
  week: {
    dow: 0, // Sunday is the first day of the week
    doy: 4 // 4 days need to be within the year to be considered the first week
  }
}


export function registerLocale(name: string, data: LocaleData) {
  localeMap[name] = data
}

export function getLocale(name: string) {
  return localeMap[name] || EN_LOCALE
}


registerLocale('en', EN_LOCALE)
