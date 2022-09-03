const IGNORED_EVENTS = {
  load: true, // ignore when jQuery detaches the load event from the window
}

export class ListenerCounter {
  el: HTMLElement
  delta = 0
  jQueryStartCount = 0

  constructor(el) {
    this.el = el
  }

  startWatching() {
    let t = this
    let el = t.el
    let origAddEventListened = el.addEventListener
    let origRemoveEventListener = el.removeEventListener

    el.addEventListener = (eventName, ...otherArgs) => {
      if (!IGNORED_EVENTS[eventName]) {
        t.delta += 1
      }
      return origAddEventListened.call(el, eventName, ...otherArgs)
    }

    el.removeEventListener = (eventName, ...otherArgs) => {
      if (!IGNORED_EVENTS[eventName]) {
        t.delta -= 1
      }
      return origRemoveEventListener.call(el, eventName, ...otherArgs)
    }

    this.jQueryStartCount = countJqueryListeners(el)
  }

  stopWatching() {
    delete this.el.addEventListener
    delete this.el.removeEventListener

    return this.computeDelta()
  }

  computeDelta() {
    return this.delta + (countJqueryListeners(this.el) - this.jQueryStartCount)
  }
}

function countJqueryListeners(el) {
  let hash = getJqueryHandlerHash(el)
  let cnt = 0

  $.each(hash, (name, handlers) => {
    cnt += handlers.length
  })

  return cnt
}

function getJqueryHandlerHash(el) {
  return $._data($(el)[0], 'events') || {}
}
