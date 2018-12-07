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

export function memoizeInBatch<InputArgs extends any[], WorkerArgs extends any[], Res>(
  argGenerator: (...inputArgs: InputArgs) => { [key: string]: WorkerArgs },
  workerFunc: (...workerArgs: WorkerArgs) => Res
): (...inputArgs: InputArgs) => { [key: string]: Res } {
  let argHash = {}
  let resHash = {}

  return function() {
    let updatedArgHash = argGenerator.apply(this, arguments)
    let updatedResHash = {}

    for (let key in updatedArgHash) {
      updatedResHash[key] = (argHash[key] && isArraysEqual(argHash[key], updatedArgHash[key])) ?
        resHash[key] : workerFunc.apply(this, updatedArgHash[key])
    }

    argHash = updatedArgHash
    resHash = updatedResHash

    return updatedResHash
  }
}
