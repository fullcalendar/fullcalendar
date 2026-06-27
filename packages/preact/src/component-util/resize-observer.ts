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
    flushedCallback()
    afterSizeCallbacks.delete(flushedCallback)
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
  configMap.set(el, { callback, watchWidth, watchHeight })

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
