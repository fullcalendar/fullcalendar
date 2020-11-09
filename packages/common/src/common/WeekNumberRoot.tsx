import { ViewContext, ViewContextType } from '../ViewContext'
import { DateMarker } from '../datelib/marker'
import { RenderHook, RenderHookPropsChildren, MountArg } from './render-hook'
import { createElement } from '../vdom'
import { DateFormatter } from '../datelib/DateFormatter'

export interface WeekNumberRootProps {
  date: DateMarker
  defaultFormat: DateFormatter
  children: RenderHookPropsChildren
}

export interface WeekNumberContentArg {
  num: number
  text: string
  date: Date
}
export type WeekNumberMountArg = MountArg<WeekNumberContentArg>

export const WeekNumberRoot = (props: WeekNumberRootProps) => (
  <ViewContextType.Consumer>
    {(context: ViewContext) => {
      let { dateEnv, options } = context
      let { date } = props
      let format = options.weekNumberFormat || props.defaultFormat
      let num = dateEnv.computeWeekNumber(date) // TODO: somehow use for formatting as well?
      let text = dateEnv.format(date, format)
      let hookProps: WeekNumberContentArg = { num, text, date }

      return (
        <RenderHook<WeekNumberContentArg> // why isn't WeekNumberContentArg being auto-detected?
          hookProps={hookProps}
          classNames={options.weekNumberClassNames}
          content={options.weekNumberContent}
          defaultContent={renderInner}
          didMount={options.weekNumberDidMount}
          willUnmount={options.weekNumberWillUnmount}
        >
          {props.children}
        </RenderHook>
      )
    }}
  </ViewContextType.Consumer>
)

function renderInner(innerProps) {
  return innerProps.text
}
