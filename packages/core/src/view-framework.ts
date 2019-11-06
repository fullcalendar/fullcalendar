
export interface DomLocation {
  parentEl: HTMLElement
  prevSiblingEl?: HTMLElement
  nextSiblingEl?: HTMLElement
  prepend?: boolean
}


export type EqualityFunc = (val0: any, val1: any) => boolean
export type EqualityFuncHash = { [name: string]: EqualityFunc }

export type RenderDomResult =
  HTMLElement[] |
  HTMLElement |
  { rootEl: HTMLElement } |
  { rootEls: HTMLElement[] } |
  Component<any, any>


export abstract class Component<Props, Context={}, State={}, Snapshot={}> {

  uid: string
  state: State
  rootEl: HTMLElement
  rootEls: HTMLElement[]

  constructor(
    public props: Props,
    public context: Context
  ) {
  }

  abstract render(props: Props, context: Context, state: State):
    Props extends DomLocation ? RenderDomResult : void

  unrender() {}

  setState(state: Partial<State>) {
  }

  componentDidMount() {
  }

  // getSnapshotBeforeUpdate(prevProps: Props, prevState: State)

  shouldComponentUpdate(nextProps: Props, nextState: State) {
  }

  componentDidUpdate(prevProps: Props, prevState: State, snapshot: Snapshot) {
  }

  componentWillUnmount() {
  }

  static addPropEquality(propEquality: EqualityFuncHash) {
  }

  static addStateEquality(stateEquality: EqualityFuncHash) {
  }

}


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


type InputProps<Props> = Props extends DomLocation ? (Omit<Props, keyof DomLocation> & Partial<DomLocation>) : Props


export function renderer<ComponentType>(componentClass: ComponentClass<ComponentType>): ((
  inputProps:
    (ComponentType extends Component<infer Props> ? InputProps<Props> : never) | false,
  context?:
    (ComponentType extends Component<infer Props, infer Context> ? Context : never)
) => ComponentType) & {
  current: ComponentType | null
}
export function renderer<FuncProps, Context, FuncState>(
  renderFunc: (funcProps: FuncProps, context?: Context) => FuncState,
  unrenderFunc?: (funcState: FuncState, context?: Context) => void
): ((
  funcProps: InputProps<FuncProps> | false,
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


function componentRenderer<ComponentType>(componentClass: ComponentClass<ComponentType>): ((
  inputProps:
    (ComponentType extends Component<infer Props> ? InputProps<Props> : never) | false,
  context?:
    (ComponentType extends Component<infer Props, infer Context> ? Context : never)
) => ComponentType) & {
  current: ComponentType | null
} {
  return null as any
}


function funcRenderer<FuncProps, Context, FuncState>(
  renderFunc: (funcProps: FuncProps, context?: Context) => FuncState,
  unrenderFunc?: (funcState: FuncState, context?: Context) => void
): ((
  funcProps: InputProps<FuncProps> | false,
  context?: Context
) => FuncState) & {
  current: FuncState | null
} {
  return null as any
}


export interface ListRendererItem<ComponentType> {
  id: string
  componentClass: ComponentClass<ComponentType>
  props: ComponentType extends Component<infer Props> ? Omit<Props, keyof DomLocation> : never
}

export function listRenderer(): (location: DomLocation, inputs: ListRendererItem<any>[], context?: any) => Component<any, any>[] {
  return null as any
}


export class DelayedRunner {

  private isDirty: boolean = false
  private timeoutId: number = 0
  private pauseDepth: number = 0

  constructor(
    private drainedOption?: () => void
  ) {
  }

  request(delay?: number) {
    this.isDirty = true

    if (delay == null) {
      this.clearTimeout()
      this.tryDrain()

    } else if (!this.timeoutId) {
      this.timeoutId = setTimeout(this.tryDrain.bind(this), delay) as unknown as number
    }
  }

  pause() {
    this.pauseDepth++
  }

  resume() {
    this.pauseDepth--
    this.tryDrain()
  }

  private clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = 0
    }
  }

  private tryDrain() {
    if (!this.pauseDepth && this.isDirty) {
      this.isDirty = false
      this.drained()
    }
  }

  protected drained() {
    if (this.drainedOption) {
      this.drainedOption()
    }
  }

}


export class TaskRunner<Task> {

  private isRunning = false
  private queue: Task[] = []
  private delayedRunner: DelayedRunner

  constructor(
    private runTaskOption?: (task: Task) => void,
    private drainedOption?: (completedTasks: Task[]) => void
  ) {
    this.delayedRunner = new DelayedRunner(this.tryDrain.bind(this))
  }

  request(task: Task, delay?: number) {
    this.queue.push(task)
    this.delayedRunner.request(delay)
  }

  private tryDrain() {
    let { queue } = this

    if (!this.isRunning && queue.length) {
      this.isRunning = true

      let completedTasks: Task[] = []
      let task: Task

      while (task = queue.shift()) {
        this.runTask(task)
        completedTasks.push(task)
      }

      this.isRunning = false
      this.drained(completedTasks)
    }
  }

  protected runTask(task: Task) {
    if (this.runTaskOption) {
      this.runTaskOption(task)
    }
  }

  protected drained(completedTasks: Task[]) {
    if (this.drainedOption) {
      this.drainedOption(completedTasks)
    }
  }

}
