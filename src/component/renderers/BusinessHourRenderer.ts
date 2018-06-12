
export default class BusinessHourRenderer {

  component: any
  fillRenderer: any
  segs: any


  constructor(component, fillRenderer) {
    this.component = component
    this.fillRenderer = fillRenderer
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
