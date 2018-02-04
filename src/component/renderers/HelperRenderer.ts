import SingleEventDef from '../../models/event/SingleEventDef'
import EventFootprint from '../../models/event/EventFootprint'
import EventSource from '../../models/event-source/EventSource'


export default class HelperRenderer {

  view: any
  component: any
  eventRenderer: any
  helperEls: any


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


  renderEventFootprints(eventFootprints, sourceSeg?, extraClassNames?, opacity?) {
    let segs = this.component.eventFootprintsToSegs(eventFootprints)
    let classNames = 'fc-helper ' + (extraClassNames || '')
    let i

    // assigns each seg's el and returns a subset of segs that were rendered
    segs = this.eventRenderer.renderFgSegEls(segs)

    for (i = 0; i < segs.length; i++) {
      segs[i].el.addClass(classNames)
    }

    if (opacity != null) {
      for (i = 0; i < segs.length; i++) {
        segs[i].el.css('opacity', opacity)
      }
    }

    this.helperEls = this.renderSegs(segs, sourceSeg)
  }


  /*
  Must return all mock event elements
  */
  renderSegs(segs, sourceSeg?) {
    // Subclasses must implement
  }


  unrender() {
    if (this.helperEls) {
      this.helperEls.remove()
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
