import { BaseComponent, setRef } from './vdom-util'
import { ComponentChildren, Ref, createElement, VUIEvent } from './vdom'
import { CssDimValue } from './scrollgrid/util'

export interface ViewContainerProps {
  liquid?: boolean
  height?: CssDimValue
  aspectRatio?: number
  onClick?: (ev: VUIEvent) => void
  elRef?: Ref<HTMLDivElement>
  children?: ComponentChildren
}

interface ViewContainerState {
  availableWidth: number | null
}

// TODO: do function component?
export class ViewContainer extends BaseComponent<ViewContainerProps, ViewContainerState> {
  el: HTMLElement

  state: ViewContainerState = {
    availableWidth: null,
  }

  render() {
    let { props, state } = this
    let { aspectRatio } = props

    let classNames = [
      'fc-view-harness',
      (aspectRatio || props.liquid || props.height)
        ? 'fc-view-harness-active' // harness controls the height
        : 'fc-view-harness-passive', // let the view do the height
    ]
    let height: CssDimValue = ''
    let paddingBottom: CssDimValue = ''

    if (aspectRatio) {
      if (state.availableWidth !== null) {
        height = state.availableWidth / aspectRatio
      } else {
        // while waiting to know availableWidth, we can't set height to *zero*
        // because will cause lots of unnecessary scrollbars within scrollgrid.
        // BETTER: don't start rendering ANYTHING yet until we know container width
        // NOTE: why not always use paddingBottom? Causes height oscillation (issue 5606)
        paddingBottom = `${(1 / aspectRatio) * 100}%`
      }
    } else {
      height = props.height || ''
    }

    return (
      <div
        ref={this.handleEl}
        onClick={props.onClick}
        className={classNames.join(' ')}
        style={{ height, paddingBottom }}
      >
        {props.children}
      </div>
    )
  }

  componentDidMount() {
    this.context.addResizeHandler(this.handleResize)
  }

  componentWillUnmount() {
    this.context.removeResizeHandler(this.handleResize)
  }

  handleEl = (el: HTMLElement | null) => {
    this.el = el
    setRef(this.props.elRef, el)
    this.updateAvailableWidth()
  }

  handleResize = () => {
    this.updateAvailableWidth()
  }

  updateAvailableWidth() {
    if (
      this.el && // needed. but why?
      this.props.aspectRatio // aspectRatio is the only height setting that needs availableWidth
    ) {
      this.setState({ availableWidth: this.el.offsetWidth })
    }
  }
}
