import * as $ from 'jquery'
import {
  default as ParsableModelMixin,
  ParsableModelInterface
} from '../../common/ParsableModelMixin'


export default abstract class EventDef {

  static uuid: number = 0
  static defineStandardProps = ParsableModelMixin.defineStandardProps
  static copyVerbatimStandardProps = ParsableModelMixin.copyVerbatimStandardProps

  applyProps: ParsableModelInterface['applyProps']
  isStandardProp: ParsableModelInterface['isStandardProp']

  source: any // required

  id: any // normalized supplied ID
  rawId: any // unnormalized supplied ID
  uid: any // internal ID. new ID for every definition

  // NOTE: eventOrder sorting relies on these
  title: any
  url: any
  rendering: any
  constraint: any
  overlap: any
  editable: any
  startEditable: any
  durationEditable: any
  color: any
  backgroundColor: any
  borderColor: any
  textColor: any

  className: any // an array. TODO: rename to className*s* (API breakage)
  miscProps: any


  constructor(source) {
    this.source = source
    this.className = []
    this.miscProps = {}
  }


  static parse(rawInput, source) {
    let def = new (this as any)(source)

    if (def.applyProps(rawInput)) {
      return def
    }

    return false
  }


  static normalizeId(id) { // TODO: converge with EventSource
    return String(id)
  }


  static generateId() {
    return '_fc' + (EventDef.uuid++)
  }


  abstract isAllDay() // subclasses must implement

  abstract buildInstances(unzonedRange) // subclasses must implement


  clone() {
    let copy = new (this.constructor as any)(this.source)

    copy.id = this.id
    copy.rawId = this.rawId
    copy.uid = this.uid // not really unique anymore :(

    EventDef.copyVerbatimStandardProps(this, copy)

    copy.className = this.className.slice() // copy
    copy.miscProps = $.extend({}, this.miscProps)

    return copy
  }


  hasInverseRendering() {
    return this.getRendering() === 'inverse-background'
  }


  hasBgRendering() {
    let rendering = this.getRendering()

    return rendering === 'inverse-background' || rendering === 'background'
  }


  getRendering() {
    if (this.rendering != null) {
      return this.rendering
    }

    return this.source.rendering
  }


  getConstraint() {
    if (this.constraint != null) {
      return this.constraint
    }

    if (this.source.constraint != null) {
      return this.source.constraint
    }

    return this.source.calendar.opt('eventConstraint') // what about View option?
  }


  getOverlap() {
    if (this.overlap != null) {
      return this.overlap
    }

    if (this.source.overlap != null) {
      return this.source.overlap
    }

    return this.source.calendar.opt('eventOverlap') // what about View option?
  }


  isStartExplicitlyEditable() {
    if (this.startEditable != null) {
      return this.startEditable
    }

    return this.source.startEditable
  }


  isDurationExplicitlyEditable() {
    if (this.durationEditable != null) {
      return this.durationEditable
    }

    return this.source.durationEditable
  }


  isExplicitlyEditable() {
    if (this.editable != null) {
      return this.editable
    }

    return this.source.editable
  }


  toLegacy() {
    let obj = $.extend({}, this.miscProps)

    obj._id = this.uid
    obj.source = this.source
    obj.className = this.className.slice() // copy
    obj.allDay = this.isAllDay()

    if (this.rawId != null) {
      obj.id = this.rawId
    }

    EventDef.copyVerbatimStandardProps(this, obj)

    return obj
  }


  applyManualStandardProps(rawProps) {

    if (rawProps.id != null) {
      this.id = EventDef.normalizeId((this.rawId = rawProps.id))
    } else {
      this.id = EventDef.generateId()
    }

    if (rawProps._id != null) { // accept this prop, even tho somewhat internal
      this.uid = String(rawProps._id)
    } else {
      this.uid = EventDef.generateId()
    }

    // TODO: converge with EventSource
    if ($.isArray(rawProps.className)) {
      this.className = rawProps.className
    }
    if (typeof rawProps.className === 'string') {
      this.className = rawProps.className.split(/\s+/)
    }

    return true
  }


  applyMiscProps(rawProps) {
    $.extend(this.miscProps, rawProps)
  }

}

ParsableModelMixin.mixInto(EventDef)

EventDef.defineStandardProps({
  // not automatically assigned (`false`)
  _id: false,
  id: false,
  className: false,
  source: false, // will ignored

  // automatically assigned (`true`)
  title: true,
  url: true,
  rendering: true,
  constraint: true,
  overlap: true,
  editable: true,
  startEditable: true,
  durationEditable: true,
  color: true,
  backgroundColor: true,
  borderColor: true,
  textColor: true
})
