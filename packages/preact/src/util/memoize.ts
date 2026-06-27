import { isArraysEqual } from './array'
import { isPropsEqualShallow } from './object'
import { Dictionary } from '../options'

export function memoize<Args extends any[], Res>(
  workerFunc: (...args: Args) => Res,
  resEquality?: (res0: Res, res1: Res) => boolean,
  teardownFunc?: (res: Res) => void,
): (...args: Args) => Res {
  let currentArgs: Args | undefined
  let currentRes: Res | undefined

  return function (...newArgs: Args) { // eslint-disable-line func-names
    if (!currentArgs) {
      currentRes = workerFunc.apply(this, newArgs)
    } else if (!isArraysEqual(currentArgs, newArgs)) {
      if (teardownFunc) {
        teardownFunc(currentRes)
      }

      let res = workerFunc.apply(this, newArgs)

      if (!resEquality || !resEquality(res, currentRes)) {
        currentRes = res
      }
    }

    currentArgs = newArgs

    return currentRes
  }
}

export function memoizeObjArg<Arg extends Dictionary, Res>(
  workerFunc: (arg: Arg) => Res,
  resEquality?: (res0: Res, res1: Res) => boolean,
  teardownFunc?: (res: Res) => void,
): (arg: Arg) => Res {
  let currentArg: Arg | undefined
  let currentRes: Res | undefined

  return (newArg: Arg) => {
    if (!currentArg) {
      currentRes = workerFunc.call(this, newArg)
    } else if (!isPropsEqualShallow(currentArg, newArg)) {
      if (teardownFunc) {
        teardownFunc(currentRes)
      }

      let res = workerFunc.call(this, newArg)

      if (!resEquality || !resEquality(res, currentRes)) {
        currentRes = res
      }
    }

    currentArg = newArg

    return currentRes
  }
}
