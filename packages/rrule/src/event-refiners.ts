import { createDuration, identity, Identity } from '@fullcalendar/common'

type RRuleOptions = any // TODO: ask rrule maintainers to expose this
  // NOTE: we added `exdate` and `exrule` to this

export const RRULE_EVENT_REFINERS = {
  rrule: identity as Identity<RRuleOptions>,
  duration: createDuration,
}
