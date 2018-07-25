import EmitterMixin from '../common/EmitterMixin'
import { PointerDragEvent } from './PointerDragListener'
import IntentfulDragListener from './IntentfulDragListener'
import DateComponent, { DateComponentHash } from '../component/DateComponent'
import { Selection } from '../reducers/selection'
import { computeRect } from '../util/dom-geom'
import { constrainPoint, intersectRects, getRectCenter, diffPoints } from '../util/geom'

export interface Hit extends Selection {
  component: DateComponent
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
export default class HitDragListener {

  component: DateComponent
  droppableComponentHash: DateComponentHash
  dragListener: IntentfulDragListener
  emitter: EmitterMixin
  initialHit: Hit
  movingHit: Hit
  finalHit: Hit // won't ever be populated if ignoreMove
  coordAdjust: any

  // options
  subjectCenter: boolean = false

  constructor(component: DateComponent, droppableComponentHash?: DateComponentHash) {
    this.component = component
    this.droppableComponentHash = droppableComponentHash

    if (droppableComponentHash) {
      this.droppableComponentHash = droppableComponentHash
    } else {
      this.droppableComponentHash = { [component.uid]: component }
    }

    let dragListener = this.dragListener = new IntentfulDragListener(component.el)
    dragListener.on('pointerdown', this.onPointerDown)
    dragListener.on('dragstart', this.onDragStart)
    dragListener.on('dragmove', this.onDragMove)
    dragListener.on('pointerup', this.onPointerUp)
    dragListener.on('dragend', this.onDragEnd)

    this.emitter = new EmitterMixin()
  }

  destroy() {
    this.dragListener.destroy()
  }

  on(name, handler) {
    this.emitter.on(name, handler)
  }

  onPointerDown = (ev: PointerDragEvent) => {
    this.initialHit = null
    this.movingHit = null
    this.finalHit = null

    this.prepareComponents()
    this.processFirstCoord(ev)

    let { pointerListener } = this.dragListener

    if (this.initialHit) {
      pointerListener.ignoreMove = false
      this.emitter.trigger('pointerdown', ev)
    } else {
      pointerListener.ignoreMove = true
    }
  }

  // sets initialHit
  // sets coordAdjust
  processFirstCoord(ev: PointerDragEvent) {
    let origPoint = { left: ev.pageX, top: ev.pageY }
    let adjustedPoint = origPoint
    let subjectEl = ev.el as HTMLElement
    let subjectRect

    if (subjectEl !== (document as any)) {
      subjectRect = computeRect(subjectEl)
      adjustedPoint = constrainPoint(adjustedPoint, subjectRect)
    }

    let initialHit = this.initialHit = this.queryHit(adjustedPoint.left, adjustedPoint.top)

    if (initialHit) {
      if (this.subjectCenter && subjectRect) {
        let slicedSubjectRect = intersectRects(subjectRect, initialHit.rect)
        if (slicedSubjectRect) {
          adjustedPoint = getRectCenter(slicedSubjectRect)
        }
      }

      this.coordAdjust = diffPoints(adjustedPoint, origPoint)
    }
  }

  onDragStart = (ev: PointerDragEvent) => {
    this.emitter.trigger('dragstart', ev)
    this.handleMove(ev)
  }

  onDragMove = (ev: PointerDragEvent) => {
    this.emitter.trigger('dragmove', ev)
    this.handleMove(ev)
  }

  onPointerUp = (ev: PointerDragEvent) => {
    let { pointerListener } = this.dragListener

    if (!pointerListener.ignoreMove) { // cancelled in onPointerDown?
      this.emitter.trigger('pointerup', ev)
    }
  }

  onDragEnd = (ev: PointerDragEvent) => {
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
    for (let id in this.droppableComponentHash) {
      let component = this.droppableComponentHash[id]
      component.buildCoordCaches()
    }
  }

  queryHit(x, y): Hit {
    for (let id in this.droppableComponentHash) {
      let component = this.droppableComponentHash[id]
      let hit = component.queryHit(x, y) as Hit

      if (hit) {
        hit.component = component
        return hit
      }
    }
  }

}

export function isHitsEqual(hit0: Selection, hit1: Selection) {
  if (!hit0 && !hit1) {
    return true
  }

  if (Boolean(hit0) !== Boolean(hit1)) {
    return false
  }

  if (!hit0.range.equals(hit1.range)) {
    return false
  }

  for (let propName in hit1) {
    if (propName !== 'range' && propName !== 'component' && propName !== 'rect') {
      if (hit0[propName] !== hit1[propName]) {
        return false
      }
    }
  }

  for (let propName in hit0) {
    if (!(propName in hit1)) {
      return false
    }
  }

  return true
}
