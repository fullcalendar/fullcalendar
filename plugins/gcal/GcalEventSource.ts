import * as $ from 'jquery'
import { EventSource, Promise, JsonFeedEventSource, warn, applyAll } from 'fullcalendar'


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


  fetch(start, end, timezone) {
    let url = this.buildUrl()
    let requestParams = this.buildRequestParams(start, end, timezone)
    let ajaxSettings = this.ajaxSettings || {}
    let onSuccess = ajaxSettings.success

    if (!requestParams) { // could have failed
      return Promise.reject()
    }

    this.calendar.pushLoading()

    return Promise.construct((onResolve, onReject) => {
      $.ajax($.extend(
        {}, // destination
        JsonFeedEventSource.AJAX_DEFAULTS,
        ajaxSettings,
        {
          url: url,
          data: requestParams,
          success: (responseData, status, xhr) => {
            let rawEventDefs
            let successRes

            this.calendar.popLoading()

            if (responseData.error) {
              this.reportError('Google Calendar API: ' + responseData.error.message, responseData.error.errors)
              onReject()
            } else if (responseData.items) {
              rawEventDefs = this.gcalItemsToRawEventDefs(
                responseData.items,
                requestParams.timeZone
              )

              successRes = applyAll(onSuccess, this, [ responseData, status, xhr ]) // passthru

              if ($.isArray(successRes)) {
                rawEventDefs = successRes
              }

              onResolve(this.parseEventDefs(rawEventDefs))
            }
          },
          error: (xhr, statusText, errorThrown) => {
            this.reportError(
              'Google Calendar network failure: ' + statusText,
              [ xhr, errorThrown ]
            )
            this.calendar.popLoading()
            onReject()
          }
        }
      ))
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

    let extendedProperties = {}
    if (
      typeof item.extendedProperties === 'object' &&
      typeof item.extendedProperties.shared === 'object'
    ) {
      extendedProperties = item.extendedProperties.shared
    }

    return {
      id: item.id,
      title: item.summary,
      start: item.start.dateTime || item.start.date, // try timed. will fall back to all-day
      end: item.end.dateTime || item.end.date, // same
      url: url,
      location: item.location,
      description: item.description,
      extendedProperties
    }
  }


  buildUrl() {
    return GcalEventSource.API_BASE + '/' +
      encodeURIComponent(this.googleCalendarId) +
      '/events?callback=?' // jsonp
  }


  buildRequestParams(start, end, timezone) {
    let apiKey = this.googleCalendarApiKey || this.calendar.opt('googleCalendarApiKey')
    let params

    if (!apiKey) {
      this.reportError('Specify a googleCalendarApiKey. See http://fullcalendar.io/docs/google_calendar/')
      return null
    }

    // The API expects an ISO8601 datetime with a time and timezone part.
    // Since the calendar's timezone offset isn't always known, request the date in UTC and pad it by a day on each
    // side, guaranteeing we will receive all events in the desired range, albeit a superset.
    // .utc() will set a zone and give it a 00:00:00 time.
    if (!start.hasZone()) {
      start = start.clone().utc().add(-1, 'day')
    }
    if (!end.hasZone()) {
      end = end.clone().utc().add(1, 'day')
    }

    params = $.extend(
      this.ajaxSettings.data || {},
      {
        key: apiKey,
        timeMin: start.format(),
        timeMax: end.format(),
        singleEvents: true,
        maxResults: 9999
      }
    )

    if (timezone && timezone !== 'local') {
      // when sending timezone names to Google, only accepts underscores, not spaces
      params.timeZone = timezone.replace(' ', '_')
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
    $.extend(this.ajaxSettings, rawProps)
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
