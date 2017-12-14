import * as $ from 'jquery'
import { removeExact } from '../util'
import EventPeriod from './EventPeriod'
import ArrayEventSource from './event-source/ArrayEventSource'
import EventSource from './event-source/EventSource'
import EventSourceParser from './event-source/EventSourceParser'
import SingleEventDef from './event/SingleEventDef'
import EventInstanceGroup from './event/EventInstanceGroup'
import { default as EmitterMixin, EmitterInterface } from '../common/EmitterMixin'
import { default as ListenerMixin, ListenerInterface } from '../common/ListenerMixin'


export default class EventManager {

  on: EmitterInterface['on']
  one: EmitterInterface['one']
  off: EmitterInterface['off']
  trigger: EmitterInterface['trigger']
  triggerWith: EmitterInterface['triggerWith']
  hasHandlers: EmitterInterface['hasHandlers']
  listenTo: ListenerInterface['listenTo']
  stopListeningTo: ListenerInterface['stopListeningTo']

  currentPeriod: any

  calendar: any
  stickySource: any
  otherSources: any // does not include sticky source


  constructor(calendar) {
    this.calendar = calendar
    this.stickySource = new ArrayEventSource(calendar)
    this.otherSources = []
  }


  requestEvents(start, end, timezone, force) {
    if (
      force ||
      !this.currentPeriod ||
      !this.currentPeriod.isWithinRange(start, end) ||
      timezone !== this.currentPeriod.timezone
    ) {
      this.setPeriod( // will change this.currentPeriod
        new EventPeriod(start, end, timezone)
      )
    }

    return this.currentPeriod.whenReleased()
  }


  // Source Adding/Removing
  // -----------------------------------------------------------------------------------------------------------------


  addSource(eventSource) {
    this.otherSources.push(eventSource)

    if (this.currentPeriod) {
      this.currentPeriod.requestSource(eventSource) // might release
    }
  }


  removeSource(doomedSource) {
    removeExact(this.otherSources, doomedSource)

    if (this.currentPeriod) {
      this.currentPeriod.purgeSource(doomedSource) // might release
    }
  }


  removeAllSources() {
    this.otherSources = []

    if (this.currentPeriod) {
      this.currentPeriod.purgeAllSources() // might release
    }
  }


  // Source Refetching
  // -----------------------------------------------------------------------------------------------------------------


  refetchSource(eventSource) {
    let currentPeriod = this.currentPeriod

    if (currentPeriod) {
      currentPeriod.freeze()
      currentPeriod.purgeSource(eventSource)
      currentPeriod.requestSource(eventSource)
      currentPeriod.thaw()
    }
  }


  refetchAllSources() {
    let currentPeriod = this.currentPeriod

    if (currentPeriod) {
      currentPeriod.freeze()
      currentPeriod.purgeAllSources()
      currentPeriod.requestSources(this.getSources())
      currentPeriod.thaw()
    }
  }


  // Source Querying
  // -----------------------------------------------------------------------------------------------------------------


  getSources() {
    return [ this.stickySource ].concat(this.otherSources)
  }


  // like querySources, but accepts multple match criteria (like multiple IDs)
  multiQuerySources(matchInputs) {

    // coerce into an array
    if (!matchInputs) {
      matchInputs = []
    } else if (!$.isArray(matchInputs)) {
      matchInputs = [ matchInputs ]
    }

    let matchingSources = []
    let i

    // resolve raw inputs to real event source objects
    for (i = 0; i < matchInputs.length; i++) {
      matchingSources.push.apply( // append
        matchingSources,
        this.querySources(matchInputs[i])
      )
    }

    return matchingSources
  }


  // matchInput can either by a real event source object, an ID, or the function/URL for the source.
  // returns an array of matching source objects.
  querySources(matchInput) {
    let sources = this.otherSources
    let i
    let source

    // given a proper event source object
    for (i = 0; i < sources.length; i++) {
      source = sources[i]

      if (source === matchInput) {
        return [ source ]
      }
    }

    // an ID match
    source = this.getSourceById(EventSource.normalizeId(matchInput))
    if (source) {
      return [ source ]
    }

    // parse as an event source
    matchInput = EventSourceParser.parse(matchInput, this.calendar)
    if (matchInput) {

      return $.grep(sources, function(source) {
        return isSourcesEquivalent(matchInput, source)
      })
    }
  }


  /*
  ID assumed to already be normalized
  */
  getSourceById(id) {
    return $.grep(this.otherSources, function(source: any) {
      return source.id && source.id === id
    })[0]
  }


  // Event-Period
  // -----------------------------------------------------------------------------------------------------------------


  setPeriod(eventPeriod) {
    if (this.currentPeriod) {
      this.unbindPeriod(this.currentPeriod)
      this.currentPeriod = null
    }

    this.currentPeriod = eventPeriod
    this.bindPeriod(eventPeriod)

    eventPeriod.requestSources(this.getSources())
  }


  bindPeriod(eventPeriod) {
    this.listenTo(eventPeriod, 'release', function(eventsPayload) {
      this.trigger('release', eventsPayload)
    })
  }


  unbindPeriod(eventPeriod) {
    this.stopListeningTo(eventPeriod)
  }


  // Event Getting/Adding/Removing
  // -----------------------------------------------------------------------------------------------------------------


  getEventDefByUid(uid) {
    if (this.currentPeriod) {
      return this.currentPeriod.getEventDefByUid(uid)
    }
  }


  addEventDef(eventDef, isSticky) {
    if (isSticky) {
      this.stickySource.addEventDef(eventDef)
    }

    if (this.currentPeriod) {
      this.currentPeriod.addEventDef(eventDef) // might release
    }
  }


  removeEventDefsById(eventId) {
    this.getSources().forEach(function(eventSource) {
      eventSource.removeEventDefsById(eventId)
    })

    if (this.currentPeriod) {
      this.currentPeriod.removeEventDefsById(eventId) // might release
    }
  }


  removeAllEventDefs() {
    this.getSources().forEach(function(eventSource) {
      eventSource.removeAllEventDefs()
    })

    if (this.currentPeriod) {
      this.currentPeriod.removeAllEventDefs()
    }
  }


  // Event Mutating
  // -----------------------------------------------------------------------------------------------------------------


  /*
  Returns an undo function.
  */
  mutateEventsWithId(eventDefId, eventDefMutation) {
    let currentPeriod = this.currentPeriod
    let eventDefs
    let undoFuncs = []

    if (currentPeriod) {

      currentPeriod.freeze()

      eventDefs = currentPeriod.getEventDefsById(eventDefId)
      eventDefs.forEach(function(eventDef) {
        // add/remove esp because id might change
        currentPeriod.removeEventDef(eventDef)
        undoFuncs.push(eventDefMutation.mutateSingle(eventDef))
        currentPeriod.addEventDef(eventDef)
      })

      currentPeriod.thaw()

      return function() {
        currentPeriod.freeze()

        for (let i = 0; i < eventDefs.length; i++) {
          currentPeriod.removeEventDef(eventDefs[i])
          undoFuncs[i]()
          currentPeriod.addEventDef(eventDefs[i])
        }

        currentPeriod.thaw()
      }
    }

    return function() { /* nothing to undo */ }
  }


  /*
  copies and then mutates
  */
  buildMutatedEventInstanceGroup(eventDefId, eventDefMutation) {
    let eventDefs = this.getEventDefsById(eventDefId)
    let i
    let defCopy
    let allInstances = []

    for (i = 0; i < eventDefs.length; i++) {
      defCopy = eventDefs[i].clone()

      if (defCopy instanceof SingleEventDef) {
        eventDefMutation.mutateSingle(defCopy)

        allInstances.push.apply(allInstances, // append
          defCopy.buildInstances()
        )
      }
    }

    return new EventInstanceGroup(allInstances)
  }


  // Freezing
  // -----------------------------------------------------------------------------------------------------------------


  freeze() {
    if (this.currentPeriod) {
      this.currentPeriod.freeze()
    }
  }


  thaw() {
    if (this.currentPeriod) {
      this.currentPeriod.thaw()
    }
  }


  // methods that simply forward to EventPeriod

  getEventDefsById(eventDefId) {
    return this.currentPeriod.getEventDefsById(eventDefId)
  }

  getEventInstances() {
    return this.currentPeriod.getEventInstances()
  }

  getEventInstancesWithId(eventDefId) {
    return this.currentPeriod.getEventInstancesWithId(eventDefId)
  }

  getEventInstancesWithoutId(eventDefId) {
    return this.currentPeriod.getEventInstancesWithoutId(eventDefId)
  }

}


EmitterMixin.mixInto(EventManager)
ListenerMixin.mixInto(EventManager)


function isSourcesEquivalent(source0, source1) {
  return source0.getPrimitive() === source1.getPrimitive()
}
