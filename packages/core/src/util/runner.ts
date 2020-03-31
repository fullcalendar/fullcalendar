
// TODO: try to DRY-up the pausing systems of each of these classes


export class DelayedRunner {

  private isRunning = false
  private isDirty = false
  private pauseDepths: { [scope: string]: number } = {}
  private timeoutId: number = 0

  constructor(
    private drainedOption?: () => void
  ) {
  }

  request(delay?: number) {
    this.isDirty = true

    if (!this.isPaused()) {
      this.clearTimeout()

      if (delay == null) {
        this.tryDrain()
      } else {
        this.timeoutId = setTimeout(this.tryDrain.bind(this), delay) as unknown as number // NOT OPTIMAL! TODO: look at debounce
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

  private isRunning = false
  private pauseDepths: { [scope: string]: number } = {}
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

  pause(scope = '') {
    let { pauseDepths } = this

    pauseDepths[scope] = (pauseDepths[scope] || 0) + 1
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
    let { queue } = this

    if (!this.isRunning && !this.isPaused()) {
      this.isRunning = true

      while (queue.length) {
        let completedTasks: Task[] = []
        let task: Task

        while (task = queue.shift()) {
          this.runTask(task)
          completedTasks.push(task)
        }

        this.drained(completedTasks)
      }

      this.isRunning = false
    }
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
