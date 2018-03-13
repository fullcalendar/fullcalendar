/*
Utility methods for easily listening to events on another object,
and more importantly, easily unlistening from them.

USAGE:
  import { default as ListenerMixin, ListenerInterface } from './ListenerMixin'
in class:
  listenTo: ListenerInterface['listenTo']
  stopListeningTo: ListenerInterface['stopListeningTo']
after class:
  ListenerMixin.mixInto(TheClass)
*/

import Mixin from './Mixin'

export interface ListenerInterface {
  listenTo(other, arg, callback?)
  stopListeningTo(other, eventName?)
}

export default class ListenerMixin extends Mixin implements ListenerInterface {

  _listeners: any // array of [ otherObject, eventName, callbackFunc ]

  /*
  Given an `other` object that has on/off or addEventListener/removeEventListener methods, bind the given `callback` to an event by the given name.
  The `callback` will be called with the `this` context of the object that .listenTo is being called on.
  Can be called:
    .listenTo(other, eventName, callback)
  OR
    .listenTo(other, {
      eventName1: callback1,
      eventName2: callback2
    })
  */
  listenTo(other, arg, callback?) {
    if (typeof arg === 'object' && arg) { // given dictionary of callbacks (non-null)
      for (let eventName in arg) {
        if (arg.hasOwnProperty(eventName)) {
          this.listenTo(other, eventName, arg[eventName])
        }
      }
    } else if (typeof arg === 'string' && callback) {
      callback = callback.bind(this) // always use `this` context)

      if (other.addEventListener) {
        other.addEventListener(arg, callback)
      } else {
        other.on(arg, callback)
      }

      ;(this._listeners || (this._listeners = []))
        .push([ other, arg, callback ])
    }
  }

  /*
  Causes the current object to stop listening to events on the `other` object.
  `eventName` is optional. If omitted, will stop listening to ALL events on `other`.
  */
  stopListeningTo(other, eventName?) {
    if (this._listeners) {
      this._listeners = this._listeners.filter(function(listener) {
        if (
          listener[0] === other &&
          (!eventName || eventName === listener[1])
        ) {
          if (other.removeEventListener) {
            other.removeEventListener(listener[1], listener[2])
          } else {
            other.off(listener[1], listener[2])
          }

          return false // remove from array
        } else {
          return true // keep in array
        }
      })
    }
  }

}
