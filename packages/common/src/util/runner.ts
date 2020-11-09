export class DelayedRunner {
  private isRunning = false
  private isDirty = false
  private pauseDepths: { [scope: string]: number } = {}
  private timeoutId: number = 0

  constructor(
    private drainedOption?: () => void,
  ) {
  }

  request(delay?: number) {
    this.isDirty = true

    if (!this.isPaused()) {
      this.clearTimeout()

      if (delay == null) {
        this.tryDrain()
      } else {
        this.timeoutId = setTimeout( // NOT OPTIMAL! TODO: look at debounce
          this.tryDrain.bind(this),
          delay,
        ) as unknown as number
      }
    }
  }

  pause(scope = '') {
    let { pauseDepths } = this

    pauseDepths[scope] = (pauseDepths[scope] || 0) + 1

    this.clearTimeout()
  }

  resume(scope = '', force?: boolean) {
    let { pauseDepths } = this

    if (scope in pauseDepths) {
      if (force) {
        delete pauseDepths[scope]
      } else {
        let depth = --pauseDepths[scope]

        if (depth <= 0) {
          delete pauseDepths[scope]
        }
      }

      this.tryDrain()
    }
  }

  isPaused() {
    return Object.keys(this.pauseDepths).length
  }

  tryDrain() {
    if (!this.isRunning && !this.isPaused()) {
      this.isRunning = true

      while (this.isDirty) {
        this.isDirty = false
        this.drained() // might set isDirty to true again
      }

      this.isRunning = false
    }
  }

  clear() {
    this.clearTimeout()
    this.isDirty = false
    this.pauseDepths = {}
  }

  private clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = 0
    }
  }

  protected drained() { // subclasses can implement
    if (this.drainedOption) {
      this.drainedOption()
    }
  }
}

export class TaskRunner<Task> { // this class USES the DelayedRunner
  private queue: Task[] = []

  private delayedRunner: DelayedRunner // will most likely be used WITHOUT any delay

  constructor(
    private runTaskOption?: (task: Task) => void,
    private drainedOption?: (completedTasks: Task[]) => void,
  ) {
    this.delayedRunner = new DelayedRunner(this.drain.bind(this))
  }

  request(task: Task, delay?: number) {
    this.queue.push(task)
    this.delayedRunner.request(delay)
  }

  pause(scope?: string) {
    this.delayedRunner.pause(scope)
  }

  resume(scope?: string, force?: boolean) {
    this.delayedRunner.resume(scope, force)
  }

  drain() {
    let { queue } = this

    while (queue.length) {
      let completedTasks: Task[] = []
      let task: Task

      while ((task = queue.shift())) {
        this.runTask(task)
        completedTasks.push(task)
      }

      this.drained(completedTasks)
    } // keep going, in case new tasks were added in the drained handler
  }

  protected runTask(task: Task) { // subclasses can implement
    if (this.runTaskOption) {
      this.runTaskOption(task)
    }
  }

  protected drained(completedTasks: Task[]) { // subclasses can implement
    if (this.drainedOption) {
      this.drainedOption(completedTasks)
    }
  }
}
