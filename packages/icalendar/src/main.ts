import { createPlugin, EventSourceDef, EventInput, DateRange, addDays } from '@fullcalendar/core'
import * as ICAL from 'ical.js'
import { IcalExpander } from './ical-expander/IcalExpander'

type Success = (rawFeed: string, xhr: XMLHttpRequest) => void
type Failure = (error: string, xhr: XMLHttpRequest) => void

interface ICalFeedMeta {
  url: string
  format: 'ics', // for EventSourceApi
  internalState?: InternalState // HACK. TODO: use classes in future
}

interface InternalState {
  completed: boolean
  callbacks: ((errorMessage: string, iCalExpander: IcalExpander, xhr: XMLHttpRequest) => void)[]
  errorMessage: string
  iCalExpander: IcalExpander
  xhr: XMLHttpRequest | null
}

let eventSourceDef: EventSourceDef<ICalFeedMeta> = {

  parseMeta(refined) {
    if (refined.url && refined.format === 'ics') {
      return {
        url: refined.url,
        format: 'ics',
      }
    }
    return null
  },

  fetch(arg, onSuccess, onFailure) {
    let { meta } = arg.eventSource
    let { internalState } = meta

    function handleICalEvents(errorMessage, iCalExpander: IcalExpander, xhr) {
      if (errorMessage) {
        onFailure({ message: errorMessage, xhr })
      } else {
        onSuccess({ rawEvents: expandICalEvents(iCalExpander, arg.range), xhr })
      }
    }

    /*
    NOTE: isRefetch is a HACK. we would do the recurring-expanding in a separate plugin hook,
    but we couldn't leverage built-in allDay-guessing, among other things.
    */
    if (!internalState || arg.isRefetch) {
      internalState = meta.internalState = { // our ghetto Promise
        completed: false,
        callbacks: [handleICalEvents],
        errorMessage: '',
        iCalExpander: null,
        xhr: null,
      }

      requestICal(
        meta.url,
        (rawFeed, xhr) => {
          let iCalExpander = new IcalExpander({
            ics: rawFeed,
            skipInvalidDates: true,
          })

          for (let callback of internalState.callbacks) {
            callback('', iCalExpander, xhr)
          }

          internalState.completed = true
          internalState.callbacks = []
          internalState.iCalExpander = iCalExpander
          internalState.xhr = xhr
        },
        (errorMessage, xhr) => {
          for (let callback of internalState.callbacks) {
            callback(errorMessage, null, xhr)
          }

          internalState.completed = true
          internalState.callbacks = []
          internalState.errorMessage = errorMessage
          internalState.xhr = xhr
        },
      )
    } else if (!internalState.completed) {
      internalState.callbacks.push(handleICalEvents)
    } else {
      handleICalEvents(internalState.errorMessage, internalState.iCalExpander, internalState.xhr)
    }
  },
}

function requestICal(url: string, successCallback: Success, failureCallback: Failure) {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 400) {
      successCallback(xhr.responseText, xhr)
    } else {
      failureCallback('Request failed', xhr)
    }
  }
  xhr.onerror = () => failureCallback('Request failed', xhr)
  xhr.send(null)
}

function expandICalEvents(iCalExpander: IcalExpander, range: DateRange): EventInput[] {
  // expand the range. because our `range` is timeZone-agnostic UTC
  // or maybe because ical.js always produces dates in local time? i forget
  let rangeStart = addDays(range.start, -1)
  let rangeEnd = addDays(range.end, 1)

  let iCalRes = iCalExpander.between(rangeStart, rangeEnd) // end inclusive. will give extra results
  let expanded: EventInput[] = []

  // TODO: instead of using startDate/endDate.toString to communicate allDay,
  // we can query startDate/endDate.isDate. More efficient to avoid formatting/reparsing.

  // single events
  for (let iCalEvent of iCalRes.events) {
    expanded.push({
      ...buildNonDateProps(iCalEvent),
      start: iCalEvent.startDate.toString(),
      end: (specifiesEnd(iCalEvent) && iCalEvent.endDate)
        ? iCalEvent.endDate.toString()
        : null,
    })
  }

  // recurring event instances
  for (let iCalOccurence of iCalRes.occurrences) {
    let iCalEvent = iCalOccurence.item
    expanded.push({
      ...buildNonDateProps(iCalEvent),
      start: iCalOccurence.startDate.toString(),
      end: (specifiesEnd(iCalEvent) && iCalOccurence.endDate)
        ? iCalOccurence.endDate.toString()
        : null,
    })
  }

  return expanded
}

function buildNonDateProps(iCalEvent: ICAL.Event): EventInput {
  return {
    title: iCalEvent.summary,
    url: extractEventUrl(iCalEvent),
    extendedProps: {
      location: iCalEvent.location,
      organizer: iCalEvent.organizer,
      description: iCalEvent.description,
    },
  }
}

function extractEventUrl(iCalEvent: ICAL.Event): string {
  let urlProp = iCalEvent.component.getFirstProperty('url')
  return urlProp ? urlProp.getFirstValue() : ''
}

function specifiesEnd(iCalEvent: ICAL.Event) {
  return Boolean(iCalEvent.component.getFirstProperty('dtend')) ||
    Boolean(iCalEvent.component.getFirstProperty('duration'))
}

export default createPlugin({
  eventSourceDefs: [eventSourceDef],
})
