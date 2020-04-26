import { options, render, h, Component } from 'preact'


// BAD, not DRY...
export function flushToDom() { // TODO: move to preact-plugin-package?
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
