import { EventStore, createEmptyEventStore } from '../structs/event-store'
import { EventDef } from '../structs/event'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { mapHash } from '../util/object'
import reselector from '../util/reselector'
import { EventUiHash, EventUi, combineEventUis } from './event-ui'
import { DateSpan } from '../structs/date-span'

export interface SplittableProps {
  dateSelection: DateSpan | null
  eventStore: EventStore
  eventUiBases: EventUiHash
  eventSelection: string
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
}

export const EMPTY_PROPS: SplittableProps = {
  dateSelection: null,
  eventStore: createEmptyEventStore(), // TODO: keep empty store elsewhere. const will replace createEmptyEventStore
  eventUiBases: {},
  eventSelection: '',
  eventDrag: null,
  eventResize: null
}

export default abstract class Splitter<PropsType extends SplittableProps = SplittableProps> {

  private getKeysForEventDefs = reselector(this._getKeysForEventDefs)
  private splitDateSelection = reselector(this._splitDateSpan)
  private splitEventStore = reselector(this._splitEventStore)
  private splitEventUiBases = reselector(this._splitEventUiBases)
  private splitEventDrag = reselector(this._splitInteraction)
  private splitEventResize = reselector(this._splitInteraction)
  protected keyEventUiMergers: { [key: string]: typeof mergeKeyEventUi } = {}

  abstract getKeysForDateSpan(dateSpan: DateSpan): string[]
  abstract getKeysForEventDef(eventDef: EventDef): string[]

  getKeyEventUis(props: PropsType): EventUiHash {
    return {}
  }

  splitProps(props: PropsType): { [key: string]: SplittableProps } {

    let dateSelections = this.splitDateSelection(props.dateSelection)
    let keysByDefId = this.getKeysForEventDefs(props.eventStore)

    let keyEventUis = this.getKeyEventUis(props)
    let eventUiBases = this.splitEventUiBases(props.eventUiBases, keysByDefId)
    eventUiBases = this.injectKeyEventUis(eventUiBases, keyEventUis)

    let eventStores = this.splitEventStore(props.eventStore, keysByDefId)
    let eventDrags = this.splitEventDrag(props.eventDrag, keysByDefId)
    let eventResizes = this.splitEventResize(props.eventResize, keysByDefId)
    let splitProps: { [key: string]: SplittableProps } = {}

    let populate = function(key: string) {
      if (!splitProps[key]) {
        let eventStore = eventStores[key] || EMPTY_PROPS.eventStore

        splitProps[key] = {
          dateSelection: dateSelections[key] || null,
          eventStore,
          eventUiBases: eventUiBases[key] || {},
          eventSelection: eventStore.instances[props.eventSelection] ? props.eventSelection : '',
          eventDrag: eventDrags[key] || null,
          eventResize: eventResizes[key] || null
        }
      }
    }

    for (let key in dateSelections) { populate(key) }
    for (let key in eventStores) { populate(key) }
    for (let key in eventUiBases) { populate(key) }
    for (let key in eventDrags) { populate(key) }
    for (let key in eventResizes) { populate(key) }

    return splitProps
  }

  private _splitDateSpan(dateSpan: DateSpan | null) {
    let dateSpans = {}

    if (dateSpan) {
      let keys = this.getKeysForDateSpan(dateSpan)

      for (let key of keys) {
        dateSpans[key] = dateSpan
      }
    }

    return dateSpans
  }

  private _getKeysForEventDefs(eventStore: EventStore) {
    return mapHash(eventStore.defs, (eventDef: EventDef) => {
      return this.getKeysForEventDef(eventDef)
    })
  }

  private _splitEventStore(eventStore: EventStore, keysByDefId): { [key: string]: EventStore } {
    let { defs, instances } = eventStore
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

        if (splitStores[key]) { // must have already been created
          splitStores[key].instances[instanceId] = instance
        }
      }
    }

    return splitStores
  }

  /*
  TODO: can we make EventConfigBase: { all: EventConfig, byDefId: EventConfigHash }
  */
  private _splitEventUiBases(eventUiBases: EventUiHash, keysByDefId): { [key: string]: EventUiHash } {
    let universalEventUiBase = eventUiBases['']
    let splitHashes: { [key: string]: EventUiHash } = {}

    for (let defId in eventUiBases) {
      if (defId) { // not the '' key
        for (let key of keysByDefId[defId]) {

          if (!splitHashes[key]) {
            splitHashes[key] = {}
          }

          splitHashes[key][defId] = eventUiBases[defId]
        }
      }
    }

    if (universalEventUiBase) {
      for (let key in splitHashes) {
        splitHashes[key][''] = universalEventUiBase
      }
    }

    return splitHashes
  }

  /*
  eventUiBases's PROPS are unique references, not the whole object itself
  */
  private injectKeyEventUis(eventUiBases: { [key: string]: EventUiHash }, keyEventUis: EventUiHash): { [key: string]: EventUiHash } {
    this.keyEventUiMergers = mapHash(eventUiBases, (eventUiBase, key) => {
      return this.keyEventUiMergers[key] || reselector(mergeKeyEventUi)
    })

    return mapHash(this.keyEventUiMergers, function(mergeKeyEventUi, key) {
      return mergeKeyEventUi(eventUiBases[key], keyEventUis[key])
    })
  }

  private _splitInteraction(interaction: EventInteractionState | null, keysByDefId): { [key: string]: EventInteractionState } {
    let splitStates: { [key: string]: EventInteractionState } = {}

    if (interaction) {
      let affectedStores = this._splitEventStore(interaction.affectedEvents, keysByDefId)

      // can't rely on keysByDefId because event data is mutated
      let mutatedKeysByDefId = this._getKeysForEventDefs(interaction.mutatedEvents)
      let mutatedStores = this._splitEventStore(interaction.mutatedEvents, mutatedKeysByDefId)

      let populate = function(key) {
        if (!splitStates[key]) {
          splitStates[key] = {
            affectedEvents: affectedStores[key] || createEmptyEventStore(),
            mutatedEvents: mutatedStores[key] || createEmptyEventStore(),
            isEvent: interaction.isEvent,
            origSeg: interaction.origSeg
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

}

// TODO: move all above methods to be normal functions?


function mergeKeyEventUi(eventUiBase: EventUiHash, eventUiForKey?: EventUi): EventUiHash {
  if (eventUiForKey) {
    return Object.assign({}, eventUiBase, {
      '': eventUiBase[''] ?
        combineEventUis([ eventUiBase[''], eventUiForKey ]) :
        eventUiForKey
    })
  }

  return eventUiBase
}
