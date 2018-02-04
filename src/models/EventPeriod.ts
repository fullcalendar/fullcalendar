import * as $ from 'jquery'
import * as moment from 'moment'
import { removeExact, removeMatching } from '../util'
import Promise from '../common/Promise'
import { default as EmitterMixin, EmitterInterface } from '../common/EmitterMixin'
import UnzonedRange from './UnzonedRange'
import EventInstanceGroup from './event/EventInstanceGroup'


export default class EventPeriod {

  on: EmitterInterface['on']
  one: EmitterInterface['one']
  off: EmitterInterface['off']
  trigger: EmitterInterface['trigger']
  triggerWith: EmitterInterface['triggerWith']
  hasHandlers: EmitterInterface['hasHandlers']

  start: moment.Moment
  end: moment.Moment
  timezone: any

  unzonedRange: UnzonedRange

  requestsByUid: any
  pendingCnt: number = 0

  freezeDepth: number = 0
  stuntedReleaseCnt: number = 0
  releaseCnt: number = 0

  eventDefsByUid: any
  eventDefsById: any
  eventInstanceGroupsById: any


  constructor(start, end, timezone) {
    this.start = start
    this.end = end
    this.timezone = timezone

    this.unzonedRange = new UnzonedRange(
      start.clone().stripZone(),
      end.clone().stripZone()
    )

    this.requestsByUid = {}
    this.eventDefsByUid = {}
    this.eventDefsById = {}
    this.eventInstanceGroupsById = {}
  }


  isWithinRange(start, end) {
    // TODO: use a range util function?
    return !start.isBefore(this.start) && !end.isAfter(this.end)
  }


  // Requesting and Purging
  // -----------------------------------------------------------------------------------------------------------------


  requestSources(sources) {
    this.freeze()

    for (let i = 0; i < sources.length; i++) {
      this.requestSource(sources[i])
    }

    this.thaw()
  }


  requestSource(source) {
    let request = { source: source, status: 'pending', eventDefs: null }

    this.requestsByUid[source.uid] = request
    this.pendingCnt += 1

    source.fetch(this.start, this.end, this.timezone).then((eventDefs) => {
      if (request.status !== 'cancelled') {
        request.status = 'completed'
        request.eventDefs = eventDefs

        this.addEventDefs(eventDefs)
        this.pendingCnt--
        this.tryRelease()
      }
    }, () => { // failure
      if (request.status !== 'cancelled') {
        request.status = 'failed'

        this.pendingCnt--
        this.tryRelease()
      }
    })
  }


  purgeSource(source) {
    let request = this.requestsByUid[source.uid]

    if (request) {
      delete this.requestsByUid[source.uid]

      if (request.status === 'pending') {
        request.status = 'cancelled'
        this.pendingCnt--
        this.tryRelease()
      } else if (request.status === 'completed') {
        request.eventDefs.forEach(this.removeEventDef.bind(this))
      }
    }
  }


  purgeAllSources() {
    let requestsByUid = this.requestsByUid
    let uid
    let request
    let completedCnt = 0

    for (uid in requestsByUid) {
      request = requestsByUid[uid]

      if (request.status === 'pending') {
        request.status = 'cancelled'
      } else if (request.status === 'completed') {
        completedCnt++
      }
    }

    this.requestsByUid = {}
    this.pendingCnt = 0

    if (completedCnt) {
      this.removeAllEventDefs() // might release
    }
  }


  // Event Definitions
  // -----------------------------------------------------------------------------------------------------------------


  getEventDefByUid(eventDefUid) {
    return this.eventDefsByUid[eventDefUid]
  }


  getEventDefsById(eventDefId) {
    let a = this.eventDefsById[eventDefId]

    if (a) {
      return a.slice() // clone
    }

    return []
  }


  addEventDefs(eventDefs) {
    for (let i = 0; i < eventDefs.length; i++) {
      this.addEventDef(eventDefs[i])
    }
  }


  addEventDef(eventDef) {
    let eventDefsById = this.eventDefsById
    let eventDefId = eventDef.id
    let eventDefs = eventDefsById[eventDefId] || (eventDefsById[eventDefId] = [])
    let eventInstances = eventDef.buildInstances(this.unzonedRange)
    let i

    eventDefs.push(eventDef)

    this.eventDefsByUid[eventDef.uid] = eventDef

    for (i = 0; i < eventInstances.length; i++) {
      this.addEventInstance(eventInstances[i], eventDefId)
    }
  }


  removeEventDefsById(eventDefId) {
    this.getEventDefsById(eventDefId).forEach((eventDef) => {
      this.removeEventDef(eventDef)
    })
  }


  removeAllEventDefs() {
    let isEmpty = $.isEmptyObject(this.eventDefsByUid)

    this.eventDefsByUid = {}
    this.eventDefsById = {}
    this.eventInstanceGroupsById = {}

    if (!isEmpty) {
      this.tryRelease()
    }
  }


  removeEventDef(eventDef) {
    let eventDefsById = this.eventDefsById
    let eventDefs = eventDefsById[eventDef.id]

    delete this.eventDefsByUid[eventDef.uid]

    if (eventDefs) {
      removeExact(eventDefs, eventDef)

      if (!eventDefs.length) {
        delete eventDefsById[eventDef.id]
      }

      this.removeEventInstancesForDef(eventDef)
    }
  }


  // Event Instances
  // -----------------------------------------------------------------------------------------------------------------


  getEventInstances() { // TODO: consider iterator
    let eventInstanceGroupsById = this.eventInstanceGroupsById
    let eventInstances = []
    let id

    for (id in eventInstanceGroupsById) {
      eventInstances.push.apply(eventInstances, // append
        eventInstanceGroupsById[id].eventInstances
      )
    }

    return eventInstances
  }


  getEventInstancesWithId(eventDefId) {
    let eventInstanceGroup = this.eventInstanceGroupsById[eventDefId]

    if (eventInstanceGroup) {
      return eventInstanceGroup.eventInstances.slice() // clone
    }

    return []
  }


  getEventInstancesWithoutId(eventDefId) { // TODO: consider iterator
    let eventInstanceGroupsById = this.eventInstanceGroupsById
    let matchingInstances = []
    let id

    for (id in eventInstanceGroupsById) {
      if (id !== eventDefId) {
        matchingInstances.push.apply(matchingInstances, // append
          eventInstanceGroupsById[id].eventInstances
        )
      }
    }

    return matchingInstances
  }


  addEventInstance(eventInstance, eventDefId) {
    let eventInstanceGroupsById = this.eventInstanceGroupsById
    let eventInstanceGroup = eventInstanceGroupsById[eventDefId] ||
      (eventInstanceGroupsById[eventDefId] = new EventInstanceGroup())

    eventInstanceGroup.eventInstances.push(eventInstance)

    this.tryRelease()
  }


  removeEventInstancesForDef(eventDef) {
    let eventInstanceGroupsById = this.eventInstanceGroupsById
    let eventInstanceGroup = eventInstanceGroupsById[eventDef.id]
    let removeCnt

    if (eventInstanceGroup) {
      removeCnt = removeMatching(eventInstanceGroup.eventInstances, function(currentEventInstance) {
        return currentEventInstance.def === eventDef
      })

      if (!eventInstanceGroup.eventInstances.length) {
        delete eventInstanceGroupsById[eventDef.id]
      }

      if (removeCnt) {
        this.tryRelease()
      }
    }
  }


  // Releasing and Freezing
  // -----------------------------------------------------------------------------------------------------------------


  tryRelease() {
    if (!this.pendingCnt) {
      if (!this.freezeDepth) {
        this.release()
      } else {
        this.stuntedReleaseCnt++
      }
    }
  }


  release() {
    this.releaseCnt++
    this.trigger('release', this.eventInstanceGroupsById)
  }


  whenReleased() {
    if (this.releaseCnt) {
      return Promise.resolve(this.eventInstanceGroupsById)
    } else {
      return Promise.construct((onResolve) => {
        this.one('release', onResolve)
      })
    }
  }


  freeze() {
    if (!(this.freezeDepth++)) {
      this.stuntedReleaseCnt = 0
    }
  }


  thaw() {
    if (!(--this.freezeDepth) && this.stuntedReleaseCnt && !this.pendingCnt) {
      this.release()
    }
  }

}

EmitterMixin.mixInto(EventPeriod)
