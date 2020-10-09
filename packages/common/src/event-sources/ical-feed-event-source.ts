import { requestJson } from '../util/requestJson'
import { EventSourceDef } from '../structs/event-source-def'
import { __assign } from 'tslib'
import { createPlugin } from '../plugin-system'
import { ICAL_FEED_EVENT_SOURCE_REFINERS } from './ical-feed-event-source-refiners'

interface ICalFeedMeta {
  feedUrl: string
  method: string
  extraParams?: any
}

let eventSourceDef: EventSourceDef<ICalFeedMeta> = {

  parseMeta(refined) {
    if (refined.feedUrl) {
      return {
        feedUrl: refined.url,
        method: (refined.method || 'GET').toUpperCase(),
      }
    }
    return null
  },

  fetch(arg, success, failure) {
    let meta: ICalFeedMeta = arg.eventSource.meta
    let requestParams = buildRequestParams(meta)

    requestJson(
      meta.method, meta.feedUrl, requestParams,
      function(_, xhr) {
        const rawEvents = [
          {
            title: 'id-123',
            start: '2019-04-10T10:30:00Z',
            end: '2019-04-13T17:00Z',
          },
        ]

        success({ rawEvents, xhr })
      },
      function(errorMessage, xhr) {
        failure({ message: errorMessage, xhr })
      }
    )
  }

}


export const iCalFeedEventSourcePlugin = createPlugin({
  eventSourceRefiners: ICAL_FEED_EVENT_SOURCE_REFINERS,
  eventSourceDefs: [ eventSourceDef ]
})


function buildRequestParams(meta: ICalFeedMeta) {
  let customRequestParams
  let params = {}

  if (typeof meta.extraParams === 'function') {
    customRequestParams = meta.extraParams()
  } else {
    customRequestParams = meta.extraParams || {}
  }

  __assign(params, customRequestParams)

  return params
}
