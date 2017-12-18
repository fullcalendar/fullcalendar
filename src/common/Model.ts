import Class from './Class'
import { default as EmitterMixin, EmitterInterface } from './EmitterMixin'
import { default as ListenerMixin, ListenerInterface } from './ListenerMixin'


export default class Model extends Class {

  on: EmitterInterface['on']
  one: EmitterInterface['one']
  off: EmitterInterface['off']
  trigger: EmitterInterface['trigger']
  triggerWith: EmitterInterface['triggerWith']
  hasHandlers: EmitterInterface['hasHandlers']
  listenTo: ListenerInterface['listenTo']
  stopListeningTo: ListenerInterface['stopListeningTo']

  _props: any
  _watchers: any
  _globalWatchArgs: any // initialized after class

  constructor() {
    super()
    this._watchers = {}
    this._props = {}
    this.applyGlobalWatchers()
    this.constructed()
  }

  static watch(name, ...args) {
    // subclasses should make a masked-copy of the superclass's map
    // TODO: write test
    if (!this.prototype.hasOwnProperty('_globalWatchArgs')) {
      this.prototype._globalWatchArgs = Object.create(this.prototype._globalWatchArgs)
    }

    this.prototype._globalWatchArgs[name] = args
  }

  constructed() {
    // useful for monkeypatching. TODO: BaseClass?
  }

  applyGlobalWatchers() {
    let map = this._globalWatchArgs
    let name

    for (name in map) {
      this.watch.apply(this, [ name ].concat(map[name]))
    }
  }

  has(name) {
    return name in this._props
  }

  get(name) {
    if (name === undefined) {
      return this._props
    }

    return this._props[name]
  }

  set(name, val) {
    let newProps

    if (typeof name === 'string') {
      newProps = {}
      newProps[name] = val === undefined ? null : val
    } else {
      newProps = name
    }

    this.setProps(newProps)
  }

  reset(newProps) {
    let oldProps = this._props
    let changeset = {} // will have undefined's to signal unsets
    let name

    for (name in oldProps) {
      changeset[name] = undefined
    }

    for (name in newProps) {
      changeset[name] = newProps[name]
    }

    this.setProps(changeset)
  }

  unset(name) { // accepts a string or array of strings
    let newProps = {}
    let names
    let i

    if (typeof name === 'string') {
      names = [ name ]
    } else {
      names = name
    }

    for (i = 0; i < names.length; i++) {
      newProps[names[i]] = undefined
    }

    this.setProps(newProps)
  }

  setProps(newProps) {
    let changedProps = {}
    let changedCnt = 0
    let name
    let val

    for (name in newProps) {
      val = newProps[name]

      // a change in value?
      // if an object, don't check equality, because might have been mutated internally.
      // TODO: eventually enforce immutability.
      if (
        typeof val === 'object' ||
        val !== this._props[name]
      ) {
        changedProps[name] = val
        changedCnt++
      }
    }

    if (changedCnt) {

      this.trigger('before:batchChange', changedProps)

      for (name in changedProps) {
        val = changedProps[name]

        this.trigger('before:change', name, val)
        this.trigger('before:change:' + name, val)
      }

      for (name in changedProps) {
        val = changedProps[name]

        if (val === undefined) {
          delete this._props[name]
        } else {
          this._props[name] = val
        }

        this.trigger('change:' + name, val)
        this.trigger('change', name, val)
      }

      this.trigger('batchChange', changedProps)
    }
  }

  watch(name, depList, startFunc, stopFunc?) {
    this.unwatch(name)

    this._watchers[name] = this._watchDeps(depList, (deps) => {
      let res = startFunc.call(this, deps)

      if (res && res.then) {
        this.unset(name) // put in an unset state while resolving
        res.then((val) => {
          this.set(name, val)
        })
      } else {
        this.set(name, res)
      }
    }, (deps) => {
      this.unset(name)

      if (stopFunc) {
        stopFunc.call(this, deps)
      }
    })
  }

  unwatch(name) {
    let watcher = this._watchers[name]

    if (watcher) {
      delete this._watchers[name]
      watcher.teardown()
    }
  }

  _watchDeps(depList, startFunc, stopFunc) {
    let queuedChangeCnt = 0
    let depCnt = depList.length
    let satisfyCnt = 0
    let values = {} // what's passed as the `deps` arguments
    let bindTuples = [] // array of [ eventName, handlerFunc ] arrays
    let isCallingStop = false

    const onBeforeDepChange = (depName, val, isOptional) => {
      queuedChangeCnt++
      if (queuedChangeCnt === 1) { // first change to cause a "stop" ?
        if (satisfyCnt === depCnt) { // all deps previously satisfied?
          isCallingStop = true
          stopFunc(values)
          isCallingStop = false
        }
      }
    }

    const onDepChange = (depName, val, isOptional) => {

      if (val === undefined) { // unsetting a value?

        // required dependency that was previously set?
        if (!isOptional && values[depName] !== undefined) {
          satisfyCnt--
        }

        delete values[depName]
      } else { // setting a value?

        // required dependency that was previously unset?
        if (!isOptional && values[depName] === undefined) {
          satisfyCnt++
        }

        values[depName] = val
      }

      queuedChangeCnt--
      if (!queuedChangeCnt) { // last change to cause a "start"?

        // now finally satisfied or satisfied all along?
        if (satisfyCnt === depCnt) {

          // if the stopFunc initiated another value change, ignore it.
          // it will be processed by another change event anyway.
          if (!isCallingStop) {
            startFunc(values)
          }
        }
      }
    }

    // intercept for .on() that remembers handlers
    const bind = (eventName, handler) => {
      this.on(eventName, handler)
      bindTuples.push([ eventName, handler ])
    }

    // listen to dependency changes
    depList.forEach((depName) => {
      let isOptional = false

      if (depName.charAt(0) === '?') { // TODO: more DRY
        depName = depName.substring(1)
        isOptional = true
      }

      bind('before:change:' + depName, function(val) {
        onBeforeDepChange(depName, val, isOptional)
      })

      bind('change:' + depName, function(val) {
        onDepChange(depName, val, isOptional)
      })
    })

    // process current dependency values
    depList.forEach((depName) => {
      let isOptional = false

      if (depName.charAt(0) === '?') { // TODO: more DRY
        depName = depName.substring(1)
        isOptional = true
      }

      if (this.has(depName)) {
        values[depName] = this.get(depName)
        satisfyCnt++
      } else if (isOptional) {
        satisfyCnt++
      }
    })

    // initially satisfied
    if (satisfyCnt === depCnt) {
      startFunc(values)
    }

    return {
      teardown: () => {
        // remove all handlers
        for (let i = 0; i < bindTuples.length; i++) {
          this.off(bindTuples[i][0], bindTuples[i][1])
        }
        bindTuples = null

        // was satisfied, so call stopFunc
        if (satisfyCnt === depCnt) {
          stopFunc()
        }
      },
      flash: () => {
        if (satisfyCnt === depCnt) {
          stopFunc()
          startFunc(values)
        }
      }
    }
  }

  flash(name) {
    let watcher = this._watchers[name]

    if (watcher) {
      watcher.flash()
    }
  }

}

Model.prototype._globalWatchArgs = {} // mutation protection in Model.watch

EmitterMixin.mixInto(Model)
ListenerMixin.mixInto(Model)
