
export default class BusinessHourRenderer {

  component: any
  fillRenderer: any


  constructor(component, fillRenderer) {
    this.component = component
    this.fillRenderer = fillRenderer
  }


  renderSegs(segs) {
    if (this.fillRenderer) {
      this.fillRenderer.renderSegs('businessHours', segs, {
        getClasses(seg) {
          return [ 'fc-bgevent' ].concat(seg.eventRange.eventDef.className)
        }
      })
    }
  }


  unrender() {
    if (this.fillRenderer) {
      this.fillRenderer.unrender('businessHours')
    }
  }

}
