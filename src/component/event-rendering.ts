import { EventDef, EventInstance, EventDefHash } from '../structs/event'
import { EventStore } from '../structs/event-store'
import { DateRange, invertRanges } from '../datelib/date-range'
import { EventSourceHash } from '../structs/event-source'
import { mapHash } from '../util/object'
import { parseClassName } from '../util/html'
import { Duration } from '../datelib/duration'
import { computeVisibleDayRange } from '../util/misc'

export interface EventUi {
  startEditable: boolean
  durationEditable: boolean
  backgroundColor: string
  borderColor: string
  textColor: string,
  rendering: string,
  classNames: string[]
}

export type EventUiHash = { [defId: string]: EventUi }

export interface EventRenderRange {
  eventDef: EventDef
  eventInstance?: EventInstance
  range: DateRange // NOT sliced by framingRange
  ui: EventUi
}


/*
DOES NOT ACTUALLY SLIE RANGES via framingRange into new ranges, but instead,
keeps fg event ranges intact but more importantly slices inverse-BG events.
Specifying nextDayThreshold signals that all-day ranges should be sliced.
*/
export function sliceEventStore(eventStore: EventStore, eventUis: EventUiHash, framingRange: DateRange, nextDayThreshold?: Duration) {
  let inverseBgByGroupId: { [groupId: string]: DateRange[] } = {}
  let inverseBgByDefId: { [defId: string]: DateRange[] } = {}
  let defByGroupId: { [groupId: string]: EventDef } = {}
  let renderRanges: EventRenderRange[] = []

  for (let defId in eventStore.defs) {
    let def = eventStore.defs[defId]
    let ui = eventUis[defId]

    if (ui.rendering === 'inverse-background') {
      if (def.groupId) {
        inverseBgByGroupId[def.groupId] = []

        if (!defByGroupId[def.groupId]) {
          defByGroupId[def.groupId] = def
        }
      } else {
        inverseBgByDefId[defId] = []
      }
    }
  }

  for (let instanceId in eventStore.instances) {
    let instance = eventStore.instances[instanceId]
    let def = eventStore.defs[instance.defId]
    let ui = eventUis[def.defId]
    let range = instance.range

    if (!def.isAllDay && nextDayThreshold) {
      range = computeVisibleDayRange(range, nextDayThreshold)
    }

    if (ui.rendering === 'inverse-background') {
      if (def.groupId) {
        inverseBgByGroupId[def.groupId].push(range)
      } else {
        inverseBgByDefId[instance.defId].push(range)
      }
    } else {
      renderRanges.push({
        eventDef: def,
        eventInstance: instance,
        range: range,
        ui
      })
    }
  }

  for (let groupId in inverseBgByGroupId) {
    let ranges = inverseBgByGroupId[groupId]
    let invertedRanges = invertRanges(ranges, framingRange)

    for (let invertedRange of invertedRanges) {
      let def = defByGroupId[groupId]
      let ui = eventUis[def.defId]

      renderRanges.push({
        eventDef: def,
        range: invertedRange,
        ui
      })
    }
  }

  for (let defId in inverseBgByDefId) {
    let ranges = inverseBgByDefId[defId]
    let invertedRanges = invertRanges(ranges, framingRange)

    for (let invertedRange of invertedRanges) {
      renderRanges.push({
        eventDef: eventStore.defs[defId],
        range: invertedRange,
        ui: eventUis[defId]
      })
    }
  }

  return renderRanges
}

export function hasBgRendering(ui: EventUi) {
  return ui.rendering === 'background' || ui.rendering === 'inverse-background'
}


// UI Props
// ----------------------------------------------------------------------------------------------------

export function computeEventDefUis(eventDefs: EventDefHash, eventSources: EventSourceHash, options) {
  return mapHash(eventDefs, function(eventDef) {
    return computeEventDefUi(eventDef, eventSources, options)
  })
}

export function computeEventDefUi(eventDef: EventDef, eventSources: EventSourceHash, options) {

  // lowest to highest priority
  // TODO: hook for resources, using refineScopedUi
  let refinedHashes = [
    refineScopedUi(options),
    refineUnscopedUi(eventSources[eventDef.sourceId] || {}),
    refineUnscopedUi(eventDef)
  ]

  return refinedHashes.reduce(combineUis)
}

function refineScopedUi(input) { // has word "event" in prop names
  return {
    startEditable: (input.startEditable != null) ? input.startEditable : input.editable,
    durationEditable: (input.durationEditable != null) ? input.durationEditable : input.editable,
    backgroundColor: input.eventBackgroundColor || input.eventColor || '',
    borderColor: input.eventBorderColor || input.eventColor || '',
    textColor: input.eventTextColor || '',
    rendering: input.eventRendering || '',
    classNames: parseClassName(input.eventClassNames || input.eventClassName)
  }
}

function refineUnscopedUi(input) { // does NOT have the word "event" in prop names
  return {
    startEditable: (input.startEditable != null) ? input.startEditable : input.editable,
    durationEditable: (input.durationEditable != null) ? input.durationEditable : input.editable,
    backgroundColor: input.backgroundColor || input.color || '',
    borderColor: input.borderColor || input.color || '',
    textColor: input.textColor || '',
    rendering: input.rendering || '',
    classNames: parseClassName(input.classNames || input.className)
  }
}

function combineUis(hash0, hash1) { // hash1 has higher precedence
  return {
    startEditable: (hash1.startEditable != null) ? hash1.startEditable : hash0.startEditable,
    durationEditable: (hash1.durationEditable != null) ? hash1.durationEditable : hash0.durationEditable,
    backgroundColor: hash1.backgroundColor || hash0.backgroundColor,
    borderColor: hash1.borderColor || hash0.borderColor,
    textColor: hash1.textColor || hash0.textColor,
    rendering: hash1.rendering || hash0.rendering,
    classNames: hash0.classNames.concat(hash1.classNames)
  }
}
