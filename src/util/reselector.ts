import { isArraysEqual } from './array'


export default function<T>(workerFunc: T): T {
  let prevArgs
  let prevResult

  return function() {
    if (!prevArgs || !isArraysEqual(prevArgs, arguments)) {
      prevArgs = arguments
      prevResult = (workerFunc as any).apply(this, arguments)
    }

    return prevResult
  } as any
}
