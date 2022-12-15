import * as preact from 'preact'
export * from 'preact'
export { createPortal } from 'preact/compat'

/*
NOTE: this can be a public API, especially createElement for hooks.
See examples/typescript-scheduler/src/index.ts
*/

export function flushSync(runBeforeFlush) {
  runBeforeFlush()

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

// TODO: use preact/compat instead?
export function createContext<T>(defaultValue: T) {
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
