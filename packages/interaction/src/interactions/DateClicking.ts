import { ViewApi, DatePointApi } from '@fullcalendar/core'
import {
  PointerDragEvent, Interaction, InteractionSettings, interactionSettingsToStore,
} from '@fullcalendar/core/internal'
import { FeaturefulElementDragging } from '../dnd/FeaturefulElementDragging.js'
import { HitDragging, isHitsEqual } from './HitDragging.js'
import { buildDatePointApiWithContext } from '../utils.js'

export interface DateClickArg extends DatePointApi {
  dayEl: HTMLElement
  jsEvent: MouseEvent
  view: ViewApi
}

/*
Monitors when the user clicks on a specific date/time of a component.
A pointerdown+pointerup on the same "hit" constitutes a click.
*/
export class DateClicking extends Interaction {
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging

  constructor(settings: InteractionSettings) {
    super(settings)

    // we DO want to watch pointer moves because otherwise finalHit won't get populated
    this.dragging = new FeaturefulElementDragging(settings.el)
    this.dragging.autoScroller.isEnabled = false

    settings.el.addEventListener('contextmenu', (ev) => {
      const pev = {
        origEvent: ev,
        isTouch: false,
        subjectEl: ev.currentTarget,
        pageX: ev.pageX,
        pageY: ev.pageY,
        deltaX: 0,
        deltaY: 0,
      } as PointerDragEvent
      this.handleRightClick(pev)
    })

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, interactionSettingsToStore(settings))
    hitDragging.emitter.on('pointerdown', this.handlePointerDown)
    hitDragging.emitter.on('dragend', this.handleDragEnd)
  }

  destroy() {
    this.dragging.destroy()
  }

  handlePointerDown = (pev: PointerDragEvent) => {
    let { dragging } = this
    let downEl = pev.origEvent.target as HTMLElement

    // do this in pointerdown (not dragend) because DOM might be mutated by the time dragend is fired
    dragging.setIgnoreMove(
      !this.component.isValidDateDownEl(downEl),
    )
  }

  handleRightClick = (pev: PointerDragEvent) => {
    let { component } = this

    this.hitDragging.prepareHits()
    this.hitDragging.processFirstCoord(pev)
    let { initialHit } = this.hitDragging
    let { context } = component
    let arg: DateClickArg = {
      ...buildDatePointApiWithContext(initialHit.dateSpan, context),
      dayEl: initialHit.dayEl,
      jsEvent: pev.origEvent as MouseEvent,
      view: context.viewApi || context.calendarApi.view,
    }
    context.emitter.trigger('dateClick', arg)
  }

  // won't even fire if moving was ignored
  handleDragEnd = (ev: PointerDragEvent) => {
    let { component } = this
    let { pointer } = this.dragging

    if (!pointer.wasTouchScroll) {
      let { initialHit, finalHit } = this.hitDragging

      if (initialHit && finalHit && isHitsEqual(initialHit, finalHit)) {
        let { context } = component
        let arg: DateClickArg = {
          ...buildDatePointApiWithContext(initialHit.dateSpan, context),
          dayEl: initialHit.dayEl,
          jsEvent: ev.origEvent as MouseEvent,
          view: context.viewApi || context.calendarApi.view,
        }

        context.emitter.trigger('dateClick', arg)
      }
    }
  }
}
