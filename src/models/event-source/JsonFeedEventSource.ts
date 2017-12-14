import * as $ from 'jquery'
import { applyAll } from '../../util'
import Promise from '../../common/Promise'
import EventSource from './EventSource'


export default class JsonFeedEventSource extends EventSource {

  static AJAX_DEFAULTS = {
    dataType: 'json',
    cache: false
  }

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


  fetch(start, end, timezone) {
    let ajaxSettings = this.ajaxSettings
    let onSuccess = ajaxSettings.success
    let onError = ajaxSettings.error
    let requestParams = this.buildRequestParams(start, end, timezone)

    // todo: eventually handle the promise's then,
    // don't intercept success/error
    // tho will be a breaking API change

    this.calendar.pushLoading()

    return Promise.construct((onResolve, onReject) => {
      $.ajax($.extend(
        {}, // destination
        JsonFeedEventSource.AJAX_DEFAULTS,
        ajaxSettings,
        {
          url: this.url,
          data: requestParams,
          success: (rawEventDefs, status, xhr) => {
            let callbackRes

            this.calendar.popLoading()

            if (rawEventDefs) {
              callbackRes = applyAll(onSuccess, this, [ rawEventDefs, status, xhr ]) // redirect `this`

              if ($.isArray(callbackRes)) {
                rawEventDefs = callbackRes
              }

              onResolve(this.parseEventDefs(rawEventDefs))
            } else {
              onReject()
            }
          },
          error: (xhr, statusText, errorThrown) => {
            this.calendar.popLoading()

            applyAll(onError, this, [ xhr, statusText, errorThrown ]) // redirect `this`
            onReject()
          }
        }
      ))
    })
  }


  buildRequestParams(start, end, timezone) {
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

    // retrieve any outbound GET/POST $.ajax data from the options
    if ($.isFunction(ajaxSettings.data)) {
      // supplied as a function that returns a key/value object
      customRequestParams = ajaxSettings.data()
    } else {
      // probably supplied as a straight key/value object
      customRequestParams = ajaxSettings.data || {}
    }

    $.extend(params, customRequestParams)

    params[startParam] = start.format()
    params[endParam] = end.format()

    if (timezone && timezone !== 'local') {
      params[timezoneParam] = timezone
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
