import { removeElement } from '../../util/dom-manip'
import { Seg } from '../DateComponent'


export default abstract class MirrorRenderer {

  view: any
  component: any
  eventRenderer: any
  mirrorEls: HTMLElement[]
  segs: Seg[]


  constructor(component, eventRenderer) {
    this.view = component.view
    this.component = component
    this.eventRenderer = eventRenderer
  }


  renderEventDraggingSegs(segs: Seg[], sourceSeg) {
    this.renderEventSegs(
      segs,
      sourceSeg,
      'fc-dragging',
      this.view.opt('dragOpacity')
    )
  }


  renderEventResizingSegs(segs: Seg[], sourceSeg) {
    this.renderEventSegs(
      segs,
      sourceSeg,
      'fc-resizing'
    )
  }


  renderEventSegs(segs: Seg[], sourceSeg?, extraClassName?, opacity?) {
    let i

    // assigns each seg's el and returns a subset of segs that were rendered
    segs = this.eventRenderer.renderFgSegEls(segs, true) // isMirrors=true

    for (i = 0; i < segs.length; i++) {
      let classList = segs[i].el.classList
      classList.add('fc-mirror')
      if (extraClassName) {
        classList.add(extraClassName)
      }
    }

    if (opacity != null) {
      for (i = 0; i < segs.length; i++) {
        segs[i].el.style.opacity = opacity
      }
    }

    this.mirrorEls = this.renderSegs(segs, sourceSeg)
    this.segs = segs

    this.view.triggerRenderedSegs(segs, true) // isMirrors=true
  }


  computeSize() {
  }


  assignSize() {
  }


  /*
  Must return all mock event elements
  */
  abstract renderSegs(segs: Seg[], sourceSeg?): HTMLElement[]


  unrender() {
    if (this.mirrorEls) {
      this.mirrorEls.forEach(removeElement)
      this.mirrorEls = null
    }
  }

}
