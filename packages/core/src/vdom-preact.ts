
export { Component, render, createRef, VNode, Fragment, ComponentChildren, createContext, Ref, h, RefObject, ComponentType } from 'preact'
import { Component, h, options, render } from 'preact'


export function flushToDom() {
  let oldDebounceRendering = options.debounceRendering
  let callbackQ = []

  function execCallbackSync(callback) {
    callbackQ.push(callback)
  }

  options.debounceRendering = execCallbackSync
  render(h(FakeComponent, {}), document.createElement('div'))

  while (callbackQ.length) {
    callbackQ.shift()()
  }

  options.debounceRendering = oldDebounceRendering
}


class FakeComponent extends Component {
  render() { return h('div', {}) }
  componentDidMount() { this.setState({}) }
}
