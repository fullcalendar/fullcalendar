import { isArraysEqual } from '../util/array'

export interface MemoizedRendering<ArgsType extends any[]> {
  (...args: ArgsType): void
  unrender: () => void
  dependents: MemoizedRendering<any>[]
}

export function memoizeRendering<ArgsType extends any[]>(
  renderFunc: (...args: ArgsType) => void,
  unrenderFunc?: (...args: ArgsType) => void,
  dependencies: MemoizedRendering<any>[] = []
): MemoizedRendering<ArgsType> {

  let dependents: MemoizedRendering<any>[] = []
  let thisContext
  let prevArgs

  function unrender() {
    if (prevArgs) {

      for (let dependent of dependents) {
        dependent.unrender()
      }

      if (unrenderFunc) {
        unrenderFunc.apply(thisContext, prevArgs)
      }

      prevArgs = null
    }
  }

  function res() {
    if (!prevArgs || !isArraysEqual(prevArgs, arguments)) {
      unrender()
      thisContext = this
      prevArgs = arguments
      renderFunc.apply(this, arguments)
    }
  }

  res.dependents = dependents
  res.unrender = unrender

  for (let dependency of dependencies) {
    dependency.dependents.push(res)
  }

  return res
}
