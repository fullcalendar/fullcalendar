import { DateRange, addDays } from '@full-ui/headless-calendar'
import ICAL from 'ical.js'
import { IcalExpander } from './ical-expander/IcalExpander'

export interface ICalFeedMeta {
  url: string
  format: 'ics', // for EventSourceApi
  internalState?: InternalState // HACK. TODO: use classes in future
}

interface InternalState {
  iCalExpanderPromise: Promise<IcalExpander>
  response: Response | null
}

type EventInput = any // TODO

export const eventSourceDef = {

  parseMeta(refined: { url: string, format: string }) {
    if (refined.url && refined.format === 'ics') {
      return {
        url: refined.url,
        format: 'ics',
      }
    }
    return null
  },

  fetch(
    arg: {
      isRefetch: boolean
      range: DateRange
      eventSource: {
        meta: ICalFeedMeta
      }
    },
    successCallback, // any
    errorCallback, // any
  ) {
    let meta: ICalFeedMeta = arg.eventSource.meta
    let { internalState } = meta

    /*
    NOTE: isRefetch is a HACK. we would do the recurring-expanding in a separate plugin hook,
    but we couldn't leverage built-in allDay-guessing, among other things.
    */
    if (!internalState || arg.isRefetch) {
      internalState = meta.internalState = {
        response: null,
        iCalExpanderPromise: fetch(
          meta.url,
          { method: 'GET' },
        ).then((response) => {
          return response.text().then((icsText) => {
            internalState.response = response
            return new IcalExpander({
              ics: icsText,
              skipInvalidDates: true,
            })
          })
        }),
      }
    }

    internalState.iCalExpanderPromise.then(
      (iCalExpander) => {
        successCallback({
          rawEvents: expandICalEvents(iCalExpander, arg.range),
          response: internalState.response,
        })
      },
      errorCallback,
    )
  },
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

/**
 * Extracts non-standard properties (X- prefixed) from an iCalendar event.
 * @see https://icalendar.org/iCalendar-RFC-5545/3-8-8-2-non-standard-properties.html
 */
function getNonStandardProperties(iCalEvent: ICAL.Event) {
  const properties = iCalEvent.component.getAllProperties()

  const nonStandardProperties = properties
    .filter(prop => prop.name.startsWith('x-'))
    .reduce((acc, prop) => {
      acc[prop.name] = prop.getFirstValue()
      return acc
    }, {})

  return nonStandardProperties
}

function buildNonDateProps(iCalEvent: ICAL.Event): EventInput {
  const nonStandardProperties = getNonStandardProperties(iCalEvent)

  return {
    title: iCalEvent.summary,
    url: extractEventUrl(iCalEvent),
    extendedProps: {
      ...nonStandardProperties,
      location: iCalEvent.location,
      organizer: iCalEvent.organizer,
      description: iCalEvent.description,
    },
  }
}

function extractEventUrl(iCalEvent: ICAL.Event): string {
  let urlProp = iCalEvent.component.getFirstProperty('url')
  return urlProp ? urlProp.getFirstValue() as string : ''
}

function specifiesEnd(iCalEvent: ICAL.Event) {
  return Boolean(iCalEvent.component.getFirstProperty('dtend')) ||
    Boolean(iCalEvent.component.getFirstProperty('duration'))
}

