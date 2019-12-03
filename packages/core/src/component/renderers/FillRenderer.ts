import { cssToStr } from '../../util/html'
import { htmlToElements, elementMatches } from '../../util/dom-manip'
import { Seg } from '../DateComponent'
import { filterSegsViaEls, triggerPositionedSegs, triggerWillRemoveSegs } from '../event-rendering'
import ComponentContext from '../ComponentContext'
import { SubRenderer, subrenderer } from '../../vdom-util'

export interface BaseFillRendererProps {
  segs: Seg[]
  type: string
}

// use for highlight, background events, business hours
export default abstract class FillRenderer<FillRendererProps extends BaseFillRendererProps> extends SubRenderer<FillRendererProps> {

  renderSegs = subrenderer(this._renderSegs, this._unrenderSegs)

  fillSegTag: string = 'div'

  // for sizing
  private segs: Seg[]
  private isSizeDirty: boolean = false // NOTE: should also flick this when attaching segs to new containers


  _renderSegs({ segs, type }: BaseFillRendererProps, context: ComponentContext) {

    // assignes `.el` to each seg. returns successfully rendered segs, a SUBSET
    segs = this.renderSegEls(segs, type)

    if (type === 'bgEvent') {
      triggerPositionedSegs(context, segs, false) // isMirror=false
    }

    this.segs = segs
    this.isSizeDirty = true

    return segs
  }


  // Unrenders a specific type of fill that is currently rendered on the grid
  _unrenderSegs(segs: Seg[], context: ComponentContext) {
    if (this.props.type === 'bgEvent') {
      triggerWillRemoveSegs(context, segs, false) // isMirror=false
    }
  }


  // Renders and assigns an `el` property for each fill segment. Generic enough to work with different types.
  // Only returns segments that successfully rendered.
  renderSegEls(segs: Seg[], type: string) {
    let html = ''
    let i

    if (segs.length) {

      // build a large concatenation of segment HTML
      for (i = 0; i < segs.length; i++) {
        html += this.renderSegHtml(segs[i])
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
  renderSegHtml(seg: Seg) {
    let { type } = this.props
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


  computeSizes(force: boolean, userComponent: any) {
    if (force || this.isSizeDirty) {
      this.computeSegSizes(this.segs, userComponent)
    }
  }


  assignSizes(force: boolean, userComponent: any) {
    if (force || this.isSizeDirty) {
      this.assignSegSizes(this.segs, userComponent)
    }

    this.isSizeDirty = false
  }


  computeSegSizes(seg: Seg[], userComponent: any) {
  }


  assignSegSizes(seg: Seg[], userComponent: any) {
  }

}
