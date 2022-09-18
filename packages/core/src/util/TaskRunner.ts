import { DelayedRunner } from './DelayedRunner.js'

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
