/*
given a function that resolves a result asynchronously.
the function can either call passed-in success and failure callbacks,
or it can return a promise.
if you need to pass additional params to func, bind them first.
*/
export function unpromisify<Res>(
  func: (
    successCallback: (res: Res) => void,
    failureCallback: (error: Error) => void,
  ) => Promise<Res> | void,
  normalizedSuccessCallback: (res: Res) => void,
  normalizedFailureCallback: (error: Error) => void,
) {
  // guard against success/failure callbacks being called more than once
  // and guard against a promise AND callback being used together.
  let isResolved = false
  let wrappedSuccess = function(res: Res) {
    if (!isResolved) {
      isResolved = true
      normalizedSuccessCallback(res)
    }
  }
  let wrappedFailure = function(error: Error) {
    if (!isResolved) {
      isResolved = true
      normalizedFailureCallback(error)
    }
  }

  let res = func(wrappedSuccess, wrappedFailure)
  if (res && typeof res.then === 'function') {
    res.then(wrappedSuccess, wrappedFailure)
  }
}
