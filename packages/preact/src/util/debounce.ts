
export function debounce(fn: () => void, ms: number): [
  request: () => void,
  cancel: () => void,
] {
  let timeoutStarted: number | undefined
  let timeoutAdded: number | undefined
  let timeoutId: number | undefined // thruthiness indicates whether active timeout

  function runWithTimeout(timeout: number) {
    timeoutStarted = Date.now()
    timeoutAdded = 0
    timeoutId = setTimeout(() => {
      if (timeoutAdded) {
        runWithTimeout(timeoutAdded)
      } else {
        timeoutId = undefined
        fn()
      }
    }, timeout)
  }

  function request() {
    if (timeoutId) {
      timeoutAdded = Date.now() - timeoutStarted
    } else {
      runWithTimeout(ms)
    }
  }

  function cancel() {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
  }

  return [request, cancel]
}
