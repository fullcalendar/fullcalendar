import { MountArg } from './render-hook.js'
import { DateMarker } from '../datelib/marker.js'
import { ViewContext, ViewContextType } from '../ViewContext.js'
import { createElement } from '../preact.js'
import { ViewApi } from '../api/ViewApi.js'
import { ElProps } from '../content-inject/ContentInjector.js'
import { InnerContainerFunc, ContentContainer } from '../content-inject/ContentContainer.js'

export interface NowIndicatorContainerProps extends Partial<ElProps> {
  isAxis: boolean
  date: DateMarker
  children?: InnerContainerFunc<NowIndicatorContentArg>
}

export interface NowIndicatorContentArg {
  isAxis: boolean
  date: Date
  view: ViewApi
}

export type NowIndicatorMountArg = MountArg<NowIndicatorContentArg>

export const NowIndicatorContainer = (props: NowIndicatorContainerProps) => (
  <ViewContextType.Consumer>
    {(context: ViewContext) => {
      let { options } = context
      let renderProps: NowIndicatorContentArg = {
        isAxis: props.isAxis,
        date: context.dateEnv.toDate(props.date),
        view: context.viewApi,
      }

      return (
        <ContentContainer
          {...props /* includes children */}
          elTag={props.elTag || 'div'}
          renderProps={renderProps}
          generatorName="nowIndicatorContent"
          customGenerator={options.nowIndicatorContent}
          classNameGenerator={options.nowIndicatorClassNames}
          didMount={options.nowIndicatorDidMount}
          willUnmount={options.nowIndicatorWillUnmount}
        />
      )
    }}
  </ViewContextType.Consumer>
)
