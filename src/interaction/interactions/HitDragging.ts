import {
  EmitterMixin, PointerDragEvent,
  isDateSpansEqual,
  computeRect,
  constrainPoint, intersectRects, getRectCenter, diffPoints, Point,
  rangeContainsRange,
  Hit,
  InteractionSettingsStore,
  mapHash,
  ElementDragging
} from '@fullcalendar/core'
import OffsetTracker from '../OffsetTracker'

/*
Tracks movement over multiple droppable areas (aka "hits")
that exist in one or more DateComponents.
Relies on an existing draggable.

emits:
- pointerdown
- dragstart
- hitchange - fires initially, even if not over a hit
- pointerup
- (hitchange - again, to null, if ended over a hit)
- dragend
*/
export default class HitDragging {

  droppableStore: InteractionSettingsStore
  dragging: ElementDragging
  emitter: EmitterMixin

  // options that can be set by caller
  useSubjectCenter: boolean = false
  requireInitial: boolean = true // if doesn't start out on a hit, won't emit any events

  // internal state
  offsetTrackers: { [componentUid: string]: OffsetTracker }
  initialHit: Hit | null = null
  movingHit: Hit | null = null
  finalHit: Hit | null = null // won't ever be populated if shouldIgnoreMove
  coordAdjust?: Point

  constructor(dragging: ElementDragging, droppableStore: InteractionSettingsStore) {
    this.droppableStore = droppableStore

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

    this.prepareHits()
    this.processFirstCoord(ev)

    if (this.initialHit || !this.requireInitial) {
      dragging.setIgnoreMove(false)
      this.emitter.trigger('pointerdown', ev) // TODO: fire this before computing processFirstCoord, so listeners can cancel. this gets fired by almost every handler :(
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

    let initialHit = this.initialHit = this.queryHitForOffset(adjustedPoint.left, adjustedPoint.top)

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
    this.handleMove(ev, true) // force = fire even if initially null
  }

  handleDragMove = (ev: PointerDragEvent) => {
    this.emitter.trigger('dragmove', ev)
    this.handleMove(ev)
  }

  handlePointerUp = (ev: PointerDragEvent) => {
    this.releaseHits()
    this.emitter.trigger('pointerup', ev)
  }

  handleDragEnd = (ev: PointerDragEvent) => {
    if (this.movingHit) {
      this.emitter.trigger('hitupdate', null, true, ev)
    }

    this.finalHit = this.movingHit
    this.movingHit = null
    this.emitter.trigger('dragend', ev)
  }

  handleMove(ev: PointerDragEvent, forceHandle?: boolean) {
    let hit = this.queryHitForOffset(
      ev.pageX + this.coordAdjust!.left,
      ev.pageY + this.coordAdjust!.top
    )

    if (forceHandle || !isHitsEqual(this.movingHit, hit)) {
      this.movingHit = hit
      this.emitter.trigger('hitupdate', hit, false, ev)
    }
  }

  prepareHits() {
    this.offsetTrackers = mapHash(this.droppableStore, function(interactionSettings) {
      interactionSettings.component.buildPositionCaches()

      return new OffsetTracker(interactionSettings.el)
    })
  }

  releaseHits() {
    let { offsetTrackers } = this

    for (let id in offsetTrackers) {
      offsetTrackers[id].destroy()
    }

    this.offsetTrackers = {}
  }

  queryHitForOffset(offsetLeft: number, offsetTop: number): Hit | null {
    let { droppableStore, offsetTrackers } = this
    let bestHit: Hit | null = null

    for (let id in droppableStore) {
      let component = droppableStore[id].component
      let offsetTracker = offsetTrackers[id]

      if (offsetTracker.isWithinClipping(offsetLeft, offsetTop)) {
        let originLeft = offsetTracker.computeLeft()
        let originTop = offsetTracker.computeTop()
        let positionLeft = offsetLeft - originLeft
        let positionTop = offsetTop - originTop
        let { origRect } = offsetTracker
        let width = origRect.right - origRect.left
        let height = origRect.bottom - origRect.top

        if (
          // must be within the element's bounds
          positionLeft >= 0 && positionLeft < width &&
          positionTop >= 0 && positionTop < height
        ) {
          let hit = component.queryHit(positionLeft, positionTop, width, height)

          if (
            hit &&
            (
              // make sure the hit is within activeRange, meaning it's not a deal cell
              !component.props.dateProfile || // hack for DayTile
              rangeContainsRange(component.props.dateProfile.activeRange, hit.dateSpan.range)
            ) &&
            (!bestHit || hit.layer > bestHit.layer)
          ) {

            // TODO: better way to re-orient rectangle
            hit.rect.left += originLeft
            hit.rect.right += originLeft
            hit.rect.top += originTop
            hit.rect.bottom += originTop

            bestHit = hit
          }
        }
      }
    }

    return bestHit
  }

}

export function isHitsEqual(hit0: Hit | null, hit1: Hit | null): boolean {
  if (!hit0 && !hit1) {
    return true
  }

  if (Boolean(hit0) !== Boolean(hit1)) {
    return false
  }

  return isDateSpansEqual(hit0!.dateSpan, hit1!.dateSpan)
}
