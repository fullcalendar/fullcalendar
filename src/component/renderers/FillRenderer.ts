import { cssToStr } from '../../util/html'
import { htmlToElements, removeElement, elementMatches } from '../../util/dom-manip'
import { Seg } from '../DateComponent'


export default class FillRenderer { // use for highlight, background events, business hours

  fillSegTag: string = 'div'
  component: any
  containerElsByType: any // a hash of element sets used for rendering each fill. Keyed by fill name.
  renderedSegsByType: any


  constructor(component) {
    this.component = component
    this.containerElsByType = {}
    this.renderedSegsByType = {}
  }


  // TODO: try to make props smallers
  renderSegs(type, segs: Seg[], props) {
    let renderedSegs = this.buildSegEls(type, segs, props) // assignes `.el` to each seg. returns successfully rendered segs
    let containerEls = this.attachSegEls(type, renderedSegs)

    if (containerEls) {
      (this.containerElsByType[type] || (this.containerElsByType[type] = []))
        .push(...containerEls)
    }

    this.renderedSegsByType[type] = renderedSegs
  }


  // Unrenders a specific type of fill that is currently rendered on the grid
  unrender(type) {
    let containerEls = this.containerElsByType[type]

    if (containerEls) {
      containerEls.forEach(removeElement)
      delete this.containerElsByType[type]
    }

    delete this.renderedSegsByType[type]
  }


  // Renders and assigns an `el` property for each fill segment. Generic enough to work with different types.
  // Only returns segments that successfully rendered.
  buildSegEls(type, segs: Seg[], props) {
    let html = ''
    let i

    if (segs.length) {

      // build a large concatenation of segment HTML
      for (i = 0; i < segs.length; i++) {
        html += this.buildSegHtml(type, segs[i], props)
      }

      // Grab individual elements from the combined HTML string. Use each as the default rendering.
      // Then, compute the 'el' for each segment.
      htmlToElements(html).forEach((el, i) => {
        let seg = segs[i]

        if (el) {
          seg.el = el
        }
      })

      if (props.filterSegs) {
        segs = props.filterSegs(segs)
      }

      // correct element type? (would be bad if a non-TD were inserted into a table for example)
      segs = segs.filter((seg) => {
        return elementMatches(seg.el, this.fillSegTag)
      })
    }

    return segs
  }


  // Builds the HTML needed for one fill segment. Generic enough to work with different types.
  buildSegHtml(type, seg: Seg, props) {
    // custom hooks per-type
    let classes = props.getClasses ? props.getClasses(seg) : []
    let css = cssToStr(props.getCss ? props.getCss(seg) : {})

    return '<' + this.fillSegTag +
      (classes.length ? ' class="' + classes.join(' ') + '"' : '') +
      (css ? ' style="' + css + '"' : '') +
      '></' + this.fillSegTag + '>'
  }


  // Should return wrapping DOM structure
  attachSegEls(type, segs: Seg[]): HTMLElement[] {
    // subclasses must implement
    return null
  }


  computeSize(type: string) {
  }

  assignSize(type: string) {
  }

}
