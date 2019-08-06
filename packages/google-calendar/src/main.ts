import { createPlugin, EventSourceDef, refineProps, addDays, DateEnv, requestJson } from '@fullcalendar/core'

// TODO: expose somehow
const API_BASE = 'https://www.googleapis.com/calendar/v3/calendars'

const STANDARD_PROPS = { // for event source parsing
  url: String,
  googleCalendarApiKey: String, // TODO: rename with no prefix?
  googleCalendarId: String,
  data: null
}


declare module '@fullcalendar/core' {
  interface OptionsInput {
    googleCalendarApiKey?: string
  }
}

declare module '@fullcalendar/core/structs/event-source' {
  interface ExtendedEventSourceInput {
    googleCalendarApiKey?: string
    googleCalendarId?: string
  }
}


let eventSourceDef: EventSourceDef = {

  parseMeta(raw) {
    if (typeof raw === 'string') {
      raw = { url: raw }
    }

    if (typeof raw === 'object') {
      let standardProps = refineProps(raw, STANDARD_PROPS)

      if (!standardProps.googleCalendarId && standardProps.url) {
        standardProps.googleCalendarId = parseGoogleCalendarId(standardProps.url)
      }

      delete standardProps.url

      if (standardProps.googleCalendarId) {
        return standardProps
      }
    }

    return null
  },

  fetch(arg, onSuccess, onFailure) {
    let calendar = arg.calendar
    let meta = arg.eventSource.meta
    let apiKey = meta.googleCalendarApiKey || calendar.opt('googleCalendarApiKey')

    if (!apiKey) {
      onFailure({
        message: 'Specify a googleCalendarApiKey. See http://fullcalendar.io/docs/google_calendar/'
      })
    } else {
      let url = buildUrl(meta)
      let requestParams = buildRequestParams(
        arg.range,
        apiKey,
        meta.data,
        calendar.dateEnv
      )

      requestJson('GET', url, requestParams, function(body, xhr) {

        if (body.error) {
          onFailure({
            message: 'Google Calendar API: ' + body.error.message,
            errors: body.error.errors,
            xhr
          })
        } else {
          onSuccess({
            rawEvents: gcalItemsToRawEventDefs(
              body.items,
              requestParams.timeZone
            ),
            xhr
          })
        }

      }, function(message, xhr) {
        onFailure({ message, xhr })
      })
    }
  }
}


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


function buildUrl(meta) {
  return API_BASE + '/' + encodeURIComponent(meta.googleCalendarId) + '/events'
}


function buildRequestParams(range, apiKey: string, extraParams, dateEnv: DateEnv) {
  let params
  let startStr
  let endStr

  if (dateEnv.canComputeOffset) {
    // strings will naturally have offsets, which GCal needs
    startStr = dateEnv.formatIso(range.start)
    endStr = dateEnv.formatIso(range.end)
  } else {
    // when timezone isn't known, we don't know what the UTC offset should be, so ask for +/- 1 day
    // from the UTC day-start to guarantee we're getting all the events
    // (start/end will be UTC-coerced dates, so toISOString is okay)
    startStr = addDays(range.start, -1).toISOString()
    endStr = addDays(range.end, 1).toISOString()
  }

  params = {
    ...(extraParams || {}),
    key: apiKey,
    timeMin: startStr,
    timeMax: endStr,
    singleEvents: true,
    maxResults: 9999
  }

  if (dateEnv.timeZone !== 'local') {
    params.timeZone = dateEnv.timeZone
  }

  return params
}


function gcalItemsToRawEventDefs(items, gcalTimezone) {
  return items.map((item) => {
    return gcalItemToRawEventDef(item, gcalTimezone)
  })
}


function gcalItemToRawEventDef(item, gcalTimezone) {
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


// Injects a string like "arg=value" into the querystring of a URL
// TODO: move to a general util file?
function injectQsComponent(url, component) {
  // inject it after the querystring but before the fragment
  return url.replace(/(\?.*?)?(#|$)/, function(whole, qs, hash) {
    return (qs ? qs + '&' : '?') + component + hash
  })
}

export default createPlugin({
  eventSourceDefs: [ eventSourceDef ]
})
