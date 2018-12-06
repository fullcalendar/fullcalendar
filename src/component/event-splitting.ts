import { EventStore, createEmptyEventStore } from '../structs/event-store'
import { EventDef } from '../structs/event'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { mapHash } from '../util/object'
import reselector from '../util/reselector'
import { EventUiHash } from './event-ui'
import { DateSpan } from '../structs/date-span'

export interface SplittableProps {
  dateSelection: DateSpan
  eventStore: EventStore
  eventUiBases: EventUiHash
  eventSelection: string
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
}

export default abstract class Splitter<ExtraArgs extends any[] = []> {

  private getKeysForEventDefs = reselector(this._getKeysForEventDefs)
  private splitDateSelection = reselector(this._splitDateSpan)
  private splitEventStore = reselector(this._splitEventStore)
  private splitEventUiBases = reselector(this._splitEventUiBases)
  private splitEventDrag = reselector(this._splitInteraction)
  private splitEventResize = reselector(this._splitInteraction)

  abstract getKeysForDateSpan(dateSpan: DateSpan, ...extraArgs: ExtraArgs): string[]
  abstract getKeysForEventDef(eventDef: EventDef, ...extraArgs: ExtraArgs): string[]

  /*
  will always create a default '' hash
  */
  splitProps(props: SplittableProps, ...extraArgs: ExtraArgs): { [key: string]: SplittableProps } {
    let dateSelections = this.splitDateSelection(props.dateSelection, ...extraArgs)
    let keysByDefId = this.getKeysForEventDefs(props.eventStore, ...extraArgs)
    let eventStores = this.splitEventStore(props.eventStore, keysByDefId)
    let eventUiBases = this.splitEventUiBases(props.eventUiBases, keysByDefId)
    let eventDrags = this.splitEventDrag(props.eventDrag, keysByDefId, ...extraArgs)
    let eventResizes = this.splitEventResize(props.eventResize, keysByDefId, ...extraArgs)
    let splitProps: { [key: string]: SplittableProps } = {}

    let populate = function(key: string) {
      if (!splitProps[key]) {
        let eventStore = eventStores[key] || createEmptyEventStore()

        splitProps[key] = {
          dateSelection: dateSelections[key] || null,
          eventStore,
          eventUiBases: eventUiBases[key] || eventUiBases[''],
          eventSelection: eventStore.instances[props.eventSelection] ? props.eventSelection : '',
          eventDrag: eventDrags[key] || null,
          eventResize: eventResizes[key] || null
        }
      }
    }

    for (let key in dateSelections) { populate(key) }
    for (let key in eventStores) { populate(key) }
    for (let key in eventUiBases) { populate(key) } // guaranteed to create the '' hash
    for (let key in eventDrags) { populate(key) }
    for (let key in eventResizes) { populate(key) }

    return splitProps
  }

  private _splitDateSpan(dateSpan: DateSpan | null, ...extraArgs: ExtraArgs) {
    let dateSpans = {}

    if (dateSpan) {
      let keys = this.getKeysForDateSpan(dateSpan, ...extraArgs)

      for (let key of keys) {
        dateSpans[key] = dateSpan
      }
    }

    return dateSpans
  }

  private _getKeysForEventDefs(eventStore: EventStore, ...extraArgs: ExtraArgs) {
    return mapHash(eventStore.defs, (eventDef: EventDef) => {
      return this.getKeysForEventDef(eventDef, ...extraArgs)
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
  will always create a default '' hash
  */
  private _splitEventUiBases(eventUiBases: EventUiHash, keysByDefId): { [key: string]: EventUiHash } {
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

    if (eventUiBases['']) {

      // make sure each keyed hash has the fallback eventUiBase
      for (let key in splitHashes) {
        splitHashes[key][''] = eventUiBases['']
      }

      // ensure a default hash, which ONLY has the fallback eventUiBase
      splitHashes[''] = { '': eventUiBases[''] }
    } else {
      splitHashes[''] = {}
    }

    return splitHashes
  }

  private _splitInteraction(interaction: EventInteractionState | null, keysByDefId, ...extraArgs: ExtraArgs): { [key: string]: EventInteractionState } {
    let splitStates: { [key: string]: EventInteractionState } = {}

    if (interaction) {
      let affectedStores = this._splitEventStore(interaction.affectedEvents, keysByDefId)

      // can't rely on keysByDefId because event data is mutated
      let mutatedKeysByDefId = this._getKeysForEventDefs(interaction.mutatedEvents, ...extraArgs)
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
