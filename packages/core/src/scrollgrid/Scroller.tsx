import { h, ComponentChildren, Ref } from '../vdom'
import { BaseComponent, setRef } from '../vdom-util'
import { CssDimValue, ScrollerLike } from './util'


export type OverflowValue = 'auto' | 'hidden' | 'scroll'

export interface ScrollerProps {
  overflowX: OverflowValue
  overflowY: OverflowValue
  overcomeLeft?: number
  overcomeRight?: number
  overcomeBottom?: number
  maxHeight?: CssDimValue
  liquid?: boolean
  liquidIsAbsolute?: boolean
  children?: ComponentChildren
  elRef?: Ref<HTMLElement>
}

export default class Scroller extends BaseComponent<ScrollerProps> implements ScrollerLike {

  private el: HTMLElement // TODO: just use this.base?


  render(props: ScrollerProps) {
    let className = [ 'fc-scroller' ]
    let { liquid, liquidIsAbsolute } = props
    let isAbsolute = liquid && liquidIsAbsolute

    if (liquid) {
      if (liquidIsAbsolute) {
        className.push('fc-scroller-liquid-absolute')
      } else {
        className.push('fc-scroller-liquid')
      }
    }

    return (
      <div ref={this.handleEl} class={className.join(' ')} style={{
        overflowX: props.overflowX,
        overflowY: props.overflowY,
        left: (isAbsolute && -(props.overcomeLeft || 0)) || '',
        right: (isAbsolute && -(props.overcomeRight || 0)) || '',
        bottom: (isAbsolute && -(props.overcomeBottom || 0)) || '',
        marginLeft: (!isAbsolute && -(props.overcomeLeft || 0)) || '',
        marginRight: (!isAbsolute && -(props.overcomeRight || 0)) || '',
        marginBottom: (!isAbsolute && -(props.overcomeBottom || 0)) || '',
        maxHeight: props.maxHeight || ''
      }}>{props.children}</div>
    )
  }


  handleEl = (el: HTMLElement) => {
    this.el = el
    setRef(this.props.elRef, el)
  }


  needsXScrolling() {
    return this.el.scrollWidth > this.el.clientWidth + 1 || // IE shittiness
      this.props.overflowX === 'auto' && Boolean(this.getXScrollbarWidth()) // hack safeguard
  }


  needsYScrolling() {
    return this.el.scrollHeight > this.el.clientHeight + 1 || // IE shittiness
      this.props.overflowY === 'auto' && Boolean(this.getYScrollbarWidth()) // hack safeguard
  }


  getXScrollbarWidth() {
    if (this.props.overflowX === 'hidden') {
      return 0
    } else {
      return this.el.offsetHeight - this.el.clientHeight // only works because we guarantee no borders
    }
  }


  getYScrollbarWidth() {
    if (this.props.overflowY === 'hidden') {
      return 0
    } else {
      return this.el.offsetWidth - this.el.clientWidth // only works because we guarantee no borders
    }
  }

}
