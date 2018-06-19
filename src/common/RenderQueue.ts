import TaskQueue from './TaskQueue'


export default class RenderQueue extends TaskQueue {

  waitMs: any
  waitId: any


  constructor(waitMs) {
    super()
    this.waitMs = waitMs
  }


  queue(taskFunc) {

    this.q.push(taskFunc)

    if (this.waitMs != null) {
      if (this.waitId != null) {
        this.delayWait()
      } else {
        this.startWait()
      }
    } else {
      this.tryStart()
    }
  }


  delayWait() {
    clearTimeout(this.waitId)
    this.startWait()
  }


  startWait() {
    this.waitId = setTimeout(() => {
      this.waitId = null
      this.tryStart()
    }, this.waitMs)
  }


  clearWait() {
    if (this.waitId != null) {
      clearTimeout(this.waitId)
      this.waitId = null
    }
  }

}
