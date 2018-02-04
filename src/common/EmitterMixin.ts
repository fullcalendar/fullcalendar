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

import * as $ from 'jquery'
import Mixin from './Mixin'

export interface EmitterInterface {
  on(types, handler)
  one(types, handler)
  off(types, handler)
  trigger(types, ...args)
  triggerWith(types, context, args)
  hasHandlers(type)
}

export default class EmitterMixin extends Mixin implements EmitterInterface {

  // jQuery-ification via $(this) allows a non-DOM object to have
  // the same event handling capabilities (including namespaces).


  on(types, handler) {
    $(this).on(types, this._prepareIntercept(handler))
    return this // for chaining
  }


  one(types, handler) {
    $(this).one(types, this._prepareIntercept(handler))
    return this // for chaining
  }


  _prepareIntercept(handler) {
    // handlers are always called with an "event" object as their first param.
    // sneak the `this` context and arguments into the extra parameter object
    // and forward them on to the original handler.
    let intercept = function(ev, extra) {
      return handler.apply(
        extra.context || this,
        extra.args || []
      )
    }

    // mimick jQuery's internal "proxy" system (risky, I know)
    // causing all functions with the same .guid to appear to be the same.
    // https://github.com/jquery/jquery/blob/2.2.4/src/core.js#L448
    // this is needed for calling .off with the original non-intercept handler.
    if (!handler.guid) {
      handler.guid = ($ as any).guid++
    }
    (intercept as any).guid = handler.guid

    return intercept
  }


  off(types, handler) {
    $(this).off(types, handler)

    return this // for chaining
  }


  trigger(types, ...args) {
    // pass in "extra" info to the intercept
    $(this).triggerHandler(types, { args: args })

    return this // for chaining
  }


  triggerWith(types, context, args) {

    // `triggerHandler` is less reliant on the DOM compared to `trigger`.
    // pass in "extra" info to the intercept.
    $(this).triggerHandler(types, { context: context, args: args })

    return this // for chaining
  }


  hasHandlers(type) {
    let hash = ($ as any)._data(this, 'events') // http://blog.jquery.com/2012/08/09/jquery-1-8-released/

    return hash && hash[type] && hash[type].length > 0
  }

}
