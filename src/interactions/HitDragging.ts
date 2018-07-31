import EmitterMixin from '../common/EmitterMixin'
import { PointerDragEvent } from '../dnd/PointerDragging'
import ElementDragging from '../dnd/ElementDragging'
import DateComponent, { DateComponentHash } from '../component/DateComponent'
import { DateSpan, isDateSpansEqual } from '../reducers/date-span'
import { computeRect } from '../util/dom-geom'
import { constrainPoint, intersectRects, getRectCenter, diffPoints, Rect } from '../util/geom'

export interface Hit {
  component: DateComponent
  dateSpan: DateSpan
  dayEl: HTMLElement
  rect: Rect
}

/*
fires (none will be fired if no initial hit):
- pointerdown
- dragstart
- hitover - always fired in beginning
- hitout - only fired when pointer moves away. not fired at drag end
- pointerup
- dragend
*/
export default class HitDragging {

  droppableHash: DateComponentHash
  dragging: ElementDragging
  emitter: EmitterMixin

  // options that can be set by caller
  useSubjectCenter: boolean = false
  requireInitial: boolean = true

  // internal state
  initialHit: Hit
  movingHit: Hit
  finalHit: Hit // won't ever be populated if shouldIgnoreMove
  coordAdjust: any

  constructor(dragging: ElementDragging, droppable: DateComponent | DateComponentHash) {

    if (droppable instanceof DateComponent) {
      this.droppableHash = { [droppable.uid]: droppable }
    } else {
      this.droppableHash = droppable
    }

    dragging.emitter.on('pointerdown', this.handlePointerDown)
    dragging.emitter.on('dragstart', this.handleDragStart)
    dragging.emitter.on('dragmove', this.handleDragMove)
    dragging.emitter.on('pointerup', this.handlePointerUp)
    dragging.emitter.on('dragend', this.handleDragEnd)

    this.dragging = dragging
    this.emitter = new EmitterMixin()
  }

  handlePointerDown = (ev: PointerDragEvent) => {
    let { dragging } = this

    this.initialHit = null
    this.movingHit = null
    this.finalHit = null

    this.prepareComponents()
    this.processFirstCoord(ev)

    if (this.initialHit || !this.requireInitial) {
      dragging.setIgnoreMove(false)
      this.emitter.trigger('pointerdown', ev)
    } else {
      dragging.setIgnoreMove(true)
    }
  }

  // sets initialHit
  // sets coordAdjust
  processFirstCoord(ev: PointerDragEvent) {
    let origPoint = { left: ev.pageX, top: ev.pageY }
    let adjustedPoint = origPoint
    let subjectEl = ev.subjectEl
    let subjectRect

    if (subjectEl !== document) {
      subjectRect = computeRect(subjectEl)
      adjustedPoint = constrainPoint(adjustedPoint, subjectRect)
    }

    let initialHit = this.initialHit = this.queryHit(adjustedPoint.left, adjustedPoint.top)

    if (initialHit) {
      if (this.useSubjectCenter && subjectRect) {
        let slicedSubjectRect = intersectRects(subjectRect, initialHit.rect)
        if (slicedSubjectRect) {
          adjustedPoint = getRectCenter(slicedSubjectRect)
        }
      }

      this.coordAdjust = diffPoints(adjustedPoint, origPoint)
    } else {
      this.coordAdjust = { left: 0, top: 0 }
    }
  }

  handleDragStart = (ev: PointerDragEvent) => {
    this.emitter.trigger('dragstart', ev)
    this.handleMove(ev)
  }

  handleDragMove = (ev: PointerDragEvent) => {
    this.emitter.trigger('dragmove', ev)
    this.handleMove(ev)
  }

  handlePointerUp = (ev: PointerDragEvent) => {
    this.emitter.trigger('pointerup', ev)
  }

  handleDragEnd = (ev: PointerDragEvent) => {
    this.finalHit = this.movingHit
    this.movingHit = null
    this.emitter.trigger('dragend', ev)
  }

  handleMove(ev: PointerDragEvent) {
    let hit = this.queryHit(
      ev.pageX + this.coordAdjust.left,
      ev.pageY + this.coordAdjust.top
    )

    if (!this.movingHit || !isHitsEqual(this.movingHit, hit)) {

      if (this.movingHit) {
        this.emitter.trigger('hitout', this.movingHit, ev)
        this.movingHit = null
      }

      if (hit) {
        this.movingHit = hit
        this.emitter.trigger('hitover', hit, ev)
      }
    }
  }

  prepareComponents() {
    for (let id in this.droppableHash) {
      let component = this.droppableHash[id]
      component.buildCoordCaches()
    }
  }

  queryHit(x, y): Hit {
    for (let id in this.droppableHash) {
      let component = this.droppableHash[id]
      let hit = component.queryHit(x, y)

      if (hit) {
        return hit
      }
    }
  }

}

export function isHitsEqual(hit0: Hit, hit1: Hit) {
  if (!hit0 && !hit1) {
    return true
  }

  if (Boolean(hit0) !== Boolean(hit1)) {
    return false
  }

  return isDateSpansEqual(hit0.dateSpan, hit1.dateSpan)
}
