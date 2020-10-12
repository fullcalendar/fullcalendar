import { EventSourceDef } from '../structs/event-source-def'
import { __assign } from 'tslib'
import { createPlugin } from '../plugin-system'
import { ICAL_FEED_EVENT_SOURCE_REFINERS } from './ical-feed-event-source-refiners'

export function requestICal(url: string, successCallback, failureCallback) {

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
        (_, xhr) => {
          const rawEvents = [
            {
              title: 'id-123',
              start: '2019-04-10T10:30:00Z',
              end: '2019-04-13T17:00Z',
            },
          ]

          success({ rawEvents, xhr })
          resolve()
        },
        (errorMessage, xhr) => {
          failure({ message: errorMessage, xhr })
          reject()
        },
      )
    })
  }
}


export const iCalFeedEventSourcePlugin = createPlugin({
  eventSourceRefiners: ICAL_FEED_EVENT_SOURCE_REFINERS,
  eventSourceDefs: [ eventSourceDef ]
})
