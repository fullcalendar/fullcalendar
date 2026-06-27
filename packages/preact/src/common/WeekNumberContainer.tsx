export type DateTimeFormatPartWithWeek = Omit<Intl.DateTimeFormatPart, 'type'> & {
  type: Intl.DateTimeFormatPart['type'] | 'week'
}

// week number HEADER

export interface WeekNumberHeaderInfo {
  num?: number // undefined if not for specific date
  date?: Date // undefined if not for specific date
  text: string
  textParts: DateTimeFormatPartWithWeek[]
  isNarrow: boolean
  hasNavLink: boolean
  options: { dayMinWidth: number | undefined }
}

// week number CELL (eventually)

export interface WeekNumberCellInfo { // TODO: DRY with inline?
  num: number
  date: Date
  text: string
  textParts: DateTimeFormatPartWithWeek[]
  isNarrow: boolean
  hasNavLink: boolean
}

// INLINE week number

export interface InlineWeekNumberInfo {
  num: number
  date: Date
  text: string
  textParts: DateTimeFormatPartWithWeek[]
  isNarrow: boolean
  hasNavLink: boolean
}
