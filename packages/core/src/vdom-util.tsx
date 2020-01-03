import { Component, h, Fragment, Ref, ComponentChildren, render } from './vdom'
import ComponentContext, { ComponentContextType } from './component/ComponentContext'
import { __assign } from 'tslib'
import { isPropsEqual, getUnequalProps } from './util/object'


export type EqualityFuncs<ObjType> = {
  [K in keyof ObjType]?: (a: ObjType[K], b: ObjType[K]) => boolean
}

interface SubRendererOwner {
  context: ComponentContext
  subrendererDestroys: (() => void)[]
}


// TODO: make a HOC instead
export abstract class BaseComponent<Props={}, State={}> extends Component<Props, State> implements SubRendererOwner {

  static addPropsEquality = addPropsEquality
  static addStateEquality = addStateEquality
  static contextType = ComponentContextType

  context: ComponentContext
  propEquality: EqualityFuncs<Props>
  stateEquality: EqualityFuncs<State>
  subrendererDestroys: (() => void)[] = []

  abstract render(props: Props, state: State, context: ComponentContext) // why aren't arg types being enforced!?

  shouldComponentUpdate(nextProps: Props, nextState: State, nextContext: ComponentContext) {
    return !compareObjs(this.props, nextProps, this.propEquality) ||
      !compareObjs(this.state, nextState, this.stateEquality) ||
      this.context !== nextContext
  }

  subrenderDestroy: typeof subrenderDestroy

}

BaseComponent.prototype.propEquality = {}
BaseComponent.prototype.stateEquality = {}
BaseComponent.prototype.subrenderDestroy = subrenderDestroy


export abstract class SubRenderer<Props={}, RenderRes=void> implements SubRendererOwner {

  static addPropsEquality = addPropsEquality

  propEquality: EqualityFuncs<Props>
  subrendererDestroys: (() => void)[] = []

  constructor(
    public props: Props,
    public context: ComponentContext
  ) {
  }

  abstract render(props: Props, context: ComponentContext): RenderRes

  unrender(renderRes: RenderRes, context: ComponentContext) {
  }

  subrenderDestroy: typeof subrenderDestroy

  willDestroy() {
    this.subrenderDestroy()
  }

}

SubRenderer.prototype.propEquality = {}
SubRenderer.prototype.subrenderDestroy = subrenderDestroy


export type SubRendererClass<SubRendererType> = (
  new(
    props: SubRendererType extends SubRenderer<infer Props> ? Props : never,
    context: ComponentContext
  ) => SubRendererType
) & {
  prototype: {
    render(
      props: SubRendererType extends SubRenderer<infer Props> ? Props : never,
      context: ComponentContext
    )
  }
}


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


function subrenderDestroy(this: SubRendererOwner) {
  for (let destroy of this.subrendererDestroys) {
    destroy()
  }
  this.subrendererDestroys = []
}


export function subrenderer<SubRendererType>(subRendererClass: SubRendererClass<SubRendererType>): ((
  props: (SubRendererType extends SubRenderer<infer Props> ? Props : never) | false,
  context?: ComponentContext
) => SubRendererType)
export function subrenderer<FuncProps, RenderRes>(
  renderFunc: (funcProps: FuncProps, context?: ComponentContext) => RenderRes,
  unrenderFunc?: (funcState: RenderRes, context?: ComponentContext) => void
): ((
  funcProps: FuncProps | false,
  context?: ComponentContext
) => RenderRes)
export function subrenderer(worker, unrender?) {
  if (worker.prototype.render) {
    return buildClassSubRenderer(worker)
  } else {
    return buildFuncSubRenderer(worker, unrender)
  }
}


function buildClassSubRenderer(subRendererClass: SubRendererClass<any>) {
  let instance: SubRenderer
  let renderRes

  function destroy() {
    if (instance) {
      instance.unrender(renderRes, instance.context)
      instance.willDestroy()
      instance = null
    }
  }

  return function(this: SubRendererOwner, props: any) { // what about passing in Context?
    let context = this.context

    if (!props) {
      destroy()

    } else if (!instance) {
      instance = new subRendererClass(props, context) // will set internal props/context
      renderRes = instance.render(props, context)
      this.subrendererDestroys.push(destroy)

    } else if (
      !compareObjs(props, instance.props, instance.propEquality) ||
      !compareObjs(context, instance.context)
    ) {
      instance.unrender(renderRes, context)
      instance.props = props
      instance.context = context
      renderRes = instance.render(props, context)
    }

    return instance
  }
}


function buildFuncSubRenderer(renderFunc, unrenderFunc) {
  let thisContext
  let currentProps
  let currentContext
  let renderRes

  function destroy() {
    if (currentProps) {
      unrenderFunc && unrenderFunc.call(thisContext, renderRes, currentContext)
      currentProps = null
      currentContext = null
      renderRes = null
    }
  }

  return function(this: SubRendererOwner, props: any) { // what about passing in Context?
    thisContext = this
    let context = thisContext.context

    if (!props) {
      destroy()

    } else {

      if (!currentProps) {
        renderRes = renderFunc.call(thisContext, props, context)
        this.subrendererDestroys.push(destroy)

      } else if (
        !compareObjs(props, currentProps) || (
          renderFunc.length > 1 && // has second arg? cares about context?
          context !== currentContext
        )
      ) {
        unrenderFunc && unrenderFunc.call(thisContext, renderRes, context)
        renderRes = renderFunc.call(thisContext, props, context)
      }

      currentProps = props
      currentContext = context
    }

    return renderRes
  }
}


export function buildMapSubRenderer(subRendererClass: SubRendererClass<any>) {
  let currentInstances = {}

  function destroyAll() {
    for (let key in currentInstances) {
      currentInstances[key].destroy()
    }
    currentInstances = {}
  }

  return function(this: SubRendererOwner, propMap) { // what about passing in Context?
    let context = this.context

    if (!propMap) {
      destroyAll()

    } else {

      for (let key in currentInstances) {
        if (!propMap[key]) {
          currentInstances[key].destroy()
          delete currentInstances[key]
        }
      }

      for (let key in propMap) {
        let props = propMap[key]
        let instance = currentInstances[key]

        if (!instance) {
          instance = currentInstances[key] = new subRendererClass(props, context) // TODO: pass in state???
          instance.render(props, context)

        } else if (
          !compareObjs(props, instance.props, instance.propEquality) ||
          !compareObjs(context, instance.context)
        ) {
          instance.unrender()
          instance.props = props
          instance.context = context
          instance.render(props, context)
        }
      }
    }

    return currentInstances
  }
}


function compareObjs(oldProps, newProps, equalityFuncs: EqualityFuncs<any> = {}) {

  if (oldProps === newProps) {
    return true
  }

  for (let key in newProps) {
    if (
      key in oldProps && (
        oldProps[key] === newProps[key] ||
        (equalityFuncs[key] && equalityFuncs[key](oldProps[key], newProps[key]))
      )
    ) {
      ; // equal
    } else {
      return false
    }
  }

  // check for props that were omitted in the new
  for (let key in oldProps) {
    if (!(key in newProps)) {
      return false
    }
  }

  return true
}


export function setRef<RefType>(ref: Ref<RefType> | void, current: RefType) {
  if (typeof ref === 'function') {
    ref(current)
  } else if (ref) {
    ref.current = current
  }
}


export function renderVNodes(children: ComponentChildren, context: ComponentContext): Node[] {
  let containerEl = document.createElement('div')

  render(
    <ComponentContextType.Provider value={context}>
      <Fragment>{children}</Fragment>
    </ComponentContextType.Provider>,
    containerEl
  )

  return Array.prototype.slice.call(containerEl.childNodes)
}


export function componentNeedsResize<P, S>(prevProps: P, props: P, prevState: S, state: S, stateIsSizing: { [K in keyof S]?: boolean }) {
  if (!isPropsEqual(prevProps, props)) {
    return true
  }

  let unequalState = getUnequalProps(prevState, state)

  if (!unequalState.length) {
    return true // if neither props nor state changed, that means context changed, so definitely do a resize!
  }

  for (let key of unequalState) {
    if (!stateIsSizing[key]) {
      return true
    }
  }

  return false
}
