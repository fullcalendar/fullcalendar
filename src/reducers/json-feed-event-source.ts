import UnzonedRange from '../models/UnzonedRange'
import * as request from 'superagent'
import { assignTo } from '../util/object'
import Calendar from '../Calendar'
import { registerSourceType } from './event-sources'

interface JsonFeedMeta {
  url: string
  method: string
  extraData: any
  startParam: string | null
  endParam: string | null
  timezoneParam: string | null
}

registerSourceType('json-feed', {

  parse(raw: any): JsonFeedMeta {
    if (typeof raw === 'string') { // short form
      raw = { url: raw }
    } else if (!raw || typeof raw !== 'object' || !raw.url) {
      return null
    }

    return {
      url: raw.url,
      method: (raw.method || 'GET').toUpperCase(),
      extraData: raw.data,
      startParam: raw.startParam || null,
      endParam: raw.endParam || null,
      timezoneParam: raw.timezoneParam || null
    }
  },

  fetch(arg, success, failure) {
    let meta: JsonFeedMeta = arg.eventSource.sourceTypeMeta
    let theRequest
    let requestParams = buildRequestParams(meta, arg.range, arg.calendar)

    if (meta.method === 'GET') {
      theRequest = request.get(meta.url).query(requestParams) // querystring params
    } else {
      theRequest = request(meta.method, this.url).send(requestParams) // body data
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
        failure()
      }
    })
  }

})

function buildRequestParams(meta: JsonFeedMeta, range: UnzonedRange, calendar: Calendar) {
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
