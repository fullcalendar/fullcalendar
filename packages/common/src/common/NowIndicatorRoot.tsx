import { RenderHook, RenderHookPropsChildren } from './render-hook'
import { DateMarker } from '../datelib/marker'
import { ViewContext, ViewContextType } from '../ViewContext'
import { h } from '../vdom'
import { ViewApi } from '../ViewApi'


export interface NowIndicatorRootProps {
  isAxis: boolean
  date: DateMarker
  children: RenderHookPropsChildren
}

export interface NowIndicatorHookProps {
  isAxis: boolean
  date: Date
  view: ViewApi
}


export const NowIndicatorRoot = (props: NowIndicatorRootProps) => (
  <ViewContextType.Consumer>
    {(context: ViewContext) => {
      let { options } = context
      let hookProps: NowIndicatorHookProps = {
        isAxis: props.isAxis,
        date: context.dateEnv.toDate(props.date),
        view: context.viewApi
      }

      return (
        <RenderHook
          hookProps={hookProps}
          classNames={options.nowIndicatorClassNames}
          content={options.nowIndicatorContent}
          didMount={options.nowIndicatorDidMount}
          willUnmount={options.nowIndicatorWillUnmount}
        >
          {props.children}
        </RenderHook>
      )
    }}
  </ViewContextType.Consumer>
)
