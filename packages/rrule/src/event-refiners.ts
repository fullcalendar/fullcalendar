import { Options as RRuleOptions } from 'rrule'
import { DateInput } from '@fullcalendar/core'
import { createDuration, identity, Identity } from '@fullcalendar/core/internal'

export type RRuleInputObjectFull = Omit<RRuleOptions, 'dtstart' | 'until' | 'freq' | 'wkst' | 'byweekday'> & {
  dtstart: RRuleOptions['dtstart'] | DateInput
  until: RRuleOptions['until'] | DateInput
  freq: RRuleOptions['freq'] | string
  wkst: RRuleOptions['wkst'] | string
  byweekday: RRuleOptions['byweekday'] | string | string[]
}

export type RRuleInputObject = Partial<RRuleInputObjectFull>
export type RRuleInput = RRuleInputObject | string

export const RRULE_EVENT_REFINERS = {
  rrule: identity as Identity<RRuleInput>,
  exrule: identity as Identity<RRuleInputObject | RRuleInputObject[]>,
  exdate: identity as Identity<DateInput | DateInput[]>,
  duration: createDuration,
}
