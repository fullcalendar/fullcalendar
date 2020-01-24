
export default class ComponentSpy {

  renderCount = 0
  sizingCount = 0


  constructor(ComponentClass, debugClassName) {
    this.ComponentClass = ComponentClass
    let origDidMount = this.origDidMount = ComponentClass.prototype.componentDidMount
    let origDidUpdate = this.origDidUpdate = ComponentClass.prototype.componentDidUpdate
    let origHandleSizing = null
    let watcher = this

    ComponentClass.prototype.componentDidMount = function() {
      watcher.renderCount++

      if (this.handleSizing) {
        origHandleSizing = this.handleSizing
        this.handleSizing = handleSizing
      }

      if (debugClassName) {
        console.log(debugClassName + '::componentDidMount', watcher.renderCount)
      }

      if (origDidMount) {
        origDidMount.apply(this, arguments)
      }
    }

    ComponentClass.prototype.componentDidUpdate = function() {
      watcher.renderCount++

      if (debugClassName) {
        console.log(debugClassName + '::componentDidUpdate', watcher.renderCount)
      }

      if (origDidUpdate) {
        origDidUpdate.apply(this, arguments)
      }
    }

    function handleSizing() {
      watcher.sizingCount++

      if (debugClassName) {
        console.log(debugClassName + '::handleSizing', watcher.sizingCount)
      }

      origHandleSizing.apply(this, arguments)
    }
  }


  resetCounts() {
    this.renderCount = 0
    this.sizingCount = 0
  }


  detach() {
    let proto = this.ComponentClass.prototype

    delete proto.componentDidMount
    if (proto.componentDidMount !== this.origDidMount) {
      proto.componentDidMount = this.origDidMount
    }

    delete proto.componentDidUpdate
    if (proto.componentDidUpdate !== this.origDidUpdate) {
      proto.componentDidUpdate = this.origDidUpdate
    }
  }

}
