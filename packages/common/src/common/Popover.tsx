import { Dictionary } from '../options'
import { computeClippedClientRect } from '../util/dom-geom'
import { applyStyle, elementClosest, getEventTargetViaRoot } from '../util/dom-manip'
import { createElement, ComponentChildren, Ref, createPortal } from '../vdom'
import { BaseComponent, setRef } from '../vdom-util'

export interface PopoverProps {
  elRef?: Ref<HTMLElement>
  title: string
  extraClassNames?: string[]
  extraAttrs?: Dictionary
  parentEl: HTMLElement
  alignmentEl: HTMLElement
  alignGridTop?: boolean
  children?: ComponentChildren
  onClose?: () => void
}

const PADDING_FROM_VIEWPORT = 10

export class Popover extends BaseComponent<PopoverProps> {
  private rootEl: HTMLElement

  render() {
    let { theme } = this.context
    let { props } = this
    let classNames = [
      'fc-popover',
      theme.getClass('popover'),
    ].concat(
      props.extraClassNames || [],
    )

    return createPortal(
      <div className={classNames.join(' ')} {...props.extraAttrs} ref={this.handleRootEl}>
        <div className={'fc-popover-header ' + theme.getClass('popoverHeader')}>
          <span className="fc-popover-title">
            {props.title}
          </span>
          <span className={'fc-popover-close ' + theme.getIconClass('close')} onClick={this.handleCloseClick} />
        </div>
        <div className={'fc-popover-body ' + theme.getClass('popoverContent')}>
          {props.children}
        </div>
      </div>,
      props.parentEl,
    )
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleDocumentMousedown)
    this.updateSize()
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleDocumentMousedown)
  }

  handleRootEl = (el: HTMLElement | null) => {
    this.rootEl = el

    if (this.props.elRef) {
      setRef(this.props.elRef, el)
    }
  }

  // Triggered when the user clicks *anywhere* in the document, for the autoHide feature
  handleDocumentMousedown = (ev) => {
    // only hide the popover if the click happened outside the popover
    const target = getEventTargetViaRoot(ev) as HTMLElement
    if (!this.rootEl.contains(target)) {
      this.handleCloseClick()
    }
  }

  handleCloseClick = () => {
    let { onClose } = this.props
    if (onClose) {
      onClose()
    }
  }

  private updateSize() {
    let { isRtl } = this.context
    let { alignmentEl, alignGridTop } = this.props
    let { rootEl } = this

    let alignmentRect = computeClippedClientRect(alignmentEl)
    if (alignmentRect) {
      let popoverDims = rootEl.getBoundingClientRect()

      // position relative to viewport
      let popoverTop = alignGridTop
        ? elementClosest(alignmentEl, '.fc-scrollgrid').getBoundingClientRect().top
        : alignmentRect.top
      let popoverLeft = isRtl ? alignmentRect.right - popoverDims.width : alignmentRect.left

      // constrain
      popoverTop = Math.max(popoverTop, PADDING_FROM_VIEWPORT)
      popoverLeft = Math.min(popoverLeft, document.documentElement.clientWidth - PADDING_FROM_VIEWPORT - popoverDims.width)
      popoverLeft = Math.max(popoverLeft, PADDING_FROM_VIEWPORT)

      let origin = rootEl.offsetParent.getBoundingClientRect()
      applyStyle(rootEl, {
        top: popoverTop - origin.top,
        left: popoverLeft - origin.left,
      })
    }
  }
}
