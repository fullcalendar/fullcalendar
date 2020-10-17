import ICAL from 'ical.js'
import { EventSourceDef } from '../structs/event-source-def'
import { __assign } from 'tslib'
import { createPlugin } from '../plugin-system'
import { ICAL_FEED_EVENT_SOURCE_REFINERS } from './ical-feed-event-source-refiners'

type Success = (rawFeed: string, xhr: XMLHttpRequest) => void
type Failure = (error: string, xhr: XMLHttpRequest) => void

export function requestICal(url: string, successCallback: Success, failureCallback: Failure) {

  const xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)

  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 400) {

      const iCalFeed = xhr.responseText
      console.log(iCalFeed)

      successCallback(iCalFeed, xhr)
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
          try {

          const iCalFeed = ICAL.parse(rawFeed)
          const iCalComponent = new ICAL.Component(iCalFeed);
          const vevent1 = iCalComponent.getFirstSubcomponent("vevent");
          const event = new ICAL.Event(vevent1);

          const events = [
            {
              title: event.summary,
              start: event.startDate.toJSDate(),
              end: event.endDate.toJSDate(),
            },
          ]

          success({ rawEvents: events, xhr })
          resolve()
          } catch(error) {
            console.log(error)
            throw error
          }
        },
        (errorMessage, xhr) => {
          failure({ message: errorMessage, xhr })
          reject()
        },
      )
    })
  }
}


export default createPlugin({
  eventSourceRefiners: ICAL_FEED_EVENT_SOURCE_REFINERS,
  eventSourceDefs: [ eventSourceDef ]
})
