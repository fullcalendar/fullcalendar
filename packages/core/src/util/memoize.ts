import { isArraysEqual } from './array'

export function memoize<T>(workerFunc: T): T {
  let args
  let res

  return function() {
    if (!args || !isArraysEqual(args, arguments)) {
      args = arguments
      res = (workerFunc as any).apply(this, arguments)
    }

    return res
  } as any
}

/*
always executes the workerFunc, but if the result is equal to the previous result,
return the previous result instead.
*/
export function memoizeOutput<T>(workerFunc: T, equalityFunc: (output0, output1) => boolean): T {
  let cachedRes = null

  return function() {
    let newRes = (workerFunc as any).apply(this, arguments)

    if (cachedRes === null || !(cachedRes === newRes || equalityFunc(cachedRes, newRes))) {
      cachedRes = newRes
    }

    return cachedRes
  } as any
}
