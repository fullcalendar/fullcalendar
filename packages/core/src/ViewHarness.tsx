import { BaseComponent, setRef } from './vdom-util.js'
import { ComponentChildren, Ref, createElement } from './preact.js'
import { CssDimValue } from './scrollgrid/util.js'

export interface ViewHarnessProps {
  elRef?: Ref<HTMLDivElement>
  labeledById?: string
  liquid?: boolean
  height?: CssDimValue
  aspectRatio?: number
  children?: ComponentChildren
}

interface ViewHarnessState {
  availableWidth: number | null
}

export class ViewHarness extends BaseComponent<ViewHarnessProps, ViewHarnessState> {
  el: HTMLElement

  state: ViewHarnessState = {
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
        aria-labelledby={props.labeledById}
        ref={this.handleEl}
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
