import { createDuration, identity, Identity } from '@fullcalendar/common'

type RRuleOptions = any // TODO: ask rrule maintainers to expose this

export const RRULE_EVENT_REFINERS = {
  rrule: identity as Identity<RRuleOptions>,
  duration: createDuration
}
