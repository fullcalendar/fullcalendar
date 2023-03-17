import * as ICAL from 'ical.js'

export interface IcalExpanderResults {
  events: ICAL.Event[]
  occurrences: ICAL.Event.occurrenceDetails
}

export interface IcalExpanderOptions {
  ics: string
  maxIterations?: number
  skipInvalidDates?: boolean
}

export class IcalExpander {
  constructor(opts: IcalExpanderOptions)
  between(after?: Date, before?: Date): IcalExpanderResults
  before(before: Date): IcalExpanderResults
  after(after: Date): IcalExpanderResults
  all(): IcalExpanderResults
}
