import { identity, Identity, Dictionary } from '../options'

export const EVENT_SOURCE_REFINERS = {
  method: String,
  extraParams: identity as Identity<Dictionary | (() => Dictionary)>,
  startParam: String,
  endParam: String,
  timeZoneParam: String
}
