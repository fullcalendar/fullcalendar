import { isArraysEqual } from './array'


// TODO: better typings!!!


export function memoize<T>(workerFunc: T, resEquality?: (res0, res1) => boolean): T {
  let args
  let res

  return function() {
    if (!args || !isArraysEqual(args, arguments)) { // the arguments have changed?...
      args = arguments

      let newRes = (workerFunc as any).apply(this, arguments)

      if (res === undefined || !(resEquality ? resEquality(newRes, res) : newRes === res)) {
        res = newRes // the result has changed
      }
    }

    return res
  } as any
}


export function memoizeParallel<Res>(workerFunc: (...args: any[]) => Res, resEquality?: (res0, res1) => boolean): (...args: any[]) => Res[] {
  let memoizers = []

  return function() {
    let argCnt = arguments.length
    let memoizerCnt = arguments[0].length
    let i
    let allRes = []

    memoizers.splice(memoizerCnt) // remove excess

    // add new
    for (i = memoizers.length; i < memoizerCnt; i++) {
      memoizers[i] = memoize(workerFunc, resEquality)
    }

    for (i = 0; i < memoizerCnt; i++) {
      let args = []

      for (let argIndex = 0; argIndex < argCnt; argIndex++) {
        args.push(arguments[argIndex][i])
      }

      allRes.push(
        memoizers[i].apply(this, args)
      )
    }

    return allRes
  } as any
}
