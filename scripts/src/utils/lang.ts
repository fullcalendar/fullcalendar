
export function mapProps<V, R>(
  props: { [key: string]: V },
  func: (val: V, key: string) => R,
): { [key: string]: R } {
  const newProps: { [key: string]: R } = {}

  for (const key in props) {
    newProps[key] = func(props[key], key)
  }

  return newProps
}

export function filterProps<V>(
  props: { [key: string]: V },
  func: (val: V, key: string) => boolean,
): { [key: string]: V } {
  const newProps: { [key: string]: V } = {}

  for (const key in props) {
    if (func(props[key], key)) {
      newProps[key] = props[key]
    }
  }

  return newProps
}

export function strsToProps(strs: string[]): { [str: string]: true } {
  const map: { [str: string]: true } = {}

  for (const str of strs) {
    map[str] = true
  }

  return map
}

export function boolPromise(promise: Promise<any>): Promise<boolean> {
  return promise.then(
    () => true,
    () => false,
  )
}

export function arrayify(input: any): any[] {
  return Array.isArray(input) ? input : (input == null ? [] : [input])
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// Async
// -------------------------------------------------------------------------------------------------

export type ContinuousAsyncFunc = (rerun: () => void) => ContinuousAsyncFuncRes
export type ContinuousAsyncFuncRes =
  Promise<(() => void) | void> |
  (() => void) |
  void

export async function continuousAsync(workerFunc: ContinuousAsyncFunc): Promise<() => void> {
  let currentRun: Promise<ContinuousAsyncFuncRes> | undefined
  let currentCleanupFunc: (() => void) | undefined
  let isDirty = false
  let isStopped = false

  async function run() {
    if (!isStopped) {
      if (!currentRun) {
        currentCleanupFunc && currentCleanupFunc()
        currentCleanupFunc = undefined

        currentRun = Promise.resolve(workerFunc(run))
        currentCleanupFunc = (await currentRun) || undefined
        currentRun = undefined

        // had scan requests during previous run?
        if (isDirty) {
          isDirty = false
          run()
        }
      } else {
        isDirty = true
      }
    }
  }

  await run()

  return () => { // the "stop" function
    isStopped = true
    currentCleanupFunc && currentCleanupFunc()
  }
}
