import { RenderHook, RenderHookPropsChildren, MountArg } from './render-hook'
import { DateMarker } from '../datelib/marker'
import { ViewContext, ViewContextType } from '../ViewContext'
import { createElement } from '../vdom'
import { ViewApi } from '../ViewApi'

export interface NowIndicatorRootProps {
  isAxis: boolean
  date: DateMarker
  children: RenderHookPropsChildren
}

export interface NowIndicatorContentArg {
  isAxis: boolean
  date: Date
  view: ViewApi
}

export type NowIndicatorMountArg = MountArg<NowIndicatorContentArg>

export const NowIndicatorRoot = (props: NowIndicatorRootProps) => (
  <ViewContextType.Consumer>
    {(context: ViewContext) => {
      let { options } = context
      let hookProps: NowIndicatorContentArg = {
        isAxis: props.isAxis,
        date: context.dateEnv.toDate(props.date),
        view: context.viewApi,
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
