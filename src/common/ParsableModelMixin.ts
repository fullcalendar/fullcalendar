/*
USAGE:
  import { default as ParsableModelMixin, ParsableModelInterface } from './ParsableModelMixin'
in class:
  applyProps: ParsableModelInterface['applyProps']
  applyManualStandardProps: ParsableModelInterface['applyManualStandardProps']
  applyMiscProps: ParsableModelInterface['applyMiscProps']
  isStandardProp: ParsableModelInterface['isStandardProp']
  static defineStandardProps = ParsableModelMixin.defineStandardProps
  static copyVerbatimStandardProps = ParsableModelMixin.copyVerbatimStandardProps
after class:
  ParsableModelMixin.mixInto(TheClass)
*/

import { copyOwnProps } from '../util'
import Mixin from './Mixin'

export interface ParsableModelInterface {
  applyProps(rawProps)
  applyManualStandardProps(rawProps)
  applyMiscProps(rawProps)
  isStandardProp(propName)
}

export default class ParsableModelMixin extends Mixin implements ParsableModelInterface {

  standardPropMap: any


  static defineStandardProps(propDefs) {
    let proto = this.prototype

    if (!proto.hasOwnProperty('standardPropMap')) {
      proto.standardPropMap = Object.create(proto.standardPropMap)
    }

    copyOwnProps(propDefs, proto.standardPropMap)
  }


  static copyVerbatimStandardProps(src, dest) {
    let map = this.prototype.standardPropMap
    let propName

    for (propName in map) {
      if (
        src[propName] != null && // in the src object?
        map[propName] === true // false means "copy verbatim"
      ) {
        dest[propName] = src[propName]
      }
    }
  }


  /*
  Returns true/false for success.
  Meant to be only called ONCE, at object creation.
  */
  applyProps(rawProps) {
    let standardPropMap = this.standardPropMap
    let manualProps = {}
    let miscProps = {}
    let propName

    for (propName in rawProps) {
      if (standardPropMap[propName] === true) { // copy verbatim
        this[propName] = rawProps[propName]
      } else if (standardPropMap[propName] === false) {
        manualProps[propName] = rawProps[propName]
      } else {
        miscProps[propName] = rawProps[propName]
      }
    }

    this.applyMiscProps(miscProps)

    return this.applyManualStandardProps(manualProps)
  }


  /*
  If subclasses override, they must call this supermethod and return the boolean response.
  Meant to be only called ONCE, at object creation.
  */
  applyManualStandardProps(rawProps) {
    return true
  }


  /*
  Can be called even after initial object creation.
  */
  applyMiscProps(rawProps) {
    // subclasses can implement
  }


  /*
  TODO: why is this a method when defineStandardProps is static
  */
  isStandardProp(propName) {
    return propName in this.standardPropMap
  }

}

ParsableModelMixin.prototype.standardPropMap = {} // will be cloned by defineStandardProps
