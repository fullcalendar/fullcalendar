import Calendar from '../Calendar'
import View from '../View'
import Theme from '../theme/Theme'
import { DateEnv } from '../datelib/env'

let guid = 0

export interface ComponentContext {
  options: any
  dateEnv: DateEnv
  theme: Theme
  calendar: Calendar
  view: View
}

export type EqualityFuncHash = { [propName: string]: (obj0, obj1) => boolean }

export default class Component<PropsType> {

  equalityFuncs: EqualityFuncHash // can't initialize here. done below...

  uid: string
  props: PropsType | null

  // context vars
  context: ComponentContext
  dateEnv: DateEnv
  theme: Theme
  view: View
  calendar: Calendar
  isRtl: boolean

  constructor(context: ComponentContext, isView?: boolean) {

    // HACK to populate view at top of component instantiation call chain
    if (isView) {
      context.view = this as any
    }

    this.uid = String(guid++)
    this.context = context
    this.dateEnv = context.dateEnv
    this.theme = context.theme
    this.view = context.view
    this.calendar = context.calendar
    this.isRtl = this.opt('dir') === 'rtl'
  }

  static addEqualityFuncs(newFuncs: EqualityFuncHash) {
    this.prototype.equalityFuncs = {
      ...this.prototype.equalityFuncs,
      ...newFuncs
    }
  }

  opt(name) {
    return this.context.options[name]
  }

  receiveProps(props: PropsType) {
    let { anyChanges, comboProps } = recycleProps(this.props || {}, props, this.equalityFuncs)

    this.props = comboProps

    if (anyChanges) {
      this.render(comboProps)
    }
  }

  protected render(props: PropsType) {
  }

  // after destroy is called, this component won't ever be used again
  destroy() {
  }

}

Component.prototype.equalityFuncs = {}


/*
Reuses old values when equal. If anything is unequal, returns newProps as-is.
Great for PureComponent, but won't be feasible with React, so just eliminate and use React's DOM diffing.
*/
function recycleProps(oldProps, newProps, equalityFuncs: EqualityFuncHash) {
  let comboProps = {} as any // some old, some new
  let anyChanges = false

  for (let key in newProps) {
    if (
      key in oldProps && (
        oldProps[key] === newProps[key] ||
        (equalityFuncs[key] && equalityFuncs[key](oldProps[key], newProps[key]))
      )
    ) {
      // equal to old? use old prop
      comboProps[key] = oldProps[key]
    } else {
      comboProps[key] = newProps[key]
      anyChanges = true
    }
  }

  for (let key in oldProps) {
    if (!(key in newProps)) {
      anyChanges = true
      break
    }
  }

  return { anyChanges, comboProps }
}
