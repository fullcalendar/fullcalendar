import * as preact from 'preact'
import * as preactCompat from 'preact/compat'

// NOTE: this file cannot include other helper files. because of how dts is generated

declare global {
  namespace FullCalendarVDom {
    export import Ref = preact.Ref
    export import RefObject = preact.RefObject
    export import ComponentType = preact.ComponentType
    export type VNode = preact.VNode<any> // will NOT forward the props type
    export import Context = preact.Context
    export import Component = preact.Component
    export import ComponentChild = preact.ComponentChild
    export import ComponentChildren = preact.ComponentChildren
    export import createElement = preact.createElement
    export import render = preact.render
    export import createRef = preact.createRef
    export import Fragment = preact.Fragment
    export import createContext = preact.createContext
    export import createPortal = preactCompat.createPortal
    export type VUIEvent = UIEvent
    export function flushToDom(): void
    export function unmountComponentAtNode(node: HTMLElement): void
  }
}

let globalObj = typeof globalThis !== 'undefined' ? globalThis : window // // TODO: streamline when killing IE11 support

if (globalObj.FullCalendarVDom) {
  console.warn('FullCalendar VDOM already loaded')
} else {
  globalObj.FullCalendarVDom = {
    Component: preact.Component,
    createElement: preact.createElement,
    render: preact.render,
    createRef: preact.createRef,
    Fragment: preact.Fragment,
    createContext, // custom implementation
    createPortal: preactCompat.createPortal,
    flushToDom,
    unmountComponentAtNode,
  }
}

// HACKS...
// TODO: lock version
// TODO: link gh issues

function flushToDom() {
  let oldDebounceRendering = preact.options.debounceRendering // orig
  let callbackQ = []

  function execCallbackSync(callback) {
    callbackQ.push(callback)
  }

  preact.options.debounceRendering = execCallbackSync
  preact.render(preact.createElement(FakeComponent, {}), document.createElement('div'))

  while (callbackQ.length) {
    callbackQ.shift()()
  }

  preact.options.debounceRendering = oldDebounceRendering
}

class FakeComponent extends preact.Component {
  render() { return preact.createElement('div', {}) }
  componentDidMount() { this.setState({}) }
}

function createContext<T>(defaultValue: T) {
  let ContextType = preact.createContext<T>(defaultValue)
  let origProvider = ContextType.Provider

  ContextType.Provider = function () { // eslint-disable-line func-names
    let isNew = !this.getChildContext
    let children = origProvider.apply(this, arguments as any) // eslint-disable-line prefer-rest-params

    if (isNew) {
      let subs = []

      this.shouldComponentUpdate = (_props) => {
        if (this.props.value !== _props.value) {
          subs.forEach((c) => {
            c.context = _props.value
            c.forceUpdate()
          })
        }
      }

      this.sub = (c) => {
        subs.push(c)
        let old = c.componentWillUnmount
        c.componentWillUnmount = () => {
          subs.splice(subs.indexOf(c), 1)
          old && old.call(c)
        }
      }
    }

    return children
  }

  return ContextType
}

function unmountComponentAtNode(node: HTMLElement) {
  preact.render(null, node)
}
