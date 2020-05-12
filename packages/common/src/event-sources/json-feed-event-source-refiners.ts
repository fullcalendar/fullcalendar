import { identity, Identity } from '@fullcalendar/core'

export const EVENT_SOURCE_REFINERS = {
  method: String,
  extraParams: identity as Identity<object | (() => object)>,
  startParam: String,
  endParam: String,
  timeZoneParam: String
}
