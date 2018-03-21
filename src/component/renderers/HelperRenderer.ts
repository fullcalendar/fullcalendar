import { removeElement } from '../../util/dom'
import SingleEventDef from '../../models/event/SingleEventDef'
import EventFootprint from '../../models/event/EventFootprint'
import EventSource from '../../models/event-source/EventSource'


export default abstract class HelperRenderer {

  view: any
  component: any
  eventRenderer: any
  helperEls: HTMLElement[]


  constructor(component, eventRenderer) {
    this.view = component._getView()
    this.component = component
    this.eventRenderer = eventRenderer
  }


  renderComponentFootprint(componentFootprint) {
    this.renderEventFootprints([
      this.fabricateEventFootprint(componentFootprint)
    ])
  }


  renderEventDraggingFootprints(eventFootprints, sourceSeg, isTouch) {
    this.renderEventFootprints(
      eventFootprints,
      sourceSeg,
      'fc-dragging',
      isTouch ? null : this.view.opt('dragOpacity')
    )
  }


  renderEventResizingFootprints(eventFootprints, sourceSeg, isTouch) {
    this.renderEventFootprints(
      eventFootprints,
      sourceSeg,
      'fc-resizing'
    )
  }


  renderEventFootprints(eventFootprints, sourceSeg?, extraClassName?, opacity?) {
    let segs = this.component.eventFootprintsToSegs(eventFootprints)
    let i

    // assigns each seg's el and returns a subset of segs that were rendered
    segs = this.eventRenderer.renderFgSegEls(segs)

    for (i = 0; i < segs.length; i++) {
      let classList = segs[i].el.classList
      classList.add('fc-helper')
      if (extraClassName) {
        classList.add(extraClassName)
      }
    }

    if (opacity != null) {
      for (i = 0; i < segs.length; i++) {
        segs[i].el.style.opacity = opacity
      }
    }

    this.helperEls = this.renderSegs(segs, sourceSeg)
  }


  /*
  Must return all mock event elements
  */
  abstract renderSegs(segs, sourceSeg?): HTMLElement[]


  unrender() {
    if (this.helperEls) {
      this.helperEls.forEach(removeElement)
      this.helperEls = null
    }
  }


  fabricateEventFootprint(componentFootprint) {
    let calendar = this.view.calendar
    let eventDateProfile = calendar.footprintToDateProfile(componentFootprint)
    let dummyEvent = new SingleEventDef(new EventSource(calendar))
    let dummyInstance

    dummyEvent.dateProfile = eventDateProfile
    dummyInstance = dummyEvent.buildInstance()

    return new EventFootprint(componentFootprint, dummyEvent, dummyInstance)
  }

}
