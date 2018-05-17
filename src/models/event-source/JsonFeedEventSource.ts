import * as request from 'superagent'
import { assignTo } from '../../util/object'
import { applyAll } from '../../util/misc'
import EventSource from './EventSource'
import { DateMarker } from '../../datelib/util'
import { DateEnv } from '../../datelib/env'


export default class JsonFeedEventSource extends EventSource {

  // these props must all be manually set before calling fetch
  url: any
  startParam: any
  endParam: any
  timezoneParam: any
  ajaxSettings: any // does not include url


  static parse(rawInput, calendar) {
    let rawProps

    // normalize raw input
    if (typeof rawInput.url === 'string') { // extended form
      rawProps = rawInput
    } else if (typeof rawInput === 'string') { // short form
      rawProps = { url: rawInput }
    }

    if (rawProps) {
      return EventSource.parse.call(this, rawProps, calendar)
    }

    return false
  }


  fetch(start: DateMarker, end: DateMarker, dateEnv: DateEnv, onSuccess, onFailure) {
    let ajaxSettings = this.ajaxSettings
    let requestParams = this.buildRequestParams(start, end, dateEnv)
    let theRequest

    this.calendar.pushLoading()

    if (!ajaxSettings.method || ajaxSettings.method.toUpperCase() === 'GET') {
      theRequest = request.get(this.url).query(requestParams) // querystring params
    } else {
      theRequest = request(ajaxSettings.method, this.url).send(requestParams) // body data
    }

    theRequest.end((error, res) => {
      let rawEventDefs

      this.calendar.popLoading()

      if (!error) {
        if (res.body) { // parsed JSON
          rawEventDefs = res.body
        } else if (res.text) {
          // if the server doesn't set Content-Type, won't be parsed as JSON. parse anyway.
          rawEventDefs = JSON.parse(res.text)
        }
      }

      if (rawEventDefs) {
        let callbackRes = applyAll(ajaxSettings.success, null, [ rawEventDefs, res ])

        if (Array.isArray(callbackRes)) {
          rawEventDefs = callbackRes
        }

        onSuccess(this.parseEventDefs(rawEventDefs))
      } else {
        applyAll(ajaxSettings.error, null, [ error, res ])
        onFailure()
      }
    })
  }


  buildRequestParams(start: DateMarker, end: DateMarker, dateEnv: DateEnv) {
    let calendar = this.calendar
    let ajaxSettings = this.ajaxSettings
    let startParam
    let endParam
    let timezoneParam
    let customRequestParams
    let params = {}

    startParam = this.startParam
    if (startParam == null) {
      startParam = calendar.opt('startParam')
    }

    endParam = this.endParam
    if (endParam == null) {
      endParam = calendar.opt('endParam')
    }

    timezoneParam = this.timezoneParam
    if (timezoneParam == null) {
      timezoneParam = calendar.opt('timezoneParam')
    }

    // retrieve any outbound GET/POST data from the options
    if (typeof ajaxSettings.data === 'function') {
      // supplied as a function that returns a key/value object
      customRequestParams = ajaxSettings.data()
    } else {
      // probably supplied as a straight key/value object
      customRequestParams = ajaxSettings.data || {}
    }

    assignTo(params, customRequestParams)

    params[startParam] = dateEnv.toIso(start)
    params[endParam] = dateEnv.toIso(end)

    if (dateEnv.timeZone !== 'local') {
      params[timezoneParam] = dateEnv.timeZone
    }

    return params
  }


  getPrimitive() {
    return this.url
  }


  applyMiscProps(rawProps) {
    this.ajaxSettings = rawProps
  }

}


JsonFeedEventSource.defineStandardProps({
  // automatically transfer (true)...
  url: true,
  startParam: true,
  endParam: true,
  timezoneParam: true
})
