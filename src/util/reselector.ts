import { isArraysEqual, EqualityFuncs } from './array'

// TODO: eliminate use of equalityFuncs
export default function<T>(workerFunc: T, equalityFuncs?: EqualityFuncs): T {
  let args
  let res

  return function() {
    if (!args || !isArraysEqual(args, arguments, equalityFuncs)) {
      args = arguments
      res = (workerFunc as any).apply(this, arguments)
    }

    return res
  } as any
}
