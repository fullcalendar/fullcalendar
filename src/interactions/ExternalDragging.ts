import { IntentfulDragListener } from '../dnd/IntentfulDragListener'
import HitDragListener, { Hit } from '../dnd/HitDragListener'
import globalContext from '../common/GlobalContext'
import { PointerDragEvent } from '../dnd/PointerDragListener'
import { EventStore, parseDef, createInstance } from '../reducers/event-store'
import UnzonedRange from '../models/UnzonedRange';

export default class ExternalDragging {

  hitListener: HitDragListener
  addableEventStore: EventStore

  constructor(dragListener: IntentfulDragListener) {
    let hitListener = this.hitListener = new HitDragListener(dragListener, globalContext.componentHash)
    hitListener.dieIfNoInitial = false
    hitListener.on('dragstart', this.onDragStart)
    hitListener.on('hitover', this.onHitOver)
    hitListener.on('hitout', this.onHitOut)
    hitListener.on('dragend', this.onDragEnd)

    dragListener.enableMirror()
  }

  destroy() {
    this.hitListener.destroy() // should not be responsible for destroying something not belonged!
  }

  onDragStart = (ev: PointerDragEvent) => {

    // TODO: nicer accessors in GlobalContext for this?
    if (globalContext.eventSelectedComponent) {
      let selectedCalendar = globalContext.eventSelectedComponent.getCalendar()

      if (selectedCalendar) {
        selectedCalendar.dispatch({
          type: 'CLEAR_SELECTED_EVENT'
        })
        globalContext.eventSelectedComponent = null
      }
    }
  }

  onHitOver = (hit, ev) => {
    let calendar = hit.component.getCalendar()

    calendar.dispatch({
      type: 'SET_DRAG',
      displacement: (this.addableEventStore = computeEventStoreForHit(hit)),
      origSeg: null,
      isTouch: ev.isTouch
    })

    let { dragListener } = this.hitListener

    dragListener.setMirrorNeedsRevert(false)

    // TODO wish we could somehow wait for dispatch to guarantee render
    if (!document.querySelector('.fc-helper')) {
      dragListener.enableMirror()
    } else {
      dragListener.disableMirror()
    }
  }

  onHitOut = (hit, ev) => { // TODO: onHitChange?

    // we still want to notify calendar about invalid drag
    // because we want related events to stay hidden
    hit.component.getCalendar().dispatch({
      type: 'SET_DRAG',
      displacement: { defs: {}, instances: {} }, // TODO: better way to make empty event-store
      origSeg: null,
      isTouch: ev.isTouch
    })

    this.addableEventStore = null

    let { dragListener } = this.hitListener

    dragListener.enableMirror()
    dragListener.setMirrorNeedsRevert(true)
  }

  onDragEnd = () => {
    if (this.addableEventStore) {
      let finalComponent = this.hitListener.finalHit.component

      finalComponent.getCalendar().dispatch({
        type: 'CLEAR_DRAG'
      })

      // TODO: report mutation to dispatcher
      console.log('addable', this.addableEventStore)
    }
  }

}

function computeEventStoreForHit(hit: Hit): EventStore {
  let calendar = hit.component.getCalendar()
  let def = parseDef({ title: 'test event' }, null, hit.isAllDay, false)
  let instance = createInstance(def.defId, new UnzonedRange(
    hit.range.start,
    calendar.getDefaultEventEnd(hit.isAllDay, hit.range.start)
  ))

  return {
    defs: { [def.defId]: def },
    instances: { [instance.instanceId]: instance }
  }
}
