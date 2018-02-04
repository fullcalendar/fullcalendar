import * as $ from 'jquery'


const PromiseStub = {

  construct: function(executor) {
    let deferred = $.Deferred()
    let promise = deferred.promise()

    if (typeof executor === 'function') {
      executor(
        function(val) { // resolve
          deferred.resolve(val)
          attachImmediatelyResolvingThen(promise, val)
        },
        function() { // reject
          deferred.reject()
          attachImmediatelyRejectingThen(promise)
        }
      )
    }

    return promise
  },

  resolve: function(val) {
    let deferred = $.Deferred().resolve(val)
    let promise = deferred.promise()

    attachImmediatelyResolvingThen(promise, val)

    return promise
  },

  reject: function() {
    let deferred = $.Deferred().reject()
    let promise = deferred.promise()

    attachImmediatelyRejectingThen(promise)

    return promise
  }

}

export default PromiseStub


function attachImmediatelyResolvingThen(promise, val) {
  promise.then = function(onResolve) {
    if (typeof onResolve === 'function') {
      return PromiseStub.resolve(onResolve(val))
    }
    return promise
  }
}


function attachImmediatelyRejectingThen(promise) {
  promise.then = function(onResolve, onReject) {
    if (typeof onReject === 'function') {
      onReject()
    }
    return promise
  }
}
