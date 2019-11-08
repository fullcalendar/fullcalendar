import { removeElement } from './util/dom-manip'
import { isArraysEqual, removeMatching } from './util/array'
import { isPropsEqual, filterHash } from './util/object'
import { __assign } from 'tslib'

let guid = 0


// top-level renderer
// ----------------------------------------------------------------------------------------------------


export type DomRenderResult =
  Node |
  Node[] |
  { rootEl: Node } |  // like a Component
  { rootEls: Node[] } // "

export type LocationAndProps<RenderRes, Props> = (RenderRes extends DomRenderResult ? Partial<DomLocation> : {}) & Props


export function renderer<ComponentType>(componentClass: ComponentClass<ComponentType>): ((
  inputProps: (ComponentType extends Component<infer Props, infer Context, infer State, infer RenderRes> ? LocationAndProps<RenderRes, Props> : never) | false,
  context?: ComponentType extends Component<infer Props, infer Context> ? Context : never
) => ComponentType) & {
  current: ComponentType | null
}
export function renderer<FuncProps, Context, FuncState>(
  renderFunc: (funcProps: FuncProps, context?: Context) => FuncState,
  unrenderFunc?: (funcState: FuncState, context?: Context) => void
): ((
  funcProps: LocationAndProps<FuncState, FuncProps> | false,
  context?: Context
) => FuncState) & {
  current: FuncState | null
}
export function renderer(worker: any, unrenderFunc?: any) {
  if (worker.prototype) { // a class
    return componentRenderer(worker)
  } else {
    return funcRenderer(worker, unrenderFunc)
  }
}


// function renderer
// ----------------------------------------------------------------------------------------------------


type FuncRenderer =
  ((funcProps: any, context?: any) => any) &
  { current: any | null }


function funcRenderer(
  renderFunc: (funcProps: any, context?: any) => any,
  unrenderFunc?: (funcState: any, context?: any) => void
): FuncRenderer {
  let currentProps // used as a flag for ever-rendered
  let currentContext
  let currentState
  let currentLocation
  let currentRootEls = []

  function render(location, props, context) {
    let newRootEls

    if (!currentProps) { // first time?
      currentState = renderFunc(currentProps, currentContext)
      newRootEls = normalizeRenderEls(currentState)

    } else if ( // any changes?
      !isPropsEqual(currentProps, props) ||
      renderFunc.length > 1 && !isPropsEqual(currentContext, context)
    ) {
      if (unrenderFunc) {
        unrenderFunc(currentState, context)
      }

      currentState = renderFunc(currentProps, currentContext)
      update.current = currentState
      newRootEls = normalizeRenderEls(currentState)
    }

    if (newRootEls && !isArraysEqual(newRootEls, currentRootEls)) {
      currentRootEls.forEach(removeElement)
      insertNodesAtLocation(newRootEls, location)

    } else if (!isPropsEqual(location, currentLocation)) {
      insertNodesAtLocation(currentRootEls, location)
    }

    currentProps = props
    currentContext = context
    currentLocation = location
    currentRootEls = newRootEls
  }

  function unrender() {
    if (currentProps && unrenderFunc) {
      unrenderFunc(currentState, currentContext)
    }

    currentProps = null
    currentContext = null
    currentState = null
    currentLocation = null
    currentRootEls = []
    update.current = null
  }

  let update = function(this: Component<any> | any, propsAndLocation: any, contextOverride?: any) {
    handleUpdate(this, propsAndLocation, contextOverride, render, unrender)
    return currentState
  } as ComponentRenderer

  return update
}


// component renderer
// ----------------------------------------------------------------------------------------------------


type ComponentRenderer =
  ((propsAndLocation: any, context?: any) => any) &
  { current: Component<any> | null }


function componentRenderer(componentClass: ComponentClass<any>): ComponentRenderer {
  let renderEngine: RenderEngine
  let component: Component<any> | null = null

  function render(location, props, context, isTopLevel) {
    if (!renderEngine) {
      renderEngine = isTopLevel ? new RenderEngine() : this.renderEngine
    }

    if (!component) {
      component = update.current = new componentClass(props, context)
      component.renderEngine = renderEngine
    }

    renderEngine.updateComponentExternal(
      component,
      location,
      props,
      context
    )
  }

  function unrender() {
    if (component) {
      renderEngine.unmountComponent(component)
      update.current = null
      component = null
    }
  }

  let update = function(this: Component<any> | any, propsAndLocation: any, contextOverride?: any) {
    handleUpdate(this, propsAndLocation, contextOverride, render, unrender)
    return component
  } as ComponentRenderer

  return update
}


// component class
// ----------------------------------------------------------------------------------------------------


export type PropEqualityFuncs<ComponentType> = ComponentType extends Component<infer Props> ? EqualityFuncs<Props> : never
export type StateEqualityFuncs<ComponentType> = ComponentType extends Component<infer Props, infer State> ? EqualityFuncs<State> : never
export type EqualityFuncs<ObjType> = {
  [K in keyof ObjType]?: (a: ObjType[K], b: ObjType[K]) => boolean
}


export abstract class Component<Props, Context={}, State={}, RenderResult=void, Snapshot={}> {

  propEquality: EqualityFuncs<Props>
  stateEquality: EqualityFuncs<State>
  renderEngine: RenderEngine
  childUnmounts: (() => void)[] = []

  uid = String(guid++)
  isMounted = false
  location: Partial<DomLocation> = {}
  rootEls: Node[] = [] // TODO: rename to rootNodes?
  rootEl: HTMLElement | null = null // TODO: rename to rootNode?
  state: State = {} as State

  constructor(
    public props: Props,
    public context: Context
  ) {
  }

  abstract render(props: Props, context: Context, state: State): RenderResult

  unrender() {}

  setState(stateUpdates: Partial<State>) {
    this.renderEngine.requestUpdateComponentInternal(this, stateUpdates)
  }

  componentDidMount() {
  }

  getSnapshotBeforeUpdate(prevProps: Props, prevState: State, prevContext: Context) {
    return {} as Snapshot
  }

  shouldComponentUpdate(nextProps: Props, nextState: State, prevContext: Context) {
    return true
  }

  componentDidUpdate(prevProps: Props, prevState: State, snapshot: Snapshot) {
  }

  componentWillUnmount() {
  }

  static addPropEquality<ComponentType>(this: ComponentClass<ComponentType>, propEquality: PropEqualityFuncs<ComponentType>) {
    let hash = Object.create(this.prototype.propEquality)
    __assign(hash, propEquality)
    this.prototype.propEquality = hash
  }

  static addStateEquality<ComponentType>(this: ComponentClass<ComponentType>, stateEquality: StateEqualityFuncs<ComponentType>) {
    let hash = Object.create(this.prototype.stateEquality)
    __assign(hash, stateEquality)
    this.prototype.stateEquality = hash
  }

}

Component.prototype.propEquality = {}
Component.prototype.stateEquality = {}


export type ComponentClass<ComponentType> = (
  new(
    props: ComponentType extends Component<infer Props> ? Props : never,
    context: ComponentType extends Component<infer Props, infer Context> ? Context : never,
  ) => ComponentType
) & {
  prototype: {
    render(
      props: ComponentType extends Component<infer Props> ? Props : never,
      context: ComponentType extends Component<infer Props, infer Context> ? Context : never,
      state: ComponentType extends Component<infer Props, infer Context, infer State> ? State : never
    )
  }
}


// component rendering engine
// ----------------------------------------------------------------------------------------------------


interface StateUpdate {
  component: Component<any>
  updates: any
}

interface AfterRender {
  component: Component<any>
  prevProps?: any
  prevState?: any
  prevContext?: any
  snapshot?: any
}


class RenderEngine {

  externalUpdateDepth = 0
  stateUpdates: StateUpdate[] = []
  afterRenders: AfterRender[] = []


  updateComponentExternal(component: Component<any>, location: Partial<DomLocation>, props: any, context: any) {
    this.externalUpdateDepth++

    let { isMounted } = component
    let prevProps = component.props
    let prevContext = component.context

    let massagedProps = isMounted ? recycleProps(prevProps, props, false, component.propEquality) : prevProps
    let massagedContext = isMounted ? recycleProps(prevContext, context, false, {}) : prevContext

    if (massagedProps || massagedContext) {
      this.updateComponent(
        component,
        location,
        massagedProps || prevProps,
        massagedContext || prevContext,
        component.state
      )
    } else if (location.parentEl && !isPropsEqual(component.location, location)) {
      this.afterRenders.push(
        relocateComponent(component, location as DomLocation)
      )
    }

    this.externalUpdateDepth--
    this.drain()
  }


  requestUpdateComponentInternal(component: Component<any>, stateUpdates: any) {
    this.stateUpdates.push({ component, updates: stateUpdates })
    this.drain()
  }


  unmountComponent(component: Component<any>) {
    unmountComponent(component)

    removeFromComponentQueue(this.stateUpdates, component)
    removeFromComponentQueue(this.afterRenders, component)
  }


  private drain() {
    if (!this.externalUpdateDepth) {
      while (
        drainQueue(this.stateUpdates, this.runStateUpdate) ||
        drainQueue(this.afterRenders, this.runAfterRender)
      ) {
      }
    }
  }


  private runStateUpdate = (task: StateUpdate) => {
    let { component, updates } = task
    let massagedState = recycleProps(component.state, updates, true, component.stateEquality) // additions=true

    if (massagedState) {
      this.updateComponent(component, component.location, component.props, component.context, massagedState)
    }
  }


  private runAfterRender = (task: AfterRender) => {
    let { component, prevProps, prevState, snapshot } = task

    if (prevProps) {
      component.componentDidUpdate(prevProps, prevState, snapshot)
    } else {
      component.componentDidMount()
    }
  }


  private updateComponent(component: Component<any>, location: any, nextProps: any, nextContext: any, nextState: any) {
    if (component.shouldComponentUpdate(nextProps, nextState, nextContext)) {
      this.afterRenders.push(
        updateComponent(component, location, nextProps, nextContext, nextState)
      )
    }
  }

}


// component lifecycle executors
// ----------------------------------------------------------------------------------------------------


function updateComponent(component: Component<any>, location: Partial<DomLocation>, nextProps: any, nextContext: any, nextState: any): AfterRender {
  component.childUnmounts = []

  if (!component.isMounted) {

    // component already has props/context from constructor
    runRender(component, location, nextProps, nextContext, nextState)
    component.isMounted = true

    return { component }

  } else {
    let prevProps = component.props
    let prevContext = component.context
    let prevState = component.state
    let snapshot = component.getSnapshotBeforeUpdate(prevProps, prevState, prevContext) || {}

    component.unrender()
    component.props = nextProps
    component.context = nextContext
    component.state = nextState
    runRender(component, location, nextProps, nextContext, nextState)

    return { component, prevProps, prevState, prevContext, snapshot }
  }
}


function runRender(component: Component<any>, location: Partial<DomLocation>, nextProps: any, nextContext: any, nextState: any) {
  let renderRes = component.render(nextProps, nextContext, nextState)
  let rootEls = normalizeRenderEls(renderRes)

  if (
    !isArraysEqual(rootEls, component.rootEls) ||
    !isPropsEqual(location, component.location)
  ) {
    component.rootEls.forEach(removeElement)

    if (location.parentEl) {
      insertNodesAtLocation(rootEls, location as DomLocation)
    }

    component.location = location
    component.rootEls = rootEls
    component.rootEl = rootEls[0] as HTMLElement || null
  }
}


function relocateComponent(component: Component<any>, location: DomLocation): AfterRender {
  let prevProps = component.props
  let prevContext = component.context
  let prevState = component.state
  let snapshot = component.getSnapshotBeforeUpdate(prevProps, prevState, prevContext) || {}

  insertNodesAtLocation(component.rootEls, location) // dont need to remove first

  component.location = location

  return { component, prevProps, prevState, prevContext, snapshot }
}


function unmountComponent(component: Component<any>) {
  component.unrender()
  component.componentWillUnmount()

  let { childUnmounts } = component
  for (let i = childUnmounts.length - 1; i >= 0; i--) {
    childUnmounts[i]()
  }

  component.rootEls.forEach(removeElement)
  component.rootEls = null
  component.rootEl = null
}


// function/component rendering helpers
// ----------------------------------------------------------------------------------------------------


const DOM_LOCATION_KEYS: { [P in keyof DomLocation]-?: true } = {
  parentEl: true,
  previousSibling: true,
  nextSibling: true,
  prepend: true
}


function handleUpdate(caller, propsAndLocation, contextOverride, update, unmount) {
  let isTopLevel = !caller.renderEngine // TODO: naming collision for caller?

  if (!propsAndLocation) {
    unmount()

  } else {
    let location = whitelistProps(propsAndLocation, DOM_LOCATION_KEYS)

    if (('parentEl' in location) && location.parentEl == null) {
      unmount()

    } else {
      let props = blacklistProps(propsAndLocation, DOM_LOCATION_KEYS)

      update(location, props, contextOverride || (isTopLevel ? {} : caller.context), isTopLevel)

      if (!isTopLevel) {
        ;(caller as Component<any>).childUnmounts.push(unmount)
      }
    }
  }
}


function normalizeRenderEls(input: any): Node[] {
  if (!input) {
    return []

  } else if (Array.isArray(input)) {
    return input.filter(function(item) {
      return item instanceof Node
    })

  } else if (input.rootEls) {
    return input.rootEls as Node[]

  } else if (input.rootEl) {
    return [ input.rootEl as Node ]

  } else if (input instanceof Node) {
    return [ input ]
  }
}


// list rendering (TODO)
// ----------------------------------------------------------------------------------------------------


export interface ListRendererItem<ComponentType> {
  id: string
  componentClass: ComponentClass<ComponentType>
  props: ComponentType extends Component<infer Props> ? Omit<Props, keyof DomLocation> : never
}


export function listRenderer(): (location: DomLocation, inputs: ListRendererItem<any>[], contextOverride?: any) => Component<any>[] {
  return null as any
}


// queue
// ----------------------------------------------------------------------------------------------------


function removeFromComponentQueue(queue: { component: Component<any> }[], component: Component<any>) {
  return removeMatching(queue, function(task) {
    return task.component === component
  })
}


function drainQueue(queue: any[], runnerFunc) {
  let completedCnt = 0
  let task

  while (task = queue.shift()) {
    runnerFunc(task)
    completedCnt++
  }

  return completedCnt
}


// dom util
// ----------------------------------------------------------------------------------------------------


export interface DomLocation {
  parentEl: HTMLElement
  previousSibling?: Node
  nextSibling?: Node
  prepend?: boolean
}


export function insertNodesAtLocation(nodes: Node[], location: DomLocation) {
  let { parentEl, previousSibling, nextSibling } = location

  if (location.prepend) {
    nextSibling = parentEl.firstChild as HTMLElement

  } else if (previousSibling) {
    nextSibling = previousSibling.nextSibling

  } else if (!nextSibling) {
    nextSibling = null // important for insertBefore
  }

  for (let node of nodes) {
    parentEl.insertBefore(node, nextSibling)
  }
}


// object util
// ----------------------------------------------------------------------------------------------------


function whitelistProps<ObjType>(props: ObjType, whitelist): Partial<ObjType> {
  return filterHash(props, function(val, key) { // TODO: give typings
    return whitelist[key]
  })
}


function blacklistProps<ObjType>(props: ObjType, blacklist): Partial<ObjType> {
  return filterHash(props, function(val, key) { // TODO: give typings
    return !blacklist[key]
  })
}


function recycleProps(oldProps, newProps, isReset: boolean, equalityFuncs: EqualityFuncs<any>) {
  let comboProps = {} as any // some old, some new
  let anyChanges = false

  if (isReset && oldProps === newProps) {
    return null
  }

  for (let key in newProps) {
    if (
      key in oldProps && (
        oldProps[key] === newProps[key] ||
        (equalityFuncs[key] && equalityFuncs[key](oldProps[key], newProps[key]))
      )
    ) {
      // equal to old? use old prop
      comboProps[key] = oldProps[key]
    } else {
      comboProps[key] = newProps[key]
      anyChanges = true
    }
  }

  // of new object is resetting the old object,
  // check for props that were omitted in the new
  if (isReset) {
    for (let key in oldProps) {
      if (!(key in newProps)) {
        anyChanges = true
        break
      }
    }
  }

  if (anyChanges) {
    return comboProps
  }

  return null
}
