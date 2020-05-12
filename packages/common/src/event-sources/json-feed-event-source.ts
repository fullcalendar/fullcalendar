import { requestJson } from '../util/requestJson'
import { CalendarContext } from '../CalendarContext'
import { EventSourceDef } from '../structs/event-source-def'
import { DateRange } from '../datelib/date-range'
import { __assign } from 'tslib'
import { createPlugin } from '../plugin-system'

interface JsonFeedMeta {
  url: string
  method: string
  extraParams?: any
  startParam?: string
  endParam?: string
  timeZoneParam?: string
}

let eventSourceDef: EventSourceDef = {

  parseMeta(raw: any): JsonFeedMeta | null {
    if (typeof raw === 'string') { // short form
      raw = { url: raw }
    } else if (!raw || typeof raw !== 'object' || !raw.url) {
      return null
    }

    return {
      url: raw.url,
      method: (raw.method || 'GET').toUpperCase(),
      extraParams: raw.extraParams,
      startParam: raw.startParam,
      endParam: raw.endParam,
      timeZoneParam: raw.timeZoneParam,
      objKey: raw.objKey
    }
  },

  fetch(arg, success, failure) {
    let meta: JsonFeedMeta = arg.eventSource.meta
    let requestParams = buildRequestParams(meta, arg.range, arg.context)

    requestJson(
      meta.method, meta.url, requestParams,
      function(rawEvents, xhr) {
        if (meta.objKey) {
          rawEvents = rawEvents[meta.objKey];
        }
        success({ rawEvents, xhr })
      },
      function(errorMessage, xhr) {
        failure({ message: errorMessage, xhr })
      }
    )
  }

}

export const jsonFeedEventSourcePlugin = createPlugin({
  eventSourceDefs: [ eventSourceDef ]
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
