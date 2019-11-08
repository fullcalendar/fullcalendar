

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
    this.clearTimeout()

    if (delay == null) {
      this.tryDrain()
    } else {
      this.timeoutId = setTimeout(this.tryDrain.bind(this), delay) as unknown as number // NOT OPTIMAL! TODO: look at debounce
    }
  }

  pause() {
    this.clearTimeout()
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
