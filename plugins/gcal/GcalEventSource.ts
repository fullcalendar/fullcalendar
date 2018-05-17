import * as request from 'superagent'
import { EventSource, warn, applyAll, assignTo, DateEnv, DateMarker, addDays } from 'fullcalendar'


export default class GcalEventSource extends EventSource {

  static API_BASE = 'https://www.googleapis.com/calendar/v3/calendars'

  // TODO: eventually remove "googleCalendar" prefix (API-breaking)
  googleCalendarApiKey: any
  googleCalendarId: any
  googleCalendarError: any // optional function
  ajaxSettings: any


  static parse(rawInput, calendar) {
    let rawProps

    if (typeof rawInput === 'object') { // long form. might fail in applyManualStandardProps
      rawProps = rawInput
    } else if (typeof rawInput === 'string') { // short form
      rawProps = { url: rawInput } // url will be parsed with parseGoogleCalendarId
    }

    if (rawProps) {
      return EventSource.parse.call(this, rawProps, calendar)
    }

    return false
  }


  fetch(start: DateMarker, end: DateMarker, dateEnv: DateEnv, onSuccess, onFailure) {
    let url = this.buildUrl()
    let requestParams = this.buildRequestParams(start, end, dateEnv)
    let ajaxSettings = this.ajaxSettings || {}

    if (!requestParams) { // could have failed
      onFailure()
      return
    }

    this.calendar.pushLoading()

    request.get(url)
      .query(requestParams)
      .end((error, res) => {
        let rawEventDefs

        this.calendar.popLoading()

        if (res && res.body && res.body.error) {
          this.reportError('Google Calendar API: ' + res.body.error.message, res.body.error.errors)
        } else if (error) {
          this.reportError('Google Calendar API', error)
        } else {
          rawEventDefs = this.gcalItemsToRawEventDefs(
            res.body.items,
            requestParams.timeZone
          )
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


  gcalItemsToRawEventDefs(items, gcalTimezone) {
    return items.map((item) => {
      return this.gcalItemToRawEventDef(item, gcalTimezone)
    })
  }


  gcalItemToRawEventDef(item, gcalTimezone) {
    let url = item.htmlLink || null

    // make the URLs for each event show times in the correct timezone
    if (url && gcalTimezone) {
      url = injectQsComponent(url, 'ctz=' + gcalTimezone)
    }

    return {
      id: item.id,
      title: item.summary,
      start: item.start.dateTime || item.start.date, // try timed. will fall back to all-day
      end: item.end.dateTime || item.end.date, // same
      url: url,
      location: item.location,
      description: item.description
    }
  }


  buildUrl() {
    return GcalEventSource.API_BASE + '/' + encodeURIComponent(this.googleCalendarId) + '/events'
  }


  buildRequestParams(start: DateMarker, end: DateMarker, dateEnv: DateEnv) {
    let apiKey = this.googleCalendarApiKey || this.calendar.opt('googleCalendarApiKey')
    let params

    if (!apiKey) {
      this.reportError('Specify a googleCalendarApiKey. See http://fullcalendar.io/docs/google_calendar/')
      return null
    }

    // when timezone isn't known, we don't know what the UTC offset should be, so ask for +/- 1 day
    // from the UTC day-start to guarantee we're getting all the events
    if (!dateEnv.canComputeTimeZoneOffset()) {
      start = addDays(start, -1)
      end = addDays(end, 1)
    }

    params = assignTo(
      this.ajaxSettings.data || {},
      {
        key: apiKey,
        timeMin: dateEnv.toIso(start),
        timeMax: dateEnv.toIso(end),
        singleEvents: true,
        maxResults: 9999
      }
    )

    // when sending timezone names to Google, only accepts underscores, not spaces
    if (dateEnv.timeZone !== 'local') {
      params.timeZone = dateEnv.timeZone.replace(' ', '_')
    }

    return params
  }


  reportError(message, apiErrorObjs?) {
    let calendar = this.calendar
    let calendarOnError = calendar.opt('googleCalendarError')
    let errorObjs = apiErrorObjs || [ { message: message } ] // to be passed into error handlers

    if (this.googleCalendarError) {
      this.googleCalendarError.apply(calendar, errorObjs)
    }

    if (calendarOnError) {
      calendarOnError.apply(calendar, errorObjs)
    }

    // print error to debug console
    warn.apply(null, [ message ].concat(apiErrorObjs || []))
  }


  getPrimitive() {
    return this.googleCalendarId
  }


  applyManualStandardProps(rawProps) {
    let superSuccess = EventSource.prototype.applyManualStandardProps.apply(this, arguments)
    let googleCalendarId = rawProps.googleCalendarId

    if (googleCalendarId == null && rawProps.url) {
      googleCalendarId = parseGoogleCalendarId(rawProps.url)
    }

    if (googleCalendarId != null) {
      this.googleCalendarId = googleCalendarId

      return superSuccess
    }

    return false
  }


  applyMiscProps(rawProps) {
    if (!this.ajaxSettings) {
      this.ajaxSettings = {}
    }
    assignTo(this.ajaxSettings, rawProps)
  }

}


GcalEventSource.defineStandardProps({
  // manually process...
  url: false,
  googleCalendarId: false,

  // automatically transfer...
  googleCalendarApiKey: true,
  googleCalendarError: true
})


function parseGoogleCalendarId(url) {
  let match

  // detect if the ID was specified as a single string.
  // will match calendars like "asdf1234@calendar.google.com" in addition to person email calendars.
  if (/^[^\/]+@([^\/\.]+\.)*(google|googlemail|gmail)\.com$/.test(url)) {
    return url
  } else if (
    (match = /^https:\/\/www.googleapis.com\/calendar\/v3\/calendars\/([^\/]*)/.exec(url)) ||
    (match = /^https?:\/\/www.google.com\/calendar\/feeds\/([^\/]*)/.exec(url))
  ) {
    return decodeURIComponent(match[1])
  }
}


// Injects a string like "arg=value" into the querystring of a URL
function injectQsComponent(url, component) {
  // inject it after the querystring but before the fragment
  return url.replace(/(\?.*?)?(#|$)/, function(whole, qs, hash) {
    return (qs ? qs + '&' : '?') + component + hash
  })
}
