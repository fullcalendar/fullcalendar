import {
  h, ComponentChildren, createRef,
  applyStyle, BaseComponent, ComponentContext, DelayedRunner
} from '@fullcalendar/core'


export interface PopoverProps {
  title: string
  children?: ComponentChildren
  extraClassName?: string
  alignmentEl: HTMLElement
  topAlignmentEl?: HTMLElement
  onClose?: () => void
}

const PADDING_FROM_VIEWPORT = 10
const SCROLL_DEBOUNCE = 10


export default class Popover extends BaseComponent<PopoverProps> {

  private rootElRef = createRef<HTMLDivElement>()
  private repositioner = new DelayedRunner(this.updateSize.bind(this))


  render(props: PopoverProps, state: {}, context: ComponentContext) {
    let { theme } = context
    let classNames = [ 'fc-popover', context.theme.getClass('popover'), props.extraClassName ]

    return (
      <div class={classNames.join(' ')} ref={this.rootElRef}>
        <div class={'fc-header ' + theme.getClass('popoverHeader')}>
          <span class='fc-title'>
            {props.title}
          </span>
          <span class={'fc-close ' + theme.getIconClass('close')} onClick={this.handleCloseClick}></span>
        </div>
        <div class={'fc-body ' + theme.getClass('popoverContent')}>
          {props.children}
        </div>
      </div>
    )
  }


  componentDidMount() {
    document.addEventListener('mousedown', this.handleDocumentMousedown)
    document.addEventListener('scroll', this.handleDocumentScroll)
    this.updateSize()
  }


  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleDocumentMousedown)
    document.removeEventListener('scroll', this.handleDocumentScroll)
  }


  // Triggered when the user clicks *anywhere* in the document, for the autoHide feature
  handleDocumentMousedown = (ev) => {
    let { onClose } = this.props
    let rootEl = this.rootElRef.current

    // only hide the popover if the click happened outside the popover
    if (onClose && !rootEl.contains(ev.target)) {
      onClose()
    }
  }


  handleDocumentScroll = () => {
    this.repositioner.request(SCROLL_DEBOUNCE)
  }


  handleCloseClick = () => {
    let { onClose } = this.props

    if (onClose) {
      onClose()
    }
  }


  /*
  NOTE: the popover is position:fixed, so coordinates are relative to the viewport
  NOTE: the PARENT calls this as well, on window resize. we would have wanted to use the repositioner,
        but need to ensure that all other components have updated size first (for alignmentEl)
  */
  updateSize() {
    let { alignmentEl, topAlignmentEl } = this.props
    let rootEl = this.rootElRef.current

    if (!rootEl) {
      return // not sure why this was null, but we shouldn't let external components call updateSize() anyway
    }

    let dims = rootEl.getBoundingClientRect() // only used for width,height
    let alignment = alignmentEl.getBoundingClientRect()

    let top = topAlignmentEl ? topAlignmentEl.getBoundingClientRect().top : alignment.top
    top = Math.min(top, window.innerHeight - dims.height - PADDING_FROM_VIEWPORT)
    top = Math.max(top, PADDING_FROM_VIEWPORT)

    let left: number

    if (this.context.isRtl) {
      left = alignment.right - dims.width
    } else {
      left = alignment.left
    }

    left = Math.min(left, window.innerWidth - dims.width - PADDING_FROM_VIEWPORT)
    left = Math.max(left, PADDING_FROM_VIEWPORT)

    applyStyle(rootEl, { top, left })
  }

}
