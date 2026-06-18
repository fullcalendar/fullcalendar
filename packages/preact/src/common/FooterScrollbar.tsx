import { CssDimValue } from '../scrollgrid/util'
import { watchHeight } from '../component-util/resize-observer'
import { createRef, type Ref } from 'react'
import { Scroller } from '../scrollgrid/Scroller'
import { BaseComponent, setRef } from '../vdom-util'
import { joinClassNames } from '../util/html'
import classNames from '../styles.module.css'

export interface FooterScrollbarProps {
  isSticky?: boolean
  canvasWidth: CssDimValue
  scrollerRef?: Ref<Scroller>
  scrollbarWidthRef?: Ref<number>
}

export class FooterScrollbar extends BaseComponent<FooterScrollbarProps> {
  rootElRef = createRef<HTMLDivElement>()
  private _isUnmounting: boolean
  disconnectHeight?: () => void

  render() {
    const { props } = this

    // NOTE: we need a wrapper around the Scroller because if scrollbars appear/hide,
    // the outer dimensions change, but the inner dimensions do not. The Scroller's
    // dimension-watching, when used in ponyfill-mode, can't fire on border-box change, so we
    // workaround it by monitoring dimensions of a wrapper instead
    return (
      <div
        ref={this.rootElRef}
        className={joinClassNames(
          classNames.footerScrollbar,
          props.isSticky && classNames.footerScrollbarSticky,
        )}
      >
        <Scroller horizontal ref={props.scrollerRef}>
          <div style={{ minWidth: props.canvasWidth }} />
        </Scroller>
      </div>
    )
  }

  componentDidMount(): void {
    this._isUnmounting = false
    this.disconnectHeight = watchHeight(this.rootElRef.current, (height) => {
      if (this._isUnmounting) return
      setRef(this.props.scrollbarWidthRef, height)
    })
  }

  componentWillUnmount(): void {
    this._isUnmounting = true
    this.disconnectHeight()
    setRef(this.props.scrollbarWidthRef, null)
  }
}
