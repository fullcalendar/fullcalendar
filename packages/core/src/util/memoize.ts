import { isArraysEqual } from './array.js'
import { isPropsEqual } from './object.js'
import { Dictionary } from '../options.js'

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
    } else if (!isPropsEqual(currentArg, newArg)) {
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

export type MemoiseArrayFunc<Args extends any[], Res> =
  (argSets: Args[]) => Res[]

export function memoizeArraylike<Args extends any[], Res>( // used at all?
  workerFunc: (...args: Args) => Res,
  resEquality?: (res0: Res, res1: Res) => boolean,
  teardownFunc?: (res: Res) => void,
): MemoiseArrayFunc<Args, Res> {
  let currentArgSets: Args[] = []
  let currentResults: Res[] = []

  return (newArgSets: Args[]) => {
    let currentLen = currentArgSets.length
    let newLen = newArgSets.length
    let i = 0

    for (; i < currentLen; i += 1) {
      if (!newArgSets[i]) { // one of the old sets no longer exists
        if (teardownFunc) {
          teardownFunc(currentResults[i])
        }
      } else if (!isArraysEqual(currentArgSets[i], newArgSets[i])) {
        if (teardownFunc) {
          teardownFunc(currentResults[i])
        }

        let res = workerFunc.apply(this, newArgSets[i])

        if (!resEquality || !resEquality(res, currentResults[i])) {
          currentResults[i] = res
        }
      }
    }

    for (; i < newLen; i += 1) {
      currentResults[i] = workerFunc.apply(this, newArgSets[i])
    }

    currentArgSets = newArgSets
    currentResults.splice(newLen) // remove excess

    return currentResults
  }
}

export type MemoizeHashFunc<Args extends any[], Res> =
  (argHash: { [key: string]: Args }) => { [key: string]: Res }

export function memoizeHashlike<Args extends any[], Res>(
  workerFunc: (...args: Args) => Res,
  resEquality?: (res0: Res, res1: Res) => boolean,
  teardownFunc?: (res: Res) => void, // TODO: change arg order
): MemoizeHashFunc<Args, Res> {
  let currentArgHash: { [key: string]: Args } = {}
  let currentResHash: { [key: string]: Res } = {}

  return (newArgHash: { [key: string]: Args }) => {
    let newResHash: { [key: string]: Res } = {}

    for (let key in newArgHash) {
      if (!currentResHash[key]) {
        newResHash[key] = workerFunc.apply(this, newArgHash[key])
      } else if (!isArraysEqual(currentArgHash[key], newArgHash[key])) {
        if (teardownFunc) {
          teardownFunc(currentResHash[key])
        }

        let res = workerFunc.apply(this, newArgHash[key])

        newResHash[key] = (resEquality && resEquality(res, currentResHash[key]))
          ? currentResHash[key]
          : res
      } else {
        newResHash[key] = currentResHash[key]
      }
    }

    currentArgHash = newArgHash
    currentResHash = newResHash

    return newResHash
  }
}
