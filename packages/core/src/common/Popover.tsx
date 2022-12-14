import { Dictionary } from '../options.js'
import { computeClippedClientRect } from '../util/dom-geom.js'
import { applyStyle, elementClosest, getEventTargetViaRoot, getUniqueDomId } from '../util/dom-manip.js'
import { createElement, ComponentChildren, Ref, createPortal } from '../preact.js'
import { BaseComponent, setRef } from '../vdom-util.js'

export interface PopoverProps {
  elRef?: Ref<HTMLElement>
  id: string
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
  state = {
    titleId: getUniqueDomId(),
  }

  render(): any {
    let { theme, options } = this.context
    let { props, state } = this
    let classNames = [
      'fc-popover',
      theme.getClass('popover'),
    ].concat(
      props.extraClassNames || [],
    )

    return createPortal(
      <div
        {...props.extraAttrs}
        id={props.id}
        className={classNames.join(' ')}
        aria-labelledby={state.titleId}
        ref={this.handleRootEl}
      >
        <div className={'fc-popover-header ' + theme.getClass('popoverHeader')}>
          <span className="fc-popover-title" id={state.titleId}>
            {props.title}
          </span>
          <span
            className={'fc-popover-close ' + theme.getIconClass('close')}
            title={options.closeHint}
            onClick={this.handleCloseClick}
          />
        </div>
        <div className={'fc-popover-body ' + theme.getClass('popoverContent')}>
          {props.children}
        </div>
      </div>,
      props.parentEl,
    )
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleDocumentMouseDown)
    document.addEventListener('keydown', this.handleDocumentKeyDown)
    this.updateSize()
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleDocumentMouseDown)
    document.removeEventListener('keydown', this.handleDocumentKeyDown)
  }

  handleRootEl = (el: HTMLElement | null) => {
    this.rootEl = el

    if (this.props.elRef) {
      setRef(this.props.elRef, el)
    }
  }

  // Triggered when the user clicks *anywhere* in the document, for the autoHide feature
  handleDocumentMouseDown = (ev) => {
    // only hide the popover if the click happened outside the popover
    const target = getEventTargetViaRoot(ev) as HTMLElement
    if (!this.rootEl.contains(target)) {
      this.handleCloseClick()
    }
  }

  handleDocumentKeyDown = (ev) => {
    if (ev.key === 'Escape') {
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
