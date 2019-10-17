import { cssToStr } from '../../util/html'
import { htmlToElements, removeElement, elementMatches } from '../../util/dom-manip'
import { Seg } from '../DateComponent'
import { filterSegsViaEls, triggerRenderedSegs, triggerWillRemoveSegs } from '../event-rendering'
import { ComponentContext } from '../Component'

/*
TODO: when refactoring this class, make a new FillRenderer instance for each `type`
*/
export default abstract class FillRenderer { // use for highlight, background events, business hours

  context: ComponentContext
  fillSegTag: string = 'div'
  containerElsByType: any // a hash of element sets used for rendering each fill. Keyed by fill name.
  segsByType: any
  dirtySizeFlags: any = {}


  constructor() {
    this.containerElsByType = {}
    this.segsByType = {}
  }


  getSegsByType(type: string) {
    return this.segsByType[type] || []
  }


  renderSegs(type: string, context: ComponentContext, segs: Seg[]) {
    this.context = context

    let renderedSegs = this.renderSegEls(type, segs) // assignes `.el` to each seg. returns successfully rendered segs
    let containerEls = this.attachSegs(type, renderedSegs)

    if (containerEls) {
      (this.containerElsByType[type] || (this.containerElsByType[type] = []))
        .push(...containerEls)
    }

    this.segsByType[type] = renderedSegs

    if (type === 'bgEvent') {
      triggerRenderedSegs(context, renderedSegs, false) // isMirror=false
    }

    this.dirtySizeFlags[type] = true
  }


  // Unrenders a specific type of fill that is currently rendered on the grid
  unrender(type: string, context: ComponentContext) {
    let segs = this.segsByType[type]

    if (segs) {

      if (type === 'bgEvent') {
        triggerWillRemoveSegs(context, segs, false) // isMirror=false
      }

      this.detachSegs(type, segs)
    }
  }


  // Renders and assigns an `el` property for each fill segment. Generic enough to work with different types.
  // Only returns segments that successfully rendered.
  renderSegEls(type, segs: Seg[]) {
    let html = ''
    let i

    if (segs.length) {

      // build a large concatenation of segment HTML
      for (i = 0; i < segs.length; i++) {
        html += this.renderSegHtml(type, segs[i])
      }

      // Grab individual elements from the combined HTML string. Use each as the default rendering.
      // Then, compute the 'el' for each segment.
      htmlToElements(html).forEach((el, i) => {
        let seg = segs[i]

        if (el) {
          seg.el = el
        }
      })

      if (type === 'bgEvent') {
        segs = filterSegsViaEls(
          this.context,
          segs,
          false // isMirror. background events can never be mirror elements
        )
      }

      // correct element type? (would be bad if a non-TD were inserted into a table for example)
      segs = segs.filter((seg) => {
        return elementMatches(seg.el, this.fillSegTag)
      })
    }

    return segs
  }


  // Builds the HTML needed for one fill segment. Generic enough to work with different types.
  renderSegHtml(type, seg: Seg) {
    let css = null
    let classNames = []

    if (type !== 'highlight' && type !== 'businessHours') {
      css = {
        'background-color': seg.eventRange.ui.backgroundColor
      }
    }

    if (type !== 'highlight') {
      classNames = classNames.concat(seg.eventRange.ui.classNames)
    }

    if (type === 'businessHours') {
      classNames.push('fc-bgevent')
    } else {
      classNames.push('fc-' + type.toLowerCase())
    }

    return '<' + this.fillSegTag +
      (classNames.length ? ' class="' + classNames.join(' ') + '"' : '') +
      (css ? ' style="' + cssToStr(css) + '"' : '') +
      '></' + this.fillSegTag + '>'
  }


  abstract attachSegs(type, segs: Seg[]): HTMLElement[] | void


  detachSegs(type, segs: Seg[]) {
    let containerEls = this.containerElsByType[type]

    if (containerEls) {
      containerEls.forEach(removeElement)
      delete this.containerElsByType[type]
    }
  }


  computeSizes(force: boolean) {
    for (let type in this.segsByType) {
      if (force || this.dirtySizeFlags[type]) {
        this.computeSegSizes(this.segsByType[type])
      }
    }
  }


  assignSizes(force: boolean) {
    for (let type in this.segsByType) {
      if (force || this.dirtySizeFlags[type]) {
        this.assignSegSizes(this.segsByType[type])
      }
    }

    this.dirtySizeFlags = {}
  }


  computeSegSizes(segs: Seg[]) {
  }


  assignSegSizes(segs: Seg[]) {
  }

}
