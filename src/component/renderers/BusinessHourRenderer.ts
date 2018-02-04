
export default class BusinessHourRenderer {

  component: any
  fillRenderer: any
  segs: any


  /*
  component implements:
    - eventRangesToEventFootprints
    - eventFootprintsToSegs
  */
  constructor(component, fillRenderer) {
    this.component = component
    this.fillRenderer = fillRenderer
  }


  render(businessHourGenerator) {
    let component = this.component
    let unzonedRange = component._getDateProfile().activeUnzonedRange

    let eventInstanceGroup = businessHourGenerator.buildEventInstanceGroup(
      component.hasAllDayBusinessHours,
      unzonedRange
    )

    let eventFootprints = eventInstanceGroup ?
      component.eventRangesToEventFootprints(
        eventInstanceGroup.sliceRenderRanges(unzonedRange)
      ) :
      []

    this.renderEventFootprints(eventFootprints)
  }


  renderEventFootprints(eventFootprints) {
    let segs = this.component.eventFootprintsToSegs(eventFootprints)

    this.renderSegs(segs)
    this.segs = segs
  }


  renderSegs(segs) {
    if (this.fillRenderer) {
      this.fillRenderer.renderSegs('businessHours', segs, {
        getClasses(seg) {
          return [ 'fc-nonbusiness', 'fc-bgevent' ]
        }
      })
    }
  }


  unrender() {
    if (this.fillRenderer) {
      this.fillRenderer.unrender('businessHours')
    }

    this.segs = null
  }


  getSegs() {
    return this.segs || []
  }

}
