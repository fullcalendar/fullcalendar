import { ViewContext, ViewContextType } from '../ViewContext.js'
import { DateMarker } from '../datelib/marker.js'
import { MountArg } from './render-hook.js'
import { createElement } from '../preact.js'
import { DateFormatter } from '../datelib/DateFormatter.js'
import { ElProps } from '../content-inject/ContentInjector.js'
import { ContentContainer, InnerContainerFunc } from '../content-inject/ContentContainer.js'

export interface WeekNumberContainerProps extends ElProps {
  date: DateMarker
  defaultFormat: DateFormatter
  children?: InnerContainerFunc<WeekNumberContentArg>
}

export interface WeekNumberContentArg {
  num: number
  text: string
  date: Date
}

export type WeekNumberMountArg = MountArg<WeekNumberContentArg>

export const WeekNumberContainer = (props: WeekNumberContainerProps) => (
  <ViewContextType.Consumer>
    {(context: ViewContext) => {
      let { dateEnv, options } = context
      let { date } = props
      let format = options.weekNumberFormat || props.defaultFormat
      let num = dateEnv.computeWeekNumber(date) // TODO: somehow use for formatting as well?
      let text = dateEnv.format(date, format)
      let renderProps: WeekNumberContentArg = { num, text, date }

      return (
        <ContentContainer // why isn't WeekNumberContentArg being auto-detected?
          {...props /* includes children */}
          renderProps={renderProps}
          generatorName="weekNumberContent"
          customGenerator={options.weekNumberContent}
          defaultGenerator={renderInner}
          classNameGenerator={options.weekNumberClassNames}
          didMount={options.weekNumberDidMount}
          willUnmount={options.weekNumberWillUnmount}
        />
      )
    }}
  </ViewContextType.Consumer>
)

function renderInner(innerProps) {
  return innerProps.text
}
