import {
  getEvX,
  getEvY,
  getOuterRect,
  constrainPoint,
  intersectRects,
  getRectCenter,
  diffPoints
} from '../util'
import DragListener from './DragListener'


/* Tracks mouse movements over a component and raises events about which hit the mouse is over.
------------------------------------------------------------------------------------------------------------------------
options:
- subjectEl
- subjectCenter
*/

export default class HitDragListener extends DragListener {

  component: any // converts coordinates to hits
    // methods: hitsNeeded, hitsNotNeeded, queryHit

  origHit: any // the hit the mouse was over when listening started
  hit: any // the hit the mouse is over
  coordAdjust: any // delta that will be added to the mouse coordinates when computing collisions


  constructor(component, options) {
    super(options)
    this.component = component
  }

  // Called when drag listening starts (but a real drag has not necessarily began).
  // ev might be undefined if dragging was started manually.
  handleInteractionStart(ev) {
    let subjectEl = this.subjectEl
    let subjectRect
    let origPoint
    let point

    this.component.hitsNeeded()
    this.computeScrollBounds() // for autoscroll

    if (ev) {
      origPoint = { left: getEvX(ev), top: getEvY(ev) }
      point = origPoint

      // constrain the point to bounds of the element being dragged
      if (subjectEl) {
        subjectRect = getOuterRect(subjectEl) // used for centering as well
        point = constrainPoint(point, subjectRect)
      }

      this.origHit = this.queryHit(point.left, point.top)

      // treat the center of the subject as the collision point?
      if (subjectEl && this.options.subjectCenter) {

        // only consider the area the subject overlaps the hit. best for large subjects.
        // TODO: skip this if hit didn't supply left/right/top/bottom
        if (this.origHit) {
          subjectRect = intersectRects(this.origHit, subjectRect) ||
            subjectRect // in case there is no intersection
        }

        point = getRectCenter(subjectRect)
      }

      this.coordAdjust = diffPoints(point, origPoint) // point - origPoint
    } else {
      this.origHit = null
      this.coordAdjust = null
    }

    // call the super-method. do it after origHit has been computed
    super.handleInteractionStart(ev)
  }


  // Called when the actual drag has started
  handleDragStart(ev) {
    let hit

    super.handleDragStart(ev)

    // might be different from this.origHit if the min-distance is large
    hit = this.queryHit(getEvX(ev), getEvY(ev))

    // report the initial hit the mouse is over
    // especially important if no min-distance and drag starts immediately
    if (hit) {
      this.handleHitOver(hit)
    }
  }


  // Called when the drag moves
  handleDrag(dx, dy, ev) {
    let hit

    super.handleDrag(dx, dy, ev)

    hit = this.queryHit(getEvX(ev), getEvY(ev))

    if (!isHitsEqual(hit, this.hit)) { // a different hit than before?
      if (this.hit) {
        this.handleHitOut()
      }
      if (hit) {
        this.handleHitOver(hit)
      }
    }
  }


  // Called when dragging has been stopped
  handleDragEnd(ev) {
    this.handleHitDone()
    super.handleDragEnd(ev)
  }


  // Called when a the mouse has just moved over a new hit
  handleHitOver(hit) {
    let isOrig = isHitsEqual(hit, this.origHit)

    this.hit = hit

    this.trigger('hitOver', this.hit, isOrig, this.origHit)
  }


  // Called when the mouse has just moved out of a hit
  handleHitOut() {
    if (this.hit) {
      this.trigger('hitOut', this.hit)
      this.handleHitDone()
      this.hit = null
    }
  }


  // Called after a hitOut. Also called before a dragStop
  handleHitDone() {
    if (this.hit) {
      this.trigger('hitDone', this.hit)
    }
  }


  // Called when the interaction ends, whether there was a real drag or not
  handleInteractionEnd(ev, isCancelled) {
    super.handleInteractionEnd(ev, isCancelled)

    this.origHit = null
    this.hit = null

    this.component.hitsNotNeeded()
  }


  // Called when scrolling has stopped, whether through auto scroll, or the user scrolling
  handleScrollEnd() {
    super.handleScrollEnd()

    // hits' absolute positions will be in new places after a user's scroll.
    // HACK for recomputing.
    if (this.isDragging) {
      this.component.releaseHits()
      this.component.prepareHits()
    }
  }


  // Gets the hit underneath the coordinates for the given mouse event
  queryHit(left, top) {

    if (this.coordAdjust) {
      left += this.coordAdjust.left
      top += this.coordAdjust.top
    }

    return this.component.queryHit(left, top)
  }

}


// Returns `true` if the hits are identically equal. `false` otherwise. Must be from the same component.
// Two null values will be considered equal, as two "out of the component" states are the same.
function isHitsEqual(hit0, hit1) {

  if (!hit0 && !hit1) {
    return true
  }

  if (hit0 && hit1) {
    return hit0.component === hit1.component &&
      isHitPropsWithin(hit0, hit1) &&
      isHitPropsWithin(hit1, hit0) // ensures all props are identical
  }

  return false
}


// Returns true if all of subHit's non-standard properties are within superHit
function isHitPropsWithin(subHit, superHit) {
  for (let propName in subHit) {
    if (!/^(component|left|right|top|bottom)$/.test(propName)) {
      if (subHit[propName] !== superHit[propName]) {
        return false
      }
    }
  }
  return true
}
