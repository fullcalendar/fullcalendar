import { EventStore, createEmptyEventStore } from '../structs/event-store'
import { EventDef } from '../structs/event-def'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { mapHash } from '../util/object'
import { memoize } from '../util/memoize'
import { EventUiBases, EventUi, combineEventUis } from './event-ui'
import { DateSpan } from '../structs/date-span'

export interface SplittableProps {
  businessHours: EventStore | null // is this really allowed to be null?
  dateSelection: DateSpan | null
  eventStore: EventStore
  eventUiBases: EventUiBases
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
  eventSelection: string
}

const EMPTY_EVENT_STORE = createEmptyEventStore() // for purecomponents. TODO: keep elsewhere

export abstract class Splitter<PropsType extends SplittableProps = SplittableProps> {
  private getKeysForEventDefs = memoize(this._getKeysForEventDefs)
  private splitDateSelection = memoize(this._splitDateSpan)
  private splitEventStore = memoize(this._splitEventStore)
  private splitEventDrag = memoize(this._splitInteraction)
  private splitEventResize = memoize(this._splitInteraction)
  private eventUiBuilders = {} // TODO: typescript protection

  abstract getKeyInfo(props: PropsType): { [key: string]: { ui?: EventUi, businessHours?: EventStore } }
  abstract getKeysForDateSpan(dateSpan: DateSpan): string[]
  abstract getKeysForEventDef(eventDef: EventDef): string[]

  splitProps(props: PropsType): { [key: string]: SplittableProps } {
    let keyInfos = this.getKeyInfo(props)
    let defKeys = this.getKeysForEventDefs(props.eventStore)
    let dateSelections = this.splitDateSelection(props.dateSelection)
    let eventStores = this.splitEventStore(props.eventStore, defKeys)
    let eventDrags = this.splitEventDrag(props.eventDrag)
    let eventResizes = this.splitEventResize(props.eventResize)
    let splitProps: { [key: string]: SplittableProps } = {}

    this.eventUiBuilders = mapHash(keyInfos, (info, key) => this.eventUiBuilders[key] || memoize(buildSectionEventUiBases))

    for (let key in keyInfos) {
      let keyInfo = keyInfos[key]
      let eventStore = eventStores[key] || EMPTY_EVENT_STORE
      let buildEventUi = this.eventUiBuilders[key]

      splitProps[key] = {
        businessHours: keyInfo.businessHours || props.businessHours,
        dateSelection: dateSelections[key] || null,
        eventStore,
        eventUiBases: buildEventUi(props.eventUiBases, keyInfo.ui),
        eventDrag: eventDrags[key] || null,
        eventResize: eventResizes[key] || null,
        eventSelection: eventStore.instances[props.eventSelection] ? props.eventSelection : '',
      }
    }

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
    return mapHash(eventStore.defs, (eventDef: EventDef) => this.getKeysForEventDef(eventDef))
  }

  private _splitEventStore(eventStore: EventStore, defKeys): { [key: string]: EventStore } {
    let { defs, instances } = eventStore
    let splitStores = {}

    for (let defId in defs) {
      for (let key of defKeys[defId]) {
        if (!splitStores[key]) {
          splitStores[key] = createEmptyEventStore()
        }

        splitStores[key].defs[defId] = defs[defId]
      }
    }

    for (let instanceId in instances) {
      let instance = instances[instanceId]

      for (let key of defKeys[instance.defId]) {
        if (splitStores[key]) { // must have already been created
          splitStores[key].instances[instanceId] = instance
        }
      }
    }

    return splitStores
  }

  private _splitInteraction(interaction: EventInteractionState | null): { [key: string]: EventInteractionState } {
    let splitStates: { [key: string]: EventInteractionState } = {}

    if (interaction) {
      let affectedStores = this._splitEventStore(
        interaction.affectedEvents,
        this._getKeysForEventDefs(interaction.affectedEvents), // can't use cached. might be events from other calendar
      )

      // can't rely on defKeys because event data is mutated
      let mutatedKeysByDefId = this._getKeysForEventDefs(interaction.mutatedEvents)
      let mutatedStores = this._splitEventStore(interaction.mutatedEvents, mutatedKeysByDefId)

      let populate = (key) => {
        if (!splitStates[key]) {
          splitStates[key] = {
            affectedEvents: affectedStores[key] || EMPTY_EVENT_STORE,
            mutatedEvents: mutatedStores[key] || EMPTY_EVENT_STORE,
            isEvent: interaction.isEvent,
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

/*
A section's bases are its parent's, plus the section's own UI, such as a resource's. Splitters can nest,
like a resource time grid's resources and its all-day and timed areas, so the section UIs combine.
*/
function buildSectionEventUiBases(eventUiBases: EventUiBases, sectionUi: EventUi | undefined): EventUiBases {
  if (!sectionUi) {
    return eventUiBases
  }

  return {
    ...eventUiBases,
    sectionUi: eventUiBases.sectionUi
      ? combineEventUis([eventUiBases.sectionUi, sectionUi])
      : sectionUi,
  }
}
