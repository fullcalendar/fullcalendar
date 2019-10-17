/*
USAGE:
  import { default as EmitterMixin, EmitterInterface } from './EmitterMixin'
in class:
  on: EmitterInterface['on']
  one: EmitterInterface['one']
  off: EmitterInterface['off']
  trigger: EmitterInterface['trigger']
  triggerWith: EmitterInterface['triggerWith']
  hasHandlers: EmitterInterface['hasHandlers']
after class:
  EmitterMixin.mixInto(TheClass)
*/

import { applyAll } from '../util/misc'
import Mixin from './Mixin'

export interface EmitterInterface {
  on(types, handler)
  one(types, handler)
  off(types, handler)
  trigger(type, ...args)
  triggerWith(type, context, args)
  hasHandlers(type)
}

export default class EmitterMixin extends Mixin implements EmitterInterface {

  _handlers: any
  _oneHandlers: any

  on(type, handler) {
    addToHash(
      this._handlers || (this._handlers = {}),
      type,
      handler
    )
    return this // for chaining
  }

  // todo: add comments
  one(type, handler) {
    addToHash(
      this._oneHandlers || (this._oneHandlers = {}),
      type,
      handler
    )
    return this // for chaining
  }

  off(type, handler?) {
    if (this._handlers) {
      removeFromHash(this._handlers, type, handler)
    }
    if (this._oneHandlers) {
      removeFromHash(this._oneHandlers, type, handler)
    }
    return this // for chaining
  }

  trigger(type, ...args) {
    this.triggerWith(type, this, args)
    return this // for chaining
  }

  triggerWith(type, context, args) {
    if (this._handlers) {
      applyAll(this._handlers[type], context, args)
    }
    if (this._oneHandlers) {
      applyAll(this._oneHandlers[type], context, args)
      delete this._oneHandlers[type] // will never fire again
    }
    return this // for chaining
  }

  hasHandlers(type) {
    return (this._handlers && this._handlers[type] && this._handlers[type].length) ||
      (this._oneHandlers && this._oneHandlers[type] && this._oneHandlers[type].length)
  }

}

function addToHash(hash, type, handler) {
  (hash[type] || (hash[type] = []))
    .push(handler)
}

function removeFromHash(hash, type, handler?) {
  if (handler) {
    if (hash[type]) {
      hash[type] = hash[type].filter(function(func) {
        return func !== handler
      })
    }
  } else {
    delete hash[type] // remove all handler funcs for this type
  }
}
