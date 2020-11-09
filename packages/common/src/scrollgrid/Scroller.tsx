import { createElement, ComponentChildren, Ref } from '../vdom'
import { BaseComponent, setRef } from '../vdom-util'
import { CssDimValue, ScrollerLike } from './util'

export type OverflowValue = 'auto' | 'hidden' | 'scroll' | 'visible'

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

const VISIBLE_HIDDEN_RE = /^(visible|hidden)$/

export class Scroller extends BaseComponent<ScrollerProps> implements ScrollerLike {
  private el: HTMLElement // TODO: just use this.base?

  render() {
    let { props } = this
    let { liquid, liquidIsAbsolute } = props
    let isAbsolute = liquid && liquidIsAbsolute
    let className = ['fc-scroller']

    if (liquid) {
      if (liquidIsAbsolute) {
        className.push('fc-scroller-liquid-absolute')
      } else {
        className.push('fc-scroller-liquid')
      }
    }

    return (
      <div
        ref={this.handleEl}
        className={className.join(' ')}
        style={{
          overflowX: props.overflowX,
          overflowY: props.overflowY,
          left: (isAbsolute && -(props.overcomeLeft || 0)) || '',
          right: (isAbsolute && -(props.overcomeRight || 0)) || '',
          bottom: (isAbsolute && -(props.overcomeBottom || 0)) || '',
          marginLeft: (!isAbsolute && -(props.overcomeLeft || 0)) || '',
          marginRight: (!isAbsolute && -(props.overcomeRight || 0)) || '',
          marginBottom: (!isAbsolute && -(props.overcomeBottom || 0)) || '',
          maxHeight: props.maxHeight || '',
        }}
      >
        {props.children}
      </div>
    )
  }

  handleEl = (el: HTMLElement) => {
    this.el = el
    setRef(this.props.elRef, el)
  }

  needsXScrolling() {
    if (VISIBLE_HIDDEN_RE.test(this.props.overflowX)) {
      return false
    }

    // testing scrollWidth>clientWidth is unreliable cross-browser when pixel heights aren't integers.
    // much more reliable to see if children are taller than the scroller, even tho doesn't account for
    // inner-child margins and absolute positioning

    let { el } = this
    let realClientWidth = this.el.getBoundingClientRect().width - this.getYScrollbarWidth()
    let { children } = el

    for (let i = 0; i < children.length; i += 1) {
      let childEl = children[i]

      if (childEl.getBoundingClientRect().width > realClientWidth) {
        return true
      }
    }

    return false
  }

  needsYScrolling() {
    if (VISIBLE_HIDDEN_RE.test(this.props.overflowY)) {
      return false
    }

    // testing scrollHeight>clientHeight is unreliable cross-browser when pixel heights aren't integers.
    // much more reliable to see if children are taller than the scroller, even tho doesn't account for
    // inner-child margins and absolute positioning

    let { el } = this
    let realClientHeight = this.el.getBoundingClientRect().height - this.getXScrollbarWidth()
    let { children } = el

    for (let i = 0; i < children.length; i += 1) {
      let childEl = children[i]

      if (childEl.getBoundingClientRect().height > realClientHeight) {
        return true
      }
    }

    return false
  }

  getXScrollbarWidth() {
    if (VISIBLE_HIDDEN_RE.test(this.props.overflowX)) {
      return 0
    }
    return this.el.offsetHeight - this.el.clientHeight // only works because we guarantee no borders. TODO: add to CSS with important?
  }

  getYScrollbarWidth() {
    if (VISIBLE_HIDDEN_RE.test(this.props.overflowY)) {
      return 0
    }
    return this.el.offsetWidth - this.el.clientWidth // only works because we guarantee no borders. TODO: add to CSS with important?
  }
}
