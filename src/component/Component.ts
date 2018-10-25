import Calendar from '../Calendar'
import View from '../View'
import Theme from '../theme/Theme'
import { DateEnv } from '../datelib/env'
import { isArraysEqual } from '../util/array'
import { isPropsEqual } from '../util/object'

let guid = 0

export interface ComponentContext {
  options: any
  dateEnv: DateEnv
  theme: Theme
  calendar: Calendar
  view?: View
}

export default class Component<PropsType> {

  uid: string

  props: PropsType | null // non-null signals that a render happened
  renderArgs: { [renderMethodName: string]: any[] } = {} // also indicates if rendered
  renderIds: { [renderMethodName: string]: number } = {}
  unrenderMethodNames: Map<string, string> = new Map()
  sizeMethodNames: Map<string, string> = new Map() // never gets cleared
  dirtySizeMethodNames: Map<string, string> = new Map()

  // context vars
  context: ComponentContext
  dateEnv: DateEnv
  theme: Theme
  view: View
  calendar: Calendar
  isRtl: boolean

  constructor(context: ComponentContext) {
    this.uid = String(guid++)
    this.context = context
    this.dateEnv = context.dateEnv
    this.theme = context.theme
    this.view = context.view
    this.calendar = context.calendar
    this.isRtl = this.opt('dir') === 'rtl'
  }

  opt(name) {
    return this.context.options[name]
  }

  receiveProps(props: PropsType) {
    if (!this.props || !isPropsEqual(this.props, props)) {

      if (this.props) {
        this.unrender()
      }

      this.props = props
      this.render(props)
    }
  }

  protected render(props: PropsType) {
  }

  protected unrender() {
  }

  subrender(renderMethodName, args, unrenderMethodName?, sizeMethodName?): number {
    let { renderIds, renderArgs } = this
    let prevArgs = renderArgs[renderMethodName]
    let renderId = renderIds[renderMethodName]

    if (!prevArgs || !isArraysEqual(prevArgs, args)) {

      if (prevArgs && unrenderMethodName) {
        this[unrenderMethodName].apply(this, prevArgs)
      }

      this[renderMethodName].apply(this, args)
      renderArgs[renderMethodName] = args
      renderIds[renderMethodName] = renderId = guid++

      // for destroy
      if (unrenderMethodName) {
        this.unrenderMethodNames.set(renderMethodName, unrenderMethodName)
      }

      // for updateSize
      if (sizeMethodName) {
        this.sizeMethodNames.set(renderMethodName, sizeMethodName)
        this.dirtySizeMethodNames.set(renderMethodName, sizeMethodName)
      }
    }

    return renderId
  }

  // when isResize is true, causes all subrenders to have sizes updated
  updateSize(viewHeight: number, isAuto: boolean, isResize: boolean) {
    let methodNames = isResize ? this.sizeMethodNames : this.dirtySizeMethodNames

    methodNames.forEach((sizeMethodName) => {
      this[sizeMethodName](isResize)
    })

    this.dirtySizeMethodNames = new Map()
  }

  // after destroy is called, this component won't ever be used again
  destroy() {
    let { renderArgs } = this

    if (this.props) {
      this.unrender()
    }

    let tuples = [] // in reverse
    this.unrenderMethodNames.forEach(function(unrenderMethodName, renderMethodName) {
      tuples.unshift([ unrenderMethodName, renderMethodName ])
    })

    for (let tuple of tuples) {
      this[tuple[0]].apply(this, renderArgs[tuple[1]])
    }
  }

}
