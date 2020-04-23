
export { Component, Fragment, createRef, createContext, Ref, RefObject, ComponentType, createElement as h } from 'react'
export { render } from 'react-dom'

import { ReactNode, UIEvent as VDomUIEvent } from 'react'
export { ReactNode, VDomUIEvent }

export function getNativeEvent(vdomEvent: VDomUIEvent) {
  return vdomEvent.nativeEvent
}

export type VNode = ReactNode
export type ComponentChild =
  | VNode
  | object
  | string
  | number
  | boolean
  | null
  | undefined
export type ComponentChildren = ComponentChild | ComponentChild[]

export function flushToDom() {}
