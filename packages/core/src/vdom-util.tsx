import { Component, Ref } from './vdom'
import ComponentContext, { ComponentContextType } from './component/ComponentContext'
import { __assign } from 'tslib'
import { compareObjs, EqualityFuncs, getUnequalProps } from './util/object'


// TODO: make a HOC instead
export abstract class BaseComponent<Props={}, State={}> extends Component<Props, State> {

  static addPropsEquality = addPropsEquality
  static addStateEquality = addStateEquality
  static contextType = ComponentContextType

  context: ComponentContext
  propEquality: EqualityFuncs<Props>
  stateEquality: EqualityFuncs<State>
  debug: boolean

  abstract render(props: Props, state: State, context: ComponentContext) // why aren't arg types being enforced!?

  shouldComponentUpdate(nextProps: Props, nextState: State, nextContext: ComponentContext) {

    if (this.debug) {
      console.log(getUnequalProps(nextProps, this.props), getUnequalProps(nextState, this.state))
    }

    return !compareObjs(this.props, nextProps, this.propEquality) ||
      !compareObjs(this.state, nextState, this.stateEquality) ||
      this.context !== nextContext
  }

}

BaseComponent.prototype.propEquality = {}
BaseComponent.prototype.stateEquality = {}


function addPropsEquality(this: { prototype: { propEquality: any } }, propEquality) {
  let hash = Object.create(this.prototype.propEquality)
  __assign(hash, propEquality)
  this.prototype.propEquality = hash
}


function addStateEquality(this: { prototype: { stateEquality: any } }, stateEquality) {
  let hash = Object.create(this.prototype.stateEquality)
  __assign(hash, stateEquality)
  this.prototype.stateEquality = hash
}


// use other one
export function setRef<RefType>(ref: Ref<RefType> | void, current: RefType) {
  if (typeof ref === 'function') {
    ref(current)
  } else if (ref) {
    ref.current = current
  }
}
