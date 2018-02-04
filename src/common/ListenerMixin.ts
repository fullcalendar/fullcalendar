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

import * as $ from 'jquery'
import Mixin from './Mixin'

export interface ListenerInterface {
  listenTo(other, arg, callback?)
  stopListeningTo(other, eventName?)
}

let guid = 0

export default class ListenerMixin extends Mixin implements ListenerInterface {

  listenerId: any

  /*
  Given an `other` object that has on/off methods, bind the given `callback` to an event by the given name.
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
    if (typeof arg === 'object') { // given dictionary of callbacks
      for (let eventName in arg) {
        if (arg.hasOwnProperty(eventName)) {
          this.listenTo(other, eventName, arg[eventName])
        }
      }
    } else if (typeof arg === 'string') {
      other.on(
        arg + '.' + this.getListenerNamespace(), // use event namespacing to identify this object
        $.proxy(callback, this) // always use `this` context
          // the usually-undesired jQuery guid behavior doesn't matter,
          // because we always unbind via namespace
      )
    }
  }

  /*
  Causes the current object to stop listening to events on the `other` object.
  `eventName` is optional. If omitted, will stop listening to ALL events on `other`.
  */
  stopListeningTo(other, eventName?) {
    other.off((eventName || '') + '.' + this.getListenerNamespace())
  }

  /*
  Returns a string, unique to this object, to be used for event namespacing
  */
  getListenerNamespace() {
    if (this.listenerId == null) {
      this.listenerId = guid++
    }
    return '_listener' + this.listenerId
  }

}
