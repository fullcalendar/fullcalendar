import { isArraysEqual } from './array'

// TODO: eliminate use of equalityFuncs
export default function<T>(workerFunc: T): T {
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

export function memoizeOutput<ArgsType extends any[], OutputType>(
  workerFunc: (...args: ArgsType) => OutputType,
  equalityFunc: (output0: OutputType, output1: OutputType) => boolean
): typeof workerFunc {
  let res = null // cachedRes

  return function() {
    let newRes = workerFunc.apply(this, arguments)

    if (res === null || !(res === newRes || equalityFunc(res, newRes))) {
      res = newRes
    }

    return res
  }
}
