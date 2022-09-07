// given a function that resolves a result asynchronously.
// the function can either call passed-in success and failure callbacks,
// or it can return a promise.
// if you need to pass additional params to func, bind them first.
export function unpromisify(func, success, failure?) {
  // guard against success/failure callbacks being called more than once
  // and guard against a promise AND callback being used together.
  let isResolved = false
  let wrappedSuccess = function () { // eslint-disable-line func-names
    if (!isResolved) {
      isResolved = true
      success.apply(this, arguments) // eslint-disable-line prefer-rest-params
    }
  }
  let wrappedFailure = function () { // eslint-disable-line func-names
    if (!isResolved) {
      isResolved = true
      if (failure) {
        failure.apply(this, arguments) // eslint-disable-line prefer-rest-params
      }
    }
  }

  let res = func(wrappedSuccess, wrappedFailure)
  if (res && typeof res.then === 'function') {
    res.then(wrappedSuccess, wrappedFailure)
  }
}
