import EmitterMixin from '../common/EmitterMixin'
import { PointerDragEvent } from './PointerDragListener'
import { default as IntentfulDragListener, IntentfulDragOptions } from './IntentfulDragListener'
import InteractiveDateComponent from '../component/InteractiveDateComponent'
import { Selection } from '../reducers/selection'

export interface Hit extends Selection {
  component: InteractiveDateComponent
}

/*
fires:
- dragstart
- hitover
- hitout
- dragend
*/
export default class HitDragListener {

  droppableComponents: InteractiveDateComponent[]
  emitter: EmitterMixin
  dragListener: IntentfulDragListener
  initialHit: Hit
  movingHit: Hit
  finalHit: Hit // won't ever be populated if options.ignoreMove is false

  constructor(options: IntentfulDragOptions, droppableComponents: InteractiveDateComponent[]) {
    this.droppableComponents = droppableComponents
    this.emitter = new EmitterMixin()
    this.dragListener = new IntentfulDragListener(options)
    this.dragListener.on('pointerdown', this.onPointerDown)
    this.dragListener.on('dragstart', this.onDragStart)
    this.dragListener.on('dragmove', this.onDragMove)
    this.dragListener.on('dragend', this.onDragEnd)
    this.dragListener.on('pointerup', this.onPointerUp)
  }

  destroy() {
    this.dragListener.destroy()
  }

  on(name, handler) {
    this.emitter.on(name, handler)
  }

  onPointerDown = (ev: PointerDragEvent) => {
    this.emitter.trigger('pointerdown', ev)
    this.prepareComponents()
    this.initialHit = this.queryHit(ev.pageX, ev.pageY)
    this.finalHit = null
  }

  onDragStart = (ev: PointerDragEvent) => {
    this.emitter.trigger('dragstart', ev)

    // querying the first hovered hit is considered a 'move', so ignore if necessary
    if (!this.dragListener.pointerListener.ignoreMove) {
      this.handleMove(ev)
    }
  }

  onDragMove = (ev: PointerDragEvent) => {
    this.emitter.trigger('pointermove', ev)
    this.handleMove(ev)
  }

  onDragEnd = (ev: PointerDragEvent) => {
    this.finalHit = this.movingHit
    this.clearMovingHit()
    this.emitter.trigger('dragend', ev)
  }

  onPointerUp = (ev: PointerDragEvent) => {
    this.emitter.trigger('pointerup', ev)
  }

  handleMove(ev: PointerDragEvent) {
    let hit = this.queryHit(ev.pageX, ev.pageY)

    if (!this.movingHit || !isHitsEqual(this.movingHit, hit)) {
      this.clearMovingHit()

      if (hit) {
        this.movingHit = hit
        this.emitter.trigger('hitover', hit)
      }
    }
  }

  clearMovingHit() {
    if (this.movingHit) {
      this.emitter.trigger('hitout', this.movingHit)
      this.movingHit = null
    }
  }

  prepareComponents() {
    for (let component of this.droppableComponents) {
      component.buildCoordCaches()
    }
  }

  queryHit(x, y): Hit {
    for (let component of this.droppableComponents) {
      let hit = component.queryHit(x, y) as Hit

      if (hit) {
        hit.component = component
        return hit
      }
    }

    return null
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
    if (propName !== 'range') {
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
