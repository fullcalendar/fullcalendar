import TaskQueue from './TaskQueue'


export default class RenderQueue extends TaskQueue {

  waitsByNamespace: any
  waitNamespace: any
  waitId: any


  constructor(waitsByNamespace) {
    super()
    this.waitsByNamespace = waitsByNamespace || {}
  }


  queue(taskFunc, namespace, type) {
    let task = {
      func: taskFunc,
      namespace: namespace,
      type: type
    }
    let waitMs

    if (namespace) {
      waitMs = this.waitsByNamespace[namespace]
    }

    if (this.waitNamespace) {
      if (namespace === this.waitNamespace && waitMs != null) {
        this.delayWait(waitMs)
      } else {
        this.clearWait()
        this.tryStart()
      }
    }

    if (this.compoundTask(task)) { // appended to queue?

      if (!this.waitNamespace && waitMs != null) {
        this.startWait(namespace, waitMs)
      } else {
        this.tryStart()
      }
    }
  }


  startWait(namespace, waitMs) {
    this.waitNamespace = namespace
    this.spawnWait(waitMs)
  }


  delayWait(waitMs) {
    clearTimeout(this.waitId)
    this.spawnWait(waitMs)
  }


  spawnWait(waitMs) {
    this.waitId = setTimeout(() => {
      this.waitNamespace = null
      this.tryStart()
    }, waitMs)
  }


  clearWait() {
    if (this.waitNamespace) {
      clearTimeout(this.waitId)
      this.waitId = null
      this.waitNamespace = null
    }
  }


  canRunNext() {
    if (!super.canRunNext()) {
      return false
    }

    // waiting for a certain namespace to stop receiving tasks?
    if (this.waitNamespace) {

      const { q } = this

      // if there was a different namespace task in the meantime,
      // that forces all previously-waiting tasks to suddenly execute.
      // TODO: find a way to do this in constant time.
      for (let i = 0; i < q.length; i++) {
        if (q[i].namespace !== this.waitNamespace) {
          return true // allow execution
        }
      }

      return false
    }

    return true
  }


  runTask(task) {
    task.func()
  }


  compoundTask(newTask) {
    let q = this.q
    let shouldAppend = true
    let i
    let task

    if (newTask.namespace && newTask.type === 'destroy') {

      // remove all init/add/remove ops with same namespace, regardless of order
      for (i = q.length - 1; i >= 0; i--) {
        task = q[i]

        if (task.namespace === newTask.namespace) {
          switch (task.type) {
            case 'init':
              shouldAppend = false
              // the latest destroy is cancelled out by not doing the init
              /* falls through */
            case 'add':
              /* falls through */
            case 'remove':
              q.splice(i, 1) // remove task
          }
        }
      }
    }

    if (shouldAppend) {
      q.push(newTask)
    }

    return shouldAppend
  }

}
