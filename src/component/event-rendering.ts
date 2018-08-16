import { EventDef, EventInstance, EventDefHash } from '../structs/event'
import { EventStore } from '../structs/event-store'
import { DateRange, invertRanges } from '../datelib/date-range'
import { EventSourceHash } from '../structs/event-source'
import { mapHash } from '../util/object'
import { parseClassName } from '../util/html'

export interface EventUiProps {
  startEditable: boolean
  durationEditable: boolean
  backgroundColor: string
  borderColor: string
  textColor: string,
  rendering: string,
  classNames: string[]
}

export interface EventRenderRange {
  eventDef: EventDef
  eventInstance?: EventInstance
  range: DateRange
  ui: EventUiProps
}


/*
Does not slice ranges via framingRange into new ranges, but instead,
keeps fg event ranges intact but more importantly slices inverse-BG events.
*/
export function sliceEventStore(eventStore: EventStore, eventSources: EventSourceHash, framingRange: DateRange, options) {
  let inverseBgByGroupId: { [groupId: string]: DateRange[] } = {}
  let inverseBgByDefId: { [defId: string]: DateRange[] } = {}
  let defByGroupId: { [groupId: string]: EventDef } = {}
  let renderRanges: EventRenderRange[] = []
  let uiHashes = computeUiHashes(eventStore.defs, eventSources, options)

  for (let defId in eventStore.defs) {
    let def = eventStore.defs[defId]
    let ui = uiHashes[defId]

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
    let ui = uiHashes[def.defId]

    if (ui.rendering === 'inverse-background') {
      if (def.groupId) {
        inverseBgByGroupId[def.groupId].push(instance.range)
      } else {
        inverseBgByDefId[instance.defId].push(instance.range)
      }
    } else {
      renderRanges.push({
        eventDef: def,
        eventInstance: instance,
        range: instance.range,
        ui
      })
    }
  }

  for (let groupId in inverseBgByGroupId) {
    let ranges = inverseBgByGroupId[groupId]
    let invertedRanges = invertRanges(ranges, framingRange)

    for (let invertedRange of invertedRanges) {
      let def = defByGroupId[groupId]
      let ui = uiHashes[def.defId]

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
        ui: uiHashes[defId]
      })
    }
  }

  return renderRanges
}


// UI Props
// ----------------------------------------------------------------------------------------------------

function computeUiHashes(eventDefs: EventDefHash, eventSources: EventSourceHash, options) {
  return mapHash(eventDefs, function(eventDef) {
    return computeUiHash(eventDef, eventSources, options)
  })
}

export function computeUiHash(eventDef: EventDef, eventSources: EventSourceHash, options) {
  // lowest to highest priority
  // TODO: hook for resources, using refineScopedUiHash
  let refinedHashes = [
    refineScopedUiHash(options),
    refineUnscopedUiHash(eventSources[eventDef.sourceId] || {}),
    refineUnscopedUiHash(eventDef)
  ]

  return refinedHashes.reduce(combineUiHashes)
}

function refineScopedUiHash(input) { // has word "event" in prop names
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

function refineUnscopedUiHash(input) { // does NOT have the word "event' in prop names
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

function combineUiHashes(hash0, hash1) { // hash1 has higher precedence
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
