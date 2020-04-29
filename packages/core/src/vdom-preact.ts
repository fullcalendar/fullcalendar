import * as preact from 'preact'
import * as hacks from './preact-hacks'
export { flushToDom } from './preact-hacks'

declare global {
  namespace FullCalendarVDom {
    export import Ref = preact.Ref
    export import RefObject = preact.RefObject
    export import ComponentType = preact.ComponentType
    export type VNode = preact.VNode // will NOT forward the props type
    export import Context = preact.Context
    export import Component = preact.Component
    export import ComponentChild = preact.ComponentChild
    export import ComponentChildren = preact.ComponentChildren
    export import h = preact.h
    export import render = preact.render
    export import createRef = preact.createRef
    export import Fragment = preact.Fragment
    export import createContext = hacks.createContext
    export type VUIEvent = UIEvent
  }
}

window.FullCalendarVDom = {
  Component: preact.Component,
  h: preact.h,
  render: preact.render,
  createRef: preact.createRef,
  Fragment: preact.Fragment,
  createContext: hacks.createContext
}
