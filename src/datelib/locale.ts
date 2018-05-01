
export interface LocaleData {
  week: { dow: number, doy: number }
}

let localeMap: { [name: string]: LocaleData } = {}

const EN_LOCALE = {
  week: {
    dow: 1,
    doy: 4
  }
}


export function registerLocale(name: string, data: LocaleData) {
  localeMap[name] = data
}

export function getLocale(name: string) {
  return localeMap[name] || EN_LOCALE
}


registerLocale('en', EN_LOCALE)
