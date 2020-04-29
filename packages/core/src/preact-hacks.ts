import { options, render, h, Component, createContext as origCreateContext } from 'preact'


// TODO: lock version
// TODO: link gh issues


export function flushToDom() {
  let oldDebounceRendering = options.debounceRendering // orig
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


export function createContext<T>(defaultValue: T) {
  let ContextType = origCreateContext<T>(defaultValue)
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
