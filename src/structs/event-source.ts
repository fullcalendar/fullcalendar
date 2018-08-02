import UnzonedRange from '../models/UnzonedRange'
import { ClassNameInput, parseClassName } from '../util/html'
import { refineProps } from '../util/misc'
import { EventInput } from './event'
import Calendar from '../Calendar'

export interface EventSourceInput {
  id?: string | number
  allDayDefault?: boolean
  eventDataTransform?: any
  editable?: boolean
  startEditable?: boolean
  durationEditable?: boolean
  overlap?: any
  constraint?: any
  rendering?: string
  className?: ClassNameInput
  color?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  success?: (eventInputs: EventInput[]) => void
  failure?: (errorObj: any) => void
  [otherProp: string]: any
}

export interface EventSource {
  sourceId: string
  sourceType: string
  sourceTypeMeta: any
  publicId: string
  isFetching: boolean
  latestFetchId: string | null
  fetchRange: UnzonedRange
  allDayDefault: boolean | null
  eventDataTransform: any
  editable: boolean | null
  startEditable: boolean | null
  durationEditable: boolean | null
  overlap: any
  constraint: any
  rendering: string | null
  className: string[]
  color: string | null
  backgroundColor: string | null
  borderColor: string | null
  textColor: string | null
  success?: (eventInputs: EventInput[]) => void
  failure?: (errorObj: any) => void
}

// need this?
export type EventSourceHash = { [sourceId: string]: EventSource }

export interface EventSourceTypeSettings {
  parseMeta: (raw: any) => any
  fetch: (
    arg: {
      eventSource: EventSource
      calendar: Calendar
      range: UnzonedRange
    },
    success: (rawEvents: EventInput) => void,
    failure: (errorObj: any) => void
  ) => void
}


const SIMPLE_SOURCE_PROPS = {
  allDayDefault: Boolean,
  eventDataTransform: null,
  editable: Boolean,
  startEditable: Boolean,
  durationEditable: Boolean,
  overlap: null,
  constraint: null,
  rendering: String,
  className: parseClassName,
  color: String,
  backgroundColor: String,
  borderColor: String,
  textColor: String,
  success: null,
  failure: null
}

export let sourceTypes: { [sourceTypeName: string]: EventSourceTypeSettings } = {}
let guid = 0

export function registerSourceType(type: string, settings: EventSourceTypeSettings) {
  sourceTypes[type] = settings
}

export function parseSource(raw: EventSourceInput): EventSource {
  for (let sourceTypeName in sourceTypes) {
    let sourceTypeSettings = sourceTypes[sourceTypeName]
    let sourceTypeMeta = sourceTypeSettings.parseMeta(raw)

    if (sourceTypeMeta) {
      let source: EventSource = refineProps(raw, SIMPLE_SOURCE_PROPS)
      source.sourceId = String(guid++)
      source.sourceType = sourceTypeName
      source.sourceTypeMeta = sourceTypeMeta

      if (raw.id != null) {
        source.publicId = String(raw.id)
      }

      return source
    }
  }

  return null
}
