import Calendar from '../Calendar'
import View from '../View'
import Theme from '../theme/Theme'
import { DateEnv } from '../datelib/env'
import { isPropsEqual, assignTo, EqualityFuncHash } from '../util/object'

let guid = 0

export interface ComponentContext {
  options: any
  dateEnv: DateEnv
  theme: Theme
  calendar: Calendar
  view?: View
}

export default class Component<PropsType> {

  equalityFuncs: EqualityFuncHash

  uid: string
  props: PropsType | null // non-null signals that a render happened

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

  static addEqualityFuncs(newFuncs: EqualityFuncHash) {
    this.prototype.equalityFuncs = assignTo(
      {},
      this.prototype.equalityFuncs,
      newFuncs
    )
  }

  opt(name) {
    return this.context.options[name]
  }

  receiveProps(props: PropsType) {
    if (!this.props || !isPropsEqual(this.props, props, this.equalityFuncs)) {

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

  // after destroy is called, this component won't ever be used again
  destroy() {
    if (this.props) {
      this.unrender()
    }
  }

}
