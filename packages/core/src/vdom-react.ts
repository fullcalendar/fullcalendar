
export { Component, Fragment, createRef, ReactNode, createContext, Ref, RefObject, ComponentType, createElement as h } from 'react'
export { render } from 'react-dom'

import { ReactNode } from 'react'
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
