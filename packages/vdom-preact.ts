import * as preact from 'preact'

// NOTE: this file cannot include other helper files. because of how dts is generated

declare global {
  namespace FullCalendarVDom {
    export import Ref = preact.Ref
    export import RefObject = preact.RefObject
    export import ComponentType = preact.ComponentType
    export type VNode = preact.VNode // will NOT forward the props type
    export import Context = preact.Context
    export import Component = preact.Component
    export import ComponentChild = preact.ComponentChild
    export import ComponentChildren = preact.ComponentChildren
    export import h = preact.h
    export import render = preact.render
    export import createRef = preact.createRef
    export import Fragment = preact.Fragment
    export import createContext = preact.createContext
    export type VUIEvent = UIEvent
  }
}

window.FullCalendarVDom = {
  Component: preact.Component,
  h: preact.h,
  render: preact.render,
  createRef: preact.createRef,
  Fragment: preact.Fragment,
  createContext // custom implementation
}


// HACKS...
// TODO: lock version
// TODO: link gh issues


export function flushToDom() {
  let oldDebounceRendering = preact.options.debounceRendering // orig
  let callbackQ = []

  function execCallbackSync(callback) {
    callbackQ.push(callback)
  }

  preact.options.debounceRendering = execCallbackSync
  preact.render(preact.h(FakeComponent, {}), document.createElement('div'))

  while (callbackQ.length) {
    callbackQ.shift()()
  }

  preact.options.debounceRendering = oldDebounceRendering
}

class FakeComponent extends preact.Component {
  render() { return preact.h('div', {}) }
  componentDidMount() { this.setState({}) }
}


function createContext<T>(defaultValue: T) {
  let ContextType = preact.createContext<T>(defaultValue)
  let origProvider = ContextType.Provider

  ContextType.Provider = function() {
    let isNew = !this.getChildContext
    let children = origProvider.apply(this, arguments as any)

    if (isNew) {
      let subs = []

      this.shouldComponentUpdate = (_props) => {
        if (this.props.value !== _props.value) {
          subs.some(c => {
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
