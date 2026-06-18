
export type LocaleCodeArg = string | string[]

export interface Locale {
  codeArg: LocaleCodeArg
  codes: string[]
  week: { dow: number, doy: number }
  simpleNumberFormat: Intl.NumberFormat
  options: any // was CalendarOptionsRefined
}
