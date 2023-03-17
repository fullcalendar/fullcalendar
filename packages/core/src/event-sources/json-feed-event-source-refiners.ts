import { identity, Identity, Dictionary } from '../options.js'

export const JSON_FEED_EVENT_SOURCE_REFINERS = {
  method: String,
  extraParams: identity as Identity<Dictionary | (() => Dictionary)>,
  startParam: String,
  endParam: String,
  timeZoneParam: String,
}
