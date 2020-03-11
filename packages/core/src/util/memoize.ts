import { isArraysEqual } from './array'


export function memoize<Args extends any[], Res>(
  workerFunc: (...args: Args) => Res,
  resEquality?: (res0: Res, res1: Res) => boolean,
  teardownFunc?: (res: Res) => void
): (...args: Args) => Res {

  let currentArgs: Args | undefined
  let currentRes: Res | undefined

  return function(...newArgs: Args) {

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


export function memoizeArraylike<Args extends any[], Res>( // used at all?
  workerFunc: (...args: Args) => Res,
  resEquality?: (res0: Res, res1: Res) => boolean,
  teardownFunc?: (res: Res) => void
): (argSets: Args[]) => Res[] {

  let currentArgSets: Args[] = []
  let currentResults: Res[] = []

  return function(newArgSets: Args[]) {
    let currentLen = currentArgSets.length
    let newLen = newArgSets.length
    let i = 0

    for (; i < currentLen; i++) {
      if (!isArraysEqual(currentArgSets[i], newArgSets[i])) {

        if (teardownFunc) {
          teardownFunc(currentResults[i])
        }

        let res = workerFunc.apply(this, newArgSets[i])

        if (!resEquality || !resEquality(res, currentResults[i])) {
          currentResults[i] = res
        }
      }
    }

    for (; i < newLen; i++) {
      currentResults[i] = workerFunc.apply(this, newArgSets[i])
    }

    currentArgSets = newArgSets
    currentResults.splice(newLen) // remove excess

    return currentResults
  }
}


export function memoizeHashlike<Args extends any[], Res>(
  workerFunc: (...args: Args) => Res,
  resEquality?: (res0: Res, res1: Res) => boolean,
  teardownFunc?: (res: Res) => void // TODO: change arg order
): (argHash: { [key: string]: Args }) => { [key: string]: Res } {

  let currentArgHash: { [key: string]: Args } = {}
  let currentResHash: { [key: string]: Res } = {}

  return function(newArgHash: { [key: string]: Args }) {
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
