
export default class ListenerCounter {

  constructor(el) {
    this.delta = 0
    this.el = el
  }

  startWatching() {
    let t = this
    let el = t.el
    let origAddEventListened = el.addEventListener
    let origRemoveEventListener = el.removeEventListener

    el.addEventListener = function() {
      t.delta++
      return origAddEventListened.apply(el, arguments)
    }

    el.removeEventListener = function(name) {
      if (name !== 'load') { // ignore when jQuery detaches the load event from the window
        t.delta--
      }
      return origRemoveEventListener.apply(el, arguments)
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
  var hash = getJqueryHandlerHash(el)
  var cnt = 0

  $.each(hash, function(name, handlers) {
    cnt += handlers.length
  })

  return cnt
}


function getJqueryHandlerHash(el) {
  return $._data($(el)[0], 'events') || {}
}
