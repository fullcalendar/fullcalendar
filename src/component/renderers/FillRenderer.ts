import { cssToStr } from '../../util/html'
import { htmlToElements, removeElement } from '../../util/dom'


export default class FillRenderer { // use for highlight, background events, business hours

  fillSegTag: string = 'div'
  component: any
  elsByFill: any // a hash of element sets used for rendering each fill. Keyed by fill name.


  constructor(component) {
    this.component = component
    this.elsByFill = {}
  }


  renderFootprint(type, componentFootprint, props) {
    this.renderSegs(
      type,
      this.component.componentFootprintToSegs(componentFootprint),
      props
    )
  }


  renderSegs(type, segs, props) {
    let els

    segs = this.buildSegEls(type, segs, props) // assignes `.el` to each seg. returns successfully rendered segs
    els = this.attachSegEls(type, segs)

    if (els) {
      this.reportEls(type, els)
    }

    return segs
  }


  // Unrenders a specific type of fill that is currently rendered on the grid
  unrender(type) {
    let els = this.elsByFill[type]
    if (els) {
      els.forEach(removeElement)
      delete this.elsByFill[type]
    }
  }


  // Renders and assigns an `el` property for each fill segment. Generic enough to work with different types.
  // Only returns segments that successfully rendered.
  buildSegEls(type, segs, props) {
    let html = ''
    let renderedSegs = []
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

        // allow custom filter methods per-type
        if (props.filterEl) {
          el = props.filterEl(seg, el)
        }

        if (
          el instanceof HTMLElement && // non-null (from filter func) and correct object type
          el.nodeName.toLocaleLowerCase() === this.fillSegTag // correct element type? (would be bad if a non-TD were inserted into a table for example)
        ) {
          seg.el = el
          renderedSegs.push(seg)
        }
      })
    }

    return renderedSegs
  }


  // Builds the HTML needed for one fill segment. Generic enough to work with different types.
  buildSegHtml(type, seg, props) {
    // custom hooks per-type
    let classes = props.getClasses ? props.getClasses(seg) : []
    let css = cssToStr(props.getCss ? props.getCss(seg) : {})

    return '<' + this.fillSegTag +
      (classes.length ? ' class="' + classes.join(' ') + '"' : '') +
      (css ? ' style="' + css + '"' : '') +
      '></' + this.fillSegTag + '>'
  }


  // Should return wrapping DOM structure
  attachSegEls(type, segs) {
    // subclasses must implement
  }


  reportEls(type, els) {
    (this.elsByFill[type] || (this.elsByFill[type] = []))
      .push(...els)
  }

}
