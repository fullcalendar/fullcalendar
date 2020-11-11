import * as ICAL from 'ical.js'
import { createPlugin, EventSourceDef, EventInput } from '@fullcalendar/common'
import { EVENT_SOURCE_REFINERS } from './event-source-refiners'

type Success = (rawFeed: string, xhr: XMLHttpRequest) => void
type Failure = (error: string, xhr: XMLHttpRequest) => void

export function requestICal(url: string, successCallback: Success, failureCallback: Failure) {
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

interface ICalFeedMeta {
  feedUrl: string
  extraParams?: any
}

let buildIcalEvents = (rawFeed: string): ICAL.Event[] => {
  try {
    const iCalFeed = ICAL.parse(rawFeed)
    const iCalComponent = new ICAL.Component(iCalFeed)
    return iCalComponent.getAllSubcomponents('vevent')
  } catch (err) {
    console.warn(`Error parsing feed: ${err}`)
    return []
  }
}

let buildEvents = (vevents: ICAL.Event[]): EventInput[] => vevents.map((vevent) => {
  const event = new ICAL.Event(vevent)

  if (!event.startDate) {
    // no start date so corrupt / invalid event
    return null
  }

  const fcEvent = {
    title: event.summary,
    start: event.startDate.toString(),
    end: (event.endDate ? event.endDate.toString() : null),
  }

  try {
    if (event.startDate.isDate) {
      return {
        ...fcEvent,
        allDay: true,
      }
    }

    return fcEvent
  } catch (error) {
    console.warn(`Unable to process item in calendar: ${error}.`)
    return null
  }
}).filter((item: EventInput | null) => item !== null)

let eventSourceDef: EventSourceDef<ICalFeedMeta> = {

  parseMeta(refined) {
    if (refined.feedUrl) {
      return {
        feedUrl: refined.feedUrl,
      }
    }
    return null
  },

  fetch(arg, success, failure) {
    let meta: ICalFeedMeta = arg.eventSource.meta

    return new Promise((resolve, reject) => {
      requestICal(meta.feedUrl,
        (rawFeed, xhr) => {
          const icalEvents = buildIcalEvents(rawFeed)
          const events = buildEvents(icalEvents)

          success({ rawEvents: events, xhr })
          resolve()
        },
        (errorMessage, xhr) => {
          failure({ message: errorMessage, xhr })
          reject()
        },
      )
    })
  },
}

export default createPlugin({
  eventSourceRefiners: EVENT_SOURCE_REFINERS,
  eventSourceDefs: [eventSourceDef],
})
