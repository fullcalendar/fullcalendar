import { disableCursor, enableCursor } from '../../util/misc'
import EventDefMutation from '../../models/event/EventDefMutation'
import EventDefDateMutation from '../../models/event/EventDefDateMutation'
import HitDragListener from '../../common/HitDragListener'
import Interaction from './Interaction'


export default class EventResizing extends Interaction {

  eventPointing: any
  dragListener: any
  isResizing: boolean = false


  /*
  component impements:
    - bindSegHandlerToEl
    - publiclyTrigger
    - diffDates
    - eventRangesToEventFootprints
    - isEventInstanceGroupAllowed
    - getSafeHitFootprint
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


  bindToEl(el) {
    let component = this.component

    component.bindSegHandlerToEl(el, 'mousedown', this.handleMouseDown.bind(this))
    component.bindSegHandlerToEl(el, 'touchstart', this.handleTouchStart.bind(this))
  }


  handleMouseDown(seg, ev) {
    if (this.component.canStartResize(seg, ev)) {
      this.buildDragListener(seg, ev.target.classList.contains('fc-start-resizer'))
        .startInteraction(ev, { distance: 5 })
    }
  }


  handleTouchStart(seg, ev) {
    if (this.component.canStartResize(seg, ev)) {
      this.buildDragListener(seg, ev.target.classList.contains('fc-start-resizer'))
        .startInteraction(ev)
    }
  }


  // Creates a listener that tracks the user as they resize an event segment.
  // Generic enough to work with any type of Grid.
  buildDragListener(seg, isStart) {
    let component = this.component
    let view = this.view
    let calendar = view.calendar
    let eventManager = calendar.eventManager
    let el = seg.el
    let eventDef = seg.footprint.eventDef
    let eventInstance = seg.footprint.eventInstance
    let isDragging
    let resizeMutation // zoned event date properties. falsy if invalid resize

    // Tracks mouse movement over the *grid's* coordinate map
    let dragListener = this.dragListener = new HitDragListener(component, {
      scroll: this.opt('dragScroll'),
      subjectEl: el,
      interactionStart: () => {
        isDragging = false
      },
      dragStart: (ev) => {
        isDragging = true

        // ensure a mouseout on the manipulated event has been reported
        this.eventPointing.handleMouseout(seg, ev)

        this.segResizeStart(seg, ev)
      },
      hitOver: (hit, isOrig, origHit) => {
        let isAllowed = true
        let origHitFootprint = component.getSafeHitFootprint(origHit)
        let hitFootprint = component.getSafeHitFootprint(hit)
        let mutatedEventInstanceGroup

        if (origHitFootprint && hitFootprint) {
          resizeMutation = isStart ?
            this.computeEventStartResizeMutation(origHitFootprint, hitFootprint, seg.footprint) :
            this.computeEventEndResizeMutation(origHitFootprint, hitFootprint, seg.footprint)

          if (resizeMutation) {
            mutatedEventInstanceGroup = eventManager.buildMutatedEventInstanceGroup(
              eventDef.id,
              resizeMutation
            )
            isAllowed = component.isEventInstanceGroupAllowed(mutatedEventInstanceGroup)
          } else {
            isAllowed = false
          }
        } else {
          isAllowed = false
        }

        if (!isAllowed) {
          resizeMutation = null
          disableCursor()
        } else if (resizeMutation.isEmpty()) {
          // no change. (FYI, event dates might have zones)
          resizeMutation = null
        }

        if (resizeMutation) {
          view.hideEventsWithId(seg.footprint.eventDef.id)
          view.renderEventResize(
            component.eventRangesToEventFootprints(
              mutatedEventInstanceGroup.sliceRenderRanges(component.dateProfile.renderUnzonedRange, calendar)
            ),
            seg
          )
        }
      },
      hitOut: () => { // called before mouse moves to a different hit OR moved out of all hits
        resizeMutation = null
      },
      hitDone: () => { // resets the rendering to show the original event
        view.unrenderEventResize(seg)
        view.showEventsWithId(seg.footprint.eventDef.id)
        enableCursor()
      },
      interactionEnd: (ev) => {
        if (isDragging) {
          this.segResizeStop(seg, ev)
        }

        if (resizeMutation) { // valid date to resize to?
          // no need to re-show original, will rerender all anyways. esp important if eventRenderWait
          view.reportEventResize(eventInstance, resizeMutation, el, ev)
        }

        this.dragListener = null
      }
    })

    return dragListener
  }


  // Called before event segment resizing starts
  segResizeStart(seg, ev) {
    this.isResizing = true
    this.component.publiclyTrigger('eventResizeStart', {
      context: seg.el,
      args: [
        seg.footprint.getEventLegacy(this.view.calendar),
        ev,
        {}, // jqui dummy
        this.view
      ]
    })
  }


  // Called after event segment resizing stops
  segResizeStop(seg, ev) {
    this.isResizing = false
    this.component.publiclyTrigger('eventResizeStop', {
      context: seg.el,
      args: [
        seg.footprint.getEventLegacy(this.view.calendar),
        ev,
        {}, // jqui dummy
        this.view
      ]
    })
  }


  // Returns new date-information for an event segment being resized from its start
  computeEventStartResizeMutation(startFootprint, endFootprint, origEventFootprint) {
    const dateEnv = this.component._getCalendar().dateEnv
    let origRange = origEventFootprint.componentFootprint.unzonedRange
    let startDelta = this.component.diffDates(
      startFootprint.unzonedRange.start,
      endFootprint.unzonedRange.start
    )
    let dateMutation
    let eventDefMutation

    if (dateEnv.add(origRange.start, startDelta) < origRange.end) {

      dateMutation = new EventDefDateMutation()
      dateMutation.setStartDelta(startDelta)

      eventDefMutation = new EventDefMutation()
      eventDefMutation.setDateMutation(dateMutation)

      return eventDefMutation
    }

    return false
  }


  // Returns new date-information for an event segment being resized from its end
  computeEventEndResizeMutation(startFootprint, endFootprint, origEventFootprint) {
    const dateEnv = this.component._getCalendar().dateEnv
    let origRange = origEventFootprint.componentFootprint.unzonedRange
    let endDelta = this.component.diffDates(
      startFootprint.unzonedRange.end,
      endFootprint.unzonedRange.end
    )
    let dateMutation
    let eventDefMutation

    if (dateEnv.add(origRange.end, endDelta) > origRange.start) {

      dateMutation = new EventDefDateMutation()
      dateMutation.setEndDelta(endDelta)

      eventDefMutation = new EventDefMutation()
      eventDefMutation.setDateMutation(dateMutation)

      return eventDefMutation
    }

    return false
  }

}
