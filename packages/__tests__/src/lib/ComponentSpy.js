
export default class ComponentSpy { // used by anyone?

  renderCount = 0


  constructor(ComponentClass, debugClassName) {
    this.ComponentClass = ComponentClass
    let origDidMount = this.origDidMount = ComponentClass.prototype.componentDidMount
    let origDidUpdate = this.origDidUpdate = ComponentClass.prototype.componentDidUpdate
    let watcher = this

    ComponentClass.prototype.componentDidMount = function() {
      watcher.renderCount++

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
  }


  resetCounts() {
    this.renderCount = 0
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
