
export function memoize<T>(workerFunc: T, equality?): T {
  let args
  let res

  return function() {
    if (!args || !isArgsEqual(args, arguments, equality)) {
      args = arguments
      res = (workerFunc as any).apply(this, arguments)
    }

    return res
  } as any
}

// TODO: merge with isArraysEqual?
// TODO: better solution that links the function with the equality checks. like subrenderer?
function isArgsEqual(args0, args1, equality?) {
  let len = args0.length

  if (len !== args1.length) {
    return false
  }

  for (let i = 0; i < len; i++) {
    if (
      (equality && equality[i]) ?
        !equality[i](args0[i], args1[i]) :
        args0[i] !== args1[i]
    ) {
      return false
    }
  }

  return true
}


/*
always executes the workerFunc, but if the result is equal to the previous result,
return the previous result instead.
TODO: somehow use memoize with equality funcs instead?
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
