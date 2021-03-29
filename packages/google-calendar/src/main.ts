import { createPlugin, EventSourceDef, addDays, DateEnv, requestJson, Dictionary } from '@fullcalendar/common'
import { OPTION_REFINERS } from './options-refiners'
import './options-declare'
import { EVENT_SOURCE_REFINERS } from './event-source-refiners'
import './event-source-declare'

// TODO: expose somehow
const API_BASE = 'https://www.googleapis.com/calendar/v3/calendars'

interface GCalMeta {
  googleCalendarId: string
  googleCalendarApiKey?: string
  googleCalendarApiBase?: string,
  extraParams?: Dictionary | (() => Dictionary)
}

let eventSourceDef: EventSourceDef<GCalMeta> = {

  parseMeta(refined): GCalMeta | null {
    let { googleCalendarId } = refined

    if (!googleCalendarId && refined.url) {
      googleCalendarId = parseGoogleCalendarId(refined.url)
    }

    if (googleCalendarId) {
      return {
        googleCalendarId,
        googleCalendarApiKey: refined.googleCalendarApiKey,
        googleCalendarApiBase: refined.googleCalendarApiBase,
        extraParams: refined.extraParams,
      }
    }

    return null
  },

  fetch(arg, onSuccess, onFailure) {
    let { dateEnv, options } = arg.context
    let meta: GCalMeta = arg.eventSource.meta
    let apiKey = meta.googleCalendarApiKey || options.googleCalendarApiKey

    if (!apiKey) {
      onFailure({
        message: 'Specify a googleCalendarApiKey. See http://fullcalendar.io/docs/google_calendar/',
      })
    } else {
      let url = buildUrl(meta)

      // TODO: make DRY with json-feed-event-source
      let { extraParams } = meta
      let extraParamsObj = typeof extraParams === 'function' ? extraParams() : extraParams

      let requestParams = buildRequestParams(
        arg.range,
        apiKey,
        extraParamsObj,
        dateEnv,
      )

      requestJson('GET', url, requestParams, (body, xhr) => {
        if (body.error) {
          onFailure({
            message: 'Google Calendar API: ' + body.error.message,
            errors: body.error.errors,
            xhr,
          })
        } else {
          onSuccess({
            rawEvents: gcalItemsToRawEventDefs(
              body.items,
              requestParams.timeZone,
            ),
            xhr,
          })
        }
      }, (message, xhr) => {
        onFailure({ message, xhr })
      })
    }
  },
}

function parseGoogleCalendarId(url) {
  let match

  // detect if the ID was specified as a single string.
  // will match calendars like "asdf1234@calendar.google.com" in addition to person email calendars.
  if (/^[^/]+@([^/.]+\.)*(google|googlemail|gmail)\.com$/.test(url)) {
    return url
  }

  if (
    (match = /^https:\/\/www.googleapis.com\/calendar\/v3\/calendars\/([^/]*)/.exec(url)) ||
    (match = /^https?:\/\/www.google.com\/calendar\/feeds\/([^/]*)/.exec(url))
  ) {
    return decodeURIComponent(match[1])
  }

  return null
}

function buildUrl(meta) {
  let apiBase = meta.googleCalendarApiBase
  if (!apiBase) {
    apiBase = API_BASE
  }
  return apiBase + '/' + encodeURIComponent(meta.googleCalendarId) + '/events'
}

function buildRequestParams(range, apiKey: string, extraParams: Dictionary, dateEnv: DateEnv) {
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
    maxResults: 9999,
  }

  if (dateEnv.timeZone !== 'local') {
    params.timeZone = dateEnv.timeZone
  }

  return params
}

function gcalItemsToRawEventDefs(items, gcalTimezone) {
  return items.map((item) => gcalItemToRawEventDef(item, gcalTimezone))
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
    url,
    location: item.location,
    description: item.description,
    attachments: item.attachments || [],
    extendedProps: (item.extendedProperties || {}).shared || {},
  }
}

// Injects a string like "arg=value" into the querystring of a URL
// TODO: move to a general util file?
function injectQsComponent(url, component) {
  // inject it after the querystring but before the fragment
  return url.replace(
    /(\?.*?)?(#|$)/,
    (whole, qs, hash) => (qs ? qs + '&' : '?') + component + hash,
  )
}

export default createPlugin({
  eventSourceDefs: [eventSourceDef],
  optionRefiners: OPTION_REFINERS,
  eventSourceRefiners: EVENT_SOURCE_REFINERS,
})
