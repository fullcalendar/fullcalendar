
/* A rectangular panel that is absolutely positioned over other content
------------------------------------------------------------------------------------------------------------------------*/

import {
  createElement,
  applyStyle,
  listenBySelector,
  computeClippingRect, computeRect, Component, ComponentContext
} from '@fullcalendar/core'

export interface PopoverProps {
  clippingEl: HTMLElement
  extraClassName?: string
  top?: number
  left?: number
  right?: number
  onClose?: () => void
}

export default class Popover extends Component<PopoverProps> {


  render(props: PopoverProps, context: ComponentContext) {
    let el = createElement('div', {
      className: [
        'fc-popover',
        context.theme.getClass('popover'),
        props.extraClassName || ''
      ].join(' '),
      style: {
        top: '0',
        left: '0'
      }
    })

    if (props.onClose) {
      // when a click happens on anything inside with a 'fc-close' className, hide the popover
      listenBySelector(el, 'click', '.fc-close', props.onClose)
    }

    return el
  }


  componentDidMount() {
    positionEl(this.rootEl, this.props)

    document.addEventListener('mousedown', this.onDocumentMousedown)
  }


  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onDocumentMousedown)
  }


  // Triggered when the user clicks *anywhere* in the document, for the autoHide feature
  onDocumentMousedown = (ev) => {
    let { onClose } = this.props

    // only hide the popover if the click happened outside the popover
    if (onClose && !this.rootEl.contains(ev.target)) {
      onClose()
    }
  }

}


// Positions the popover optimally, using the top/left/right options
function positionEl(el: HTMLElement, props: PopoverProps) {
  let elDims = el.getBoundingClientRect() // only used for width,height
  let origin = computeRect(el.offsetParent)
  let clippingRect = computeClippingRect(props.clippingEl)
  let top // the "position" (not "offset") values for the popover
  let left //

  // compute top and left
  top = props.top || 0
  if (props.left !== undefined) {
    left = props.left
  } else if (props.right !== undefined) {
    left = props.right - elDims.width // derive the left value from the right value
  } else {
    left = 0
  }

  // constrain to the view port. if constrained by two edges, give precedence to top/left
  top = Math.min(top, clippingRect.bottom - elDims.height - this.margin)
  top = Math.max(top, clippingRect.top + this.margin)
  left = Math.min(left, clippingRect.right - elDims.width - this.margin)
  left = Math.max(left, clippingRect.left + this.margin)

  applyStyle(el, {
    top: top - origin.top,
    left: left - origin.left
  })
}
