import { isArraysEqual, EqualityFuncs } from './array'


export default function<T>(workerFunc: T, equalityFuncs?: EqualityFuncs): T {
  let prevArgs
  let prevResult

  return function() {
    if (!prevArgs || !isArraysEqual(prevArgs, arguments, equalityFuncs)) {
      prevArgs = arguments
      prevResult = (workerFunc as any).apply(this, arguments)
    }

    return prevResult
  } as any
}
