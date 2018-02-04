import { default as EmitterMixin, EmitterInterface } from './EmitterMixin'

export default class TaskQueue {

  on: EmitterInterface['on']
  one: EmitterInterface['one']
  off: EmitterInterface['off']
  trigger: EmitterInterface['trigger']
  triggerWith: EmitterInterface['triggerWith']
  hasHandlers: EmitterInterface['hasHandlers']

  q: any = []
  isPaused: boolean = false
  isRunning: boolean = false


  queue(...args) {
    this.q.push.apply(this.q, args) // append
    this.tryStart()
  }


  pause() {
    this.isPaused = true
  }


  resume() {
    this.isPaused = false
    this.tryStart()
  }


  getIsIdle() {
    return !this.isRunning && !this.isPaused
  }


  tryStart() {
    if (!this.isRunning && this.canRunNext()) {
      this.isRunning = true
      this.trigger('start')
      this.runRemaining()
    }
  }


  canRunNext() {
    return !this.isPaused && this.q.length
  }


  runRemaining() { // assumes at least one task in queue. does not check canRunNext for first task.
    let task
    let res

    do {
      task = this.q.shift() // always freshly reference q. might have been reassigned.
      res = this.runTask(task)

      if (res && res.then) {
        res.then(() => {
          if (this.canRunNext()) {
            this.runRemaining()
          }
        })
        return // prevent marking as stopped
      }
    } while (this.canRunNext())

    this.trigger('stop') // not really a 'stop' ... more of a 'drained'
    this.isRunning = false

    // if 'stop' handler added more tasks.... TODO: write test for this
    this.tryStart()
  }


  runTask(task) {
    return task() // task *is* the function, but subclasses can change the format of a task
  }

}

EmitterMixin.mixInto(TaskQueue)
