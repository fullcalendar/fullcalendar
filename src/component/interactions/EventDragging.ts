import { enableCursor, disableCursor } from '../../util'
import EventDefMutation from '../../models/event/EventDefMutation'
import EventDefDateMutation from '../../models/event/EventDefDateMutation'
import DragListener from '../../common/DragListener'
import HitDragListener from '../../common/HitDragListener'
import MouseFollower from '../../common/MouseFollower'
import Interaction from './Interaction'


export default class EventDragging extends Interaction {

  eventPointing: any
  dragListener: any
  isDragging: boolean = false


  /*
  component implements:
    - bindSegHandlerToEl
    - publiclyTrigger
    - diffDates
    - eventRangesToEventFootprints
    - isEventInstanceGroupAllowed
  */
  constructor(component, eventPointing) {
    super(component)
    this.eventPointing = eventPointing
  }


  end() {
    if (this.dragListener) {
      this.dragListener.endInteraction()
    }
  }


  getSelectionDelay() {
    let delay = this.opt('eventLongPressDelay')

    if (delay == null) {
      delay = this.opt('longPressDelay') // fallback
    }

    return delay
  }


  bindToEl(el) {
    let component = this.component

    component.bindSegHandlerToEl(el, 'mousedown', this.handleMousedown.bind(this))
    component.bindSegHandlerToEl(el, 'touchstart', this.handleTouchStart.bind(this))
  }


  handleMousedown(seg, ev) {
    if (
      !this.component.shouldIgnoreMouse() &&
      this.component.canStartDrag(seg, ev)
    ) {
      this.buildDragListener(seg).startInteraction(ev, { distance: 5 })
    }
  }


  handleTouchStart(seg, ev) {
    let component = this.component
    let settings = {
      delay: this.view.isEventDefSelected(seg.footprint.eventDef) ? // already selected?
        0 : this.getSelectionDelay()
    }

    if (component.canStartDrag(seg, ev)) {
      this.buildDragListener(seg).startInteraction(ev, settings)
    } else if (component.canStartSelection(seg, ev)) {
      this.buildSelectListener(seg).startInteraction(ev, settings)
    }
  }


  // seg isn't draggable, but let's use a generic DragListener
  // simply for the delay, so it can be selected.
  // Has side effect of setting/unsetting `dragListener`
  buildSelectListener(seg) {
    let view = this.view
    let eventDef = seg.footprint.eventDef
    let eventInstance = seg.footprint.eventInstance // null for inverse-background events

    if (this.dragListener) {
      return this.dragListener
    }

    let dragListener = this.dragListener = new DragListener({
      dragStart: (ev) => {
        if (
          dragListener.isTouch &&
          !view.isEventDefSelected(eventDef) &&
          eventInstance
        ) {
          // if not previously selected, will fire after a delay. then, select the event
          view.selectEventInstance(eventInstance)
        }
      },
      interactionEnd: (ev) => {
        this.dragListener = null
      }
    })

    return dragListener
  }


  // Builds a listener that will track user-dragging on an event segment.
  // Generic enough to work with any type of Grid.
  // Has side effect of setting/unsetting `dragListener`
  buildDragListener(seg) {
    let component = this.component
    let view = this.view
    let calendar = view.calendar
    let eventManager = calendar.eventManager
    let el = seg.el
    let eventDef = seg.footprint.eventDef
    let eventInstance = seg.footprint.eventInstance // null for inverse-background events
    let isDragging
    let mouseFollower // A clone of the original element that will move with the mouse
    let eventDefMutation

    if (this.dragListener) {
      return this.dragListener
    }

    // Tracks mouse movement over the *view's* coordinate map. Allows dragging and dropping between subcomponents
    // of the view.
    let dragListener = this.dragListener = new HitDragListener(view, {
      scroll: this.opt('dragScroll'),
      subjectEl: el,
      subjectCenter: true,
      interactionStart: (ev) => {
        seg.component = component // for renderDrag
        isDragging = false
        mouseFollower = new MouseFollower(seg.el, {
          additionalClass: 'fc-dragging',
          parentEl: view.el,
          opacity: dragListener.isTouch ? null : this.opt('dragOpacity'),
          revertDuration: this.opt('dragRevertDuration'),
          zIndex: 2 // one above the .fc-view
        })
        mouseFollower.hide() // don't show until we know this is a real drag
        mouseFollower.start(ev)
      },
      dragStart: (ev) => {
        if (
          dragListener.isTouch &&
          !view.isEventDefSelected(eventDef) &&
          eventInstance
        ) {
          // if not previously selected, will fire after a delay. then, select the event
          view.selectEventInstance(eventInstance)
        }
        isDragging = true

        // ensure a mouseout on the manipulated event has been reported
        this.eventPointing.handleMouseout(seg, ev)

        this.segDragStart(seg, ev)
        view.hideEventsWithId(seg.footprint.eventDef.id)
      },
      hitOver: (hit, isOrig, origHit) => {
        let isAllowed = true
        let origFootprint
        let footprint
        let mutatedEventInstanceGroup

        // starting hit could be forced (DayGrid.limit)
        if (seg.hit) {
          origHit = seg.hit
        }

        // hit might not belong to this grid, so query origin grid
        origFootprint = origHit.component.getSafeHitFootprint(origHit)
        footprint = hit.component.getSafeHitFootprint(hit)

        if (origFootprint && footprint) {
          eventDefMutation = this.computeEventDropMutation(origFootprint, footprint, eventDef)

          if (eventDefMutation) {
            mutatedEventInstanceGroup = eventManager.buildMutatedEventInstanceGroup(
              eventDef.id,
              eventDefMutation
            )
            isAllowed = component.isEventInstanceGroupAllowed(mutatedEventInstanceGroup)
          } else {
            isAllowed = false
          }
        } else {
          isAllowed = false
        }

        if (!isAllowed) {
          eventDefMutation = null
          disableCursor()
        }

        // if a valid drop location, have the subclass render a visual indication
        if (
          eventDefMutation &&
          view.renderDrag( // truthy if rendered something
            component.eventRangesToEventFootprints(
              mutatedEventInstanceGroup.sliceRenderRanges(component.dateProfile.renderUnzonedRange, calendar)
            ),
            seg,
            dragListener.isTouch
          )
        ) {
          mouseFollower.hide() // if the subclass is already using a mock event "helper", hide our own
        } else {
          mouseFollower.show() // otherwise, have the helper follow the mouse (no snapping)
        }

        if (isOrig) {
          // needs to have moved hits to be a valid drop
          eventDefMutation = null
        }
      },
      hitOut: () => { // called before mouse moves to a different hit OR moved out of all hits
        view.unrenderDrag(seg) // unrender whatever was done in renderDrag
        mouseFollower.show() // show in case we are moving out of all hits
        eventDefMutation = null
      },
      hitDone: () => { // Called after a hitOut OR before a dragEnd
        enableCursor()
      },
      interactionEnd: (ev) => {
        delete seg.component // prevent side effects

        // do revert animation if hasn't changed. calls a callback when finished (whether animation or not)
        mouseFollower.stop(!eventDefMutation, () => {
          if (isDragging) {
            view.unrenderDrag(seg)
            this.segDragStop(seg, ev)
          }

          view.showEventsWithId(seg.footprint.eventDef.id)

          if (eventDefMutation) {
            // no need to re-show original, will rerender all anyways. esp important if eventRenderWait
            view.reportEventDrop(eventInstance, eventDefMutation, el, ev)
          }
        })

        this.dragListener = null
      }
    })

    return dragListener
  }


  // Called before event segment dragging starts
  segDragStart(seg, ev) {
    this.isDragging = true
    this.component.publiclyTrigger('eventDragStart', {
      context: seg.el[0],
      args: [
        seg.footprint.getEventLegacy(),
        ev,
        {}, // jqui dummy
        this.view
      ]
    })
  }


  // Called after event segment dragging stops
  segDragStop(seg, ev) {
    this.isDragging = false
    this.component.publiclyTrigger('eventDragStop', {
      context: seg.el[0],
      args: [
        seg.footprint.getEventLegacy(),
        ev,
        {}, // jqui dummy
        this.view
      ]
    })
  }


  // DOES NOT consider overlap/constraint
  computeEventDropMutation(startFootprint, endFootprint, eventDef) {
    let eventDefMutation = new EventDefMutation()

    eventDefMutation.setDateMutation(
      this.computeEventDateMutation(startFootprint, endFootprint)
    )

    return eventDefMutation
  }


  computeEventDateMutation(startFootprint, endFootprint) {
    let date0 = startFootprint.unzonedRange.getStart()
    let date1 = endFootprint.unzonedRange.getStart()
    let clearEnd = false
    let forceTimed = false
    let forceAllDay = false
    let dateDelta
    let dateMutation

    if (startFootprint.isAllDay !== endFootprint.isAllDay) {
      clearEnd = true

      if (endFootprint.isAllDay) {
        forceAllDay = true
        date0.stripTime()
      } else {
        forceTimed = true
      }
    }

    dateDelta = this.component.diffDates(date1, date0)

    dateMutation = new EventDefDateMutation()
    dateMutation.clearEnd = clearEnd
    dateMutation.forceTimed = forceTimed
    dateMutation.forceAllDay = forceAllDay
    dateMutation.setDateDelta(dateDelta)

    return dateMutation
  }

}
