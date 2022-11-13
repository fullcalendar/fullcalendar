/* eslint max-classes-per-file: off */

import { Component, Ref } from './preact.js'
import { ViewContextType, ViewContext } from './ViewContext.js'
import { compareObjs, EqualityFuncs, getUnequalProps } from './util/object.js'
import { Dictionary } from './options.js'

export abstract class PureComponent<Props=Dictionary, State=Dictionary> extends Component<Props, State> {
  static addPropsEquality = addPropsEquality
  static addStateEquality = addStateEquality
  static contextType: any = ViewContextType

  context: ViewContext
  propEquality: EqualityFuncs<Props>
  stateEquality: EqualityFuncs<State>

  debug: boolean

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(getUnequalProps(nextProps, this.props), getUnequalProps(nextState, this.state))
    }

    return !compareObjs(this.props, nextProps, this.propEquality) ||
      !compareObjs(this.state, nextState, this.stateEquality)
  }

  // HACK for freakin' React StrictMode
  safeSetState(newState: Partial<State>): void {
    if (!compareObjs(this.state, { ...this.state, ...newState }, this.stateEquality)) {
      this.setState(newState)
    }
  }
}

PureComponent.prototype.propEquality = {}
PureComponent.prototype.stateEquality = {}

export abstract class BaseComponent<Props=Dictionary, State=Dictionary> extends PureComponent<Props, State> {
  static contextType: any = ViewContextType

  context: ViewContext
}

function addPropsEquality(this: { prototype: { propEquality: any } }, propEquality) {
  let hash = Object.create(this.prototype.propEquality)
  Object.assign(hash, propEquality)
  this.prototype.propEquality = hash
}

function addStateEquality(this: { prototype: { stateEquality: any } }, stateEquality) {
  let hash = Object.create(this.prototype.stateEquality)
  Object.assign(hash, stateEquality)
  this.prototype.stateEquality = hash
}

// use other one
export function setRef<RefType>(ref: Ref<RefType> | void, current: RefType) {
  if (typeof ref === 'function') {
    ref(current)
  } else if (ref) {
    // see https://github.com/facebook/react/issues/13029
    (ref as any).current = current
  }
}
