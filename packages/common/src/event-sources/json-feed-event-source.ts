import { __assign } from 'tslib'
import { requestJson } from '../util/requestJson'
import { CalendarContext } from '../CalendarContext'
import { EventSourceDef } from '../structs/event-source-def'
import { DateRange } from '../datelib/date-range'
import { createPlugin } from '../plugin-system'
import { JSON_FEED_EVENT_SOURCE_REFINERS } from './json-feed-event-source-refiners'

interface JsonFeedMeta {
  url: string
  format: 'json' // for EventSourceApi
  method: string
  extraParams?: any
  startParam?: string
  endParam?: string
  timeZoneParam?: string
}

let eventSourceDef: EventSourceDef<JsonFeedMeta> = {

  parseMeta(refined) {
    if (refined.url && (refined.format === 'json' || !refined.format)) {
      return {
        url: refined.url,
        format: 'json',
        method: (refined.method || 'GET').toUpperCase(),
        extraParams: refined.extraParams,
        startParam: refined.startParam,
        endParam: refined.endParam,
        timeZoneParam: refined.timeZoneParam,
      }
    }
    return null
  },

  fetch(arg, success, failure) {
    let { meta } = arg.eventSource
    let requestParams = buildRequestParams(meta, arg.range, arg.context)

    requestJson(
      meta.method, meta.url, requestParams,
      (rawEvents, xhr) => {
        success({ rawEvents, xhr })
      },
      (errorMessage, xhr) => {
        failure({ message: errorMessage, xhr })
      },
    )
  },

}

export const jsonFeedEventSourcePlugin = createPlugin({
  eventSourceRefiners: JSON_FEED_EVENT_SOURCE_REFINERS,
  eventSourceDefs: [eventSourceDef],
})

function buildRequestParams(meta: JsonFeedMeta, range: DateRange, context: CalendarContext) {
  let { dateEnv, options } = context
  let startParam
  let endParam
  let timeZoneParam
  let customRequestParams
  let params = {}

  startParam = meta.startParam
  if (startParam == null) {
    startParam = options.startParam
  }

  endParam = meta.endParam
  if (endParam == null) {
    endParam = options.endParam
  }

  timeZoneParam = meta.timeZoneParam
  if (timeZoneParam == null) {
    timeZoneParam = options.timeZoneParam
  }

  // retrieve any outbound GET/POST data from the options
  if (typeof meta.extraParams === 'function') {
    // supplied as a function that returns a key/value object
    customRequestParams = meta.extraParams()
  } else {
    // probably supplied as a straight key/value object
    customRequestParams = meta.extraParams || {}
  }

  __assign(params, customRequestParams)

  params[startParam] = dateEnv.formatIso(range.start)
  params[endParam] = dateEnv.formatIso(range.end)

  if (dateEnv.timeZone !== 'local') {
    params[timeZoneParam] = dateEnv.timeZone
  }

  return params
}
