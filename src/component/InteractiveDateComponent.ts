import { elementClosest } from '../util/dom-manip'
import { getEvIsTouch, listenBySelector, listenToHoverBySelector } from '../util/dom-event'
import DateComponent from './DateComponent'
import GlobalEmitter from '../common/GlobalEmitter'


/*
NOTE: still needed for event element clicking and drag initiation
*/
export default abstract class InteractiveDateComponent extends DateComponent {

  // self-config, overridable by subclasses
  segSelector: string = '.fc-event-container > *' // what constitutes an event element?

  // if defined, holds the unit identified (ex: "year" or "month") that determines the level of granularity
  // of the date areas. if not defined, assumes to be day and time granularity.
  // TODO: port isTimeScale into same system?
  largeUnit: any


  // Sets the container element that the view should render inside of, does global DOM-related initializations,
  // and renders all the non-date-related content inside.
  setElement(el) {
    super.setElement(el)

    this.bindAllSegHandlersToEl(el)
  }


  removeElement() {
    this.endInteractions()

    super.removeElement()
  }


  unrenderEvents() {
    this.endInteractions()

    super.unrenderEvents()
  }


  bindDateHandlerToEl(el, name, handler) {
    el.addEventListener(name, (ev) => {
      if (
        !elementClosest(
          ev.target,
          this.segSelector + ':not(.fc-helper),' + // on or within an event segment
          '.fc-more,' + // a "more.." link
          'a[data-goto]' // a clickable nav link
        )
      ) {
        return handler.call(this, ev)
      }
    })
  }


  bindAllSegHandlersToEl(el) {
    // TODO
  }


  bindSegHandlerToEl(el, name, handler) {
    listenBySelector(
      el,
      name,
      this.segSelector,
      this.makeSegMouseHandler(handler)
    )
  }


  bindSegHoverHandlersToEl(el, onMouseEnter, onMouseLeave) {
    listenToHoverBySelector(
      el,
      this.segSelector,
      this.makeSegMouseHandler(onMouseEnter),
      this.makeSegMouseHandler(onMouseLeave)
    )
  }


  makeSegMouseHandler(handler) {
    return (ev, segEl) => {
      if (!segEl.classList.contains('fc-helper')) {
        let seg = (segEl as any).fcSeg // grab segment data. put there by View::renderEventsPayload
        if (seg && !this.shouldIgnoreEventPointing()) {
          return handler.call(this, seg, ev) // context will be the Grid
        }
      }
    }
  }


  shouldIgnoreMouse() {
    // HACK
    // This will still work even though bindDateHandlerToEl doesn't use GlobalEmitter.
    return GlobalEmitter.get().shouldIgnoreMouse()
  }


  shouldIgnoreTouch() {
    let view = this._getView()

    // On iOS (and Android?) when a new selection is initiated overtop another selection,
    // the touchend never fires because the elements gets removed mid-touch-interaction (my theory).
    // HACK: simply don't allow this to happen.
    // ALSO: prevent selection when an *event* is already raised.
    return view.isSelected || Boolean(view.selectedEventInstance)
  }


  shouldIgnoreEventPointing() {
    // only call the handlers if there is not a drag/resize in progress

    return false
    // return (this.eventDragging && this.eventDragging.isDragging) ||
    //   (this.eventResizing && this.eventResizing.isResizing)
  }


  canStartSelection(seg, ev) {
    return getEvIsTouch(ev) &&
      !this.canStartResize(seg, ev) &&
      (this.isEventDefDraggable(seg.eventRange.eventDef) ||
        this.isEventDefResizable(seg.eventRange.eventDef))
  }


  canStartDrag(seg, ev) {
    return !this.canStartResize(seg, ev) &&
      this.isEventDefDraggable(seg.eventRange.eventDef)
  }


  canStartResize(seg, ev) {
    let view = this._getView()
    let eventDef = seg.eventRange.eventDef

    return (!getEvIsTouch(ev) || view.isEventDefSelected(eventDef)) &&
      this.isEventDefResizable(eventDef) &&
      ev.target.classList.contains('fc-resizer')
  }


  // Kills all in-progress dragging.
  // Useful for when public API methods that result in re-rendering are invoked during a drag.
  // Also useful for when touch devices misbehave and don't fire their touchend.
  endInteractions() {
  }


  // Event Drag-n-Drop
  // ---------------------------------------------------------------------------------------------------------------


  // Computes if the given event is allowed to be dragged by the user
  isEventDefDraggable(eventDef) {
    return this.isEventDefStartEditable(eventDef)
  }


  isEventDefStartEditable(eventDef) {
    return false // TODO
  }


  isEventDefGenerallyEditable(eventDef) {
    return false // TODO
  }



  // Event Resizing
  // ---------------------------------------------------------------------------------------------------------------


  // Computes if the given event is allowed to be resized from its starting edge
  isEventDefResizableFromStart(eventDef) {
    return this.opt('eventResizableFromStart') && this.isEventDefResizable(eventDef)
  }


  // Computes if the given event is allowed to be resized from its ending edge
  isEventDefResizableFromEnd(eventDef) {
    return this.isEventDefResizable(eventDef)
  }


  // Computes if the given event is allowed to be resized by the user at all
  isEventDefResizable(eventDef) {
    return false // TODO
  }

}
