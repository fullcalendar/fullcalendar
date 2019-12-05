
export class DelayedRunner {

  private isRunning = false
  private pauseDepth: number = 0
  private isDirty = false
  private timeoutId: number = 0

  constructor(
    private drainedOption?: () => void
  ) {
  }

  request(delay?: number) {
    this.isDirty = true

    if (!this.pauseDepth) {
      this.clearTimeout()

      if (delay == null) {
        this.drain()
      } else {
        this.timeoutId = setTimeout(this.drain.bind(this), delay) as unknown as number // NOT OPTIMAL! TODO: look at debounce
      }
    }
  }

  pause() {
    this.setPauseDepth(1)
  }

  resume() {
    this.setPauseDepth(0)
  }

  whilePaused(func) {
    this.setPauseDepth(this.pauseDepth + 1)
    func()
    this.setPauseDepth(this.pauseDepth - 1)
  }

  private setPauseDepth(depth: number) {
    let oldDepth = this.pauseDepth
    this.pauseDepth = depth // for this.drain() call

    if (depth) { // wants to pause
      if (!oldDepth) {
        this.clearTimeout()
      }
    } else { // wants to unpause
      if (oldDepth) {
        this.drain()
      }
    }
  }

  private clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = 0
    }
  }

  drain() {
    if (!this.isRunning && !this.pauseDepth) {
      this.isRunning = true

      while (this.isDirty) {
        this.isDirty = false
        this.drained() // might set isDirty to true again
      }

      this.isRunning = false
    }
  }

  protected drained() {
    if (this.drainedOption) {
      this.drainedOption()
    }
  }

  clear() {
    this.pause()
    this.isDirty = false
  }

}


export class TaskRunner<Task> {

  private isRunning = false
  private pauseDepth = 0
  private queue: Task[] = []
  private delayedRunner: DelayedRunner

  constructor(
    private runTaskOption?: (task: Task) => void,
    private drainedOption?: (completedTasks: Task[]) => void
  ) {
    this.delayedRunner = new DelayedRunner(this.drain.bind(this))
  }

  request(task: Task, delay?: number) {
    this.queue.push(task)
    this.delayedRunner.request(delay)
  }

  drain() {
    let { queue } = this

    if (!this.isRunning && !this.pauseDepth) {
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

  pause() {
    this.setPauseDepth(1)
  }

  resume() {
    this.setPauseDepth(0)
  }

  whilePaused(func) {
    this.setPauseDepth(this.pauseDepth + 1)
    func()
    this.setPauseDepth(this.pauseDepth - 1)
  }

  private setPauseDepth(depth: number) {
    let oldDepth = this.pauseDepth
    this.pauseDepth = depth // for this.drain() call

    if (depth) { // wants to pause
      ;
    } else { // wants to unpause
      if (oldDepth) {
        this.drain()
      }
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
