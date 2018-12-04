import { EventStore, createEmptyEventStore } from '../structs/event-store'
import { EventDef } from '../structs/event'
import { EventInteractionUiState } from '../interactions/event-interaction-state'
import { mapHash } from '../util/object'
import reselector from '../util/reselector'

export function memoizeSplitter(splitter: Splitter) {
  return {
    splitEventStore: reselector(splitter.splitEventStore),
    splitEventDrag: reselector(splitter.splitInteraction),
    splitEventResize: reselector(splitter.splitInteraction)
  }
}

export abstract class Splitter { // not just EVENT splitting (rename file?)

  ensuredKeys: string[]

  constructor(ensuredKeys: string[] = []) {
    this.ensuredKeys = ensuredKeys
  }

  splitInteraction = (state: EventInteractionUiState | null): { [key: string]: EventInteractionUiState } => {
    let splitStates: { [key: string]: EventInteractionUiState } = {}

    for (let key of this.ensuredKeys) {
      splitStates[key] = null
    }

    if (state) {
      let mutatedStores = this.splitEventStorePopulated(state.mutatedEvents)
      let affectedStores = this.splitEventStorePopulated(state.affectedEvents)
      let populate = function(key) {
        if (!splitStates[key]) {
          splitStates[key] = {
            affectedEvents: affectedStores[key] || createEmptyEventStore(),
            mutatedEvents: mutatedStores[key] || createEmptyEventStore(),
            eventUis: state.eventUis,
            isEvent: state.isEvent,
            origSeg: state.origSeg
          }
        }
      }

      for (let key in affectedStores) {
        populate(key)
      }

      for (let key in mutatedStores) {
        populate(key)
      }
    }

    return splitStates
  }

  splitEventStore = (eventStore: EventStore): { [key: string]: EventStore } => {
    let splitStores = this.splitEventStorePopulated(eventStore)

    for (let key of this.ensuredKeys) {
      if (!splitStores[key]) {
        splitStores[key] = createEmptyEventStore()
      }
    }

    return splitStores
  }

  splitEventStorePopulated(eventStore: EventStore): { [key: string]: EventStore } {
    let { defs, instances } = eventStore
    let keysByDefId = mapHash(eventStore.defs, (eventDef: EventDef, defId: string) => {
      return this.getKeysForEventDef(eventDef)
    })
    let splitStores = {}

    for (let defId in defs) {
      for (let key of keysByDefId[defId]) {

        if (!splitStores[key]) {
          splitStores[key] = createEmptyEventStore()
        }

        splitStores[key].defs[defId] = defs[defId]
      }
    }

    for (let instanceId in instances) {
      let instance = instances[instanceId]

      for (let key of keysByDefId[instance.defId]) {
        splitStores[key].instances[instanceId] = instance
      }
    }

    return splitStores
  }

  // is allowed to return keys that aren't in the set
  abstract getKeysForEventDef(eventDef: EventDef): string[]

}
