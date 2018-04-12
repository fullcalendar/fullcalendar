import * as moment from 'moment'
import { assignTo } from '../../util/object'
import { elementMatches } from '../../util/dom-manip'
import { disableCursor, enableCursor } from '../../util/misc'
import momentExt from '../../moment-ext'
import HitDragListener from '../../common/HitDragListener'
import SingleEventDef from '../../models/event/SingleEventDef'
import EventInstanceGroup from '../../models/event/EventInstanceGroup'
import EventSource from '../../models/event-source/EventSource'
import Interaction from './Interaction'


export default class ExternalDropping extends Interaction {

  dragListener: any
  isDragging: boolean = false // jqui-dragging an external element? boolean


  static dataAttrPrefix: string = ''

  // Given a jQuery element that might represent a dragged FullCalendar event, returns an intermediate data structure
  // to be used for Event Object creation.
  // A defined `.eventProps`, even when empty, indicates that an event should be created.
  static getDraggedElMeta(el) {
    let eventProps // properties for creating the event, not related to date/time
    let startTime // a Duration
    let duration
    let stick

    eventProps = ExternalDropping.getEmbeddedElData(el, 'event', true)

    if (eventProps) {

      // something like 1 or true. still signal event creation
      if (typeof eventProps !== 'object') {
        eventProps = {}
      }

      // pluck special-cased date/time properties
      startTime = eventProps.start
      if (startTime == null) { startTime = eventProps.time } // accept 'time' as well
      duration = eventProps.duration
      stick = eventProps.stick
      delete eventProps.start
      delete eventProps.time
      delete eventProps.duration
      delete eventProps.stick
    }

    // fallback to standalone attribute values for each of the date/time properties
    if (startTime == null) { startTime = ExternalDropping.getEmbeddedElData(el, 'start') }
    if (startTime == null) { startTime = ExternalDropping.getEmbeddedElData(el, 'time') } // accept 'time' as well
    if (duration == null) { duration = ExternalDropping.getEmbeddedElData(el, 'duration') }
    if (stick == null) { stick = ExternalDropping.getEmbeddedElData(el, 'stick', true) }

    // massage into correct data types
    startTime = startTime != null ? moment.duration(startTime) : null
    duration = duration != null ? moment.duration(duration) : null
    stick = Boolean(stick)

    return { eventProps: eventProps, startTime: startTime, duration: duration, stick: stick }
  }

  static getEmbeddedElData(el, name, shouldParseJson = false) {
    let prefix = ExternalDropping.dataAttrPrefix
    let prefixedName = (prefix ? prefix + '-' : '') + name

    let data = el.getAttribute('data-' + prefixedName) || null
    if (data && shouldParseJson) {
      data = JSON.parse(data)
    }

    return data
  }


  /*
  component impements:
    - eventRangesToEventFootprints
    - isEventInstanceGroupAllowed
    - isExternalInstanceGroupAllowed
    - renderDrag
    - unrenderDrag
  */


  end() {
    if (this.dragListener) {
      this.dragListener.endInteraction()
    }
  }


  // Called when a jQuery UI drag is initiated anywhere in the DOM
  handleDragStart(ev, el, skipBinding) {
    let accept

    if (this.opt('droppable')) { // only listen if this setting is on

      // Test that the dragged element passes the dropAccept selector or filter function.
      // FYI, the default is "*" (matches all)
      accept = this.opt('dropAccept')
      if (typeof accept === 'function' ? accept.call(el, el) : elementMatches(el, accept)) {
        if (!this.isDragging) { // prevent double-listening if fired twice
          this.listenToExternalDrag(ev, el, skipBinding)
        }
      }
    }
  }


  handleDragMove(ev) {
    if (this.dragListener) {
      this.dragListener.handleMove(ev)
    }
  }


  handleDragStop(ev) {
    if (this.dragListener) {
      this.dragListener.endInteraction(ev)
    }
  }


  // Called when a 3rd-party draggable starts and it needs to be monitored for dropping
  listenToExternalDrag(ev, el, skipBinding) {
    let component = this.component
    let view = this.view
    let meta = ExternalDropping.getDraggedElMeta(el) // extra data about event drop, including possible event to create
    let singleEventDef // a null value signals an unsuccessful drag

    // listener that tracks mouse movement over date-associated pixel regions
    let dragListener = this.dragListener = new HitDragListener(component, {
      interactionStart: () => {
        this.isDragging = true
      },
      hitOver: (hit) => {
        let isAllowed = true
        let hitFootprint = hit.component.getSafeHitFootprint(hit) // hit might not belong to this grid
        let mutatedEventInstanceGroup

        if (hitFootprint) {
          singleEventDef = this.computeExternalDrop(hitFootprint, meta)

          if (singleEventDef) {
            mutatedEventInstanceGroup = new EventInstanceGroup(
              singleEventDef.buildInstances()
            )
            isAllowed = meta.eventProps ? // isEvent?
              component.isEventInstanceGroupAllowed(mutatedEventInstanceGroup) :
              component.isExternalInstanceGroupAllowed(mutatedEventInstanceGroup)
          } else {
            isAllowed = false
          }
        } else {
          isAllowed = false
        }

        if (!isAllowed) {
          singleEventDef = null
          disableCursor()
        }

        if (singleEventDef) {
          component.renderDrag( // called without a seg parameter
            component.eventRangesToEventFootprints(
              mutatedEventInstanceGroup.sliceRenderRanges(component.dateProfile.renderUnzonedRange, view.calendar)
            )
          )
        }
      },
      hitOut: () => {
        singleEventDef = null // signal unsuccessful
      },
      hitDone: () => { // Called after a hitOut OR before a dragEnd
        enableCursor()
        component.unrenderDrag()
      },
      interactionEnd: (ev) => {

        if (singleEventDef) { // element was dropped on a valid hit
          view.reportExternalDrop(
            singleEventDef,
            Boolean(meta.eventProps), // isEvent
            Boolean(meta.stick), // isSticky
            el, ev
          )
        }

        this.isDragging = false
        this.dragListener = null
      }
    })

    dragListener.skipBinding = skipBinding
    dragListener.startDrag(ev) // start listening immediately
  }


  // Given a hit to be dropped upon, and misc data associated with the jqui drag (guaranteed to be a plain object),
  // returns the zoned start/end dates for the event that would result from the hypothetical drop. end might be null.
  // Returning a null value signals an invalid drop hit.
  // DOES NOT consider overlap/constraint.
  // Assumes both footprints are non-open-ended.
  computeExternalDrop(componentFootprint, meta) {
    let calendar = this.view.calendar
    let start = momentExt.utc(componentFootprint.unzonedRange.startMs).stripZone()
    let end
    let eventDef

    if (componentFootprint.isAllDay) {
      // if dropped on an all-day span, and element's metadata specified a time, set it
      if (meta.startTime) {
        start.time(meta.startTime)
      } else {
        start.stripTime()
      }
    }

    if (meta.duration) {
      end = start.clone().add(meta.duration)
    }

    start = calendar.applyTimezone(start)

    if (end) {
      end = calendar.applyTimezone(end)
    }

    eventDef = SingleEventDef.parse(
      assignTo({}, meta.eventProps, {
        start: start,
        end: end
      }),
      new EventSource(calendar)
    )

    return eventDef
  }

}
