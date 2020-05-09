import { applyAll } from '../util/misc'


export class Emitter<Options = {}> {

  private handlers: any = {}
  private options: Options
  private thisContext: any = null


  setThisContext(thisContext) {
    this.thisContext = thisContext
  }


  setOptions(options: Options) {
    this.options = options
  }


  on(type, handler) {
    addToHash(this.handlers, type, handler)
  }


  off(type, handler?) {
    removeFromHash(this.handlers, type, handler)
  }


  trigger(type, ...args) {
    let res = applyAll(this.handlers[type], this.thisContext, args)

    let handlerFromOptions = this.options && this.options[type]
    if (handlerFromOptions) {
      res = handlerFromOptions.apply(this.thisContext, args) || res // will keep first result
    }

    return res
  }


  hasHandlers(type) {
    return this.handlers[type] && this.handlers[type].length
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
