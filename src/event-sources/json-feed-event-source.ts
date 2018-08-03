import * as request from 'superagent'
import { assignTo } from '../util/object'
import Calendar from '../Calendar'
import { registerEventSourceDef } from '../structs/event-source'
import { DateRange } from '../datelib/date-range'

interface JsonFeedMeta {
  url: string
  method: string
  extraData?: any
  startParam?: string
  endParam?: string
  timezoneParam?: string
}

registerEventSourceDef({

  parseMeta(raw: any): JsonFeedMeta | null {
    if (typeof raw === 'string') { // short form
      raw = { url: raw }
    } else if (!raw || typeof raw !== 'object' || !raw.url) {
      return null
    }

    return {
      url: raw.url,
      method: (raw.method || 'GET').toUpperCase(),
      extraData: raw.data,
      startParam: raw.startParam,
      endParam: raw.endParam,
      timezoneParam: raw.timezoneParam
    }
  },

  fetch(arg, success, failure) {
    let meta: JsonFeedMeta = arg.eventSource.meta
    let theRequest
    let requestParams = buildRequestParams(meta, arg.range, arg.calendar)

    if (meta.method === 'GET') {
      theRequest = request.get(meta.url).query(requestParams) // querystring params
    } else {
      theRequest = request(meta.method, meta.url).send(requestParams) // body data
    }

    theRequest.end((error, res) => {
      let rawEvents

      if (!error) {
        if (res.body) { // parsed JSON
          rawEvents = res.body
        } else if (res.text) {
          // if the server doesn't set Content-Type, won't be parsed as JSON. parse anyway.
          rawEvents = JSON.parse(res.text)
        }
      }

      if (rawEvents) {
        success(rawEvents)
      } else {
        failure('No response')
      }
    })
  }

})

function buildRequestParams(meta: JsonFeedMeta, range: DateRange, calendar: Calendar) {
  const dateEnv = calendar.dateEnv
  let startParam
  let endParam
  let timezoneParam
  let customRequestParams
  let params = {}

  startParam = meta.startParam
  if (startParam == null) {
    startParam = calendar.opt('startParam')
  }

  endParam = meta.endParam
  if (endParam == null) {
    endParam = calendar.opt('endParam')
  }

  timezoneParam = meta.timezoneParam
  if (timezoneParam == null) {
    timezoneParam = calendar.opt('timezoneParam')
  }

  // retrieve any outbound GET/POST data from the options
  if (typeof meta.extraData === 'function') {
    // supplied as a function that returns a key/value object
    customRequestParams = meta.extraData()
  } else {
    // probably supplied as a straight key/value object
    customRequestParams = meta.extraData || {}
  }

  assignTo(params, customRequestParams)

  params[startParam] = dateEnv.formatIso(range.start)
  params[endParam] = dateEnv.formatIso(range.end)

  if (dateEnv.timeZone !== 'local') {
    params[timezoneParam] = dateEnv.timeZone
  }

  return params
}
