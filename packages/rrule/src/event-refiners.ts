import { createDuration, DateInput, identity, Identity } from '@fullcalendar/common'
import { Options as RRuleOptions } from 'rrule'

export type RRuleInputObjectFull = Omit<RRuleOptions, 'dtstart' | 'until' | 'freq' | 'wkst' | 'byweekday'> & {
  dtstart: RRuleOptions['dtstart'] | DateInput
  until: RRuleOptions['until'] | DateInput
  freq: RRuleOptions['until'] | string
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
