import { applyAll } from '../util/misc'


export class Emitter<HandlerFuncs extends { [eventName: string]: (...args: any[]) => any }> {

  private handlers: { [Prop in keyof HandlerFuncs]?: HandlerFuncs[Prop][] } = {}
  private options: HandlerFuncs
  private thisContext: any = null


  setThisContext(thisContext) {
    this.thisContext = thisContext
  }


  setOptions(options: HandlerFuncs) {
    this.options = options
  }


  on<Prop extends keyof HandlerFuncs>(type: Prop, handler: HandlerFuncs[Prop]) {
    addToHash(this.handlers, type, handler)
  }


  off<Prop extends keyof HandlerFuncs>(type: Prop, handler?: HandlerFuncs[Prop]) {
    removeFromHash(this.handlers, type, handler)
  }


  trigger<Prop extends keyof HandlerFuncs>(type: Prop, ...args: Parameters<HandlerFuncs[Prop]>) {
    let res = applyAll(this.handlers[type], this.thisContext, args)

    let handlerFromOptions = this.options && this.options[type]
    if (handlerFromOptions) {
      res = handlerFromOptions.apply(this.thisContext, args) || res // will keep first result
    }

    return res
  }


  hasHandlers(type: keyof HandlerFuncs) {
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
