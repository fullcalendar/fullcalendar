import { isArraysEqual } from './array'


export default function(workerFunc) {
  let prevArgs
  let prevResult

  return function() {
    if (!prevArgs || !isArraysEqual(prevArgs, arguments)) {
      prevArgs = arguments
      prevResult = workerFunc.apply(this, arguments)
    }

    return prevResult
  }
}
