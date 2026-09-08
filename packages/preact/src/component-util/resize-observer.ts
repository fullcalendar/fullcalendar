import { flushSync } from 'react-dom'
import { isDimsEqual } from './rendering-misc'

const nativeBorderBoxEnabled = true

// Common
// -------------------------------------------------------------------------------------------------

export type SizeCallback = (width: number, height: number) => void
export type DisconnectSize = () => void

type SizeConfig = { // internal only
  callback: SizeCallback
  width?: number // HACK: internal storage
  height?: number // HACK: internal storage
  watchWidth: boolean // TODO: use bitwise operations
  watchHeight: boolean // "
}

const configMap = new Map<Element, SizeConfig>()
const afterSizeCallbacks = new Set<() => void>()

let isHandling = false
let isStalling = false
let isAcquiringImmediately = false

export function afterSize(callback: () => void) {
  afterSizeCallbacks.add(callback)

  // batch & then flush when not within ResizeObserver handler loop
  // happens for watchers that die and report `null` as dimension
  if (!isHandling && !isStalling) {
    isStalling = true
    requestAnimationFrame(() => {
      isStalling = false
      flushAfterSize()
    })
  }
}

function flushAfterSize() {
  for (const flushedCallback of afterSizeCallbacks.values()) {
    afterSizeCallbacks.delete(flushedCallback)
    flushedCallback()
  }
}

/*
Commits synchronously while switching every watcher registered during the
commit to immediate acquisition: registration reads getBoundingClientRect()
on the spot and fires the callback before returning, instead of waiting for
the shared ResizeObserver's later delivery. This is the "measure now" path
required when print-only DOM mounts during the native beforeprint task —
observer delivery would arrive after the browser has already snapshotted.
(gBCR reflects transforms while the observer's border-box does not; for
print DOM that distinction is acceptable. Once components go functional, a
`useElementSize`-style hook performs this same acquire-then-observe.)

The afterSize work those callbacks (and any watcher deaths) queue
accumulates and drains ONCE after the commit, not once per registration —
so a commit mounting N measured wrappers costs one layout recomputation,
not N. The drain runs in its own flushSync so handler state updates still
settle within the calling task; additions made while draining are picked up
by the same loop. Preact flushes mount lifecycles after the root diff, so
the reads don't interleave with the commit's DOM writes.

Adopt this bracket a la carte, only for commits whose entire mounted-watcher
population tolerates a synchronous first report (currently: entering print
mode). Ordinary watchSize callers everywhere else keep their async-first
ResizeObserver semantics.
*/
export function flushSyncWithSizeBatching(callback: () => void): void {
  const wasHandling = isHandling
  isHandling = true
  isAcquiringImmediately = true
  try {
    flushSync(callback)
    if (!wasHandling) {
      flushSync(() => {
        flushAfterSize()
        isHandling = false // before drain's own commit, so late afterSize calls schedule a flush
      })
    }
  } finally {
    isHandling = wasHandling
    isAcquiringImmediately = false
  }
}

// Native
// -------------------------------------------------------------------------------------------------

// Single global ResizeObserver does batching and uses less memory than individuals
// Will always fire with delay after DOM mutation, but before repaint,
// thus doesn't need !isHandling check like checkConfigMap
const globalResizeObserver = typeof ResizeObserver !== 'undefined' && new ResizeObserver((entries) => {
  isHandling = true

  // // debug
  // console.log('RESIZE-OBSERVER', entries.map((entry) => entry.target))

  for (let entry of entries) {
    const el = entry.target
    const config = configMap.get(el)
    let width: number
    let height: number

    if (entry.borderBoxSize && nativeBorderBoxEnabled) {
      const borderBoxSize: any = entry.borderBoxSize[0] || entry.borderBoxSize // HACK for Firefox
      width = borderBoxSize.inlineSize
      height = borderBoxSize.blockSize
    } else {
      ({ width, height } = el.getBoundingClientRect())
    }

    let shouldFire = false
    if (!isDimsEqual(config.width, width)) {
      config.width = width
      shouldFire = config.watchWidth
    }
    if (!isDimsEqual(config.height, height)) {
      config.height = height
      shouldFire ||= config.watchHeight
    }
    if (shouldFire) {
      config.callback(width, height)
    }
  }

  flushSync(() => {
    flushAfterSize()
    isHandling = false
  })
})

/*
PRECONDITION: element can only have one listener attached
*/
export function watchSize(
  el: HTMLElement,
  callback: SizeCallback,
  watchWidth = true,
  watchHeight = true,
): DisconnectSize {
  const config: SizeConfig = { callback, watchWidth, watchHeight }
  configMap.set(el, config)

  // within a flushSyncWithSizeBatching commit; see its comment.
  // the stored dims dedupe the observer's later initial delivery.
  if (isAcquiringImmediately) {
    const { width, height } = el.getBoundingClientRect()
    config.width = width
    config.height = height
    callback(width, height)
  }

  // if statement is for jsdom and other shim environments that execute component effects, but
  // haven't implemented ResizeObserver. Reference: https://github.com/jsdom/jsdom/issues/3368
  if (globalResizeObserver) {
    globalResizeObserver.observe(el, {
      box: nativeBorderBoxEnabled
        ? 'border-box'
        : undefined // default is 'content-box'
    })
  }

  return () => {
    configMap.delete(el)

    // same reasoning as above
    if (globalResizeObserver) {
      globalResizeObserver.unobserve(el)
    }
  }
}

export function watchWidth(
  el: HTMLElement,
  callback: (width: number) => void,
): DisconnectSize {
  return watchSize(
    el,
    callback,
    /* watchWidth = */ true,
  )
}

export function watchHeight(
  el: HTMLElement,
  callback: (height: number) => void,
): DisconnectSize {
  return watchSize(
    el,
    (_width, height) => callback(height),
    /* watchWidth = */ false,
    /* watchHeight = */ true,
  )
}
